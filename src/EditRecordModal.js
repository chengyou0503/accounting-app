import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, InputNumber, Select } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

function EditRecordModal({ visible, onCancel, onUpdate, record }) {
  const [form] = Form.useForm();

  // This effect correctly populates the form when the modal opens.
  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue({
        timestamp: dayjs(record.timestamp),
        description: record.description,
        amount: parseFloat(record.amount) || 0,
        paidBy: record.paidBy,
        splitAmount: parseFloat(record.splitAmount) || 0,
      });
    }
  }, [visible, record, form]);

  const handleUpdate = () => {
    form.validateFields().then(values => {
      // We only pass the raw form values up.
      // The parent component (App.js) will be responsible for adding the ID.
      const formValues = {
        ...values,
        timestamp: values.timestamp.toISOString(),
      };
      onUpdate(formValues);
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  return (
    <Modal
      visible={visible}
      title="編輯紀錄"
      onCancel={onCancel}
      onOk={handleUpdate}
      okText="更新"
      cancelText="取消"
      destroyOnClose // Ensures the form is reset every time it's closed.
    >
      {/* Form field names now match the API keys directly */}
      <Form form={form} layout="vertical">
        <Form.Item label="日期" name="timestamp" rules={[{ required: true, message: '請選擇日期!' }]}>
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item label="項目" name="description" rules={[{ required: true, message: '請輸入項目!' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="總金額" name="amount" rules={[{ required: true, message: '請輸入總金額!' }]}>
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
        <Form.Item label="付款人" name="paidBy" rules={[{ required: true, message: '請選擇付款人!' }]}>
          <Select>
            <Option value="均">均</Option>
            <Option value="宥">宥</Option>
          </Select>
        </Form.Item>
        <Form.Item label="分攤金額" name="splitAmount">
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default EditRecordModal;
