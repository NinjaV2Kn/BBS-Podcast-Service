#!/usr/bin/env node
/**
 * Migration runner script
 * This bypasses PowerShell execution policy issues
 */

const { execFile } = require('child_process');
const path = require('path');

console.log('🚀 Running Prisma migrations...\n');

// Use the .cmd version on Windows
const prismaBinary = process.platform === 'win32' 
  ? path.join(__dirname, 'node_modules', '.bin', 'prisma.cmd')
  : path.join(__dirname, 'node_modules', '.bin', 'prisma');

const prisma = execFile(prismaBinary, ['migrate', 'deploy'], {
  cwd: __dirname,
  stdio: 'inherit',
});

prisma.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Migrations completed successfully!');
    process.exit(0);
  } else {
    console.error(`\n❌ Migration failed with code ${code}`);
    process.exit(1);
  }
});
