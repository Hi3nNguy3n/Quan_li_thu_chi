import { Button, Card, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import type { Transaction, TransactionType, Wallet } from '../../types';

const { Text } = Typography;

interface TransactionsTableCardProps {
  transactions: Transaction[];
  wallets: Wallet[];
  loading?: boolean;
  onDelete: (transactionId: string) => void;
}

const TransactionsTableCard = ({
  transactions,
  wallets,
  loading,
  onDelete
}: TransactionsTableCardProps) => {
  const walletNameMap = useMemo(
    () =>
      wallets.reduce<Record<string, string>>((acc, wallet) => {
        acc[wallet._id] = wallet.name;
        return acc;
      }, {}),
    [wallets]
  );

  const columns: ColumnsType<Transaction> = useMemo(
    () => [
      {
        title: 'Ngày',
        dataIndex: 'occurredAt',
        render: (value: string) => dayjs(value).format('DD/MM/YYYY')
      },
      {
        title: 'Ví',
        dataIndex: 'walletId',
        render: (value: string) => walletNameMap[value] || 'N/A'
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
          <Button type="link" danger onClick={() => onDelete(record._id)}>
            Xoá
          </Button>
        )
      }
    ],
    [onDelete, walletNameMap]
  );

  return (
    <Card
      title="Lịch sử giao dịch"
      className="dashboard-card card-animate delay-4"
    >
      <Table
        dataSource={transactions}
        loading={loading}
        columns={columns}
        rowKey="_id"
      />
    </Card>
  );
};

export default TransactionsTableCard;
