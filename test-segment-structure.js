import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testSegmentStructure() {
  console.log('Testing segment structure...\n');

  // Simulate what the OpenAI service might return
  const testSegment = {
    segment_info: {
      segment_number: 1,
      total_segments: 3,
      duration: "8 seconds"
    },
    character_description: {
      current_state: "A friendly woman in her 30s, wearing casual clothes"
    },
    action_timeline: {
      dialogue: "Hey everyone! Today I want to share something amazing with you.",
      synchronized_actions: "Smiling and making welcoming hand gestures"
    },
    scene_continuity: {
      camera_position: "Medium shot, slightly above eye level",
      props_in_frame: "Living room background with plants"
    }
  };

  // Test the prompt generation
  const { createPromptFromSegment } = await import('./api/services/kieAiService.js');
  
  // Since it's a class method, we need to create a mock instance
  const mockService = {
    createPromptFromSegment: function(segment) {
      console.log('[Test] Segment structure:', Object.keys(segment));
      
      const segmentInfo = segment.segment_info || {};
      const characterDesc = segment.character_description || {};
      const actionTimeline = segment.action_timeline || {};
      const sceneContinuity = segment.scene_continuity || {};
      
      const dialogue = actionTimeline.dialogue || '';
      const characterState = characterDesc.current_state || 'A person speaking to camera';
      const actions = actionTimeline.synchronized_actions || 'natural gestures';
      
      const prompt = `${characterState}, saying "${dialogue}" with ${actions}. 8 second video.`;
      
      console.log('[Test] Generated prompt:', prompt);
      console.log('[Test] Prompt length:', prompt.length);
      
      return prompt;
    }
  };
  
  const prompt = mockService.createPromptFromSegment(testSegment);
  
  // Now test with the API
  const client = axios.create({
    baseURL: 'https://api.kie.ai',
    headers: {
      'Authorization': `Bearer ${process.env.KIEAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  try {
    console.log('\nSending to Kie.ai API...');
    const response = await client.post('/api/v1/veo/generate', {
      prompt: prompt,
      model: 'veo3',
      aspectRatio: '16:9'
    });
    
    console.log('\nResponse:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('\nError:', error.response?.data || error.message);
  }
}

testSegmentStructure();