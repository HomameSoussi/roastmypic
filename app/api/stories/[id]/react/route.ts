import { NextRequest, NextResponse } from 'next/server';
import { reactToStory, generateFingerprint } from '@/lib/db';


// POST - React to a story
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params;
    const body = await request.json();
    const { emoji } = body;

    if (!emoji) {
      return NextResponse.json(
        { error: 'Missing emoji' },
        { status: 400 }
      );
    }

    const userFingerprint = generateFingerprint(request);

    const success = await reactToStory(storyId, userFingerprint, emoji);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to react to story' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error reacting to story:', error);
    return NextResponse.json(
      { error: 'Failed to react to story' },
      { status: 500 }
    );
  }
}
