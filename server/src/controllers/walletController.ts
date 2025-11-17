import { Response } from 'express';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import { AuthenticatedRequest } from '../middleware/auth';

export const listWallets = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }

  const wallets = await Wallet.find({ userId: req.user.id }).sort({
    createdAt: 1
  });
  return res.json(wallets);
};

export const createWallet = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  const { name, accountNumber, initialBalance, currency } = req.body;

  if (!name || !accountNumber) {
    return res.status(400).json({ message: 'Thiếu tên ví hoặc số tài khoản' });
  }

  const balance = Number(initialBalance ?? 0);
  if (balance < 0) {
    return res.status(400).json({ message: 'Số dư ban đầu không hợp lệ' });
  }

  const wallet = await Wallet.create({
    userId: req.user.id,
    name,
    accountNumber,
    initialBalance: balance,
    balance,
    currency: currency || 'VND'
  });

  return res.status(201).json(wallet);
};

export const updateWallet = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  const { id } = req.params;
  const { name, accountNumber, currency } = req.body;

  const wallet = await Wallet.findOne({ _id: id, userId: req.user.id });
  if (!wallet) {
    return res.status(404).json({ message: 'Không tìm thấy ví' });
  }

  if (name) wallet.name = name;
  if (accountNumber) wallet.accountNumber = accountNumber;
  if (currency) wallet.currency = currency;

  await wallet.save();
  return res.json(wallet);
};

export const deleteWallet = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  const { id } = req.params;
  const wallet = await Wallet.findOneAndDelete({
    _id: id,
    userId: req.user.id
  });

  if (!wallet) {
    return res.status(404).json({ message: 'Không tìm thấy ví' });
  }

  await Transaction.deleteMany({ walletId: wallet.id, userId: req.user.id });

  return res.json({ message: 'Đã xoá ví' });
};
