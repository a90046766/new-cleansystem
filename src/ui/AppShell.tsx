import { Outlet, Link, useLocation } from 'react-router-dom'
import { authRepo } from '../adapters/local/auth'
import { notificationRepo } from '../adapters/local/notifications'
import { useEffect, useState } from 'react'

function AppBar() {
  const title = { '/dispatch': '派工', '/me': '個人', '/notifications': '通知', '/schedule': '排班', '/customers': '客戶', '/payroll': '薪資', '/reports': '回報' } as Record<string,string>
  const loc = useLocation()
  const t = title[loc.pathname] || '訂單內容'
  const u = authRepo.getCurrentUser()
  return (
    <div className="sticky top-0 z-20 flex h-14 items-center justify-center bg-brand-500 text-white">
      <div className="absolute left-3 text-xl" onClick={() => window.history.back()}>‹</div>
      <div className="text-lg font-semibold">{t}</div>
      <div className="absolute right-3 text-xs opacity-90">{u?.name || ''}</div>
    </div>
  )
}

function TabBar() {
  const loc = useLocation()
  const active = (p: string) => (loc.pathname.startsWith(p) ? 'text-brand-500' : 'text-gray-400')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const user = authRepo.getCurrentUser()
    if (!user) return
    notificationRepo.listForUser(user).then(({ unreadIds }) => {
      const count = Object.values(unreadIds).filter(Boolean).length
      setUnreadCount(count)
    })
  }, [loc.pathname])
  return (
    <div className="sticky bottom-0 z-20 grid grid-cols-5 border-t bg-white py-2 text-center text-sm">
      <Link to="/dispatch" className={`${active('/dispatch')}`}>派工</Link>
      <Link to="/orders" className={`${active('/orders')}`}>訂單</Link>
      <Link to="/schedule" className={`${active('/schedule')}`}>排班</Link>
      <Link to="/notifications" className={`relative ${active('/notifications')}`}>
        通知
        {unreadCount > 0 && (
          <span className="absolute -right-3 -top-1 rounded-full bg-rose-500 px-1 text-[10px] text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </Link>
      <Link to="/me" className={`${active('/me')}`}>個人</Link>
    </div>
  )
}

function DesktopNav() {
  const loc = useLocation()
  const active = (p: string) => (loc.pathname.startsWith(p) ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'text-gray-700 hover:bg-gray-50')
  const [unreadCount, setUnreadCount] = useState(0)
  useEffect(() => {
    const user = authRepo.getCurrentUser()
    if (!user) return
    notificationRepo.listForUser(user).then(({ unreadIds }) => {
      const count = Object.values(unreadIds).filter(Boolean).length
      setUnreadCount(count)
    })
  }, [loc.pathname])
  const Item = ({ to, label }: { to: string; label: string }) => (
    <Link to={to} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${active(to)}`}>
      <span className="truncate">{label}</span>
      {to==='/notifications' && unreadCount>0 && (
        <span className="ml-2 rounded-full bg-rose-500 px-1.5 text-[10px] text-white">{unreadCount>99?'99+':unreadCount}</span>
      )}
    </Link>
  )
  return (
    <aside className="w-56 shrink-0 border-r bg-white p-3">
      <div className="mb-3 px-1 text-sm font-semibold text-gray-500">功能選單</div>
      <nav className="space-y-1">
        <Item to="/dispatch" label="派工總覽" />
        <Item to="/orders" label="訂單管理" />
        <Item to="/schedule" label="排班/派工" />
        <Item to="/approvals" label="申請審核" />
        <Item to="/customers" label="客戶管理" />
        <Item to="/members" label="會員管理" />
        <Item to="/technicians" label="技師管理" />
        <Item to="/staff" label="員工管理" />
        <Item to="/products" label="產品管理" />
        <Item to="/inventory" label="庫存管理" />
        <Item to="/promotions" label="活動管理" />
        <Item to="/reservations" label="預約訂單" />
        <Item to="/notifications" label="通知中心" />
        <Item to="/reports" label="報表/回報" />
        <Item to="/payroll" label="薪資/分潤" />
        <Item to="/documents" label="文件管理" />
        <Item to="/models" label="機型管理" />
        <Item to="/me" label="個人設定" />
      </nav>
    </aside>
  )
}

export default function AppShell() {
  const [blocked, setBlocked] = useState(false)
  useEffect(() => {
    const check = () => {
      try {
        const user = authRepo.getCurrentUser()
        const ua = navigator.userAgent.toLowerCase()
        // 更嚴謹的行動裝置判斷：UA / UA-CH / coarse 指標
        // 並將視窗寬度門檻降到 600，避免桌面雙窗被誤攔
        // 註：若裝置為行動或平板，無論寬度皆阻擋；僅在桌面小窗時以 600 為門檻
        // UA
        const isMobileUA = /iphone|ipad|ipod|android|mobile|tablet|silk|kindle|playbook|bb10/.test(ua)
        // UA Client Hints（Chromium）
        // @ts-ignore
        const isUaChMobile = typeof navigator !== 'undefined' && navigator.userAgentData ? navigator.userAgentData.mobile === true : false
        // 指標（觸控為主）
        const isCoarsePointer = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(any-pointer: coarse)').matches : false
        // 視口寬度（桌面小窗）
        const isSmallViewport = window.innerWidth < 600
        const isMobileLike = isMobileUA || isUaChMobile || isCoarsePointer
        const shouldBlock = !!user && user.role === 'support' && (isMobileLike || (!isMobileLike && isSmallViewport))
        setBlocked(shouldBlock)
      } catch {}
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (blocked) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center bg-[#F5F7FB] p-4">
        <div className="w-full rounded-2xl bg-white p-6 text-center shadow-card">
          <div className="text-5xl">🖥️</div>
          <h1 className="mt-4 text-xl font-bold text-gray-900">僅限桌面裝置使用</h1>
          <p className="mt-2 text-gray-600">客服角色無法在手機或平板上使用系統，請改用電腦。</p>
        </div>
      </div>
    )
  }

  // 角色導向版型：技師保留行動版，其餘採用桌面左側選單
  const user = authRepo.getCurrentUser()
  if (user?.role === 'technician') {
    return (
      <div className="mx-auto min-h-screen bg-[#F5F7FB]">
        <AppBar />
        <div className="px-3 pb-14 pt-3">
          <Outlet />
        </div>
        <TabBar />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F5F7FB]">
      <DesktopNav />
      <main className="flex-1">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/80 px-4 py-3 backdrop-blur">
          <div className="text-base font-semibold text-gray-800">洗濯派工系統 <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-[10px]">v1.1.2</span></div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-700">{authRepo.getCurrentUser()?.name || ''}</div>
            <button onClick={()=>{ authRepo.logout().then(()=>{ window.location.href='/login' }) }} className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700">登出</button>
          </div>
        </div>
        <div className="px-4 py-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}


