import type { SQL } from 'bun';

export type MigrationRecord = {
	id: string;
}

export type Migration = {
	up: (pg: SQL) => Promise<void>,
	down: (pg: SQL) => Promise<void>,
}