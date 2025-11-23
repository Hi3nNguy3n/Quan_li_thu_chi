import type { AxiosError } from 'axios';
import {
  BankOutlined,
  LogoutOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { Button, Dropdown, Form, Layout, Menu, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTransactionRequest,
  createWallet,
  deleteTransactionRequest,
  fetchSummary,
  fetchTransactions,
  fetchWallets
} from '../api';
import type { Transaction, TransactionType, Wallet } from '../types';
import { useAuth } from '../hooks/useAuth';
import SummaryCards from '../components/dashboard/SummaryCards';
import ReportFiltersCard from '../components/dashboard/ReportFiltersCard';
import SummaryChartCard from '../components/dashboard/SummaryChartCard';
import WalletListCard from '../components/dashboard/WalletListCard';
import TransactionsTableCard from '../components/dashboard/TransactionsTableCard';
import CreateWalletModal from '../components/dashboard/CreateWalletModal';
import TransactionModal from '../components/dashboard/TransactionModal';

const { Header, Sider, Content } = Layout;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [walletFilter, setWalletFilter] = useState<string>();
  const [typeFilter, setTypeFilter] = useState<TransactionType>();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);
  const [walletForm] = Form.useForm();
  const [transactionForm] = Form.useForm();
  const queryClient = useQueryClient();

  const walletQuery = useQuery({
    queryKey: ['wallets'],
    queryFn: fetchWallets
  });

  const transactionsQuery = useQuery({
    queryKey: ['transactions', walletFilter, typeFilter, dateRange],
    queryFn: () =>
      fetchTransactions({
        walletId: walletFilter,
        type: typeFilter,
        from: dateRange[0]?.toISOString(),
        to: dateRange[1]?.toISOString()
      })
  });

  const summaryQuery = useQuery({
    queryKey: ['summary', walletFilter, dateRange],
    queryFn: () =>
      fetchSummary({
        walletId: walletFilter,
        from: dateRange[0]?.toISOString(),
        to: dateRange[1]?.toISOString()
      })
  });

  const createWalletMutation = useMutation({
    mutationFn: createWallet,
    onSuccess: () => {
      message.success('Đã tạo ví');
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      summaryQuery.refetch();
    },
    onError: () => message.error('Không thể tạo ví, kiểm tra trùng số tài khoản')
  });

  const createTransactionMutation = useMutation({
    mutationFn: createTransactionRequest,
    onSuccess: () => {
      message.success('Đã ghi nhận giao dịch');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
    onError: (error: AxiosError<{ message?: string }>) =>
      message.error(error?.response?.data?.message || 'Không thể ghi nhận')
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: deleteTransactionRequest,
    onSuccess: () => {
      message.success('Đã xoá giao dịch');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    }
  });

  const handleWalletSubmit = async () => {
    const values = await walletForm.validateFields();
    await createWalletMutation.mutateAsync({
      name: values.name,
      accountNumber: values.accountNumber,
      initialBalance: Number(values.initialBalance),
      currency: values.currency
    });
    walletForm.resetFields();
    setWalletModalOpen(false);
  };

  const handleTransactionSubmit = async () => {
    const values = await transactionForm.validateFields();
    await createTransactionMutation.mutateAsync({
      walletId: values.walletId,
      type: values.type,
      amount: Number(values.amount),
      category: values.category,
      note: values.note,
      occurredAt: values.occurredAt?.toISOString()
    });
    transactionForm.resetFields();
    setTransactionModalOpen(false);
  };

  const handleDeleteTransaction = useCallback(
    (transactionId: string) => {
      deleteTransactionMutation.mutate(transactionId);
    },
    [deleteTransactionMutation]
  );

  const wallets: Wallet[] = walletQuery.data || [];
  const transactions: Transaction[] = transactionsQuery.data || [];
  const summary = summaryQuery.data;

  const chartData = useMemo(
    () => [
      { label: 'Thu nhập', value: summary?.totalIncome || 0 },
      { label: 'Chi tiêu', value: summary?.totalExpense || 0 }
    ],
    [summary]
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo">
          <WalletOutlined /> {!collapsed && <span>QL Chi tiêu</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['overview']}
          items={[
            {
              key: 'overview',
              icon: <BankOutlined />,
              label: 'Tổng quan'
            }
          ]}
        />
      </Sider>
      <Layout>
        <Header className="header">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <div className="header-text">
              <span className="header-greeting">Chào {user?.name}</span>
            </div>
          </div>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Đăng xuất',
                  onClick: logout
                }
              ]
            }}
          >
            <Button icon={<LogoutOutlined />}>Tài khoản</Button>
          </Dropdown>
        </Header>
        <Content className="dashboard-content">
          <div className="container-fluid py-3">
            <div className="row g-3">
              <div className="col-12">
                <SummaryCards
                  summary={summary}
                  loading={summaryQuery.isLoading}
                />
              </div>

              <div className="col-12">
                <ReportFiltersCard
                  wallets={wallets}
                  walletFilter={walletFilter}
                  typeFilter={typeFilter}
                  dateRange={dateRange}
                  onWalletChange={(value) => setWalletFilter(value)}
                  onTypeChange={(value) => setTypeFilter(value)}
                  onDateChange={(range) => setDateRange(range)}
                  onCreateWallet={() => setWalletModalOpen(true)}
                  onAddTransaction={() => setTransactionModalOpen(true)}
                  disableAddTransaction={!wallets.length}
                  walletLoading={walletQuery.isLoading}
                />
              </div>

              <div className="col-12 col-lg-6">
                <SummaryChartCard
                  data={chartData}
                  loading={summaryQuery.isLoading}
                />
              </div>
              <div className="col-12 col-lg-6">
                <WalletListCard
                  wallets={wallets}
                  loading={walletQuery.isLoading}
                />
              </div>

              <div className="col-12">
                <TransactionsTableCard
                  transactions={transactions}
                  wallets={wallets}
                  loading={transactionsQuery.isLoading}
                  onDelete={handleDeleteTransaction}
                />
              </div>
            </div>
          </div>
        </Content>
      </Layout>

      <CreateWalletModal
        form={walletForm}
        open={walletModalOpen}
        loading={createWalletMutation.isPending}
        onSubmit={handleWalletSubmit}
        onCancel={() => setWalletModalOpen(false)}
      />

      <TransactionModal
        form={transactionForm}
        wallets={wallets}
        open={transactionModalOpen}
        loading={createTransactionMutation.isPending}
        onSubmit={handleTransactionSubmit}
        onCancel={() => setTransactionModalOpen(false)}
      />
    </Layout>
  );
};

export default Dashboard;
