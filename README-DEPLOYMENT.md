# UGC Script Splitter - Deployment Guide

## Digital Ocean App Platform Deployment

### Prerequisites
1. GitHub account
2. Digital Ocean account
3. Required API keys:
   - OpenAI API Key (required)
   - Google Gemini API Key (optional, for Veo 3 features)

### Step 1: Environment Variables Setup
The following environment variables need to be configured in Digital Ocean:

#### Required:
- `OPENAI_API_KEY`: Your OpenAI API key for script processing
- `NODE_ENV`: Set to `production`
- `PORT`: Will be automatically set by Digital Ocean (usually 8080)

#### Optional (for enhanced features):
- `GOOGLE_GEMINI_API_KEY`: Google Gemini API key for Veo 3 video generation features
- `VERTEX_PROJECT_ID`: Google Cloud Project ID (alternative to Gemini API)
- `VERTEX_LOCATION`: Vertex AI location (e.g., us-central1)

### Step 2: Digital Ocean App Platform Setup

1. **Create New App**
   - Go to Digital Ocean Apps dashboard
   - Click "Create App"
   - Choose "GitHub" as source

2. **Connect Repository**
   - Authorize Digital Ocean to access your GitHub
   - Select `denyshacks/veo3-video-prompt-generator`
   - Choose the `main` branch

3. **Configure Build Settings**
   - **Build Command**: `npm run install-all && npm run build`
   - **Run Command**: `npm start`
   - **Environment**: Node.js
   - **Instance Size**: Basic ($5/month recommended)

4. **Set Environment Variables**
   - Go to "Environment Variables" section
   - Add all required variables as "Encrypted" type:
     ```
     OPENAI_API_KEY=your_openai_key_here
     GOOGLE_GEMINI_API_KEY=your_gemini_key_here (optional)
     NODE_ENV=production
     ```

5. **Configure Health Check**
   - **HTTP Path**: `/api/health`
   - **Initial Delay**: 30 seconds
   - **Period**: 10 seconds
   - **Timeout**: 5 seconds

6. **Deploy**
   - Review configuration
   - Click "Create Resources"
   - Wait for deployment to complete

### Step 3: Post-Deployment Verification

1. **Check Health Endpoint**
   ```bash
   curl https://your-app-url.ondigitalocean.app/api/health
   ```

2. **Test API Endpoints**
   - Visit your app URL
   - Test script generation functionality
   - Verify all features work correctly

### Application Structure

```
ugc-script-splitter/
├── api/                    # Backend API routes and services
│   ├── routes/            # Express route handlers
│   └── services/          # OpenAI and Veo3 services
├── client/                # React frontend
│   ├── src/
│   ├── public/
│   └── build/             # Built React app (generated)
├── instructions/          # AI prompt templates
├── server.js             # Express server entry point
├── package.json          # Server dependencies
└── Dockerfile            # Container configuration (optional)
```

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-4 script processing |
| `NODE_ENV` | Yes | Set to `production` for deployment |
| `PORT` | Auto | Server port (set automatically by Digital Ocean) |
| `GOOGLE_GEMINI_API_KEY` | No | Google Gemini API for video generation features |
| `VERTEX_PROJECT_ID` | No | Google Cloud project ID (alternative to Gemini) |
| `VERTEX_LOCATION` | No | Vertex AI region (e.g., us-central1) |

### Troubleshooting

#### Common Issues:

1. **Build Fails**
   - Ensure all dependencies are in package.json
   - Check build logs for specific errors
   - Verify Node.js version compatibility

2. **Environment Variables Not Working**
   - Ensure variables are marked as "Encrypted"
   - Check variable names match exactly
   - Restart the app after adding variables

3. **API Errors**
   - Verify OpenAI API key is valid and has credits
   - Check API rate limits
   - Review application logs in Digital Ocean dashboard

4. **Frontend Not Loading**
   - Ensure build command completed successfully
   - Check that static files are being served correctly
   - Verify React build was created in `build/` directory

### Monitoring and Logs

- Access logs via Digital Ocean Apps dashboard
- Monitor performance and resource usage
- Set up alerts for downtime or errors
- Use the health check endpoint for monitoring

### Scaling

- Start with Basic plan ($5/month)
- Scale up instance size if needed
- Consider adding multiple instances for high traffic
- Monitor response times and adjust accordingly

### Security Notes

- All API keys are encrypted in Digital Ocean
- HTTPS is enabled by default
- Rate limiting is implemented on API endpoints
- Input validation is in place for all user inputs

### Cost Estimation

**Digital Ocean Costs:**
- Basic App: $5/month
- Professional App: $12/month (if more resources needed)

**API Costs (variable usage):**
- OpenAI GPT-4: ~$0.03 per 1K tokens
- Google Gemini: ~$0.001 per 1K tokens (if used)

### Support

For deployment issues:
1. Check Digital Ocean documentation
2. Review application logs
3. Test locally first to isolate issues
4. Contact Digital Ocean support if platform-related
