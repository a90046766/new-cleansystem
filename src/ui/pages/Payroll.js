import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { authRepo } from '../../adapters/local/auth';
import { computeMonthlyPayroll, getPayoutDates } from '../../services/payroll';
export default function PayrollPage() {
    const [rows, setRows] = useState([]);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const user = authRepo.getCurrentUser();
    useEffect(() => {
        computeMonthlyPayroll(month).then(rs => {
            // 權限：客服僅看自己；管理員可看全部
            if (user?.role === 'support') {
                const email = (user.email || '').toLowerCase();
                setRows(rs.filter((r) => ((r.technician?.email || '').toLowerCase() === email)));
            }
            else {
                setRows(rs);
            }
        });
    }, [month]);
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-lg font-semibold", children: "\u85AA\u8CC7\u7BA1\u7406" }), _jsx("input", { type: "month", value: month, onChange: e => setMonth(e.target.value), className: "rounded border px-2 py-1 text-sm" })] }), user?.role === 'admin' && (_jsxs("div", { className: "rounded-2xl bg-white p-4 shadow-card", children: [_jsx("div", { className: "mb-2 text-sm font-semibold", children: "\u4EBA\u5DE5\u767B\u9304/\u8ABF\u6574" }), _jsx(AdminManualPayroll, { month: month, onSaved: () => computeMonthlyPayroll(month).then(setRows) })] })), rows.map((r) => {
                const { salaryDate, bonusDate } = getPayoutDates(month);
                return (_jsx("div", { className: "rounded-xl border bg-white p-4 shadow-card", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "font-semibold", children: [r.technician.name, " ", _jsx("span", { className: "text-xs text-gray-500", children: r.technician.code || '' })] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["\u65B9\u6848\uFF1A", r.scheme, "\uFF5C\u7576\u6708\u670D\u52D9\u91D1\u984D\uFF08\u500B\u4EBA\uFF09\uFF1A", r.perTechTotal] })] }), _jsxs("div", { className: "text-right text-sm text-gray-700", children: [_jsxs("div", { children: ["\u5E95\u85AA\uFF1A", r.baseSalary] }), _jsxs("div", { children: ["\u734E\u91D1\uFF1A", r.bonus] }), _jsxs("div", { className: "font-semibold", children: ["\u5408\u8A08\uFF1A", r.total] }), _jsxs("div", { className: "text-xs text-gray-500", children: ["\u85AA\u8CC7\u767C\u653E\uFF1A", salaryDate, "\uFF1B\u734E\u91D1\u767C\u653E\uFF1A", bonusDate] })] })] }) }, r.technician.id));
            }), rows.length === 0 && _jsx("div", { className: "text-gray-500", children: "\u5C1A\u7121\u8CC7\u6599" })] }));
}
function AdminManualPayroll({ month, onSaved }) {
    const [email, setEmail] = useState('');
    const [base, setBase] = useState(0);
    const [bonus, setBonus] = useState(0);
    return (_jsxs("div", { className: "flex flex-wrap items-end gap-2 text-sm", children: [_jsx("input", { className: "w-48 rounded border px-2 py-1", placeholder: "\u6280\u5E2B Email", value: email, onChange: e => setEmail(e.target.value) }), _jsx("input", { type: "number", className: "w-28 rounded border px-2 py-1", placeholder: "\u5E95\u85AA", value: base, onChange: e => setBase(Number(e.target.value)) }), _jsx("input", { type: "number", className: "w-28 rounded border px-2 py-1", placeholder: "\u734E\u91D1", value: bonus, onChange: e => setBonus(Number(e.target.value)) }), _jsx("button", { onClick: async () => { if (!email)
                    return; const { payrollRepo } = await import('../../adapters/local/payroll'); await payrollRepo.upsert({ userEmail: email, month, baseSalary: base, bonus, total: base + bonus }); onSaved(); }, className: "rounded bg-gray-900 px-3 py-1 text-white", children: "\u5132\u5B58" })] }));
}
