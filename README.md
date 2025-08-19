# UGC Script Splitter for Veo 3

Transform your UGC scripts into AI-ready video segments with integrated Veo 3 support.

## Features

- 📝 **Script Splitting**: Automatically splits long scripts into 8-second segments
- 🎭 **Two JSON Formats**: 
  - Standard (300+ words) 
  - Enhanced Continuity (500+ words with micro-expressions)
- 🎬 **Veo 3 Integration**: Generate video descriptions (full video generation coming soon)
- 📦 **Bulk Export**: Download all segments as ZIP
- 💰 **Cost Estimation**: See video generation costs upfront

## Setup

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Configure API Keys

Create a `.env` file in the root directory:

```env
# OpenAI (Required)
OPENAI_API_KEY=sk-...

# Choose ONE of these authentication methods:

# Option A: Gemini API (Simple)
GOOGLE_GEMINI_API_KEY=your-gemini-api-key

# Option B: Vertex AI with Service Account (Enterprise)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
VERTEX_PROJECT_ID=your-project-id
VERTEX_LOCATION=us-central1

# Option C: Kie.ai for Actual Video Generation (93% cheaper!)
KIEAI_API_KEY=your-kieai-api-key
```

### 3. Vertex AI Setup (If using Vertex AI)

1. **Create a Service Account**:
   ```bash
   gcloud iam service-accounts create veo3-service \
     --display-name="Veo 3 Service Account"
   ```

2. **Grant Required Permissions**:
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:veo3-service@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

3. **Download Service Account Key**:
   ```bash
   gcloud iam service-accounts keys create ./service-account-key.json \
     --iam-account=veo3-service@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

4. **Update .env**:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
   VERTEX_PROJECT_ID=your-project-id
   VERTEX_LOCATION=us-central1
   ```

## Running the App

### Development
```bash
npm run dev
```
Access at http://localhost:3001

### Production
```bash
npm run build
npm start
```

## Usage

1. **Enter Your Script**: Paste your UGC script (minimum 50 characters)
2. **Configure Settings**: 
   - Select age range, gender, room style
   - Choose JSON format (Standard or Enhanced)
3. **Generate Segments**: Click to create AI-ready JSON segments
4. **Generate Videos** (Optional): Create video descriptions with Veo 3
5. **Download**: Export all segments as ZIP

## API Endpoints

- `POST /api/generate` - Generate JSON segments from script
- `POST /api/download` - Download segments as ZIP
- `POST /api/generate-videos` - Generate video descriptions

## Cost Information

### Official Veo 3 API (When Available)
- **Cost**: $0.75 per second of video
- **8-second segments**: $6 per segment
- **Example**: 5 segments = $30

### Kie.ai Integration (Available Now!)
- **Cost**: $0.40 per video (flat rate, not per second)
- **8-second segments**: $0.40 per segment
- **Example**: 5 segments = $2
- **Savings**: 93% cheaper than official API

## Kie.ai Setup (For Actual Video Generation)

1. **Sign up at https://siliconflow.cn**
   - Use Google login for easy access
   - Top up your balance ($5 minimum)

2. **Get your API key**
   - Go to API Keys section
   - Copy your key

3. **Add to .env**
   ```env
   KIEAI_API_KEY=your-kieai-api-key
   ```

4. **Use in the app**
   - Toggle "Use Kie.ai" in the Video Generator
   - Videos generate in 5-8 minutes
   - Download links appear when ready

## Deployment

### Heroku
```bash
heroku create your-app-name
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set GOOGLE_GEMINI_API_KEY=...
git push heroku main
```

### Google Cloud Run
```bash
gcloud run deploy ugc-script-splitter \
  --source . \
  --set-env-vars OPENAI_API_KEY=sk-... \
  --allow-unauthenticated
```

## Security Notes

- Never commit API keys or service account files
- Add `service-account-key.json` to `.gitignore`
- Use environment variables for all sensitive data

## Future Features

- [ ] Direct Veo 3 video generation (when API is available)
- [ ] Image-to-video support
- [ ] Video preview in browser
- [ ] Batch processing for multiple scripts

## License

MIT