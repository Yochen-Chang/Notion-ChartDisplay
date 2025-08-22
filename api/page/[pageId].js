const { Client } = require('@notionhq/client');

const client = new Client({ auth: process.env.NOTION_ACCESS_TOKEN });

export default async function handler(req, res) {
  // 設置 CORS 頭
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允許 GET 請求
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: '只支持 GET 請求' 
    });
  }

  try {
    const { pageId } = req.query;
    
    if (!pageId) {
      return res.status(400).json({
        success: false,
        error: '缺少頁面 ID 參數'
      });
    }

    // 檢查環境變量
    if (!process.env.NOTION_ACCESS_TOKEN) {
      console.error("缺少必要的環境變量: NOTION_ACCESS_TOKEN");
      return res.status(500).json({
        success: false,
        error: "服務器配置錯誤：缺少 Notion 憑證",
      });
    }

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
}
