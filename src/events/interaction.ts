import type Bot from '@/bot';
import type { BotEvent } from '@/types';
import type { CommandInteraction, Interaction } from 'discord.js';
import { Events } from 'discord.js';

async function onCommandInteraction(interaction : CommandInteraction) {
	const bot = interaction.client as Bot;
	const command = bot.commands.get(interaction.commandName);

	if (!command) return;
	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(`Error executing ${interaction.commandName}`);
		console.error(error);
	}

}

export default {
	name: Events.InteractionCreate,
	async execute(interaction : Interaction) {
		if (interaction.isChatInputCommand()) {
			await onCommandInteraction(interaction);
		}
	},
} as BotEvent;
