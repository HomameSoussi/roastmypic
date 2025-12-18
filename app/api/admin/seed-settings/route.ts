import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Create the platform_settings table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        "group" VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Clear existing settings to prevent duplicates on re-runs
    await sql`DELETE FROM platform_settings`;

    // 3. Insert all settings in a single transaction
    await sql`
      INSERT INTO platform_settings (key, value, "group", description) VALUES
      -- Content Settings
      ('landing_page_headline', '{"text": "Get Hilariously Roasted by AI"}', 'content', 'The main H1 title on the homepage.'),
      ('landing_page_subheadline', '{"text": "Upload your photo and let our AI roast you in 6 different styles. Share the laughs with your friends!"}', 'content', 'The supporting text below the main headline.'),
      ('landing_page_cta_button', '{"text": "Roast Me Now!"}', 'content', 'The text for the primary call-to-action button.'),
      ('leaderboard_page_title', '{"text": "Public Roasts Leaderboard"}', 'content', 'The title of the leaderboard page.'),
      ('announcement_banner', '{"text": "🔥 Now with Dark Humor! Try our most requested roast style.", "color": "#8B5CF6", "link": "/"}', 'content', 'Site-wide announcement banner. Can include text, color, and a link.'),
      
      -- Theme Settings
      ('primary_color', '{"hex": "#F472B6"}', 'theme', 'The main brand color for buttons, links, and accents.'),
      ('background_gradient_start', '{"hex": "#1D243A"}', 'theme', 'The starting color of the background gradient.'),
      ('background_gradient_end', '{"hex": "#0F172A"}', 'theme', 'The ending color of the background gradient.'),
      ('site_logo_url', '{"url": "/logo.png"}', 'theme', 'URL for the main site logo. Can be an internal or external link.'),

      -- Feature Toggles
      ('enable_leaderboard', '{"enabled": true}', 'features', 'Toggle the entire leaderboard feature on or off.'),
      ('enable_stories', '{"enabled": true}', 'features', 'Toggle the 24-hour stories feature on or off.'),
      ('enable_voting', '{"enabled": true}', 'features', 'Toggle the voting functionality on public roasts.'),

      -- Roast Configuration
      ('roast_styles', '[{"name": "Moroccan Darija", "prompt": "Roast this person in Moroccan Darija, using authentic and funny slang.", "badge_color": "#D97706", "is_active": true}, {"name": "Clean Funny", "prompt": "Roast this person with light-hearted, clean humor suitable for all audiences.", "badge_color": "#059669", "is_active": true}, {"name": "Dark Humor", "prompt": "Roast this person using dark humor. Be edgy and merciless.", "badge_color": "#7F1D1D", "is_active": true}, {"name": "Flirty", "prompt": "Roast this person in a flirty, charming, and playful way.", "badge_color": "#BE185D", "is_active": true}, {"name": "Corporate", "prompt": "Roast this person using only corporate jargon, buzzwords, and office clichés.", "badge_color": "#1E40AF", "is_active": true}, {"name": "Muslim-Friendly", "prompt": "Roast this person with halal humor that is respectful and avoids sensitive topics.", "badge_color": "#166534", "is_active": true}]', 'roasts', 'Manage the available roast styles. Add, edit, or disable styles.'),
      ('default_make_public', '{"enabled": true}', 'roasts', 'The default checked state of the "Make Public" checkbox on the upload form.'),
      ('default_share_story', '{"enabled": false}', 'roasts', 'The default checked state of the "Share as 24h Story" checkbox.'),

      -- Monetization Settings
      ('enable_paywall', '{"enabled": false}', 'monetization', 'Activate a paywall to limit features for non-paying users.'),
      ('free_roasts_limit', '{"limit": 5}', 'monetization', 'Number of free roasts a user gets per day before hitting the paywall.');
    `;

    // 4. Create the function for automatically updating the updated_at timestamp
    try {
      await sql`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql'
      `;
    } catch (e) {
      console.log('Function already exists or error:', e);
    }

    // 5. Create the trigger to call the function before any update
    try {
      await sql`DROP TRIGGER IF EXISTS update_platform_settings_updated_at ON platform_settings`;
      await sql`
        CREATE TRIGGER update_platform_settings_updated_at
        BEFORE UPDATE ON platform_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
      `;
    } catch (e) {
      console.log('Trigger already exists or error:', e);
    }

    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
