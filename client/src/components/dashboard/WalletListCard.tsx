import { Card, Typography } from 'antd';
import type { Wallet } from '../../types';

const { Text } = Typography;

interface WalletListCardProps {
  wallets: Wallet[];
  loading?: boolean;
}

const WalletListCard = ({ wallets, loading }: WalletListCardProps) => (
  <Card
    title="Ví của bạn"
    className="dashboard-card card-animate delay-3"
    loading={loading}
  >
    {wallets.length ? (
      wallets.map((wallet) => (
        <Card.Grid
          key={wallet._id}
          style={{ width: '100%', textAlign: 'left' }}
        >
          <div className="d-flex justify-content-between">
            <div>
              <Text strong>{wallet.name}</Text>
              <div className="text-muted">{wallet.accountNumber}</div>
            </div>
            <div className="text-end">
              <Text>Số dư</Text>
              <div>
                <Text strong>{wallet.balance.toLocaleString('vi-VN')}</Text>
              </div>
            </div>
          </div>
        </Card.Grid>
      ))
    ) : (
      <Text type="secondary">
        Chưa có ví nào, hãy tạo ví mới để bắt đầu.
      </Text>
    )}
  </Card>
);

export default WalletListCard;
