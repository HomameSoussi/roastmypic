# RoastMyPic - Setup Guide for Database Features

## Overview

This guide will help you set up the new features:
1. **Public Roast Leaderboard** - Users can make their roasts public and vote on others
2. **24-Hour Roast Stories** - Instagram-style disappearing stories

## Prerequisites

- Vercel account (free tier works)
- GitHub repository connected to Vercel
- Vercel Postgres database (free tier available)

## Step 1: Create Vercel Postgres Database

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your `roastmypic` project
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a name (e.g., `roastmypic-db`)
7. Select a region (choose closest to your users)
8. Click **Create**

## Step 2: Connect Database to Project

1. After creating the database, Vercel will automatically add environment variables to your project:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

2. These variables are automatically available in your deployment

## Step 3: Run Database Setup Script

1. In your Vercel dashboard, go to your Postgres database
2. Click on the **Query** tab or **Data** tab
3. Copy the contents of `scripts/setup-database.sql`
4. Paste and execute the script

This will create all necessary tables:
- `public_roasts` - Stores public roasts for leaderboard
- `roast_votes` - Tracks votes to prevent duplicates
- `roast_stories` - Stores 24-hour disappearing stories
- `story_reactions` - Tracks story reactions (🔥💀😂😈😱)
- `story_views` - Tracks story views

## Step 4: Add Cron Secret (Optional but Recommended)

For the automatic cleanup of expired stories:

1. Go to **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `CRON_SECRET`
   - **Value**: Generate a random secret (e.g., use https://generate-secret.vercel.app/)
   - **Environments**: Production, Preview, Development
3. Click **Save**

## Step 5: Deploy

1. Commit and push all changes to GitHub:
   ```bash
   git add .
   git commit -m "Add leaderboard and stories features"
   git push origin main
   ```

2. Vercel will automatically deploy your changes

3. The cron job will run every hour to cleanup expired stories

## Step 6: Verify Setup

After deployment, test the API endpoints:

### Test Leaderboard
```bash
curl https://roastmypic.vercel.app/api/roasts/public
```

### Test Stories
```bash
curl https://roastmypic.vercel.app/api/stories
```

## API Endpoints

### Public Roasts

- `POST /api/roasts/public` - Submit roast to leaderboard
  ```json
  {
    "imageUrl": "https://...",
    "roastText": "Your roast text",
    "roastStyle": "clean_funny",
    "language": "en"
  }
  ```

- `GET /api/roasts/public?limit=20&offset=0` - Get leaderboard
- `GET /api/roasts/trending?limit=10` - Get trending roasts
- `POST /api/roasts/vote` - Vote on a roast
  ```json
  {
    "roastId": "uuid-here"
  }
  ```

### Stories

- `POST /api/stories` - Create a story
  ```json
  {
    "imageUrl": "https://...",
    "roastText": "Your roast text",
    "roastStyle": "clean_funny",
    "language": "en",
    "username": "Optional display name"
  }
  ```

- `GET /api/stories` - Get all active stories
- `GET /api/stories/[id]` - Get specific story
- `POST /api/stories/[id]/view` - Mark story as viewed
- `POST /api/stories/[id]/react` - React to story
  ```json
  {
    "emoji": "🔥"
  }
  ```

## Frontend Integration (Next Steps)

You'll need to update the frontend to:

1. **Add "Make Public" checkbox** after generating a roast
2. **Create Leaderboard page** to display top roasts with voting
3. **Create Stories feed** with Instagram-style UI
4. **Add Story creation flow** with 24-hour expiration indicator

## Troubleshooting

### Database Connection Errors

If you see connection errors:
1. Check that environment variables are set in Vercel
2. Verify the database is in the same region as your deployment
3. Check Vercel Postgres dashboard for connection status

### Cron Job Not Running

1. Verify `vercel.json` is in the root directory
2. Check that `CRON_SECRET` environment variable is set
3. View cron logs in Vercel dashboard under **Logs** → **Cron**

### Migration from Development to Production

The database schema is designed to work with both development and production:
- Development: Use Vercel Postgres preview database
- Production: Use Vercel Postgres production database

## Cost Considerations

**Vercel Postgres Free Tier:**
- 256 MB storage
- 60 hours of compute per month
- 256 MB RAM
- Perfect for getting started

**Upgrade when:**
- You exceed 256 MB storage (~10,000-50,000 roasts)
- You need more compute hours
- You want better performance

## Security Notes

1. **User Fingerprinting**: Uses IP + User-Agent for anonymous identification
2. **No Personal Data**: No emails, passwords, or personal info stored
3. **Rate Limiting**: Consider adding rate limiting for production
4. **Image Storage**: Currently placeholder - implement with Vercel Blob or Cloudinary

## Next Steps

1. ✅ Database setup complete
2. ✅ API endpoints ready
3. ⏳ Update frontend UI
4. ⏳ Add leaderboard page
5. ⏳ Add stories feed
6. ⏳ Implement image upload to Vercel Blob

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Postgres query logs
3. Verify environment variables are set
4. Test API endpoints with curl/Postman

---

**Ready to make RoastMyPic even more viral! 🔥🚀**
