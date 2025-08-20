import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, Link, useLocation } from 'react-router-dom';
import { authRepo } from '../adapters/local/auth';
import { notificationRepo } from '../adapters/local/notifications';
import { useEffect, useState } from 'react';
function AppBar() {
    const title = { '/dispatch': '派工', '/me': '個人', '/notifications': '通知', '/schedule': '排班', '/customers': '客戶', '/payroll': '薪資', '/reports': '回報' };
    const loc = useLocation();
    const t = title[loc.pathname] || '訂單內容';
    return (_jsxs("div", { className: "sticky top-0 z-20 flex h-14 items-center justify-center bg-brand-500 text-white", children: [_jsx("div", { className: "absolute left-3 text-xl", onClick: () => window.history.back(), children: "\u2039" }), _jsx("div", { className: "text-lg font-semibold", children: t }), _jsx("div", { className: "absolute right-3", children: "\u22EF" })] }));
}
function TabBar() {
    const loc = useLocation();
    const active = (p) => (loc.pathname.startsWith(p) ? 'text-brand-500' : 'text-gray-400');
    const [unreadCount, setUnreadCount] = useState(0);
    useEffect(() => {
        const user = authRepo.getCurrentUser();
        if (!user)
            return;
        notificationRepo.listForUser(user).then(({ unreadIds }) => {
            const count = Object.values(unreadIds).filter(Boolean).length;
            setUnreadCount(count);
        });
    }, [loc.pathname]);
    return (_jsxs("div", { className: "sticky bottom-0 z-20 grid grid-cols-5 border-t bg-white py-2 text-center text-xs", children: [_jsx(Link, { to: "/dispatch", className: `${active('/dispatch')}`, children: "\u6D3E\u5DE5" }), _jsx(Link, { to: "/orders", className: `${active('/orders')}`, children: "\u8A02\u55AE" }), _jsx(Link, { to: "/schedule", className: `${active('/schedule')}`, children: "\u6392\u73ED" }), _jsxs(Link, { to: "/notifications", className: `relative ${active('/notifications')}`, children: ["\u901A\u77E5", unreadCount > 0 && (_jsx("span", { className: "absolute -right-3 -top-1 rounded-full bg-rose-500 px-1 text-[10px] text-white", children: unreadCount > 99 ? '99+' : unreadCount }))] }), _jsx(Link, { to: "/me", className: `${active('/me')}`, children: "\u500B\u4EBA" })] }));
}
export default function AppShell() {
    const [blocked, setBlocked] = useState(false);
    useEffect(() => {
        const check = () => {
            try {
                const user = authRepo.getCurrentUser();
                const ua = navigator.userAgent.toLowerCase();
                // 更嚴謹的行動裝置判斷：UA / UA-CH / coarse 指標
                // 並將視窗寬度門檻降到 600，避免桌面雙窗被誤攔
                // 註：若裝置為行動或平板，無論寬度皆阻擋；僅在桌面小窗時以 600 為門檻
                // UA
                const isMobileUA = /iphone|ipad|ipod|android|mobile|tablet|silk|kindle|playbook|bb10/.test(ua);
                // UA Client Hints（Chromium）
                // @ts-ignore
                const isUaChMobile = typeof navigator !== 'undefined' && navigator.userAgentData ? navigator.userAgentData.mobile === true : false;
                // 指標（觸控為主）
                const isCoarsePointer = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(any-pointer: coarse)').matches : false;
                // 視口寬度（桌面小窗）
                const isSmallViewport = window.innerWidth < 600;
                const isMobileLike = isMobileUA || isUaChMobile || isCoarsePointer;
                const shouldBlock = !!user && user.role === 'support' && (isMobileLike || (!isMobileLike && isSmallViewport));
                setBlocked(shouldBlock);
            }
            catch { }
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);
    if (blocked) {
        return (_jsx("div", { className: "mx-auto flex min-h-screen max-w-md items-center justify-center bg-[#F5F7FB] p-4", children: _jsxs("div", { className: "w-full rounded-2xl bg-white p-6 text-center shadow-card", children: [_jsx("div", { className: "text-5xl", children: "\uD83D\uDDA5\uFE0F" }), _jsx("h1", { className: "mt-4 text-xl font-bold text-gray-900", children: "\u50C5\u9650\u684C\u9762\u88DD\u7F6E\u4F7F\u7528" }), _jsx("p", { className: "mt-2 text-gray-600", children: "\u5BA2\u670D\u89D2\u8272\u7121\u6CD5\u5728\u624B\u6A5F\u6216\u5E73\u677F\u4E0A\u4F7F\u7528\u7CFB\u7D71\uFF0C\u8ACB\u6539\u7528\u96FB\u8166\u3002" })] }) }));
    }
    return (_jsxs("div", { className: "mx-auto min-h-screen max-w-md bg-[#F5F7FB]", children: [_jsx(AppBar, {}), _jsx("div", { className: "px-3 pb-4 pt-3", children: _jsx(Outlet, {}) }), _jsx(TabBar, {})] }));
}
