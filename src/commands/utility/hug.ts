import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand } from '../../types/command.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName('hug')
		.setDescription('Send a hug to another user')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('The user to hug')
				.setRequired(true),
		),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const hugged = interaction.options.getUser('user', true);
		const hugger = interaction.user;

		if (hugged.id === hugger.id) {
			await interaction.reply({ content: 'You can\'t hug yourself... but here\'s a virtual hug anyway 🤗', ephemeral: true });
			return;
		}

		// Upsert hug count
		const result = await prisma.hug.upsert({
			where: { userId: hugged.id },
			update: { hugs: { increment: 1 } },
			create: { userId: hugged.id, hugs: 1 },
		});

		await interaction.reply(`${hugged} got hugged by ${hugger}. They have now received ${result.hugs} hug${result.hugs == 1 ? '' : 's'} <3<3`);

	},
};

export default command;