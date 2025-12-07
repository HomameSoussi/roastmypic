// Database utility for Vercel Postgres
// Install: pnpm add @vercel/postgres

import { sql } from '@vercel/postgres';

export interface PublicRoast {
  id: string;
  image_url: string;
  roast_text: string;
  roast_style: string;
  language: string;
  votes: number;
  created_at: Date;
  user_fingerprint?: string;
  has_voted?: boolean;
}

export interface RoastStory {
  id: string;
  image_url: string;
  roast_text: string;
  roast_style: string;
  language: string;
  user_fingerprint: string;
  username?: string;
  views: number;
  created_at: Date;
  expires_at: Date;
  reaction_count?: number;
  user_reaction?: string;
  has_viewed?: boolean;
}

// Generate a simple fingerprint from browser data
export function generateFingerprint(req: Request): string {
  const userAgent = req.headers.get('user-agent') || '';
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  // Simple hash function
  const hash = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h = h & h;
    }
    return Math.abs(h).toString(36);
  };
  
  return hash(userAgent + ip);
}

// Public Roasts Functions

export async function createPublicRoast(
  imageUrl: string,
  roastText: string,
  roastStyle: string,
  language: string,
  userFingerprint: string
): Promise<PublicRoast> {
  const result = await sql`
    INSERT INTO public_roasts (image_url, roast_text, roast_style, language, user_fingerprint)
    VALUES (${imageUrl}, ${roastText}, ${roastStyle}, ${language}, ${userFingerprint})
    RETURNING *
  `;
  
  return result.rows[0] as PublicRoast;
}

