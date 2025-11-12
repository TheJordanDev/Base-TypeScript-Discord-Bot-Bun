import type Bot from '@/bot';
import type { BotEvent } from '@/types';
import { Events } from 'discord.js';

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client : Bot) {
		console.log(`Ready! Logged in as ${client?.user?.tag}`);
	},
} as BotEvent;
