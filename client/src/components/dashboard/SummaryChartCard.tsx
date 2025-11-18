import { Card } from 'antd';
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface SummaryChartCardProps {
  data: { label: string; value: number }[];
  loading?: boolean;
  title?: string;
  height?: number;
}

const SummaryChartCard = ({
  data,
  loading,
  title = 'Sức khoẻ tài chính',
  height = 240
}: SummaryChartCardProps) => (
  <Card
    className="dashboard-card card-animate delay-2"
    title={title}
    loading={loading}
  >
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#1890ff" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Card>
);

export default SummaryChartCard;
