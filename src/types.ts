import type { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export type BotCommand = {
	data: SlashCommandBuilder,
	execute(interaction: CommandInteraction): Promise<void>
}

export type BotEvent = {
	name: string,
	once: boolean,
	execute: (...args: unknown[]) => unknown;
}

export type BotModule = {
	name: string,
	commands: BotCommand[],
	events: BotEvent[]
}