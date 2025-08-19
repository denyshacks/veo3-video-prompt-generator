import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple realism helpers
const INDOOR_LOCATIONS = new Set([
  'living room',
  'bedroom',
  'bathroom',
  'home office',
  'kitchen',
  'dining room',
  'hallway',
  'entryway',
  'laundry room',
  'walk-in closet'
]);

function contains(text = '', needle) {
  return (text || '').toLowerCase().includes(needle);
}

function sanitizeSegmentForPlausibility(segment) {
  try {
    const loc = (segment?.segment_info?.location || '').toLowerCase();
    const isIndoor = INDOOR_LOCATIONS.has(loc);
    if (!isIndoor) return segment;

    const props = segment?.scene_continuity?.props_in_frame || '';
    const env = segment?.scene_continuity?.environment || '';
    const actions = segment?.action_timeline?.synchronized_actions || '';
    const dialogue = segment?.action_timeline?.dialogue || '';

    let fixedProps = props;
    let fixedEnv = env;
    let fixedActions = actions;

    // Prevent impossible indoor objects
    if (contains(props, 'solar panel') || contains(env, 'solar panel') || contains(actions, 'solar panel')) {
      fixedProps = fixedProps.replace(/solar panels?/gi, 'solar panel monitoring display');
      fixedEnv = fixedEnv.replace(/solar panels?/gi, 'solar panel monitoring display');
      fixedActions = fixedActions.replace(/solar panels?/gi, 'monitoring display');
    }

    if (contains(props, 'generator') || contains(env, 'generator') || contains(actions, 'generator')) {
      // Keep generator out of indoor rooms; reference controls or mention only
      fixedProps = fixedProps.replace(/generator(s)?/gi, 'energy system status display');
      fixedEnv = fixedEnv.replace(/generator(s)?/gi, 'energy system status display');
      fixedActions = fixedActions.replace(/generator(s)?/gi, 'energy system status');
    }

    // Prevent mentioning snow physically inside
    if (contains(env, 'snow ') || contains(props, 'snow ')) {
      fixedEnv = fixedEnv.replace(/snow(\w*)/gi, 'natural winter light visible through windows');
      fixedProps = fixedProps.replace(/snow(\w*)/gi, 'winter scenery visible outside');
    }

    // Apply fixes back
    if (segment.scene_continuity) {
      segment.scene_continuity.props_in_frame = fixedProps;
      segment.scene_continuity.environment = fixedEnv;
    }
    if (segment.action_timeline) {
      segment.action_timeline.synchronized_actions = fixedActions;
      segment.action_timeline.dialogue = dialogue; // unchanged
    }
  } catch (_) {
    // Best-effort; ignore errors
  }
  return segment;
}

