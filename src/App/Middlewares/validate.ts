import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidateSchemas = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export const validateAll = ({
  body,
  query,
  params,
}: ValidateSchemas): RequestHandler => {
  return (req, res, next) => {
    try {
      if (body) {
        const result = body.safeParse(req.body);
        if (!result.success) throw result.error;
        req.body = result.data;
      }

      if (query) {
        const result = query.safeParse(req.query);
        if (!result.success) throw result.error;
        Object.assign(req.query, result.data);
      }

      if (params) {
        const result = params.safeParse(req.params);
        if (!result.success) throw result.error;
        req.params = result.data;
      }

      return next();
    } catch (err) {
      if (err instanceof ZodError) {
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
