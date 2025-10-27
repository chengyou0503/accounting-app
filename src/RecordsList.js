import React from 'react';
import { Table, Button, Space, Spin, Alert, Popconfirm, Tag } from 'antd';

function RecordsList({ records, isLoading, error, handleDelete, onEdit /* Remove other props */ }) {

  if (isLoading) {
    return <Spin tip="讀取中..." size="large" style={{ display: 'block', marginTop: '50px' }} />;
  }

  if (error) {
    return <Alert message="讀取錯誤" description={error} type="error" showIcon />;
  }

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      defaultSortOrder: 'descend',
    },
    {
      title: '項目',
      dataIndex: 'item',
      key: 'item',
    },
    {
      title: '總金額',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (text) => `NT$ ${text}`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: '付款人',
      dataIndex: 'paidBy',
      key: 'paidBy',
      render: (paidBy) => (
        <Tag color={paidBy === '均' ? 'blue' : 'green'}>{paidBy}</Tag>
      ),
      filters: [
        { text: '均', value: '均' },
        { text: '宥', value: '宥' },
      ],
      onFilter: (value, record) => record.paidBy.indexOf(value) === 0,
    },
    {
      title: '均分金額',
      dataIndex: 'splitAmount',
      key: 'splitAmount',
      render: (text) => `NT$ ${text}`,
      sorter: (a, b) => a.splitAmount - b.splitAmount,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {/* The edit functionality can be re-implemented here if needed */}
          {/* <Button type="link" onClick={() => onEdit(record)}>編輯</Button> */}
          <Popconfirm title="確定要刪除嗎？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>刪除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
     <Table 
      columns={columns} 
      dataSource={records} 
      rowKey="id" 
      pagination={{ pageSize: 5 }}
      scroll={{ x: 'max-content' }}
    />
  );
}

export default RecordsList;