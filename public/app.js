// 載入 Notion 資料
async function loadNotionData() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const dataContainer = document.getElementById('data-container');
    
    // 顯示載入狀態
    loadingEl.style.display = 'block';
    errorEl.style.display = 'none';
    dataContainer.innerHTML = '';
    
    try {
        const response = await fetch('/api/notion-data');
        const result = await response.json();
        
        if (result.success) {
            displayData(result.data);
            console.log(result.data);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('載入資料錯誤:', error);
        errorEl.textContent = `載入失敗: ${error.message}`;
        errorEl.style.display = 'block';
    } finally {
        loadingEl.style.display = 'none';
    }
}

// 顯示資料
function displayData(data) {
    const container = document.getElementById('data-container');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p>沒有找到資料</p>';
        return;
    }
    
    let items = [];
    data.map(item => {
        item_data = {};
        if (item.properties) {
            Object.keys(item.properties).forEach(key => {
                item_data[key] = getNotionPropertyValue(item.properties[key]);
            });
        }
        
        items.push(item_data);
    }).join('');
    
    console.log(items);
    
    // 按交易類型分類並顯示
    displayDataByCategory(items);
}

// 按交易類型分類並顯示資料
function displayDataByCategory(items) {
    const container = document.getElementById('data-container');
    
    // 按交易類型分組
    const groupedData = {};
    let totalAmount = 0;
    
    items.forEach(item => {
        const category = item['交易類型'] || '其他';
        const amount = parseFloat(item['交易金額']) || 0;
        
        if (!groupedData[category]) {
            groupedData[category] = {
                items: [],
                totalAmount: 0,
                count: 0
            };
        }
        
        groupedData[category].items.push(item);
        groupedData[category].totalAmount += amount;
        groupedData[category].count += 1;
        totalAmount += amount;
    });
    
    // 生成分類顯示的 HTML
    let html = `
        <div class="summary-section">
            <h2>📈 支出總覽</h2>
            <p><strong>總支出金額：</strong> ${totalAmount.toLocaleString()} 元</p>
            <p><strong>總交易筆數：</strong> ${items.length} 筆</p>
        </div>
    `;
    
    // 按金額排序分類
    const sortedCategories = Object.keys(groupedData).sort((a, b) => 
        groupedData[b].totalAmount - groupedData[a].totalAmount
    );
    
    sortedCategories.forEach(category => {
        const categoryData = groupedData[category];
        const percentage = ((categoryData.totalAmount / totalAmount) * 100).toFixed(1);
        
        categoryData.items.map(item => {
            console.log(item['交易金額']);
        });

        html += `
            <div class="category-section">
                <div class="category-header">
                    <h3>${category}</h3>
                    <div class="category-summary">
                        <span class="amount">${categoryData.totalAmount.toLocaleString()} 元</span>
                        <span class="percentage">(${percentage}%)</span>
                        <span class="count">${categoryData.count} 筆</span>
                    </div>
                </div>
                <div class="table-container">
                    <table class="transaction-table">
                        <thead>
                            <tr>
                                <th>交易說明</th>
                                <th>交易項目</th>
                                <th>交易日期</th>
                                <th>交易金額</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${categoryData.items.map(item => `
                                <tr class="transaction-row">
                                    <td class="transaction-name">${item['交易說明'] || '無說明'}</td>
                                    <td class="transaction-category">${item['交易項目'] || ''}</td>
                                    <td class="transaction-date">${item['交易日期'] || ''}</td>
                                    <td class="transaction-amount ${parseFloat(item['交易金額']) < 0 ? 'negative' : ''}">
                                        ${isNaN(parseFloat(item['交易金額'])) ? '0' : parseFloat(item['交易金額']).toLocaleString()} 元
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 獲取 Notion 文字內容
function getNotionText(property) {
    if (property.type === 'title' && property.title) {
        return property.title.map(t => t.plain_text).join('');
    }
    if (property.type === 'rich_text' && property.rich_text) {
        return property.rich_text.map(t => t.plain_text).join('');
    }
    return '無內容';
}

// 獲取 Notion 屬性值
function getNotionPropertyValue(property) {
    switch (property.type) {
        case 'title':
        case 'rich_text':
            return getNotionText(property);
        case 'select':
            return property.select ? property.select.name : '';
        case 'multi_select':
            return property.multi_select ? property.multi_select.map(s => s.name).join(', ') : '';
        case 'date':
            return property.date ? property.date.start : '';
        case 'number':
            return property.number || '';
        case 'checkbox':
            return property.checkbox ? '✓' : '✗';
        default:
            return '';
    }
}

// 頁面載入時自動載入資料
document.addEventListener('DOMContentLoaded', loadNotionData); 