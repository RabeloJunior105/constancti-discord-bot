3// shared/helpers/resolveParticipants.ts
import prisma from "#database";

export async function resolveParticipants(names: string[]) {
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

    const map = new Map(
        existing.map(p => [p.name.toLowerCase(), p]),
    );

    const found = [];
    const missing = [];

    for (const name of names) {
        const p = map.get(name.toLowerCase());
        if (p) found.push(p);
        else missing.push(name);
    }

    return { found, missing };
}
