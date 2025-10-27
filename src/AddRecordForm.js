import React from 'react';
import { Card, Form, Input, DatePicker, InputNumber, Select, Button } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

function AddRecordForm({
  date,
  setDate,
  item,
  setItem,
  totalAmount,
  paidBy,
  setPaidBy,
  splitAmount,
  handleSubmit,
  handleTotalAmountChange,
}) {

  const onDateChange = (date, dateString) => {
    setDate(dateString);
  };

  return (
    <Card title="新增紀錄">
      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item label="日期" required>
          <DatePicker 
            style={{ width: '100%' }} 
            onChange={onDateChange} 
            value={date ? dayjs(date) : null}
            format="YYYY-MM-DD"
          />
        </Form.Item>
        <Form.Item label="項目" required>
          <Input value={item} onChange={(e) => setItem(e.target.value)} />
        </Form.Item>
        <Form.Item label="總金額" required>
          <InputNumber 
            style={{ width: '100%' }} 
            value={totalAmount} 
            onChange={handleTotalAmountChange} 
            min={0}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
        <Form.Item label="付款人" required>
          <Select value={paidBy} onChange={(value) => setPaidBy(value)}>
            <Option value="均">均</Option>
            <Option value="宥">宥</Option>
          </Select>
        </Form.Item>
        <Form.Item label="均分金額">
          <InputNumber 
            style={{ width: '100%' }} 
            value={splitAmount} 
            disabled 
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            新增
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default AddRecordForm;
