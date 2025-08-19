import express from 'express';
import openaiService from '../services/openaiService.js';

const router = express.Router();

router.post('/generate-continuation', async (req, res) => {
  console.log('[API] /generate-continuation called');
  
  try {
    const { imageUrl, script, voiceProfile, previousSegment, maintainEnergy, product } = req.body;
    
    // Validate required fields
    if (!imageUrl || !script || !voiceProfile || !product) {
      return res.status(400).json({ 
        error: 'Missing required fields: imageUrl, script, voiceProfile, and product are required' 
      });
    }
    
    console.log('[API] Generating continuation for:', {
      imageUrl,
      scriptLength: script.length,
      hasVoiceProfile: !!voiceProfile,
      hasPreviousSegment: !!previousSegment,
      product
    });
    
    // Generate continuation segment
    const segment = await openaiService.generateContinuationSegment({
      imageUrl,
      script,
      voiceProfile,
      previousSegment,
      maintainEnergy,
      product
    });
    
    console.log('[API] Continuation segment generated successfully');
    
    res.json({ 
      success: true,
      segment
    });
    
  } catch (error) {
    console.error('[API] Continuation generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate continuation',
      message: error.message 
    });
  }
});

export default router;