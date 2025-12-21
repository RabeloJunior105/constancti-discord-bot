export function parseNames(input: string) {
    return input
        .split(",")
        .map(n => n.trim())
        .filter(Boolean);
}

export function findDuplicates(names: string[]) {
    const seen = new Set<string>();
    const dup = new Set<string>();

    for (const n of names) {
        const key = n.toLowerCase();
        if (seen.has(key)) dup.add(n);
        else seen.add(key);
    }

    return Array.from(dup);
}
