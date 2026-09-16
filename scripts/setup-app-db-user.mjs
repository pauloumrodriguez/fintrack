import { Client } from 'pg';

try { process.loadEnvFile(); } catch { /* CI may inject environment variables. */ }

const ownerUrl = process.env.MIGRATION_DATABASE_URL;
const password = process.env.APP_DATABASE_PASSWORD;
if (!ownerUrl || !password || !/^[a-f0-9]{64}$/.test(password)) {
  throw new Error('MIGRATION_DATABASE_URL and a 64-character hex APP_DATABASE_PASSWORD are required');
}

const client = new Client({ connectionString: ownerUrl });
try {
  await client.connect();
  // The strict hex check above makes this interpolation safe in ALTER ROLE.
  await client.query(`ALTER ROLE fintrack_app LOGIN NOBYPASSRLS PASSWORD '${password}'`);
  process.stdout.write('Application database role is ready.\n');
} finally {
  await client.end();
}
