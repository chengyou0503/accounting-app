import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, InputNumber, Select } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

function EditRecordModal({ visible, onCancel, onUpdate, record }) {
  const [form] = Form.useForm();

  // This effect runs when the modal becomes visible or the record data changes.
  // It's responsible for populating the form with the correct data format.
  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue({
        // The form field for the date is named 'timestamp'
        timestamp: dayjs(record.timestamp),
        // The form field for description is named 'item'
        item: record.description,
        // The form field for amount is named 'totalAmount'
        // We must parse it to a number in case it's a string from the API
        totalAmount: parseFloat(record.amount) || 0,
        // The form field for the paidBy is named 'paidBy'
        paidBy: record.paidBy,
        // The form field for split amount is named 'splitAmount'
        splitAmount: parseFloat(record.splitAmount) || 0,
      });
    }
  }, [visible, record, form]);

  const handleUpdate = () => {
    form.validateFields().then(values => {
      // Construct the object to be sent to the backend API
      const updatedRecord = {
        // CRITICAL: Pass the original record's ID back
        id: record.id,
        // The backend expects a 'description' field
        description: values.item,
        // The backend expects an 'amount' field
        amount: parseFloat(values.totalAmount),
        // The backend expects a 'splitAmount' field
        splitAmount: parseFloat(values.splitAmount),
        // The backend expects a 'paidBy' field
        paidBy: values.paidBy,
        // The backend expects a 'timestamp' field as an ISO string
        timestamp: values.timestamp.toISOString(),
      };
      // Call the update function passed from App.js
      onUpdate(updatedRecord);
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
      destroyOnClose // This will destroy the form state when modal is closed
    >
      <Form form={form} layout="vertical">
        {/* The name here MUST match the key in setFieldsValue and the key read in handleUpdate */}
        <Form.Item label="日期" name="timestamp" rules={[{ required: true, message: '請選擇日期!' }]}>
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item label="項目" name="item" rules={[{ required: true, message: '請輸入項目!' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="總金額" name="totalAmount" rules={[{ required: true, message: '請輸入總金額!' }]}>
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
