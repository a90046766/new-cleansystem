import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { loadAdapters } from '../../adapters';
import { getActivePercent } from '../../utils/promotions';
export default function ReservationsPage() {
    const [rows, setRows] = useState([]);
    const [repos, setRepos] = useState(null);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ customerName: '', customerPhone: '', items: [{ productId: '', name: '服務', unitPrice: 1000, quantity: 1 }] });
    const [products, setProducts] = useState([]);
    useEffect(() => { (async () => { const a = await loadAdapters(); setRepos(a); })(); }, []);
    useEffect(() => { (async () => { if (!repos)
        return; setProducts(await repos.productRepo.list()); })(); }, [repos]);
    const load = async () => { if (!repos)
        return; setRows(await repos.reservationsRepo.list()); };
    useEffect(() => { if (repos)
        load(); }, [repos]);
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-lg font-semibold", children: "\u9810\u7D04\u8A02\u55AE" }), _jsx("button", { onClick: () => setCreating(true), className: "rounded-lg bg-brand-500 px-3 py-1 text-white", children: "\u65B0\u589E\u9810\u7D04" })] }), _jsxs("div", { className: "rounded-2xl bg-white p-2 shadow-card", children: [rows.map(r => (_jsxs("div", { className: "flex items-center justify-between border-b p-3 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: r.customerName }), _jsxs("div", { className: "text-xs text-gray-500", children: [(r.items || []).length, " \u9805\uFF5C\u72C0\u614B ", r.status] }), _jsx(ActivePromoHint, {})] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: async () => {
                                            const { confirmTwice } = await import('../kit');
                                            if (!(await confirmTwice('取消此預約？', '取消後狀態將改為 canceled，仍要取消？')))
                                                return;
                                            if (!repos)
                                                return;
                                            await repos.reservationsRepo.update(r.id, { status: 'canceled' });
                                            load();
                                        }, className: "rounded-lg bg-rose-500 px-3 py-1 text-white", children: "\u53D6\u6D88" }), _jsx("button", { onClick: async () => {
                                            const { confirmTwice } = await import('../kit');
                                            if (!(await confirmTwice('轉為正式訂單？', '轉單後請至訂單管理完成指派與確認，仍要轉單？')))
                                                return;
                                            const percent = await getActivePercent();
                                            if (!repos)
                                                return;
                                            await repos.orderRepo.create({
                                                customerName: r.customerName,
                                                customerPhone: r.customerPhone,
                                                customerAddress: '—',
                                                preferredDate: '', preferredTimeStart: '09:00', preferredTimeEnd: '12:00',
                                                serviceItems: (r.items || []).map((it) => ({
                                                    productId: it.productId || '',
                                                    name: it.name,
                                                    quantity: it.quantity,
                                                    unitPrice: percent > 0 ? Math.round(it.unitPrice * (1 - percent / 100)) : it.unitPrice
                                                })),
                                                assignedTechnicians: [], platform: '日', photos: [], signatures: {}, status: 'draft'
                                            });
                                            alert('已轉單，請至訂單管理查看');
                                        }, className: "rounded-lg bg-brand-500 px-3 py-1 text-white", children: "\u8F49\u55AE" })] })] }, r.id))), rows.length === 0 && _jsx("div", { className: "p-4 text-center text-gray-500", children: "\u6C92\u6709\u9810\u7D04\u55AE" })] }), creating && (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-4 shadow-card", children: [_jsx("div", { className: "mb-2 text-lg font-semibold", children: "\u65B0\u589E\u9810\u7D04" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsx("input", { className: "w-full rounded border px-2 py-1", placeholder: "\u59D3\u540D", value: form.customerName, onChange: e => setForm({ ...form, customerName: e.target.value }) }), _jsx("input", { className: "w-full rounded border px-2 py-1", placeholder: "\u624B\u6A5F", value: form.customerPhone, onChange: e => setForm({ ...form, customerPhone: e.target.value }) }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsxs("select", { className: "rounded border px-2 py-1", value: form.items[0].productId || '', onChange: e => {
                                                const val = e.target.value;
                                                const it = form.items[0];
                                                if (!val) {
                                                    setForm({ ...form, items: [{ ...it, productId: '', name: it.name }] });
                                                    return;
                                                }
                                                const p = products.find((x) => x.id === val);
                                                setForm({ ...form, items: [{ ...it, productId: val, name: p?.name || it.name, unitPrice: p?.unitPrice || it.unitPrice }] });
                                            }, children: [_jsx("option", { value: "", children: "\u81EA\u8A02" }), products.map((p) => (_jsxs("option", { value: p.id, children: [p.name, "\uFF08", p.unitPrice, "\uFF09"] }, p.id)))] }), _jsx("input", { className: "col-span-2 rounded border px-2 py-1", placeholder: "\u9805\u76EE", value: form.items[0].name, onChange: e => setForm({ ...form, items: [{ ...form.items[0], name: e.target.value }] }) }), _jsx("input", { type: "number", className: "w-24 rounded border px-2 py-1", placeholder: "\u55AE\u50F9", value: form.items[0].unitPrice, onChange: e => setForm({ ...form, items: [{ ...form.items[0], unitPrice: Number(e.target.value) }] }) }), _jsx("input", { type: "number", className: "w-24 rounded border px-2 py-1", placeholder: "\u6578\u91CF", value: form.items[0].quantity, onChange: e => setForm({ ...form, items: [{ ...form.items[0], quantity: Number(e.target.value) }] }) })] })] }), _jsxs("div", { className: "mt-3 flex justify-end gap-2", children: [_jsx("button", { onClick: () => setCreating(false), className: "rounded-lg bg-gray-100 px-3 py-1", children: "\u53D6\u6D88" }), _jsx("button", { onClick: async () => { if (!repos)
                                        return; await repos.reservationsRepo.create(form); setCreating(false); setForm({ customerName: '', customerPhone: '', items: [{ name: '服務', unitPrice: 1000, quantity: 1 }] }); load(); }, className: "rounded-lg bg-brand-500 px-3 py-1 text-white", children: "\u5EFA\u7ACB" })] })] }) }))] }));
}
function ActivePromoHint() {
    const [p, setP] = useState(0);
    useEffect(() => { getActivePercent().then(setP); }, []);
    if (p <= 0)
        return null;
    return _jsxs("div", { className: "text-[11px] text-amber-600", children: ["\u76EE\u524D\u6D3B\u52D5\u6298\u6263 ", p, "%"] });
}
