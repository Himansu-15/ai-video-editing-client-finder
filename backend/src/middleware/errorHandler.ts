import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('❌ Express Server Error:', err);

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || 'An unexpected error occurred',
    stack: isProduction ? undefined : err.stack,
  });
}
