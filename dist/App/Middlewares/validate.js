"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAll = void 0;
const zod_1 = require("zod");
const validateAll = ({ body, query, params, }) => {
    return (req, res, next) => {
        try {
            if (body) {
                const result = body.safeParse(req.body);
                if (!result.success)
                    throw result.error;
                req.body = result.data;
            }
            if (query) {
                const result = query.safeParse(req.query);
                if (!result.success)
                    throw result.error;
                Object.assign(req.query, result.data);
            }
            if (params) {
                const result = params.safeParse(req.params);
                if (!result.success)
                    throw result.error;
                req.params = result.data;
            }
            return next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                res.status(400).json({
                    error: 'Validation error',
                    details: err.flatten(),
                });
                return;
            }
            console.error('Unexpected validation error:', err);
            res.status(500).json({
                error: 'Internal server error',
            });
            return;
        }
    };
};
exports.validateAll = validateAll;
