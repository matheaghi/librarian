import { Events, type Client } from 'discord.js';

type EventModule = {
  name: typeof Events.ClientReady;
  once: true;
  execute(client: Client<true>): void | Promise<void>;
};

const event: EventModule = {
	name: Events.ClientReady,
	once: true,
	execute(client: Client<true>): void {
		console.log(`[${new Date().toISOString()}] Ready! Logged in as ${client.user.tag}`);
	},
};

export default event;
