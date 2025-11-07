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
const API_URL = "https://script.google.com/macros/s/AKfycbxPi2jIz1JirWJ6-kf8Ow3qqZiAzQ6GJBq8fdkZKtGdr60teww4HnT4ov_cVmqeeqjR/exec";
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
    console.log("1. [fetchRecords] 開始獲取資料...");
    try {
      const response = await fetch(`${API_URL}?action=read`);
      console.log("2. [fetchRecords] 收到來自 API 的回應:", response);
      if (!response.ok) throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
      const result = await response.json();
      console.log("3. [fetchRecords] 解析後的 JSON 結果:", result);
      if (result.status === 'success' && Array.isArray(result.data)) {
        console.log("4. [fetchRecords] API 請求成功，準備設定 records 狀態:", result.data);
        setRecords(result.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } else {
        console.error("API 回傳的資料格式不正確，result.data 不是一個陣列:", result.data);
        throw new Error(result.message || 'API 回傳的資料格式不正確。');
      }
    } catch (err) {
      console.error("5. [fetchRecords] 在 try-catch 區塊捕獲到錯誤:", err);
      setError(err.message);
    } finally {
      console.log("6. [fetchRecords] 執行結束。");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // --- Event Handlers ---
  const handleFormSuccess = (newRecord) => {
    console.log("handleFormSuccess: 收到新紀錄:", newRecord);
    setRecords(prevRecords => {
      const updatedRecords = [newRecord, ...prevRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
      console.log("handleFormSuccess: 更新後的 records 狀態:", updatedRecords);
      return updatedRecords;
    });
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

  const handleUpdateRecord = async (formValues) => {
    // Close the modal immediately.
    setIsEditModalVisible(false);

    // Construct the final record object, ensuring the original ID is included.
    const updatedRecord = {
      id: editingRecord.id,
      ...formValues,
    };
    
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
        // On success, refetch all records from the source of truth.
        fetchRecords();
    } catch (err) {
        alert(`更新失敗: ${err.message}`);
        // Also refetch on error to ensure UI consistency.
        fetchRecords();
    }
  };

  // --- 計算總額 ---
  const { totalJunPaid, totalYouPaid, junOwesYou } = useMemo(() => {
    console.log("useMemo: 正在計算總額，records:", records);
    let totalJunPaid = 0;
    let totalYouPaid = 0;
    let junOwesYou = 0; // 正數代表均欠宥，負數代表宥欠均

    records.forEach(record => {
      console.log("useMemo loop: 正在處理 record，paidBy 的值是:", record.paidBy);
      const amount = parseFloat(record.amount) || 0;
      const splitAmount = parseFloat(record.splitAmount) || 0;

      if (record.paidBy === '均') {
        totalJunPaid += amount;
        junOwesYou -= splitAmount;
      } else if (record.paidBy === '宥') {
        totalYouPaid += amount;
        junOwesYou += splitAmount;
      }
    });
    console.log("useMemo: 計算結果 - totalJunPaid:", totalJunPaid, ", totalYouPaid:", totalYouPaid, ", junOwesYou:", junOwesYou);
    return { 
      totalJunPaid,
      totalYouPaid,
      junOwesYou
    };
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
                  totalJunPaid={totalJunPaid}
                  totalYouPaid={totalYouPaid}
                  junOwesYou={junOwesYou}
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