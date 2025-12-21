import {
    Colors,
    ContainerBuilder,
    MessageFlags,
    SeparatorBuilder,
    TextDisplayBuilder,
} from "discord.js";

type LogLevel = "INFO" | "WARN" | "ERROR" | "AUDIT";

export class LogComponent {
    private readonly LOG_CHANNEL_ID = "1449482056206782507";
    private client: any;

    constructor(client: any) {
        this.client = client;
    }

    /* =========================
     * Utils
     * ========================= */

    private formatTimestamp(date = new Date()) {
        return date.toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
        });
    }

    /* =========================
     * Core sender
     * ========================= */

    private async send({
        title,
        headerIcon,
        meta,
        body,
        footer,
        color,
    }: {
        title: string;
        headerIcon?: string;
        meta?: string[];
        body?: string[];
        footer?: string[];
        color: number;
    }) {
        try {
            const channel = await this.client.channels.fetch(this.LOG_CHANNEL_ID);
            if (!channel || !channel.isTextBased()) return;

            const container = new ContainerBuilder().setAccentColor(color);

            /* =========================
             * HEADER
             * ========================= */
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `### ${headerIcon ?? ""} **${title}**`,
                ),
            );

            container.addSeparatorComponents(new SeparatorBuilder());

            /* =========================
             * META (2 columns style)
             * ========================= */
            if (meta?.length) {
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(meta.join("\n")),
                );
            }

            /* =========================
             * BODY
             * ========================= */
            if (body?.length) {
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `\n${body.join("\n")}`,
                    ),
                );
            }

            /* =========================
             * FOOTER
             * ========================= */
            container.addSeparatorComponents(new SeparatorBuilder());

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    [
                        `🕒 ${this.formatTimestamp()}`,
                        ...(footer ?? []),
                    ].join("\n"),
                ),
            );

            await channel.send({
                components: [container],
                flags:
                    MessageFlags.SuppressNotifications |
                    MessageFlags.IsComponentsV2,
            });
        } catch (err) {
            console.error("[LogComponent]", err);
        }
    }

    /* =========================
     * Public APIs
     * ========================= */

    auditActionStarted({
        actionName,
        responsible,
        participants,
    }: {
        actionName: string;
        responsible: string;
        participants: string[];
    }) {
        return this.send({
            title: "AÇÃO INICIADA",
            headerIcon: "🟢",
            color: Colors.Green,
            meta: [
                `**Ação**                      **Responsável**`,
                `${actionName}              ${responsible}`,
            ],
            body: [
                `**Participantes**`,
                ...participants.map(p => `• ${p}`),
            ],
        });
    }

    auditActionFinished({
        actionName,
        responsible,
        status,
    }: {
        actionName: string;
        responsible: string;
        status: "VITORIA" | "DERROTA";
    }) {
        return this.send({
            title: "FINALIZAÇÃO DE AÇÃO",
            headerIcon: status === "VITORIA" ? "🏁" : "❌",
            color: status === "VITORIA" ? Colors.Green : Colors.Red,
            meta: [
                `**Ação**                **Responsável**`,
                `${actionName}            ${responsible}`,
                `🏆 Status: **${status}**`,
            ],
            footer: [``],
        });
    }


    info(title: string, body: string[]) {
        return this.send({
            title,
            headerIcon: "ℹ️",
            color: Colors.Blue,
            body,
        });
    }

    warn(title: string, body: string[]) {
        return this.send({
            title,
            headerIcon: "⚠️",
            color: Colors.Yellow,
            body,
        });
    }

    error(title: string, body: string[]) {
        return this.send({
            title,
            headerIcon: "❌",
            color: Colors.Red,
            body,
        });
    }
}
