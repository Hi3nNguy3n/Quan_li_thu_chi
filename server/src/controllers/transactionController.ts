import { Response } from 'express';
import { FilterQuery } from 'mongoose';
import Transaction, { ITransaction } from '../models/Transaction';
import Wallet from '../models/Wallet';
import { AuthenticatedRequest } from '../middleware/auth';

export const listTransactions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  const { walletId, type, from, to } = req.query;
  const filter: FilterQuery<ITransaction> = {
    userId: req.user.id
  };

  if (walletId) filter.walletId = walletId;
  if (type) filter.type = type;

  if (from || to) {
    filter.occurredAt = {};
    if (from) filter.occurredAt.$gte = new Date(String(from));
    if (to) filter.occurredAt.$lte = new Date(String(to));
  }

  const transactions = await Transaction.find(filter)
    .sort({ occurredAt: -1 })
    .limit(200);

  return res.json(transactions);
};

export const createTransaction = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  const { walletId, type, amount, category, note, occurredAt } = req.body;
  if (!walletId || !type || !amount || !category) {
    return res.status(400).json({ message: 'Thiếu thông tin giao dịch' });
  }

  const wallet = await Wallet.findOne({ _id: walletId, userId: req.user.id });
  if (!wallet) {
    return res.status(404).json({ message: 'Ví không tồn tại' });
  }

  const value = Number(amount);
  if (value <= 0) {
    return res.status(400).json({ message: 'Số tiền không hợp lệ' });
  }

  if (type === 'expense' && wallet.balance < value) {
    return res.status(400).json({ message: 'Không thể chi quá số dư' });
  }

  const transaction = await Transaction.create({
    userId: req.user.id,
    walletId,
    type,
    amount: value,
    category,
    note,
    occurredAt: occurredAt ? new Date(occurredAt) : new Date()
  });

  wallet.balance += type === 'income' ? value : -value;
  await wallet.save();

  return res.status(201).json(transaction);
};

export const deleteTransaction = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  const { id } = req.params;
  const transaction = await Transaction.findOneAndDelete({
    _id: id,
    userId: req.user.id
  });

  if (!transaction) {
    return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
  }

  const wallet = await Wallet.findOne({
    _id: transaction.walletId,
    userId: req.user.id
  });
  if (wallet) {
    wallet.balance += transaction.type === 'income' ? -transaction.amount : transaction.amount;
    wallet.balance = Math.max(wallet.balance, 0);
    await wallet.save();
  }

  return res.json({ message: 'Đã xoá giao dịch' });
};
