"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            res.status(400).json({
                error: 'Invalid input',
                details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
            });
            return;
        }
        res.status(400).json({ error: 'Invalid input' });
        return;
    }
};
exports.validate = validate;
