import { SectionTitle } from '../kit'

export default function PageDispatchHome() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-lg font-semibold">工作區</div>
        <div className="mt-3 rounded-2xl bg-white p-4 text-sm text-gray-600 shadow-card">
          <div>歡迎使用洗濯派工系統。</div>
          <div className="mt-1 text-xs text-gray-500">儀表板假資料已移除。</div>
        </div>
      </div>
      <div>
        <div className="text-lg font-semibold">快速入口</div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <a href="/orders" className="rounded-xl border bg-white p-4 shadow-card">訂單管理</a>
          <a href="/schedule" className="rounded-xl border bg-white p-4 shadow-card">排班/派工</a>
          <a href="/reservations" className="rounded-xl border bg-white p-4 shadow-card">預約訂單</a>
          <a href="/products" className="rounded-xl border bg-white p-4 shadow-card">產品管理</a>
        </div>
      </div>
    </div>
  )
}


