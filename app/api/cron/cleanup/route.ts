import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredStories } from '@/lib/db';


// GET - Cleanup expired stories (called by Vercel Cron)
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const deletedCount = await cleanupExpiredStories();

    return NextResponse.json({
      success: true,
      deletedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error cleaning up expired stories:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup expired stories' },
      { status: 500 }
    );
  }
}
