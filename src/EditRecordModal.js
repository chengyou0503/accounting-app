import React from 'react';
import { Modal, Form, Input, DatePicker, InputNumber, Select } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

function EditRecordModal({ visible, onCancel, onUpdate, record }) {
  const [form] = Form.useForm();

  // 偵錯用：當 modal 可見且有 record 時，印出 record 內容
  if (visible && record) {
    console.log("[EditRecordModal] 接收到的 record:", record);
    console.log("[EditRecordModal] record.date 的值:", record.date);
  }

  const handleUpdate = () => {
    form.validateFields().then(values => {
      const formValues = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      };
      onUpdate(formValues);
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const initialValues = {
    ...record,
    date: record && record.date ? dayjs(record.date) : dayjs(),
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
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item label="日期" name="date" rules={[{ required: true, message: '請選擇日期!' }]}>
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" allowClear={false} />
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
