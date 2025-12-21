import { createCommand } from "#base";
import prisma from "#database";
import { ApplicationCommandType } from "discord.js";
import { buildEscalacaoContainer } from "../../../menus/actions/action-select.js";

createCommand({
    name: "acao-2",
    description: "Iniciar uma ação operacional",
    type: ApplicationCommandType.ChatInput,

    async run(interaction) {
        /* =========================
         * BUSCA CONFIGURAÇÕES DE AÇÃO
         * ========================= */
        const actions = await prisma.actionConfig.findMany({
            where: {
                isActive: true,
            },
            take: 25,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                actions: {
                    include: {
                        participants: true,
                    },
                },
            },
        });

        /* =========================
         * SEM AÇÕES DISPONÍVEIS
         * ========================= */
        if (!actions.length) {
            await interaction.reply({
                content: "⚠️ Nenhuma ação disponível no momento.",
                ephemeral: true,
            });
            return;
        }

        /* =========================
         * CONTAINER (UI ORIGINAL)
         * ========================= */
        const container = buildEscalacaoContainer(actions);

        /* =========================
         * RESPOSTA
         * ========================= */
        await interaction.reply({
            components: [container],
            flags: ["IsComponentsV2"],
        });
    },
});
