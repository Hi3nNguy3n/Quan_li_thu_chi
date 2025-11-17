import { Response } from 'express';
import { FilterQuery, Types } from 'mongoose';
import Transaction, { ITransaction } from '../models/Transaction';
import Wallet from '../models/Wallet';
import { AuthenticatedRequest } from '../middleware/auth';

const toObjectId = (id: string) => new Types.ObjectId(id);

export const getTransactionHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  const { walletId, limit = 50 } = req.query;
  const filter: FilterQuery<ITransaction> = {
    userId: req.user.id
  };

  if (walletId) {
    filter.walletId = walletId;
  }

  const transactions = await Transaction.find(filter)
    .sort({ occurredAt: -1 })
    .limit(Number(limit));

  return res.json(transactions);
};

export const getSummaryReport = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  const { walletId, from, to } = req.query;
  const userId = toObjectId(req.user.id);
  const fromDate = from ? new Date(String(from)) : undefined;
  const toDate = to ? new Date(String(to)) : undefined;

  const walletFilter = walletId
    ? { _id: walletId, userId: req.user.id }
    : { userId: req.user.id };

  const wallets = await Wallet.find(walletFilter);
  if (!wallets.length) {
    return res.status(404).json({ message: 'Không tìm thấy ví phù hợp' });
  }

  let openingBalance = wallets.reduce(
    (sum, wallet) => sum + wallet.initialBalance,
    0
  );

  if (fromDate) {
    const beforeMatch: FilterQuery<ITransaction> = {
      userId,
      occurredAt: { $lt: fromDate }
    };
    if (walletId) {
      beforeMatch.walletId = toObjectId(String(walletId));
    }

    const beforeTotals = await Transaction.aggregate([
      { $match: beforeMatch },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);

    for (const entry of beforeTotals) {
      if (entry._id === 'income') {
        openingBalance += entry.total;
      } else if (entry._id === 'expense') {
        openingBalance -= entry.total;
      }
    }
  }

  const match: FilterQuery<ITransaction> = {
    userId
  };

  if (walletId) {
    match.walletId = toObjectId(String(walletId));
  }

  if (fromDate || toDate) {
    match.occurredAt = {};
    if (fromDate) match.occurredAt.$gte = fromDate;
    if (toDate) match.occurredAt.$lte = toDate;
  }

  const grouped = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      }
    }
  ]);

  let totalIncome = 0;
  let totalExpense = 0;
  for (const row of grouped) {
    if (row._id === 'income') totalIncome = row.total;
    if (row._id === 'expense') totalExpense = row.total;
  }

  const closingBalance = openingBalance + totalIncome - totalExpense;

  return res.json({
    walletIds: wallets.map((wallet) => wallet.id),
    openingBalance,
    totalIncome,
    totalExpense,
    closingBalance
  });
};
