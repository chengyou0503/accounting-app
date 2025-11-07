import React from 'react';
import { Card, Button, Spin, Alert, Row, Col, Typography, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function RecordsList({ records, isLoading, error, handleDelete, onEdit }) {

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
  }

  if (error) {
    return <Alert message="錯誤" description={error} type="error" showIcon />;
  }

  // 根據 paidBy 的值將紀錄分類
  const junRecords = records.filter(r => r.paidBy === '均');
  const youRecords = records.filter(r => r.paidBy === '宥');
  const unconfirmedRecords = records.filter(r => r.paidBy === '待確認');

  const renderRecordCard = (record, isUnconfirmed = false) => (
    <Card 
      key={record.id} 
      style={{ 
        marginBottom: '16px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: isUnconfirmed ? '1px solid #ff4d4f' : 'none' // 待確認的紀錄顯示紅色邊框
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <Row align="middle" gutter={16}>
        {isUnconfirmed && (
          <Col flex="24px">
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />
          </Col>
        )}
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
      {unconfirmedRecords.length > 0 && (
        <>
          <Title level={4} style={{ borderBottom: '2px solid #ff4d4f', paddingBottom: '8px', marginBottom: '16px', color: '#ff4d4f' }}>
            待確認紀錄
          </Title>
          {unconfirmedRecords.map(record => renderRecordCard(record, true))}
        </>
      )}

      <Title level={4} style={{ borderBottom: '2px solid #ff7f50', paddingBottom: '8px', marginBottom: '16px', marginTop: '32px' }}>
        均的紀錄
      </Title>
      {junRecords.length > 0 ? junRecords.map(record => renderRecordCard(record)) : <Text>沒有紀錄</Text>}

      <Title level={4} style={{ borderBottom: '2px solid #1890ff', paddingBottom: '8px', marginTop: '32px', marginBottom: '16px' }}>
        宥的紀錄
      </Title>
      {youRecords.length > 0 ? youRecords.map(record => renderRecordCard(record)) : <Text>沒有紀錄</Text>}
    </div>
  );
}

export default RecordsList;