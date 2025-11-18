import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Select } from 'antd';
import type { Dayjs } from 'dayjs';
import type { TransactionType, Wallet } from '../../types';

const { RangePicker } = DatePicker;

interface ReportFiltersCardProps {
  wallets: Wallet[];
  walletFilter?: string;
  typeFilter?: TransactionType;
  dateRange: [Dayjs | null, Dayjs | null];
  onWalletChange: (walletId?: string) => void;
  onTypeChange: (type?: TransactionType) => void;
  onDateChange: (range: [Dayjs | null, Dayjs | null]) => void;
  onCreateWallet: () => void;
  onAddTransaction: () => void;
  disableAddTransaction?: boolean;
  walletLoading?: boolean;
}

const ReportFiltersCard = ({
  wallets,
  walletFilter,
  typeFilter,
  dateRange,
  onWalletChange,
  onTypeChange,
  onDateChange,
  onCreateWallet,
  onAddTransaction,
  disableAddTransaction,
  walletLoading
}: ReportFiltersCardProps) => (
  <Card
    className="dashboard-card card-animate delay-1"
    title="Bộ lọc báo cáo"
    extra={
      <div className="d-flex flex-wrap gap-2">
        <Button onClick={onCreateWallet}>Tạo ví</Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAddTransaction}
          disabled={disableAddTransaction}
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
          loading={walletLoading}
          onChange={(value) => onWalletChange(value)}
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
          onChange={(value) => onTypeChange(value as TransactionType | undefined)}
          options={[
            { value: 'income', label: 'Thu' },
            { value: 'expense', label: 'Chi' }
          ]}
        />
      </div>
      <div className="col-12 col-md-4">
        <RangePicker
          style={{ width: '100%' }}
          value={dateRange}
          format="DD/MM/YYYY"
          onChange={(values) => onDateChange([values?.[0] || null, values?.[1] || null])}
        />
      </div>
    </div>
  </Card>
);

export default ReportFiltersCard;
