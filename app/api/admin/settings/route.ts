import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Verify admin authentication
async function verifyAdmin(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session');
  
  if (!token) {
    return false;
  }
  
  // In a real app, verify JWT token here
  // For now, just check if it exists
  return true;
}

// GET: Fetch all settings grouped by category
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT * FROM platform_settings
      ORDER BY "group", key
    `;

    // Group settings by category
    const grouped = result.rows.reduce((acc: any, row: any) => {
      if (!acc[row.group]) {
        acc[row.group] = [];
      }
      acc[row.group].push({
        id: row.id,
        key: row.key,
        value: row.value,
        description: row.description,
        updated_at: row.updated_at
      });
      return acc;
    }, {});

    return NextResponse.json({ settings: grouped });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT: Update multiple settings at once
export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { updates } = await request.json();

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Invalid request format. Expected { updates: [...] }' },
        { status: 400 }
      );
    }

    // Update each setting
    for (const update of updates) {
      const { key, value } = update;
      
      await sql`
        UPDATE platform_settings
        SET value = ${JSON.stringify(value)}::jsonb
        WHERE key = ${key}
      `;
    }

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      updated_count: updates.length 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: Create a new setting
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key, value, group, description } = await request.json();

    if (!key || !value || !group) {
      return NextResponse.json(
        { error: 'Missing required fields: key, value, group' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO platform_settings (key, value, "group", description)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb, ${group}, ${description || ''})
      RETURNING *
    `;

    return NextResponse.json({ 
      message: 'Setting created successfully',
      setting: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating setting:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a setting by key
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required parameter: key' },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM platform_settings
      WHERE key = ${key}
    `;

    return NextResponse.json({ 
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
