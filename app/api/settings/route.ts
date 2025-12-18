import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// GET: Fetch all non-sensitive settings for public consumption
export async function GET() {
  try {
    const result = await sql`
      SELECT key, value FROM platform_settings
      ORDER BY "group", key
    `;

    // Convert to a simple key-value object for easy frontend consumption
    const settings = result.rows.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    return NextResponse.json({ settings }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
