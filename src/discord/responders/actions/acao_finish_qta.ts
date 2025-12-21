import { createResponder, ResponderType } from "#base";
import prisma from "#database";

createResponder({
    customId: "acao_finish_qta:id",
    types: [ResponderType.ModaBlComponent],

    async run(interaction) {
        const actionId = interaction.customId.split(":")[1];
        const reason = interaction.fields.getTextInputValue("reason");

        const action = await prisma.action.findUnique({
            where: { id: actionId },
        });

        if (!action) {
            await interaction.reply({
                content: "❌ Ação não encontrada.",
                ephemeral: true,
            });
            return;
        }

        /* =========================
         * ATUALIZA AÇÃO
         * ========================= */
        await prisma.action.update({
            where: { id: actionId },
            data: {
                status: "QTA",
                finishedAt: new Date(),
                description: action.description
                    ? `${action.description}\n\n📝 QTA: ${reason}`
                    : `📝 QTA: ${reason}`,
            },
        });

        await interaction.update({
            content: "⏹️ **Ação finalizada como QTA.**",
            components: [],
        });
    },
});
