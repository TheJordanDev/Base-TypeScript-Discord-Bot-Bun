import type { BotCommand, BotEvent, BotModule } from '@/types';
import { Client, Collection, IntentsBitField } from 'discord.js';
import FS from 'fs/promises';
import PATH from 'path';

class Bot extends Client {

	commands: Collection<string, BotCommand>;

	constructor() {
		super({
			intents: (Object.keys(IntentsBitField.Flags) as (keyof typeof IntentsBitField.Flags)[])
				.map(key => IntentsBitField.Flags[key]),
		});
		this.commands = new Collection();
	}

	async init() : Promise<void> {
		await this.loadCommands();
		await this.loadEvents();
		await this.loadModules();
	}

	async loadCommands() : Promise<void> {
		const foldersPath = PATH.join(__dirname, 'commands');
		const commandFiles = (await FS.readdir(foldersPath)).filter((file) => file.endsWith('.ts'));
		for (const file of commandFiles) {
			const filePath = PATH.join(foldersPath, file);
			const commandModule = await import(filePath);
			const command: BotCommand = commandModule.default ?? commandModule;
			this.loadCommand(command, filePath);
		}
	}

	async loadEvents() : Promise<void> {
		const foldersPath = PATH.join(__dirname, 'events');
		const eventFiles = (await FS.readdir(foldersPath)).filter((file) => file.endsWith('.ts'));
		for (const file of eventFiles) {
			const filePath = PATH.join(foldersPath, file);
			const eventModule = await import(filePath);
			const event : BotEvent = eventModule.default ?? eventModule;
			this.loadEvent(event, filePath);
		}
	}

	async loadModules() : Promise<void> {
		const foldersPath = PATH.join(__dirname, 'modules');
		const moduleFolders = await FS.readdir(foldersPath);
		for (const folder of moduleFolders) {
			const modulesPath = PATH.join(foldersPath, folder);
			const moduleFiles = (await FS.readdir(modulesPath)).filter((file) => PATH.basename('main') && file.endsWith('.ts'));
			for (const file of moduleFiles) {
				const filePath = PATH.join(modulesPath, file);
				const moduleModule = await import(filePath);
				const module : BotModule = moduleModule.default ?? moduleModule;
				this.loadModule(module, filePath);
			}
		}
	}

	private loadCommand(command : BotCommand, filePath?: string) {
		if (!('data' in command) || !('execute' in command)) {
			console.log(`[WARNING] The command at ${filePath ?? 'UNKNOWN'} is missing a required "data" or "execute" property.`);
		}
		if ('data' in command && 'execute' in command) {
			if (command.data.name in client.commands.keys()) {
				console.log(`[WARNING] The command ${command.data.name} is already registered.`);
				return;
			}
			client.commands.set(command.data.name, command);
		}
	}

	private loadEvent(event: BotEvent, filePath?: string) {
		if (!('name' in event) || !('execute' in event)) {
			console.log(`[WARNING] The event at ${filePath ?? 'UNKNOWN'} is missing a required "name" or "execute" property.`);
			return;
		}
		if ('once' in event && event.once) this.once(event.name, event.execute);
		else this.on(event.name, event.execute);
	}

	private loadModule(module: BotModule, filePath?: string) {
		if (!('name' in module)) {
			console.log(`[WARNING] The event at ${filePath ?? 'UNKNOWN'} is missing a required "name" or "execute" property.`);
			return;
		}
		if (module.commands) {
			for (const command of module.commands) this.loadCommand(command);
		}
		if (module.events) {
			for (const event of module.events) this.loadEvent(event);
		}
		console.log(`Loaded module: ${module.name}`);
	}

}
const client = new Bot();
(async () => {
	await client.init();
	client.login(process.env.DISCORD_TOKEN);
})();

export default Bot;