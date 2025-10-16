import 'dotenv/config';
import {
	REST,
	Routes,
	type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point at your source commands
const commandsRoot = path.join(__dirname, 'src', 'commands');

const token = process.env.CLIENT_TOKEN ? process.env.CLIENT_TOKEN : '';
const clientId = process.env.CLIENT_ID ? process.env.CLIENT_ID : '';
const guildId = process.env.GUILD_ID;

if (!token) throw new Error('Missing CLIENT_TOKEN/DISCORD_TOKEN');
if (!clientId) throw new Error('Missing CLIENT_ID');

function walk(dir: string): string[] {
	const out: string[] = [];
	if (!fs.existsSync(dir)) return out;
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) out.push(...walk(full));
		else if (entry.isFile() && (full.endsWith('.ts') || full.endsWith('.js'))) out.push(full);
	}
	return out;
}

type MaybeCommandModule =
  | { default?: any; command?: any }
  | { default?: { data?: any; execute?: any } }
  | { command?: { data?: any; execute?: any } };

async function toJson(filePath: string): Promise<RESTPostAPIChatInputApplicationCommandsJSONBody | null> {
	const mod = (await import(pathToFileURL(filePath).href)) as MaybeCommandModule;
	const c = (mod as any).default ?? (mod as any).command ?? mod;
	const data = c?.data ?? c;
	if (data && typeof data.toJSON === 'function') {
		return data.toJSON() as RESTPostAPIChatInputApplicationCommandsJSONBody;
	}
	if (data?.name) {
		// minimal fallback to avoid hard failure if someone exported plain objects
		return { name: data.name, description: data.description ?? 'No description', type: 1 } as any;
	}
	console.warn(`[WARN] Skipping ${filePath}: no builder .toJSON() found`);
	return null;
}

async function main(): Promise<void> {
	const files = walk(commandsRoot);
	const bodies: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

	for (const f of files) {
		try {
			const json = await toJson(f);
			if (json) bodies.push(json);
		}
		catch (e) {
			console.error(`[ERROR] Failed to load ${f}`, e);
		}
	}

	const rest = new REST({ version: '10' }).setToken(token);
	const route = guildId
		? Routes.applicationGuildCommands(clientId, guildId)
		: Routes.applicationCommands(clientId);

	console.log(`Deploying ${bodies.length} command(s) to ${guildId ? `guild ${guildId}` : 'GLOBAL'}…`);
	const data = (await rest.put(route, { body: bodies })) as unknown as any[];
	console.log(`✅ Successfully reloaded ${Array.isArray(data) ? data.length : 0} command(s).`);
}

main().catch((e) => {
	console.error('Deploy failed:', e);
	process.exit(1);
});
