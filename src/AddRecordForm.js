import React from 'react';

function AddRecordForm({
  date, setDate,
  item, setItem,
  totalAmount, setTotalAmount,
  paidBy, setPaidBy,
  splitAmount, setSplitAmount,
  handleSubmit,
  handleTotalAmountChange
}) {
  return (
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
  );
}

export default AddRecordForm;
