import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MediaGalleryBuilder,
    SectionBuilder,
    SeparatorBuilder,
    TextDisplayBuilder,
} from "discord.js";

export function buildReviewContainer({
    found,
    missing,
    draftId,
}: {
    found: { name: string }[];
    missing: string[];
    draftId: string;
}) {
    const ready = missing.length === 0;

    const container = new ContainerBuilder()
        .setAccentColor(ready ? 0x2ecc71 : 0xe74c3c);

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
            ready
                ? "🟢 **ESCALAÇÃO PRONTA PARA CRIAÇÃO**"
                : "🔴 **ESCALAÇÃO EM REVISÃO**",
        ),
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    /* =========================
     * VINCULADOS
     * ========================= */
    if (found.length) {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                [
                    `🟢 **Vinculados (${found.length})**`,
                    ...found.map(p => `• ${p.name}`),
                ].join("\n"),
            ),
        );

        container.addSeparatorComponents(new SeparatorBuilder());
    }

    /* =========================
     * PENDENTES
     * ========================= */
    if (!ready) {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `🔴 **Pendentes (${missing.length})**`,
            ),
        );

        missing.forEach((name, index) => {
            const nameBlock = new TextDisplayBuilder({
                content: "```patch\n" + name + "\n```",
            });

            container.addSectionComponents(
                new SectionBuilder({
                    components: [nameBlock],
                    accessory: new ButtonBuilder()
                        .setCustomId(`acao_register_one:${draftId}:${index}`)
                        .setLabel("Vincular / Cadastrar")
                        .setStyle(ButtonStyle.Secondary),
                }),
            );
        });

        container.addSeparatorComponents(new SeparatorBuilder());

        /* =========================
         * CTA SECUNDÁRIO (PADRÃO)
         * ========================= */
        container.addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>({
                components: [
                    new ButtonBuilder()
                        .setCustomId(`acao_register_missing:${draftId}`)
                        .setLabel("➕ Continuar cadastro dos participantes")
                        .setStyle(ButtonStyle.Danger),

                    new ButtonBuilder()
                        .setCustomId(`acao_cancel:${draftId}`)
                        .setLabel("Cancelar escalação")
                        .setStyle(ButtonStyle.Secondary),
                ],
            }),
        );
    }

    /* =========================
     * CTA FINAL
     * ========================= */
    if (ready) {
        container.addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>({
                components: [
                    new ButtonBuilder()
                        .setCustomId(`acao_create:${draftId}`)
                        .setLabel("✅ Criar escalação")
                        .setStyle(ButtonStyle.Success),
                ],
            }),
        );
    }

    return container;
}
