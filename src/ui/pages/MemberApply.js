import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { memberApplicationRepo } from '../../adapters/local/members';
export default function MemberApplyPage() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', referrerCode: '' });
    const [ok, setOk] = useState(false);
    const [err, setErr] = useState('');
    const submit = async (e) => {
        e.preventDefault();
        setErr('');
        try {
            await memberApplicationRepo.submit({ name: form.name, email: form.email || undefined, phone: form.phone || undefined, referrerCode: form.referrerCode || undefined });
            setOk(true);
        }
        catch (e) {
            setErr(e?.message || '送出失敗');
        }
    };
    if (ok)
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-[#F5F7FB] p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-card", children: [_jsx("div", { className: "text-5xl", children: "\u2705" }), _jsx("div", { className: "mt-3 text-lg font-semibold", children: "\u5DF2\u9001\u51FA\u7533\u8ACB" }), _jsx("div", { className: "text-gray-600", children: "\u5F85\u5BA2\u670D\u5BE9\u6838\u5F8C\u5EFA\u7ACB\u6703\u54E1\u7DE8\u865F" })] }) }));
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-[#F5F7FB] p-4", children: _jsxs("form", { onSubmit: submit, className: "w-full max-w-md rounded-2xl bg-white p-6 shadow-card", children: [_jsx("div", { className: "mb-4 text-center text-xl font-bold", children: "\u6703\u54E1\u7533\u8ACB" }), err && _jsx("div", { className: "mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700", children: err }), _jsxs("div", { className: "space-y-3", children: [_jsx("input", { className: "w-full rounded-xl border px-4 py-3", placeholder: "\u59D3\u540D", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), required: true }), _jsx("input", { className: "w-full rounded-xl border px-4 py-3", placeholder: "Email\uFF08\u9078\u586B\uFF09", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }) }), _jsx("input", { className: "w-full rounded-xl border px-4 py-3", placeholder: "\u624B\u6A5F\uFF08\u9078\u586B\uFF09", value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }) }), _jsx("input", { className: "w-full rounded-xl border px-4 py-3", placeholder: "\u4ECB\u7D39\u78BC\uFF08MO/SR/SE\uFF09", value: form.referrerCode, onChange: e => setForm({ ...form, referrerCode: e.target.value }) }), _jsx("button", { className: "w-full rounded-xl bg-brand-500 py-3 text-white", children: "\u9001\u51FA" })] })] }) }));
}
