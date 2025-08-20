import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { SectionTitle, StatusChip, TimelineStep, PhotoGrid } from '../kit';
import { Link, useParams } from 'react-router-dom';
import { authRepo } from '../../adapters/local/auth';
import { can } from '../../utils/permissions';
import { useEffect, useState } from 'react';
import { orderRepo } from '../../adapters/local/orders';
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
    const user = authRepo.getCurrentUser();
    useEffect(() => { if (id)
        orderRepo.get(id).then(setOrder); }, [id]);
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
    const [products, setProducts] = useState([]);
    useEffect(() => { (async () => { const { productRepo } = await import('../../adapters/local/products'); setProducts(await productRepo.list()); })(); }, []);
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
                            await orderRepo.cancel(order.id, reason);
                            const o = await orderRepo.get(order.id);
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
                                await orderRepo.delete(order.id, reason);
                                alert('已刪除');
                                window.history.back();
                            }
                            catch (e) {
                                alert(e?.message || '刪除失敗');
                            }
                        }, children: "\u522A\u9664\uFF08\u8349\u7A3F\uFF09" }))] }), _jsx("div", { className: "rounded-2xl bg-white p-4 shadow-card", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-base font-semibold", children: order.customerName }), _jsx("div", { className: "text-brand-600 underline", children: order.customerAddress })] }), _jsx("a", { href: `tel:${order.customerPhone}`, className: "rounded-full bg-brand-500 px-3 py-2 text-white", children: "\u64A5\u6253" })] }) }), _jsxs("div", { className: "rounded-2xl bg-white p-4 shadow-card", children: [_jsx(SectionTitle, { children: "\u9810\u7D04\u8CC7\u8A0A" }), _jsxs("div", { className: "mt-3 space-y-2 text-sm", children: [_jsxs("div", { children: ["\u4E0B\u55AE\u6642\u9593\uFF1A", new Date(order.createdAt).toLocaleString('zh-TW')] }), _jsxs("div", { children: ["\u670D\u52D9\u6642\u9593\uFF1A", order.preferredDate || '', " ", order.preferredTimeStart, "~", order.preferredTimeEnd] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["\u63A8\u85A6\u78BC\uFF1A", order.referrerCode || '-', " ", order.referrerCode && (_jsx("button", { className: "ml-2 underline", onClick: () => navigator.clipboard.writeText(order.referrerCode), children: "\u8907\u88FD" }))] }), _jsxs("div", { className: "text-xs text-gray-700", children: ["\u6703\u54E1\uFF1A", can(user, 'orders.update') ? (_jsxs("span", { className: "inline-flex items-center gap-2", children: [_jsx("input", { className: "rounded border px-2 py-1 text-sm", placeholder: "\u8F38\u5165 MOxxxx", value: memberCode, onChange: e => setMemberCode(e.target.value) }), _jsx("button", { className: "rounded bg-gray-900 px-2 py-1 text-white", onClick: async () => {
                                                    const code = (memberCode || '').trim().toUpperCase();
                                                    if (!code) {
                                                        await orderRepo.update(order.id, { memberId: undefined });
                                                        const o = await orderRepo.get(order.id);
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
                                                        await orderRepo.update(order.id, { memberId: m.id });
                                                        const o = await orderRepo.get(order.id);
                                                        setOrder(o);
                                                        alert('已綁定會員：' + (m.name || ''));
                                                    }
                                                    catch {
                                                        alert('綁定失敗');
                                                    }
                                                }, children: "\u5132\u5B58" }), memberCode && _jsx("button", { className: "rounded bg-gray-100 px-2 py-1", onClick: () => navigator.clipboard.writeText(memberCode), children: "\u8907\u88FDMO" })] })) : (_jsxs("span", { children: [memberCode || '—', memberName ? `（${memberName}）` : ''] }))] }), _jsxs("div", { className: "pt-2", children: [user?.role !== 'technician' && (_jsx(Link, { to: `/schedule?orderId=${order.id}&date=${order.preferredDate || ''}&start=${order.preferredTimeStart}&end=${order.preferredTimeEnd}`, className: "inline-block rounded-xl bg-brand-500 px-4 py-2 text-white", children: "\u6307\u6D3E\u6280\u5E2B" })), order.status === 'draft' && can(user, 'orders.update') && _jsx("button", { onClick: async () => { await orderRepo.confirm(order.id); const o = await orderRepo.get(order.id); setOrder(o); alert('已確認'); }, className: "ml-2 inline-block rounded-xl bg-blue-600 px-4 py-2 text-white", children: "\u78BA\u8A8D" })] }), Array.isArray(order.assignedTechnicians) && order.assignedTechnicians.length > 0 && (_jsxs("div", { className: "mt-2", children: [_jsx("div", { className: "font-semibold", children: "\u5DF2\u6307\u6D3E\u6280\u5E2B\uFF1A" }), _jsx("div", { className: "mt-1 flex flex-wrap gap-2", children: order.assignedTechnicians.map((n, i) => (_jsx("span", { className: "rounded-full bg-brand-100 px-2 py-1 text-xs text-brand-700", children: n }, i))) }), _jsxs("div", { className: "mt-2", children: [_jsx("label", { className: "text-sm text-gray-600", children: "\u7C3D\u540D\u6280\u5E2B" }), _jsxs("select", { className: "ml-2 rounded-lg border px-2 py-1 text-sm", value: order.signatureTechnician || '', onChange: async (e) => {
                                                    const val = e.target.value;
                                                    await orderRepo.update(order.id, { signatureTechnician: val });
                                                    const o = await orderRepo.get(order.id);
                                                    setOrder(o);
                                                }, children: [_jsx("option", { value: "", children: "\u8ACB\u9078\u64C7" }), order.assignedTechnicians.map((n, i) => (_jsx("option", { value: n, children: n }, i)))] }), _jsx("button", { onClick: () => setSignOpen(true), className: "ml-2 rounded bg-gray-900 px-3 py-1 text-white", children: "\u7C3D\u540D" })] })] })), _jsxs("div", { className: "mt-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "font-semibold", children: "\u9805\u76EE\u660E\u7D30\uFF1A" }), user?.role !== 'technician' && _jsx("button", { onClick: () => setEditItems(e => !e), className: "rounded bg-gray-100 px-2 py-1 text-xs", children: editItems ? '取消' : '編輯項目' })] }), !editItems ? (_jsxs(_Fragment, { children: [order.serviceItems?.map((it, i) => (_jsxs("div", { children: [it.name, " \u00D7 ", it.quantity, " ", _jsxs("span", { className: "float-right font-bold text-rose-500", children: ["$", it.unitPrice] })] }, i))), _jsxs("div", { className: "mt-1 text-xs text-gray-500", children: ["\u5408\u8A08\uFF1A", (order.serviceItems || []).reduce((s, it) => s + it.unitPrice * it.quantity, 0)] })] })) : (_jsxs("div", { className: "mt-2 space-y-2 text-sm", children: [itemsDraft.map((it, i) => (_jsxs("div", { className: "grid grid-cols-6 items-center gap-2", children: [_jsxs("select", { className: "col-span-2 rounded border px-2 py-1", value: it.productId || '', onChange: async (e) => { const val = e.target.value; const arr = [...itemsDraft]; if (val) {
                                                            const p = products.find((x) => x.id === val);
                                                            arr[i] = { ...arr[i], productId: val, name: p?.name || it.name, unitPrice: p?.unitPrice || it.unitPrice };
                                                        }
                                                        else {
                                                            arr[i] = { ...arr[i], productId: undefined };
                                                        } setItemsDraft(arr); }, children: [_jsx("option", { value: "", children: "\u81EA\u8A02" }), products.map((p) => (_jsxs("option", { value: p.id, children: [p.name, "\uFF08", p.unitPrice, "\uFF09"] }, p.id)))] }), _jsx("input", { className: "col-span-2 rounded border px-2 py-1", value: it.name, onChange: e => { const arr = [...itemsDraft]; arr[i] = { ...arr[i], name: e.target.value }; setItemsDraft(arr); } }), _jsx("input", { type: "number", className: "rounded border px-2 py-1", value: it.quantity, onChange: e => { const arr = [...itemsDraft]; arr[i] = { ...arr[i], quantity: Number(e.target.value) }; setItemsDraft(arr); } }), _jsx("input", { type: "number", className: "rounded border px-2 py-1", value: it.unitPrice, onChange: e => { const arr = [...itemsDraft]; arr[i] = { ...arr[i], unitPrice: Number(e.target.value) }; setItemsDraft(arr); } }), _jsx("button", { onClick: () => { const arr = [...itemsDraft]; arr.splice(i, 1); setItemsDraft(arr); }, className: "rounded bg-gray-100 px-2 py-1", children: "\u522A" })] }, i))), _jsx("div", { children: _jsx("button", { onClick: () => setItemsDraft([...itemsDraft, { name: '', quantity: 1, unitPrice: 0 }]), className: "rounded bg-gray-100 px-2 py-1", children: "\u65B0\u589E\u9805\u76EE" }) }), _jsx("div", { className: "text-right", children: _jsx("button", { onClick: async () => { await orderRepo.update(order.id, { serviceItems: itemsDraft }); const o = await orderRepo.get(order.id); setOrder(o); setEditItems(false); }, className: "rounded bg-brand-500 px-3 py-1 text-white", children: "\u5132\u5B58" }) })] }))] })] })] }), _jsx(SignatureModal, { open: signOpen, onClose: () => setSignOpen(false), onSave: async (dataUrl) => { await orderRepo.update(order.id, { signatures: { ...(order.signatures || {}), [order.signatureTechnician || 'technician']: dataUrl } }); const o = await orderRepo.get(order.id); setOrder(o); setSignOpen(false); } }), _jsxs("div", { className: "rounded-2xl bg-white p-4 shadow-card", children: [_jsx(SectionTitle, { children: "\u7167\u7247" }), _jsxs("div", { className: "mt-3", children: [_jsx(PhotoGrid, { urls: order.photos || [] }), _jsxs("div", { className: "mt-3 text-sm", children: [_jsx("label", { className: "mb-1 block", children: "\u4E0A\u50B3\u7167\u7247\uFF08\u6700\u591A 20 \u5F35\uFF0C\u2264200KB\uFF09" }), _jsx("input", { type: "file", accept: "image/*", multiple: true, onChange: async (e) => {
                                            const files = Array.from(e.target.files || []);
                                            const remain = Math.max(0, 20 - (order.photos?.length || 0));
                                            const take = files.slice(0, remain);
                                            const imgs = [];
                                            for (const f of take)
                                                imgs.push(await compressImageToDataUrl(f, 200));
                                            await orderRepo.update(order.id, { photos: [...(order.photos || []), ...imgs] });
                                            const o = await orderRepo.get(order.id);
                                            setOrder(o);
                                        } })] })] })] }), _jsxs("div", { className: "rounded-2xl bg-white p-4 shadow-card", children: [_jsx(SectionTitle, { children: "\u8A02\u55AE\u5DF2\u5B8C\u6210" }), _jsxs("div", { className: "mt-2", children: [_jsx(TimelineStep, { index: 1, title: "\u806F\u7D61\u5BA2\u6236", time: "2025/07/14 13:57:50" }), _jsx(TimelineStep, { index: 2, title: "\u78BA\u8A8D\u5831\u50F9", time: "2025/07/14 13:57:51" }), _jsx(TimelineStep, { index: 3, title: "\u78BA\u8A8D\u6D3E\u6848", time: "2025/07/14 13:58:33" }), _jsx(TimelineStep, { index: 4, title: "\u670D\u52D9\u5B8C\u6210", time: "2025/08/17 20:25:29" })] }), _jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx("button", { onClick: async () => { if (!confirm('開工前請再次告知公司承諾並取得同意。是否開始？'))
                                    return; await orderRepo.startWork(order.id, new Date().toISOString()); const o = await orderRepo.get(order.id); setOrder(o); }, className: "rounded bg-brand-500 px-3 py-1 text-white", children: "\u958B\u59CB\u5DE5\u4F5C" }), _jsx("button", { onClick: async () => { if (!confirm('是否確認服務完成？'))
                                    return; await orderRepo.finishWork(order.id, new Date().toISOString()); const o = await orderRepo.get(order.id); setOrder(o); }, className: "rounded bg-gray-900 px-3 py-1 text-white", children: "\u5B8C\u6210\u5DE5\u4F5C" })] })] })] }));
}
