/**
 * Utility script to generate bcrypt password hashes
 * Usage: npx tsx scripts/generate-password-hash.ts <password>
 */

import bcrypt from 'bcryptjs';

async function generateHash(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('\n🔐 Password Hash Generated Successfully!\n');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n📋 Add this to your .env.local file:');
  console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
  console.log('\n');
}

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Please provide a password as an argument');
  console.log('Usage: npx tsx scripts/generate-password-hash.ts <password>');
  process.exit(1);
}

generateHash(password);
