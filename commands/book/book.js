const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('book')
		.setDescription('This is your book list.'),
	async execute(interaction) {
		await interaction.reply('Developing...');
	},
};