import { createAudioResource, type AudioResource } from '@discordjs/voice';
import type { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { stream } from 'play-dl';

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

export type SongData = {
	url: string;
	title?: string | undefined;
	duration: number;
}

export class Song {
	public readonly url: string;
	public readonly title?: string | undefined;
	public readonly duration: number;

	public constructor({ url, title, duration }: SongData) {
		this.url = url;
		this.title = title;
		this.duration = duration;
	}

	public async makeResource(): Promise<AudioResource<Song> | void> {
		let playStream;

		const source = this.url.includes('youtube') ? 'youtube' : 'soundcloud';

		if (source === 'youtube') {
			playStream = await stream(this.url);
		}

		if (!playStream) return;
		return createAudioResource(playStream.stream, { metadata: this, inputType: playStream.type, inlineVolume: true });
	}
}