import { createResponder, ResponderType } from "#base";
import prisma from "#database";
import { LogComponent } from "#shared/logs/actionDiscordLogger.js";
import {
    ActionRowBuilder,
    ContainerBuilder,
    ModalBuilder,
    TextDisplayBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";

createResponder({
    customId: "acao_finish:status:actionId",
    types: [ResponderType.Button],

    async run(interaction) {
        const [, status, actionId] = interaction.customId.split(":");

        if (!["VITORIA", "DERROTA", "QTA"].includes(status)) {
            await interaction.reply({
                content: "❌ Status inválido.",
                ephemeral: true,
            });
            return;
        }

        /* =========================
         * QTA → MODAL
         * ========================= */
        if (status === "QTA") {
            // 👉 aqui NÃO tem update/reply com content
            // só abre modal, então está OK
            const modal = new ModalBuilder()
                .setCustomId(`acao_finish_qta:${actionId}`)
                .setTitle("⏹️ Finalizar Ação - QTA");

            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId("reason")
                        .setLabel("Justificativa da QTA")
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setPlaceholder("Explique o motivo da QTA...")
                ),
            );

            await interaction.showModal(modal);
            return;
        }

        /* =========================
         * VITÓRIA / DERROTA
         * ========================= */
        await prisma.action.update({
            where: { id: actionId },
            data: {
                status: status as any,
                finishedAt: new Date(),
            },
        });

        /* =========================
         * CONTAINER V2 (SEM CONTENT)
         * ========================= */
        const container = new ContainerBuilder();

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `✅ **Ação finalizada como ${status}.**`
            ),
        );


        const action = await prisma.action.findUnique({
            where: { id: actionId },
        });

        const logService = new LogComponent(interaction.client);

        // Este log é gerado quando uma ação é finalizada
        logService.auditActionFinished({
            actionName: action?.name || "Desconhecida",
            responsible: interaction.user.username,
            status: status as any
        });


        await interaction.update({
            components: [container],
            flags: ["IsComponentsV2"],
        });

        setTimeout(async () => {
            try {
                await interaction.message.delete();
            } catch (err) {

            }
        }, 5000);
    },
});
