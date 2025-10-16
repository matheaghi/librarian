import {
	SlashCommandBuilder,
	InteractionContextType,
	type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../types/command.js';

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Show info about you')
		.setContexts([InteractionContextType.Guild]),

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (!interaction.inGuild()) {
			await interaction.reply({
				content: 'This command can only be used in a server.',
				ephemeral: true,
			});
			return;
		}

		const member = await interaction.guild!.members.fetch(interaction.user.id);
		const joined = member.joinedAt
			? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:D>`
			: 'Unknown';

		await interaction.reply(
			`This command was run by ${interaction.user.username}, who joined on ${joined}.`,
		);
	},
};

export default command;