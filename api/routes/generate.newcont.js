import express from 'express';
import rateLimit from 'express-rate-limit';
import OpenAIService from '../services/openaiService.js';

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});

router.use(limiter);

// New Continuation Mode: isolated endpoint
router.post('/generate-new-cont', async (req, res) => {
  console.log('[NewCont] Request received:', {
    bodyKeys: Object.keys(req.body),
    scriptLength: req.body.script?.length || 0,
  });

  try {
    const {
      script,
      ageRange,
      gender,
      product,
      room,
      style,
      jsonFormat = 'standard',
      voiceType,
      energyLevel,
      settingMode = 'single',
      locations = [],
      cameraStyle,
      timeOfDay,
      backgroundLife,
      productStyle,
      energyArc,
      narrativeStyle,
      ethnicity,
      characterFeatures,
      clothingDetails,
      accentRegion,
      // Animal avatar params
      useAnimalAvatar = false,
      animalPreset, // 'tiger' | 'monkey' | 'fish'
      animalVoiceStyle, // e.g., 'narrator', 'playful', 'deep-resonant'
      anthropomorphic = false
    } = req.body;

    if (!script || script.trim().length < 50) {
      return res.status(400).json({ error: 'Script must be at least 50 characters long' });
    }

    const params = {
      script: script.trim(),
      ageRange,
      gender,
      product,
      room,
      style,
      jsonFormat,
      voiceType,
      energyLevel,
      settingMode,
      locations,
      cameraStyle,
      timeOfDay,
      backgroundLife,
      productStyle,
      energyArc,
      narrativeStyle,
      ethnicity,
      characterFeatures,
      clothingDetails,
      accentRegion,
    };

    if (useAnimalAvatar) {
      params.avatarMode = 'animal';
      params.animal = {
        species: animalPreset,
        voiceStyle: animalVoiceStyle || 'narrator',
        anthropomorphic: !!anthropomorphic,
      };
      // Neutralize human-only fields when animal avatar is used
      params.ageRange = params.ageRange || 'N/A';
      params.gender = params.gender || 'N/A';
    }

    // Use continuation style generation path
    const result = await OpenAIService.generateSegmentsWithVoiceProfile(params);

    res.json({
      success: true,
      segments: result.segments,
      metadata: result.metadata,
      voiceProfile: result.voiceProfile,
    });
  } catch (error) {
    console.error('[NewCont] Error:', error);
    res.status(500).json({ error: 'Failed to generate new continuation segments', message: error.message });
  }
});

export default router; 