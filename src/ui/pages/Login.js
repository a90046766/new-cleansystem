import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authRepo } from '../../adapters/local/auth';
export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        // 檢查是否有記住的帳號
        const remembered = authRepo.getRememberedEmail();
        if (remembered) {
            setEmail(remembered);
            setRemember(true);
        }
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password)
            return;
        setLoading(true);
        setError('');
        try {
            const u = await authRepo.login(email, password);
            // 處理記住帳號
            if (remember) {
                authRepo.rememberEmail(email);
            }
            else {
                authRepo.forgetEmail();
            }
            if (!u.passwordSet)
                navigate('/reset-password');
            else
                navigate('/dispatch');
        }
        catch (err) {
            setError(err.message || '登入失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const handleChangeAccount = () => {
        setRemember(false);
        setEmail('');
        authRepo.forgetEmail();
    };
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-[#F5F7FB] p-4", children: _jsxs("form", { onSubmit: handleSubmit, className: "w-full max-w-sm rounded-2xl bg-white p-6 shadow-card", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "\u6D17\u6FEF\u6D3E\u5DE5\u7CFB\u7D71" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "\u672C\u6A5F\u91CD\u69CB\u7248" })] }), error && (_jsx("div", { className: "mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700", children: error })), _jsxs("div", { className: "space-y-4", children: [remember && email ? (_jsxs("div", { className: "rounded-xl bg-brand-50 p-3", children: [_jsxs("div", { className: "text-sm text-gray-700", children: ["\u5DF2\u8A18\u4F4F\u5E33\u865F\uFF1A", _jsx("span", { className: "font-medium", children: email })] }), _jsx("button", { type: "button", onClick: handleChangeAccount, className: "mt-1 text-sm text-brand-600 underline", children: "\u66F4\u63DB\u5E33\u865F" })] })) : (_jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-gray-700", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200", placeholder: "\u8ACB\u8F38\u5165 Email", required: true })] })), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-gray-700", children: "\u5BC6\u78BC" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200", placeholder: "\u8ACB\u8F38\u5165\u5BC6\u78BC", required: true })] }), !remember && (_jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "remember", checked: remember, onChange: (e) => setRemember(e.target.checked), className: "h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" }), _jsx("label", { htmlFor: "remember", className: "ml-2 text-sm text-gray-700", children: "\u8A18\u4F4F\u5E33\u865F" })] }))] }), _jsx("button", { type: "submit", disabled: loading || !email || !password, className: "mt-6 w-full rounded-xl bg-brand-500 py-3 font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50", children: loading ? '登入中...' : '登入' }), _jsx("div", { className: "mt-4 text-center text-sm text-gray-500", children: "\u6E2C\u8A66\u5E33\u865F\uFF1Aa90046766@gmail.com / a123123" })] }) }));
}
