import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { memberRepo } from '../../adapters/local/members';
export default function MemberRegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', refCode: '' });
    const [ok, setOk] = useState(null);
    const [err, setErr] = useState('');
    const onSubmit = async (e) => {
        e.preventDefault();
        setErr('');
        try {
            const created = await memberRepo.create({ name: form.name, email: form.email || undefined, phone: form.phone || undefined, referrerCode: form.refCode || undefined });
            setOk({ code: created.code });
        }
        catch (e) {
            setErr(e?.message || '註冊失敗');
        }
    };
    if (ok)
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-[#F5F7FB] p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-6 shadow-card text-center", children: [_jsx("div", { className: "text-5xl", children: "\uD83C\uDF89" }), _jsx("div", { className: "mt-3 text-lg font-semibold", children: "\u8A3B\u518A\u6210\u529F" }), _jsxs("div", { className: "mt-2 text-gray-600", children: ["\u60A8\u7684\u6703\u54E1\u7DE8\u865F\uFF1A", _jsx("span", { className: "font-bold", children: ok.code })] })] }) }));
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-[#F5F7FB] p-4", children: _jsxs("form", { onSubmit: onSubmit, className: "w-full max-w-md rounded-2xl bg-white p-6 shadow-card", children: [_jsx("div", { className: "mb-4 text-center text-xl font-bold", children: "\u6703\u54E1\u8A3B\u518A" }), err && _jsx("div", { className: "mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700", children: err }), _jsxs("div", { className: "space-y-3", children: [_jsx("input", { className: "w-full rounded-xl border px-4 py-3", placeholder: "\u59D3\u540D", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), required: true }), _jsx("input", { className: "w-full rounded-xl border px-4 py-3", placeholder: "Email\uFF08\u9078\u586B\uFF09", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }) }), _jsx("input", { className: "w-full rounded-xl border px-4 py-3", placeholder: "\u624B\u6A5F\uFF08\u9078\u586B\uFF09", value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }) }), _jsx("input", { className: "w-full rounded-xl border px-4 py-3", placeholder: "\u4ECB\u7D39\u4EBA\uFF08MOxxxx / SRxxx / SExxx\uFF09", value: form.refCode, onChange: e => setForm({ ...form, refCode: e.target.value }) }), _jsx("button", { className: "w-full rounded-xl bg-brand-500 py-3 text-white", children: "\u9001\u51FA" })] })] }) }));
}
