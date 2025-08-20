import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { staffApplicationRepo } from '../../adapters/local/staff';
export default function StaffApplyPage() {
    const [form, setForm] = useState({ name: '', shortName: '', email: '', phone: '', role: 'support' });
    const [ok, setOk] = useState(false);
    const [err, setErr] = useState('');
    const submit = async (e) => {
        e.preventDefault();
        setErr('');
        try {
            await staffApplicationRepo.submit({ name: form.name, shortName: form.shortName || undefined, email: form.email, phone: form.phone || undefined, role: form.role });
            setOk(true);
        }
        catch (e) {
            setErr(e?.message || '送出失敗');
        }
    };
    if (ok)
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-[#F5F7FB] p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-card", children: [_jsx("div", { className: "text-5xl", children: "\u2705" }), _jsx("div", { className: "mt-3 text-lg font-semibold", children: "\u5DF2\u9001\u51FA\u7533\u8ACB" }), _jsx("div", { className: "text-gray-600", children: "\u5F85\u7BA1\u7406\u54E1\u5BE9\u6838" })] }) }));
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-[#F5F7FB] p-4", children: _jsxs("form", { onSubmit: submit, className: "w-full max-w-md rounded-2xl bg-white p-6 shadow-card", children: [_jsx("div", { className: "mb-4 text-center text-xl font-bold", children: "\u54E1\u5DE5\u7533\u8ACB" }), err && _jsx("div", { className: "mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700", children: err }), _jsxs("div", { className: "space-y-3", children: [_jsx("input", { className: "w-full rounded-xl border px-4 py-3", placeholder: "\u59D3\u540D", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), required: true }), _jsx("input", { className: "w-full rounded-xl border px-4 py-3", placeholder: "\u7C21\u7A31\uFF08\u9078\u586B\uFF09", value: form.shortName, onChange: e => setForm({ ...form, shortName: e.target.value }) }), _jsx("input", { className: "w-full rounded-xl border px-4 py-3", placeholder: "Email", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }), required: true }), _jsx("input", { className: "w-full rounded-xl border px-4 py-3", placeholder: "\u624B\u6A5F\uFF08\u9078\u586B\uFF09", value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }) }), _jsxs("select", { className: "w-full rounded-xl border px-4 py-3", value: form.role, onChange: e => setForm({ ...form, role: e.target.value }), children: [_jsx("option", { value: "support", children: "\u5BA2\u670D" }), _jsx("option", { value: "sales", children: "\u696D\u52D9" })] }), _jsx("button", { className: "w-full rounded-xl bg-brand-500 py-3 text-white", children: "\u9001\u51FA" })] })] }) }));
}
