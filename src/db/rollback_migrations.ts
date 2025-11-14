import { SQL } from 'bun';
import path from 'path';
import type { Migration, MigrationRecord } from './types';

const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) {
	console.error('Missing POSTGRES_URL');
	process.exit(1);
}
const pg = new SQL(POSTGRES_URL);

async function getAppliedMigrations(): Promise<string[]> {
	await pg`
    CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT NOW()
    )
  `;
	const rows = await pg`SELECT id, applied_at FROM migrations ORDER BY applied_at DESC LIMIT 1`;
	return rows.map((r: MigrationRecord) => r.id);
}

async function removeMigrationRecord(id: string) {
	await pg`DELETE FROM migrations WHERE id = ${id}`;
}

// Load the migration module and extract its down
async function loadMigrationDown(file: string): Promise<((pg: SQL) => Promise<void>) | null> {
	try {
		const modulePath = path.join(__dirname, 'migrations', file);
		const mod = await import(modulePath);
		const migration = mod.default as Migration ?? mod;
		if (migration && typeof migration.down === 'function') {
			return migration.down as (pg: SQL) => Promise<void>;
		}
	}
	catch (e) {
		console.error(`Failed to load migration ${file}:`, e);
	}
	return null;
}

async function rollbackLastApplied() {
	const applied = await getAppliedMigrations();
	if (applied.length === 0) {
		console.log('No migrations have been applied.');
		return;
	}

	const targetId = applied[0];
	if (!targetId) return;

	const downFn = await loadMigrationDown(targetId);
	if (typeof downFn !== 'function') {
		console.error(`Migration ${targetId} does not export a 'down' function`);
		return;
	}

	console.log(`Rolling back latest migration: ${targetId}`);
	try {
		await downFn(pg);
		await removeMigrationRecord(targetId);
		console.log(`Migration ${targetId} rolled back.`);
	}
	catch (err) {
		console.error(`Failed to rollback migration ${targetId}:`, err);
	}
}

// Entry
(async () => {
	await rollbackLastApplied();
	process.exit(0);
})();
