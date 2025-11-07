import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, InputNumber, Select } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

function EditRecordModal({ visible, onCancel, onUpdate, record }) {
  const [form] = Form.useForm();

  // 當 `record` 或 `visible` 狀態改變時，此 effect 會執行
  useEffect(() => {
    if (visible && record) {
      // 進行更安全的轉換：只有當 record.date 存在時，才轉換為 dayjs 物件
      form.setFieldsValue({
        ...record,
        date: record.date ? dayjs(record.date) : null, // <--- 關鍵修正！
      });
    }
  }, [visible, record, form]);

  const handleUpdate = () => {
    form.validateFields().then(values => {
      // 將表單中的 dayjs 物件格式化回 'YYYY-MM-DD' 字串
      const formValues = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
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
      destroyOnClose
    >
      {/* 表單欄位名稱現在與 record 物件的 key 一致 */}
      <Form form={form} layout="vertical">
        <Form.Item label="日期" name="date" rules={[{ required: true, message: '請選擇日期!' }]}>
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
