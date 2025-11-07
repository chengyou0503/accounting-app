import React from 'react';
import { Card, Form, Input, DatePicker, InputNumber, Select, Button } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

function AddRecordForm({ API_URL, onSuccess }) {
  const [form] = Form.useForm();

  const handleTotalAmountChange = (value) => {
    if (value && !isNaN(value)) {
      form.setFieldsValue({ splitAmount: Math.round(value / 2) });
    } else {
      form.setFieldsValue({ splitAmount: '' });
    }
  };

  const handleSubmit = async (values) => {
    // 將前端表單欄位對應到後端試算表欄位
    const newRecord = {
      description: values.item,
      category: values.item, // 暫時讓分類與項目相同
      amount: parseFloat(values.totalAmount),
      splitAmount: parseFloat(values.splitAmount),
      paidBy: values.paidBy,
      // 注意：日期和時間戳記由後端 Apps Script 自動生成，前端不需發送
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'create', data: newRecord })
      });
      const result = await response.json();
      if (result.status !== 'success') throw new Error(result.message || 'Failed to create record.');
      form.resetFields();
      onSuccess(); // Notify parent to refetch
    } catch (err) {
      alert(`新增失敗: ${err.message}`);
    }
  };

  return (
    <Card title="新增紀錄">
      <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={{ paidBy: '均', date: dayjs() }}>
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
        <Form.Item label="分攤金額" name="splitAmount">
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            新增紀錄
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default AddRecordForm;
