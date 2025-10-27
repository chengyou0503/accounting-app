import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, InputNumber, Select, Button } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

function EditRecordModal({ visible, onCancel, onUpdate, record }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (record) {
      form.setFieldsValue({
        ...record,
        date: dayjs(record.date),
      });
    }
  }, [record, form]);

  const handleTotalAmountChange = (value) => {
    if (value && !isNaN(value)) {
      form.setFieldsValue({ splitAmount: Math.round(value / 2) });
    } else {
      form.setFieldsValue({ splitAmount: '' });
    }
  };

  const handleUpdate = () => {
    form.validateFields().then(values => {
      const updatedRecord = {
        ...record,
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        totalAmount: parseFloat(values.totalAmount),
        splitAmount: Math.round(parseFloat(values.totalAmount) / 2),
      };
      onUpdate(updatedRecord);
    });
  };

  return (
    <Modal
      title="編輯紀錄"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleUpdate}>
          更新
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{ paidBy: '均' }}>
        <Form.Item label="日期" name="date" rules={[{ required: true, message: '請選擇日期!' }]}>
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item label="項目" name="item" rules={[{ required: true, message: '請輸入項目!' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="總金額" name="totalAmount" rules={[{ required: true, message: '請輸入總金額!' }]}>
          <InputNumber
            style={{ width: '100%' }}
            onChange={handleTotalAmountChange}
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
        <Form.Item label="均分金額" name="splitAmount">
          <InputNumber
            style={{ width: '100%' }}
            disabled
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default EditRecordModal;
