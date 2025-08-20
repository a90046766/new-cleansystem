import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { loadAdapters } from '../../adapters';
import { authRepo } from '../../adapters/local/auth';
import { Navigate } from 'react-router-dom';
export default function InventoryPage() {
    const u = authRepo.getCurrentUser();
    if (u && u.role === 'technician')
        return _jsx(Navigate, { to: "/dispatch", replace: true });
    const [rows, setRows] = useState([]);
    const [repos, setRepos] = useState(null);
    const [edit, setEdit] = useState(null);
    const [products, setProducts] = useState([]);
    const load = async () => { if (!repos)
        return; setRows(await repos.inventoryRepo.list()); };
    useEffect(() => { (async () => { const a = await loadAdapters(); setRepos(a); })(); }, []);
    useEffect(() => { if (repos)
        load(); }, [repos]);
    useEffect(() => { (async () => { if (!repos)
        return; setProducts(await repos.productRepo.list()); })(); }, [repos]);
    return (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "text-lg font-semibold", children: "\u5EAB\u5B58\u7BA1\u7406\uFF08\u5167\u90E8\u7528\uFF09" }), rows.map(p => (_jsx("div", { className: `rounded-xl border p-4 shadow-card ${p.safeStock && p.safeStock > 0 && (p.quantity || 0) < p.safeStock ? 'border-rose-400' : ''}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: p.name }), _jsxs("div", { className: "text-xs text-gray-500", children: ["\u6578\u91CF ", p.quantity, " ", p.productId && (_jsx("span", { className: "ml-2 text-gray-400", children: "\u5DF2\u7D81\u5B9A\u7522\u54C1" }))] }), p.safeStock ? _jsxs("div", { className: "text-xs text-rose-600", children: ["\u5B89\u5168\u5EAB\u5B58 ", p.safeStock] }) : null] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setEdit(p), className: "rounded-lg bg-gray-900 px-3 py-1 text-white", children: "\u7DE8\u8F2F" }), _jsx("button", { onClick: async () => { const { confirmTwice } = await import('../kit'); if (await confirmTwice('確認刪除該庫存品項？', '刪除後無法復原，仍要刪除？')) {
                                        if (!repos)
                                            return;
                                        await repos.inventoryRepo.remove(p.id);
                                        load();
                                    } }, className: "rounded-lg bg-rose-500 px-3 py-1 text-white", children: "\u522A\u9664" })] })] }) }, p.id))), rows.length === 0 && _jsx("div", { className: "text-gray-500", children: "\u5C1A\u7121\u5EAB\u5B58" }), edit && (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-4 shadow-card", children: [_jsx("div", { className: "mb-2 text-lg font-semibold", children: "\u7DE8\u8F2F\u5EAB\u5B58" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { children: ["\u540D\u7A31\uFF1A", _jsx("input", { className: "w-full rounded border px-2 py-1", value: edit.name, onChange: e => setEdit({ ...edit, name: e.target.value }) })] }), _jsxs("div", { children: ["\u6578\u91CF\uFF1A", _jsx("input", { type: "number", className: "w-full rounded border px-2 py-1", value: edit.quantity || 0, onChange: e => setEdit({ ...edit, quantity: Number(e.target.value) }) })] }), _jsxs("div", { children: ["\u5B89\u5168\u5EAB\u5B58\uFF1A", _jsx("input", { type: "number", className: "w-full rounded border px-2 py-1", value: edit.safeStock || 0, onChange: e => setEdit({ ...edit, safeStock: Number(e.target.value) }) })] }), _jsxs("div", { children: [_jsx("label", { className: "mr-2 text-gray-600", children: "\u7D81\u5B9A\u7522\u54C1" }), _jsxs("select", { className: "w-full rounded border px-2 py-1", value: edit.productId || '', onChange: e => setEdit({ ...edit, productId: e.target.value || undefined }), children: [_jsx("option", { value: "", children: "\u4E0D\u7D81\u5B9A" }), products.map((pp) => (_jsxs("option", { value: pp.id, children: [pp.name, "\uFF08", pp.unitPrice, "\uFF09"] }, pp.id)))] }), _jsx("div", { className: "mt-1 text-xs text-gray-500", children: "\u7D81\u5B9A\u5F8C\uFF0C\u5B8C\u5DE5\u6263\u5EAB\u6703\u512A\u5148\u4F9D productId \u5C0D\u61C9\u3002" })] })] }), _jsxs("div", { className: "mt-3 flex justify-end gap-2", children: [_jsx("button", { onClick: () => setEdit(null), className: "rounded-lg bg-gray-100 px-3 py-1", children: "\u53D6\u6D88" }), _jsx("button", { onClick: async () => { if (!repos)
                                        return; await repos.inventoryRepo.upsert(edit); setEdit(null); load(); }, className: "rounded-lg bg-brand-500 px-3 py-1 text-white", children: "\u5132\u5B58" })] })] }) }))] }));
}
