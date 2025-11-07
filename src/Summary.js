import React, { useState } from 'react';
import { Card, Statistic, Row, Col, Button, Modal, Checkbox, Space } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

function Summary({ junTotal, youTotal, handleSettle }) {
  const difference = junTotal - youTotal;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirm1, setConfirm1] = useState(false);
  const [confirm2, setConfirm2] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    handleSettle();
    setIsModalVisible(false);
    setConfirm1(false);
    setConfirm2(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setConfirm1(false);
    setConfirm2(false);
  };

  const isOkButtonDisabled = !confirm1 || !confirm2;

  return (
    <>
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
        <Button 
          type="primary" 
          icon={<CheckOutlined />} 
          style={{ width: '100%', marginTop: 16 }}
          danger
          onClick={showModal}
        >
          結算
        </Button>
      </Card>

      <Modal
        title="確認結算"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="確定結算"
        cancelText="取消"
        okButtonProps={{ disabled: isOkButtonDisabled }}
      >
        <p>結算後，目前的紀錄將會被封存到新的工作表，無法復原。</p>
        <Space direction="vertical">
          <Checkbox checked={confirm1} onChange={(e) => setConfirm1(e.target.checked)}>
            我已確認上方應付金額無誤。
          </Checkbox>
          <Checkbox checked={confirm2} onChange={(e) => setConfirm2(e.target.checked)}>
            我了解紀錄將被封存。
          </Checkbox>
        </Space>
      </Modal>
    </>
  );
}

export default Summary;