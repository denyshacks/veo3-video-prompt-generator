# Kie.ai Setup Guide for UGC Script Splitter

## Step 1: Create Kie.ai Account

1. Go to https://siliconflow.cn
2. Click "Sign up" or "Login with Google"
3. Complete the registration process

## Step 2: Add Credits to Your Account

1. Once logged in, click on your profile/avatar
2. Go to "Balance" or "充值" (Recharge)
3. Add at least $5 USD to your account
   - You can use PayPal, credit card, or other payment methods
   - $5 will give you about 12 video generations

## Step 3: Get Your API Key

1. In your dashboard, look for "API Keys" or "API密钥"
2. Click "Create New API Key" or "创建新的API密钥"
3. Give it a name like "UGC Script Splitter"
4. Copy the generated API key (it looks like: sk-xxxxxxxxxxxxxxxxxxxxxxxxxx)

## Step 4: Configure Your App

1. Open your `.env` file in the project root
2. Add this line:
   ```
   KIEAI_API_KEY=sk-your-actual-api-key-here
   ```

3. Save the file

## Step 5: Install Dependencies

Run this command in your project root:
```bash
npm install
```

## Step 6: Test the Integration

1. Start your app:
   ```bash
   npm run dev
   ```

2. Go to http://localhost:3001

3. Generate some script segments as usual

4. In the Video Generator section:
   - Check the "Use Kie.ai for actual video generation" checkbox
   - Click "Generate Videos"

5. You'll see:
   - Task IDs for each video
   - Status updates every 15 seconds
   - Download links when videos are ready (5-8 minutes)

## API Endpoints

The Kie.ai API uses these endpoints:
- Base URL: https://api.siliconflow.cn/v1
- Generate: POST /video/generations
- Check Status: GET /video/generations/{task_id}

## Troubleshooting

### "Kie.ai service not configured" error
- Make sure your KIEAI_API_KEY is in the .env file
- Restart your server after adding the API key

### "Insufficient balance" error
- Check your balance at https://siliconflow.cn
- Top up if needed

### Videos not generating
- Verify your API key is correct
- Check the server console for detailed error messages
- Ensure you're using the "V3_Fast" model (already configured)

## Cost Breakdown

- Each 8-second video costs $0.40
- Your $5 balance allows ~12 videos
- Compare to official Veo 3: $6 per video (93% savings!)

## Important Notes

1. **Processing Time**: Videos take 5-8 minutes to generate
2. **Rate Limits**: Process one video at a time to avoid issues
3. **Video Quality**: V3_Fast provides good quality at lower cost
4. **Storage**: Videos are hosted on Kie.ai servers temporarily

## Support

- Kie.ai Documentation: https://docs.siliconflow.cn
- Community: https://discord.gg/siliconflow
- Email: support@siliconflow.cn

## Next Steps

Once configured, your app will:
1. Send prompts to Kie.ai for video generation
2. Poll for completion status
3. Display download links when ready
4. Show real-time progress in the UI

Enjoy creating videos at 93% lower cost!