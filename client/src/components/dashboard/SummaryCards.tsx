import { Card, Statistic } from 'antd';
import type { SummaryReport } from '../../types';

interface SummaryCardsProps {
  summary?: SummaryReport;
  loading?: boolean;
}

const SummaryCards = ({ summary, loading }: SummaryCardsProps) => (
  <Card className="dashboard-card card-animate" loading={loading}>
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
);

export default SummaryCards;
