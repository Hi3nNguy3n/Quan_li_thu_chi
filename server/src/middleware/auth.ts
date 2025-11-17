import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'Thiếu access token' });
  }

  const [, token] = header.split(' ');
  if (!token) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as {
      id: string;
      email: string;
      name: string;
    };
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};
