import prisma from "#database";

export async function createDraft({
    userId,
    guildId,
    actionConfigId,
    rawParticipants,
    parsedNames,
    missingNames,
}: {
    userId: string;
    guildId: string;
    actionConfigId: number;
    rawParticipants: string;
    parsedNames: string[];
    missingNames: string[];
}) {
    return prisma.actionDraft.create({
        data: {
            userId,
            guildId,
            actionConfigId,
            rawParticipants,
            parsedNames,
            missingNames,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
    });
}

export async function getDraftOrFail(id: string) {
    const draft = await prisma.actionDraft.findUnique({
        where: { id },
        include: {
            resolvedParticipants: true,
            actionConfig: true,
        },
    });

    if (!draft) throw new Error("Draft não encontrado ou expirado.");
    return draft;
}

export async function updateDraft(id: string, data: any) {
    return prisma.actionDraft.update({
        where: { id },
        data,
    });
}

export async function deleteDraft(id: string) {
    return prisma.actionDraft.delete({ where: { id } });
}
