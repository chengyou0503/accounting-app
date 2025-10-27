import React from 'react';

function Summary({ junTotal, youTotal, handleDeleteAll }) {
  return (
    <div className="summary-container card">
      <h2>收支總覽</h2>
      <div className="summary-item">
        <span>均的總支出</span>
        <span className="amount">NT$ {Math.round(junTotal)}</span>
      </div>
      <div className="summary-item">
        <span>宥的總支出</span>
        <span className="amount">NT$ {Math.round(youTotal)}</span>
      </div>
      <div className="summary-balance">
        {junTotal > youTotal && `宥 要給 均 NT$ ${Math.round(junTotal - youTotal)}`}
        {youTotal > junTotal && `均 要給 宥 NT$ ${Math.round(youTotal - junTotal)}`}
        {youTotal === junTotal && `目前帳務平衡！`}
      </div>
      <button onClick={handleDeleteAll} className="delete-all-btn">
        刪除所有紀錄
      </button>
    </div>
  );
}

export default Summary;