class OpenAIServicePlus {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.templateInstructions = null;
  }

  async loadTemplate(format = 'standard') {
    const filename = format === 'enhanced' 
      ? 'veo3-enhanced-continuity-plus.md' 
      : 'veo3-json-guidelines-plus.md';
    
    const templatePath = path.join(__dirname, '../../instructions/', filename);
    console.log(`[OpenAI Plus] Loading template: ${filename}`);
    
    return await fs.readFile(templatePath, 'utf8');
  }

  async generateSegments(params) {
    console.log('[OpenAI Plus] Starting generation with format:', params.jsonFormat || 'standard');
    console.log('[OpenAI Plus] Setting mode:', params.settingMode || 'single');
    const template = await this.loadTemplate(params.jsonFormat);
    
    const scriptSegments = await this.splitScript(params.script);
    console.log('[OpenAI Plus] Script split into', scriptSegments.length, 'segments');
    
    let locations = [];
    if (params.settingMode === 'ai-inspired') {
      locations = await this.inferLocationsFromScript({
        script: params.script,
        desiredCount: scriptSegments.length,
        product: params.product,
        style: params.style
      });
    } else if (params.settingMode === 'single') {
      locations = Array(scriptSegments.length).fill(params.room);
    } else {
      locations = params.locations || [];
      while (locations.length < scriptSegments.length) {
        locations.push(locations[locations.length - 1] || 'living room');
      }
    }
    
    console.log('[OpenAI Plus] Locations resolved:', locations);
    
    console.log('[OpenAI Plus] Generating base descriptions...');
    const baseDescriptions = await this.generateBaseDescriptions({ ...params, locations }, template);
    console.log('[OpenAI Plus] Base descriptions generated');
    
    const segments = [];
    console.log('[OpenAI Plus] Generating individual segments...');
    for (let i = 0; i < scriptSegments.length; i++) {
      console.log(`[OpenAI Plus] Generating segment ${i + 1}/${scriptSegments.length}`);
      const segment = await this.generateSegment({
        segmentNumber: i + 1,
        totalSegments: scriptSegments.length,
        scriptPart: scriptSegments[i],
        baseDescriptions,
        previousSegment: segments[i - 1] || null,
        template,
        currentLocation: locations[i],
        previousLocation: i > 0 ? locations[i - 1] : null,
        nextLocation: i < locations.length - 1 ? locations[i + 1] : null,
        ...params
      });
      segments.push(sanitizeSegmentForPlausibility(segment));
    }
    
    return {
      segments,
      metadata: {
        totalSegments: segments.length,
        estimatedDuration: segments.length * 8,
        characterId: this.generateCharacterId(params)
      }
    };
  }

  async splitScript(script) {
    const wordsPerSecond = 150 / 60;
    const minWordsFor6Seconds = 15;
    const targetWordsFor8Seconds = 20;
    const maxWordsFor8Seconds = 22;
    
    console.log('[OpenAI Plus] Script splitting parameters:', {
      minWords: minWordsFor6Seconds,
      targetWords: targetWordsFor8Seconds,
      maxWords: maxWordsFor8Seconds
    });
    
    const sentences = script.match(/[^.!?]+[.!?]+/g) || [script];
    
    const rawSegments = [];
    let currentSegment = '';
    let currentWordCount = 0;
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      const sentenceWords = sentence.split(/\s+/).length;
      
      if (currentSegment === '') {
        currentSegment = sentence;
        currentWordCount = sentenceWords;
        
        while (currentWordCount < minWordsFor6Seconds && i + 1 < sentences.length) {
          i++;
          const nextSentence = sentences[i].trim();
          const nextWords = nextSentence.split(/\s+/).length;
          
          if (currentWordCount + nextWords > maxWordsFor8Seconds) {
            if (currentWordCount < minWordsFor6Seconds) {
              currentSegment += ' ' + nextSentence;
              currentWordCount += nextWords;
            } else {
              i--;
              break;
            }
          } else {
            currentSegment += ' ' + nextSentence;
            currentWordCount += nextWords;
          }
        }
        
        rawSegments.push(currentSegment);
        currentSegment = '';
        currentWordCount = 0;
      }
    }
    
    const finalSegments = [];
    
    for (let i = 0; i < rawSegments.length; i++) {
      const segment = rawSegments[i];
      const wordCount = segment.split(/\s+/).length;
      const duration = wordCount / wordsPerSecond;
      
      console.log(`[OpenAI Plus] Raw segment ${i + 1}: ${wordCount} words, ~${duration.toFixed(1)}s speaking time`);
      
      if (wordCount < minWordsFor6Seconds && i < rawSegments.length - 1) {
        const nextSegment = rawSegments[i + 1];
        const nextWords = nextSegment.split(/\s+/).length;
        
        if (nextWords > minWordsFor6Seconds) {
          const nextSentences = nextSegment.match(/[^.!?]+[.!?]+/g) || [nextSegment];
          if (nextSentences.length > 1) {
            const borrowedSentence = nextSentences[0];
            const borrowedWords = borrowedSentence.split(/\s+/).length;
            
            if (wordCount + borrowedWords <= maxWordsFor8Seconds) {
              finalSegments.push(segment + ' ' + borrowedSentence);
              rawSegments[i + 1] = nextSentences.slice(1).join(' ');
              continue;
            }
          }
        }
        
        if (i < rawSegments.length - 1) {
          const merged = segment + ' ' + rawSegments[i + 1];
          const mergedWords = merged.split(/\s+/).length;
          
          if (mergedWords <= 30) {
            finalSegments.push(merged);
            i++;
            continue;
          }
        }
      }
      
      finalSegments.push(segment);
    }
    
    console.log('[OpenAI Plus] Final segment distribution:');
    finalSegments.forEach((segment, i) => {
      const wordCount = segment.split(/\s+/).length;
      const duration = wordCount / wordsPerSecond;
      console.log(`  Segment ${i + 1}: ${wordCount} words, ~${duration.toFixed(1)}s speaking time`);
      if (duration < 6) {
        console.warn(`  ⚠️  Segment ${i + 1} is under 6 seconds!`);
      }
    });
    
    return finalSegments;
  }

  async inferLocationsFromScript({ script, desiredCount, product, style }) {
    console.log('[OpenAI Plus] Inferring locations from script');
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You analyze UGC scripts and propose realistic filming locations per segment. Do NOT include subtitles, on-screen text, captions, SFX/sound effects, background music, or soundtrack cues. Return only JSON.'
          },
          {
            role: 'user',
            content: `Script:\n${script}\n\nProduct: ${product || 'N/A'}\nStyle: ${style || 'casual'}\nSegments Needed: ${desiredCount}\n\nReturn a JSON object with a single key \'locations\' that is an array of ${desiredCount} plain strings. Choose varied, practical locations that fit the script content (e.g., living room, kitchen, office, street, store aisle, doctor's office, gym, car interior, park bench). No repeats unless clearly justified by the script. No studio terms, no virtual sets, no VFX.`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: 500
      });
      const parsed = JSON.parse(response.choices[0].message.content);
      let locations = Array.isArray(parsed.locations) ? parsed.locations : [];
      locations = locations.map(l => String(l).toLowerCase());
      while (locations.length < desiredCount) locations.push(locations[locations.length - 1] || 'living room');
      if (locations.length > desiredCount) locations = locations.slice(0, desiredCount);
      return locations;
    } catch (error) {
      console.error('[OpenAI Plus] Location inference failed, falling back to living room:', error);
      return Array(desiredCount).fill('living room');
    }
  }

  async inferCameraFromScript({ script, desiredCount, product, style }) {
    console.log('[OpenAI Plus] Inferring camera directions from script');
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a creative TV ad director. Propose cinematic yet practical camera styles per segment (e.g., static handheld, slow push-in, subtle orbit, dynamic handheld, POV selfie). Do NOT include subtitles, on-screen text, captions, SFX/sound effects, or music. Return only JSON.'
          },
          {
            role: 'user',
            content: `Script:\n${script}\n\nProduct: ${product || 'N/A'}\nStyle: ${style || 'casual'}\nSegments Needed: ${desiredCount}\n\nReturn a JSON object with a single key \'camera\' that is an array of ${desiredCount} plain strings chosen from: ["static-handheld","slow-push","orbit","dynamic","pov-selfie"]. Choose creative, varied styles aligned to content.`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 400
      });
      const parsed = JSON.parse(response.choices[0].message.content);
      let camera = Array.isArray(parsed.camera) ? parsed.camera : [];
      camera = camera.map(c => String(c));
      while (camera.length < desiredCount) camera.push(camera[camera.length - 1] || 'static-handheld');
      if (camera.length > desiredCount) camera = camera.slice(0, desiredCount);
      return camera;
    } catch (error) {
      console.error('[OpenAI Plus] Camera inference failed, falling back to static-handheld:', error);
      return Array(desiredCount).fill('static-handheld');
    }
  }

  async generateBaseDescriptions(params, template) {
    console.log('[OpenAI Plus] Calling API for base descriptions');
    try {
      const isEnhanced = params.jsonFormat === 'enhanced';
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `${template}\n\nGenerate the base descriptions that will remain IDENTICAL across all segments. Follow the exact word count requirements. Return ONLY valid JSON. Absolutely forbid: subtitles, on-screen text, captions, SFX/sound effects, background music, soundtrack cues.`
          },
          {
            role: "user",
            content: `Create base descriptions for:
Age: ${params.ageRange}
Gender: ${params.gender}
Ethnicity/Appearance: ${params.ethnicity || 'unspecified'}
Specific Features: ${params.characterFeatures || 'unspecified'}
Clothing Details: ${params.clothingDetails || 'unspecified'}
Accent/Region: ${params.accentRegion || 'neutral-american'}
Setting Mode: ${params.settingMode || 'single'}
${params.settingMode === 'single' ? `Room: ${params.room}` : `Locations: ${params.locations?.join(', ') || 'various'}`}
Style: ${params.style}
Product: ${params.product}
Camera Style: ${params.cameraStyle || 'static-handheld'}
Time of Day: ${params.timeOfDay || 'morning'}
Background Life: ${params.backgroundLife ? 'Yes' : 'No'}
Product Display: ${params.productStyle || 'natural'}
Energy Arc: ${params.energyArc || 'consistent'}
Narrative Style: ${params.narrativeStyle || 'direct-review'}

Return a JSON object with these exact keys:
{
  "physical": "[250+ words description - This is the canonical character appearance used WORD-FOR-WORD in all segments. Must define immutable identifiers (facial features, proportions, hair, skin tone, eye color) to prevent drift.]",
  "clothing": "[150+ words description - Canonical outfit, used WORD-FOR-WORD in all segments]",
  "environment": "[${isEnhanced ? '250+' : '150+'} words - For mixed locations, describe the general style/aesthetic connecting all locations]",
  "voice": "[${isEnhanced ? '100+' : '50+'} words description]",
  "productHandling": "[50+ words - How character naturally handles/displays the product based on ${params.productStyle} style]"
}

Hard rules: Do NOT reference subtitles, captions, SFX, or music in any field.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 5000
      });
      
      console.log('[OpenAI Plus] API response received');
      const parsed = JSON.parse(response.choices[0].message.content);
      console.log('[OpenAI Plus] Base descriptions parsed successfully');
      return parsed;
    } catch (error) {
      console.error('[OpenAI Plus] Error in generateBaseDescriptions:', error);
      throw error;
    }
  }

  async generateSegment(params) {
    try {
      const isEnhanced = params.jsonFormat === 'enhanced';

      // Resolve camera per segment when cameraStyle == ai-inspired
      let cameraStyle = params.cameraStyle;
      if (cameraStyle === 'ai-inspired') {
        if (!params._inferredCamera) {
          params._inferredCamera = await this.inferCameraFromScript({
            script: params.script,
            desiredCount: params.totalSegments,
            product: params.product,
            style: params.style
          });
        }
        cameraStyle = params._inferredCamera[params.segmentNumber - 1] || 'static-handheld';
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `${params.template}\n\nGenerate a Veo 3 JSON segment following the exact structure. Use the provided base descriptions WORD-FOR-WORD. Do not include or imply subtitles, on-screen text, captions, SFX/sound effects, background music, or soundtrack cues.`
          },
          {
            role: "user",
            content: `Create segment ${params.segmentNumber} of ${params.totalSegments}:

Dialogue for this segment: "${params.scriptPart}"
Product: ${params.product}
Current Location: ${params.currentLocation}
${params.previousLocation && params.previousLocation !== params.currentLocation ? `Character just moved from: ${params.previousLocation}` : ''}
${params.nextLocation && params.nextLocation !== params.currentLocation ? `Character will move to: ${params.nextLocation}` : ''}

Visual Settings:
- Camera Style: ${cameraStyle}
- Time of Day: ${params.timeOfDay || 'morning'}
- Background Life: ${params.backgroundLife ? 'Include subtle background activity' : 'Focus only on character'}
- Energy Level: ${this.getEnergyLevel(params.energyArc, params.segmentNumber, params.totalSegments)}

Environment Realism Guardrails:
- If location is INDOOR (living room, bedroom, bathroom, home office, kitchen, dining room, hallway, entryway, laundry room, walk-in closet): do NOT place outdoor-only equipment (solar panels, roof arrays, diesel generators) inside; instead reference "monitoring display", "wall controls" or "status panel".
- Snow, rain, wind: only visible through windows indoors; not physically present in room.
- Large fuel-powered generators and rooftop assets must be OUTDOORS only.
- Prefer props that plausibly belong to the selected location.

Base Descriptions (USE EXACTLY AS PROVIDED and DO NOT ALTER):
Physical (250+ words): ${params.baseDescriptions.physical}
Clothing (150+ words): ${params.baseDescriptions.clothing}
General Style: ${params.baseDescriptions.environment}
Base Voice: ${params.baseDescriptions.voice}
Product Handling: ${params.baseDescriptions.productHandling || 'Natural handling'}

Character Guidance (MUST NOT CONTRADICT BASE):
- Ethnicity/Appearance: ${params.ethnicity || 'unspecified'}
- Specific Features: ${params.characterFeatures || 'unspecified'}
- Clothing Details: ${params.clothingDetails || 'unspecified'}
- Accent/Region: ${params.accentRegion || 'neutral-american'}

${params.previousSegment ? `Previous segment ended with:\nPosition: ${params.previousSegment.action_timeline.transition_prep}` : 'This is the opening segment.'}

CRITICAL MOVEMENT RULE:
- The character MUST NOT walk away or exit the frame at the end of the segment. Keep the character within frame; use a stationary or minimal-movement hold (e.g., maintains eye contact, subtle nod, gentle breath). Set transition_prep to reflect staying in place.

Generate the complete JSON with:
1. segment_info (${isEnhanced ? 'with continuity_markers' : 'with overlap instructions'})
2. character_description (using base descriptions verbatim + current state; NEVER change base appearance)
3. scene_continuity (adapt base environment to current location: ${params.currentLocation})
4. action_timeline (${isEnhanced ? 'with synchronized_actions, micro_expressions, breathing_rhythm' : 'synchronized with dialogue'})
5. Include natural movement/transition if location changes

Hard rule: No subtitles/on-screen text/captions/SFX/music in any field.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 5000
      });
      
      const parsed = JSON.parse(response.choices[0].message.content);
      return parsed;
    } catch (error) {
      console.error('[OpenAI Plus] Error in generateSegment:', error);
      throw error;
    }
  }

  generateCharacterId(params) {
    return `${params.gender}_${params.ageRange}_${Date.now()}_plus`.replace(/\s+/g, '_');
  }

  getEnergyLevel(energyArc, segmentNumber, totalSegments) {
    const progress = segmentNumber / totalSegments;
    
    switch (energyArc) {
      case 'building':
        return `${Math.round(60 + (35 * progress))}% - Building from calm to excited`;
      case 'problem-solution':
        if (progress < 0.3) return '70% - Concerned, explaining problem';
        if (progress < 0.7) return '60% - Working through solution';
        return '90% - Excited about results';
      case 'discovery':
        if (progress < 0.5) return '75% - Curious and exploring';
        return '85% - Convinced and enthusiastic';
      case 'consistent':
      default:
        return '80% - Steady, engaging energy throughout';
    }
  }
}

export default new OpenAIServicePlus(); 