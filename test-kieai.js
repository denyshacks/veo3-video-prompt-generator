import dotenv from 'dotenv';
import KieAiService from './api/services/kieAiService.js';

// Load environment variables
dotenv.config();

async function testKieAi() {
  console.log('Testing Kie.ai Integration...\n');

  // Check if API key is configured
  if (!process.env.KIEAI_API_KEY || process.env.KIEAI_API_KEY === '') {
    console.error('❌ KIEAI_API_KEY is not set in .env file');
    console.log('\nPlease follow these steps:');
    console.log('1. Go to https://siliconflow.cn');
    console.log('2. Sign up and add credits ($5 minimum)');
    console.log('3. Get your API key from the dashboard');
    console.log('4. Add it to .env file: KIEAI_API_KEY=sk-your-key-here');
    return;
  }

  console.log('✅ API key found');

  // Test prompt
  const testPrompt = 'Create an 8-second UGC video. A young woman in a modern kitchen holds up a smoothie maker and says "This changed my morning routine!" with enthusiasm. Medium close-up shot, bright natural lighting, authentic and casual style.';

  try {
    console.log('\n📹 Submitting test video generation...');
    console.log('Prompt:', testPrompt);
    
    // Generate video
    const result = await KieAiService.generateVideo(testPrompt);
    
    console.log('\n✅ Video generation started successfully!');
    console.log('Task ID:', result.taskId);
    console.log('Status:', result.status);
    console.log('Estimated time:', result.estimatedTime);
    
    console.log('\n⏳ Checking status in 15 seconds...');
    
    // Wait 15 seconds
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Check status
    const status = await KieAiService.getVideoStatus(result.taskId);
    
    console.log('\nCurrent status:', status.status);
    if (status.status === 'completed') {
      console.log('✅ Video URL:', status.videoUrl);
      console.log('Cost:', `$${status.cost.amount}`);
    } else if (status.status === 'processing') {
      console.log('⏳ Still processing...');
      console.log('Progress:', status.progress);
      console.log('\nYou can check status later using this task ID:', result.taskId);
    } else if (status.status === 'failed') {
      console.log('❌ Generation failed:', status.error);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('Insufficient balance')) {
      console.log('\n💰 You need to add credits to your Kie.ai account:');
      console.log('1. Go to https://siliconflow.cn');
      console.log('2. Click on your profile → Balance');
      console.log('3. Add at least $5 to your account');
    }
  }

  console.log('\n✨ Test complete!');
}

// Run the test
testKieAi();