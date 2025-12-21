import { createResponder, ResponderType } from "#base";
import prisma from "#database";
import {
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";

createResponder({
    customId: "acao_register_one:id",
    types: [ResponderType.Button],

    async run(interaction) {
        console.log("📋 Registro de participante via botão iniciado.");

        /* =========================
         * PARSE DO DRAFT
         * ========================= */
        const draftId = interaction.customId.split(":")[1];

        const draft = await prisma.actionDraft.findUnique({
            where: { id: draftId },
        });

        if (!draft) {
            await interaction.reply({
                content: "❌ Esta escalação expirou. Reabra o fluxo.",
                ephemeral: true,
            });
            return;
        }

        if (!draft.missingNames.length) {
            await interaction.reply({
                content: "ℹ️ Nenhum participante pendente.",
                ephemeral: true,
            });
            return;
        }

        /* =========================
         * PARTICIPANTE ATUAL (PRIMEIRO PENDENTE)
         * ========================= */
        const name = draft.missingNames[0];

        console.log(`📋 Abrindo cadastro para: ${name}`);

        /* =========================
         * MODAL
         * ========================= */
        const modal = new ModalBuilder()
            .setCustomId(`acao_register_modal:${draft.id}`)
            .setTitle(`Cadastrar ${name}`);

        const idComplexo = new TextInputBuilder()
            .setCustomId("idComplexo")
            .setLabel("ID do Complexo")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const unit = new TextInputBuilder()
            .setCustomId("unit")
            .setLabel("Unidade")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(idComplexo),
            new ActionRowBuilder<TextInputBuilder>().addComponents(unit),
        );

        await interaction.showModal(modal);
    },
});
