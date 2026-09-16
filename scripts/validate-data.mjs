import { openDb } from '../server/db.js';
import { seedIfEmpty, validateDb } from '../server/seed.js';
import { VALIDATION } from '../src/data/hardcoded.js';

const db = openDb();
const result = seedIfEmpty(db, {
  adminEmail: process.env.ADMIN_EMAIL || 'admin@sadad.local',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@12345',
  adminName: 'مدیر سیستم',
});

const v = result.validation || validateDb(db);
console.log(JSON.stringify({ seeded: result.seeded, validation: v, expected: VALIDATION }, null, 2));
process.exit(v.ok ? 0 : 1);
