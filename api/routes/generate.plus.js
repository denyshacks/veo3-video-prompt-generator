import express from 'express';
import rateLimit from 'express-rate-limit';
import OpenAIServicePlus from '../services/openaiService.plus.js';
import Veo3Service from '../services/veo3Service.js';
import archiver from 'archiver';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const runsRoot = path.join(__dirname, '../../runs/plus');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10
});

router.use(limiter);

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true }).catch(() => {});
}

router.post('/generate-plus', async (req, res) => {
  console.log('[Generate Plus] Request received:', {
    bodyKeys: Object.keys(req.body),
    scriptLength: req.body.script?.length || 0
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
      accentRegion
    } = req.body;

    if (!script || script.trim().length < 50) {
      console.log('[Generate Plus] Validation failed: Script too short');
      return res.status(400).json({
        error: 'Script must be at least 50 characters long'
      });
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
      accentRegion
    };

    const result = await OpenAIServicePlus.generateSegments(params);

    // Persist inputs/outputs to per-run folder
    try {
      const runId = `${Date.now()}`;
      const runDir = path.join(runsRoot, runId);
      await ensureDir(runDir);
      await fs.writeFile(path.join(runDir, 'inputs.json'), JSON.stringify(params, null, 2));
      await fs.writeFile(path.join(runDir, 'outputs.json'), JSON.stringify(result, null, 2));
      result.metadata = { ...(result.metadata || {}), runId, runPath: `runs/plus/${runId}` };
    } catch (persistErr) {
      console.error('[Generate Plus] Failed to persist run files:', persistErr);
    }

    console.log('[Generate Plus] Success:', {
      segments: result.segments.length,
      characterId: result.metadata.characterId
    });

    res.json({
      success: true,
      segments: result.segments,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('[Generate Plus] Error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({
      error: 'Failed to generate segments (plus)',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.response?.data : undefined
    });
  }
});

router.post('/download-plus', async (req, res) => {
  try {
    const { segments } = req.body;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=veo3-segments-plus.zip');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    segments.forEach((segment, index) => {
      archive.append(JSON.stringify(segment, null, 2), {
        name: `segment_plus_${(index + 1).toString().padStart(2, '0')}.json`
      });
    });

    archive.append('Standard Plus Instructions for Veo 3:\n1. Upload each JSON in order\n2. Generate 8-second clips\n3. Edit together with overlaps', {
      name: 'README_PLUS.txt'
    });

    archive.finalize();
  } catch (error) {
    console.error('Download Plus error:', error);
    res.status(500).json({ error: 'Failed to create download (plus)' });
  }
});

router.post('/generate-videos-plus', async (req, res) => {
  console.log('[Generate Videos Plus] Request received');
  try {
    const { segments } = req.body;

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return res.status(400).json({
        error: 'No segments provided for video generation'
      });
    }

    const result = await Veo3Service.generateVideosForAllSegments(segments);

    res.json({
      success: true,
      videos: result.videos,
      service: 'gemini',
      message: result.message || 'Video generation initiated successfully (plus)'
    });
  } catch (error) {
    console.error('[Generate Videos Plus] Error:', error);
    res.status(500).json({
      error: 'Failed to generate videos (plus)',
      message: error.message
    });
  }
});

export default router; 