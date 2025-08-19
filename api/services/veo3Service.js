import { GoogleGenerativeAI } from '@google/generative-ai';
import { VertexAI } from '@google-cloud/vertexai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Veo3Service {
  constructor() {
    this.genAI = null;
    this.vertexAI = null;
    this.useVertexAI = false;
    this.initializeClient();
  }

  initializeClient() {
    // Check for Vertex AI configuration first
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS || 
        (process.env.VERTEX_PROJECT_ID && process.env.VERTEX_LOCATION)) {
      try {
        const projectId = process.env.VERTEX_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
        const location = process.env.VERTEX_LOCATION || 'us-central1';
        
        this.vertexAI = new VertexAI({
          project: projectId,
          location: location,
        });
        
        this.useVertexAI = true;
        console.log('[Veo3] Vertex AI client initialized');
        console.log(`[Veo3] Project: ${projectId}, Location: ${location}`);
      } catch (error) {
        console.error('[Veo3] Failed to initialize Vertex AI:', error);
      }
    }
    
    // Fall back to Gemini API if no Vertex AI
    if (!this.useVertexAI) {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      if (apiKey && apiKey.trim() !== '') {
        this.genAI = new GoogleGenerativeAI(apiKey);
        console.log('[Veo3] Gemini API client initialized');
      } else {
        console.warn('[Veo3] No API credentials found');
      }
    }
  }

  async generateVideoFromSegment(segment, options = {}) {
    // Try to initialize again if not already done
    if (!this.genAI && !this.vertexAI) {
      this.initializeClient();
    }
    
    if (!this.genAI && !this.vertexAI) {
      throw new Error('Veo 3 service not initialized. Please configure either Vertex AI or Gemini API credentials');
    }

    console.log('[Veo3] Generating video for segment', segment.segment_info?.segment_number);

    try {
      // Create a detailed prompt from the segment data
      const prompt = this.createVideoPrompt(segment, options);
      
      // Use appropriate model based on authentication method
      let model;
      if (this.useVertexAI) {
        model = this.vertexAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash-002' 
        });
      } else {
        model = this.genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash' 
        });
      }
      
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: `Generate a detailed video shot list for this UGC segment:\n\n${prompt}\n\nProvide frame-by-frame descriptions for an 8-second video.`
          }]
        }]
      });

      const response = await result.response;
      const videoDescription = response.text();

      return {
        success: true,
        segmentNumber: segment.segment_info?.segment_number,
        videoDescription,
        prompt,
        duration: '8 seconds',
        status: 'description_generated',
        message: 'Video description generated. Full Veo 3 integration coming soon!'
      };

    } catch (error) {
      console.error('[Veo3] Error generating video:', error);
      throw error;
    }
  }

  createVideoPrompt(segment, options) {
    const isEnhanced = segment.segment_info?.continuity_markers ? true : false;
    
    let prompt = '';

    if (isEnhanced) {
      // Enhanced format with continuity markers
      prompt = `
UGC Video Segment ${segment.segment_info.segment_number} of ${segment.segment_info.total_segments}
Duration: ${segment.segment_info.duration}

CONTINUITY REQUIREMENTS:
- Start: ${segment.segment_info.continuity_markers.start_position}
- End: ${segment.segment_info.continuity_markers.end_position}
- Start Expression: ${segment.segment_info.continuity_markers.start_expression}
- End Expression: ${segment.segment_info.continuity_markers.end_expression}

CHARACTER:
${segment.character_description.current_state}

DIALOGUE: "${segment.action_timeline.dialogue}"

SYNCHRONIZED ACTIONS:
${Object.entries(segment.action_timeline.synchronized_actions || {})
  .map(([time, action]) => `${time}: ${action}`)
  .join('\n')}

SCENE:
- Camera: ${segment.scene_continuity.camera_position}
- Environment: ${segment.scene_continuity.props_in_frame}

MICRO-EXPRESSIONS:
${segment.action_timeline.micro_expressions || 'Natural facial movements'}

Style: Authentic UGC content, handheld camera feel, natural lighting`;
    } else {
      // Standard format
      prompt = `
UGC Video Segment ${segment.segment_info?.segment_number || 1}

CHARACTER STATE:
${segment.character_description?.current_state || 'Natural, relaxed presenter'}

DIALOGUE: "${segment.action_timeline?.dialogue || ''}"

ACTIONS:
${segment.action_timeline?.synchronized_actions || 'Natural gestures while speaking'}

CAMERA:
${segment.scene_continuity?.camera_position || 'Medium shot, eye level'}

Style: Authentic UGC content, casual and relatable`;
    }

    return prompt.trim();
  }

  async generateVideosForAllSegments(segments, options = {}) {
    console.log(`[Veo3] Generating videos for ${segments.length} segments`);
    
    const videoPromises = segments.map((segment, index) => 
      this.generateVideoFromSegment(segment, {
        ...options,
        segmentIndex: index
      })
    );

    try {
      const results = await Promise.all(videoPromises);
      return {
        success: true,
        videos: results,
        totalSegments: segments.length
      };
    } catch (error) {
      console.error('[Veo3] Error generating videos:', error);
      throw error;
    }
  }

  // Future method for actual Veo 3 API integration
  async generateActualVideo(prompt, options = {}) {
    // This will be implemented when we have proper Veo 3 API access
    // For now, it returns a placeholder
    return {
      status: 'pending_implementation',
      message: 'Direct Veo 3 video generation will be available with proper API credentials',
      estimatedCost: '$0.75 per second',
      prompt
    };
  }
}

export default new Veo3Service();