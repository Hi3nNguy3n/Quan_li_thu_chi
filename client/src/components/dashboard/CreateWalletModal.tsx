import { Form, Input, Modal, Select } from 'antd';
import type { FormInstance } from 'antd/es/form/Form';

interface CreateWalletModalProps {
  form: FormInstance;
  open: boolean;
  loading?: boolean;
  onSubmit: () => Promise<void> | void;
  onCancel: () => void;
}

const CreateWalletModal = ({
  form,
  open,
  loading,
  onSubmit,
  onCancel
}: CreateWalletModalProps) => (
  <Modal
    title="Tạo ví mới"
    open={open}
    onOk={onSubmit}
    onCancel={onCancel}
    confirmLoading={loading}
  >
    <Form layout="vertical" form={form}>
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
);

export default CreateWalletModal;
