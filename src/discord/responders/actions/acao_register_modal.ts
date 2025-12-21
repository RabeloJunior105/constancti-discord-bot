import { createResponder, ResponderType } from "#base";
import prisma from "#database";
import { buildReviewContainer } from "../../../menus/actions/action-missing.js";

createResponder({
    customId: "acao_register_modal:id",
    types: [ResponderType.ModalComponent],

    async run(interaction) {
        console.log("📋 Registro de participante via modal iniciado.");

        /* =========================
         * PARSE DO DRAFT
         * ========================= */
        const draftId = interaction.customId.split(":")[1];

        const draft = await prisma.actionDraft.findUnique({
            where: { id: draftId },
            include: {
                resolvedParticipants: true,
            },
        });

        if (!draft) {
            await interaction.reply({
                content: "❌ Esta escalação expirou. Reabra o fluxo.",
                ephemeral: true,
            });
            return;
        }

        /* =========================
         * PARTICIPANTE ATUAL
         * ========================= */
        const name = draft.missingNames[0];

        if (!name) {
            await interaction.reply({
                content: "ℹ️ Nenhum participante pendente.",
                ephemeral: true,
            });
            return;
        }

        /* =========================
         * INPUT DO MODAL
         * ========================= */
        const idComplexo = interaction.fields.getTextInputValue("idComplexo");
        const unit = interaction.fields.getTextInputValue("unit");

        /* =========================
         * BUSCA / CRIA PARTICIPANTE
         * ========================= */
        let participant = await prisma.participant.findUnique({
            where: { idComplexo },
        });

        if (!participant) {
            participant = await prisma.participant.create({
                data: {
                    idComplexo,
                    name,
                    unit,
                },
            });
        }

        /* =========================
         * ATUALIZA DRAFT
         * ========================= */
        const updatedMissing = draft.missingNames.filter(n => n !== name);

        await prisma.actionDraft.update({
            where: { id: draftId },
            data: {
                missingNames: updatedMissing,
                resolvedParticipants: {
                    connect: { id: participant.id },
                },
            },
        });

        /* =========================
         * RECARREGA DRAFT
         * ========================= */
        const refreshedDraft = await prisma.actionDraft.findUnique({
            where: { id: draftId },
            include: {
                resolvedParticipants: true,
            },
        });

        if (!refreshedDraft) {
            await interaction.reply({
                content: "❌ Erro ao atualizar a escalação.",
                ephemeral: true,
            });
            return;
        }

        /* =========================
         * REBUILD DA UI (MESMO CONTAINER)
         * ========================= */
        const container = buildReviewContainer({
            found: refreshedDraft.resolvedParticipants,
            missing: refreshedDraft.missingNames,
            draftId: refreshedDraft.id,
        });

        await interaction.update({
            components: [container],
            flags: ["IsComponentsV2"],
        });
    },
});
