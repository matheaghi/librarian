import { Events, type Interaction } from 'discord.js';
import type { SlashCommand } from '../types/command.js';

type EventModule = {
  name: typeof Events.InteractionCreate;
  once?: boolean;
  execute(interaction: Interaction): Promise<void>;
};

const event: EventModule = {
	name: Events.InteractionCreate,
	async execute(interaction: Interaction): Promise<void> {
		if (!interaction.isChatInputCommand()) return;

		const command: SlashCommand | undefined =
      interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		}
		catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				});
			}
			else {
				await interaction.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				});
			}
		}
	},
};

export default event;