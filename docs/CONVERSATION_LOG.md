# 對話紀錄摘要（new-cleansystem）

此文件彙總本專案至今的關鍵對話重點、決策與待辦，用於交接與追蹤。

## 目標與範圍
- 以 `docs` 為主、`cousor234` 行為為輔，重構派工系統（訂單/排班/薪資/積分/報表/RBAC）。
- 採 Repository Pattern；支援本機與 Supabase 雙資料源（可由 `VITE_USE_SUPABASE` 切換）。
- 介面改為更清晰（桌面側欄、技師行動友善）、站內通知、指派簽名、照片前/後等。

## 關鍵決策/修正（最新優先）
- 倉庫改名：GitHub 改為 `a90046766/new-cleansystem`；已推送 `main`。Vercel 需連到此倉庫。
- Vercel 設定：
  - `vercel.json`（根目錄）生效，內容：
    - buildCommand: `npm run build`
    - outputDirectory: `dist`
    - rewrites: `/(.*)` → `/index.html`
  - Root Directory 留空；Production Branch=main；Build Command/Output 依上。
  - `VITE_USE_SUPABASE=0`（已關閉雲端，先用本機模式）。
- 首頁：移除「假資料已移除」；快速入口置頂；新增「公告欄」。
- Calendar：加入 `onDayHover`/`onDayLeave`，支援日期 hover 顯示「當日概覽」。
- 技師排班：
  - 從訂單點「指派技師」進入後，點日期會回填訂單的服務日期並自動返回訂單。
  - 當日概覽顯示：已排班（訂單編號/時間/地區/數量）與可排單技師（可勾選，後續按「確認指派」）。
- 訂單核心：
  - 完工時計分＝先扣 `pointsUsed`，再按淨額（扣抵後）計算新增點數。
  - 「確認」二次確認；未選簽名技師不可簽名。
- 自動回退：若 Supabase 變數缺失或請求失敗，自動退回本機適配器，避免雲端關閉時出錯。

## 既知問題/排程
- 排班「當日概覽」資訊可再補充（更完整的地區/數量來源、樣式強化）。
- 產品空清單時，已提供「建立預設產品」一鍵補種（本機/雲端皆透過 adapter）。
- 之後再開啟 Supabase 時，需確認資料表與 RLS 完整。

## 重新部署步驟（Vercel）
1. 確認 Vercel 連到 `a90046766/new-cleansystem`，Root Directory 留空，Build= `npm run build`，Output=`dist`。
2. Deployments → Redeploy（勾 Clear build cache）。
3. 瀏覽器硬重新整理（Ctrl+F5）。

## 快速驗證清單
- 首頁：僅「快速入口 + 公告欄」。
- 排班：滑到日期出現「當日概覽」；從訂單進入後點日期會回填服務日期並返回訂單。
- 訂單：確認需雙重確認；未選簽名技師會提示；完工後積分先扣 `pointsUsed` 再加淨額點數。


