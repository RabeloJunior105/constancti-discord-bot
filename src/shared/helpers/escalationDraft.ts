// shared/state/escalationDraft.ts
const escalationDraft = new Map<
    string,
    {
        actionConfigId: number;
        names: string[];
    }
>();

export function saveDraft(userId: string, data: { actionConfigId: number; names: string[] }) {
    escalationDraft.set(userId, data);
}

export function getDraft(userId: string) {
    return escalationDraft.get(userId);
}

export function clearDraft(userId: string) {
    escalationDraft.delete(userId);
}
