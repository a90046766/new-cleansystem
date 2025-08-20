import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { SectionTitle, StatusChip, TimelineStep, PhotoGrid } from '../kit';
import { Link, useParams } from 'react-router-dom';
import { authRepo } from '../../adapters/local/auth';
import { can } from '../../utils/permissions';
import { useEffect, useState } from 'react';
import { loadAdapters } from '../../adapters';
import { compressImageToDataUrl } from '../../utils/image';
import SignatureModal from '../components/SignatureModal';
export default function PageOrderDetail() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [signOpen, setSignOpen] = useState(false);
    const [editItems, setEditItems] = useState(false);
    const [itemsDraft, setItemsDraft] = useState([]);
    const [memberCode, setMemberCode] = useState('');
    const [memberName, setMemberName] = useState('');
    const [timeLeftSec, setTimeLeftSec] = useState(0);
    const [createdAtEdit, setCreatedAtEdit] = useState('');
    const [dateEdit, setDateEdit] = useState('');
    const [startEdit, setStartEdit] = useState('');
    const [endEdit, setEndEdit] = useState('');
    const [payMethod, setPayMethod] = useState('');
    const [payStatus, setPayStatus] = useState('');
    const [signAs, setSignAs] = useState('technician');
    const user = authRepo.getCurrentUser();
    const [repos, setRepos] = useState(null);
    useEffect(() => { (async () => { const a = await loadAdapters(); setRepos(a); })(); }, []);
    useEffect(() => { if (!repos || !id)
        return; repos.orderRepo.get(id).then(setOrder); }, [id, repos]);
    useEffect(() => { if (order)
        setItemsDraft(order.serviceItems || []); }, [order]);
    useEffect(() => { (async () => { try {
        if (order?.memberId) {
            const { memberRepo } = await import('../../adapters/local/members');
            const m = await memberRepo.get(order.memberId);
            setMemberCode(m?.code || '');
            setMemberName(m?.name || '');
        }
        else {
            setMemberCode('');
            setMemberName('');
        }
    }
    catch { } })(); }, [order?.memberId]);
    useEffect(() => {
        if (!order)
            return;
        const toLocal = (iso) => {
            try {
                return iso.slice(0, 19) + (iso.includes('Z') ? '' : '');
            }
            catch {
                return '';
            }
        };
        setCreatedAtEdit(order.createdAt?.slice(0, 16).replace('T', 'T') || new Date().toISOString().slice(0, 16));
        setDateEdit(order.preferredDate || '');
        setStartEdit(order.preferredTimeStart || '09:00');
        setEndEdit(order.preferredTimeEnd || '12:00');
        setPayMethod(order.paymentMethod || '');
        setPayStatus(order.paymentStatus || '');
    }, [order]);
    const [products, setProducts] = useState([]);
    useEffect(() => { (async () => { if (!repos)
        return; setProducts(await repos.productRepo.list()); })(); }, [repos]);
    // 倒數計時（開始服務後 N 分鐘內不可按「服務完成」；由設定決定）
    useEffect(() => {
        if (!order?.workStartedAt || order.status === 'completed' || order.status === 'canceled') {
            setTimeLeftSec(0);
            return;
        }
        const parseTs = (s) => {
            if (!s)
                return 0;
            if (s.includes('T'))
                return Date.parse(s);
            const d = new Date(s);
            return isNaN(d.getTime()) ? 0 : d.getTime();
        };
        let h;
        (async () => {
            try {
                const { settingsRepo } = await import('../../adapters/local/settings');
                const s = await settingsRepo.get();
                const COOLDOWN_MS = (s.countdownEnabled ? s.countdownMinutes : 0) * 60 * 1000;
                if (!COOLDOWN_MS) {
                    setTimeLeftSec(0);
                    return;
                }
                const started = parseTs(order.workStartedAt);
                const endAt = started + COOLDOWN_MS;
                const tick = () => { const now = Date.now(); const left = Math.max(0, Math.floor((endAt - now) / 1000)); setTimeLeftSec(left); };
                tick();
                h = setInterval(tick, 1000);
            }
            catch {
                setTimeLeftSec(0);
            }
        })();
        return () => { if (h)
            clearInterval(h); };
    }, [order?.workStartedAt, order?.status]);
    if (!order)
        return _jsx("div", { children: "\u8F09\u5165\u4E2D..." });
    const isAdminOrSupport = user?.role === 'admin' || user?.role === 'support';
    const isAssignedTech = user?.role === 'technician' && Array.isArray(order.assignedTechnicians) && order.assignedTechnicians.includes(user?.name || '');
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "rounded-xl bg-amber-50 p-3 text-sm", children: [_jsx("div", { className: "font-semibold", children: order.serviceItems?.[0]?.name || '服務內容' }), _jsx("div", { className: "mt-1 flex items-center gap-2", children: _jsx(StatusChip, { kind: order.status === 'completed' ? 'done' : 'pending', text: order.status === 'completed' ? '已完成' : '處理中' }) }), _jsxs("div", { className: "mt-1 text-xs text-gray-600", children: ["\u6703\u54E1\uFF1A", memberCode ? (_jsxs(_Fragment, { children: [memberCode, memberName ? `（${memberName}）` : '', _jsx("button", { className: "ml-2 rounded bg-gray-100 px-1.5 py-0.5", onClick: () => navigator.clipboard.writeText(memberCode), children: "\u8907\u88FDMO" })] })) : '—'] })] }), _jsxs("div", { className: "flex items-center justify-end gap-2", children: [order.status !== 'canceled' && can(user, 'orders.cancel') && (_jsx("button", { className: "rounded-xl bg-rose-500 px-4 py-2 text-white", onClick: async () => {
                            const { confirmTwice } = await import('../kit');
                            if (order.status !== 'confirmed') {
                                alert('僅已確認的訂單可以取消');
                                return;
                            }
                            if (!(await confirmTwice('確認要取消此訂單？', '取消後需重新下單，仍要取消？')))
                                return;
                            const reason = prompt('請輸入取消理由：') || '';
                            if (!reason.trim())
                                return;
                            await repos.orderRepo.cancel(order.id, reason);
                            const o = await repos.orderRepo.get(order.id);
                            setOrder(o);
                            alert('已取消');
                        }, children: "\u53D6\u6D88\u8A02\u55AE" })), order.status === 'draft' && can(user, 'orders.delete') && (_jsx("button", { className: "rounded-xl bg-gray-900 px-4 py-2 text-white", onClick: async () => {
                            const { confirmTwice } = await import('../kit');
                            if (!(await confirmTwice('確認要刪除此草稿訂單？', '刪除後無法復原，仍要刪除？')))
                                return;
                            const reason = prompt('請輸入刪除理由：') || '';
                            if (!reason.trim())
                                return;
                            try {
                                await repos.orderRepo.delete(order.id, reason);
                                alert('已刪除');
                                window.history.back();
                            }
                            catch (e) {
                                alert(e?.message || '刪除失敗');
                            }
                        }, children: "\u522A\u9664\uFF08\u8349\u7A3F\uFF09" }))] }), _jsxs("div", { className: "rounded-2xl bg-white p-4 shadow-card", children: [_jsx(SectionTitle, { children: "\u5BA2\u6236\u8CC7\u6599" }), _jsxs("div", { className: "mt-3 grid grid-cols-2 gap-3 text-sm", children: [_jsxs("div", { children: ["\u59D3\u540D\uFF1A", _jsx("input", { className: "w-full rounded border px-2 py-1", value: order.customerName || '', onChange: async (e) => { await repos.orderRepo.update(order.id, { customerName: e.target.value }); const o = await repos.orderRepo.get(order.id); setOrder(o); } })] }), _jsxs("div", { children: ["\u624B\u6A5F\uFF1A", _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "w-full rounded border px-2 py-1", value: order.customerPhone || '', onChange: async (e) => { await repos.orderRepo.update(order.id, { customerPhone: e.target.value }); const o = await repos.orderRepo.get(order.id); setOrder(o); } }), _jsx("a", { href: `tel:${order.customerPhone}`, className: "rounded bg-brand-500 px-3 py-1 text-white", children: "\u64A5\u6253" })] })] }), _jsxs("div", { className: "col-span-2", children: ["\u5730\u5740\uFF1A", _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "w-full rounded border px-2 py-1", value: order.customerAddress || '', onChange: async (e) => { await repos.orderRepo.update(order.id, { customerAddress: e.target.value }); const o = await repos.orderRepo.get(order.id); setOrder(o); } }), _jsx("a", { className: "rounded bg-gray-100 px-3 py-1", target: "_blank", href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customerAddress || '')}`, children: "\u5730\u5716" })] })] }), _jsxs("div", { children: ["\u6703\u54E1\u7DE8\u865F\uFF1A", _jsx("span", { className: "text-gray-700", children: memberCode || '—' })] })] })] }), _jsxs("div", { className: "rounded-2xl bg-white p-4 shadow-card", children: [_jsx(SectionTitle, { children: "\u670D\u52D9\u5167\u5BB9" }), _jsxs("div", { className: "mt-3 text-sm", children: [!editItems ? (_jsxs("div", { className: "rounded border", children: [_jsxs("div", { className: "grid grid-cols-4 bg-gray-50 px-2 py-1 text-xs text-gray-600", children: [_jsx("div", { children: "\u9805\u76EE" }), _jsx("div", { children: "\u6578\u91CF" }), _jsx("div", { children: "\u55AE\u50F9" }), _jsx("div", { className: "text-right", children: "\u5C0F\u8A08" })] }), (order.serviceItems || []).map((it, i) => {
                                        const sub = it.quantity * it.unitPrice;
                                        return _jsxs("div", { className: "grid grid-cols-4 items-center px-2 py-1 text-sm", children: [_jsx("div", { children: it.name }), _jsx("div", { children: it.quantity }), _jsx("div", { children: it.unitPrice }), _jsx("div", { className: "text-right", children: sub })] }, i);
                                    }), _jsxs("div", { className: "border-t px-2 py-1 text-right text-rose-600", children: ["\u5C0F\u8A08\uFF1A", _jsx("span", { className: "text-base font-semibold", children: (order.serviceItems || []).reduce((s, it) => s + it.unitPrice * it.quantity, 0) })] })] })) : (_jsxs("div", { className: "mt-2 space-y-2 text-sm", children: [itemsDraft.map((it, i) => (_jsxs("div", { className: "grid grid-cols-6 items-center gap-2", children: [_jsxs("select", { className: "col-span-2 rounded border px-2 py-1", value: it.productId || '', onChange: async (e) => { const val = e.target.value; const arr = [...itemsDraft]; if (val) {
                                                    const p = products.find((x) => x.id === val);
                                                    arr[i] = { ...arr[i], productId: val, name: p?.name || it.name, unitPrice: p?.unitPrice || it.unitPrice };
                                                }
                                                else {
                                                    arr[i] = { ...arr[i], productId: undefined };
                                                } setItemsDraft(arr); }, children: [_jsx("option", { value: "", children: "\u81EA\u8A02" }), products.map((p) => (_jsxs("option", { value: p.id, children: [p.name, "\uFF08", p.unitPrice, "\uFF09"] }, p.id)))] }), _jsx("input", { className: "col-span-2 rounded border px-2 py-1", value: it.name, onChange: e => { const arr = [...itemsDraft]; arr[i] = { ...arr[i], name: e.target.value }; setItemsDraft(arr); } }), _jsx("input", { type: "number", className: "rounded border px-2 py-1", value: it.quantity, onChange: e => { const arr = [...itemsDraft]; arr[i] = { ...arr[i], quantity: Number(e.target.value) }; setItemsDraft(arr); } }), _jsx("input", { type: "number", className: "rounded border px-2 py-1", value: it.unitPrice, onChange: e => { const arr = [...itemsDraft]; arr[i] = { ...arr[i], unitPrice: Number(e.target.value) }; setItemsDraft(arr); } }), _jsx("button", { onClick: () => { const arr = [...itemsDraft]; arr.splice(i, 1); setItemsDraft(arr); }, className: "rounded bg-gray-100 px-2 py-1", children: "\u522A" })] }, i))), _jsx("div", { children: _jsx("button", { onClick: () => setItemsDraft([...itemsDraft, { name: '', quantity: 1, unitPrice: 0 }]), className: "rounded bg-gray-100 px-2 py-1", children: "\u65B0\u589E\u9805\u76EE" }) }), _jsx("div", { className: "text-right", children: _jsx("button", { onClick: async () => { await repos.orderRepo.update(order.id, { serviceItems: itemsDraft }); const o = await repos.orderRepo.get(order.id); setOrder(o); setEditItems(false); }, className: "rounded bg-brand-500 px-3 py-1 text-white", children: "\u5132\u5B58" }) })] })), user?.role !== 'technician' && _jsx("div", { className: "mt-2 text-right", children: _jsx("button", { onClick: () => setEditItems(e => !e), className: "rounded bg-gray-100 px-2 py-1 text-xs", children: editItems ? '取消' : '編輯項目' }) }), _jsxs("div", { className: "mt-4 rounded border p-2 text-xs text-gray-700", children: [_jsx("div", { className: "mb-2 font-semibold", children: "\u7A4D\u5206\u62B5\u6263" }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsxs("div", { children: ["\u7D2F\u7A4D\u7A4D\u5206\uFF1A", _jsx("span", { className: "font-mono", children: order.memberPoints ?? '—' })] }), _jsxs("div", { children: ["\u4F7F\u7528\u7A4D\u5206\uFF1A", _jsx("input", { type: "number", className: "w-24 rounded border px-2 py-1", value: order.pointsUsed || 0, onChange: async (e) => { const pts = Math.max(0, Number(e.target.value) || 0); await repos.orderRepo.update(order.id, { pointsUsed: pts }); const o = await repos.orderRepo.get(order.id); setOrder(o); } })] }), _jsxs("div", { children: ["\u6298\u62B5\u91D1\u984D\uFF1A", _jsx("input", { type: "number", className: "w-24 rounded border px-2 py-1", value: order.pointsDeductAmount || 0, onChange: async (e) => { const amt = Math.max(0, Number(e.target.value) || 0); await repos.orderRepo.update(order.id, { pointsDeductAmount: amt }); const o = await repos.orderRepo.get(order.id); setOrder(o); } })] })] }), _jsxs("div", { className: "mt-2 text-right", children: [_jsxs("div", { children: ["\u5C0F\u8A08\uFF1A", (order.serviceItems || []).reduce((s, it) => s + it.unitPrice * it.quantity, 0)] }), _jsxs("div", { children: ["\u6298\u62B5\uFF1A-", order.pointsDeductAmount || 0] }), _jsxs("div", { className: "text-rose-600", children: ["\u61C9\u4ED8\uFF1A", _jsx("span", { className: "text-base font-semibold", children: Math.max(0, (order.serviceItems || []).reduce((s, it) => s + it.unitPrice * it.quantity, 0) - (order.pointsDeductAmount || 0)) })] })] })] }), _jsxs("div", { className: "mt-3 grid grid-cols-2 gap-2 text-xs", children: [_jsxs("div", { children: ["\u4ED8\u6B3E\u65B9\u5F0F\uFF1A", _jsxs("select", { className: "rounded border px-2 py-1", value: payMethod, onChange: async (e) => { setPayMethod(e.target.value); await repos.orderRepo.update(order.id, { paymentMethod: e.target.value }); const o = await repos.orderRepo.get(order.id); setOrder(o); }, children: [_jsx("option", { value: "", children: "\u2014" }), _jsx("option", { value: "cash", children: "\u73FE\u91D1" }), _jsx("option", { value: "transfer", children: "\u8F49\u5E33" }), _jsx("option", { value: "card", children: "\u5237\u5361" }), _jsx("option", { value: "other", children: "\u5176\u4ED6" })] })] }), _jsxs("div", { children: ["\u4ED8\u6B3E\u72C0\u614B\uFF1A", _jsxs("select", { className: "rounded border px-2 py-1", value: payStatus, onChange: async (e) => { setPayStatus(e.target.value); await repos.orderRepo.update(order.id, { paymentStatus: e.target.value }); const o = await repos.orderRepo.get(order.id); setOrder(o); }, children: [_jsx("option", { value: "", children: "\u2014" }), _jsx("option", { value: "unpaid", children: "\u672A\u4ED8\u6B3E" }), _jsx("option", { value: "partial", children: "\u90E8\u5206\u4ED8\u6B3E" }), _jsx("option", { value: "paid", children: "\u5DF2\u4ED8\u6B3E" })] })] })] })] })] }), _jsxs("div", { className: "rounded-2xl bg-white p-4 shadow-card", children: [_jsx(SectionTitle, { children: "\u9810\u7D04\u8CC7\u8A0A" }), _jsxs("div", { className: "mt-3 space-y-2 text-sm", children: [_jsxs("div", { children: ["\u4E0B\u55AE\u6642\u9593\uFF08\u4E0D\u53EF\u6539\uFF09\uFF1A", _jsx("input", { type: "datetime-local", className: "w-full rounded border px-2 py-1", value: createdAtEdit, readOnly: true })] }), _jsxs("div", { children: ["\u670D\u52D9\u65E5\u671F\uFF1A", _jsxs("div", { className: "mt-1 grid grid-cols-3 gap-2", children: [_jsx("input", { type: "date", className: "rounded border px-2 py-1", value: dateEdit, onChange: e => setDateEdit(e.target.value), onBlur: async () => { await repos.orderRepo.update(order.id, { preferredDate: dateEdit }); const o = await repos.orderRepo.get(order.id); setOrder(o); } }), _jsx("input", { type: "time", className: "rounded border px-2 py-1", value: startEdit, onChange: e => setStartEdit(e.target.value), onBlur: async () => { await repos.orderRepo.update(order.id, { preferredTimeStart: startEdit }); const o = await repos.orderRepo.get(order.id); setOrder(o); } }), _jsx("input", { type: "time", className: "rounded border px-2 py-1", value: endEdit, onChange: e => setEndEdit(e.target.value), onBlur: async () => { await repos.orderRepo.update(order.id, { preferredTimeEnd: endEdit }); const o = await repos.orderRepo.get(order.id); setOrder(o); } })] })] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["\u63A8\u85A6\u78BC\uFF1A", order.referrerCode || '-', " ", order.referrerCode && (_jsx("button", { className: "ml-2 underline", onClick: () => navigator.clipboard.writeText(order.referrerCode), children: "\u8907\u88FD" }))] }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [_jsxs("div", { children: ["\u4ED8\u6B3E\u65B9\u5F0F\uFF1A", _jsxs("select", { className: "rounded border px-2 py-1", value: payMethod, onChange: async (e) => { setPayMethod(e.target.value); await repos.orderRepo.update(order.id, { paymentMethod: e.target.value }); const o = await repos.orderRepo.get(order.id); setOrder(o); }, children: [_jsx("option", { value: "", children: "\u2014" }), _jsx("option", { value: "cash", children: "\u73FE\u91D1" }), _jsx("option", { value: "transfer", children: "\u8F49\u5E33" }), _jsx("option", { value: "card", children: "\u5237\u5361" }), _jsx("option", { value: "other", children: "\u5176\u4ED6" })] })] }), _jsxs("div", { children: ["\u4ED8\u6B3E\u72C0\u614B\uFF1A", _jsxs("select", { className: "rounded border px-2 py-1", value: payStatus, onChange: async (e) => { setPayStatus(e.target.value); await repos.orderRepo.update(order.id, { paymentStatus: e.target.value }); const o = await repos.orderRepo.get(order.id); setOrder(o); }, children: [_jsx("option", { value: "", children: "\u2014" }), _jsx("option", { value: "unpaid", children: "\u672A\u4ED8\u6B3E" }), _jsx("option", { value: "partial", children: "\u90E8\u5206\u4ED8\u6B3E" }), _jsx("option", { value: "paid", children: "\u5DF2\u4ED8\u6B3E" })] })] })] }), _jsxs("div", { className: "text-xs text-gray-700", children: ["\u6703\u54E1\uFF1A", can(user, 'orders.update') ? (_jsxs("span", { className: "inline-flex items-center gap-2", children: [_jsx("input", { className: "rounded border px-2 py-1 text-sm", placeholder: "\u8F38\u5165 MOxxxx", value: memberCode, onChange: e => setMemberCode(e.target.value) }), _jsx("button", { className: "rounded bg-gray-900 px-2 py-1 text-white", onClick: async () => {
                                                    const code = (memberCode || '').trim().toUpperCase();
                                                    if (!code) {
                                                        await repos.orderRepo.update(order.id, { memberId: undefined });
                                                        const o = await repos.orderRepo.get(order.id);
                                                        setOrder(o);
                                                        alert('已取消綁定');
                                                        return;
                                                    }
                                                    if (!code.startsWith('MO')) {
                                                        alert('請輸入有效的會員編號（MOxxxx）');
                                                        return;
                                                    }
                                                    try {
                                                        const { memberRepo } = await import('../../adapters/local/members');
                                                        const m = await memberRepo.findByCode(code);
                                                        if (!m) {
                                                            alert('查無此會員編號');
                                                            return;
                                                        }
                                                        await repos.orderRepo.update(order.id, { memberId: m.id });
                                                        const o = await repos.orderRepo.get(order.id);
                                                        setOrder(o);
                                                        alert('已綁定會員：' + (m.name || ''));
                                                    }
                                                    catch {
                                                        alert('綁定失敗');
                                                    }
                                                }, children: "\u5132\u5B58" }), memberCode && _jsx("button", { className: "rounded bg-gray-100 px-2 py-1", onClick: () => navigator.clipboard.writeText(memberCode), children: "\u8907\u88FDMO" })] })) : (_jsxs("span", { children: [memberCode || '—', memberName ? `（${memberName}）` : ''] }))] }), _jsxs("div", { className: "pt-2", children: [user?.role !== 'technician' && (_jsx(Link, { to: `/schedule?orderId=${order.id}&date=${order.preferredDate || ''}&start=${order.preferredTimeStart}&end=${order.preferredTimeEnd}`, className: "inline-block rounded-xl bg-brand-500 px-4 py-2 text-white", children: "\u6307\u6D3E\u6280\u5E2B" })), order.status === 'draft' && can(user, 'orders.update') && _jsx("button", { onClick: async () => { await repos.orderRepo.confirm(order.id); const o = await repos.orderRepo.get(order.id); setOrder(o); alert('已確認'); }, className: "ml-2 inline-block rounded-xl bg-blue-600 px-4 py-2 text-white", children: "\u78BA\u8A8D" })] }), Array.isArray(order.assignedTechnicians) && order.assignedTechnicians.length > 0 && (_jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "font-semibold", children: "\u5DF2\u6307\u6D3E\u6280\u5E2B\uFF1A" }), _jsx("div", { className: "mt-1 flex flex-wrap gap-2", children: order.assignedTechnicians.map((n, i) => (_jsx("span", { className: "rounded-full bg-brand-100 px-2 py-1 text-xs text-brand-700", children: n }, i))) }), _jsxs("div", { className: "mt-2", children: [_jsx("label", { className: "text-sm text-gray-600", children: "\u7C3D\u540D\u6280\u5E2B" }), _jsxs("select", { className: "ml-2 rounded-lg border px-2 py-1 text-sm", value: order.signatureTechnician || '', onChange: async (e) => {
                                                    const val = e.target.value;
                                                    await repos.orderRepo.update(order.id, { signatureTechnician: val });
                                                    const o = await repos.orderRepo.get(order.id);
                                                    setOrder(o);
                                                }, children: [_jsx("option", { value: "", children: "\u8ACB\u9078\u64C7" }), order.assignedTechnicians.map((n, i) => (_jsx("option", { value: n, children: n }, i)))] }), _jsx("button", { onClick: () => setSignOpen(true), className: "ml-2 rounded bg-gray-900 px-3 py-1 text-white", children: "\u7C3D\u540D" })] })] }))] })] }), _jsx(SignatureModal, { open: signOpen, onClose: () => setSignOpen(false), onSave: async (dataUrl) => { await repos.orderRepo.update(order.id, { signatures: { ...(order.signatures || {}), [order.signatureTechnician || 'technician']: dataUrl } }); const o = await repos.orderRepo.get(order.id); setOrder(o); setSignOpen(false); } }), _jsxs("div", { className: "rounded-2xl bg-white p-4 shadow-card", children: [_jsx(SectionTitle, { children: "\u670D\u52D9\u7167\u7247" }), _jsxs("div", { className: "mt-3 grid grid-cols-1 gap-4 md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("div", { className: "mb-1 font-semibold", children: "\u6E05\u6D17\u524D" }), _jsx(PhotoGrid, { urls: order.photosBefore || [] }), _jsx("div", { className: "mt-2 text-sm", children: _jsx("input", { type: "file", accept: "image/*", multiple: true, onChange: async (e) => {
                                                const files = Array.from(e.target.files || []);
                                                const imgs = [];
                                                for (const f of files)
                                                    imgs.push(await compressImageToDataUrl(f, 200));
                                                await repos.orderRepo.update(order.id, { photosBefore: [...(order.photosBefore || []), ...imgs] });
                                                const o = await repos.orderRepo.get(order.id);
                                                setOrder(o);
                                            } }) })] }), _jsxs("div", { children: [_jsx("div", { className: "mb-1 font-semibold", children: "\u6E05\u6D17\u5F8C" }), _jsx(PhotoGrid, { urls: order.photosAfter || [] }), _jsx("div", { className: "mt-2 text-sm", children: _jsx("input", { type: "file", accept: "image/*", multiple: true, onChange: async (e) => {
                                                const files = Array.from(e.target.files || []);
                                                const imgs = [];
                                                for (const f of files)
                                                    imgs.push(await compressImageToDataUrl(f, 200));
                                                await repos.orderRepo.update(order.id, { photosAfter: [...(order.photosAfter || []), ...imgs] });
                                                const o = await repos.orderRepo.get(order.id);
                                                setOrder(o);
                                            } }) })] })] })] }), _jsxs("div", { className: "rounded-2xl bg-white p-4 shadow-card", children: [_jsx(SectionTitle, { children: "\u8A02\u55AE\u9032\u5EA6" }), _jsxs("div", { className: "mt-2", children: [_jsx(TimelineStep, { index: 1, title: "\u806F\u7D61\u5BA2\u6236", time: "2025/07/14 13:57:50" }), _jsx(TimelineStep, { index: 2, title: "\u78BA\u8A8D\u5831\u50F9", time: "2025/07/14 13:57:51" }), _jsx(TimelineStep, { index: 3, title: "\u78BA\u8A8D\u6D3E\u6848", time: "2025/07/14 13:58:33" }), _jsx(TimelineStep, { index: 4, title: "\u670D\u52D9\u5B8C\u6210", time: "2025/08/17 20:25:29" })] }), _jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx("button", { onClick: async () => { if (!confirm('開始服務前請再次告知公司承諾並取得同意。是否開始？'))
                                    return; await repos.orderRepo.startWork(order.id, new Date().toISOString()); const o = await repos.orderRepo.get(order.id); setOrder(o); }, className: "rounded bg-brand-500 px-3 py-1 text-white", children: "\u958B\u59CB\u670D\u52D9" }), _jsx("button", { disabled: timeLeftSec > 0, onClick: async () => { if (!confirm('是否確認服務完成？'))
                                    return; await repos.orderRepo.finishWork(order.id, new Date().toISOString()); const o = await repos.orderRepo.get(order.id); setOrder(o); }, className: `rounded px-3 py-1 text-white ${timeLeftSec > 0 ? 'bg-gray-400' : 'bg-gray-900'}`, children: timeLeftSec > 0 ? `服務完成（剩餘 ${String(Math.floor(timeLeftSec / 60)).padStart(2, '0')}:${String(timeLeftSec % 60).padStart(2, '0')}）` : '服務完成' })] })] })] }));
}
