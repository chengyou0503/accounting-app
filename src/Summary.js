import React from 'react';
import { Card, Statistic, Row, Col, Button, Typography, Popconfirm } from 'antd';
import { UserOutlined, ArrowRightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Summary({ totalJunPaid, totalYouPaid, junOwesYou, handleSettle }) {

  const amountOwed = Math.abs(junOwesYou);
  let payer = null;
  let receiver = null;
  let payerColor = '';
  let receiverColor = '';

  if (junOwesYou < 0) { // 負數代表宥欠均
    payer = '宥';
    receiver = '均';
    payerColor = '#1890ff';
    receiverColor = '#ff7f50';
  } else if (junOwesYou > 0) { // 正數代表均欠宥
    payer = '均';
    receiver = '宥';
    payerColor = '#ff7f50';
    receiverColor = '#1890ff';
  }

  return (
    <Card style={{ marginBottom: '20px' }}>
      <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>結算</Title>
      
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        {amountOwed < 0.01 ? (
          <Statistic
            title="帳務狀況"
            value="已結清"
            valueStyle={{ color: '#52c41a' }}
          />
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>
              <UserOutlined style={{ color: payerColor, marginRight: 8 }} />
              <Text strong style={{ color: payerColor }}>{payer}</Text>
              <ArrowRightOutlined style={{ margin: '0 16px' }} />
              <UserOutlined style={{ color: receiverColor, marginRight: 8 }} />
              <Text strong style={{ color: receiverColor }}>{receiver}</Text>
            </div>
            <Statistic
              title="應付金額"
              value={amountOwed.toFixed(0)}
              prefix="$"
              valueStyle={{ color: '#3f3f3f' }}
            />
          </>
        )}
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