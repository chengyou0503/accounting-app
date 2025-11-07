// ==================================================================
// 記帳 App 後端 - v3 (移除分類，新增結算功能)
// ==================================================================

const SHEET_NAME = "records";

// 預期的欄位標題
const FIELD_MAP = {
  'id': 'ID',
  'date': '日期',
  'description': '項目',
  'amount': '總金額',
  'splitAmount': '分攤金額',
  'paidBy': '付款人'
};

// !!! --- 一次性設定功能 --- !!!
// 請在 Apps Script 編輯器中手動「執行」此功能一次，以確保試算表欄位完全正確。
// 警告：執行後會清空您目前的資料！
function setupSheet() {
  const sheet = getSheet();
  sheet.clear(); // 清空工作表
  const headers = [
    FIELD_MAP.id, 
    FIELD_MAP.date, 
    FIELD_MAP.description, 
    FIELD_MAP.amount, 
    FIELD_MAP.splitAmount, 
    FIELD_MAP.paidBy
  ];
  // 將 100% 正確的標題寫入第一列
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  SpreadsheetApp.flush(); // 立即套用變更
}


const REVERSE_FIELD_MAP = Object.entries(FIELD_MAP).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {});

function doGet(e) {
  try {
    if (e.parameter.action === 'read') {
      return createJsonResponse({ status: 'success', data: readAllRecords() });
    }
    throw new Error("無效的 GET 操作");
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.message });
  }
}

function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    switch (request.action) {
      case 'create':
        return createJsonResponse({ status: 'success', data: createRecord(request.data) });
      case 'update':
        return createJsonResponse({ status: 'success', data: updateRecord(request.data) });
      case 'delete':
        deleteRecord(request.data.id);
        return createJsonResponse({ status: 'success', message: '紀錄已刪除' });
      case 'settle':
        settleRecords();
        return createJsonResponse({ status: 'success', message: '紀錄已結算' });
      default:
        throw new Error("無效的 POST 操作");
    }
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.message });
  }
}

function settleRecords() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = ss.getSheetByName(SHEET_NAME);
  const dataRange = sourceSheet.getDataRange();
  
  if (dataRange.getNumRows() <= 1) {
    throw new Error("沒有可結算的紀錄");
  }

  const data = dataRange.getValues();
  
  const today = new Date();
  const formattedDate = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
  const newSheetName = `結算-${formattedDate}`;
  
  let destinationSheet = ss.getSheetByName(newSheetName);
  if (!destinationSheet) {
    destinationSheet = ss.insertSheet(newSheetName);
  }
  
  destinationSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  sourceSheet.deleteRows(2, sourceSheet.getLastRow() - 1);
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error(`找不到名稱為 "${SHEET_NAME}" 的工作表`);
  return sheet;
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function readAllRecords() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data.shift(); // Still need to remove the header row
  const headerMap = headers.reduce((acc, header, index) => {
    acc[header] = index;
    return acc;
  }, {});

  const expectedHeaders = Object.values(FIELD_MAP);

  return data.map(row => {
    const record = {};
    expectedHeaders.forEach(header => {
      const englishKey = REVERSE_FIELD_MAP[header];
      const colIndex = headerMap[header];
      if (englishKey && colIndex !== undefined) {
        record[englishKey] = row[colIndex];
      }
    });
    return record;
  });
}

function createRecord(data) {
  const sheet = getSheet();
  const newRecord = { ...data, id: "record-" + new Date().getTime() };
  
  // 建立一個保證順序的陣列來寫入
  const newRow = [
    newRecord.id,
    newRecord.date,
    newRecord.description,
    newRecord.amount,
    newRecord.splitAmount,
    newRecord.paidBy
  ];

  sheet.appendRow(newRow);
  return newRecord;
}

function updateRecord(data) {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idHeader = FIELD_MAP['id'];
  const idColumnIndex = headers.indexOf(idHeader);
  if (idColumnIndex === -1) throw new Error(`找不到 '${idHeader}' 欄位`);
  const rowIndex = values.findIndex(row => row[idColumnIndex] == data.id);
  if (rowIndex === -1) throw new Error("找不到要更新的紀錄");
  const newRowData = headers.map(header => data[REVERSE_FIELD_MAP[header]] || '');
  sheet.getRange(rowIndex + 1, 1, 1, newRowData.length).setValues([newRowData]);
  return data;
}

function deleteRecord(id) {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idHeader = FIELD_MAP['id'];
  const idColumnIndex = headers.indexOf(idHeader);
  if (idColumnIndex === -1) throw new Error(`找不到 '${idHeader}' 欄位`);
  for (let i = values.length - 1; i > 0; i--) {
    if (values[i][idColumnIndex] == id) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
  throw new Error("找不到要刪除的紀錄");
}