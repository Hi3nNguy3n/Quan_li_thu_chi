import { OAuth2Client, TokenPayload } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { IUser } from '../models/User';

const googleClient = env.googleClientId
  ? new OAuth2Client(env.googleClientId)
  : null;

export const verifyGoogleToken = async (
  idToken: string
): Promise<TokenPayload> => {
  if (!idToken) {
    throw new Error('Thiếu Google token');
  }

  if (!googleClient) {
    // Allow simplified local testing without Google configuration.
    return {
      sub: `local-${idToken}`,
      email: `${idToken}@local.dev`,
      name: 'Local User',
      picture: undefined
    } as TokenPayload;
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.googleClientId
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Không lấy được thông tin từ Google');
  }
  return payload;
};

export const createAccessToken = (user: IUser) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    env.jwtSecret,
    { expiresIn: '7d' }
  );
