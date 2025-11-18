import { DatePicker, Form, Input, Modal, Select } from 'antd';
import type { FormInstance } from 'antd/es/form/Form';
import dayjs from 'dayjs';
import type { Wallet } from '../../types';

interface TransactionModalProps {
  form: FormInstance;
  wallets: Wallet[];
  open: boolean;
  loading?: boolean;
  onSubmit: () => Promise<void> | void;
  onCancel: () => void;
}

const TransactionModal = ({
  form,
  wallets,
  open,
  loading,
  onSubmit,
  onCancel
}: TransactionModalProps) => (
  <Modal
    title="Ghi giao dịch"
    open={open}
    onOk={onSubmit}
    onCancel={onCancel}
    confirmLoading={loading}
  >
    <Form layout="vertical" form={form}>
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
);

export default TransactionModal;
