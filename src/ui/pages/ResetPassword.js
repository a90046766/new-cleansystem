import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { authRepo } from '../../adapters/local/auth';
import { useNavigate } from 'react-router-dom';
export default function ResetPasswordPage() {
    const [pwd, setPwd] = useState('');
    const navigate = useNavigate();
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-[#F5F7FB] p-4", children: _jsxs("div", { className: "w-full max-w-sm rounded-2xl bg-white p-6 shadow-card", children: [_jsx("div", { className: "mb-4 text-center text-xl font-bold", children: "\u9996\u6B21\u767B\u5165\uFF0C\u8ACB\u8A2D\u5B9A\u65B0\u5BC6\u78BC" }), _jsx("input", { className: "w-full rounded-xl border px-4 py-3", type: "password", placeholder: "\u65B0\u5BC6\u78BC", value: pwd, onChange: e => setPwd(e.target.value) }), _jsx("button", { onClick: async () => { await authRepo.resetPassword(pwd); alert('已更新'); navigate('/dispatch'); }, disabled: !pwd, className: "mt-3 w-full rounded-xl bg-brand-500 py-3 text-white disabled:opacity-50", children: "\u5132\u5B58" })] }) }));
}
