import React from 'react';
import { Card, Button, Spin, Alert, Row, Col, Typography, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function RecordsList({ records, isLoading, error, handleDelete, onEdit }) {

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (error) {
    return <Alert message="錯誤" description={error} type="error" showIcon />;
  }

  const junRecords = records.filter(r => r.paidBy && r.paidBy.trim() === '均');
  const youRecords = records.filter(r => r.paidBy && r.paidBy.trim() === '宥');

  const renderRecordCard = (record) => (
    <div key={record.id} style={{ border: '1px solid red', padding: '10px', margin: '5px' }}>
      <p>項目: {record.description}</p>
      <p>付款人: {record.paidBy}</p>
      <p>總金額: {record.amount}</p>
    </div>
  );

  return (
    <div>
      <Title level={4} style={{ borderBottom: '2px solid #ff7f50', paddingBottom: '8px', marginBottom: '16px' }}>
        均的紀錄
      </Title>
      {junRecords.length > 0 ? junRecords.map(renderRecordCard) : <Text>沒有紀錄</Text>}

      <Title level={4} style={{ borderBottom: '2px solid #1890ff', paddingBottom: '8px', marginTop: '32px', marginBottom: '16px' }}>
        宥的紀錄
      </Title>
      {youRecords.length > 0 ? youRecords.map(renderRecordCard) : <Text>沒有紀錄</Text>}
    </div>
  );
}

export default RecordsList;