import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { notificationRepo } from '../../adapters/local/notifications';
import { authRepo } from '../../adapters/local/auth';
import { can } from '../../utils/permissions';
export default function NotificationsPage() {
    const [items, setItems] = useState([]);
    const [unread, setUnread] = useState({});
    const [compose, setCompose] = useState({ title: '', body: '', target: 'all', targetUserEmail: '', subset: '' });
    const load = async () => {
        const user = authRepo.getCurrentUser();
        if (!user)
            return;
        const { items, unreadIds } = await notificationRepo.listForUser(user);
        setItems(items);
        setUnread(unreadIds);
    };
    useEffect(() => { load(); }, []);
    const markRead = async (id) => {
        const user = authRepo.getCurrentUser();
        if (!user)
            return;
        await notificationRepo.markRead(user, id);
        await load();
    };
    return (_jsxs("div", { className: "space-y-3", children: [(() => { const u = authRepo.getCurrentUser(); return can(u, 'notifications.send'); })() && (_jsxs("div", { className: "rounded-2xl bg-white p-4 shadow-card", children: [_jsx("div", { className: "mb-2 text-base font-semibold", children: "\u767C\u9001\u901A\u77E5" }), _jsxs("div", { className: "grid grid-cols-1 gap-2 text-sm", children: [_jsx("input", { className: "rounded border px-2 py-1", placeholder: "\u6A19\u984C", value: compose.title, onChange: e => setCompose({ ...compose, title: e.target.value }) }), _jsx("textarea", { className: "rounded border px-2 py-1", placeholder: "\u5167\u5BB9\uFF08\u9078\u586B\uFF09", value: compose.body, onChange: e => setCompose({ ...compose, body: e.target.value }) }), _jsxs("select", { className: "rounded border px-2 py-1", value: compose.target, onChange: e => setCompose({ ...compose, target: e.target.value }), children: [_jsx("option", { value: "all", children: "\u5168\u90E8" }), _jsx("option", { value: "tech", children: "\u6280\u5E2B" }), _jsx("option", { value: "support", children: "\u5BA2\u670D" }), _jsx("option", { value: "sales", children: "\u696D\u52D9" }), _jsx("option", { value: "member", children: "\u6703\u54E1" }), _jsx("option", { value: "user", children: "\u6307\u5B9A\u4F7F\u7528\u8005" }), _jsx("option", { value: "subset", children: "\u90E8\u5206\u540D\u55AE" })] }), compose.target === 'user' && (_jsx("input", { className: "rounded border px-2 py-1", placeholder: "\u76EE\u6A19 Email", value: compose.targetUserEmail, onChange: e => setCompose({ ...compose, targetUserEmail: e.target.value }) })), compose.target === 'subset' && (_jsx("textarea", { className: "rounded border px-2 py-1", placeholder: "\u591A\u4F4D Email\uFF0C\u9017\u865F\u6216\u63DB\u884C\u5206\u9694", value: compose.subset, onChange: e => setCompose({ ...compose, subset: e.target.value }) })), _jsx("div", { className: "text-right", children: _jsx("button", { onClick: async () => { const user = authRepo.getCurrentUser(); if (!user)
                                        return; if (compose.target === 'subset') {
                                        const emails = (compose.subset || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
                                        for (const em of emails) {
                                            await notificationRepo.push({ title: compose.title, body: compose.body, level: 'info', target: 'user', targetUserEmail: em });
                                        }
                                    }
                                    else {
                                        const payload = { title: compose.title, body: compose.body, level: 'info', target: compose.target };
                                        if (compose.target === 'user')
                                            payload.targetUserEmail = compose.targetUserEmail;
                                        await notificationRepo.push(payload);
                                    } setCompose({ title: '', body: '', target: 'all', targetUserEmail: '', subset: '' }); const { items, unreadIds } = await notificationRepo.listForUser(user); setItems(items); setUnread(unreadIds); }, className: "rounded-lg bg-brand-500 px-3 py-1 text-white", children: "\u767C\u9001" }) })] })] })), items.map(it => (_jsxs("div", { className: `rounded-xl border bg-white p-4 shadow-card ${unread[it.id] ? 'border-brand-300' : 'border-gray-200'}`, children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-base font-semibold", children: it.title }), it.body && _jsx("div", { className: "mt-1 text-sm text-gray-600", children: it.body })] }), unread[it.id] && (_jsx("button", { onClick: () => markRead(it.id), className: "rounded-lg bg-brand-500 px-3 py-1 text-xs text-white", children: "\u6A19\u793A\u5DF2\u8B80" }))] }), _jsx("div", { className: "mt-2 text-xs text-gray-400", children: new Date(it.sentAt || it.createdAt).toLocaleString('zh-TW') })] }, it.id))), items.length === 0 && (_jsx("div", { className: "text-center text-gray-500", children: "\u76EE\u524D\u6C92\u6709\u901A\u77E5" }))] }));
}
