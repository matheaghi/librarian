import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand } from '../../types/command.js';


export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Check the server currency balance of a user.'),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply('You are poor as fuck.');
	},
};

export default command;