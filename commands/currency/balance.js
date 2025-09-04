const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Check the server currency balance of a user.'),
	async execute(interaction) {
		await interaction.reply('You are poor as fuck.');
	},
};