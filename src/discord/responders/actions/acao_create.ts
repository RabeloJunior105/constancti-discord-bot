import { createResponder, ResponderType } from "#base";
import prisma from "#database";
import { LogComponent } from "#shared/logs/actionDiscordLogger.js";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MediaGalleryBuilder,
    SeparatorBuilder,
    TextDisplayBuilder,
} from "discord.js";

createResponder({
    customId: "acao_create:draftId",
    types: [ResponderType.Button],
    cache: "cached",

    async run(interaction) {
        const draftId = interaction.customId.split(":")[1];

        const draft = await prisma.actionDraft.findUnique({
            where: { id: draftId },
            include: {
                resolvedParticipants: true,
                actionConfig: true,
            },
        });

        if (!draft) {
            await interaction.reply({
                content: "❌ Esta escalação expirou. Reabra o fluxo.",
                ephemeral: true,
            });
            return;
        }

        if (draft.missingNames.length > 0) {
            await interaction.reply({
                content: "❌ Ainda existem participantes pendentes.",
                ephemeral: true,
            });
            return;
        }

        /* =========================
         * TRANSAÇÃO
         * ========================= */
        const action = await prisma.$transaction(async tx => {
            const createdAction = await tx.action.create({
                data: {
                    name: draft.actionConfig.name,
                    description: `Criada por ${interaction.user.tag}`,
                    responsible: interaction.user.tag,
                    actionConfigId: draft.actionConfigId,
                    status: "EM_ANDAMENTO",
                },
            });

            await tx.actionParticipant.createMany({
                data: draft.resolvedParticipants.map(p => ({
                    actionId: createdAction.id,
                    participantId: p.id,
                })),
            });

            await tx.actionDraft.delete({
                where: { id: draft.id },
            });

            return createdAction;
        });

        const logService = new LogComponent(interaction.client);

        // Este log é gerado quando uma ação/escalação é criada
        logService.auditActionStarted({
            actionName: action.name,
            responsible: interaction.user.username,
            participants: draft.resolvedParticipants.map(p => `[${p.unit}] ${p.idComplexo} - ${p.name || "Sem nome"}`),
        });



        /* =========================
         * CONTAINER PREMIUM
         * ========================= */
        const container = new ContainerBuilder()
            .setAccentColor(0xf1c40f); // dourado / ação ativa

        /* =========================
         * BANNER
         * ========================= */
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems([
                { media: { url: "https://media.discordapp.net/attachments/1431345845575487620/1452121469067727008/bar-discord-recom.gif?ex=6948a901&is=69475781&hm=af559fd7c6c2334242b47d176cb69ef840e69e8305e27812d0e01c905bc426c7&=&width=1883&height=227" } },
            ]),
        );

        /* =========================
         * HEADER
         * ========================= */
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                [
                    "🏁 **AÇÃO CRIADA COM SUCESSO**",
                    "_A operação foi iniciada e está em andamento._",
                ].join("\n"),
            ),
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        /* =========================
         * RESUMO DA AÇÃO
         * ========================= */
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                [
                    `### 📋 **RESUMO DA AÇÃO**`,
                    ``,
                    `**AÇÂO**                         **Descrição**`,
                    `\`${action.name}\`             ${draft.actionConfig.description ? draft.actionConfig.description : "Sem descrição"}`,
                    ``,
                    `**Responsável**              **Participantes**`,
                    `${interaction.user.username}                  ${draft.resolvedParticipants.length}`,
                ].join("\n"),
            ),
        );

        container.addSeparatorComponents(new SeparatorBuilder());

        /* =========================
         * DECISÃO FINAL
         * ========================= */
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                "📌 **Selecione o resultado final da ação:**",
            ),
        );

        container.addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>({
                components: [
                    new ButtonBuilder()
                        .setCustomId(`acao_finish:VITORIA:${action.id}`)
                        .setLabel("🏆 Vitória")
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId(`acao_finish:DERROTA:${action.id}`)
                        .setLabel("❌ Derrota")
                        .setStyle(ButtonStyle.Danger),

                    new ButtonBuilder()
                        .setCustomId(`acao_finish:QTA:${action.id}`)
                        .setLabel("⏹️ QTA")
                        .setStyle(ButtonStyle.Secondary),
                ],
            }),
        );

        /* =========================
         * UPDATE (V2)
         * ========================= */
        await interaction.update({
            components: [container],
            flags: ["IsComponentsV2"],
        });
    },
});
