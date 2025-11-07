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

  const junRecords = records; // TEMPORARY: Display all records to ensure rendering works
  const youRecords = []; // TEMPORARY: Clear this list

  const renderRecordCard = (record) => (
    <Card 
      key={record.id} 
      style={{ marginBottom: '16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      bodyStyle={{ padding: '16px' }}
    >
      <Row align="middle" gutter={16}>
        <Col flex="auto">
          <Text strong style={{ fontSize: '16px' }}>{record.description}</Text>
          <br />
          <Text type="secondary">{dayjs(record.date).format('YYYY-MM-DD')}</Text>
        </Col>
        <Col flex="120px" style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: '16px' }}>總額: ${Math.round(record.amount)}</Text>
          <br />
          <Text type="secondary">分攤: ${Math.round(record.splitAmount)}</Text>
        </Col>
        <Col flex="none" style={{ width: '90px', textAlign: 'right' }}>
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)} size="small" style={{ marginRight: 4 }} />
          <Popconfirm
            title="確定要刪除這筆紀錄嗎？"
            onConfirm={() => handleDelete(record.id)}
            okText="確定"
            cancelText="取消"
          >
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Col>
      </Row>
    </Card>
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