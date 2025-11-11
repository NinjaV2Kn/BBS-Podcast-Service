const { execSync } = require('child_process');

try {
  console.log('🚀 Running Prisma migrations...\n');
  execSync('npm run prisma:deploy', { 
    cwd: __dirname,
    stdio: 'inherit',
    shell: process.platform === 'win32' ? 'powershell.exe' : undefined
  });
  console.log('\n✅ Migrations completed!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
