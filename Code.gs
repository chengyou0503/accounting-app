// ==================================================================
// 記帳 App 後端 - v6 (最終修正版)
// ==================================================================

const SHEET_NAME = "records";

const FIELD_MAP = {
  'id': 'ID',
  'date': '日期',
  'description': '項目',
  'amount': '總金額',
  'splitAmount': '分攤金額',
  'paidBy': '付款人'
};

const REVERSE_FIELD_MAP = Object.entries(FIELD_MAP).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {});

// !!! --- 一次性設定功能 --- !!!
function setupSheet() {
  const sheet = getSheet();
  sheet.clear();
  const headers = Object.values(FIELD_MAP);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  SpreadsheetApp.flush();
}

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

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    setupSheet(); // 如果工作表不存在，自動建立並設定標頭
  }
  return sheet;
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// --- CRUD Operations (最終修正版) ---

function readAllRecords() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data.shift(); // 取得標頭列

  return data.map(row => {
    const record = {};
    // 遍歷所有已知的欄位，確保不錯過任何一個
    for (const key in FIELD_MAP) {
      const headerName = FIELD_MAP[key];
      const index = headers.indexOf(headerName); // 根據標頭名稱找到對應的索引
      if (index !== -1) { // 如果找到了該欄位
        record[key] = row[index];
      }
    }
    return record;
  });
}

function createRecord(data) {
  const sheet = getSheet();
  const newRecord = { ...data, id: "record-" + new Date().getTime() };
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(header => newRecord[REVERSE_FIELD_MAP[header]] || "");

  sheet.appendRow(newRow);
  return newRecord;
}

function updateRecord(data) {
  const sheet = getSheet();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const headers = values[0];
  const idColumnIndex = headers.indexOf(FIELD_MAP.id);

  if (idColumnIndex === -1) throw new Error(`找不到 '${FIELD_MAP.id}' 欄位`);

  const rowIndex = values.findIndex(row => row[idColumnIndex] == data.id);
  if (rowIndex === -1) throw new Error("找不到要更新的紀錄");

  const newRowData = headers.map(header => data[REVERSE_FIELD_MAP[header]] || '');
  sheet.getRange(rowIndex + 1, 1, 1, newRowData.length).setValues([newRowData]);
  return data;
}

function deleteRecord(id) {
  const sheet = getSheet();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const headers = values[0];
  const idColumnIndex = headers.indexOf(FIELD_MAP.id);

  if (idColumnIndex === -1) throw new Error(`找不到 '${FIELD_MAP.id}' 欄位`);

  for (let i = values.length - 1; i > 0; i--) {
    if (values[i][idColumnIndex] == id) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
  throw new Error("找不到要刪除的紀錄");
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
