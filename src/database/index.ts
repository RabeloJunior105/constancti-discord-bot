import { PrismaClient } from "./prisma/client.js";

// Reuse a single PrismaClient instance to avoid exhausting DB connections
declare global {
    // eslint-disable-next-line no-var
    var prismaSingleton: PrismaClient | undefined;
}

export const prisma = globalThis.prismaSingleton ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalThis.prismaSingleton = prisma;
}

export default prisma;
