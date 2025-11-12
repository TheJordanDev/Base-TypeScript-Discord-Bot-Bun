import type { BotModule } from '@/types';
import { testCommand } from './commands/testCommand';

export default {
	name: 'Test Module',
	commands: [
		testCommand,
	],
	events: [],
} as BotModule;