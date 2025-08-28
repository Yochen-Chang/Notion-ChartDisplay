// 載入 Notion 資料 (整合版本)
async function loadNotionData(filterType = 'default') {
    //TODO: Notion 單次抓取資料限制為 100 筆，需要分頁抓取
  const loadingEl = document.getElementById("loading");
  const errorEl = document.getElementById("error");
  const dataContainer = document.getElementById("data-container");

  // 檢查是否有儲存的設定
  const token = localStorage.getItem("notion_access_token");
  const databaseId = localStorage.getItem("notion_database_id");

  if (!token || !databaseId) {
    errorEl.textContent = "請先設定 Notion 憑證";
    errorEl.style.display = "block";
    loadingEl.style.display = "none";
    return;
  }

  // 顯示載入狀態
  loadingEl.style.display = "block";
  errorEl.style.display = "none";
  dataContainer.innerHTML = "";

  try {
    const response = await fetch("/api/notion-data", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        token: token,
        databaseId: databaseId,
        }),
    });
    const result = await response.json();

    if (result.success) {
      filterData(result.data, filterType);
      console.log(`${filterType === 'default' ? '預設' : '替代'}篩選資料:`, result.data);
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error(`載入${filterType === 'default' ? '預設' : '替代'}篩選資料錯誤:`, error);
    errorEl.textContent = `載入失敗: ${error.message}`;
    errorEl.style.display = "block";
  } finally {
    loadingEl.style.display = "none";
  }
}

// 處理篩選條件變更
function handleFilterChange(filterType) {
  if (filterType === 'default' || filterType === 'alternative') {
    loadNotionData(filterType);
  }
}

// 切換下拉式選單顯示/隱藏
function toggleSelect() {
  const selectItems = document.getElementById('select-items');
  const arrow = document.querySelector('.select-arrow');
  
  selectItems.classList.toggle('select-hide');
  
  // 控制箭頭旋轉
  if (selectItems.classList.contains('select-hide')) {
    arrow.classList.remove('rotate');
  } else {
    arrow.classList.add('rotate');
  }
}

// 選擇選項
function selectOption(element, value) {
  // 更新選中的顯示內容
  const selectedElement = document.querySelector('.select-selected');
  const selectedSvg = element.querySelector('svg').cloneNode(true);
  const selectedText = element.textContent.trim();
  
  // 清空並重新填充選中元素
  selectedElement.innerHTML = '';
  selectedElement.appendChild(selectedSvg);
  selectedElement.appendChild(document.createTextNode(' ' + selectedText));
  
  // 添加箭頭圖示
  const arrowSvg = document.createElement('svg');
  arrowSvg.className = 'select-arrow';
  arrowSvg.setAttribute('width', '16');
  arrowSvg.setAttribute('height', '16');
  arrowSvg.setAttribute('viewBox', '0 0 24 24');
  arrowSvg.setAttribute('fill', 'none');
  arrowSvg.setAttribute('stroke', 'currentColor');
  arrowSvg.setAttribute('stroke-width', '2');
  arrowSvg.innerHTML = '<path d="M6 9l6 6 6-6" />';
  selectedElement.appendChild(arrowSvg);
  
  // 隱藏選項列表
  document.getElementById('select-items').classList.add('select-hide');
  
  // 處理篩選變更
  handleFilterChange(value);
}

// 點擊外部關閉下拉式選單
document.addEventListener('click', function(event) {
  const customSelect = document.querySelector('.custom-select');
  if (!customSelect.contains(event.target)) {
    document.getElementById('select-items').classList.add('select-hide');
  }
});

// 載入替代篩選條件的 Notion 資料 (保留向後相容性)
function loadAlternativeData() {
  loadNotionData('alternative');
}

// 通用篩選函數
function filterData(data, filterType = 'default') {
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
        
        // 基本篩選：只處理支出和收入
        if (!["支出", "收入"].includes(item_data["收入/支出"])) return;

        // 根據篩選類型應用不同的篩選條件
        if (filterType === 'default') {
            // 預設篩選：排除旅遊基金、約會基金、其他
            if (["旅遊基金", "約會基金", "其他"].includes(item_data["消費工具"])) return;
        } else if (filterType === 'alternative') {
            // 替代篩選：只包含旅遊基金、約會基金、其他，但排除分期付款
            if (!["約會基金"].includes(item_data["消費工具"])) return;
        }

        // 只抓取當月資料
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const currentMonth = `${year}-${month}`;
        if (!item_data["交易日期"] || !item_data["交易日期"].startsWith(currentMonth)) return;

        items.push(item_data);
    }).join('');
    
    console.log(`${filterType === 'default' ? '預設' : '替代'}篩選項目:`, items);
    
    // 按交易類型分類並顯示
    displayDataByCategory(items, filterType);
}

