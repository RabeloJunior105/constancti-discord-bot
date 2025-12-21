import { createResponder, ResponderType } from "#base";
import prisma from "#database";
import {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import { buildEscalacaoContainer } from "../../../menus/actions/action-select.js";

createResponder({
    customId: "acao_select",
    types: [ResponderType.StringSelect],
    cache: "cached",

    async run(interaction) {
        /* =========================
         * ACTION CONFIG SELECIONADA
         * ========================= */
        const actionConfigId = Number(interaction.values[0]);

        if (Number.isNaN(actionConfigId)) {
            await interaction.reply({
                content: "❌ Ação inválida. Tente novamente.",
                ephemeral: true,
            });
            return;
        }

        /* =========================
         * MODAL DE PARTICIPANTES
         * ========================= */
        const modal = new ModalBuilder()
            .setCustomId(`acao_modal:${actionConfigId}`)
            .setTitle("📋 Nova Ação Operacional");

        const participantsInput = new TextInputBuilder()
            .setCustomId("participants")
            .setLabel("Participantes da ação")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Ex: João, Maria, Pedro (separe por vírgula)")
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                participantsInput,
            ),
        );

        /* =========================
         * RESET DO SELECT (UX)
         * ========================= */
        const actions = await prisma.actionConfig.findMany({
            where: { isActive: true },
            take: 25,
            orderBy: { createdAt: "desc" },
            include: {
                actions: {
                    include: {
                        participants: true,
                    },
                },
            },
        });

        await interaction.message.edit({
            components: [buildEscalacaoContainer(actions)],
        });

        /* =========================
         * EXIBE MODAL
         * ========================= */
        await interaction.showModal(modal);
    },
});
