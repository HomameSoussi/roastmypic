# RoastMyPic - Deployment Guide

## 🚀 Quick Deployment to Vercel

### Prerequisites
- GitHub account with the roastmypic repository
- Vercel account (free tier works perfectly)
- OpenAI API key

### Step-by-Step Deployment

#### 1. Prepare Your OpenAI API Key
- Go to [OpenAI Platform](https://platform.openai.com/api-keys)
- Create a new API key or use an existing one
- Copy the key (it starts with `sk-...`)

#### 2. Deploy to Vercel

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Select "Import Git Repository"
4. Choose your GitHub account and select `roastmypic` repository
5. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `pnpm build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

6. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add the following:
     ```
     Name: OPENAI_API_KEY
     Value: sk-your-actual-api-key-here
     ```
   - Select all environments (Production, Preview, Development)

7. Click "Deploy"
8. Wait 2-3 minutes for the build to complete
9. Your app will be live at `https://roastmypic-xxx.vercel.app`

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd roastmypic
vercel

# Add environment variable
vercel env add OPENAI_API_KEY

# Redeploy with environment variable
vercel --prod
```

#### 3. Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Navigate to "Settings" → "Domains"
3. Add your custom domain (e.g., `roastmypic.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (usually 5-30 minutes)

### 🔧 Post-Deployment Configuration

#### Update Environment Variables

If you need to update your API key:

1. Go to Vercel Dashboard → Your Project
2. Navigate to "Settings" → "Environment Variables"
3. Edit or add new variables
4. Redeploy to apply changes

#### Enable Analytics (Optional)

1. Go to Vercel Dashboard → Your Project
2. Navigate to "Analytics"
3. Enable Web Analytics (free)
4. Track visitors, page views, and performance

### 🧪 Testing Your Deployment

1. Visit your deployed URL
2. Upload a test image
3. Select a roast style
4. Click "Roast Me 🔥"
5. Verify the roast is generated successfully

### 🐛 Troubleshooting

#### Build Fails

**Error**: `Module not found` or `Cannot find package`
- **Solution**: Ensure all dependencies are in `package.json`
- Run `pnpm install` locally and commit `pnpm-lock.yaml`

**Error**: `TypeScript compilation failed`
- **Solution**: Run `pnpm build` locally to identify errors
- Fix TypeScript errors and push changes

#### API Errors

**Error**: `OpenAI API error: 401`
- **Solution**: Check that `OPENAI_API_KEY` is set correctly in Vercel
- Ensure the API key is valid and has credits

**Error**: `OpenAI API error: 429`
- **Solution**: You've hit rate limits
- Upgrade your OpenAI plan or wait for rate limit reset

**Error**: `Failed to generate roast`
- **Solution**: Check Vercel function logs
- Navigate to "Deployments" → Click on latest → "Functions" → View logs

#### Image Upload Issues

**Error**: `Image too large`
- **Solution**: Vercel has a 4.5MB body size limit for serverless functions
- Current app limit is 5MB - reduce to 4MB if needed

### 📊 Monitoring

#### View Logs

1. Go to Vercel Dashboard → Your Project
2. Click on "Deployments"
3. Click on the latest deployment
4. Navigate to "Functions" tab
5. Click on `/api/roast` to view logs

#### Performance Monitoring

- Vercel provides built-in performance metrics
- Check "Analytics" tab for:
  - Response times
  - Error rates
  - Geographic distribution

### 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. Make changes locally
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. Vercel automatically builds and deploys
4. Check deployment status in Vercel Dashboard

### 🌍 Production Checklist

Before going viral, ensure:

- ✅ Environment variables are set
- ✅ Custom domain is configured (optional)
- ✅ Analytics are enabled
- ✅ Error tracking is set up
- ✅ API rate limits are understood
- ✅ OpenAI billing is configured
- ✅ All roast styles tested
- ✅ Mobile responsiveness verified
- ✅ Safety features working correctly

### 💰 Cost Estimation

**Vercel Hosting**: Free tier includes:
- 100 GB bandwidth
- Unlimited deployments
- Automatic SSL
- Edge network

**OpenAI API Costs** (GPT-4 Vision):
- ~$0.01 per roast (varies by image size)
- 100 roasts = ~$1
- 1,000 roasts = ~$10
- Monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

### 🔐 Security Best Practices

1. **Never commit `.env.local`** - it's already in `.gitignore`
2. **Rotate API keys regularly** - update in Vercel settings
3. **Monitor API usage** - set up billing alerts in OpenAI
4. **Enable rate limiting** - consider adding rate limiting middleware
5. **Use environment-specific keys** - different keys for dev/prod

### 📞 Support

If you encounter issues:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Check [Next.js Documentation](https://nextjs.org/docs)
3. Check [OpenAI API Documentation](https://platform.openai.com/docs)
4. Review GitHub Issues in the repository

---

**Ready to deploy?** Follow the steps above and your RoastMyPic app will be live in minutes! 🔥
