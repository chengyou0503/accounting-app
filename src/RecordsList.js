import React from 'react';
import { List, Card, Button, Spin, Alert, Popconfirm, Tag, Dropdown, Menu } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

function RecordsList({ records, isLoading, error, handleDelete, onEdit }) {

  if (isLoading) {
    return <Spin tip="讀取中..." size="large" style={{ display: 'block', marginTop: '50px' }} />;
  }
  
  if (error) {
    return <Alert message="讀取錯誤" description={error} type="error" showIcon />;
  }

  const renderItem = (record) => {
    const menu = (
      <Menu>
        <Menu.Item key="edit" onClick={() => onEdit(record)}>
          編輯
        </Menu.Item>
        <Menu.Item key="delete">
          <Popconfirm title="確定要刪除嗎？" onConfirm={() => handleDelete(record.id)}>
            <span style={{ color: 'red' }}>刪除</span>
          </Popconfirm>
        </Menu.Item>
      </Menu>
    );

    return (
      <List.Item>
        <Card 
          style={{ width: '100%' }}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{record.item}</span>
              <Tag color={record.paidBy === '均' ? 'blue' : 'green'}>{record.paidBy} 付款</Tag>
            </div>
          }
          extra={
            <Dropdown overlay={menu} trigger={['click']}>
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          }
        >
          <p><strong>日期:</strong> {dayjs(record.date).format('YYYY-MM-DD')}</p>
          <p><strong>總金額:</strong> NT$ {record.totalAmount}</p>
          <p><strong>均分金額:</strong> NT$ {record.splitAmount}</p>
        </Card>
      </List.Item>
    );
  };

  return (
     <List
      grid={{
        gutter: 16,
        xs: 1,
        sm: 1,
        md: 2,
        lg: 2,
        xl: 3,
        xxl: 3,
      }}
      dataSource={records}
      renderItem={renderItem}
      pagination={{
        onChange: page => {
          console.log(page);
        },
        pageSize: 6,
      }}
    />
  );
}

export default RecordsList;