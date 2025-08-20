import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { reportsRepo } from '../../adapters/local/reports';
import { computeMonthlyPayroll } from '../../services/payroll';
export default function ReportsPage() {
    const [rows, setRows] = useState([]);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [payroll, setPayroll] = useState([]);
    const [q, setQ] = useState('');
    const [scheme, setScheme] = useState('');
    const [region, setRegion] = useState('');
    const [platform, setPlatform] = useState('');
    const [summary, setSummary] = useState({ revenue: 0, orders: 0 });
    const load = async () => setRows(await reportsRepo.list());
    useEffect(() => { load(); }, []);
    useEffect(() => { computeMonthlyPayroll(month).then(setPayroll); }, [month]);
    useEffect(() => {
        (async () => {
            const { orderRepo } = await import('../../adapters/local/orders');
            const list = await orderRepo.list();
            const done = list.filter((o) => o.status === 'completed' && (o.workCompletedAt || o.createdAt || '').slice(0, 7) === month);
            const revenue = done.reduce((s, o) => s + (o.serviceItems || []).reduce((ss, it) => ss + it.unitPrice * it.quantity, 0), 0);
            setSummary({ revenue, orders: done.length });
        })();
    }, [month]);
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsx("div", { className: "text-lg font-semibold", children: "\u5831\u8868 / \u56DE\u5831\u7BA1\u7406" }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("input", { type: "month", value: month, onChange: e => setMonth(e.target.value), className: "rounded border px-2 py-1 text-sm" }), _jsx("input", { placeholder: "\u641C\u5C0B\u59D3\u540D/\u7DE8\u78BC", value: q, onChange: e => setQ(e.target.value), className: "rounded border px-2 py-1 text-sm" }), _jsxs("select", { className: "rounded border px-2 py-1 text-sm", value: scheme, onChange: e => setScheme(e.target.value), children: [_jsx("option", { value: "", children: "\u5168\u90E8\u65B9\u6848" }), _jsx("option", { value: "pure70", children: "\u7D1470" }), _jsx("option", { value: "pure72", children: "\u7D1472" }), _jsx("option", { value: "pure73", children: "\u7D1473" }), _jsx("option", { value: "pure75", children: "\u7D1475" }), _jsx("option", { value: "pure80", children: "\u7D1480" }), _jsx("option", { value: "base1", children: "\u4FDD1" }), _jsx("option", { value: "base2", children: "\u4FDD2" }), _jsx("option", { value: "base3", children: "\u4FDD3" })] }), _jsxs("select", { className: "rounded border px-2 py-1 text-sm", value: region, onChange: e => setRegion(e.target.value), children: [_jsx("option", { value: "", children: "\u5168\u90E8\u5340\u57DF" }), _jsx("option", { value: "north", children: "\u5317" }), _jsx("option", { value: "central", children: "\u4E2D" }), _jsx("option", { value: "south", children: "\u5357" }), _jsx("option", { value: "all", children: "\u5168\u5340" })] }), _jsxs("select", { className: "rounded border px-2 py-1 text-sm", value: platform, onChange: e => setPlatform(e.target.value), children: [_jsx("option", { value: "", children: "\u5168\u90E8\u5E73\u53F0" }), _jsx("option", { value: "\u65E5", children: "\u65E5" }), _jsx("option", { value: "\u540C", children: "\u540C" }), _jsx("option", { value: "\u9EC3", children: "\u9EC3" }), _jsx("option", { value: "\u4ECA", children: "\u4ECA" })] })] })] }), _jsxs("div", { className: "rounded-2xl bg-white p-4 shadow-card", children: [_jsxs("div", { className: "mb-2 grid grid-cols-2 gap-3 text-sm text-gray-700", children: [_jsxs("div", { className: "rounded-lg bg-gray-50 p-2", children: ["\u672C\u6708\u5B8C\u6210\u8A02\u55AE\uFF1A", _jsx("span", { className: "font-semibold", children: summary.orders })] }), _jsxs("div", { className: "rounded-lg bg-gray-50 p-2", children: ["\u672C\u6708\u71DF\u6536\uFF1A", _jsx("span", { className: "font-semibold", children: summary.revenue })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-base font-semibold", children: "\u7576\u6708\u5206\u6F64\u6982\u89BD" }), _jsx("div", { className: "text-xs text-gray-500", children: "\u53EF\u81E8\u6642\u8ABF\u6574\u65B9\u6848\u5F8C\u91CD\u7B97" })] }), _jsxs("div", { className: "mt-3 space-y-2 text-sm", children: [payroll.filter((p) => {
                                const code = p.technician.code || '';
                                const hit = !q || p.technician.name.includes(q) || code.includes(q);
                                const byScheme = !scheme || p.scheme === scheme;
                                const byRegion = !region || (p.technician.region === region);
                                const byPlatform = !platform || ((p.orders || []).some((o) => o.platform === platform));
                                return hit && byScheme && byRegion && byPlatform;
                            }).map((p, idx) => (_jsxs("div", { className: "flex items-center justify-between gap-3 border-b pb-2", children: [_jsxs("div", { className: "min-w-0 flex-1 truncate", children: [p.technician.name, " ", _jsx("span", { className: "text-xs text-gray-500", children: p.technician.code || '' }), " ", p.technician.code && _jsx("button", { onClick: () => navigator.clipboard.writeText(p.technician.code), className: "ml-1 rounded bg-gray-100 px-2 py-0.5 text-[10px]", children: "\u8907\u88FD" })] }), _jsxs("select", { className: "rounded border px-2 py-1 text-xs", value: p.scheme, onChange: e => {
                                            const next = [...payroll];
                                            next[idx] = { ...p, scheme: e.target.value };
                                            setPayroll(next);
                                        }, children: [_jsx("option", { value: "pure70", children: "\u7D1470" }), _jsx("option", { value: "pure72", children: "\u7D1472" }), _jsx("option", { value: "pure73", children: "\u7D1473" }), _jsx("option", { value: "pure75", children: "\u7D1475" }), _jsx("option", { value: "pure80", children: "\u7D1480" }), _jsx("option", { value: "base1", children: "\u4FDD1" }), _jsx("option", { value: "base2", children: "\u4FDD2" }), _jsx("option", { value: "base3", children: "\u4FDD3" })] }), _jsxs("div", { className: "text-gray-700", children: ["\u5408\u8A08 ", p.total, "\uFF08\u5E95\u85AA ", p.baseSalary, "\uFF0B\u734E\u91D1 ", p.bonus, "\uFF09"] })] }, p.technician.id))), payroll.length === 0 && _jsx("div", { className: "text-gray-500", children: "\u5C1A\u7121\u8CC7\u6599" })] }), payroll.length > 0 && (_jsxs("div", { className: "mt-3 text-right", children: [_jsx("button", { onClick: () => {
                                    const header = ['名稱', '編碼', '區域', '方案', '個人額', '底薪', '獎金', '合計'];
                                    const lines = payroll.map((p) => [
                                        p.technician.name, p.technician.code || '', p.technician.region || '', p.scheme, p.perTechTotal, p.baseSalary, p.bonus, p.total
                                    ].join(','));
                                    const csv = [header.join(','), ...lines].join('\n');
                                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `payroll-${month}.csv`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }, className: "rounded-lg bg-gray-900 px-3 py-1 text-sm text-white", children: "\u532F\u51FA\u5206\u6F64 CSV" }), _jsx("button", { onClick: () => {
                                    // 簡易 xlsx：用 HTML table 下載 xls for Excel 開啟
                                    const header = ['名稱', '編碼', '區域', '方案', '個人額', '底薪', '獎金', '合計'];
                                    const rowsHtml = payroll.map((p) => `<tr><td>${p.technician.name}</td><td>${p.technician.code || ''}</td><td>${p.technician.region || ''}</td><td>${p.scheme}</td><td>${p.perTechTotal}</td><td>${p.baseSalary}</td><td>${p.bonus}</td><td>${p.total}</td></tr>`).join('');
                                    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table><thead><tr>${header.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
                                    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `payroll-${month}.xls`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }, className: "ml-2 rounded-lg bg-brand-600 px-3 py-1 text-sm text-white", children: "\u532F\u51FA Excel" }), _jsx("button", { onClick: async () => {
                                    const { orderRepo } = await import('../../adapters/local/orders');
                                    const orders = (await orderRepo.list()).filter((o) => o.status === 'completed' && (o.workCompletedAt || o.createdAt || '').slice(0, 7) === month);
                                    const header = ['ID', '平台', '客戶', '時間', '金額', '推薦碼'];
                                    const lines = orders.map((o) => {
                                        const amt = (o.serviceItems || []).reduce((s, it) => s + it.unitPrice * it.quantity, 0);
                                        return [o.id, o.platform || '', o.customerName, `${(o.preferredDate || '')} ${o.preferredTimeStart}~${o.preferredTimeEnd}`, amt, o.referrerCode || ''].join(',');
                                    });
                                    const csv = [header.join(','), ...lines].join('\n');
                                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `orders-${month}.csv`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }, className: "ml-2 rounded-lg bg-gray-700 px-3 py-1 text-sm text-white", children: "\u532F\u51FA\u5B8C\u6210\u8A02\u55AE" }), _jsx("button", { onClick: async () => {
                                    const { orderRepo } = await import('../../adapters/local/orders');
                                    const orders = (await orderRepo.list()).filter((o) => o.status === 'completed' && (o.workCompletedAt || o.createdAt || '').slice(0, 7) === month);
                                    const header = ['ID', '平台', '客戶', '時間', '金額', '推薦碼'];
                                    const rowsHtml = orders.map((o) => {
                                        const amt = (o.serviceItems || []).reduce((s, it) => s + it.unitPrice * it.quantity, 0);
                                        return `<tr><td>${o.id}</td><td>${o.platform || ''}</td><td>${o.customerName}</td><td>${(o.preferredDate || '')} ${o.preferredTimeStart}~${o.preferredTimeEnd}</td><td>${amt}</td><td>${o.referrerCode || ''}</td></tr>`;
                                    }).join('');
                                    const html = `<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head><body><table><thead><tr>${header.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
                                    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `orders-${month}.xls`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }, className: "ml-2 rounded-lg bg-brand-600 px-3 py-1 text-sm text-white", children: "\u5B8C\u6210\u8A02\u55AE Excel" }), _jsx("button", { onClick: async () => {
                                    const { memberRepo } = await import('../../adapters/local/members');
                                    const { staffRepo } = await import('../../adapters/local/staff');
                                    const { technicianRepo } = await import('../../adapters/local/technicians');
                                    const members = await memberRepo.list();
                                    const staffs = await staffRepo.list();
                                    const techs = await technicianRepo.list();
                                    const header = ['類型', '名稱', '編碼/Email', '積分'];
                                    const lines = [];
                                    lines.push(...members.map((m) => ['member', m.name, m.code, m.points || 0].join(',')));
                                    lines.push(...staffs.map((s) => ['staff', s.name, s.refCode || s.email, s.points || 0].join(',')));
                                    lines.push(...techs.map((t) => ['technician', t.name, t.code || t.email, t.points || 0].join(',')));
                                    const csv = [header.join(','), ...lines].join('\n');
                                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `points.csv`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }, className: "ml-2 rounded-lg bg-gray-700 px-3 py-1 text-sm text-white", children: "\u532F\u51FA\u7A4D\u5206" }), _jsx("button", { onClick: async () => {
                                    const { memberRepo } = await import('../../adapters/local/members');
                                    const { staffRepo } = await import('../../adapters/local/staff');
                                    const { technicianRepo } = await import('../../adapters/local/technicians');
                                    const members = await memberRepo.list();
                                    const staffs = await staffRepo.list();
                                    const techs = await technicianRepo.list();
                                    const header = ['類型', '名稱', '編碼/Email', '積分'];
                                    const rowsHtml = [
                                        ...members.map((m) => `<tr><td>member</td><td>${m.name}</td><td>${m.code}</td><td>${m.points || 0}</td></tr>`),
                                        ...staffs.map((s) => `<tr><td>staff</td><td>${s.name}</td><td>${s.refCode || s.email}</td><td>${s.points || 0}</td></tr>`),
                                        ...techs.map((t) => `<tr><td>technician</td><td>${t.name}</td><td>${t.code || t.email}</td><td>${t.points || 0}</td></tr>`)
                                    ].join('');
                                    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><table><thead><tr>${header.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
                                    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `points.xls`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }, className: "ml-2 rounded-lg bg-brand-600 px-3 py-1 text-sm text-white", children: "\u7A4D\u5206 Excel" })] }))] }), _jsx(ReportThreads, {})] }));
}
function ReportThreads() {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ subject: '', category: 'other', level: 'normal', target: 'all' });
    const [active, setActive] = useState(null);
    const [msg, setMsg] = useState('');
    const load = async () => setRows(await reportsRepo.list());
    useEffect(() => { load(); }, []);
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-lg font-semibold", children: "\u56DE\u5831\u7BA1\u7406" }), _jsx("button", { onClick: () => setOpen(true), className: "rounded-lg bg-brand-500 px-3 py-1 text-white", children: "\u65B0\u589E\u56DE\u5831" })] }), rows.map(t => (_jsx("div", { className: "rounded-xl border bg-white p-4 shadow-card", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: t.subject }), _jsxs("div", { className: "text-xs text-gray-500", children: [t.category, " \u00B7 ", t.level, " \u00B7 ", t.status] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setActive(t), className: "rounded-lg bg-gray-900 px-3 py-1 text-white", children: "\u67E5\u770B" }), t.status === 'open' && _jsx("button", { onClick: async () => { await reportsRepo.close(t.id); load(); }, className: "rounded-lg bg-rose-500 px-3 py-1 text-white", children: "\u7D50\u6848" }), _jsx("button", { onClick: async () => { const { confirmTwice } = await import('../kit'); if (!(await confirmTwice('刪除此回報？', '刪除後無法復原，仍要刪除？')))
                                        return; await reportsRepo.removeThread(t.id); load(); }, className: "rounded-lg bg-gray-100 px-3 py-1 text-gray-700", children: "\u522A\u9664" })] })] }) }, t.id))), rows.length === 0 && _jsx("div", { className: "text-gray-500", children: "\u76EE\u524D\u6C92\u6709\u56DE\u5831\u7D00\u9304" }), open && (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-4 shadow-card", children: [_jsx("div", { className: "mb-2 text-lg font-semibold", children: "\u65B0\u589E\u56DE\u5831" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsx("input", { className: "w-full rounded border px-2 py-1", placeholder: "\u4E3B\u65E8", value: form.subject, onChange: e => setForm({ ...form, subject: e.target.value }) }), _jsxs("select", { className: "w-full rounded border px-2 py-1", value: form.category, onChange: e => setForm({ ...form, category: e.target.value }), children: [_jsx("option", { value: "complaint", children: "\u5BA2\u8A34" }), _jsx("option", { value: "announce", children: "\u5E03\u9054" }), _jsx("option", { value: "reminder", children: "\u63D0\u9192" }), _jsx("option", { value: "other", children: "\u5176\u4ED6" })] }), _jsxs("select", { className: "w-full rounded border px-2 py-1", value: form.level, onChange: e => setForm({ ...form, level: e.target.value }), children: [_jsx("option", { value: "normal", children: "\u666E\u901A" }), _jsx("option", { value: "urgent", children: "\u6025\u4EF6" }), _jsx("option", { value: "critical", children: "\u7DCA\u6025" })] }), _jsxs("select", { className: "w-full rounded border px-2 py-1", value: form.target, onChange: e => setForm({ ...form, target: e.target.value }), children: [_jsx("option", { value: "all", children: "\u5168\u54E1" }), _jsx("option", { value: "tech", children: "\u6280\u5E2B" }), _jsx("option", { value: "support", children: "\u5BA2\u670D" }), _jsx("option", { value: "subset", children: "\u90E8\u5206\u540D\u55AE\uFF08Email\uFF09" })] }), form.target === 'subset' && (_jsx("textarea", { className: "w-full rounded border px-2 py-1", placeholder: "\u591A\u4F4D Email\uFF0C\u9017\u865F\u6216\u63DB\u884C\u5206\u9694", value: form.emails || '', onChange: e => setForm({ ...form, emails: e.target.value }) }))] }), _jsxs("div", { className: "mt-3 flex justify-end gap-2", children: [_jsx("button", { onClick: () => setOpen(false), className: "rounded-lg bg-gray-100 px-3 py-1", children: "\u53D6\u6D88" }), _jsx("button", { onClick: async () => { const payload = { ...form }; if (form.target === 'subset') {
                                        payload.target = 'subset';
                                        payload.targetEmails = form.emails?.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
                                    } await reportsRepo.create(payload); setOpen(false); setForm({ subject: '', category: 'other', level: 'normal', target: 'all' }); load(); }, className: "rounded-lg bg-brand-500 px-3 py-1 text-white", children: "\u5EFA\u7ACB" })] })] }) })), active && (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-4 shadow-card", children: [_jsx("div", { className: "mb-2 text-lg font-semibold", children: active.subject }), _jsxs("div", { className: "max-h-72 space-y-2 overflow-auto rounded-lg bg-gray-50 p-2 text-sm", children: [(active.messages || []).map((m) => (_jsxs("div", { className: "flex items-start justify-between rounded bg-white p-2 shadow", children: [_jsxs("div", { children: [_jsx("div", { className: "text-gray-700", children: m.body }), _jsx("div", { className: "text-xs text-gray-400", children: new Date(m.createdAt).toLocaleString('zh-TW') })] }), _jsx("button", { onClick: async () => { const { confirmTwice } = await import('../kit'); if (!(await confirmTwice('刪除此訊息？', '刪除後無法復原，仍要刪除？')))
                                                return; await reportsRepo.removeMessage(active.id, m.id); const t = await reportsRepo.get(active.id); setActive(t); }, className: "ml-2 rounded bg-gray-100 px-2 py-1 text-xs", children: "\u522A" })] }, m.id))), (active.status === 'closed') && _jsx("div", { className: "text-center text-xs text-gray-500", children: "\u5DF2\u7D50\u6848" })] }), active.status === 'open' && (_jsxs("div", { className: "mt-2 flex gap-2", children: [_jsx("input", { className: "flex-1 rounded border px-2 py-1 text-sm", placeholder: "\u8F38\u5165\u8A0A\u606F", value: msg, onChange: e => setMsg(e.target.value) }), _jsx("button", { onClick: async () => { if (!msg.trim())
                                        return; await reportsRepo.appendMessage(active.id, { authorEmail: 'system@local', body: msg }); setMsg(''); const t = await reportsRepo.get(active.id); setActive(t); }, className: "rounded bg-gray-900 px-3 py-1 text-sm text-white", children: "\u9001\u51FA" })] })), _jsx("div", { className: "mt-3 text-right", children: _jsx("button", { onClick: () => setActive(null), className: "rounded bg-gray-100 px-3 py-1", children: "\u95DC\u9589" }) })] }) }))] }));
}
