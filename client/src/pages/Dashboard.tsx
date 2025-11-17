import {
  BankOutlined,
  LogoutOutlined,
  PlusOutlined,
  WalletOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Select,
  Statistic,
  Table,
  Tag,
  Typography,
  message
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const { Text } = Typography;
const { Header, Sider, Content } = Layout;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const showEmail =
    user?.email && !user.email.toLowerCase().endsWith('@local.dev');
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
    onError: (error: any) =>
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

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'occurredAt',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY')
    },
    {
      title: 'Ví',
      dataIndex: 'walletId',
      render: (value: string) =>
        wallets.find((wallet) => wallet._id === value)?.name || 'N/A'
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      render: (value: TransactionType) => (
        <Tag color={value === 'income' ? 'green' : 'volcano'}>
          {value === 'income' ? 'Thu' : 'Chi'}
        </Tag>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'category'
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      render: (value: number, record: Transaction) => (
        <Text strong type={record.type === 'income' ? 'success' : 'danger'}>
          {record.type === 'income' ? '+' : '-'}
          {value.toLocaleString('vi-VN')}
        </Text>
      )
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note'
    },
    {
      title: '',
      render: (_: unknown, record: Transaction) => (
        <Button
          type="link"
          danger
          onClick={() => deleteTransactionMutation.mutate(record._id)}
        >
          Xoá
        </Button>
      )
    }
  ];

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
                <Card className="dashboard-card card-animate">
                  <div className="row g-3 text-center text-md-start">
                    <div className="col-12 col-md-4">
                      <Statistic
                        title="Số dư đầu kỳ"
                        prefix="₫"
                        value={summary?.openingBalance || 0}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <Statistic
                        title="Tổng thu"
                        value={summary?.totalIncome || 0}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <Statistic
                        title="Tổng chi"
                        value={summary?.totalExpense || 0}
                        valueStyle={{ color: '#cf1322' }}
                      />
                    </div>
                  </div>
                </Card>
              </div>

              <div className="col-12">
                <Card
                  className="dashboard-card card-animate delay-1"
                  title="Bộ lọc báo cáo"
                  extra={
                    <div className="d-flex flex-wrap gap-2">
                      <Button onClick={() => setWalletModalOpen(true)}>
                        Tạo ví
                      </Button>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setTransactionModalOpen(true)}
                        disabled={!wallets.length}
                      >
                        Ghi giao dịch
                      </Button>
                    </div>
                  }
                >
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <Select
                        allowClear
                        style={{ width: '100%' }}
                        placeholder="Chọn ví"
                        value={walletFilter}
                        onChange={(val) => setWalletFilter(val)}
                        options={wallets.map((wallet) => ({
                          value: wallet._id,
                          label: wallet.name
                        }))}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <Select
                        allowClear
                        placeholder="Loại giao dịch"
                        style={{ width: '100%' }}
                        value={typeFilter}
                        onChange={(val) => setTypeFilter(val)}
                        options={[
                          { value: 'income', label: 'Thu' },
                          { value: 'expense', label: 'Chi' }
                        ]}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <DatePicker.RangePicker
                        style={{ width: '100%' }}
                        value={dateRange}
                        onChange={(range) =>
                          setDateRange(
                            range
                              ? (range as [Dayjs | null, Dayjs | null])
                              : [null, null]
                          )
                        }
                        format="DD/MM/YYYY"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              <div className="col-12 col-lg-6">
                <Card
                  title="Sức khoẻ tài chính"
                  className="dashboard-card card-animate delay-2"
                >
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={chartData}
                      margin={{ top: 16, right: 16, bottom: 0, left: 0 }}
                    >
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#4096ff" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
              <div className="col-12 col-lg-6">
                <Card
                  title="Ví của bạn"
                  className="dashboard-card card-animate delay-3"
                >
                  {wallets.map((wallet) => (
                    <Card
                      key={wallet._id}
                      size="small"
                      className="mb-3 wallet-card card-animate-sm"
                      title={wallet.name}
                      extra={wallet.currency}
                    >
                      <div className="d-flex flex-column gap-1">
                        <Text>Số TK: {wallet.accountNumber}</Text>
                        <Text>
                          Số dư hiện tại:{' '}
                          <Text strong>
                            {wallet.balance.toLocaleString('vi-VN')}
                          </Text>
                        </Text>
                      </div>
                    </Card>
                  ))}
                  {!wallets.length && (
                    <Text type="secondary">
                      Chưa có ví nào, hãy tạo ví mới để bắt đầu.
                    </Text>
                  )}
                </Card>
              </div>

              <div className="col-12">
                <Card
                  title="Lịch sử giao dịch"
                  className="dashboard-card card-animate delay-4"
                >
                  <Table
                    dataSource={transactions}
                    loading={transactionsQuery.isLoading}
                    columns={columns}
                    rowKey="_id"
                  />
                </Card>
              </div>
            </div>
          </div>
        </Content>
      </Layout>

      <Modal
        title="Tạo ví mới"
        open={walletModalOpen}
        onOk={handleWalletSubmit}
        onCancel={() => setWalletModalOpen(false)}
        confirmLoading={createWalletMutation.isPending}
      >
        <Form layout="vertical" form={walletForm}>
          <Form.Item
            label="Tên ví"
            name="name"
            rules={[{ required: true, message: 'Nhập tên ví' }]}
          >
            <Input placeholder="Ví tiền mặt" />
          </Form.Item>
          <Form.Item
            label="Số tài khoản"
            name="accountNumber"
            rules={[{ required: true, message: 'Nhập số tài khoản' }]}
          >
            <Input placeholder="123-456" />
          </Form.Item>
          <Form.Item
            label="Số dư ban đầu"
            name="initialBalance"
            initialValue={0}
            rules={[{ required: true, message: 'Nhập số dư ban đầu' }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item label="Tiền tệ" name="currency" initialValue="VND">
            <Select
              options={[
                { value: 'VND', label: 'VND' },
                { value: 'USD', label: 'USD' }
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Ghi giao dịch"
        open={transactionModalOpen}
        onOk={handleTransactionSubmit}
        onCancel={() => setTransactionModalOpen(false)}
        confirmLoading={createTransactionMutation.isPending}
      >
        <Form layout="vertical" form={transactionForm}>
          <Form.Item
            label="Ví"
            name="walletId"
            rules={[{ required: true, message: 'Chọn ví' }]}
          >
            <Select
              options={wallets.map((wallet) => ({
                value: wallet._id,
                label: wallet.name
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Loại"
            name="type"
            rules={[{ required: true, message: 'Chọn loại' }]}
          >
            <Select
              options={[
                { value: 'income', label: 'Thu' },
                { value: 'expense', label: 'Chi' }
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Số tiền"
            name="amount"
            rules={[{ required: true, message: 'Nhập số tiền' }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item
            label="Danh mục"
            name="category"
            rules={[{ required: true, message: 'Nhập danh mục' }]}
          >
            <Input placeholder="Ăn uống, Lương..." />
          </Form.Item>
          <Form.Item label="Ngày" name="occurredAt" initialValue={dayjs()}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Dashboard;
