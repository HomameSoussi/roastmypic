import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Require authentication
    await requireAuth();

    // Get total roasts
    const totalRoastsResult = await sql`
      SELECT COUNT(*) as count FROM public_roasts WHERE is_active = true
    `;
    const totalRoasts = parseInt(totalRoastsResult.rows[0]?.count || '0');

    // Get total votes
    const totalVotesResult = await sql`
      SELECT SUM(votes) as total FROM public_roasts WHERE is_active = true
    `;
    const totalVotes = parseInt(totalVotesResult.rows[0]?.total || '0');

    // Get total stories
    const totalStoriesResult = await sql`
      SELECT COUNT(*) as count FROM roast_stories 
      WHERE expires_at > NOW()
    `;
    const totalStories = parseInt(totalStoriesResult.rows[0]?.count || '0');

    // Get total story views
    const totalStoryViewsResult = await sql`
      SELECT COUNT(*) as count FROM story_views
    `;
    const totalStoryViews = parseInt(totalStoryViewsResult.rows[0]?.count || '0');

    // Get roasts by style
    const roastsByStyleResult = await sql`
      SELECT roast_style, COUNT(*) as count 
      FROM public_roasts 
      WHERE is_active = true
      GROUP BY roast_style
      ORDER BY count DESC
    `;

    // Get top roasts
    const topRoastsResult = await sql`
      SELECT id, roast_text, roast_style, votes, created_at
      FROM public_roasts
      WHERE is_active = true
      ORDER BY votes DESC
      LIMIT 10
    `;

    // Get recent roasts
    const recentRoastsResult = await sql`
      SELECT id, roast_text, roast_style, votes, created_at
      FROM public_roasts
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 10
    `;

    // Get roasts per day (last 7 days)
    const roastsPerDayResult = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM public_roasts
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    return NextResponse.json({
      success: true,
      stats: {
        totalRoasts,
        totalVotes,
        totalStories,
        totalStoryViews,
        roastsByStyle: roastsByStyleResult.rows,
        topRoasts: topRoastsResult.rows,
        recentRoasts: recentRoastsResult.rows,
        roastsPerDay: roastsPerDayResult.rows,
      },
    });
  } catch (error: any) {
    if (error.message === 'Not authenticated' || error.message === 'Invalid or expired session') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
