import type { BotCommand } from '@/types';
import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export const testCommand = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('Test'),
	async execute(interaction: CommandInteraction) {
		await interaction.reply('Test!');
	},
} as BotCommand;