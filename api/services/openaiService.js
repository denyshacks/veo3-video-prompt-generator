import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.templateInstructions = null;
  }

  async loadTemplate(format = 'standard') {
    const filename = format === 'enhanced' 
      ? 'veo3-enhanced-continuity.md' 
      : 'veo3-json-guidelines.md';
    
    const templatePath = path.join(__dirname, '../../instructions/', filename);
    console.log(`[OpenAI] Loading template: ${filename}`);
    
    return await fs.readFile(templatePath, 'utf8');
  }

  async generateSegments(params) {
    console.log('[OpenAI] Starting generation with format:', params.jsonFormat || 'standard');
    console.log('[OpenAI] Setting mode:', params.settingMode || 'single');
    const template = await this.loadTemplate(params.jsonFormat);
    
    // Step 1: Analyze and split script
    const scriptSegments = await this.splitScript(params.script);
    console.log('[OpenAI] Script split into', scriptSegments.length, 'segments');
    
    // Prepare location data for mixed settings
    let locations = [];
    if (params.settingMode === 'single') {
      locations = Array(scriptSegments.length).fill(params.room);
    } else {
      locations = params.locations || [];
      while (locations.length < scriptSegments.length) {
        locations.push(locations[locations.length - 1] || 'living room');
      }
    }
    
    // Step 2: Generate base descriptions (used across all segments)
    console.log('[OpenAI] Generating base descriptions...');
    const baseDescriptions = await this.generateBaseDescriptions(params, template);
    console.log('[OpenAI] Base descriptions generated');
    
    // Step 3: Generate each segment
    const segments = [];
    console.log('[OpenAI] Generating individual segments...');
    for (let i = 0; i < scriptSegments.length; i++) {
      console.log(`[OpenAI] Generating segment ${i + 1}/${scriptSegments.length}`);
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
      segments.push(segment);
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
    const wordsPerSecond = 150 / 60; // 2.5 words per second (150 wpm)
    const minWordsFor6Seconds = 15; // 15 words minimum for 6 seconds
    const targetWordsFor8Seconds = 20; // 20 words target for 8 seconds
    const maxWordsFor8Seconds = 22; // 22 words max to leave room for pauses
    
    console.log('[OpenAI] Script splitting parameters:', {
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
      
      console.log(`[OpenAI] Raw segment ${i + 1}: ${wordCount} words, ~${duration.toFixed(1)}s speaking time`);
      
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
          
          if (mergedWords <= 30) { // Reasonable upper limit
            finalSegments.push(merged);
            i++; // Skip next segment
            continue;
          }
        }
      }
      
      finalSegments.push(segment);
    }
    
    console.log('[OpenAI] Final segment distribution:');
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

  async generateBaseDescriptions(params, template) {
    console.log('[OpenAI] Calling API for base descriptions');
    try {
      const isEnhanced = params.jsonFormat === 'enhanced';
      const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `${template}\n\nGenerate the base descriptions that will remain IDENTICAL across all segments. Follow the exact word count requirements. Return ONLY valid JSON.`
        },
        {
          role: "user",
          content: `Create base descriptions for:
${params.avatarMode === 'animal' ? `Avatar: ANIMAL\nSpecies: ${params.animal?.species}\nAnthropomorphic: ${params.animal?.anthropomorphic ? 'Yes' : 'No'}\nVoice Style: ${params.animal?.voiceStyle || 'narrator'}` : `Age: ${params.ageRange}\nGender: ${params.gender}`}
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
${params.avatarMode === 'animal' ? `{
  "animal_physical": "[180+ words - Hyperreal morphology, photoreal fur/skin/feather scaling, whiskers/fin details, eye coloration, unique markings]",
  "animal_behavior": "[150+ words - Natural movement quality, gait, idle behaviors, breathing and chest/shoulder mechanics, credible head/eye coordination]",
  "animal_voice": "[120+ words - Narrated or stylized delivery consistent with ${params.animal?.voiceStyle || 'narrator'}; map voice timbre to species realism; avoid cartoonish speech unless anthropomorphic=true]",
  "lip_sync_baseline": "[100+ words - Baseline lip/jaw/muzzle/mandible movement patterns for clear viseme articulation (M/B/P closed mouth compression, O-rounding, EE spread, AA wide). Include tongue/teeth visibility rules if applicable to species]",
  "realism_rendering": "[120+ words - Cinematic photorealism: physically plausible lighting, micro-specular highlights in eyes, tearline sheen, subsurface scattering, fur clumping and flyaways, soft motion blur, depth of field]",
  "environment": "[${isEnhanced ? '250+' : '150+'} words - Location style and fixed elements consistent across segments]",
  "productHandling": "[50+ words - How the animal avatar references or indicates product (gaze, paw/fin/gesture, narrator mention) without breaking realism]"
}` : `{
  "physical": "[${isEnhanced ? '200+' : '100+'} words description]",
  "clothing": "[${isEnhanced ? '150+' : '100+'} words description]",
  "environment": "[${isEnhanced ? '250+' : '150+'} words - For mixed locations, describe the general home style/aesthetic that connects all spaces]",
  "voice": "[${isEnhanced ? '100+' : '50+'} words description]",
  "productHandling": "[50+ words - How character naturally handles/displays the product based on ${params.productStyle} style]"
}`}

These descriptions must be detailed enough to use word-for-word across all segments. For mixed locations, focus on elements that remain consistent throughout the home.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4500
      });
      
      console.log('[OpenAI] API response received');
      const parsed = JSON.parse(response.choices[0].message.content);
      console.log('[OpenAI] Base descriptions parsed successfully');
      return parsed;
    } catch (error) {
      console.error('[OpenAI] Error in generateBaseDescriptions:', error);
      throw error;
    }
  }

  async generateSegment(params) {
    try {
      const isEnhanced = params.jsonFormat === 'enhanced';
      const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `${params.template}\n\nGenerate a Veo 3 JSON segment following the exact structure. Use the provided base descriptions WORD-FOR-WORD.`
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
- Camera Style: ${params.cameraStyle || 'static-handheld'}
- Time of Day: ${params.timeOfDay || 'morning'}
- Background Life: ${params.backgroundLife ? 'Include subtle background activity' : 'Focus only on character'}
- Energy Level: ${this.getEnergyLevel(params.energyArc, params.segmentNumber, params.totalSegments)}
${params.avatarMode === 'animal' ? `- Realism: Photorealistic look with cinematic lighting, eye speculars, subtle motion blur, micro-fur dynamics.` : ''}

Base Descriptions (USE EXACTLY AS PROVIDED):
${params.avatarMode === 'animal' ? `Animal Physical: ${params.baseDescriptions.animal_physical}
Animal Behavior: ${params.baseDescriptions.animal_behavior}
Animal Voice: ${params.baseDescriptions.animal_voice}
Lip-Sync Baseline: ${params.baseDescriptions.lip_sync_baseline}` : `Physical: ${params.baseDescriptions.physical}
Clothing: ${params.baseDescriptions.clothing}
Base Voice: ${params.baseDescriptions.voice}`}
General Environment: ${params.baseDescriptions.environment}
Product Handling: ${params.baseDescriptions.productHandling || 'Natural handling'}

${params.previousSegment ? `Previous segment ended with:\nPosition: ${params.previousSegment.action_timeline.transition_prep}` : 'This is the opening segment.'}

${params.avatarMode === 'animal' ? `Lip-Sync and Facial Acting Requirements:\n- Map mouth/jaw/muzzle shapes to visemes matching the line delivery.\n- Include a "lip_sync" section in action_timeline with a viseme_timeline covering 0:00-0:08 at ~0.5s granularity (e.g., {"0:00-0:01": "M/B/P closed", "0:01-0:02": "AA wide", ...}).\n- Include "eye_dynamics" with natural blink cadence (every 3-5s with occasional double-blink), micro saccades, and gaze shifts tied to emphasis.\n- Include "facial_acting" describing micro-expressions synchronized to meanings, jaw rotation degrees (approx), and tongue/teeth visibility rules where species-accurate.\n- Avoid cartoonish exaggeration; keep physically plausible for a real ${params.animal?.species || 'animal'}.` : ''}

Generate the complete JSON with:
1. segment_info (${isEnhanced ? 'with continuity_markers' : 'with overlap instructions'})
2. character_description (${params.avatarMode === 'animal' ? 'using animal base descriptions + current state' : 'using base descriptions + current state'})
3. scene_continuity (adapt base environment to current location: ${params.currentLocation})
4. action_timeline (${isEnhanced ? 'with synchronized_actions, micro_expressions, breathing_rhythm' : 'synchronized with dialogue'})
${params.avatarMode === 'animal' ? '5. action_timeline must include lip_sync, and character_description should include facial_acting details.' : '5. Include natural movement/transition if location changes'}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 4500
      });
      
      const parsed = JSON.parse(response.choices[0].message.content);
      return parsed;
    } catch (error) {
      console.error('[OpenAI] Error in generateSegment:', error);
      throw error;
    }
  }

  generateCharacterId(params) {
    return `${(params.avatarMode==='animal'?params.animal?.species:'human')}_${params.gender || 'N/A'}_${params.ageRange || 'N/A'}_${Date.now()}`.replace(/\s+/g, '_');
  }

  async generateSegmentsWithVoiceProfile(params) {
    console.log('[OpenAI] Generating ALL segments with voice profile focus');
    
    // Step 1: Generate first segment with full detail
    const firstSegmentParams = { ...params, jsonFormat: 'enhanced' };
    const template = await this.loadTemplate('enhanced');
    
    // Split script into segments
    const scriptSegments = await this.splitScript(params.script);
    console.log('[OpenAI] Script split into', scriptSegments.length, 'segments');
    
    // Prepare location data (same as standard mode)
    let locations = [];
    if (params.settingMode === 'single') {
      locations = Array(scriptSegments.length).fill(params.room);
    } else {
      locations = params.locations || [];
      while (locations.length < scriptSegments.length) {
        locations.push(locations[locations.length - 1] || 'living room');
      }
    }
    
    // Generate base descriptions (for first segment)
    console.log('[OpenAI] Generating base descriptions...');
    const baseDescriptions = await this.generateBaseDescriptions(firstSegmentParams, template);
    
    // Generate first segment with full detail
    console.log('[OpenAI] Generating first segment with full detail...');
    const firstSegment = await this.generateSegment({
      segmentNumber: 1,
      totalSegments: scriptSegments.length,
      scriptPart: scriptSegments[0],
      baseDescriptions,
      previousSegment: null,
      template,
      currentLocation: locations[0],
      previousLocation: null,
      nextLocation: locations.length > 1 ? locations[1] : null,
      ...firstSegmentParams
    });
    
    // Extract voice profile from first segment
    const voiceProfile = await this.extractDetailedVoiceProfile(firstSegment, params);
    
    // Generate remaining segments with voice/behavior focus
    const segments = [firstSegment];
    console.log('[OpenAI] Generating remaining segments with voice/behavior focus...');
    
    for (let i = 1; i < scriptSegments.length; i++) {
      console.log(`[OpenAI] Generating segment ${i + 1}/${scriptSegments.length}`);
      const segment = await this.generateContinuationStyleSegment({
        segmentNumber: i + 1,
        totalSegments: scriptSegments.length,
        scriptPart: scriptSegments[i],
        baseDescriptions,
        previousSegment: segments[i - 1],
        voiceProfile,
        currentLocation: locations[i],
        previousLocation: i > 0 ? locations[i - 1] : null,
        nextLocation: i < locations.length - 1 ? locations[i + 1] : null,
        ...params
      });
      segments.push(segment);
    }
    
    return {
      segments,
      metadata: {
        totalSegments: segments.length,
        estimatedDuration: segments.length * 8,
        characterId: this.generateCharacterId(params)
      },
      voiceProfile
    };
  }

  async extractDetailedVoiceProfile(segment, params) {
    console.log('[OpenAI] Extracting detailed voice profile');
    
    const voiceProfile = {
      baseVoice: segment.character_description?.voice_matching || '',
      technical: {
        pitch: '165-185 Hz',
        rate: '145-150 wpm',
        tone: 'warm alto with bright overtones',
        breathPattern: 'natural pauses between phrases',
        emphasis: 'slight volume increase on key words'
      },
      personality: {
        voiceType: params.voiceType || 'warm-friendly',
        energyLevel: params.energyLevel || '80',
        naturalQualities: []
      },
      continuityMarkers: {
        sentenceEndings: 'slight downward inflection',
        excitement: 'pitch rises 10-15 Hz',
        productMention: 'slower pace, clearer articulation'
      }
    };

    // Generate more detailed voice characteristics using GPT
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Generate detailed voice continuity profile for video consistency. Be extremely specific about vocal qualities. Allow animal narrator styles when avatarMode=animal."
          },
          {
            role: "user",
            content: `Create detailed voice profile for:
${params.avatarMode === 'animal' ? `Animal Species: ${params.animal?.species}\nVoice Style: ${params.animal?.voiceStyle || 'narrator'}\nAnthropomorphic: ${params.animal?.anthropomorphic ? 'Yes' : 'No'}` : `Age: ${params.ageRange}\nGender: ${params.gender}\nVoice Type: ${params.voiceType}`}
Energy Level: ${params.energyLevel}%
Script Sample: "${segment.action_timeline?.dialogue || params.script}"

Return a JSON object with:
{
  "pitchRange": "[specific Hz range or descriptive timbre if animal]",
  "speakingRate": "[specific wpm or pacing style]",
  "toneQualities": "[detailed description]",
  "breathingPattern": "[natural breath points]",
  "emotionalInflections": {
    "excitement": "[how voice changes]",
    "emphasis": "[how key points are stressed]",
    "warmth": "[how friendliness manifests]"
  },
  "uniqueMarkers": ["list of specific characteristics"],
  "regionalAccent": "[if applicable]",
  "vocalTexture": "[smooth, raspy, clear, etc]"
}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1000
      });

      const enhancedProfile = JSON.parse(response.choices[0].message.content);
      voiceProfile.technical = { ...voiceProfile.technical, ...enhancedProfile };
      voiceProfile.personality.naturalQualities = enhancedProfile.uniqueMarkers || [];
      
    } catch (error) {
      console.error('[OpenAI] Error enhancing voice profile:', error);
    }

    return voiceProfile;
  }

  async generateContinuationSegment(params) {
    console.log('[OpenAI] Generating continuation segment');
    const templatePath = path.join(__dirname, '../../instructions/veo3-continuation-minimal.md');
    const template = await fs.readFile(templatePath, 'utf8');
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `${template}\n\nGenerate a continuation segment with MINIMAL description but DETAILED voice and behavior specs. Allow animal avatar narration when avatarMode=animal.`
          },
          {
            role: "user",
            content: `Create a continuation segment:

Image Context: Character from screenshot at ${params.imageUrl}
Previous Dialogue: "${params.previousSegment?.action_timeline?.dialogue || 'N/A'}"
New Dialogue: "${params.script}"
Product: ${params.product}

${params.avatarMode === 'animal' ? `Avatar: ANIMAL\nSpecies: ${params.animal?.species}\nVoice Style: ${params.animal?.voiceStyle || 'narrator'}\nAnthropomorphic: ${params.animal?.anthropomorphic ? 'Yes' : 'No'}` : ''}

Voice Profile to Match EXACTLY:
${JSON.stringify(params.voiceProfile, null, 2)}

Generate the JSON following the continuation minimal structure.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 3000
      });
      
      const segment = JSON.parse(response.choices[0].message.content);
      
      if (segment.character_description) {
        segment.character_description.voice_matching = params.voiceProfile.baseVoice;
        segment.character_description.voice_technical = params.voiceProfile.technical;
      }
      
      if (segment.action_timeline && !segment.action_timeline.voice_continuity) {
        segment.action_timeline.voice_continuity = {
          technical_specs: params.voiceProfile.technical,
          emotional_tone: "Maintaining consistent warmth and enthusiasm",
          pacing_rhythm: params.voiceProfile.technical.breathPattern || "Natural pauses between phrases",
          emphasis_patterns: params.voiceProfile.continuityMarkers?.emphasis || "Slight volume increase on key words"
        };
      }
      
      return segment;
      
    } catch (error) {
      console.error('[OpenAI] Error in generateContinuationSegment:', error);
      throw error;
    }
  }

  async generateContinuationStyleSegment(params) {
    console.log('[OpenAI] Generating continuation-style segment');
    const template = await this.loadTemplate(params.jsonFormat || 'standard');
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `${template}\n\nGenerate a segment that maintains the EXACT same structure as standard segments, but with ENHANCED voice and behavior sections. Support animal avatar narration when avatarMode=animal.`
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
- Camera Style: ${params.cameraStyle || 'static-handheld'}
- Time of Day: ${params.timeOfDay || 'morning'}
- Background Life: ${params.backgroundLife ? 'Include subtle background activity' : 'Focus only on character'}
- Energy Level: ${this.getEnergyLevel(params.energyArc, params.segmentNumber, params.totalSegments)}

Base Descriptions (USE EXACTLY AS PROVIDED):
${params.avatarMode === 'animal' ? `Animal Physical: ${params.baseDescriptions.animal_physical}
Animal Behavior: ${params.baseDescriptions.animal_behavior}
Animal Voice: ${params.baseDescriptions.animal_voice}` : `Physical: ${params.baseDescriptions.physical}
Clothing: ${params.baseDescriptions.clothing}
Base Voice: ${params.baseDescriptions.voice}`}
General Environment: ${params.baseDescriptions.environment}
Product Handling: ${params.baseDescriptions.productHandling || 'Natural handling'}

Voice Profile to Maintain:
${JSON.stringify(params.voiceProfile, null, 2)}

${params.previousSegment ? `Previous segment ended with:
Position: ${params.previousSegment.action_timeline?.transition_prep || params.previousSegment.segment_info?.continuity_markers?.end_position}` : ''}

CRITICAL REQUIREMENTS:
1. Generate the complete JSON with standard structure
2. character_description.voice_matching must be MINIMUM 100 words focusing on maintaining exact voice consistency (adapt for animal narrator)
3. Include a new "behavioral_consistency" field in character_description with MINIMUM 100 words on gesture patterns and movement style (or animal movement cues)
4. All other fields follow standard format
5. Maintain continuity from previous segment`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 4000
      });
      
      const segment = JSON.parse(response.choices[0].message.content);
      
      if (segment.character_description) {
        if (!segment.character_description.voice_matching || segment.character_description.voice_matching.length < 100) {
          segment.character_description.voice_matching = `${params.voiceProfile.baseVoice} Maintaining exact technical specifications: ${JSON.stringify(params.voiceProfile.technical)}.`;
        }
        if (!segment.character_description.behavioral_consistency) {
          segment.character_description.behavioral_consistency = `Movement and gesture patterns remain consistent with established style.`;
        }
      }
      
      return segment;
      
    } catch (error) {
      console.error('[OpenAI] Error in generateContinuationStyleSegment:', error);
      throw error;
    }
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

export default new OpenAIService();