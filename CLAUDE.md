# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UGC Script Splitter for Veo 3 - A React/Express application that transforms UGC scripts into AI-ready video segments with integrated Veo 3 support.

## Commands

### Development
```bash
npm run dev         # Build client and start server
npm run dev:watch   # Start server with client hot reload
```

### Build & Production
```bash
npm run build       # Build React client
npm start          # Start production server
```

### Installation
```bash
npm run install-all  # Install dependencies for both server and client
```

### Testing
No test framework is currently configured. Use manual testing through the development server.

## Architecture

### Backend (Express)
- **server.js**: Main Express server (port 3001) serving both API and React build
- **api/routes/**: API endpoints
  - `generate.js`: Handles script segmentation via OpenAI
  - `generateContinuation.js`: Handles continuation mode segmentation
- **api/services/**: External service integrations
  - `openaiService.js`: OpenAI GPT-4 integration for script processing
  - `veo3Service.js`: Google Veo 3 integration (Gemini API or Vertex AI)

### Frontend (React)
- **client/src/App.js**: Main app with tab navigation (Standard/Continuation modes)
- **client/src/components/**:
  - `ScriptForm.js`: User input form for script and settings
  - `VideoGenerator.js`: Veo 3 video generation interface with Kie.ai support
  - `ResultsDisplay.js`: Shows generated JSON segments
  - `ContinuationMode.js`: Alternative UI for continuation-style scripts

### Key Features
1. Script splitting into 8-second segments using GPT-4
2. Two JSON formats: Standard (300+ words) and Enhanced Continuity (500+ words)
3. Veo 3 integration via Gemini API or Vertex AI
4. Kie.ai integration for actual video generation (93% cheaper)
5. ZIP download for bulk export

## Environment Variables

Required in `.env`:
```
OPENAI_API_KEY=sk-...

# Choose ONE authentication method:
GOOGLE_GEMINI_API_KEY=...          # Option A: Gemini API
GOOGLE_APPLICATION_CREDENTIALS=... # Option B: Vertex AI
KIEAI_API_KEY=...                 # Option C: Kie.ai
```

## API Endpoints

- `POST /api/generate` - Generate JSON segments from script
- `POST /api/generate/continuation` - Generate continuation-style segments
- `POST /api/download` - Download segments as ZIP
- `POST /api/generate-videos` - Generate video descriptions via Veo 3
- `POST /api/generate-video-kieai` - Generate actual videos via Kie.ai

## OpenAI System Prompts

### 1. Standard Generation Template (ugc-template.md)
Used for generating 300+ word character descriptions per segment. Key requirements:
- **Physical Description**: 100+ words covering hair, face, eyes, body, hands, energy
- **Clothing**: 100+ words with exact details on all garments, colors, fit, accessories
- **Voice**: 50+ words on tone, pace, inflections, breathing patterns
- **Personality**: 50+ words on energy level, expressions, gestures, body language

Each segment JSON includes:
- Character positioning and framing
- Script text with timing
- Detailed actions synchronized to dialogue
- Product placement and interaction
- Camera angles and movement
- Lighting specifications
- Audio emphasis points
- Transition notes for seamless flow

### 2. Enhanced Continuity Template (veo3-enhanced-continuity.md)
Used for 500+ word descriptions with micro-expressions and detailed continuity. Adds:
- **Continuity Markers**: Exact start/end positions, expressions, gestures for each segment
- **Extended Descriptions**: 200+ words physical, 150+ words clothing, 100+ words current state
- **Voice Matching**: 100+ words with precise vocal blueprint including pitch patterns
- **Scene Continuity**: 250+ words environment, 75+ words camera, 50+ words lighting
- **Action Timeline**: Beat-by-beat synchronized actions with micro-expressions
- **Overlap Planning**: 1-second overlap zones between segments
- **Transition Types**: Continuous motion, matched still, or energy match transitions

### 3. Continuation Mode Template (veo3-continuation-minimal.md)
Used after initial segment to maintain consistency while minimizing redundancy:
- **Voice Matching**: 150+ words with exact technical specs (CRITICAL)
- **Behavioral Patterns**: 100+ words on gesture vocabulary and energy expression
- **Current State**: 50+ words on this moment's specific energy and expression
- **Minimal Physical**: Simply references "Continue from screenshot"
- Focuses on voice continuity, behavioral consistency, and smooth transitions

### 4. General Guidelines (veo3-json-guidelines.md)
Base requirements for all formats:
- 300+ words minimum per segment (500+ for enhanced)
- 8-second timing with ~20 words of dialogue
- Identical character/clothing/environment descriptions across segments
- Natural break points and seamless transitions
- Synchronized actions matching dialogue timing
- Quality validation checklists for consistency

## Prompt Processing Flow
1. User inputs are combined with the selected template
2. GPT-4o generates structured JSON following template requirements
3. For continuation mode: First generates base profile, then individual segments
4. All segments maintain exact consistency in fixed elements
5. Variable elements (expressions, positions) change naturally between segments