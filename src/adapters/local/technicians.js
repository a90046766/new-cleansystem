class LocalTechnicianApplicationRepo {
    constructor() {
        this.storageKey = 'local-technician-applications';
    }
    loadData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : [];
        }
        catch {
            return [];
        }
    }
    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
    async listPending() {
        const data = this.loadData();
        return data.filter(app => app.status === 'pending');
    }
    async submit(app) {
        const data = this.loadData();
        const normalizedEmail = app.email.trim().toLowerCase();
        // 檢查是否已有相同 Email 的申請
        const existing = data.find(a => a.email.toLowerCase() === normalizedEmail);
        if (existing) {
            throw new Error('此 Email 已申請過，無法重複申請');
        }
        const newApp = {
            id: `APP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            ...app,
            email: normalizedEmail,
            status: 'pending',
            appliedAt: new Date().toISOString()
        };
        this.saveData([...data, newApp]);
    }
    async approve(id) {
        const data = this.loadData();
        const app = data.find(a => a.id === id);
        if (!app)
            throw new Error('申請不存在');
        // 標記為已核准
        app.status = 'approved';
        // 清理同 Email 的其他 pending 申請
        const normalizedEmail = app.email.toLowerCase();
        data.forEach(a => {
            if (a.email.toLowerCase() === normalizedEmail && a.id !== id && a.status === 'pending') {
                a.status = 'rejected';
            }
        });
        this.saveData(data);
    }
    async reject(id) {
        const data = this.loadData();
        const updated = data.map(app => app.id === id ? { ...app, status: 'rejected' } : app);
        this.saveData(updated);
    }
}
export const technicianApplicationRepo = new LocalTechnicianApplicationRepo();
class LocalTechnicianRepo {
    constructor() {
        this.storageKey = 'local-technicians';
    }
    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : this.getInitial();
        }
        catch {
            return this.getInitial();
        }
    }
    save(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
    getInitial() {
        const now = new Date().toISOString();
        return [
            { id: 'TECH-A01', code: 'SR101', name: '楊小飛', shortName: '小飛', email: 'jason660628@yahoo.com.tw', phone: '0913788051', region: 'north', status: 'active', revenueShareScheme: 'pure75', updatedAt: now },
            { id: 'TECH-A02', code: 'SR102', name: '洗小濯', shortName: '小濯', email: 'xiaofu888@yahoo.com.tw', phone: '0986985725', region: 'north', status: 'active', revenueShareScheme: 'base1', updatedAt: now },
        ];
    }
    async list() {
        return this.load();
    }
    nextCode(existing) {
        const used = new Set(existing.map(t => t.code));
        let num = 100;
        while (used.has(`SR${num}`))
            num++;
        return `SR${num}`;
    }
    async upsert(tech) {
        const data = this.load();
        const now = new Date().toISOString();
        if (tech.id) {
            const idx = data.findIndex(t => t.id === tech.id);
            const keepCode = idx >= 0 ? data[idx].code : this.nextCode(data);
            const next = { ...(idx >= 0 ? data[idx] : {}), ...tech, id: tech.id, code: keepCode, updatedAt: now };
            if (idx >= 0)
                data[idx] = next;
            else
                data.push(next);
            this.save(data);
            return next;
        }
        const id = `TECH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const next = { ...tech, id, code: this.nextCode(data), updatedAt: now };
        this.save([next, ...data]);
        return next;
    }
    async remove(id) {
        const data = this.load();
        this.save(data.filter(t => t.id !== id));
    }
}
export const technicianRepo = new LocalTechnicianRepo();
