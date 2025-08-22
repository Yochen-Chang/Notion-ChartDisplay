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
    // 檢查環境變量
    if (!process.env.NOTION_ACCESS_TOKEN || !process.env.NOTION_DATABASE_ID) {
      console.error("缺少必要的環境變量:", {
        hasToken: !!process.env.NOTION_ACCESS_TOKEN,
        hasDatabaseId: !!process.env.NOTION_DATABASE_ID,
      });
      return res.status(500).json({
        success: false,
        error: "服務器配置錯誤：缺少 Notion 憑證",
      });
    }

    const response = await client.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
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
}
