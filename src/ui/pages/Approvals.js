import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { SectionTitle, StatusChip } from '../kit';
import { technicianApplicationRepo, technicianRepo } from '../../adapters/local/technicians';
import { staffRepo, staffApplicationRepo } from '../../adapters/local/staff';
import { memberRepo, memberApplicationRepo } from '../../adapters/local/members';
export default function ApprovalsPage() {
    const [techApps, setTechApps] = useState([]);
    const [staffApps, setStaffApps] = useState([]);
    const [memberApps, setMemberApps] = useState([]);
    const [loading, setLoading] = useState(false);
    const loadData = async () => {
        try {
            const [ta, sa, ma] = await Promise.all([
                technicianApplicationRepo.listPending(),
                staffApplicationRepo.listPending(),
                memberApplicationRepo.listPending(),
            ]);
            setTechApps(ta);
            setStaffApps(sa);
            setMemberApps(ma);
        }
        catch (err) {
            console.error('載入申請失敗:', err);
        }
    };
    useEffect(() => {
        loadData();
    }, []);
    const handleApprove = async (id, app) => {
        const { confirmTwice } = await import('../kit');
        if (!(await confirmTwice(`確定要核准「${app.name}」的申請嗎？`, '核准後不可回到待審，仍要核准？')))
            return;
        setLoading(true);
        try {
            // 核准申請
            await technicianApplicationRepo.approve(id);
            // 技師唯一化（以 email 為準）：若存在則更新，不存在才新增
            try {
                const emailLc = app.email.trim().toLowerCase();
                const list = await technicianRepo.list();
                const existed = list.find(t => (t.email || '').toLowerCase() === emailLc);
                if (existed) {
                    await technicianRepo.upsert({ id: existed.id, name: app.name, shortName: app.shortName || app.name, email: emailLc, phone: app.phone, region: app.region, status: 'active' });
                }
                else {
                    await technicianRepo.upsert({ name: app.name, shortName: app.shortName || app.name, email: emailLc, phone: app.phone, region: app.region, status: 'active' });
                }
            }
            catch { }
            await loadData();
            alert('核准成功');
        }
        catch (err) {
            alert('核准失敗：' + err.message);
        }
        finally {
            setLoading(false);
        }
    };
    const handleReject = async (id, name) => {
        const { confirmTwice } = await import('../kit');
        if (!(await confirmTwice(`確定要婉拒「${name}」的申請嗎？`, '婉拒後不可回到待審，仍要婉拒？')))
            return;
        setLoading(true);
        try {
            await technicianApplicationRepo.reject(id);
            await loadData();
            alert('已婉拒');
        }
        catch (err) {
            alert('操作失敗：' + err.message);
        }
        finally {
            setLoading(false);
        }
    };
    const approveStaff = async (app) => {
        const { confirmTwice } = await import('../kit');
        if (!(await confirmTwice(`確定核准員工「${app.name}」?`, '核准後不可回到待審，仍要核准？')))
            return;
        setLoading(true);
        try {
            await staffApplicationRepo.approve(app.id);
            // 唯一化：email 存在則更新，不存在則新增
            const list = await staffRepo.list();
            const existed = list.find(s => s.email.toLowerCase() === (app.email || '').toLowerCase());
            if (existed)
                await staffRepo.upsert({ id: existed.id, name: app.name, shortName: app.shortName || app.name, email: app.email, phone: app.phone, role: app.role, status: 'active' });
            else
                await staffRepo.upsert({ name: app.name, shortName: app.shortName || app.name, email: app.email, phone: app.phone, role: app.role, status: 'active' });
            await loadData();
            alert('核准成功');
        }
        catch (e) {
            alert(e?.message || '失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const rejectStaff = async (app) => { const { confirmTwice } = await import('../kit'); if (!(await confirmTwice(`婉拒員工「${app.name}」?`, '確定婉拒？')))
        return; await staffApplicationRepo.reject(app.id); await loadData(); };
    const approveMember = async (app) => {
        const { confirmTwice } = await import('../kit');
        if (!(await confirmTwice(`確定核准會員「${app.name}」?`, '核准後不可回到待審，仍要核准？')))
            return;
        setLoading(true);
        try {
            await memberApplicationRepo.approve(app.id);
            // 唯一化：email 命中則更新，否則建立 MO 碼
            if (app.email) {
                const existed = await memberRepo.findByEmail(app.email);
                if (existed) {
                    await memberRepo.upsert({ ...existed, name: app.name, phone: app.phone, referrerCode: app.referrerCode });
                }
                else {
                    await memberRepo.create({ name: app.name, email: app.email, phone: app.phone, referrerCode: app.referrerCode });
                }
            }
            else {
                await memberRepo.create({ name: app.name, phone: app.phone, referrerCode: app.referrerCode });
            }
            await loadData();
            alert('核准成功');
        }
        catch (e) {
            alert(e?.message || '失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const rejectMember = async (app) => { const { confirmTwice } = await import('../kit'); if (!(await confirmTwice(`婉拒會員「${app.name}」?`, '確定婉拒？')))
        return; await memberApplicationRepo.reject(app.id); await loadData(); };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "\u5BE9\u6838\u9762\u677F" }), _jsx("button", { onClick: loadData, disabled: loading, className: "rounded-xl bg-brand-500 px-4 py-2 text-sm text-white disabled:opacity-50", children: loading ? '載入中...' : '重新整理' })] }), _jsxs("div", { className: "rounded-2xl bg-white p-6 shadow-card", children: [_jsx(SectionTitle, { children: "\u5F85\u5BE9\u6838\u6280\u5E2B/\u54E1\u5DE5/\u6703\u54E1\u7533\u8ACB" }), techApps.length === 0 ? (_jsx("div", { className: "mt-4 text-center text-gray-500", children: "\u76EE\u524D\u7121\u5F85\u5BE9\u6838\u7533\u8ACB" })) : (_jsxs("div", { className: "mt-4 space-y-4", children: [techApps.map((app) => (_jsx("div", { className: "rounded-xl border p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-semibold", children: app.name }), app.shortName && (_jsxs("span", { className: "text-sm text-gray-500", children: ["(", app.shortName, ")"] })), _jsx(StatusChip, { kind: "pending", text: "\u5F85\u5BE9\u6838" })] }), _jsxs("div", { className: "mt-1 space-y-1 text-sm text-gray-600", children: [_jsxs("div", { children: ["\uD83D\uDCE7 ", app.email] }), _jsxs("div", { children: ["\uD83D\uDCF1 ", app.phone] }), _jsxs("div", { children: ["\uD83D\uDCCD ", app.region === 'all' ? '全區' : `${app.region}區`] }), _jsxs("div", { children: ["\uD83D\uDCC5 ", new Date(app.appliedAt).toLocaleString('zh-TW')] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleApprove(app.id, app), disabled: loading, className: "rounded-xl bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600 disabled:opacity-50", children: "\u901A\u904E" }), _jsx("button", { onClick: () => handleReject(app.id, app.name), disabled: loading, className: "rounded-xl bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600 disabled:opacity-50", children: "\u5A49\u62D2" })] })] }) }, app.id))), staffApps.map((app) => (_jsx("div", { className: "rounded-xl border p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-semibold", children: ["[\u54E1\u5DE5] ", app.name] }), _jsx(StatusChip, { kind: "pending", text: "\u5F85\u5BE9\u6838" })] }), _jsxs("div", { className: "mt-1 space-y-1 text-sm text-gray-600", children: [_jsxs("div", { children: ["\uD83D\uDCE7 ", app.email] }), _jsxs("div", { children: ["\uD83D\uDCF1 ", app.phone || '-'] }), _jsxs("div", { children: ["\uD83E\uDDD1\u200D\uD83D\uDCBC ", app.role] }), _jsxs("div", { children: ["\uD83D\uDCC5 ", new Date(app.appliedAt).toLocaleString('zh-TW')] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => approveStaff(app), disabled: loading, className: "rounded-xl bg-green-500 px-4 py-2 text-sm text-white", children: "\u901A\u904E" }), _jsx("button", { onClick: () => rejectStaff(app), disabled: loading, className: "rounded-xl bg-gray-500 px-4 py-2 text-sm text-white", children: "\u5A49\u62D2" })] })] }) }, app.id))), memberApps.map((app) => (_jsx("div", { className: "rounded-xl border p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-semibold", children: ["[\u6703\u54E1] ", app.name] }), _jsx(StatusChip, { kind: "pending", text: "\u5F85\u5BE9\u6838" })] }), _jsxs("div", { className: "mt-1 space-y-1 text-sm text-gray-600", children: [_jsxs("div", { children: ["\uD83D\uDCE7 ", app.email || '-'] }), _jsxs("div", { children: ["\uD83D\uDCF1 ", app.phone || '-'] }), _jsxs("div", { children: ["\uD83C\uDFAB \u4ECB\u7D39\u78BC ", app.referrerCode || '-'] }), _jsxs("div", { children: ["\uD83D\uDCC5 ", new Date(app.appliedAt).toLocaleString('zh-TW')] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => approveMember(app), disabled: loading, className: "rounded-xl bg-green-500 px-4 py-2 text-sm text-white", children: "\u901A\u904E" }), _jsx("button", { onClick: () => rejectMember(app), disabled: loading, className: "rounded-xl bg-gray-500 px-4 py-2 text-sm text-white", children: "\u5A49\u62D2" })] })] }) }, app.id)))] }))] })] }));
}
