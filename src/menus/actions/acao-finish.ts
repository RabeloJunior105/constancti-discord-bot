import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    SeparatorBuilder,
    TextDisplayBuilder,
} from "discord.js";

export function buildActionFinishContainer(actionId: string) {
    const container = new ContainerBuilder();

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            "## 📌 Finalizar Ação\nSelecione o resultado final:"
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder());

    container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>({
            components: [
                new ButtonBuilder()
                    .setCustomId(`acao_finish:VITORIA:${actionId}`)
                    .setLabel("🏆 Vitória")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId(`acao_finish:DERROTA:${actionId}`)
                    .setLabel("❌ Derrota")
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId(`acao_finish:QTA:${actionId}`)
                    .setLabel("⏹️ QTA")
                    .setStyle(ButtonStyle.Secondary),
            ],
        }),
    );

    return container;
}
