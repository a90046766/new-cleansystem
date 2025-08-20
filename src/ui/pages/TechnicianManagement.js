import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { technicianRepo } from '../../adapters/local/technicians';
import { authRepo } from '../../adapters/local/auth';
import { Navigate } from 'react-router-dom';
export default function TechnicianManagementPage() {
    const user = authRepo.getCurrentUser();
    if (user && user.role === 'technician')
        return _jsx(Navigate, { to: "/dispatch", replace: true });
    const [rows, setRows] = useState([]);
    const [edit, setEdit] = useState(null);
    const load = async () => setRows(await technicianRepo.list());
    useEffect(() => { load(); }, []);
    return (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "text-lg font-semibold", children: "\u6280\u5E2B\u7BA1\u7406" }), rows.map(t => (_jsx("div", { className: "rounded-xl border p-4 shadow-card", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "font-semibold", children: [t.name, " ", _jsx("span", { className: "text-xs text-gray-500", children: t.code })] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["email ", t.email, "\uFF5C\u5340\u57DF ", t.region, "\uFF5C\u65B9\u6848 ", t.revenueShareScheme || '-'] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => { navigator.clipboard.writeText(t.code); }, className: "rounded-lg bg-gray-100 px-3 py-1 text-sm", children: "\u8907\u88FD\u7DE8\u865F" }), _jsx("button", { onClick: () => setEdit(t), className: "rounded-lg bg-gray-900 px-3 py-1 text-white", children: "\u7DE8\u8F2F" }), _jsx("button", { onClick: async () => { const { confirmTwice } = await import('../kit'); if (await confirmTwice('確認刪除此技師？', '刪除後無法復原，仍要刪除？')) {
                                        await (await import('../../adapters/local/technicians')).technicianRepo.remove(t.id);
                                        load();
                                    } }, className: "rounded-lg bg-rose-500 px-3 py-1 text-white", children: "\u522A\u9664" })] })] }) }, t.id))), edit && (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-4 shadow-card", children: [_jsx("div", { className: "mb-2 text-lg font-semibold", children: "\u7DE8\u8F2F\u6280\u5E2B" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { children: ["\u59D3\u540D\uFF1A", _jsx("input", { className: "w-full rounded border px-2 py-1", value: edit.name, onChange: e => setEdit({ ...edit, name: e.target.value }) })] }), _jsxs("div", { children: ["\u65B9\u6848\uFF1A", _jsxs("select", { className: "w-full rounded border px-2 py-1", value: edit.revenueShareScheme || '', onChange: e => setEdit({ ...edit, revenueShareScheme: e.target.value }), children: [_jsx("option", { value: "", children: "\u672A\u6307\u5B9A" }), _jsx("option", { value: "pure70", children: "\u7D1470" }), _jsx("option", { value: "pure72", children: "\u7D1472" }), _jsx("option", { value: "pure73", children: "\u7D1473" }), _jsx("option", { value: "pure75", children: "\u7D1475" }), _jsx("option", { value: "pure80", children: "\u7D1480" }), _jsx("option", { value: "base1", children: "\u4FDD1\uFF0840k+10%\uFF09" }), _jsx("option", { value: "base2", children: "\u4FDD2\uFF0840k+20%\uFF09" }), _jsx("option", { value: "base3", children: "\u4FDD3\uFF0840k+30%\uFF09" })] })] })] }), _jsxs("div", { className: "mt-2 text-sm", children: [_jsx("div", { className: "mb-1 font-semibold", children: "\u6280\u80FD\u77E9\u9663" }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: [
                                        ['acStandard', '分離式冷氣'],
                                        ['washerStandard', '直立洗衣機'],
                                        ['acSpecial', '特殊分離式'],
                                        ['hoodStandard', '一般抽油煙機'],
                                        ['hoodHidden', '隱藏抽油煙機'],
                                        ['stainlessTank', '不鏽鋼水塔'],
                                        ['concreteTank', '水泥水塔'],
                                        ['concealedAC', '吊隱式冷氣'],
                                        ['concealedACSpecial', '吊隱特殊'],
                                        ['pipe', '管路施工'],
                                        ['washerDrum', '滾筒洗衣機'],
                                    ].map(([key, label]) => (_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: !!(edit.skills?.[key]), onChange: e => { const skills = { ...(edit.skills || {}) }; skills[key] = e.target.checked; setEdit({ ...edit, skills }); } }), _jsx("span", { children: label })] }, key))) })] }), _jsxs("div", { className: "mt-3 flex justify-end gap-2", children: [_jsx("button", { onClick: () => setEdit(null), className: "rounded-lg bg-gray-100 px-3 py-1", children: "\u53D6\u6D88" }), _jsx("button", { onClick: async () => { await technicianRepo.upsert(edit); setEdit(null); load(); }, className: "rounded-lg bg-brand-500 px-3 py-1 text-white", children: "\u5132\u5B58" })] })] }) }))] }));
}
