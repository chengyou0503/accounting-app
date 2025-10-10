import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// ==================================================================
// 你的 Google Apps Script API 網址！
const API_URL = "https://script.google.com/macros/s/AKfycbyr1Ai1AU4Fi5fhuGd03i0zOrfPt_bNh8GbOC1-amYO-btKcCHxjK0QZWwTrCdzZFJL/exec";
// ==================================================================

function App() {
  // --- State Hooks ---
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 表單相關 State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [item, setItem] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidBy, setPaidBy] = useState('均');
  const [splitAmount, setSplitAmount] = useState('');

  // --- Data Fetching ---
  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null); // 每次重新抓取時, 都清除舊的錯誤訊息
    try {
      const response = await fetch(`${API_URL}?action=read`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.status === 'success') {
        // 將資料倒序排列, 最新的在最上面
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
    // UX 優化：自動計算分攤金額
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

    const newRecord = {
      date,
      item,
      totalAmount: parseFloat(totalAmount),
      paidBy,
      splitAmount: parseFloat(splitAmount),
    };

    const tempId = `temp-${Date.now()}`;
    setRecords(prev => [{ ...newRecord, id: tempId, timestamp: new Date().toISOString() }, ...prev]);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'cors', // 即使是 text/plain, 有些瀏覽器仍需要 cors 設定
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'create', data: newRecord })
      });
      const result = await response.json();
      
      if (result.status !== 'success') {
        throw new Error(result.message || 'Failed to create record.');
      }
      
      await fetchRecords(); 
      
      setItem('');
      setTotalAmount('');
      setSplitAmount('');
      setDate(new Date().toISOString().split('T')[0]);

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
          if (result.status !== 'success') {
              throw new Error(result.message || 'Failed to delete record.');
          }
      } catch (err) {
          alert(`刪除失敗: ${err.message}`);
          setRecords(originalRecords); // 還原 UI
      }
  }
  
  // --- 計算總額 ---
  const [junTotal, youTotal] = records.reduce((acc, record) => {
      // 確保 splitAmount 是數字
      const amount = parseFloat(record.splitAmount) || 0;
      if (record.paidBy === '均') {
          acc[0] += amount;
      } else if (record.paidBy === '宥') {
          acc[1] += amount;
      }
      return acc;
  }, [0, 0]);


  return (
    <div className="App">
      <header className="app-header">
        <h1>我們的記帳本 🧡</h1>
      </header>
      <main className="container">
        <div className="left-panel">
            {/* --- 統計面板 --- */}
            <div className="summary-container card">
                <h2>收支總覽</h2>
                <div className="summary-item">
                    <span>均的回收款</span>
                    <span className="amount">NT$ {Math.round(junTotal)}</span>
                </div>
                <div className="summary-item">
                    <span>宥的回收款</span>
                    <span className="amount">NT$ {Math.round(youTotal)}</span>
                </div>
                <div className="summary-balance">
                   {junTotal > youTotal && `宥 要給 均 NT$ ${Math.round(junTotal - youTotal)}`}
                   {youTotal > junTotal && `均 要給 宥 NT$ ${Math.round(youTotal - junTotal)}`}
                   {youTotal === junTotal && `目前帳務平衡！`}
                </div>
            </div>

            {/* --- 新增表單 --- */}
            <div className="form-container card">
              <h2>新增一筆帳目</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>日期</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>消費項目</label>
                  <input type="text" placeholder="晚餐、買菜..." value={item} onChange={e => setItem(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>總金額</label>
                  <input type="number" placeholder="320" value={totalAmount} onChange={handleTotalAmountChange} required />
                </div>
                <div className="form-group">
                  <label>支付者</label>
                  <div className="radio-group">
                    <label className={`radio-label ${paidBy === '均' ? 'checked' : ''}`}>
                      <input type="radio" name="paidBy" value="均" checked={paidBy === '均'} onChange={e => setPaidBy(e.target.value)} /> 均
                    </label>
                    <label className={`radio-label ${paidBy === '宥' ? 'checked' : ''}`}>
                      <input type="radio" name="paidBy" value="宥" checked={paidBy === '宥'} onChange={e => setPaidBy(e.target.value)} /> 宥
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>個人分攤金額</label>
                  <input type="number" placeholder="160" value={splitAmount} onChange={e => setSplitAmount(e.target.value)} required />
                </div>
                <button type="submit" className="submit-btn">新增紀錄</button>
              </form>
            </div>
        </div>

        {/* --- 帳目列表 --- */}
        <div className="records-container">
          <h2>帳目列表</h2>
          {isLoading && <div className="loader"></div>}
          {error && <p className="error-message">讀取錯誤: {error}</p>}
          {!isLoading && !error && (
            <div className="records-list">
              {records.length === 0 
                ? <p>目前沒有任何紀錄喔！</p>
                : records.map(record => (
                <div key={record.id} className="card record-card">
                  <div className="record-details">
                    <span className="record-date">{new Date(record.date).toLocaleDateString()}</span>
                    <strong className="record-item">{record.item}</strong>
                    <span className="record-paidBy">支付者: {record.paidBy}</span>
                    <span className="record-amount">
                      ${record.totalAmount} (個人分攤 ${record.splitAmount})
                    </span>
                  </div>
                  <button onClick={() => handleDelete(record.id)} className="delete-btn">×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;