import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import {
  GoogleOutlined,
  LineChartOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { useGoogleLogin } from '@react-oauth/google';
import type { TokenResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const { Title, Paragraph } = Typography;

const LoginPage = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [devToken, setDevToken] = useState('demo');
  const [loading, setLoading] = useState(false);
  const hasGoogle = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const featureBadges = useMemo(
    () => [
      { icon: <WalletOutlined />, label: 'Nhiều ví song song' },
      { icon: <LineChartOutlined />, label: 'Biểu đồ thời gian thực' },
      { icon: <SafetyCertificateOutlined />, label: 'Dữ liệu riêng tư' }
    ],
    []
  );

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    scope: 'email profile',
    onSuccess: async (response) => {
      const tokenResponse = response as TokenResponse & { id_token?: string };
      if (!tokenResponse.id_token) {
        message.error('Không nhận được token từ Google');
        return;
      }
      setLoading(true);
      await login(tokenResponse.id_token);
      setLoading(false);
      navigate('/');
    },
    onError: () => message.error('Đăng nhập Google thất bại')
  });

  const handleDevLogin = async () => {
    if (!devToken) {
      message.warning('Nhập token/dev email bất kỳ');
      return;
    }
    setLoading(true);
    await login(devToken);
    setLoading(false);
    navigate('/');
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  return (
    <div className="center-panel login-panel">
      <div className="login-orb orb1" />
      <div className="login-orb orb2" />
      <div className="login-orb orb3" />
      <Card className="login-card" bordered={false}>
        <div className="login-card__heading">
          <Title level={3}>Quản lý chi tiêu cá nhân</Title>
          <Paragraph type="secondary" className="login-subtitle">
            Sổ tay thu chi điện tử với báo cáo realtime và cảnh báo vượt ngân sách.
          </Paragraph>
        </div>
        <div className="login-badges">
          {featureBadges.map((item) => (
            <span className="login-badge" key={item.label}>
              {item.icon}
              {item.label}
            </span>
          ))}
        </div>
        <Button
          type="primary"
          icon={<GoogleOutlined />}
          block
          size="large"
          onClick={() => googleLogin()}
          disabled={!hasGoogle}
          loading={loading}
          className="login-btn"
        >
          Đăng nhập với Google
        </Button>

        {!hasGoogle && (
          <div className="login-dev-panel">
            <Paragraph type="secondary" className="login-dev-hint">
              Chưa cấu hình Google Client ID. Dùng chế độ phát triển bên dưới.
            </Paragraph>
            <Form layout="vertical" onFinish={handleDevLogin}>
              <Form.Item label="Dev token / email">
                <Input
                  prefix={<LockOutlined />}
                  value={devToken}
                  onChange={(e) => setDevToken(e.target.value)}
                />
              </Form.Item>
              <Button type="dashed" htmlType="submit" block loading={loading}>
                Đăng nhập nhanh
              </Button>
            </Form>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LoginPage;
