import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { promotionsRepo } from '../../adapters/local/promotions';
import { authRepo } from '../../adapters/local/auth';
import { Navigate } from 'react-router-dom';
import { compressImageToDataUrl } from '../../utils/image';
export default function PromotionsPage() {
    const u = authRepo.getCurrentUser();
    if (u && u.role === 'technician')
        return _jsx(Navigate, { to: "/dispatch", replace: true });
    const [rows, setRows] = useState([]);
    const [edit, setEdit] = useState(null);
    const load = async () => setRows(await promotionsRepo.list());
    useEffect(() => { load(); }, []);
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-lg font-semibold", children: "\u6D3B\u52D5\u7BA1\u7406" }), _jsx("button", { onClick: () => setEdit({ title: '', active: true }), className: "rounded-lg bg-brand-500 px-3 py-1 text-white", children: "\u65B0\u589E" })] }), rows.map(p => (_jsx("div", { className: "rounded-xl border p-4 shadow-card", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: p.title }), _jsxs("div", { className: "text-xs text-gray-500", children: [p.active ? '啟用' : '停用', "\uFF5C", p.startAt || '-', " ~ ", p.endAt || '-'] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setEdit(p), className: "rounded-lg bg-gray-900 px-3 py-1 text-white", children: "\u7DE8\u8F2F" }), _jsx("button", { onClick: async () => { const { confirmTwice } = await import('../kit'); if (await confirmTwice('確認刪除？', '刪除後無法復原，仍要刪除？')) {
                                        await promotionsRepo.remove(p.id);
                                        load();
                                    } }, className: "rounded-lg bg-rose-500 px-3 py-1 text-white", children: "\u522A\u9664" })] })] }) }, p.id))), rows.length === 0 && _jsx("div", { className: "text-gray-500", children: "\u5C1A\u7121\u6D3B\u52D5" }), edit && (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-4 shadow-card", children: [_jsxs("div", { className: "mb-2 text-lg font-semibold", children: [edit.id ? '編輯' : '新增', "\u6D3B\u52D5"] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { children: ["\u6A19\u984C\uFF1A", _jsx("input", { className: "w-full rounded border px-2 py-1", value: edit.title, onChange: e => setEdit({ ...edit, title: e.target.value }) })] }), _jsxs("div", { children: ["\u555F\u7528\uFF1A", _jsx("input", { type: "checkbox", checked: !!edit.active, onChange: e => setEdit({ ...edit, active: e.target.checked }) })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "date", className: "w-full rounded border px-2 py-1", value: edit.startAt || '', onChange: e => setEdit({ ...edit, startAt: e.target.value }) }), _jsx("input", { type: "date", className: "w-full rounded border px-2 py-1", value: edit.endAt || '', onChange: e => setEdit({ ...edit, endAt: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block", children: "\u5C01\u9762\uFF08\u81EA\u52D5\u58D3\u7E2E \u2264200KB\uFF09" }), _jsx("input", { type: "file", accept: "image/*", onChange: async (e) => {
                                                const f = e.target.files?.[0];
                                                if (!f)
                                                    return;
                                                const dataUrl = await compressImageToDataUrl(f, 200);
                                                setEdit((prev) => ({ ...prev, coverUrl: dataUrl }));
                                            } }), edit.coverUrl && _jsx("img", { src: edit.coverUrl, className: "mt-2 h-24 w-24 rounded object-cover" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block", children: "\u767E\u5206\u6BD4\u6298\u6263\uFF08%\uFF09" }), _jsx("input", { type: "number", className: "w-32 rounded border px-2 py-1", value: (edit.rules?.percent) || 0, onChange: e => setEdit({ ...edit, rules: { ...(edit.rules || {}), percent: Number(e.target.value) } }) })] })] }), _jsxs("div", { className: "mt-3 flex justify-end gap-2", children: [_jsx("button", { onClick: () => setEdit(null), className: "rounded-lg bg-gray-100 px-3 py-1", children: "\u53D6\u6D88" }), _jsx("button", { onClick: async () => { await promotionsRepo.upsert(edit); setEdit(null); load(); }, className: "rounded-lg bg-brand-500 px-3 py-1 text-white", children: "\u5132\u5B58" })] })] }) }))] }));
}
