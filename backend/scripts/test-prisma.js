// Simple Prisma connectivity test (JS to avoid compilation step)
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    // Simple raw query that should work on Postgres
    const res = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Prisma raw query result:', res);
    // Try a basic client call - count tables (if any table exists) as a gentle test
    const count = await prisma.$queryRaw`SELECT count(*)::int AS cnt FROM information_schema.tables WHERE table_schema='public'`;
    console.log('Number of tables in public schema:', count);
    console.log('Prisma OK');
  } catch (err) {
    console.error('Prisma test failed:', err);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

main();
