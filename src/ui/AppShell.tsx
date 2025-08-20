import { Outlet, Link, useLocation } from 'react-router-dom'
import { authRepo } from '../adapters/local/auth'
import { notificationRepo } from '../adapters/local/notifications'
import { useEffect, useState } from 'react'

function AppBar() {
  const title = { '/dispatch': '派工', '/me': '個人', '/notifications': '通知', '/schedule': '排班', '/customers': '客戶', '/payroll': '薪資', '/reports': '回報' } as Record<string,string>
  const loc = useLocation()
  const t = title[loc.pathname] || '訂單內容'
  return (
    <div className="sticky top-0 z-20 flex h-14 items-center justify-center bg-brand-500 text-white">
      <div className="absolute left-3 text-xl" onClick={() => window.history.back()}>‹</div>
      <div className="text-lg font-semibold">{t}</div>
      <div className="absolute right-3">⋯</div>
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
    <div className="sticky bottom-0 z-20 grid grid-cols-5 border-t bg-white py-2 text-center text-xs">
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

  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#F5F7FB]">
      <AppBar />
      <div className="px-3 pb-4 pt-3">
        <Outlet />
      </div>
      <TabBar />
    </div>
  )
}


