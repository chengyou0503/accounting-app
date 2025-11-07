import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, InputNumber, Select, Button } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

function EditRecordModal({ visible, onCancel, onUpdate, record }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && record) {
      form.setFieldsValue({
        ...record,
        // 將 ISO 字串時間戳轉換為 dayjs 物件以供 DatePicker 使用
        timestamp: dayjs(record.timestamp), 
        // 確保 description 欄位被正確對應到 item 欄位
        item: record.description,
        totalAmount: record.amount
      });
    }
  }, [visible, record, form]);

  const handleUpdate = () => {
    form.validateFields().then(values => {
      const updatedRecord = {
        ...record, // 確保 id 等欄位被保留
        description: values.item,
        amount: parseFloat(values.totalAmount),
        splitAmount: parseFloat(values.splitAmount),
        paidBy: values.paidBy,
        // 後端會處理 timestamp，但為了保持資料一致性，我們傳遞更新後的日期
        timestamp: values.timestamp.toISOString(),
      };
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
    >
      <Form form={form} layout="vertical">
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
