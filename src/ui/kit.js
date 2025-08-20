import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function SectionTitle({ children }) {
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("i", { className: "h-5 w-1.5 rounded bg-brand-500" }), _jsx("h2", { className: "text-base font-semibold", children: children })] }));
}
export function StatusChip({ kind, text }) {
    const map = { done: 'bg-green-100 text-green-700', paid: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-100 text-amber-700' };
    return _jsx("span", { className: `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${map[kind]}`, children: text });
}
export function MetricCard({ title, icon, value }) {
    return (_jsxs("div", { className: "flex w-full items-center justify-between rounded-2xl bg-white p-4 shadow-card", children: [_jsxs("div", { children: [_jsx("div", { className: "text-gray-500", children: title }), _jsx("div", { className: "mt-1 text-4xl font-extrabold tracking-tight tabular-nums", children: value })] }), icon && _jsx("div", { className: "text-brand-500", children: icon })] }));
}
export function TimelineStep({ index, title, time }) {
    return (_jsxs("div", { className: "flex items-center justify-between border-b py-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-600", children: index }), _jsx("div", { className: "text-base font-semibold", children: title })] }), _jsx("div", { className: "text-brand-600", children: time })] }));
}
export function ListCell({ title, subtitle, right }) {
    return (_jsxs("div", { className: "flex items-center justify-between border-b py-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-base font-semibold", children: title }), subtitle && _jsx("div", { className: "text-sm text-gray-500", children: subtitle })] }), right || _jsx("div", { className: "text-gray-400", children: "\u203A" })] }));
}
export function PhotoGrid({ urls }) {
    return (_jsx("div", { className: "grid grid-cols-3 gap-2", children: urls.map((u, i) => (_jsx("div", { className: "aspect-square overflow-hidden rounded-xl bg-gray-100", children: _jsx("img", { src: u, className: "h-full w-full object-cover" }) }, i))) }));
}
export async function confirmTwice(message, second) {
    if (!confirm(message))
        return false;
    return confirm(second || '再確認一次，是否確定？');
}
