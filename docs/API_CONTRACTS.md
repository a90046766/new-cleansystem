# Repository 介面（契約草稿）

以 TypeScript 型別描述（後續在 src/core/repository/* 實作）。

## AuthRepo
- login(email, password): Promise<User>
- logout(): Promise<void>
- resetPassword(newPassword): Promise<void>

## StaffRepo
- list(): Promise<Staff[]>
- upsert(staff: Staff): Promise<void>
- remove(id: string): Promise<void>

## TechnicianApplicationsRepo
- listPending(): Promise<TechApplication[]>
- submit(app: TechApplicationDraft): Promise<void>  // 同 email 拒絕
- approve(id: string): Promise<void>               // 交易化處理
- reject(id: string): Promise<void>

## OrdersRepo
- list(filter?): Promise<OrderSummary[]>
- get(id): Promise<Order>
- create(draft: OrderDraft): Promise<Order>
- update(id, patch): Promise<void>
- delete(id, reason): Promise<void>   // confirmed 禁止
- cancel(id, reason): Promise<void>
- startWork(id, at): Promise<void>
- finishWork(id, at): Promise<void>

## ScheduleRepo
- listTechnician(dateRange): Promise<Slot[]>
- listSupport(dateRange): Promise<SupportShift[]>
- saveTechnicianLeave(leave): Promise<void>   // 禁改過去
- saveSupportShift(shift): Promise<void>      // 禁改過去

## Catalogs (Products/Inventory/Promotions/Documents/Models)
- list(), upsert(), remove() with confirm guard

備註：
- 本機 Adapter 先實作以上介面；Supabase Adapter 於接雲時實作同契約即可替換。
