# cousor555-local（本機重構版）

本專案為「派工系統與購物車管理」的本機重構版本，採離線優先（Local-first）與 Repository 模式：
- 先在本機把流程、規則、權限一次做對，再接回雲端（Supabase/Netlify）。
- 前端僅呼叫資料存取介面，之後切換雲端只需更換 Adapter，不影響業務碼。

文件：
- docs/SPEC.md：完整需求快照
- docs/PERMISSIONS.md：角色權限矩陣（單一真相）
- docs/DATA_MODEL.md：核心資料模型與三表（staff/technician_applications/member_applications）規格
- docs/API_CONTRACTS.md：Repository 介面契約
- docs/SMOKE_TEST.md：驗收清單
- docs/ROADMAP.md：重構里程碑（M1~M8）

狀態：
- 當前目標 M1：底座（權限門閘、健康檢查、Repository 介面、本機 Adapter 骨架）
