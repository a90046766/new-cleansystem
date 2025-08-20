import { technicianRepo } from './technicians';
import { staffRepo } from './staff';
class LocalMemberRepo {
    constructor() {
        this.key = 'local-members';
    }
    load() { try {
        const s = localStorage.getItem(this.key);
        return s ? JSON.parse(s) : [];
    }
    catch {
        return [];
    } }
    save(rows) { localStorage.setItem(this.key, JSON.stringify(rows)); }
    nextCode(rows) {
        const used = new Set(rows.map(m => m.code));
        let num = 1000;
        while (used.has(`MO${num}`))
            num++;
        return `MO${num}`;
    }
    async list() { return this.load(); }
    async get(id) { return this.load().find(m => m.id === id) || null; }
    async findByCode(code) { return this.load().find(m => m.code === code) || null; }
    async findByEmail(email) { return this.load().find(m => (m.email || '').toLowerCase() === (email || '').toLowerCase()) || null; }
    async create(draft) {
        const rows = this.load();
        const now = new Date().toISOString();
        const id = `MBR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const code = this.nextCode(rows);
        // 解析介紹人類型
        let refType;
        const rc = draft.referrerCode;
        if (rc) {
            if (rc.startsWith('MO'))
                refType = 'member';
            else if (rc.startsWith('SR'))
                refType = 'technician';
            else if (rc.startsWith('SE'))
                refType = 'sales';
        }
        const obj = { ...draft, referrerType: refType, id, code, points: 0, updatedAt: now };
        this.save([obj, ...rows]);
        // 介紹人即時 +100 積分
        try {
            if (rc && refType === 'member') {
                const list = this.load();
                const ref = list.find(m => m.code === rc);
                if (ref) {
                    ref.points = (ref.points || 0) + 100;
                    this.save([ref, ...list.filter(m => m.id !== ref.id)]);
                }
            }
            else if (rc && refType === 'technician') {
                const techs = await technicianRepo.list();
                const t = techs.find(x => x.code === rc);
                if (t)
                    await technicianRepo.upsert({ id: t.id, name: t.name, shortName: t.shortName, email: t.email, phone: t.phone, region: t.region, status: t.status, points: (t.points || 0) + 100 });
            }
            else if (rc && refType === 'sales') {
                const staffs = await staffRepo.list();
                const s = staffs.find(x => x.refCode === rc);
                if (s)
                    await staffRepo.upsert({ name: s.name, shortName: s.shortName, email: s.email, phone: s.phone, role: s.role, status: s.status, points: (s.points || 0) + 100 });
            }
        }
        catch { }
        return obj;
    }
    async upsert(member) {
        const rows = this.load();
        const now = new Date().toISOString();
        const idx = rows.findIndex(r => r.id === member.id);
        if (idx >= 0) {
            rows[idx] = { ...rows[idx], ...member, updatedAt: now };
            this.save(rows);
            return rows[idx];
        }
        const code = this.nextCode(rows);
        const obj = { ...member, code, updatedAt: now };
        this.save([obj, ...rows]);
        return obj;
    }
}
export const memberRepo = new LocalMemberRepo();
class LocalMemberApplicationRepo {
    constructor() {
        this.key = 'local-member-apps';
    }
    load() { try {
        const s = localStorage.getItem(this.key);
        return s ? JSON.parse(s) : [];
    }
    catch {
        return [];
    } }
    save(rows) { localStorage.setItem(this.key, JSON.stringify(rows)); }
    async listPending() { return this.load().filter(a => a.status === 'pending'); }
    async submit(app) {
        const rows = this.load();
        const now = new Date().toISOString();
        const obj = { id: `MAP-${Math.random().toString(36).slice(2, 9).toUpperCase()}`, status: 'pending', appliedAt: now, ...app };
        this.save([obj, ...rows]);
    }
    async approve(id) { const rows = this.load(); const idx = rows.findIndex(r => r.id === id); if (idx < 0)
        return; rows[idx].status = 'approved'; this.save(rows); }
    async reject(id) { const rows = this.load(); const idx = rows.findIndex(r => r.id === id); if (idx < 0)
        return; rows[idx].status = 'rejected'; this.save(rows); }
}
export const memberApplicationRepo = new LocalMemberApplicationRepo();
