import api from './client';
import type {
  SummaryReport,
  Transaction,
  TransactionType,
  Wallet
} from '../types';

export interface GoogleLoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  };
}

export const loginWithGoogle = async (
  idToken: string
): Promise<GoogleLoginResponse> => {
  const { data } = await api.post<GoogleLoginResponse>('/api/auth/google', {
    idToken
  });
  return data;
};

export const fetchProfile = async () => {
  const { data } = await api.get('/api/auth/me');
  return data;
};

export const fetchWallets = async (): Promise<Wallet[]> => {
  const { data } = await api.get<Wallet[]>('/api/wallets');
  return data;
};

export const createWallet = async (payload: {
  name: string;
  accountNumber: string;
  initialBalance: number;
  currency?: string;
}) => {
  const { data } = await api.post<Wallet>('/api/wallets', payload);
  return data;
};

export const updateWallet = async (
  walletId: string,
  payload: Partial<Pick<Wallet, 'name' | 'accountNumber' | 'currency'>>
) => {
  const { data } = await api.patch<Wallet>(`/api/wallets/${walletId}`, payload);
  return data;
};

export const deleteWallet = async (walletId: string) => {
  const { data } = await api.delete(`/api/wallets/${walletId}`);
  return data;
};

export interface TransactionFilters {
  walletId?: string;
  type?: TransactionType;
  from?: string;
  to?: string;
}

export const fetchTransactions = async (
  filters: TransactionFilters
): Promise<Transaction[]> => {
  const { data } = await api.get<Transaction[]>('/api/transactions', {
    params: filters
  });
  return data;
};

export const createTransactionRequest = async (payload: {
  walletId: string;
  type: TransactionType;
  amount: number;
  category: string;
  note?: string;
  occurredAt?: string;
}) => {
  const { data } = await api.post<Transaction>('/api/transactions', payload);
  return data;
};

export const deleteTransactionRequest = async (transactionId: string) => {
  const { data } = await api.delete(`/api/transactions/${transactionId}`);
  return data;
};

export const fetchSummary = async (
  filters: TransactionFilters
): Promise<SummaryReport> => {
  const { data } = await api.get<SummaryReport>('/api/reports/summary', {
    params: filters
  });
  return data;
};
