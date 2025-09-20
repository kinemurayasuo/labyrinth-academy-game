import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `경로를 찾을 수 없습니다: ${req.method} ${req.originalUrl}`,
      statusCode: 404
    }
  });
};