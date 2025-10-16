import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import type { SlashCommand } from './types/command';

console.log('cwd:', process.cwd());
console.log('DATABASE_URL:', process.env.DATABASE_URL);


// --- Express app (health endpoint) ---
const app = express();
app.get('/', (req: Request, res: Response) => res.send('Bot is running!'));

// --- Discord client ---
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection<string, SlashCommand>();

// utility: import module supporting .default / .command / module itself
function pickExport(mod: any) {
	return mod?.default ?? mod?.command ?? mod ?? null;
}

// --- Load commands (supports .ts and .js) ---
async function loadCommands(): Promise<void> {
	const commandsPath = path.join(__dirname, 'commands');
	if (!fs.existsSync(commandsPath)) {
		console.warn(`[WARN] Commands directory not found: ${commandsPath}`);
		return;
	}

	const commandFolders = fs
		.readdirSync(commandsPath, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name);

	for (const folder of commandFolders) {
		const folderPath = path.join(commandsPath, folder);
		const commandFiles = fs
			.readdirSync(folderPath)
			.filter((f) => (f.endsWith('.ts') || f.endsWith('.js')) && !f.endsWith('.d.ts'));

		for (const file of commandFiles) {
			const fileUrl = pathToFileURL(path.join(folderPath, file)).href;
			try {
				const mod = await import(fileUrl);
				const command: SlashCommand | null = pickExport(mod);
				if (!command?.data || typeof command.execute !== 'function') {
					console.warn(`[WARN] Skipping ${file} — missing "data" or "execute"`);
					continue;
				}

				const name =
          // in practice SlashCommandBuilder carries .name at runtime
          (command.data as any).name ??
          // fallback: derive from JSON
          command.data.toJSON?.().name;

				if (!name) {
					console.warn(`[WARN] Skipping ${file} — could not determine command name`);
					continue;
				}

				client.commands.set(name, command);
			}
			catch (e) {
				console.error(`[ERROR] Failed to load command ${file}:`, e);
			}
		}
	}

	console.log(`Loaded ${client.commands.size} command(s).`);
}

// --- Load events (supports .ts and .js) ---
async function loadEvents(): Promise<void> {
	const eventsPath = path.join(__dirname, 'events');
	if (!fs.existsSync(eventsPath)) {
		console.warn(`[WARN] Events directory not found: ${eventsPath}`);
		return;
	}

	const eventFiles = fs
		.readdirSync(eventsPath)
		.filter((f) => (f.endsWith('.ts') || f.endsWith('.js')) && !f.endsWith('.d.ts'));

	for (const file of eventFiles) {
		const fileUrl = pathToFileURL(path.join(eventsPath, file)).href;
		try {
			const mod = await import(fileUrl);
			const event = pickExport(mod);
			if (!event?.name || typeof event.execute !== 'function') {
				console.warn(`[WARN] Skipping event ${file} — missing "name" or "execute"`);
				continue;
			}

			if (event.once) {
				client.once(event.name, (...args: unknown[]) => event.execute(...args));
			}
			else {
				client.on(event.name, (...args: unknown[]) => event.execute(...args));
			}
		}
		catch (e) {
			console.error(`[ERROR] Failed to load event ${file}:`, e);
		}
	}

	console.log(`Events wired: ${eventFiles.length}`);
}

// --- Boot sequence ---
async function main() {
	await loadCommands();
	await loadEvents();

	// HTTP health listener
	const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
	app.listen(PORT, () => console.log(`HTTP health server on :${PORT}`));

	// Login
	const token = process.env.CLIENT_TOKEN ?? process.env.DISCORD_TOKEN;
	if (!token) {
		console.error('Missing CLIENT_TOKEN/DISCORD_TOKEN');
		process.exit(1);
	}

	await client.login(token);
}

main().catch((err) => {
	console.error('Fatal boot error:', err);
	process.exit(1);
});
