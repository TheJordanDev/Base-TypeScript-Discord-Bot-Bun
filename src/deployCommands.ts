import type { BotCommand, BotModule } from '@/types';
import { REST, Routes, type RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import FS from 'fs/promises';
import { fileURLToPath } from 'node:url';
import PATH from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = PATH.dirname(__filename);

async function loadAllCommands() : Promise<RESTPostAPIChatInputApplicationCommandsJSONBody[]> {
	const commands = new Map<string, BotCommand>();

	function hasCommand(command : BotCommand) : boolean {
		return command.data.name in commands.keys();
	}

	function validateCommand(command : BotCommand) : boolean {
		if (!('data' in command) || !('execute' in command)) return false;
		return true;
	}

	function addCommand(command : BotCommand) : void {
		commands.set(command.data.name, command);
	}

	await loadRootCommands(addCommand, hasCommand, validateCommand);
	await loadModulesCommands(addCommand, hasCommand, validateCommand);
	return commands.values().map((command) => command.data.toJSON()).toArray();
}

async function loadRootCommands(
	addCommand:(command : BotCommand) => void,
	hasCommand : (command : BotCommand) => boolean,
	validateCommand: (command : BotCommand) => boolean,
) : Promise<void> {
	const foldersPath = PATH.join(__dirname, 'commands');
	const commandFiles = (await FS.readdir(foldersPath)).filter((file) => file.endsWith('.ts'));
	for (const file of commandFiles) {
		const filePath = PATH.join(foldersPath, file);
		const commandModule = await import(filePath);
		const command: BotCommand = commandModule.default ?? commandModule;
		if (!hasCommand(command) && validateCommand(command)) addCommand(command);
	}
}

async function loadModulesCommands(
	addCommand:(command : BotCommand) => void,
	hasCommand : (command : BotCommand) => boolean,
	validateCommand: (command : BotCommand) => boolean,
) : Promise<void> {
	const foldersPath = PATH.join(__dirname, 'modules');
	const moduleFolders = await FS.readdir(foldersPath);
	for (const folder of moduleFolders) {
		const modulesPath = PATH.join(foldersPath, folder);
		const moduleFiles = (await FS.readdir(modulesPath)).filter((file) => PATH.basename('main') && file.endsWith('.ts'));
		for (const file of moduleFiles) {
			const filePath = PATH.join(modulesPath, file);
			const moduleModule = await import(filePath);
			const module : BotModule = moduleModule.default ?? moduleModule;
			if ('commands' in module && Array.isArray(module.commands)) {
				for (const command of module.commands) {
					if (!hasCommand(command) && validateCommand(command)) addCommand(command);
				}
			}
		}
	}
}

async function deployCommands() {
	const commandsData = await loadAllCommands();

	const DISCORD_TOKEN : string | undefined = process.env.DISCORD_TOKEN;
	if (!DISCORD_TOKEN) {
		console.log('No token specified');
		return;
	}
	const CLIENT_ID : string | undefined = process.env.CLIENT_ID;
	if (!CLIENT_ID) {
		console.log('No client ID specified');
		return;
	}

	const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

	try {
		console.log(`Started refreshing ${commandsData.length} application (/) commands.`);
		const data = await rest.put(
			Routes.applicationCommands(CLIENT_ID),
			{ body: commandsData },
		);
		console.log(`Successfully reloaded ${Array.isArray(data) ? data.length : 0} application (/) commands.`);
	}
	catch (error) {
		console.error(error);
	}
}

deployCommands().catch((err) => {
	console.error('Failed to deploy commands:', err);
});
