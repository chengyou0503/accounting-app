import React, { useState } from 'react';

function RecordItem({ record, onDelete, onEdit, onCancel, onUpdate, isEditing }) {
  const [editedRecord, setEditedRecord] = useState(record);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedRecord({ ...editedRecord, [name]: value });
  };

  const handleUpdate = () => {
    // Basic validation
    if (!editedRecord.item || !editedRecord.totalAmount || !editedRecord.splitAmount) {
      alert('項目、總金額和分攤金額為必填！');
      return;
    }
    onUpdate(editedRecord);
  };

  if (isEditing) {
    return (
      <div className="card record-card editing">
        <div className="record-details">
          <input
            type="date"
            name="date"
            value={editedRecord.date.split('T')[0]} // Handle date format
            onChange={handleInputChange}
            className="edit-input"
          />
          <input
            type="text"
            name="item"
            value={editedRecord.item}
            onChange={handleInputChange}
            className="edit-input"
          />
          <input
            type="number"
            name="totalAmount"
            value={editedRecord.totalAmount}
            onChange={handleInputChange}
            className="edit-input"
          />
          <input
            type="number"
            name="splitAmount"
            value={editedRecord.splitAmount}
            onChange={handleInputChange}
            className="edit-input"
          />
          {/* Not allowing to edit paidBy for simplicity for now */}
          <span className="record-paidBy">支付者: {record.paidBy}</span>
        </div>
        <div className="record-actions">
          <button onClick={handleUpdate} className="save-btn">儲存</button>
          <button onClick={onCancel} className="cancel-btn">取消</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card record-card">
      <div className="record-details">
        <span className="record-date">{new Date(record.date).toLocaleDateString()}</span>
        <strong className="record-item">{record.item}</strong>
        <span className="record-paidBy">支付者: {record.paidBy}</span>
        <span className="record-amount">
          ${record.totalAmount} (個人分攤 ${record.splitAmount})
        </span>
      </div>
      <div className="record-actions">
        <button onClick={() => onEdit(record)} className="edit-btn">編輯</button>
        <button onClick={() => onDelete(record.id)} className="delete-btn">×</button>
      </div>
    </div>
  );
}

export default RecordItem;
