const { SlashCommandBuilder } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // ← this was likely missing


module.exports = {
	data: new SlashCommandBuilder()
		.setName('hug')
		.setDescription('Send a hug to another user')
        .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to hug')
            .setRequired(true)
        ),
	async execute(interaction) {
        const hugged = interaction.options.getUser('user');
        const hugger = interaction.user;

        if (hugged.id === hugger.id) {
        return interaction.reply({ content: `You can't hug yourself... but here's a virtual hug anyway 🤗`, flags: 64 });
        }

        // Upsert hug count
        const result = await prisma.hug.upsert({
            where: { userId: hugged.id },
            update: { hugs: { increment: 1 } },
            create: { userId: hugged.id, hugs: 1 },
        });

        await interaction.reply(`${hugged} got hugged by ${hugger}. They have now received ${result.hugs} hug${result.hugs == 1 ? "" : "s"} <3<3`);

    },
};