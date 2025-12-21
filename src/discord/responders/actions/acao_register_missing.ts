import { createResponder, ResponderType } from "#base";
import prisma from "#database";
import { buildReviewContainer } from "../../../menus/actions/action-missing.js";

createResponder({
    customId: "acao_register_missing",
    types: [ResponderType.Button],
    cache: "cached",

    async run(interaction) {
        console.log("📋 Continuação do cadastro de participantes.");

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
         * REBUILD DA UI (SEM REPROCESSAR NADA)
         * ========================= */
        const container = buildReviewContainer({
            found: draft.resolvedParticipants,
            missing: draft.missingNames,
            draftId: draft.id,
        });

        await interaction.update({
            components: [container],
            flags: ["IsComponentsV2"],
        });
    },
});
