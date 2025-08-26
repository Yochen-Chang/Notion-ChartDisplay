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
        <div class="chart-container" style="display: flex; justify-content: center; align-items: center;">
            <canvas id="category-chart"></canvas>
        </div>
    `;
    
    // 按金額排序分類
    const sortedCategories = Object.keys(groupedData).sort((a, b) => 
        groupedData[b].totalAmount - groupedData[a].totalAmount
    );
    
    sortedCategories.forEach((category, categoryIndex) => {
        const categoryData = groupedData[category];
        const percentage = ((categoryData.totalAmount / totalAmount) * 100).toFixed(1);

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
                    <table class="transaction-table" data-category="${categoryIndex}">
                        <thead>
                            <tr>
                                <th class="sortable" data-sort="transaction-name" data-category="${categoryIndex}">
                                    交易項目
                                    <span class="sort-icon"></span>
                                </th>
                                <th class="sortable" data-sort="transaction-date" data-category="${categoryIndex}">
                                    交易日期
                                    <span class="sort-icon"></span>
                                </th>
                                <th class="sortable" data-sort="transaction-amount" data-category="${categoryIndex}">
                                    交易金額
                                    <span class="sort-icon"></span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            ${categoryData.items
                              .map(
                                (item) => `
                                <tr class="transaction-row">
                                    <td class="transaction-name">${
                                      item["交易說明"] || ""
                                    }</td>
                                    <td class="transaction-date">${
                                      item["交易日期"] || ""
                                    }</td>
                                    <td class="transaction-amount ${
                                      parseFloat(item["交易金額"]) < 0
                                        ? "negative"
                                        : ""
                                    }" data-amount="${
                                  parseFloat(item["交易金額"]) || 0
                                }">
                                        ${
                                          isNaN(parseFloat(item["交易金額"]))
                                            ? "0"
                                            : parseFloat(
                                                item["交易金額"]
                                              ).toLocaleString()
                                        } 元
                                    </td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    generateCategoryChart(groupedData);

    // 添加排序事件監聽器
    addSortEventListeners();
}

// 添加排序功能
function addSortEventListeners() {
    const sortableHeaders = document.querySelectorAll('.sortable');
    
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const sortField = this.dataset.sort;
            const categoryIndex = this.dataset.category;
            const table = document.querySelector(`table[data-category="${categoryIndex}"]`);
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            // 獲取當前排序方向
            const currentDirection = this.dataset.direction || 'asc';
            const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
            
            // 重置所有排序圖標
            table.querySelectorAll('.sort-icon').forEach(icon => {
                icon.textContent = '';
            });
            
            // 更新當前排序圖標
            const sortIcon = this.querySelector('.sort-icon');
            sortIcon.textContent = newDirection === 'asc' ? '↑' : '↓';
            
            // 更新排序方向
            this.dataset.direction = newDirection;
            
            // 排序行
            rows.sort((a, b) => {
                let aValue, bValue;
                
                switch(sortField) {
                    case 'transaction-name':
                        aValue = a.querySelector('.transaction-name').textContent.trim();
                        bValue = b.querySelector('.transaction-name').textContent.trim();
                        break;
                    case 'transaction-date':
                        aValue = new Date(a.querySelector('.transaction-date').textContent.trim());
                        bValue = new Date(b.querySelector('.transaction-date').textContent.trim());
                        break;
                    case 'transaction-amount':
                        aValue = parseFloat(a.querySelector('.transaction-amount').dataset.amount);
                        bValue = parseFloat(b.querySelector('.transaction-amount').dataset.amount);
                        break;
                    default:
                        return 0;
                }
                
                if (newDirection === 'asc') {
                    return aValue > bValue ? 1 : -1;
                } else {
                    return aValue < bValue ? 1 : -1;
                }
            });
            
            // 重新插入排序後的行
            rows.forEach(row => tbody.appendChild(row));
        });
    });
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

function generateCategoryChart(groupedData) {
  console.log(groupedData);
  let chart = document.getElementById("category-chart");
  let label_position = window.innerWidth < 468 ? "bottom" : "right";

  const config = {
    type: "doughnut",
    data: {
      labels: Object.keys(groupedData),
      datasets: [
        {
          label: "支出金額",
          data: Object.values(groupedData).map((item) => item.totalAmount),
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: false,
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        },
      },
      plugins: {
        legend: {
          position: label_position,
          labels: {
            font: {
              size: 18,
            },
            padding: 10,
            generateLabels: function (chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map(function (label, i) {
                  const dataset = data.datasets[0];
                  const value = dataset.data[i];
                  const total = dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);

                  return {
                    text: `${label}：$${value} (${percentage}%)`,
                    fillStyle: dataset.backgroundColor[i],
                    strokeStyle: dataset.borderColor[i],
                    lineWidth: dataset.borderWidth,
                    hidden: false,
                    index: i,
                  };
                });
              }
              return [];
            },
            margin: {
              left: 30,
              top: 30,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: $${context.parsed} (${percentage}%)`;
            },
          },
        },
      },
    },
  };

  new Chart(chart, config);
  chart.style.display = "block";
}

// 頁面載入時自動載入資料
document.addEventListener('DOMContentLoaded', loadNotionData); 