# RoastMyPic Database Schema

## Tables

### 1. public_roasts
Stores roasts that users have made public for the leaderboard.

```sql
CREATE TABLE public_roasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  roast_text TEXT NOT NULL,
  roast_style VARCHAR(50) NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_fingerprint VARCHAR(255), -- Anonymous user identification
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_public_roasts_votes ON public_roasts(votes DESC);
CREATE INDEX idx_public_roasts_created_at ON public_roasts(created_at DESC);
```

### 2. roast_votes
Tracks individual votes to prevent duplicate voting.

```sql
CREATE TABLE roast_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roast_id UUID REFERENCES public_roasts(id) ON DELETE CASCADE,
  user_fingerprint VARCHAR(255) NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(roast_id, user_fingerprint)
);

CREATE INDEX idx_roast_votes_roast_id ON roast_votes(roast_id);
CREATE INDEX idx_roast_votes_fingerprint ON roast_votes(user_fingerprint);
```

### 3. roast_stories
Stores 24-hour disappearing roast stories.

```sql
CREATE TABLE roast_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  roast_text TEXT NOT NULL,
  roast_style VARCHAR(50) NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  user_fingerprint VARCHAR(255) NOT NULL,
  username VARCHAR(100), -- Optional display name
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_roast_stories_expires_at ON roast_stories(expires_at);
CREATE INDEX idx_roast_stories_user ON roast_stories(user_fingerprint);
CREATE INDEX idx_roast_stories_active ON roast_stories(is_active, expires_at);
```

### 4. story_reactions
Tracks reactions to stories.

```sql
CREATE TABLE story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES roast_stories(id) ON DELETE CASCADE,
  user_fingerprint VARCHAR(255) NOT NULL,
  emoji VARCHAR(10) NOT NULL, -- 🔥, 💀, 😂, 😈, 😱
  reacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_fingerprint)
);

CREATE INDEX idx_story_reactions_story_id ON story_reactions(story_id);
```

### 5. story_views
Tracks story views.

```sql
CREATE TABLE story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES roast_stories(id) ON DELETE CASCADE,
  user_fingerprint VARCHAR(255) NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_fingerprint)
);

CREATE INDEX idx_story_views_story_id ON story_views(story_id);
```

## Cleanup Job

Auto-delete expired stories:

```sql
-- Function to clean up expired stories
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void AS $$
BEGIN
  DELETE FROM roast_stories
  WHERE expires_at < NOW() AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (run via cron or API endpoint)
```

## API Endpoints

### Public Roasts

- `POST /api/roasts/public` - Submit a roast to the public leaderboard
- `GET /api/roasts/public` - Get public roasts (paginated, sorted by votes)
- `POST /api/roasts/vote` - Vote on a roast
- `GET /api/roasts/trending` - Get trending roasts (last 24h)

### Stories

- `POST /api/stories` - Create a new story
- `GET /api/stories` - Get active stories
- `GET /api/stories/:id` - Get specific story
- `POST /api/stories/:id/view` - Mark story as viewed
- `POST /api/stories/:id/react` - React to a story
- `GET /api/stories/user/:fingerprint` - Get user's stories
