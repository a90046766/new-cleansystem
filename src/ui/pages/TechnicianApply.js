import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { technicianApplicationRepo } from '../../adapters/local/technicians';
export default function TechnicianApplyPage() {
    const [form, setForm] = useState({
        name: '',
        shortName: '',
        email: '',
        phone: '',
        region: 'north'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.phone)
            return;
        setLoading(true);
        setError('');
        try {
            await technicianApplicationRepo.submit({
                name: form.name,
                shortName: form.shortName || form.name,
                email: form.email,
                phone: form.phone,
                region: form.region
            });
            setSuccess(true);
        }
        catch (err) {
            setError(err.message || '申請失敗');
        }
        finally {
            setLoading(false);
        }
    };
    if (success) {
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-[#F5F7FB] p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-6 shadow-card text-center", children: [_jsx("div", { className: "text-6xl", children: "\u2705" }), _jsx("h1", { className: "mt-4 text-xl font-bold text-gray-900", children: "\u7533\u8ACB\u5DF2\u9001\u51FA" }), _jsx("p", { className: "mt-2 text-gray-600", children: "\u60A8\u7684\u6280\u5E2B\u7533\u8ACB\u5DF2\u6210\u529F\u9001\u51FA\uFF0C\u8ACB\u7B49\u5F85\u7BA1\u7406\u54E1\u5BE9\u6838\u3002" }), _jsx("button", { onClick: () => navigate('/login'), className: "mt-6 w-full rounded-xl bg-brand-500 py-3 text-white hover:bg-brand-600", children: "\u8FD4\u56DE\u767B\u5165" })] }) }));
    }
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-[#F5F7FB] p-4", children: _jsxs("form", { onSubmit: handleSubmit, className: "w-full max-w-md rounded-2xl bg-white p-6 shadow-card", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "\u6280\u5E2B\u7533\u8ACB" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "\u8ACB\u586B\u5BEB\u60A8\u7684\u57FA\u672C\u8CC7\u6599" })] }), error && (_jsx("div", { className: "mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700", children: error })), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-gray-700", children: "\u59D3\u540D *" }), _jsx("input", { type: "text", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), className: "w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200", placeholder: "\u8ACB\u8F38\u5165\u771F\u5BE6\u59D3\u540D", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-gray-700", children: "\u66B1\u7A31" }), _jsx("input", { type: "text", value: form.shortName, onChange: (e) => setForm({ ...form, shortName: e.target.value }), className: "w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200", placeholder: "\u5BA2\u6236\u770B\u5230\u7684\u7A31\u547C\uFF08\u9078\u586B\uFF09" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-gray-700", children: "Email *" }), _jsx("input", { type: "email", value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }), className: "w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200", placeholder: "\u8ACB\u8F38\u5165 Email", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-gray-700", children: "\u624B\u6A5F *" }), _jsx("input", { type: "tel", value: form.phone, onChange: (e) => setForm({ ...form, phone: e.target.value }), className: "w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200", placeholder: "\u8ACB\u8F38\u5165\u624B\u6A5F\u865F\u78BC", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-sm font-medium text-gray-700", children: "\u670D\u52D9\u5340\u57DF" }), _jsxs("select", { value: form.region, onChange: (e) => setForm({ ...form, region: e.target.value }), className: "w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200", children: [_jsx("option", { value: "north", children: "\u5317\u5340" }), _jsx("option", { value: "central", children: "\u4E2D\u5340" }), _jsx("option", { value: "south", children: "\u5357\u5340" }), _jsx("option", { value: "all", children: "\u5168\u5340" })] })] })] }), _jsx("button", { type: "submit", disabled: loading || !form.name || !form.email || !form.phone, className: "mt-6 w-full rounded-xl bg-brand-500 py-3 font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50", children: loading ? '送出中...' : '送出申請' }), _jsx("div", { className: "mt-4 text-center", children: _jsx("button", { type: "button", onClick: () => navigate('/login'), className: "text-sm text-gray-500 underline", children: "\u8FD4\u56DE\u767B\u5165" }) })] }) }));
}
