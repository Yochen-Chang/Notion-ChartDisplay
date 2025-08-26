const { Client } = require("@notionhq/client");

export default async function handler(req, res) {
  // 設置 CORS 頭
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 處理 OPTIONS 請求
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    let token, databaseId;

    if (req.method === "POST") {
      // 從 POST 請求體中獲取憑證
      const { token: reqToken, databaseId: reqDatabaseId } = req.body;

      if (!reqToken || !reqDatabaseId) {
        return res.status(400).json({
          success: false,
          error: "缺少必要的參數：token 或 databaseId",
        });
      }

      token = reqToken;
      databaseId = reqDatabaseId;
    } else {
      // 從環境變量中獲取憑證（向後兼容）
      token = process.env.NOTION_ACCESS_TOKEN;
      databaseId = process.env.NOTION_DATABASE_ID;

      if (!token || !databaseId) {
        return res.status(500).json({
          success: false,
          error: "服務器配置錯誤：缺少 Notion 憑證",
        });
      }
    }

    // 創建 Notion 客戶端
    const client = new Client({ auth: token });

    const response = await client.databases.query({
      database_id: databaseId,
    });

    res.json({
      success: true,
      data: response.results,
    });
  } catch (error) {
    console.error("Notion API 錯誤:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
