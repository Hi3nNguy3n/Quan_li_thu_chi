export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface Wallet {
  _id: string;
  name: string;
  accountNumber: string;
  initialBalance: number;
  balance: number;
  currency: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  _id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  category: string;
  note?: string;
  occurredAt: string;
}

export interface SummaryReport {
  walletIds: string[];
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  closingBalance: number;
}
