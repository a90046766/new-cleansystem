import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function getDaysInMonth(year, monthIndex) {
    const first = new Date(Date.UTC(year, monthIndex, 1));
    const days = [];
    const current = new Date(first);
    while (current.getUTCMonth() === monthIndex) {
        days.push(new Date(current));
        current.setUTCDate(current.getUTCDate() + 1);
    }
    return days;
}
function formatDate(d) {
    return d.toISOString().slice(0, 10);
}
export default function Calendar({ value, onChange, header, markers, onMonthChange, emphasis, tooltips }) {
    const selected = new Date(value || new Date().toISOString());
    const year = selected.getUTCFullYear();
    const month = selected.getUTCMonth();
    const firstDay = new Date(Date.UTC(year, month, 1));
    const days = getDaysInMonth(year, month);
    const startWeekday = firstDay.getUTCDay(); // 0 Sun ... 6 Sat
    const leadingEmpty = (startWeekday + 6) % 7; // Monday-first grid
    const monthLabel = `${year}-${String(month + 1).padStart(2, '0')}`;
    const go = (delta) => {
        const d = new Date(Date.UTC(year, month + delta, 1));
        onChange(formatDate(d));
        if (onMonthChange)
            onMonthChange(d.getUTCFullYear(), d.getUTCMonth());
    };
    return (_jsxs("div", { className: "rounded-2xl bg-white p-3 shadow-card", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between", children: [_jsx("button", { onClick: () => go(-1), className: "rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100", children: "\u2039" }), _jsxs("div", { className: "text-sm font-semibold", children: [header || '', " ", monthLabel] }), _jsx("button", { onClick: () => go(1), className: "rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100", children: "\u203A" })] }), _jsxs("div", { className: "grid grid-cols-7 gap-1 text-center text-xs text-gray-500", children: [_jsx("div", { children: "\u4E00" }), _jsx("div", { children: "\u4E8C" }), _jsx("div", { children: "\u4E09" }), _jsx("div", { children: "\u56DB" }), _jsx("div", { children: "\u4E94" }), _jsx("div", { children: "\u516D" }), _jsx("div", { children: "\u65E5" })] }), _jsxs("div", { className: "mt-1 grid grid-cols-7 gap-1", children: [Array.from({ length: leadingEmpty }).map((_, i) => (_jsx("div", { className: "h-8" }, `e-${i}`))), days.map((d) => {
                        const ds = formatDate(d);
                        const active = ds === value;
                        const count = markers?.[ds] || 0;
                        const badge = count > 0;
                        const emph = emphasis?.[ds];
                        const emphRing = emph === 'danger' ? 'ring-2 ring-red-400' : emph === 'warn' ? 'ring-2 ring-amber-300' : '';
                        return (_jsxs("button", { onClick: () => onChange(ds), title: tooltips?.[ds] || (badge ? `當日占用 ${count}` : ''), className: `relative h-8 rounded-md text-sm ${active ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${badge && !active ? 'ring-1 ring-brand-300' : ''} ${!active ? emphRing : ''}`, children: [String(d.getUTCDate()), badge ? (_jsx("span", { className: `absolute -right-1 -top-1 rounded-full px-1 text-[10px] ${active ? 'bg-white text-brand-600' : 'bg-brand-500 text-white'}`, children: count > 9 ? '9+' : count })) : null] }, ds));
                    })] })] }));
}
