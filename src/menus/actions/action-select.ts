import {
    ActionRowBuilder,
    Colors,
    ContainerBuilder,
    MediaGalleryBuilder,
    SeparatorBuilder,
    StringSelectMenuBuilder,
    TextDisplayBuilder,
} from "discord.js";

type ActionConfigUI = {
    id: number;
    name: string;
    description?: string | null;
};

export function buildEscalacaoContainer(actions: ActionConfigUI[]) {
    const container = new ContainerBuilder()
        .setAccentColor(Colors.DarkGrey);

    /* =========================
     * BANNER
     * ========================= */
    container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems([
            {
                media: { url: "https://media.discordapp.net/attachments/1431345845575487620/1452121469067727008/bar-discord-recom.gif?ex=6948a901&is=69475781&hm=af559fd7c6c2334242b47d176cb69ef840e69e8305e27812d0e01c905bc426c7&=&width=1883&height=227" },
            },
        ]),
    );

    /* =========================
     * STATUS
     * ========================= */
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            [
                "## 🟢 SISTEMA DE ESCALAÇÃO ATIVO",
                "Pronto para iniciar novas ações",
            ].join("\n"),
        ),
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    /* =========================
     * FLUXO
     * ========================= */
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("**Fluxo da ação:**"),
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            [
                "1️⃣ Selecione o tipo de ação",
                "2️⃣ Informe participantes e responsável",
                "3️⃣ A ação ficará **visível para todos**",
            ].join("\n"),
        ),
    );

    /* =========================
     * RESULTADOS
     * ========================= */
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            [
                "**Resultados possíveis:**",
                "🏆 Vitória • ❌ Derrota • ⏹️ QTA",
            ].join("\n"),
        ),
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    /* =========================
     * CTA
     * ========================= */
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            "⬇️ **Selecione abaixo para iniciar uma nova ação**",
        ),
    );

    container.addActionRowComponents(
        new ActionRowBuilder<StringSelectMenuBuilder>({
            components: [
                new StringSelectMenuBuilder({
                    customId: "acao_select",
                    placeholder: "🚀 Iniciar nova ação",
                    options: actions.map(action => ({
                        label: action.name,
                        value: String(action.id),
                        description:
                            action.description?.slice(0, 100) ??
                            "Iniciar esta ação",
                    })),
                }),
            ],
        }),
    );

    return container;
}
