import { NextRequest, NextResponse } from 'next/server';
import { createPublicRoast, getLeaderboard, generateFingerprint } from '@/lib/db';

// POST - Submit a roast to public leaderboard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, roastText, roastStyle, language } = body;

    if (!imageUrl || !roastText || !roastStyle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userFingerprint = generateFingerprint(request);

    const roast = await createPublicRoast(
      imageUrl,
      roastText,
      roastStyle,
      language || 'en',
      userFingerprint
    );

    return NextResponse.json({
      success: true,
      roast
    });
  } catch (error) {
    console.error('Error creating public roast:', error);
    return NextResponse.json(
      { error: 'Failed to create public roast' },
      { status: 500 }
    );
  }
}

// GET - Get leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const userFingerprint = generateFingerprint(request);

    const roasts = await getLeaderboard(limit, offset, userFingerprint);

    return NextResponse.json({
      success: true,
      roasts,
      pagination: {
        limit,
        offset,
        hasMore: roasts.length === limit
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
