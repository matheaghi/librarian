import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand } from '../../types/command.js';

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName('book')
		.setDescription('This is your book list.'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply('Developing...');
	},
};

export default command;
