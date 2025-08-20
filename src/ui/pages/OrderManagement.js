import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getActivePercent } from '../../utils/promotions';
import { Link } from 'react-router-dom';
import { authRepo } from '../../adapters/local/auth';
import { can } from '../../utils/permissions';
import { loadAdapters } from '../../adapters';
export default function OrderManagementPage() {
    const [rows, setRows] = useState([]);
    const [repos, setRepos] = useState(null);
    const user = authRepo.getCurrentUser();
    const [q, setQ] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [pf, setPf] = useState({});
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ customerName: '', customerPhone: '', customerAddress: '', preferredDate: '', preferredTimeStart: '09:00', preferredTimeEnd: '12:00', platform: '日', referrerCode: '', serviceItems: [{ name: '服務', quantity: 1, unitPrice: 1000 }], assignedTechnicians: [], photos: [], signatures: {} });
    const [activePercent, setActivePercent] = useState(0);
    const [products, setProducts] = useState([]);
    const load = async () => { if (!repos)
        return; setRows(await repos.orderRepo.list()); };
    useEffect(() => { (async () => { const a = await loadAdapters(); setRepos(a); })(); }, []);
    useEffect(() => { if (repos)
        load(); }, [repos]);
    useEffect(() => { getActivePercent().then(setActivePercent); }, [creating]);
    useEffect(() => { (async () => { try {
        const { productRepo } = await import('../../adapters/local/products');
        setProducts(await productRepo.list());
    }
    catch { } })(); }, [creating]);
    const filtered = rows.filter(o => {
        const hit = !q || o.id.includes(q) || (o.customerName || '').includes(q);
        const pfKeys = Object.keys(pf).filter(k => pf[k]);
        const byPf = pfKeys.length === 0 || pfKeys.includes(o.platform);
        const byStatus = (() => {
            if (statusTab === 'all')
                return true;
            if (statusTab === 'pending')
                return ['draft', 'confirmed', 'in_progress'].includes(o.status);
            if (statusTab === 'completed')
                return o.status === 'completed';
            if (statusTab === 'closed')
                return o.status === 'canceled';
            return true;
        })();
        const byOwner = (() => {
            if (!user || user.role !== 'technician')
                return true;
            const names = Array.isArray(o.assignedTechnicians) ? o.assignedTechnicians : [];
            return names.includes(user.name);
        })();
        return hit && byPf && byStatus && byOwner;
    });
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-lg font-semibold", children: "\u8A02\u55AE\u7BA1\u7406" }), _jsx("div", { className: "flex items-center gap-2 text-xs", children: [
                            ['all', '全部'],
                            ['pending', '待服務'],
                            ['completed', '已完成'],
                            ['closed', '已結案'],
                        ].map(([key, label]) => (_jsx("button", { onClick: () => setStatusTab(key), className: `rounded-full px-2.5 py-1 ${statusTab === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`, children: label }, key))) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { placeholder: "\u641C\u5C0BID/\u5BA2\u6236", className: "rounded border px-2 py-1 text-sm", value: q, onChange: e => setQ(e.target.value) }), can(user, 'orders.create') && _jsx("button", { onClick: () => setCreating(true), className: "rounded-lg bg-brand-500 px-3 py-1 text-white", children: "\u65B0\u5EFA\u8A02\u55AE" })] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs", children: [['日', '同', '黃', '今'].map(p => (_jsx("button", { onClick: () => setPf(s => ({ ...s, [p]: !s[p] })), className: `rounded-full px-2.5 py-1 ${pf[p] ? 'bg-brand-100 text-brand-700 ring-1 ring-brand-300' : 'bg-gray-100 text-gray-700'}`, children: p }, p))), _jsx("button", { onClick: () => setPf({}), className: "rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100", children: "\u6E05\u9664" }), filtered.length > 0 && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => {
                                    const header = ['ID', '平台', '客戶', '時間', '金額', '推薦碼'];
                                    const lines = filtered.map((o) => {
                                        const amt = (o.serviceItems || []).reduce((s, it) => s + it.unitPrice * it.quantity, 0);
                                        return [o.id, o.platform, o.customerName, `${(o.preferredDate || '')} ${o.preferredTimeStart}~${o.preferredTimeEnd}`, amt, o.referrerCode || ''].join(',');
                                    });
                                    const csv = [header.join(','), ...lines].join('\n');
                                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'orders.csv';
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }, className: "ml-auto rounded bg-gray-900 px-2.5 py-1 text-white", children: "\u532F\u51FA\u5217\u8868 CSV" }), _jsx("button", { onClick: () => {
                                    const header = ['ID', '平台', '客戶', '時間', '金額', '推薦碼'];
                                    const rowsHtml = filtered.map((o) => {
                                        const amt = (o.serviceItems || []).reduce((s, it) => s + it.unitPrice * it.quantity, 0);
                                        return `<tr><td>${o.id}</td><td>${o.platform}</td><td>${o.customerName}</td><td>${(o.preferredDate || '')} ${o.preferredTimeStart}~${o.preferredTimeEnd}</td><td>${amt}</td><td>${o.referrerCode || ''}</td></tr>`;
                                    }).join('');
                                    const html = `<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head><body><table><thead><tr>${header.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
                                    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'orders.xls';
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }, className: "rounded bg-brand-600 px-2.5 py-1 text-white", children: "\u532F\u51FA Excel" })] }))] }), _jsxs("div", { className: "rounded-2xl bg-white p-2 shadow-card", children: [filtered.map(o => (_jsxs(Link, { to: `/orders/${o.id}`, className: "flex items-center justify-between border-b p-3 text-sm", children: [_jsxs("div", { children: [_jsxs("div", { className: "font-semibold", children: [o.id, " ", _jsx("span", { className: `ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${o.platform === '日' ? 'bg-blue-100 text-blue-700' : o.platform === '同' ? 'bg-purple-100 text-purple-700' : o.platform === '黃' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`, children: o.platform })] }), _jsxs("div", { className: "text-xs text-gray-500", children: [o.customerName, "\uFF5C", o.preferredDate, " ", o.preferredTimeStart, "~", o.preferredTimeEnd, "\uFF5C\u63A8\u85A6\u78BC ", o.referrerCode || '-', " ", o.referrerCode && _jsx("button", { onClick: (e) => { e.preventDefault(); navigator.clipboard.writeText(o.referrerCode); }, className: "ml-1 rounded bg-gray-100 px-2 py-0.5", children: "\u8907\u88FD" })] }), Array.isArray(o.assignedTechnicians) && o.assignedTechnicians.length > 0 && (_jsxs("div", { className: "mt-1 text-[11px] text-gray-500", children: ["\u6280\u5E2B\uFF1A", o.assignedTechnicians.join('、')] }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [o.status === 'draft' && _jsx("span", { className: "rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700", children: "\u8349\u7A3F" }), o.status === 'confirmed' && _jsx("span", { className: "rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700", children: "\u5DF2\u78BA\u8A8D" }), o.status === 'in_progress' && _jsx("span", { className: "rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-700", children: "\u670D\u52D9\u4E2D" }), o.status === 'completed' && _jsx("span", { className: "rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-700", children: "\u5B8C\u6210" }), o.status === 'canceled' && _jsx("span", { className: "rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-700", children: "\u53D6\u6D88" }), _jsx("div", { className: "text-gray-600", children: "\u203A" })] })] }, o.id))), filtered.length === 0 && _jsx("div", { className: "p-4 text-center text-gray-500", children: "\u6C92\u6709\u8CC7\u6599" })] }), creating && (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-4 shadow-card", children: [_jsx("div", { className: "mb-2 text-lg font-semibold", children: "\u65B0\u5EFA\u8A02\u55AE" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsx("input", { className: "w-full rounded border px-2 py-1", placeholder: "\u5BA2\u6236\u59D3\u540D", value: form.customerName, onChange: e => setForm({ ...form, customerName: e.target.value }) }), _jsx("input", { className: "w-full rounded border px-2 py-1", placeholder: "\u624B\u6A5F", value: form.customerPhone, onChange: e => setForm({ ...form, customerPhone: e.target.value }) }), _jsx("input", { className: "w-full rounded border px-2 py-1", placeholder: "\u5730\u5740", value: form.customerAddress, onChange: e => setForm({ ...form, customerAddress: e.target.value }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "date", className: "w-full rounded border px-2 py-1", value: form.preferredDate, onChange: e => setForm({ ...form, preferredDate: e.target.value }) }), _jsx("input", { type: "time", className: "w-full rounded border px-2 py-1", value: form.preferredTimeStart, onChange: e => setForm({ ...form, preferredTimeStart: e.target.value }) }), _jsx("input", { type: "time", className: "w-full rounded border px-2 py-1", value: form.preferredTimeEnd, onChange: e => setForm({ ...form, preferredTimeEnd: e.target.value }) })] }), _jsx("input", { className: "w-full rounded border px-2 py-1", placeholder: "\u63A8\u85A6\u78BC\uFF08MOxxxx / SRxxx / SExxx\uFF09", value: form.referrerCode, onChange: e => setForm({ ...form, referrerCode: e.target.value }) }), _jsxs("div", { className: "grid gap-1 text-xs text-gray-500", children: [_jsxs("div", { children: ["\u6D3B\u52D5\u6298\u6263\uFF1A", activePercent > 0 ? `${activePercent}%` : '—'] }), _jsx("input", { className: "w-full rounded border px-2 py-1 text-sm", placeholder: "\u6703\u54E1\u7DE8\u865F\uFF08MOxxxx\uFF09\u53EF\u9078", value: form.memberCode || '', onChange: e => setForm({ ...form, memberCode: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { className: "mr-2 text-sm text-gray-600", children: "\u5E73\u53F0" }), _jsxs("select", { className: "rounded border px-2 py-1 text-sm", value: form.platform || '日', onChange: e => setForm({ ...form, platform: e.target.value }), children: [_jsx("option", { value: "\u65E5", children: "\u65E5" }), _jsx("option", { value: "\u540C", children: "\u540C" }), _jsx("option", { value: "\u9EC3", children: "\u9EC3" }), _jsx("option", { value: "\u4ECA", children: "\u4ECA" })] })] }), _jsxs("div", { className: "space-y-2", children: [form.serviceItems.map((it, idx) => (_jsxs("div", { className: "grid grid-cols-6 items-center gap-2", children: [_jsxs("select", { className: "col-span-2 rounded border px-2 py-1", value: it.productId || '', onChange: e => {
                                                        const val = e.target.value;
                                                        const arr = [...form.serviceItems];
                                                        if (!val) {
                                                            arr[idx] = { ...arr[idx], productId: '', name: it.name };
                                                            setForm({ ...form, serviceItems: arr });
                                                            return;
                                                        }
                                                        const p = products.find((x) => x.id === val);
                                                        arr[idx] = { ...arr[idx], productId: val, name: p?.name || it.name, unitPrice: p?.unitPrice || it.unitPrice };
                                                        setForm({ ...form, serviceItems: arr });
                                                    }, children: [_jsx("option", { value: "", children: "\u81EA\u8A02" }), products.map((p) => (_jsxs("option", { value: p.id, children: [p.name, "\uFF08", p.unitPrice, "\uFF09"] }, p.id)))] }), _jsx("input", { className: "col-span-2 rounded border px-2 py-1", placeholder: "\u9805\u76EE", value: it.name, onChange: e => { const arr = [...form.serviceItems]; arr[idx] = { ...arr[idx], name: e.target.value }; setForm({ ...form, serviceItems: arr }); } }), _jsx("input", { type: "number", className: "rounded border px-2 py-1", placeholder: "\u6578\u91CF", value: it.quantity, onChange: e => { const arr = [...form.serviceItems]; arr[idx] = { ...arr[idx], quantity: Number(e.target.value) }; setForm({ ...form, serviceItems: arr }); } }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "number", className: "w-24 rounded border px-2 py-1", placeholder: "\u55AE\u50F9", value: it.unitPrice, onChange: e => { const arr = [...form.serviceItems]; arr[idx] = { ...arr[idx], unitPrice: Number(e.target.value) }; setForm({ ...form, serviceItems: arr }); } }), _jsx("button", { onClick: () => { const arr = [...form.serviceItems]; arr.splice(idx, 1); setForm({ ...form, serviceItems: arr.length ? arr : [{ name: '服務', quantity: 1, unitPrice: 0 }] }); }, className: "rounded bg-gray-100 px-2 py-1 text-xs", children: "\u522A" })] })] }, idx))), _jsx("button", { onClick: () => setForm({ ...form, serviceItems: [...form.serviceItems, { name: '', quantity: 1, unitPrice: 0 }] }), className: "rounded bg-gray-100 px-2 py-1 text-xs", children: "\u65B0\u589E\u54C1\u9805" })] })] }), _jsxs("div", { className: "mt-3 flex justify-end gap-2", children: [_jsx("button", { onClick: () => setCreating(false), className: "rounded-lg bg-gray-100 px-3 py-1", children: "\u53D6\u6D88" }), _jsx("button", { onClick: async () => { if (!repos)
                                        return; const percent = await getActivePercent(); const items = form.serviceItems.map((it) => percent > 0 ? ({ ...it, unitPrice: Math.round(it.unitPrice * (1 - percent / 100)) }) : it); let memberId = undefined; if ((form.memberCode || '').startsWith('MO')) {
                                        try {
                                            const a = repos;
                                            const m = await a.memberRepo.findByCode(form.memberCode);
                                            if (m)
                                                memberId = m.id;
                                        }
                                        catch { }
                                    } await repos.orderRepo.create({ ...form, status: 'draft', platform: form.platform || '日', memberId, serviceItems: items }); setCreating(false); setForm({ customerName: '', customerPhone: '', customerAddress: '', preferredDate: '', preferredTimeStart: '09:00', preferredTimeEnd: '12:00', platform: '日', referrerCode: '', memberCode: '', serviceItems: [{ productId: '', name: '服務', quantity: 1, unitPrice: 1000 }], assignedTechnicians: [], photos: [], signatures: {} }); load(); }, className: "rounded-lg bg-brand-500 px-3 py-1 text-white", children: "\u5EFA\u7ACB" })] })] }) }))] }));
}
