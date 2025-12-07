-- RoastMyPic Database Setup for Vercel Postgres
-- Run this script after connecting Vercel Postgres to your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: Public Roasts (for leaderboard)
CREATE TABLE IF NOT EXISTS public_roasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  roast_text TEXT NOT NULL,
  roast_style VARCHAR(50) NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_fingerprint VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_public_roasts_votes ON public_roasts(votes DESC);
CREATE INDEX IF NOT EXISTS idx_public_roasts_created_at ON public_roasts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_roasts_active ON public_roasts(is_active, votes DESC);

-- Table 2: Roast Votes (prevent duplicate voting)
CREATE TABLE IF NOT EXISTS roast_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roast_id UUID REFERENCES public_roasts(id) ON DELETE CASCADE,
  user_fingerprint VARCHAR(255) NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(roast_id, user_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_roast_votes_roast_id ON roast_votes(roast_id);
CREATE INDEX IF NOT EXISTS idx_roast_votes_fingerprint ON roast_votes(user_fingerprint);

-- Table 3: Roast Stories (24-hour disappearing)
CREATE TABLE IF NOT EXISTS roast_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  roast_text TEXT NOT NULL,
  roast_style VARCHAR(50) NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  user_fingerprint VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_roast_stories_expires_at ON roast_stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_roast_stories_user ON roast_stories(user_fingerprint);
CREATE INDEX IF NOT EXISTS idx_roast_stories_active ON roast_stories(is_active, expires_at);

-- Table 4: Story Reactions
CREATE TABLE IF NOT EXISTS story_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES roast_stories(id) ON DELETE CASCADE,
  user_fingerprint VARCHAR(255) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  reacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_story_reactions_story_id ON story_reactions(story_id);

-- Table 5: Story Views
CREATE TABLE IF NOT EXISTS story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES roast_stories(id) ON DELETE CASCADE,
  user_fingerprint VARCHAR(255) NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);

-- Function: Cleanup expired stories
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM roast_stories
  WHERE expires_at < NOW() AND is_active = TRUE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  image_url TEXT,
  roast_text TEXT,
  roast_style VARCHAR(50),
  language VARCHAR(10),
  votes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pr.image_url,
    pr.roast_text,
    pr.roast_style,
    pr.language,
    pr.votes,
    pr.created_at
  FROM public_roasts pr
  WHERE pr.is_active = TRUE
  ORDER BY pr.votes DESC, pr.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Get trending roasts (last 24 hours)
CREATE OR REPLACE FUNCTION get_trending_roasts(
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  image_url TEXT,
  roast_text TEXT,
  roast_style VARCHAR(50),
  language VARCHAR(10),
  votes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pr.image_url,
    pr.roast_text,
    pr.roast_style,
    pr.language,
    pr.votes,
    pr.created_at
  FROM public_roasts pr
  WHERE pr.is_active = TRUE
    AND pr.created_at > NOW() - INTERVAL '24 hours'
  ORDER BY pr.votes DESC, pr.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Get active stories
CREATE OR REPLACE FUNCTION get_active_stories()
RETURNS TABLE (
  id UUID,
  image_url TEXT,
  roast_text TEXT,
  roast_style VARCHAR(50),
  language VARCHAR(10),
  user_fingerprint VARCHAR(255),
  username VARCHAR(100),
  views INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  reaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rs.id,
    rs.image_url,
    rs.roast_text,
    rs.roast_style,
    rs.language,
    rs.user_fingerprint,
    rs.username,
    rs.views,
    rs.created_at,
    rs.expires_at,
    COUNT(DISTINCT sr.id) as reaction_count
  FROM roast_stories rs
  LEFT JOIN story_reactions sr ON rs.id = sr.story_id
  WHERE rs.is_active = TRUE
    AND rs.expires_at > NOW()
  GROUP BY rs.id
  ORDER BY rs.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE 'Tables created: public_roasts, roast_votes, roast_stories, story_reactions, story_views';
  RAISE NOTICE 'Functions created: cleanup_expired_stories, get_leaderboard, get_trending_roasts, get_active_stories';
END $$;
