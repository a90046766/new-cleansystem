import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../kit';
export default function PageDispatchHome() {
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold", children: "\u7D50\u55AE\u5C08\u5340" }), _jsx("div", { className: "mt-3 grid grid-cols-1 gap-3", children: _jsx(MetricCard, { title: "\u5F85\u7D50\u6848", value: 2 }) })] }), _jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold", children: "\u8A02\u55AE\u5C08\u5340" }), _jsxs("div", { className: "mt-3 grid grid-cols-1 gap-3", children: [_jsx(MetricCard, { title: "\u5F85\u670D\u52D9", value: 22 }), _jsx(MetricCard, { title: "\u5DF2\u5B8C\u6210", value: 295 }), _jsx(MetricCard, { title: "\u6240\u6709\u6D3E\u5DE5", value: '›' })] })] })] }));
}
