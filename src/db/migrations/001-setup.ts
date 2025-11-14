import { SQL } from 'bun';
import type { Migration } from '../types';

export default {
	async up(pg: SQL) {
		await pg`CREATE TABLE users (
			id SERIAL PRIMARY KEY,
			name TEXT NOT NULL,
			email TEXT UNIQUE NOT NULL
		);`;
	},
	async down(pg: SQL) {
		await pg`DROP TABLE users;`;
	},
} as Migration;
