import { createResponder, ResponderType } from "#base";
import prisma from "#database";
import { findDuplicates, parseNames } from "#shared/helpers/validations.js";
import { buildReviewContainer } from "../../../menus/actions/action-missing.js";

createResponder({
    customId: "acao_modal:actionConfigId",
    types: [ResponderType.ModalComponent],
    cache: "cached",

    async run(interaction) {
        /* =========================
         * PARSE DO ACTION CONFIG
         * ========================= */
        const actionConfigId = Number(interaction.customId.split(":")[1]);

        if (Number.isNaN(actionConfigId)) {
            await interaction.reply({
                content: "❌ Ação inválida. Reabra a escalação.",
                ephemeral: true,
            });
            return;
        }

        /* =========================
         * INPUT
         * ========================= */
        const raw = interaction.fields.getTextInputValue("participants");
        const names = parseNames(raw);

        /* =========================
         * VALIDAÇÕES
         * ========================= */
        if (!names.length) {
            await interaction.reply({
                content: "❌ Informe ao menos um participante.",
                ephemeral: true,
            });
            return;
        }

        const duplicates = findDuplicates(names);
        if (duplicates.length) {
            await interaction.reply({
                content: [
                    "❌ **Nomes duplicados encontrados:**",
                    ...duplicates.map(d => `• ${d}`),
                ].join("\n"),
                ephemeral: true,
            });
            return;
        }

        /* =========================
         * BUSCA PARTICIPANTES EXISTENTES
         * ========================= */
        const existing = await prisma.participant.findMany({
            where: {
                OR: names.map(name => ({
                    name: {
                        mode: "insensitive",
                        contains: name,
                    },
                })),
            },
        });

        const existingNames = existing.map(p => p.name.toLowerCase());

        const found = [];
        const missing = [];

        for (const name of names) {
            const idx = existingNames.findIndex(existingName =>
                existingName.includes(name.toLowerCase()),
            );

            if (idx !== -1) found.push(existing[idx]);
            else missing.push(name);
        }

        /* =========================
         * 🔑 CRIA ACTION DRAFT (SEMPRE)
         * ========================= */
        const draft = await prisma.actionDraft.create({
            data: {
                userId: interaction.user.id,
                guildId: interaction.guildId!,
                actionConfigId,
                rawParticipants: raw,
                parsedNames: names,
                missingNames: missing,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
                resolvedParticipants: {
                    connect: found.map(p => ({ id: p.id })),
                },
            },
        });

        /* =========================
         * REVIEW (COM OU SEM PENDENTES)
         * ========================= */
        const reviewContainer = buildReviewContainer({
            found,
            missing,
            draftId: draft.id,
        });

        await interaction.reply({
            components: [reviewContainer],
            flags: ["IsComponentsV2"],
        });
    },
});
