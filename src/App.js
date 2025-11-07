import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout, Row, Col, ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import './App.css';
import Summary from './Summary';
import AddRecordForm from './AddRecordForm';
import RecordsList from './RecordsList';
import EditRecordModal from './EditRecordModal';

const { Header, Content } = Layout;

// ==================================================================
// 你的 Google Apps Script API 網址！
const API_URL = "https://script.google.com/macros/s/AKfycbwa-jVahnBkoP82KQyf_6vUqvXDuMQFXU_3PRlglpi7frWk1X7aYX5898vrJmuy4enx/exec";
// ==================================================================

const cuteTheme = {
  token: {
    colorPrimary: '#ff7f50', // Coral Pink
    borderRadius: 8,
    fontFamily: 'Nunito, sans-serif',
  },
};

function App() {
  // --- State Hooks ---
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // --- Data Fetching ---
  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}?action=read`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.status === 'success') {
        setRecords(result.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } else {
        throw new Error(result.message || 'Failed to fetch data from API.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // --- Event Handlers ---
  const handleFormSuccess = () => {
    fetchRecords();
  };

  const handleDelete = async (id) => {
    const originalRecords = [...records];
    setRecords(prev => prev.filter(record => record.id !== id));
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'delete', data: { id } })
      });
      const result = await response.json();
      if (result.status !== 'success') throw new Error(result.message || 'Failed to delete record.');
    } catch (err) {
      alert(`刪除失敗: ${err.message}`);
      setRecords(originalRecords);
    }
  };

  const handleSettle = async () => {
    const originalRecords = [...records];
    setRecords([]); //樂觀更新，立即清空畫面
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'settle' }) // 改為 settle action
      });
      const result = await response.json();
      if (result.status !== 'success') throw new Error(result.message || 'Failed to settle records.');
       alert('結算成功！紀錄已封存到新的工作表。');
    } catch (err) {
      alert(`結算失敗: ${err.message}`);
      setRecords(originalRecords); // 如果失敗，恢復記錄
    }
  };

  // --- Edit Handlers ---
  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsEditModalVisible(true);
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setEditingRecord(null);
  };

  const handleUpdateRecord = async (updatedRecord) => {
    const originalRecords = [...records];
    setRecords(records.map(r => r.id === updatedRecord.id ? updatedRecord : r));
    setIsEditModalVisible(false);
    setEditingRecord(null);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'update', data: updatedRecord })
        });
        const result = await response.json();
        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to update record.');
        }
    } catch (err) {
        alert(`更新失敗: ${err.message}`);
        setRecords(originalRecords);
    }
  };

  // --- 計算總額 ---
  const [junTotal, youTotal] = useMemo(() => {
    return records.reduce((acc, record) => {
      const amount = parseFloat(record.splitAmount) || 0;
      if (record.paidBy === '均') acc[0] += amount;
      else if (record.paidBy === '宥') acc[1] += amount;
      return acc;
    }, [0, 0]);
  }, [records]);

  return (
    <ConfigProvider theme={cuteTheme}>
      <Layout className="layout">
        <Header style={{ background: cuteTheme.token.colorPrimary, textAlign: 'center', padding: 0, borderBottom: '1px solid #f0f0f0' }}>
          <h1 style={{ color: 'white' }}>我們的記帳本 🧡</h1>
        </Header>
        <Content style={{ padding: '20px 50px' }}>
          <div className="site-layout-content" style={{ background: '#fff', padding: 24, minHeight: 280, borderRadius: cuteTheme.token.borderRadius }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={8}>
                <Summary
                  junTotal={junTotal}
                  youTotal={youTotal}
                  handleSettle={handleSettle}
                />
                <AddRecordForm
                  API_URL={API_URL}
                  onSuccess={handleFormSuccess}
                />
              </Col>
              <Col xs={24} lg={16}>
                <RecordsList
                  records={records}
                  isLoading={isLoading}
                  error={error}
                  handleDelete={handleDelete}
                  onEdit={handleEdit}
                />
              </Col>
            </Row>
          </div>
        </Content>
        {editingRecord && (
          <EditRecordModal
            visible={isEditModalVisible}
            onCancel={handleCancelEdit}
            onUpdate={handleUpdateRecord}
            record={editingRecord}
          />
        )}
      </Layout>
    </ConfigProvider>
  );
}

export default App;