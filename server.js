const express = require('express');
const { Client } = require('@notionhq/client');
const path = require('path');
require('dotenv').config();

const app = express();
const client = new Client({
  auth: "secret_QLeuN8OvmGrpbmDcwLjZ8rn8FeelH7j3ymqIIEYO3Zp",
});

// 中間件
app.use(express.json());
app.use(express.static('public'));

// 路由：提供前端頁面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API 路由：獲取 Notion 資料
app.get('/api/notion-data', async (req, res) => {
  try {
    // 檢查環境變量
    // if (!process.env.NOTION_ACCESS_TOKEN || !process.env.NOTION_DATABASE_ID) {
    //   console.error("缺少必要的環境變量:", {
    //     hasToken: !!process.env.NOTION_ACCESS_TOKEN,
    //     hasDatabaseId: !!process.env.NOTION_DATABASE_ID,
    //   });
    //   return res.status(500).json({
    //     success: false,
    //     error: "服務器配置錯誤：缺少 Notion 憑證",
    //   });
    // }

    const response = await client.databases.query({
      database_id: "238172d833fa8060b38bed8c9c9c0e97",
    });
    
    res.json({
      success: true,
      data: response.results
    });
  } catch (error) {
    console.error('Notion API 錯誤:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 獲取特定頁面資料
app.get('/api/page/:pageId', async (req, res) => {
  try {
    const pageId = req.params.pageId;
    const response = await client.pages.retrieve({ page_id: pageId });
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('獲取頁面錯誤:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服務器運行在 http://localhost:${PORT}`);
}); 