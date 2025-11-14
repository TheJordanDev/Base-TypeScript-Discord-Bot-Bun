import type { BotEvent } from '@/types';
import { Events, Message } from 'discord.js';

export default {
	name: Events.MessageCreate,
	async execute(message: Message) {
		console.log('New Message ' + message.content);
	},
} as BotEvent;