import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { scheduleRepo } from '../../adapters/local/schedule';
import { technicianRepo } from '../../adapters/local/technicians';
import { Link, useSearchParams } from 'react-router-dom';
import { orderRepo } from '../../adapters/local/orders';
import { authRepo } from '../../adapters/local/auth';
import Calendar from '../components/Calendar';
import { overlaps } from '../../utils/time';
export default function TechnicianSchedulePage() {
    const [leaves, setLeaves] = useState([]);
    const [techs, setTechs] = useState([]);
    const [selected, setSelected] = useState({});
    const [works, setWorks] = useState([]);
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId') || '';
    const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);
    const start = searchParams.get('start') || '09:00';
    const end = searchParams.get('end') || '12:00';
    const user = authRepo.getCurrentUser();
    const [view, setView] = useState('month');
    const [supportOpen, setSupportOpen] = useState(false);
    const [supportDate, setSupportDate] = useState(date);
    const [supportSlot, setSupportSlot] = useState('am');
    const [supportType, setSupportType] = useState('排休');
    const [supportShifts, setSupportShifts] = useState([]);
    const [workMarkers, setWorkMarkers] = useState({});
    const [emphasisMarkers, setEmphasisMarkers] = useState({});
    const [dayTooltips, setDayTooltips] = useState({});
    const [skillFilter, setSkillFilter] = useState({});
    const [skillMode, setSkillMode] = useState('all');
    const SKILLS = [
        ['acStandard', '分離式冷氣'],
        ['washerStandard', '直立洗衣機'],
        ['acSpecial', '特殊分離式'],
        ['hoodStandard', '一般抽油煙機'],
        ['hoodHidden', '隱藏抽油煙機'],
        ['stainlessTank', '不鏽鋼水塔'],
        ['concreteTank', '水泥水塔'],
        ['concealedAC', '吊隱式冷氣'],
        ['concealedACSpecial', '吊隱特殊'],
        ['pipe', '管路施工'],
        ['washerDrum', '滾筒洗衣機'],
    ];
    const [techLeaveOpen, setTechLeaveOpen] = useState(false);
    const [techLeaveDate, setTechLeaveDate] = useState(date);
    const [techLeaveSlot, setTechLeaveSlot] = useState('am');
    const [techLeaveType, setTechLeaveType] = useState('排休');
    const [techLeaveEmail, setTechLeaveEmail] = useState('');
    useEffect(() => {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 30);
        const s = start.toISOString().slice(0, 10);
        const e = end.toISOString().slice(0, 10);
        scheduleRepo.listTechnicianLeaves({ start: s, end: e }).then(rows => {
            if (user?.role === 'technician') {
                const emailLc = (user.email || '').toLowerCase();
                setLeaves(rows.filter(r => (r.technicianEmail || '').toLowerCase() === emailLc));
            }
            else {
                setLeaves(rows);
            }
        });
        technicianRepo.list().then(rows => {
            if (user?.role === 'technician')
                setTechs(rows.filter(t => (t.email || '').toLowerCase() === (user.email || '').toLowerCase()));
            else
                setTechs(rows);
        });
    }, []);
    // 依月份載入工單占用，並建立月曆徽章
    useEffect(() => {
        const yymm = date.slice(0, 7);
        const startMonth = `${yymm}-01`;
        const endMonth = `${yymm}-31`;
        Promise.all([
            scheduleRepo.listWork({ start: startMonth, end: endMonth }),
            scheduleRepo.listTechnicianLeaves({ start: startMonth, end: endMonth })
        ]).then(([ws, ls]) => {
            setWorks(ws);
            const map = {};
            const overlapCount = {};
            const leaveCount = {};
            for (const w of ws) {
                map[w.date] = (map[w.date] || 0) + 1;
                if (overlaps(w.startTime, w.endTime, start, end))
                    overlapCount[w.date] = (overlapCount[w.date] || 0) + 1;
            }
            for (const l of ls)
                leaveCount[l.date] = (leaveCount[l.date] || 0) + 1;
            const emph = {};
            Object.keys(overlapCount).forEach(d => { const c = overlapCount[d]; emph[d] = c >= 5 ? 'danger' : 'warn'; });
            const tips = {};
            const days = new Set([...Object.keys(map), ...Object.keys(leaveCount)]);
            days.forEach(d => { const w = map[d] || 0; const l = leaveCount[d] || 0; tips[d] = `工單 ${w}、請假 ${l}`; });
            setWorkMarkers(map);
            setEmphasisMarkers(emph);
            setDayTooltips(tips);
        });
    }, [date, start, end]);
    useEffect(() => {
        // Admin 檢視全部；其他僅看自己
        if (!user)
            return;
        scheduleRepo.listSupport().then(rows => {
            if (user.role === 'admin')
                setSupportShifts(rows);
            else {
                const mine = rows.filter(r => r.supportEmail && r.supportEmail.toLowerCase() === user.email.toLowerCase());
                setSupportShifts(mine);
            }
        });
    }, [user, supportDate]);
    const assignable = useMemo(() => {
        // 可用性：無請假且無工單重疊
        const selectedKeys = Object.keys(skillFilter).filter(k => skillFilter[k]);
        return techs.filter(t => {
            const emailLc = (t.email || '').toLowerCase();
            const hasLeave = leaves.some(l => (l.technicianEmail || '').toLowerCase() === emailLc && l.date === date);
            if (hasLeave)
                return false;
            const hasOverlap = works.some(w => ((w.technicianEmail || '').toLowerCase() === emailLc) && w.date === date && overlaps(w.startTime, w.endTime, start, end));
            if (hasOverlap)
                return false;
            if (selectedKeys.length > 0) {
                const skills = t.skills || {};
                if (skillMode === 'all') {
                    for (const key of selectedKeys)
                        if (!skills[key])
                            return false;
                }
                else {
                    let ok = false;
                    for (const key of selectedKeys)
                        if (skills[key]) {
                            ok = true;
                            break;
                        }
                    if (!ok)
                        return false;
                }
            }
            return true;
        });
    }, [techs, leaves, works, date, start, end, skillFilter, skillMode]);
    const unavailable = useMemo(() => {
        return techs
            .map(t => {
            const emailLc = (t.email || '').toLowerCase();
            const leave = leaves.find(l => (l.technicianEmail || '').toLowerCase() === emailLc && l.date === date);
            if (leave)
                return { t, reason: '請假' };
            const conflicts = works.filter(w => ((w.technicianEmail || '').toLowerCase() === emailLc) && w.date === date && overlaps(w.startTime, w.endTime, start, end));
            if (conflicts.length > 0) {
                const first = conflicts[0];
                return { t, reason: `重疊 ${first.startTime}~${first.endTime}` };
            }
            return { t, reason: '' };
        })
            .filter(x => x.reason && !assignable.find(a => a.id === x.t.id));
    }, [techs, leaves, works, date, start, end, assignable]);
    const toggleSelect = (id) => setSelected(s => ({ ...s, [id]: !s[id] }));
    const emailToTech = useMemo(() => {
        const map = {};
        for (const t of techs)
            map[(t.email || '').toLowerCase()] = t;
        return map;
    }, [techs]);
    const confirmAssign = async () => {
        if (!orderId)
            return;
        const chosen = assignable.filter(t => selected[t.id]);
        const names = chosen.map(t => t.name);
        await orderRepo.update(orderId, { assignedTechnicians: names, preferredDate: date, preferredTimeStart: start, preferredTimeEnd: end });
        alert('已指派，返回訂單選擇簽名技師');
        window.history.back();
    };
    return (_jsxs("div", { className: "space-y-6", children: [user?.role !== 'technician' && (_jsx("div", { className: "text-lg font-semibold", children: "\u6307\u6D3E\u6280\u5E2B" })), user?.role !== 'technician' && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setView('month'), className: `rounded-lg px-2 py-1 text-sm ${view === 'month' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700'}`, children: "\u6708" }), _jsx("button", { onClick: () => setView('week'), className: `rounded-lg px-2 py-1 text-sm ${view === 'week' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700'}`, children: "\u9031" })] }), _jsxs("div", { className: "text-sm text-gray-500", children: [date, " ", start, "~", end] })] })), user?.role !== 'technician' && (view === 'month' ? (_jsx(Calendar, { value: date, onChange: (d) => (window.location.search = `?orderId=${orderId}&date=${d}&start=${start}&end=${end}`), markers: workMarkers, emphasis: emphasisMarkers, tooltips: dayTooltips, onMonthChange: async (y, m) => {
                    const mm = String(m + 1).padStart(2, '0');
                    const startMonth = `${y}-${mm}-01`;
                    const endMonth = `${y}-${mm}-31`;
                    const [ws, ls] = await Promise.all([
                        scheduleRepo.listWork({ start: startMonth, end: endMonth }),
                        scheduleRepo.listTechnicianLeaves({ start: startMonth, end: endMonth })
                    ]);
                    setWorks(ws);
                    const map = {};
                    const overlapCount = {};
                    const leaveCount = {};
                    for (const w of ws) {
                        map[w.date] = (map[w.date] || 0) + 1;
                        if (overlaps(w.startTime, w.endTime, start, end))
                            overlapCount[w.date] = (overlapCount[w.date] || 0) + 1;
                    }
                    for (const l of ls)
                        leaveCount[l.date] = (leaveCount[l.date] || 0) + 1;
                    const emph = {};
                    Object.keys(overlapCount).forEach(d => { const c = overlapCount[d]; emph[d] = c >= 5 ? 'danger' : 'warn'; });
                    const tips = {};
                    const days = new Set([...Object.keys(map), ...Object.keys(leaveCount)]);
                    days.forEach(d => { const w = map[d] || 0; const l = leaveCount[d] || 0; tips[d] = `工單 ${w}、請假 ${l}`; });
                    setWorkMarkers(map);
                    setEmphasisMarkers(emph);
                    setDayTooltips(tips);
                } })) : (_jsx("div", { className: "rounded-2xl bg-white p-3 shadow-card", children: _jsx("div", { className: "grid grid-cols-7 gap-1 text-center text-xs text-gray-500", children: (() => {
                        const base = new Date(date);
                        const day = base.getUTCDay() || 7;
                        const monday = new Date(base);
                        monday.setUTCDate(base.getUTCDate() - day + 1);
                        const days = Array.from({ length: 7 }).map((_, i) => {
                            const d = new Date(monday);
                            d.setUTCDate(monday.getUTCDate() + i);
                            return d;
                        });
                        return days.map((d, i) => {
                            const ds = d.toISOString().slice(0, 10);
                            const isSel = ds === date;
                            return (_jsx("button", { onClick: () => (window.location.search = `?orderId=${orderId}&date=${ds}&start=${start}&end=${end}`), className: `h-8 rounded-md ${isSel ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700'}`, children: String(d.getUTCDate()) }, i));
                        });
                    })() }) }))), _jsxs("div", { className: "rounded-2xl bg-white p-4 shadow-card", children: [_jsx("div", { className: "text-sm font-semibold", children: "\u7576\u65E5\u5DE5\u4F5C\u6E05\u55AE" }), _jsxs("div", { className: "mt-2 space-y-1 text-xs", children: [works.filter(w => w.date === date).map((w, i) => {
                                const t = emailToTech[(w.technicianEmail || '').toLowerCase()];
                                return (_jsxs("div", { className: "flex items-center justify-between border-b py-1", children: [_jsx("div", { className: "min-w-0 truncate", children: t ? `${t.shortName || t.name}（${t.code}｜${t.region === 'all' ? '全區' : t.region}）` : w.technicianEmail }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { children: [w.startTime, "~", w.endTime] }), _jsxs(Link, { to: `/orders/${w.orderId}`, className: "rounded bg-gray-100 px-2 py-0.5", children: ["\u8A02\u55AE ", w.orderId] })] })] }, i));
                            }), works.filter(w => w.date === date).length === 0 && _jsx("div", { className: "text-gray-500", children: "\u7121" })] })] }), user?.role !== 'technician' && (_jsxs("div", { className: "rounded-2xl bg-white p-4 shadow-card", children: [_jsx("div", { className: "text-sm text-gray-500", children: "\u4EE5\u4E0B\u70BA\u672A\u5728\u8A72\u6642\u6BB5\u8ACB\u5047\u7684\u53EF\u7528\u6280\u5E2B\u3002\u53EF\u4F9D\u6280\u80FD\u7BE9\u9078\uFF1B\u9078\u64C7\u591A\u4EBA\u5F8C\uFF0C\u56DE\u8A02\u55AE\u9801\u6307\u5B9A\u7C3D\u540D\u6280\u5E2B\u3002" }), _jsxs("div", { className: "mt-3 rounded-lg bg-gray-50 p-3 text-xs", children: [_jsx("div", { className: "mb-2 font-semibold", children: "\u6280\u80FD\u7BE9\u9078" }), _jsxs("div", { className: "mb-2 flex items-center gap-3", children: [_jsxs("label", { className: "flex items-center gap-1", children: [_jsx("input", { type: "radio", name: "mode", checked: skillMode === 'all', onChange: () => setSkillMode('all') }), "\u5168\u90E8\u7B26\u5408"] }), _jsxs("label", { className: "flex items-center gap-1", children: [_jsx("input", { type: "radio", name: "mode", checked: skillMode === 'any', onChange: () => setSkillMode('any') }), "\u81F3\u5C11\u4E00\u9805"] })] }), _jsx("div", { className: "grid grid-cols-2 gap-2 md:grid-cols-3", children: SKILLS.map(([key, label]) => (_jsxs("label", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", checked: !!skillFilter[key], onChange: e => setSkillFilter(s => ({ ...s, [key]: e.target.checked })) }), _jsx("span", { children: label })] }, key))) }), _jsx("div", { className: "mt-2", children: _jsx("button", { onClick: () => setSkillFilter({}), className: "rounded bg-gray-200 px-2 py-1", children: "\u6E05\u9664" }) })] }), _jsx("div", { className: "mt-3 grid grid-cols-1 gap-2", children: assignable.map(t => {
                            const selectedKeys = Object.keys(skillFilter).filter(k => skillFilter[k]);
                            return (_jsxs("label", { className: `flex flex-col gap-1 rounded-xl border p-3 ${selected[t.id] ? 'border-brand-400' : ''}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "checkbox", checked: !!selected[t.id], onChange: () => toggleSelect(t.id) }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold", children: t.shortName || t.name }), _jsx("div", { className: "text-xs text-gray-400", children: t.code }), _jsxs("div", { className: "text-xs text-gray-500", children: [t.region === 'all' ? '全區' : `${t.region}區`, " \u00B7 ", t.email] })] })] }), selectedKeys.length > 0 && (_jsx("div", { className: "ml-7 flex flex-wrap gap-1", children: selectedKeys.map(key => {
                                            const has = (t.skills || {})[key];
                                            const label = (SKILLS.find(s => s[0] === key)?.[1]) || key;
                                            return _jsxs("span", { className: `rounded-full px-2 py-0.5 text-[10px] ${has ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`, children: [label, has ? '✓' : '×'] }, key);
                                        }) }))] }, t.id));
                        }) }), unavailable.length > 0 && (_jsxs("div", { className: "mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-700", children: [_jsx("div", { className: "mb-1 font-semibold", children: "\u4E0D\u53EF\u6307\u6D3E\uFF08\u91CD\u758A/\u8ACB\u5047\uFF09" }), _jsx("div", { className: "space-y-1", children: unavailable.map(({ t, reason }) => (_jsxs("div", { className: "flex items-center justify-between border-b border-amber-100 pb-1", children: [_jsxs("div", { className: "truncate", children: [t.name, " ", _jsx("span", { className: "text-gray-400", children: t.code })] }), _jsx("div", { children: reason })] }, t.id))) })] })), _jsxs("div", { className: "mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-600", children: [_jsx("div", { className: "mb-1 font-semibold", children: "\u7576\u65E5\u5360\u7528" }), works.filter(w => w.date === date).map((w, i) => {
                                const conflict = overlaps(w.startTime, w.endTime, start, end);
                                const t = emailToTech[(w.technicianEmail || '').toLowerCase()];
                                return (_jsxs("div", { className: `flex items-center justify-between border-b py-1 ${conflict ? 'text-rose-600' : ''}`, title: conflict ? '與選定時段重疊' : '', children: [_jsxs("div", { className: "truncate", children: [t ? `${t.shortName || t.name} (${t.code})` : w.technicianEmail, " ", _jsxs("span", { className: "text-gray-400", children: ["#", w.orderId] })] }), _jsxs("div", { children: [w.startTime, "~", w.endTime] })] }, i));
                            }), works.filter(w => w.date === date).length === 0 && _jsx("div", { children: "\u7121" })] }), _jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx("button", { onClick: confirmAssign, className: "rounded-xl bg-brand-500 px-4 py-2 text-white", children: "\u78BA\u8A8D\u6307\u6D3E" }), _jsx(Link, { to: `/orders/${orderId || 'O01958'}`, className: "rounded-xl bg-gray-900 px-4 py-2 text-white", children: "\u8FD4\u56DE\u8A02\u55AE" })] })] })), user?.role !== 'technician' && (_jsxs("div", { className: "rounded-2xl bg-white p-4 shadow-card", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-lg font-semibold", children: "\u5BA2\u670D\u6392\u73ED" }), _jsx("button", { onClick: () => setSupportOpen(o => !o), className: "rounded-lg bg-gray-100 px-3 py-1 text-sm", children: supportOpen ? '收起' : '展開' })] }), supportOpen && (_jsxs("div", { className: "mt-3 space-y-3", children: [_jsx(Calendar, { value: supportDate, onChange: setSupportDate, header: "\u9078\u64C7\u65E5\u671F" }), _jsxs("div", { className: "flex items-center gap-3 text-sm", children: [_jsxs("div", { children: [_jsx("label", { className: "mr-2 text-gray-600", children: "\u6642\u6BB5" }), _jsxs("select", { className: "rounded-lg border px-2 py-1", value: supportSlot, onChange: (e) => setSupportSlot(e.target.value), children: [_jsx("option", { value: "am", children: "\u4E0A\u5348" }), _jsx("option", { value: "pm", children: "\u4E0B\u5348" }), _jsx("option", { value: "full", children: "\u5168\u5929" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mr-2 text-gray-600", children: "\u5047\u5225" }), _jsxs("select", { className: "rounded-lg border px-2 py-1", value: supportType, onChange: (e) => setSupportType(e.target.value), children: [_jsx("option", { value: "\u6392\u4F11", children: "\u6392\u4F11" }), _jsx("option", { value: "\u7279\u4F11", children: "\u7279\u4F11" }), _jsx("option", { value: "\u4E8B\u5047", children: "\u4E8B\u5047" }), _jsx("option", { value: "\u5A5A\u5047", children: "\u5A5A\u5047" }), _jsx("option", { value: "\u75C5\u5047", children: "\u75C5\u5047" }), _jsx("option", { value: "\u55AA\u5047", children: "\u55AA\u5047" })] })] }), _jsx("button", { onClick: async () => {
                                            if (!user)
                                                return;
                                            const color = (type) => type === '排休' || type === '特休' ? '#FEF3C7' : type === '事假' ? '#DBEAFE' : type === '婚假' ? '#FCE7F3' : type === '病假' ? '#E5E7EB' : '#9CA3AF';
                                            await scheduleRepo.saveSupportShift({ supportEmail: user.email, date: supportDate, slot: supportSlot, reason: supportType, color: color(supportType) });
                                            const rows = await scheduleRepo.listSupport();
                                            setSupportShifts(rows.filter(r => r.supportEmail && r.supportEmail.toLowerCase() === user.email.toLowerCase()));
                                        }, className: "rounded-xl bg-brand-500 px-4 py-2 text-white", children: "\u65B0\u589E" })] }), _jsxs("div", { className: "space-y-2", children: [supportShifts.filter(s => (s.date || '').startsWith(supportDate.slice(0, 7))).map(s => (_jsx("div", { className: "flex items-center justify-between rounded-xl border p-3 text-sm", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "inline-block h-3 w-3 rounded-full", style: { backgroundColor: s.color || '#E5E7EB' } }), _jsxs("div", { children: [s.date, " \u00B7 ", s.slot === 'full' ? '全天' : (s.slot === 'am' ? '上午' : '下午'), " \u00B7 ", s.reason] })] }) }, s.id))), supportShifts.length === 0 && _jsx("div", { className: "text-gray-500", children: "\u76EE\u524D\u7121\u6392\u73ED\u8CC7\u6599" })] })] }))] })), _jsxs("div", { className: "rounded-2xl bg-white p-4 shadow-card", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-lg font-semibold", children: "\u6280\u5E2B\u4F11\u5047" }), _jsx("button", { onClick: () => setTechLeaveOpen(o => !o), className: "rounded-lg bg-gray-100 px-3 py-1 text-sm", children: techLeaveOpen ? '收起' : '展開' })] }), techLeaveOpen && (_jsxs("div", { className: "mt-3 space-y-3", children: [_jsxs("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-3", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm text-gray-600", children: "\u9078\u64C7\u6280\u5E2B" }), _jsxs("select", { className: "w-full rounded-lg border px-2 py-1", value: techLeaveEmail, onChange: (e) => setTechLeaveEmail(e.target.value), children: [_jsx("option", { value: "", children: "\u8ACB\u9078\u64C7" }), techs.map(t => _jsxs("option", { value: t.email, children: [t.name, "\uFF08", t.code, "\uFF09"] }, t.id))] })] }), _jsx("div", { className: "md:col-span-2", children: _jsx(Calendar, { value: techLeaveDate, onChange: setTechLeaveDate, header: "\u9078\u64C7\u65E5\u671F" }) })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 text-sm", children: [_jsxs("div", { children: [_jsx("label", { className: "mr-2 text-gray-600", children: "\u6642\u6BB5" }), _jsxs("select", { className: "rounded-lg border px-2 py-1", value: techLeaveSlot, onChange: (e) => setTechLeaveSlot(e.target.value), children: [_jsx("option", { value: "am", children: "\u4E0A\u5348" }), _jsx("option", { value: "pm", children: "\u4E0B\u5348" }), _jsx("option", { value: "full", children: "\u5168\u5929" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mr-2 text-gray-600", children: "\u5047\u5225" }), _jsxs("select", { className: "rounded-lg border px-2 py-1", value: techLeaveType, onChange: (e) => setTechLeaveType(e.target.value), children: [_jsx("option", { value: "\u6392\u4F11", children: "\u6392\u4F11" }), _jsx("option", { value: "\u7279\u4F11", children: "\u7279\u4F11" }), _jsx("option", { value: "\u4E8B\u5047", children: "\u4E8B\u5047" }), _jsx("option", { value: "\u5A5A\u5047", children: "\u5A5A\u5047" }), _jsx("option", { value: "\u75C5\u5047", children: "\u75C5\u5047" }), _jsx("option", { value: "\u55AA\u5047", children: "\u55AA\u5047" })] })] }), _jsx("button", { onClick: async () => {
                                            if (!techLeaveEmail) {
                                                alert('請先選擇技師');
                                                return;
                                            }
                                            const color = (type) => type === '排休' || type === '特休' ? '#FEF3C7' : type === '事假' ? '#DBEAFE' : type === '婚假' ? '#FCE7F3' : type === '病假' ? '#E5E7EB' : '#9CA3AF';
                                            const payload = { technicianEmail: techLeaveEmail, date: techLeaveDate, fullDay: techLeaveSlot === 'full', reason: techLeaveType, color: color(techLeaveType) };
                                            if (techLeaveSlot === 'am') {
                                                payload.fullDay = false;
                                                payload.startTime = '09:00';
                                                payload.endTime = '12:00';
                                            }
                                            if (techLeaveSlot === 'pm') {
                                                payload.fullDay = false;
                                                payload.startTime = '13:00';
                                                payload.endTime = '18:00';
                                            }
                                            try {
                                                await scheduleRepo.saveTechnicianLeave(payload);
                                                const yymm = techLeaveDate.slice(0, 7);
                                                await Promise.all([
                                                    scheduleRepo.listTechnicianLeaves({ start: `${yymm}-01`, end: `${yymm}-31` }).then(setLeaves),
                                                    scheduleRepo.listWork({ start: `${yymm}-01`, end: `${yymm}-31` }).then(ws => {
                                                        setWorks(ws);
                                                        const map = {};
                                                        const overlapCount = {};
                                                        for (const w of ws) {
                                                            map[w.date] = (map[w.date] || 0) + 1;
                                                            if (overlaps(w.startTime, w.endTime, start, end))
                                                                overlapCount[w.date] = (overlapCount[w.date] || 0) + 1;
                                                        }
                                                        const emph = {};
                                                        Object.keys(overlapCount).forEach(d => { const c = overlapCount[d]; emph[d] = c >= 5 ? 'danger' : 'warn'; });
                                                        setWorkMarkers(map);
                                                        setEmphasisMarkers(emph);
                                                    })
                                                ]);
                                                alert('已新增休假');
                                            }
                                            catch (e) {
                                                alert(e?.message || '新增失敗');
                                            }
                                        }, className: "rounded-xl bg-brand-500 px-4 py-2 text-white", children: "\u65B0\u589E" })] })] }))] }), _jsx("div", { className: "text-lg font-semibold", children: "\u6280\u5E2B\u6392\u73ED\uFF08\u4F11\u5047\uFF09" }), _jsxs("div", { className: "rounded-2xl bg-white p-3 text-xs text-gray-600 shadow-card", children: [_jsx("div", { className: "mb-2 font-semibold", children: "\u5716\u4F8B" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("i", { className: "h-3 w-3 rounded", style: { background: '#FEF3C7' } }), "\u6392\u4F11/\u7279\u4F11"] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("i", { className: "h-3 w-3 rounded", style: { background: '#DBEAFE' } }), "\u4E8B\u5047"] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("i", { className: "h-3 w-3 rounded", style: { background: '#FCE7F3' } }), "\u5A5A\u5047"] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("i", { className: "h-3 w-3 rounded", style: { background: '#E5E7EB' } }), "\u75C5\u5047"] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("i", { className: "h-3 w-3 rounded", style: { background: '#9CA3AF' } }), "\u55AA\u5047"] })] })] }), leaves.map((l) => (_jsxs("div", { className: "rounded-xl border bg-white p-4 shadow-card", children: [_jsxs("div", { className: "text-sm text-gray-600", children: [l.date, " ", l.fullDay ? '全天' : `${l.startTime || ''} ~ ${l.endTime || ''}`] }), _jsx("div", { className: "mt-1 text-base", children: l.technicianEmail }), l.reason && _jsx("div", { className: "text-sm text-gray-500", children: l.reason })] }, l.id))), leaves.length === 0 && _jsx("div", { className: "text-gray-500", children: "\u8FD1\u671F\u7121\u8CC7\u6599" }), _jsx("div", { className: "pt-2", children: _jsx(Link, { to: `/orders/${orderId || 'O01958'}`, className: "inline-block rounded-xl bg-gray-900 px-4 py-2 text-white", children: "\u8FD4\u56DE\u8A02\u55AE" }) })] }));
}
