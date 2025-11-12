import type { BotCommand } from '@/types';
import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Ping'),
	async execute(interaction: CommandInteraction) {
		await interaction.reply('Pong!');
	},
} as BotCommand;
