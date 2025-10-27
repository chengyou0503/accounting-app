import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import Summary from './Summary';
import AddRecordForm from './AddRecordForm';
import RecordsList from './RecordsList';

// ==================================================================
// 你的 Google Apps Script API 網址！
const API_URL = "https://script.google.com/macros/s/AKfycbyr1Ai1AU4Fi5fhuGd03i0zOrfPt_bNh8GbOC1-amYO-btKcCHxjK0QZWwTrCdzZFJL/exec";
// ==================================================================

function App() {
  // --- State Hooks ---
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null); // For editing

  // 表單相關 State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [item, setItem] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidBy, setPaidBy] = useState('均');
  const [splitAmount, setSplitAmount] = useState('');

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
  const handleTotalAmountChange = (e) => {
    const value = e.target.value;
    setTotalAmount(value);
    if (value && !isNaN(value)) {
      setSplitAmount(Math.round(value / 2));
    } else {
      setSplitAmount('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !item || !totalAmount || !paidBy || !splitAmount) {
      alert("所有欄位都必填喔！");
      return;
    }
    const newRecord = { date, item, totalAmount: parseFloat(totalAmount), paidBy, splitAmount: parseFloat(splitAmount) };
    const tempId = `temp-${Date.now()}`;
    setRecords(prev => [{ ...newRecord, id: tempId, timestamp: new Date().toISOString() }, ...prev]);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'create', data: newRecord })
      });
      const result = await response.json();
      if (result.status !== 'success') throw new Error(result.message || 'Failed to create record.');
      await fetchRecords();
      setItem('');
      setTotalAmount('');
      setSplitAmount('');
    } catch (err) {
      alert(`新增失敗: ${err.message}`);
      setRecords(prev => prev.filter(r => r.id !== tempId));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("確定要刪除這筆紀錄嗎？")) return;
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

  const handleDeleteAll = async () => {
    if (!window.confirm("確定要刪除【所有】紀錄嗎？這個動作無法復原！")) return;
    const originalRecords = [...records];
    setRecords([]);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'deleteAll' })
      });
      const result = await response.json();
      if (result.status !== 'success') throw new Error(result.message || 'Failed to delete all records.');
    } catch (err) {
      alert(`全部刪除失敗: ${err.message}`);
      setRecords(originalRecords);
    }
  };

  // --- Edit Handlers ---
  const handleEdit = (record) => {
    setEditingId(record.id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdateRecord = async (updatedRecord) => {
    const originalRecords = [...records];
    setRecords(records.map(r => r.id === updatedRecord.id ? updatedRecord : r));
    setEditingId(null); // Exit edit mode optimistically

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
        // Optionally, re-fetch to get the final state from server
        // await fetchRecords(); 
    } catch (err) {
        alert(`更新失敗: ${err.message}`);
        setRecords(originalRecords); // Revert on error
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

  // 在這裡加入 console.log 來觀察資料
  console.log("Rendered Records:", records);

  return (
    <div className="App">
      <header className="app-header">
        <h1>我們的記帳本 🧡</h1>
      </header>
      <main className="container">
        <div className="left-panel">
          <Summary
            junTotal={junTotal}
            youTotal={youTotal}
            handleDeleteAll={handleDeleteAll}
          />
          <AddRecordForm
            date={date}
            setDate={setDate}
            item={item}
            setItem={setItem}
            totalAmount={totalAmount}
            setTotalAmount={setTotalAmount}
            paidBy={paidBy}
            setPaidBy={setPaidBy}
            splitAmount={splitAmount}
            setSplitAmount={setSplitAmount}
            handleSubmit={handleSubmit}
            handleTotalAmountChange={handleTotalAmountChange}
          />
        </div>
        <RecordsList
          records={records}
          isLoading={isLoading}
          error={error}
          handleDelete={handleDelete}
          editingId={editingId}
          onEdit={handleEdit}
          onCancelEdit={handleCancelEdit}
          onUpdate={handleUpdateRecord}
        />
      </main>
    </div>
  );
}

export default App;