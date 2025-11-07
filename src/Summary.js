import React from 'react';
import { Card, Statistic, Row, Col, Button, Typography, Popconfirm } from 'antd';
import { UserOutlined, PayCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Summary({ totalJunPaid, totalYouPaid, junOwesYou, handleSettle }) {

  let summaryMessage;
  const amountOwed = Math.abs(junOwesYou);

  if (amountOwed < 0.01) {
    summaryMessage = <Text style={{ fontSize: 18, color: '#52c41a' }}>雙方帳務已結清！</Text>;
  } else if (junOwesYou < 0) { // 負數代表宥欠均
    summaryMessage = (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
        <UserOutlined style={{ color: '#1890ff', marginRight: 8 }} />
        <Text strong style={{ color: '#1890ff' }}>宥</Text>
        <ArrowRightOutlined style={{ margin: '0 12px' }} />
        <Text strong style={{ color: '#ff7f50' }}>均</Text>
        <PayCircleOutlined style={{ color: 'green', marginLeft: 12, marginRight: 8 }} />
        <Text strong style={{ color: 'green' }}>${amountOwed.toFixed(0)}</Text>
      </div>
    );
  } else { // 正數代表均欠宥
    summaryMessage = (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
        <UserOutlined style={{ color: '#ff7f50', marginRight: 8 }} />
        <Text strong style={{ color: '#ff7f50' }}>均</Text>
        <ArrowRightOutlined style={{ margin: '0 12px' }} />
        <Text strong style={{ color: '#1890ff' }}>宥</Text>
        <PayCircleOutlined style={{ color: 'green', marginLeft: 12, marginRight: 8 }} />
        <Text strong style={{ color: 'green' }}>${amountOwed.toFixed(0)}</Text>
      </div>
    );
  }

  return (
    <Card style={{ marginBottom: '20px' }}>
      <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>結算</Title>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        {summaryMessage}
      </div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12} style={{ textAlign: 'center' }}>
          <Statistic title="均的總支出" value={totalJunPaid.toFixed(0)} prefix="$" valueStyle={{ color: '#ff7f50' }} />
        </Col>
        <Col span={12} style={{ textAlign: 'center' }}>
          <Statistic title="宥的總支出" value={totalYouPaid.toFixed(0)} prefix="$" valueStyle={{ color: '#1890ff' }} />
        </Col>
      </Row>
      <Popconfirm
        title="確定要結清所有帳務嗎?"
        content="這將會把目前所有紀錄封存到新的工作表中."
        onConfirm={handleSettle}
        okText="確定"
        cancelText="取消"
      >
        <Button type="primary" danger block>
          結清所有款項
        </Button>
      </Popconfirm>
    </Card>
  );
}

export default Summary;