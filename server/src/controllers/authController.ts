import { Response } from 'express';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAccessToken, verifyGoogleToken } from '../services/authService';

export const googleSignIn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { idToken } = req.body;
    const payload = await verifyGoogleToken(idToken);
    const googleId = payload.sub as string;
    const email = payload.email as string;

    if (!googleId || !email) {
      return res.status(400).json({ message: 'Token Google không hợp lệ' });
    }

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.create({
        googleId,
        email,
        name: payload.name || email,
        avatarUrl: payload.picture
      });
    } else {
      user.name = payload.name || user.name;
      user.avatarUrl = payload.picture || user.avatarUrl;
      await user.save();
    }

    const token = createAccessToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Đăng nhập thất bại' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }
  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl
  });
};
