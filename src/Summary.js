import React from 'react';
import { Card, Statistic, Row, Col, Button, Popconfirm } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

function Summary({ junTotal, youTotal, handleSettle }) {
  const difference = junTotal - youTotal;

  return (
    <Card title="總結" style={{ marginBottom: 20 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Statistic title="均的總支出" value={Math.round(junTotal)} prefix="$" />
        </Col>
        <Col span={12}>
          <Statistic title="宥的總支出" value={Math.round(youTotal)} prefix="$" />
        </Col>
      </Row>
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        {difference > 0 ? (
          <p>宥要給均 ${Math.round(difference / 2)}</p>
        ) : (
          <p>均要給宥 ${Math.round(Math.abs(difference) / 2)}</p>
        )}
      </div>
      <Popconfirm
        title="確定要結算嗎？"
        description="目前的紀錄將會被封存到新的工作表。"
        onConfirm={handleSettle}
        okText="確定"
        cancelText="取消"
      >
        <Button 
          type="primary" 
          icon={<CheckOutlined />} 
          style={{ width: '100%', marginTop: 16 }}
          danger
        >
          ✔️ 結算
        </Button>
      </Popconfirm>
    </Card>
  );
}

export default Summary;