const { SlashCommandBuilder } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 


module.exports = {
	data: new SlashCommandBuilder()
		.setName('give')
		.setDescription('Give coins to another user')
        .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to send coins to')
            .setRequired(true)
        ),
	async execute(interaction) {
        const receiver = interaction.options.getUser('user');
        const sender = interaction.user;

        if (receiver.id === sender.id) {
        return interaction.reply({ content: `You can't transfer coins to yourself`, flags: 64 });
        }

        /*
        // Upsert hug count
        const result = await prisma.hug.upsert({
            where: { userId: hugged.id },
            update: { hugs: { increment: 1 } },
            create: { userId: hugged.id, hugs: 1 },
        });
*/
        await interaction.reply(`${hugged} got hugged by ${hugger}. They have now received ${result.hugs} hug${result.hugs == 1 ? "" : "s"} <3<3`);

    },
};