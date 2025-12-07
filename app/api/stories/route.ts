import { NextRequest, NextResponse } from 'next/server';
import { createStory, getActiveStories, generateFingerprint } from '@/lib/db';

export const runtime = 'edge';

// POST - Create a new story
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, roastText, roastStyle, language, username } = body;

    if (!imageUrl || !roastText || !roastStyle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userFingerprint = generateFingerprint(request);

    const story = await createStory(
      imageUrl,
      roastText,
      roastStyle,
      language || 'en',
      userFingerprint,
      username
    );

    return NextResponse.json({
      success: true,
      story
    });
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    );
  }
}

// GET - Get all active stories
export async function GET(request: NextRequest) {
  try {
    const userFingerprint = generateFingerprint(request);

    const stories = await getActiveStories(userFingerprint);

    return NextResponse.json({
      success: true,
      stories
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
