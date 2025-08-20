import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { staffRepo } from '../../adapters/local/staff';
import { authRepo } from '../../adapters/local/auth';
import { Navigate } from 'react-router-dom';
import { getPermissionOverride, setPermissionOverride } from '../../utils/permissions';
export default function StaffManagementPage() {
    const u = authRepo.getCurrentUser();
    if (u && u.role !== 'admin')
        return _jsx(Navigate, { to: "/dispatch", replace: true });
    const [rows, setRows] = useState([]);
    const [edit, setEdit] = useState(null);
    const load = async () => setRows(await staffRepo.list());
    useEffect(() => { load(); }, []);
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-lg font-semibold", children: "\u54E1\u5DE5\u7BA1\u7406" }), _jsx("button", { onClick: () => setEdit({ name: '', email: '', role: 'support', status: 'active' }), className: "rounded-lg bg-brand-500 px-3 py-1 text-white", children: "\u65B0\u589E" })] }), _jsx(AdminSettingsPanel, {}), rows.map(s => (_jsxs("div", { className: "rounded-xl border p-4 shadow-card", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "font-semibold", children: [s.name, " ", _jsx("span", { className: "text-xs text-gray-500", children: s.refCode || '' })] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["\u4FE1\u7BB1 ", s.email, "\uFF5C\u624B\u6A5F ", s.phone || '-', "\uFF5C\u806F\u7D61\u4EBA\u624B\u6A5F ", s.contactPhone || '-', "\uFF5C\u54E1\u5DE5\u7DE8\u865F ", s.refCode || '-', "\uFF5C", s.role === 'support' ? '客服' : '業務', "\uFF5C", s.status === 'active' ? '啟用' : '停用', "\uFF5C\u7A4D\u5206 ", s.points || 0] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [s.refCode && _jsx("button", { onClick: () => navigator.clipboard.writeText(s.refCode), className: "rounded-lg bg-gray-100 px-3 py-1 text-sm", children: "\u8907\u88FD\u7DE8\u865F" }), _jsx("button", { onClick: () => setEdit(s), className: "rounded-lg bg-gray-900 px-3 py-1 text-white", children: "\u7DE8\u8F2F" }), _jsx("button", { onClick: async () => { const { confirmTwice } = await import('../kit'); if (await confirmTwice('確認刪除該員工？', '刪除後無法復原，仍要刪除？')) {
                                            await staffRepo.remove(s.id);
                                            load();
                                        } }, className: "rounded-lg bg-rose-500 px-3 py-1 text-white", children: "\u522A\u9664" }), _jsx("button", { onClick: async () => { await staffRepo.resetPassword(s.id); alert('已觸發重設密碼（示意）'); }, className: "rounded-lg bg-gray-100 px-3 py-1 text-sm", children: "\u91CD\u8A2D\u5BC6\u78BC" })] })] }), _jsx(PermissionOverrideEditor, { email: s.email })] }, s.id))), rows.length === 0 && _jsx("div", { className: "text-gray-500", children: "\u5C1A\u7121\u54E1\u5DE5" }), edit && (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-4 shadow-card", children: [_jsxs("div", { className: "mb-2 text-lg font-semibold", children: [edit.id ? '編輯' : '新增', "\u54E1\u5DE5"] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { children: ["\u59D3\u540D\uFF1A", _jsx("input", { className: "w-full rounded border px-2 py-1", value: edit.name, onChange: e => setEdit({ ...edit, name: e.target.value }) })] }), _jsxs("div", { children: ["Email\uFF1A", _jsx("input", { className: "w-full rounded border px-2 py-1", value: edit.email, onChange: e => setEdit({ ...edit, email: e.target.value }) })] }), _jsxs("div", { children: ["\u89D2\u8272\uFF1A", _jsxs("select", { className: "w-full rounded border px-2 py-1", value: edit.role, onChange: e => setEdit({ ...edit, role: e.target.value }), children: [_jsx("option", { value: "support", children: "\u5BA2\u670D" }), _jsx("option", { value: "sales", children: "\u696D\u52D9" })] })] }), _jsxs("div", { children: ["\u72C0\u614B\uFF1A", _jsxs("select", { className: "w-full rounded border px-2 py-1", value: edit.status, onChange: e => setEdit({ ...edit, status: e.target.value }), children: [_jsx("option", { value: "active", children: "\u555F\u7528" }), _jsx("option", { value: "suspended", children: "\u505C\u7528" })] })] })] }), _jsxs("div", { className: "mt-3 flex justify-end gap-2", children: [_jsx("button", { onClick: () => setEdit(null), className: "rounded-lg bg-gray-100 px-3 py-1", children: "\u53D6\u6D88" }), _jsx("button", { onClick: async () => { await staffRepo.upsert(edit); setEdit(null); load(); }, className: "rounded-lg bg-brand-500 px-3 py-1 text-white", children: "\u5132\u5B58" })] })] }) }))] }));
}
function AdminSettingsPanel() {
    const u = authRepo.getCurrentUser();
    const [enabled, setEnabled] = useState(true);
    const [mins, setMins] = useState(20);
    useEffect(() => { (async () => { try {
        const { settingsRepo } = await import('../../adapters/local/settings');
        const s = await settingsRepo.get();
        setEnabled(!!s.countdownEnabled);
        setMins(s.countdownMinutes || 20);
    }
    catch { } })(); }, []);
    if (!u || u.role !== 'admin')
        return null;
    return (_jsxs("div", { className: "rounded-xl border bg-white p-3 text-sm shadow-card", children: [_jsx("div", { className: "mb-2 font-semibold", children: "\u7CFB\u7D71\u8A2D\u5B9A" }), _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: enabled, onChange: e => setEnabled(e.target.checked) }), "\u555F\u7528\u670D\u52D9\u5B8C\u6210\u51B7\u537B\u5012\u6578"] }), _jsxs("div", { children: ["\u5206\u9418\uFF1A", _jsx("input", { type: "number", className: "w-20 rounded border px-2 py-1", value: mins, onChange: e => setMins(Number(e.target.value)) })] }), _jsx("button", { onClick: async () => { const { settingsRepo } = await import('../../adapters/local/settings'); await settingsRepo.set({ countdownEnabled: enabled, countdownMinutes: Math.max(1, mins | 0) }); alert('已儲存設定'); }, className: "rounded bg-gray-900 px-3 py-1 text-white", children: "\u5132\u5B58" })] })] }));
}
function PermissionOverrideEditor({ email }) {
    const [open, setOpen] = useState(false);
    const [allow, setAllow] = useState([]);
    const [deny, setDeny] = useState([]);
    useEffect(() => {
        const ov = getPermissionOverride(email || '');
        setAllow(ov?.allow || []);
        setDeny(ov?.deny || []);
    }, [email]);
    const toggle = (list, val) => list.includes(val) ? list.filter(v => v !== val) : [...list, val];
    const ALL = ['orders.list', 'orders.create', 'orders.update', 'orders.delete', 'orders.cancel', 'reservations.manage', 'customers.manage', 'technicians.manage', 'technicians.schedule.view', 'technicians.schedule.edit', 'support.schedule.view', 'support.schedule.edit', 'staff.manage', 'products.manage', 'inventory.manage', 'promotions.manage', 'documents.manage', 'models.manage', 'notifications.send', 'approvals.manage', 'payroll.view', 'payroll.edit', 'reports.view', 'reports.manage'];
    const labelMap = {
        'orders.list': '訂單-檢視', 'orders.read': '訂單-讀取', 'orders.create': '訂單-新增', 'orders.update': '訂單-編輯', 'orders.delete': '訂單-刪除', 'orders.cancel': '訂單-取消',
        'reservations.manage': '預約-管理', 'customers.manage': '客戶-管理', 'technicians.manage': '技師-管理', 'technicians.schedule.view': '技師排班-檢視', 'technicians.schedule.edit': '技師排班-編輯', 'support.schedule.view': '客服排班-檢視', 'support.schedule.edit': '客服排班-編輯', 'staff.manage': '員工-管理', 'products.manage': '產品-管理', 'inventory.manage': '庫存-管理', 'promotions.manage': '活動-管理', 'documents.manage': '文件-管理', 'models.manage': '機型-管理', 'notifications.send': '通知-發送', 'approvals.manage': '審核-管理', 'payroll.view': '薪資-檢視', 'payroll.edit': '薪資-編輯', 'reports.view': '報表-檢視', 'reports.manage': '報表-管理'
    };
    const label = (p) => labelMap[p] || p;
    const applyPreset = async (preset) => {
        // 預設：依角色常用權限
        const presets = {
            support: ['orders.list', 'orders.read', 'orders.create', 'orders.update', 'orders.cancel', 'reservations.manage', 'customers.manage', 'technicians.schedule.view', 'support.schedule.view', 'support.schedule.edit', 'notifications.send', 'approvals.manage', 'reports.view', 'payroll.view'],
            sales: ['customers.manage', 'promotions.manage', 'documents.manage', 'models.manage', 'notifications.send', 'reports.view'],
            technician: ['orders.list', 'orders.read', 'orders.update', 'technicians.schedule.view', 'notifications.read']
        };
        setAllow(presets[preset]);
        setDeny([]);
    };
    return (_jsxs("div", { className: "mt-2", children: [_jsx("button", { onClick: () => setOpen(o => !o), className: "rounded bg-gray-100 px-2 py-1 text-xs", children: open ? '收起權限覆蓋' : '編輯權限覆蓋' }), open && (_jsxs("div", { className: "mt-2 rounded border p-2", children: [_jsxs("div", { className: "mb-2 flex items-center gap-2 text-xs", children: [_jsx("span", { className: "text-gray-600", children: "\u5FEB\u901F\u5957\u7528\uFF1A" }), _jsx("button", { onClick: () => applyPreset('support'), className: "rounded bg-gray-100 px-2 py-1", children: "\u5BA2\u670D\u9810\u8A2D" }), _jsx("button", { onClick: () => applyPreset('sales'), className: "rounded bg-gray-100 px-2 py-1", children: "\u696D\u52D9\u9810\u8A2D" }), _jsx("button", { onClick: () => applyPreset('technician'), className: "rounded bg-gray-100 px-2 py-1", children: "\u6280\u5E2B\u9810\u8A2D" })] }), _jsx("div", { className: "text-xs text-gray-600", children: "\u5141\u8A31" }), _jsx("div", { className: "mt-1 grid grid-cols-2 gap-1", children: ALL.map(p => (_jsxs("label", { className: "flex items-center gap-1 text-xs", children: [_jsx("input", { type: "checkbox", checked: allow.includes(p), onChange: e => setAllow(toggle(allow, p)) }), label(p)] }, `a-${p}`))) }), _jsx("div", { className: "mt-2 text-xs text-gray-600", children: "\u62D2\u7D55" }), _jsx("div", { className: "mt-1 grid grid-cols-2 gap-1", children: ALL.map(p => (_jsxs("label", { className: "flex items-center gap-1 text-xs", children: [_jsx("input", { type: "checkbox", checked: deny.includes(p), onChange: e => setDeny(toggle(deny, p)) }), label(p)] }, `d-${p}`))) }), _jsx("div", { className: "mt-2 text-right", children: _jsx("button", { onClick: () => { setPermissionOverride(email, { allow: allow, deny: deny }); alert('已儲存覆蓋'); }, className: "rounded bg-brand-500 px-3 py-1 text-xs text-white", children: "\u5132\u5B58\u8986\u84CB" }) })] }))] }));
}