export async function getLeaderboard(
  limit: number = 20,
  offset: number = 0,
  userFingerprint?: string
): Promise<PublicRoast[]> {
  const result = await sql`
    SELECT 
      pr.*,
      CASE 
        WHEN rv.id IS NOT NULL THEN true 
        ELSE false 
      END as has_voted
    FROM public_roasts pr
    LEFT JOIN roast_votes rv ON pr.id = rv.roast_id AND rv.user_fingerprint = ${userFingerprint || ''}
    WHERE pr.is_active = true
    ORDER BY pr.votes DESC, pr.created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  
  return result.rows as PublicRoast[];
}

export async function getTrendingRoasts(
  limit: number = 10,
  userFingerprint?: string
): Promise<PublicRoast[]> {
  const result = await sql`
    SELECT 
      pr.*,
      CASE 
        WHEN rv.id IS NOT NULL THEN true 
        ELSE false 
      END as has_voted
    FROM public_roasts pr
    LEFT JOIN roast_votes rv ON pr.id = rv.roast_id AND rv.user_fingerprint = ${userFingerprint || ''}
    WHERE pr.is_active = true
      AND pr.created_at > NOW() - INTERVAL '24 hours'
    ORDER BY pr.votes DESC, pr.created_at DESC
    LIMIT ${limit}
  `;
  
  return result.rows as PublicRoast[];
}

export async function voteOnRoast(
  roastId: string,
  userFingerprint: string
): Promise<{ success: boolean; votes: number }> {
  try {
    // Check if already voted
    const existingVote = await sql`
      SELECT id FROM roast_votes
      WHERE roast_id = ${roastId} AND user_fingerprint = ${userFingerprint}
    `;
    
    if (existingVote.rows.length > 0) {
      // Already voted, remove vote (toggle)
      await sql`
        DELETE FROM roast_votes
        WHERE roast_id = ${roastId} AND user_fingerprint = ${userFingerprint}
      `;
      
      const result = await sql`
        UPDATE public_roasts
        SET votes = GREATEST(votes - 1, 0)
        WHERE id = ${roastId}
        RETURNING votes
      `;
      
      return { success: true, votes: result.rows[0].votes };
    } else {
      // Add vote
      await sql`
        INSERT INTO roast_votes (roast_id, user_fingerprint)
        VALUES (${roastId}, ${userFingerprint})
      `;
      
      const result = await sql`
        UPDATE public_roasts
        SET votes = votes + 1
        WHERE id = ${roastId}
        RETURNING votes
      `;
      
      return { success: true, votes: result.rows[0].votes };
    }
  } catch (error) {
    console.error('Error voting on roast:', error);
    return { success: false, votes: 0 };
  }
}

// Story Functions

export async function createStory(
  imageUrl: string,
  roastText: string,
  roastStyle: string,
  language: string,
  userFingerprint: string,
  username?: string
): Promise<RoastStory> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  
  const result = await sql`
    INSERT INTO roast_stories (
      image_url, roast_text, roast_style, language, 
      user_fingerprint, username, expires_at
    )
    VALUES (
      ${imageUrl}, ${roastText}, ${roastStyle}, ${language},
      ${userFingerprint}, ${username || null}, ${expiresAt.toISOString()}
    )
    RETURNING *
  `;
  
  return result.rows[0] as RoastStory;
}

export async function getActiveStories(
  userFingerprint?: string
): Promise<RoastStory[]> {
  const result = await sql`
    SELECT 
      rs.*,
      COUNT(DISTINCT sr.id) as reaction_count,
      MAX(CASE WHEN sr.user_fingerprint = ${userFingerprint || ''} THEN sr.emoji END) as user_reaction,
      CASE 
        WHEN sv.id IS NOT NULL THEN true 
        ELSE false 
      END as has_viewed
    FROM roast_stories rs
    LEFT JOIN story_reactions sr ON rs.id = sr.story_id
    LEFT JOIN story_views sv ON rs.id = sv.story_id AND sv.user_fingerprint = ${userFingerprint || ''}
    WHERE rs.is_active = true
      AND rs.expires_at > NOW()
    GROUP BY rs.id, sv.id
    ORDER BY rs.created_at DESC
  `;
  
  return result.rows as RoastStory[];
}

export async function getStoryById(
  storyId: string,
  userFingerprint?: string
): Promise<RoastStory | null> {
  const result = await sql`
    SELECT 
      rs.*,
      COUNT(DISTINCT sr.id) as reaction_count,
      MAX(CASE WHEN sr.user_fingerprint = ${userFingerprint || ''} THEN sr.emoji END) as user_reaction,
      CASE 
        WHEN sv.id IS NOT NULL THEN true 
        ELSE false 
      END as has_viewed
    FROM roast_stories rs
    LEFT JOIN story_reactions sr ON rs.id = sr.story_id
    LEFT JOIN story_views sv ON rs.id = sv.story_id AND sv.user_fingerprint = ${userFingerprint || ''}
    WHERE rs.id = ${storyId}
      AND rs.is_active = true
      AND rs.expires_at > NOW()
    GROUP BY rs.id, sv.id
  `;
  
  return result.rows[0] as RoastStory || null;
}

export async function viewStory(
  storyId: string,
  userFingerprint: string
): Promise<boolean> {
  try {
    // Add view record (unique constraint prevents duplicates)
    await sql`
      INSERT INTO story_views (story_id, user_fingerprint)
      VALUES (${storyId}, ${userFingerprint})
      ON CONFLICT (story_id, user_fingerprint) DO NOTHING
    `;
    
    // Increment view count
    await sql`
      UPDATE roast_stories
      SET views = views + 1
      WHERE id = ${storyId}
    `;
    
    return true;
  } catch (error) {
    console.error('Error viewing story:', error);
    return false;
  }
}

export async function reactToStory(
  storyId: string,
  userFingerprint: string,
  emoji: string
): Promise<boolean> {
  try {
    // Upsert reaction (replace if exists)
    await sql`
      INSERT INTO story_reactions (story_id, user_fingerprint, emoji)
      VALUES (${storyId}, ${userFingerprint}, ${emoji})
      ON CONFLICT (story_id, user_fingerprint) 
      DO UPDATE SET emoji = ${emoji}, reacted_at = NOW()
    `;
    
    return true;
  } catch (error) {
    console.error('Error reacting to story:', error);
    return false;
  }
}

export async function getUserStories(
  userFingerprint: string
): Promise<RoastStory[]> {
  const result = await sql`
    SELECT 
      rs.*,
      COUNT(DISTINCT sr.id) as reaction_count
    FROM roast_stories rs
    LEFT JOIN story_reactions sr ON rs.id = sr.story_id
    WHERE rs.user_fingerprint = ${userFingerprint}
      AND rs.is_active = true
      AND rs.expires_at > NOW()
    GROUP BY rs.id
    ORDER BY rs.created_at DESC
  `;
  
  return result.rows as RoastStory[];
}

export async function cleanupExpiredStories(): Promise<number> {
  const result = await sql`
    DELETE FROM roast_stories
    WHERE expires_at < NOW() AND is_active = true
  `;
  
  return result.rowCount || 0;
}

// Utility: Upload image to storage (placeholder - implement with your preferred service)
export async function uploadImage(imageFile: File): Promise<string> {
  // TODO: Implement image upload to Vercel Blob, Cloudinary, or S3
  // For now, return a placeholder
  // In production, you would:
  // 1. Upload to storage service
  // 2. Return the public URL
  
  throw new Error('Image upload not implemented. Please configure Vercel Blob or another storage service.');
}
