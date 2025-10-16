import { SlashCommandBuilder, InteractionContextType, type ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand } from '../../types/command.js';

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.')
		.setContexts([InteractionContextType.Guild]),
	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.guild) {
			await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
			return;
		}
		else {
			await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
		}
	},

};

export default command;