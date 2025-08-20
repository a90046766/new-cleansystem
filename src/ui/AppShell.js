import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, Link, useLocation } from 'react-router-dom';
import { authRepo } from '../adapters/local/auth';
import { notificationRepo } from '../adapters/local/notifications';
import { useEffect, useState } from 'react';
function AppBar() {
    const title = { '/dispatch': '派工', '/me': '個人', '/notifications': '通知', '/schedule': '排班', '/customers': '客戶', '/payroll': '薪資', '/reports': '回報' };
    const loc = useLocation();
    const t = title[loc.pathname] || '訂單內容';
    const u = authRepo.getCurrentUser();
    return (_jsxs("div", { className: "sticky top-0 z-20 flex h-14 items-center justify-center bg-brand-500 text-white", children: [_jsx("div", { className: "absolute left-3 text-xl", onClick: () => window.history.back(), children: "\u2039" }), _jsx("div", { className: "text-lg font-semibold", children: t }), _jsx("div", { className: "absolute right-3 text-xs opacity-90", children: u?.name || '' })] }));
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
    return (_jsxs("div", { className: "sticky bottom-0 z-20 grid grid-cols-5 border-t bg-white py-2 text-center text-sm", children: [_jsx(Link, { to: "/dispatch", className: `${active('/dispatch')}`, children: "\u6D3E\u5DE5" }), _jsx(Link, { to: "/orders", className: `${active('/orders')}`, children: "\u8A02\u55AE" }), _jsx(Link, { to: "/schedule", className: `${active('/schedule')}`, children: "\u6392\u73ED" }), _jsxs(Link, { to: "/notifications", className: `relative ${active('/notifications')}`, children: ["\u901A\u77E5", unreadCount > 0 && (_jsx("span", { className: "absolute -right-3 -top-1 rounded-full bg-rose-500 px-1 text-[10px] text-white", children: unreadCount > 99 ? '99+' : unreadCount }))] }), _jsx(Link, { to: "/me", className: `${active('/me')}`, children: "\u500B\u4EBA" })] }));
}
function DesktopNav() {
    const loc = useLocation();
    const active = (p) => (loc.pathname.startsWith(p) ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'text-gray-700 hover:bg-gray-50');
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
    const Item = ({ to, label }) => (_jsxs(Link, { to: to, className: `flex items-center justify-between rounded-lg px-3 py-2 text-sm ${active(to)}`, children: [_jsx("span", { className: "truncate", children: label }), to === '/notifications' && unreadCount > 0 && (_jsx("span", { className: "ml-2 rounded-full bg-rose-500 px-1.5 text-[10px] text-white", children: unreadCount > 99 ? '99+' : unreadCount }))] }));
    return (_jsxs("aside", { className: "w-56 shrink-0 border-r bg-white p-3", children: [_jsx("div", { className: "mb-3 px-1 text-sm font-semibold text-gray-500", children: "\u529F\u80FD\u9078\u55AE" }), _jsxs("nav", { className: "space-y-1", children: [_jsx(Item, { to: "/dispatch", label: "\u6D3E\u5DE5\u7E3D\u89BD" }), _jsx(Item, { to: "/orders", label: "\u8A02\u55AE\u7BA1\u7406" }), _jsx(Item, { to: "/schedule", label: "\u6392\u73ED/\u6D3E\u5DE5" }), _jsx(Item, { to: "/approvals", label: "\u7533\u8ACB\u5BE9\u6838" }), _jsx(Item, { to: "/customers", label: "\u5BA2\u6236\u7BA1\u7406" }), _jsx(Item, { to: "/members", label: "\u6703\u54E1\u7BA1\u7406" }), _jsx(Item, { to: "/technicians", label: "\u6280\u5E2B\u7BA1\u7406" }), _jsx(Item, { to: "/staff", label: "\u54E1\u5DE5\u7BA1\u7406" }), _jsx(Item, { to: "/products", label: "\u7522\u54C1\u7BA1\u7406" }), _jsx(Item, { to: "/inventory", label: "\u5EAB\u5B58\u7BA1\u7406" }), _jsx(Item, { to: "/promotions", label: "\u6D3B\u52D5\u7BA1\u7406" }), _jsx(Item, { to: "/reservations", label: "\u9810\u7D04\u8A02\u55AE" }), _jsx(Item, { to: "/notifications", label: "\u901A\u77E5\u4E2D\u5FC3" }), _jsx(Item, { to: "/reports", label: "\u5831\u8868/\u56DE\u5831" }), _jsx(Item, { to: "/payroll", label: "\u85AA\u8CC7/\u5206\u6F64" }), _jsx(Item, { to: "/documents", label: "\u6587\u4EF6\u7BA1\u7406" }), _jsx(Item, { to: "/models", label: "\u6A5F\u578B\u7BA1\u7406" }), _jsx(Item, { to: "/me", label: "\u500B\u4EBA\u8A2D\u5B9A" })] })] }));
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
    // 角色導向版型：技師保留行動版，其餘採用桌面左側選單
    const user = authRepo.getCurrentUser();
    if (user?.role === 'technician') {
        return (_jsxs("div", { className: "mx-auto min-h-screen bg-[#F5F7FB]", children: [_jsx(AppBar, {}), _jsx("div", { className: "px-3 pb-14 pt-3", children: _jsx(Outlet, {}) }), _jsx(TabBar, {})] }));
    }
    return (_jsxs("div", { className: "flex min-h-screen bg-[#F5F7FB]", children: [_jsx(DesktopNav, {}), _jsxs("main", { className: "flex-1", children: [_jsxs("div", { className: "sticky top-0 z-10 flex items-center justify-between border-b bg-white/80 px-4 py-3 backdrop-blur", children: [_jsxs("div", { className: "text-base font-semibold text-gray-800", children: ["\u6D17\u6FEF\u6D3E\u5DE5\u7CFB\u7D71 ", _jsx("span", { className: "ml-2 rounded bg-gray-100 px-2 py-0.5 text-[10px]", children: "v1.1.2" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "text-sm text-gray-700", children: authRepo.getCurrentUser()?.name || '' }), _jsx("button", { onClick: () => { authRepo.logout().then(() => { window.location.href = '/login'; }); }, className: "rounded bg-gray-100 px-3 py-1 text-sm text-gray-700", children: "\u767B\u51FA" })] })] }), _jsx("div", { className: "px-4 py-4", children: _jsx(Outlet, {}) })] })] }));
}
