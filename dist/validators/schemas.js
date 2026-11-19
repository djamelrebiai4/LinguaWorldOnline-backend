"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatSchema = void 0;
const zod_1 = require("zod");
exports.chatSchema = zod_1.z.object({
    npcKey: zod_1.z.string(),
    language: zod_1.z.enum(['ar', 'en']),
    messages: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'assistant']),
        content: zod_1.z.string().min(1).max(500),
    })),
    gameLocation: zod_1.z
        .object({
        level: zod_1.z.number().int(),
        x: zod_1.z.number(),
        z: zod_1.z.number(),
    })
        .optional(),
});
