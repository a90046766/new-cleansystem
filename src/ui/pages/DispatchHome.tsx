import { Link } from 'react-router-dom'

export default function PageDispatchHome() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-lg font-semibold">快速入口</div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <Link to="/orders" className="rounded-xl border bg-white p-4 shadow-card">訂單管理</Link>
          <Link to="/reservations" className="rounded-xl border bg-white p-4 shadow-card">預約訂單</Link>
          <Link to="/schedule" className="rounded-xl border bg-white p-4 shadow-card">排班/派工</Link>
          <Link to="/products" className="rounded-xl border bg-white p-4 shadow-card">產品管理</Link>
        </div>
      </div>
      <div>
        <div className="text-lg font-semibold">公告欄</div>
        <div className="mt-3 rounded-2xl bg-white p-4 text-sm text-gray-600 shadow-card">
          <div className="text-gray-500">目前無公告</div>
        </div>
      </div>
    </div>
  )
}


