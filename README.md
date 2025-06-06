# 興趣班學員管理系統

一個現代化的學員管理和點名系統，支援響應式設計和多種功能。

## 🚀 功能特色

- ✅ **學員管理** - 新增、編輯、刪除、搜尋學員
- ✅ **課堂管理** - 創建班組、時間安排、衝突檢查
- ✅ **點名系統** - 出席記錄、統計分析
- ✅ **統計報表** - 出席率分析、排名、趨勢
- ✅ **數據管理** - 匯入/匯出、本地存儲
- ✅ **Google Sheets同步** - 可選的雲端同步
- ✅ **響應式設計** - 支援桌面、平板、手機

## 📁 文件結構

```
App/
├── index.html          # 主頁面
├── test.html           # 測試頁面
├── css/styles.css      # 樣式文件
├── js/
│   ├── data.js         # 數據管理模組
│   ├── students.js     # 學員管理模組
│   ├── classes.js      # 課堂管理模組
│   ├── attendance.js   # 點名系統模組
│   ├── statistics.js   # 統計報表模組
│   └── app.js          # 主應用控制器
├── .gitignore          # Git忽略文件
├── SECURITY.md         # 安全說明
└── README.md           # 說明文件
```

## 🛠️ 安裝和使用

### 方法一：GitHub Pages（推薦）
1. Fork 這個倉庫
2. 在 Settings > Pages 中啟用 GitHub Pages
3. 訪問你的 GitHub Pages URL

### 方法二：本地運行
1. 下載或克隆倉庫
2. 使用本地服務器運行（如 Live Server）
3. 打開 `index.html`

## 🔧 故障排除

### ⚠️ 安全警告
**絕對不要在代碼中硬編碼 API Key！** 如果你的 API Key 已經暴露：
1. 立即到 Google Cloud Console 刪除該 API Key
2. 創建新的 API Key 並設置適當限制
3. 使用系統設定頁面安全地輸入新的 API Key

### 🔍 快速診斷工具
使用 `debug.html` 進行快速系統診斷：
1. 訪問 `debug.html` 頁面
2. 點擊「完整診斷」按鈕
3. 查看詳細的系統狀態報告
4. 根據診斷結果進行相應修復

### 問題：按鈕沒有反應
1. **使用診斷工具**：
   - 訪問 `debug.html` 檢查系統狀態
   - 查看文件載入是否成功

2. **檢查瀏覽器控制台**：
   - 按 F12 打開開發者工具
   - 查看 Console 標籤中的錯誤信息

3. **使用測試頁面**：
   - 訪問 `test.html` 檢查模組載入狀態

4. **常見解決方案**：
   - 重新整理頁面
   - 清除瀏覽器緩存
   - 檢查網路連接
   - 使用診斷工具的「重置系統」功能

### 問題：系統初始化失敗
1. **使用診斷工具**：
   - 在 `debug.html` 中點擊「清除本地數據」
   - 然後點擊「重置系統」

2. **檢查文件完整性**：
   - 確保所有 JS 文件都存在
   - 使用診斷工具檢查文件載入狀態

3. **檢查瀏覽器兼容性**：
   - 使用現代瀏覽器（Chrome、Firefox、Safari、Edge）
   - 啟用 JavaScript

4. **檢查本地存儲**：
   - 使用診斷工具檢查 localStorage 狀態
   - 清除損壞的數據

### 問題：Google Sheets 同步失敗
1. **檢查 API 配置**：
   - 確保 API Key 正確
   - 檢查 Sheet ID 格式
   - 參考 `SECURITY.md` 進行正確配置

2. **檢查權限設定**：
   - 確保 Google Sheet 是公開的或有適當權限
   - 檢查 API Key 的限制設定

## 🔐 安全說明

⚠️ **重要**：請參閱 `SECURITY.md` 了解如何安全地配置 Google Sheets API。

- 不要在代碼中硬編碼 API Key
- 使用系統設定頁面輸入敏感資訊
- 定期輪換 API Key

## 🎯 使用指南

### 1. 新增學員
1. 點擊「學員管理」標籤
2. 點擊「新增學員」按鈕
3. 填寫學員資訊
4. 選擇班別
5. 點擊「保存」

### 2. 創建課堂
1. 點擊「課堂管理」標籤
2. 點擊「新增班組」按鈕
3. 設定課堂時間和名稱
4. 點擊「保存」

### 3. 進行點名
1. 點擊「點名系統」標籤
2. 選擇班別和日期
3. 標記學員出席狀態
4. 點擊「保存點名記錄」

### 4. 查看統計
1. 點擊「統計報表」標籤
2. 設定篩選條件
3. 點擊「生成報表」
4. 查看出席率和趨勢

## 🔄 數據管理

### 匯出數據
- 在「系統設定」中點擊「匯出數據」
- 下載 JSON 格式的備份文件

### 匯入數據
- 在「系統設定」中點擊「匯入數據」
- 選擇之前匯出的 JSON 文件

### 清除數據
- 在「系統設定」中點擊「清除所有數據」
- 確認後將刪除所有本地數據

## 🌐 瀏覽器支援

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 📱 移動端支援

系統完全支援移動設備，包括：
- 觸控友好的界面
- 響應式佈局
- 移動端優化的導航

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 📞 支援

如果遇到問題，請：
1. 查看故障排除指南
2. 使用測試頁面診斷問題
3. 提交 GitHub Issue 