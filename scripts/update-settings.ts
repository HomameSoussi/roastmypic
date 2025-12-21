/**
 * Script to update platform settings with expert-level content
 * Run with: npx tsx scripts/update-settings.ts
 */

import { sql } from '@vercel/postgres';

async function updateSettings() {
  console.log('🚀 Updating platform settings with expert-level content...\n');

  try {
    // 1. Update Announcement Banner
    await sql`
      UPDATE platform_settings 
      SET value = ${{
        text: '🎉 New Feature: Get roasted in 6 hilarious styles! Try Dark Humor & Moroccan Darija now!'
      }}::jsonb
      WHERE key = 'announcement_banner'
    `;
    console.log('✅ Updated announcement banner');

    // 2. Update Landing Page Headline
    await sql`
      UPDATE platform_settings 
      SET value = ${{
        text: 'Get Roasted by AI in Seconds'
      }}::jsonb
      WHERE key = 'landing_page_headline'
    `;
    console.log('✅ Updated landing page headline');

    // 3. Update Landing Page Subheadline
    await sql`
      UPDATE platform_settings 
      SET value = ${{
        text: 'Upload your photo and choose from 6 unique roast styles. From clean humor to dark comedy, we\'ve got the perfect roast for everyone!'
      }}::jsonb
      WHERE key = 'landing_page_subheadline'
    `;
    console.log('✅ Updated landing page subheadline');

    // 4. Update CTA Button
    await sql`
      UPDATE platform_settings 
      SET value = ${{
        text: 'Get Roasted Now 🔥'
      }}::jsonb
      WHERE key = 'landing_page_cta_button'
    `;
    console.log('✅ Updated CTA button');

    // 5. Update Theme Colors - Modern Purple/Pink Gradient
    await sql`
      UPDATE platform_settings 
      SET value = ${{
        hex: '#A855F7'
      }}::jsonb
      WHERE key = 'primary_color'
    `;
    console.log('✅ Updated primary color to vibrant purple');

    await sql`
      UPDATE platform_settings 
      SET value = ${{
        hex: '#1E1B4B'
      }}::jsonb
      WHERE key = 'background_gradient_start'
    `;
    console.log('✅ Updated background gradient start');

    await sql`
      UPDATE platform_settings 
      SET value = ${{
        hex: '#0F172A'
      }}::jsonb
      WHERE key = 'background_gradient_end'
    `;
    console.log('✅ Updated background gradient end');

    // 6. Update Roast Styles with improved prompts
    const roastStyles = [
      {
        name: 'moroccan_darija',
        label: 'Moroccan Darija 🇲🇦',
        prompt: 'You are a witty Moroccan comedian. Roast this photo using Moroccan Darija (Arabic dialect). Be funny, creative, and use local humor. Mix Arabic and French words naturally. Keep it lighthearted and culturally relevant.',
        badgeColor: '#DC2626',
        active: true
      },
      {
        name: 'clean_funny',
        label: 'Clean & Funny 😄',
        prompt: 'You are a family-friendly comedian. Roast this photo with clever, clean humor that anyone can enjoy. Be witty and creative without being offensive. Focus on funny observations and playful teasing.',
        badgeColor: '#10B981',
        active: true
      },
      {
        name: 'dark_humor',
        label: 'Dark Humor 😈',
        prompt: 'You are a savage comedian with dark humor. Roast this photo with edgy, sarcastic, and brutally honest commentary. Be creative and witty, but stay within acceptable boundaries. Make it memorable!',
        badgeColor: '#7C3AED',
        active: true
      },
      {
        name: 'flirty',
        label: 'Flirty & Playful 💕',
        prompt: 'You are a charming, flirty comedian. Roast this photo with playful, romantic humor. Be witty and teasing in a fun, lighthearted way. Make them smile while gently poking fun.',
        badgeColor: '#EC4899',
        active: true
      },
      {
        name: 'corporate',
        label: 'Corporate Roast 💼',
        prompt: 'You are a professional comedian roasting in a corporate setting. Use business jargon, office humor, and professional language to deliver a sophisticated roast. Be clever and witty while maintaining professionalism.',
        badgeColor: '#3B82F6',
        active: true
      },
      {
        name: 'muslim_friendly',
        label: 'Muslim-Friendly 🌙',
        prompt: 'You are a respectful comedian creating halal humor. Roast this photo with clean, culturally sensitive jokes that align with Islamic values. Be creative and funny while maintaining respect and dignity.',
        badgeColor: '#059669',
        active: true
      }
    ];

    await sql`
      UPDATE platform_settings 
      SET value = ${JSON.stringify(roastStyles)}::jsonb
      WHERE key = 'roast_styles'
    `;
    console.log('✅ Updated roast styles with improved prompts');

    // 7. Enable Analytics Tracking
    await sql`
      INSERT INTO platform_settings (key, value, description, "group")
      VALUES (
        'enable_analytics',
        '{"enabled": true}'::jsonb,
        'Enable analytics tracking for user behavior',
        'features'
      )
      ON CONFLICT (key) 
      DO UPDATE SET value = '{"enabled": true}'::jsonb
    `;
    console.log('✅ Enabled analytics tracking');

    console.log('\n🎉 All settings updated successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('   - Announcement banner: Professional welcome message');
    console.log('   - Headlines: Clear, action-oriented copy');
    console.log('   - Theme: Modern purple gradient');
    console.log('   - Roast styles: Enhanced prompts for better AI responses');
    console.log('   - Analytics: Enabled for user behavior tracking');
    console.log('\n✨ Your platform is now optimized and ready to scale!');

  } catch (error) {
    console.error('❌ Error updating settings:', error);
    throw error;
  }
}

// Run the script
updateSettings();