// 顯示資料 (預設篩選)
function displayData(data) {
    filterData(data, 'default');
}

// 按交易類型分類並顯示資料
function displayDataByCategory(items, filterType = 'default') {
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
    
    // 根據篩選類型生成不同的標題和說明
    let title = '👤 個人花費總覽';
    if (filterType === 'default') {
        title = '👤 個人花費總覽';
    } else if (filterType === 'alternative') {
        title = '💑 共同花費總覽';
    }
    
    // 生成分類顯示的 HTML
    let html = `
        <div class="summary-section">
            <h2>${title}</h2>
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

  // 動態計算圖表高度，根據標籤長度調整
  const labels_count = Object.keys(groupedData);
  const chart_height = chart.style.width ? chart.style.width : 400;
  const chart_total_height = chart_height + labels_count.length * 24; // 根據標籤長度調整高度
  chart.style.height = `${chart_total_height}px`;

  // 自動生成顏色
  const generateColors = (count) => {
     const colors = [];
     for (let i = 0; i < count; i++) {
       // 使用 HSL 色彩空間，均勻分布色相
       const hue = ((i * 360) / count) % 360;

       const saturation = 55 + (i % 10);
       const lightness = 75 + (i % 15);

       // 生成背景色（更淺，更柔和）
       const bgColor = `hsla(${hue}, ${saturation}%, ${lightness + 5}%, 0.15)`;
       // 生成邊框色（稍深，但保持柔和）
       const borderColor = `hsla(${hue}, ${saturation}%, ${lightness - 10}%, 0.8)`;

       colors.push({ bg: bgColor, border: borderColor });
     }
     return colors;
  };
  let colors = generateColors(labels_count.length);

  const config = {
    type: "doughnut",
    data: {
      labels: Object.keys(groupedData),
      datasets: [
        {
          label: "支出金額",
          data: Object.values(groupedData).map((item) => item.totalAmount),
          backgroundColor: colors.map((c) => c.bg),
          borderColor: colors.map((c) => c.border),
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
              size: 16,
            },
            padding: 8,
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
document.addEventListener("DOMContentLoaded", function () {
  loadSettings();
  loadNotionData();
});

// 載入設定
function loadSettings() {
  const token = localStorage.getItem("notion_access_token");
  const databaseId = localStorage.getItem("notion_database_id");

  if (token && databaseId) {
    // 如果已有設定，可以自動填入表單
    console.log("已載入儲存的設定");
  }
}

// 開啟設定視窗
function openSettings() {
  const modal = document.getElementById("settings-modal");
  const tokenInput = document.getElementById("notion-token");
  const databaseInput = document.getElementById("notion-database");

  // 載入已儲存的設定
  const savedToken = localStorage.getItem("notion_access_token");
  const savedDatabaseId = localStorage.getItem("notion_database_id");

  if (savedToken) tokenInput.value = savedToken;
  if (savedDatabaseId) databaseInput.value = savedDatabaseId;

  modal.style.display = "flex";
}

// 關閉設定視窗
function closeSettings() {
  const modal = document.getElementById("settings-modal");
  modal.style.display = "none";
}

// 儲存設定
function saveSettings() {
  const token = document.getElementById("notion-token").value.trim();
  const databaseId = document.getElementById("notion-database").value.trim();

  if (!token || !databaseId) {
    alert("請填寫完整的設定資訊");
    return;
  }

  // 儲存到 localStorage
  localStorage.setItem("notion_access_token", token);
  localStorage.setItem("notion_database_id", databaseId);

  alert("設定已儲存！");
  closeSettings();

  // 重新載入資料
  loadNotionData();
}

// 點擊彈出視窗外部關閉
window.onclick = function (event) {
  const modal = document.getElementById("settings-modal");
  if (event.target === modal) {
    closeSettings();
  }
};

// 頁面載入時自動載入資料
document.addEventListener('DOMContentLoaded', loadNotionData); 