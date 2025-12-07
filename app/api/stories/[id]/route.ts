import { NextRequest, NextResponse } from 'next/server';
import { getStoryById, viewStory, reactToStory, generateFingerprint } from '@/lib/db';

export const runtime = 'edge';

// GET - Get a specific story
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params;
    const userFingerprint = generateFingerprint(request);

    const story = await getStoryById(storyId, userFingerprint);

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found or expired' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      story
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}
