import prisma from "#database";
import { getDraft } from "#shared/helpers/escalationDraft.js";

export async function rebuildEscalationState(interaction: any) {
    const draft = getDraft(interaction.user.id);

    if (!draft) {
        throw new Error("Draft de escalação não encontrado");
    }

    const { names, actionConfigId } = draft;

    const existing = await prisma.participant.findMany({
        where: {
            name: { in: names },
        },
    });

    const existingMap = new Map(
        existing.map(p => [p.name.toLowerCase(), p]),
    );

    const found = [];
    const missing = [];

    for (const name of names) {
        const p = existingMap.get(name.toLowerCase());
        if (p) found.push(p);
        else missing.push(name);
    }

    return {
        found,
        missing,
        actionConfigId,
    };
}
