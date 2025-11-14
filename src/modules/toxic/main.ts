import { type BotCommand, type BotEvent, type BotModule } from '@/types';

export class ToxicModule implements BotModule {
	private static instance: ToxicModule | null = null;
	public static getInstance() : ToxicModule | null { return ToxicModule.instance; }

	name: string;
	commands: BotCommand[];
	events: BotEvent[];

	constructor() {
		ToxicModule.instance = this;
		this.name = 'Toxic Module';
		this.commands = [];
		this.events = [];
	}
}

export default new ToxicModule();