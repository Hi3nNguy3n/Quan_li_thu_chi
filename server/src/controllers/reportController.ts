import { Response } from 'express';
import { FilterQuery, PipelineStage, Types } from 'mongoose';
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

  const match: FilterQuery<ITransaction> = {
    userId
  };

  if (walletId) {
    match.walletId = toObjectId(String(walletId));
  }

  if (toDate) {
    match.occurredAt = { $lte: toDate };
  }

  const buildRangeCondition = (type: 'income' | 'expense') => {
    const conditions: Record<string, unknown>[] = [{ $eq: ['$type', type] }];
    if (fromDate) {
      conditions.push({ $gte: ['$occurredAt', fromDate] });
    }
    if (toDate) {
      conditions.push({ $lte: ['$occurredAt', toDate] });
    }
    if (conditions.length === 1) {
      return conditions[0];
    }
    return { $and: conditions };
  };

  const buildBeforeCondition = (type: 'income' | 'expense') => {
    if (!fromDate) {
      return { $literal: false };
    }
    return {
      $and: [{ $eq: ['$type', type] }, { $lt: ['$occurredAt', fromDate] }]
    };
  };

  const pipeline: PipelineStage[] = [
    { $match: match },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [buildRangeCondition('income'), '$amount', 0]
          }
        },
        totalExpense: {
          $sum: {
            $cond: [buildRangeCondition('expense'), '$amount', 0]
          }
        },
        beforeIncome: {
          $sum: {
            $cond: [buildBeforeCondition('income'), '$amount', 0]
          }
        },
        beforeExpense: {
          $sum: {
            $cond: [buildBeforeCondition('expense'), '$amount', 0]
          }
        }
      }
    }
  ];

  const [aggregated] = await Transaction.aggregate<{
    totalIncome?: number;
    totalExpense?: number;
    beforeIncome?: number;
    beforeExpense?: number;
  }>(pipeline);

  const totalIncome = aggregated?.totalIncome ?? 0;
  const totalExpense = aggregated?.totalExpense ?? 0;

  if (fromDate && aggregated) {
    openingBalance +=
      (aggregated.beforeIncome ?? 0) - (aggregated.beforeExpense ?? 0);
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
