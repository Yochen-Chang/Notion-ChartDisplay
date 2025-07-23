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

## 📁 專案結構

```markdown:README.md
<code_block_to_apply_changes_from>
```
notion-chart-display/
├── public/                 # 靜態檔案
│   ├── index.html         # 主頁面
│   └── app.js             # 前端 JavaScript
├── server.js              # Express 服務器
├── package.json           # 專案配置
├── package-lock.json      # 依賴鎖定
├── .env                   # 環境變數 (需自行建立)
├── .gitignore            # Git 忽略檔案
└── README.md             # 專案說明
```

##  API 端點

### GET `/api/notion-data`
獲取 Notion 資料庫的所有資料
```json
{
  "success": true,
  "data": [...]
}
```

### GET `/api/page/:pageId`
獲取特定頁面資料
```json
{
  "success": true,
  "data": {...}
}
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

## 技術棧詳細說明

```markdown:TECH_STACK.md
# 技術棧詳細說明

## 🏗 架構概覽

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Notion API    │    │   Express.js    │    │   Chart.js      │
│   (資料來源)     │◄──►│   (後端服務)     │◄──►│   (前端圖表)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Vanilla JS    │
                       │   (前端邏輯)     │
                       └─────────────────┘
```

##  後端技術

### Node.js
- **版本**: 18.x+
- **用途**: JavaScript 運行環境
- **優勢**: 非阻塞 I/O、豐富的生態系統

### Express.js
- **版本**: 4.21.2
- **用途**: Web 應用框架
- **功能**:
  - 靜態檔案服務
  - API 路由處理
  - 中間件支援
  - 錯誤處理

### @notionhq/client
- **版本**: 4.0.1
- **用途**: Notion API 官方客戶端
- **功能**:
  - 資料庫查詢
  - 頁面檢索
  - 屬性處理
  - 認證管理

### dotenv
- **版本**: 16.6.1
- **用途**: 環境變數管理
- **功能**:
  - 安全存儲 API 金鑰
  - 配置管理
  - 開發/生產環境分離

## 🎨 前端技術

### Vanilla JavaScript
- **用途**: 前端邏輯處理
- **功能**:
  - DOM 操作
  - 事件處理
  - 資料處理
  - API 調用

### Chart.js
- **版本**: 3.x (CDN)
- **用途**: 互動式圖表生成
- **圖表類型**:
  - 甜甜圈圖 (Doughnut Chart)
  - 圓餅圖 (Pie Chart)
  - 長條圖 (Bar Chart) - 可擴展
- **特色**:
  - 響應式設計
  - 自定義插件
  - 豐富的配置選項

### HTML5
- **用途**: 頁面結構
- **特色**:
  - 語義化標記
  - 無障礙支援
  - 現代化標籤

### CSS3
- **用途**: 樣式設計
- **特色**:
  - Flexbox 佈局
  - Grid 佈局
  - 響應式設計
  - 動畫效果
  - 現代化樣式

##  開發工具

### nodemon
- **版本**: 3.1.10
- **用途**: 開發時自動重啟服務器
- **功能**:
  - 檔案監控
  - 自動重啟
  - 開發效率提升

### Git
- **用途**: 版本控制
- **功能**:
  - 程式碼管理
  - 協作開發
  - 版本追蹤

##  資料流程

```
1. 用戶訪問頁面
   ↓
2. 前端發送 API 請求
   ↓
3. Express 路由處理
   ↓
4. Notion API 調用
   ↓
5. 資料處理和格式化
   ↓
6. 返回 JSON 資料
   ↓
7. 前端接收資料
   ↓
8. Chart.js 生成圖表
   ↓
9. 顯示互動式介面
```

## 🔒 安全性考量

### API 金鑰管理
- 使用 `.env` 檔案存儲敏感資訊
- 避免在程式碼中硬編碼 API 金鑰
- 設定適當的 `.gitignore`

### 錯誤處理
- 完善的 try-catch 錯誤處理
- 用戶友善的錯誤訊息
- 服務器端錯誤日誌

### 資料驗證
- 前端輸入驗證
- 後端資料驗證
- API 回應驗證

##  部署考量

### 環境變數
```env
NOTION_ACCESS_TOKEN=your_token
NOTION_DATABASE_ID=your_database_id
PORT=3000
NODE_ENV=production
```

### 生產環境
- 使用 PM2 或類似工具管理 Node.js 程序
- 設定反向代理 (Nginx)
- 啟用 HTTPS
- 設定適當的 CORS 政策

### 效能優化
- 靜態檔案快取
- API 回應快取
- 圖片壓縮
- 程式碼壓縮

##  擴展性

### 可添加的功能
- 更多圖表類型 (長條圖、折線圖、散點圖)
- 資料篩選功能
- 匯出功能 (PDF, Excel)
- 使用者認證
- 多資料庫支援

### 技術升級路徑
- 前端框架遷移 (React, Vue)
- 資料庫整合 (MongoDB, PostgreSQL)
- 快取系統 (Redis)
- 容器化部署 (Docker)
```

這些文檔提供了完整的專案說明、技術棧詳情和使用指南，可以幫助其他開發者快速理解和參與專案開發。 