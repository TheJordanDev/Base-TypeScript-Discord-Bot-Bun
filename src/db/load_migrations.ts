import { SQL } from 'bun';
import fs from 'fs/promises';
import path from 'path';
import type { Migration, MigrationRecord } from './types';

const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) {
	console.error('Missing POSTGRES_URL');
	process.exit(1);
}


const pg = new SQL(POSTGRES_URL);

async function getAppliedMigrations(): Promise<Set<string>> {
	await pg`
		CREATE TABLE IF NOT EXISTS migrations (
			id TEXT PRIMARY KEY,
			applied_at TIMESTAMP DEFAULT NOW()
		)
	`;
	const rows: MigrationRecord[] = await pg`SELECT id FROM migrations`;
	return new Set(rows.map(row => row.id));
}

async function recordMigration(id: string) {
	await pg`INSERT INTO migrations (id) VALUES (${id})`;
}

async function runMigrations() {
	const applied = await getAppliedMigrations();
	const migrationFiles = (await fs.readdir(path.join(__dirname, 'migrations')))
		.filter(f => f.endsWith('.ts') || f.endsWith('.js'))
		.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

	for (const file of migrationFiles) {
		const id = file;
		if (applied.has(id)) {
			console.log(`Skipping applied migration: ${id}`);
			continue;
		}
		console.log(`Running migration: ${id}`);
		const mod = await import(path.join(__dirname, 'migrations', file));
		const migration = mod.default as Migration ?? mod;
		if ('up' in migration) {
			await migration.up(pg);
			await recordMigration(id);
			console.log(`Migration ${id} applied.`);
		}
		else {
			console.warn(`Migration ${id} does not export an 'up' function`);
		}
	}
}

runMigrations().catch((err) => {
	console.error('Migration failed:', err);
	process.exit(1);
});
