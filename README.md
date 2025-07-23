# Notion Chart Display

一個基於 Notion API 的資料視覺化應用，解決 Notion 免費版只能生成一個圖表的限制。通過串接 Notion 資料庫，使用 Chart.js 生成多種互動式圖表和表格。

## 🎯 專案目標

- 串接 Notion API 獲取資料庫內容
- 使用 Chart.js 生成多種圖表類型（圓餅圖、甜甜圈圖、長條圖等）
- 提供互動式表格排序功能
- 支援響應式設計，適配各種裝置
- 解決 Notion 免費版圖表功能限制

## �� 功能特色

### 📊 資料視覺化
- **甜甜圈圖**：顯示各分類消費佔比，中央顯示總金額
- **互動式表格**：支援按交易項目、日期、金額排序
- **分類統計**：自動計算各分類總金額、百分比、筆數
- **響應式設計**：適配桌面和行動裝置

### �� 技術特色
- **即時資料更新**：從 Notion 資料庫即時獲取最新資料
- **錯誤處理**：完善的錯誤處理和用戶提示
- **模組化設計**：易於擴展和維護的程式碼結構

## 🛠 技術棧

### 後端 (Backend)
- **Node.js** - JavaScript 運行環境
- **Express.js** - Web 應用框架
- **@notionhq/client** - Notion API 官方客戶端
- **dotenv** - 環境變數管理

### 前端 (Frontend)
- **Vanilla JavaScript** - 原生 JavaScript，無需框架
- **Chart.js** - 互動式圖表庫
- **HTML5** - 語義化標記
- **CSS3** - 現代化樣式設計

### 開發工具
- **nodemon** - 開發時自動重啟服務器
- **GitHub** - 版本控制

## �� 安裝與設定

### 1. 克隆專案
```bash
git clone https://github.com/Yochen-Chang/Notion-ChartDisplay.git
cd notion-chart-display
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 環境變數設定
建立 `.env` 檔案：
```env
NOTION_ACCESS_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_database_id
PORT=3000
```

### 4. Notion API 設定
1. 前往 [Notion Developers](https://developers.notion.com/)
2. 建立新的 Integration
3. 獲取 Integration Token
4. 將 Integration 添加到你的資料庫
5. 複製資料庫 ID

### 5. 啟動應用
```bash
# 開發模式
npm run dev

# 生產模式
npm start
```

##  使用方式

1. **資料載入**：頁面載入時自動從 Notion 獲取資料
2. **圖表查看**：查看甜甜圈圖了解各分類佔比
3. **表格操作**：點擊表頭進行排序
4. **資料更新**：點擊「重新載入資料」按鈕更新資料

##  開發指南

### 添加新圖表類型
1. 在 `app.js` 中新增圖表生成函數
2. 在 HTML 中添加對應的 canvas 元素
3. 在 CSS 中設定圖表樣式

### 擴展資料處理
1. 修改 `getNotionPropertyValue` 函數處理新屬性類型
2. 在 `displayDataByCategory` 中添加新的分組邏輯
---

⭐ 如果這個專案對你有幫助，請給個 Star！
```