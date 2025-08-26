const express = require('express');
const { Client } = require('@notionhq/client');
const path = require('path');
require('dotenv').config();

const app = express();
const client = new Client({ auth: process.env.NOTION_ACCESS_TOKEN });

// 中間件
app.use(express.json());
app.use(express.static('public'));

// 路由：提供前端頁面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 新增 POST 路由來支援前端傳遞憑證
app.post('/api/notion-data', async (req, res) => {
  try {
    const { token, databaseId } = req.body;
    
    if (!token || !databaseId) {
      return res.status(400).json({
        success: false,
        error: "缺少必要的參數：token 或 databaseId"
      });
    }

    // 創建新的 Notion 客戶端
    const client = new Client({ auth: token });

    const response = await client.databases.query({
      database_id: databaseId,
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