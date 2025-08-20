class LocalStaffRepo {
    constructor() {
        this.storageKey = 'local-staff-data';
    }
    loadData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : this.getInitialData();
        }
        catch {
            return this.getInitialData();
        }
    }
    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
    getInitialData() {
        return [
            {
                id: 'STF-001',
                name: '洗小濯',
                shortName: '小濯',
                email: 'xiaofu888@yahoo.com.tw',
                phone: '0986985725',
                role: 'support',
                status: 'active',
                updatedAt: new Date().toISOString()
            }
        ];
    }
    async list() {
        return this.loadData();
    }
    async upsert(staff) {
        const data = this.loadData();
        const existing = data.find(s => s.email.toLowerCase() === staff.email.toLowerCase());
        if (existing) {
            // 更新現有
            const updated = {
                ...existing,
                ...staff,
                // 保留既有 refCode 與 points，除非外部有提供新值
                refCode: existing.refCode || this.nextSalesCode(data, staff.role),
                points: staff.points !== undefined ? staff.points : existing.points,
                updatedAt: new Date().toISOString()
            };
            const newData = data.map(s => s.id === existing.id ? updated : s);
            this.saveData(newData);
            return updated;
        }
        else {
            // 新增
            const newStaff = {
                id: `STF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
                ...staff,
                refCode: this.nextSalesCode(data, staff.role),
                updatedAt: new Date().toISOString()
            };
            this.saveData([...data, newStaff]);
            return newStaff;
        }
    }
    nextSalesCode(rows, role) {
        if (role !== 'sales')
            return undefined;
        const used = new Set(rows.filter(r => r.refCode).map(r => r.refCode));
        let num = 100;
        while (used.has(`SE${num}`))
            num++;
        return `SE${num}`;
    }
    async remove(id) {
        const data = this.loadData();
        this.saveData(data.filter(s => s.id !== id));
    }
    async resetPassword(id) {
        // 本機模式：模擬重設密碼（實際上不做任何事）
        console.log(`模擬重設密碼：${id}`);
    }
}
export const staffRepo = new LocalStaffRepo();
class LocalStaffApplicationRepo {
    constructor() {
        this.key = 'local-staff-apps';
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
        const obj = { id: `SAP-${Math.random().toString(36).slice(2, 9).toUpperCase()}`, status: 'pending', appliedAt: now, ...app };
        this.save([obj, ...rows]);
    }
    async approve(id) { const rows = this.load(); const idx = rows.findIndex(r => r.id === id); if (idx < 0)
        return; rows[idx].status = 'approved'; this.save(rows); }
    async reject(id) { const rows = this.load(); const idx = rows.findIndex(r => r.id === id); if (idx < 0)
        return; rows[idx].status = 'rejected'; this.save(rows); }
}
export const staffApplicationRepo = new LocalStaffApplicationRepo();
