import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
export default function SignatureModal({ open, onClose, onSave }) {
    const ref = useRef(null);
    useEffect(() => {
        if (!open)
            return;
        const cvs = ref.current;
        const ctx = cvs.getContext('2d');
        let drawing = false;
        const start = (e) => { drawing = true; const p = point(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
        const move = (e) => { if (!drawing)
            return; const p = point(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
        const end = () => { drawing = false; };
        const point = (e) => { const r = cvs.getBoundingClientRect(); const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left; const y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top; return { x, y }; };
        cvs.addEventListener('mousedown', start);
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', end);
        cvs.addEventListener('touchstart', start);
        window.addEventListener('touchmove', move);
        window.addEventListener('touchend', end);
        return () => { cvs.removeEventListener('mousedown', start); window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', end); cvs.removeEventListener('touchstart', start); window.removeEventListener('touchmove', move); window.removeEventListener('touchend', end); };
    }, [open]);
    if (!open)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/50 p-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl bg-white p-4", children: [_jsx("div", { className: "mb-2 text-lg font-semibold", children: "\u7C3D\u540D" }), _jsx("canvas", { ref: ref, width: 360, height: 240, className: "h-60 w-full rounded border" }), _jsxs("div", { className: "mt-3 flex justify-end gap-2", children: [_jsx("button", { onClick: onClose, className: "rounded bg-gray-100 px-3 py-1", children: "\u53D6\u6D88" }), _jsx("button", { onClick: () => { const dataUrl = ref.current.toDataURL('image/png'); onSave(dataUrl); }, className: "rounded bg-brand-500 px-3 py-1 text-white", children: "\u78BA\u5B9A" })] })] }) }));
}
