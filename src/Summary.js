import React from 'react';
import { Card, Statistic, Row, Col, Button, Popconfirm } from 'antd';
import { UserOutlined, SwapOutlined, DeleteOutlined } from '@ant-design/icons';

function Summary({ junTotal, youTotal, handleDeleteAll }) {
  const balanceText = () => {
    if (junTotal > youTotal) {
      return `宥 要給 均 NT$ ${Math.round(junTotal - youTotal)}`;
    }
    if (youTotal > junTotal) {
      return `均 要給 宥 NT$ ${Math.round(youTotal - junTotal)}`;
    }
    return '目前帳務平衡！';
  };

  return (
    <Card title="收支總覽" style={{ marginBottom: '20px' }}>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Statistic title="均的總支出" value={Math.round(junTotal)} prefix={<UserOutlined />} />
        </Col>
        <Col xs={24} md={12}>
          <Statistic title="宥的總支出" value={Math.round(youTotal)} prefix={<UserOutlined />} />
        </Col>
      </Row>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
           <Statistic title="差額計算" value={balanceText()} prefix={<SwapOutlined />} />
        </Col>
      </Row>
      <Popconfirm
        title="確定要刪除所有紀錄嗎？"
        description="這個動作無法復原！"
        onConfirm={handleDeleteAll}
        okText="確定刪除"
        cancelText="取消"
      >
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          style={{ width: '100%', marginTop: '20px' }}
        >
          刪除所有紀錄
        </Button>
      </Popconfirm>
    </Card>
  );
}

export default Summary;