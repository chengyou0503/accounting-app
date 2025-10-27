import React from 'react';
import RecordItem from './RecordItem'; // Import the new component

function RecordsList({
  records,
  isLoading,
  error,
  handleDelete,
  editingId,
  onEdit,
  onCancelEdit,
  onUpdate
}) {
  return (
    <div className="records-container">
      <h2>帳目列表</h2>
      {isLoading && <div className="loader"></div>}
      {error && <p className="error-message">讀取錯誤: {error}</p>}
      {!isLoading && !error && (
        <div className="records-list">
          {records.length === 0
            ? <p>目前沒有任何紀錄喔！</p>
            : records.map(record => (
              <RecordItem
                key={record.id}
                record={record}
                isEditing={record.id === editingId}
                onDelete={handleDelete}
                onEdit={onEdit}
                onCancel={onCancelEdit}
                onUpdate={onUpdate}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default RecordsList;