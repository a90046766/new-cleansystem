import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { productRepo } from '../../adapters/local/products';
import { authRepo } from '../../adapters/local/auth';
import { Navigate } from 'react-router-dom';
export default function ProductsPage() {
    const u = authRepo.getCurrentUser();
    if (u && u.role === 'technician')
        return _jsx(Navigate, { to: "/dispatch", replace: true });
    const [rows, setRows] = useState([]);
    const [edit, setEdit] = useState(null);
    const [img, setImg] = useState(null);
    const load = async () => setRows(await productRepo.list());
    useEffect(() => { load(); }, []);
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-lg font-semibold", children: "\u7522\u54C1\u7BA1\u7406" }), _jsx("button", { onClick: () => setEdit({ id: '', name: '', unitPrice: 0, groupPrice: undefined, groupMinQty: 0, description: '', imageUrls: [], safeStock: 0 }), className: "rounded-lg bg-brand-500 px-3 py-1 text-white", children: "\u65B0\u589E" })] }), rows.map(p => (_jsx("div", { className: `rounded-xl border p-4 shadow-card ${p.safeStock && p.safeStock > 0 && (p.quantity || 0) < p.safeStock ? 'border-amber-400' : ''}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: p.name }), _jsxs("div", { className: "text-xs text-gray-500", children: ["\u55AE\u50F9 ", p.unitPrice, "\uFF5C\u5718\u8CFC ", p.groupPrice || '-', "\uFF08", p.groupMinQty, " \u4EF6\uFF09"] }), p.safeStock ? _jsxs("div", { className: "text-xs text-amber-600", children: ["\u5B89\u5168\u5EAB\u5B58 ", p.safeStock] }) : null] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setEdit(p), className: "rounded-lg bg-gray-900 px-3 py-1 text-white", children: "\u7DE8\u8F2F" }), _jsx("button", { onClick: async () => {
                                        const { confirmTwice } = await import('../kit');
                                        const ok = await confirmTwice('確認刪除該產品？', '刪除後無法復原，仍要刪除？');
                                        if (!ok)
                                            return;
                                        try {
                                            const { productRepo } = await import('../../adapters/local/products');
                                            await productRepo.remove(p.id);
                                            load();
                                        }
                                        catch { }
                                    }, className: "rounded-lg bg-rose-500 px-3 py-1 text-white", children: "\u522A\u9664" })] })] }) }, p.id))), rows.length === 0 && _jsx("div", { className: "text-gray-500", children: "\u5C1A\u7121\u7522\u54C1" }), edit && (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-4 shadow-card", children: [_jsx("div", { className: "mb-2 text-lg font-semibold", children: "\u7DE8\u8F2F\u7522\u54C1" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { children: ["\u540D\u7A31\uFF1A", _jsx("input", { className: "w-full rounded border px-2 py-1", value: edit.name, onChange: e => setEdit({ ...edit, name: e.target.value }) })] }), _jsxs("div", { children: ["\u55AE\u50F9\uFF1A", _jsx("input", { type: "number", className: "w-full rounded border px-2 py-1", value: edit.unitPrice, onChange: e => setEdit({ ...edit, unitPrice: Number(e.target.value) }) })] }), _jsxs("div", { children: ["\u5B89\u5168\u5EAB\u5B58\uFF1A", _jsx("input", { type: "number", className: "w-full rounded border px-2 py-1", value: edit.safeStock || 0, onChange: e => setEdit({ ...edit, safeStock: Number(e.target.value) }) })] }), _jsx("div", { className: "text-xs text-gray-500", children: "\u4FDD\u5B58\u5F8C\u53EF\u65BC\u8A02\u55AE\u9805\u76EE\u5F15\u7528\u6B64\u7522\u54C1\uFF08\u5E36\u5165\u55AE\u50F9\uFF09\u3002" }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block", children: "\u5716\u7247\uFF08\u81EA\u52D5\u58D3\u7E2E \u2264200KB\uFF09" }), _jsx("input", { type: "file", accept: "image/*", onChange: async (e) => {
                                                const f = e.target.files?.[0];
                                                if (!f)
                                                    return;
                                                const { compressImageToDataUrl } = await import('../../utils/image');
                                                const dataUrl = await compressImageToDataUrl(f, 200);
                                                setImg(dataUrl);
                                            } }), img && _jsx("img", { src: img, className: "mt-2 h-24 w-24 rounded object-cover" })] })] }), _jsxs("div", { className: "mt-3 flex justify-end gap-2", children: [_jsx("button", { onClick: () => setEdit(null), className: "rounded-lg bg-gray-100 px-3 py-1", children: "\u53D6\u6D88" }), edit.id && (_jsx("button", { onClick: async () => {
                                        const { inventoryRepo } = await import('../../adapters/local/inventory');
                                        const { confirmTwice } = await import('../kit');
                                        if (!(await confirmTwice('建立對應庫存？', '將建立數量為 0、並綁定此產品。是否繼續？')))
                                            return;
                                        await inventoryRepo.upsert({ id: '', name: edit.name, productId: edit.id, quantity: 0, imageUrls: [], safeStock: edit.safeStock || 0 });
                                        alert('已建立對應庫存並綁定');
                                    }, className: "rounded-lg bg-gray-200 px-3 py-1 text-sm", children: "\u5EFA\u7ACB\u5C0D\u61C9\u5EAB\u5B58" })), _jsx("button", { onClick: async () => { const payload = { ...edit, imageUrls: img ? [img] : (edit.imageUrls || []) }; await productRepo.upsert(payload); setEdit(null); setImg(null); load(); }, className: "rounded-lg bg-brand-500 px-3 py-1 text-white", children: "\u5132\u5B58" })] })] }) }))] }));
}
