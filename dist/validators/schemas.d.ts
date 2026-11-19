import { z } from 'zod';
export declare const chatSchema: z.ZodObject<{
    npcKey: z.ZodString;
    language: z.ZodEnum<["ar", "en"]>;
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["user", "assistant"]>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        role: "user" | "assistant";
        content: string;
    }, {
        role: "user" | "assistant";
        content: string;
    }>, "many">;
    gameLocation: z.ZodOptional<z.ZodObject<{
        level: z.ZodNumber;
        x: z.ZodNumber;
        z: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        z: number;
        level: number;
    }, {
        x: number;
        z: number;
        level: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    npcKey: string;
    language: "ar" | "en";
    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
    gameLocation?: {
        x: number;
        z: number;
        level: number;
    } | undefined;
}, {
    npcKey: string;
    language: "ar" | "en";
    messages: {
        role: "user" | "assistant";
        content: string;
    }[];
    gameLocation?: {
        x: number;
        z: number;
        level: number;
    } | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map