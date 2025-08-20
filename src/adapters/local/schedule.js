class LocalScheduleRepo {
    constructor() {
        this.supportKey = 'local-support-shifts';
        this.techLeaveKey = 'local-technician-leaves';
        this.workKey = 'local-technician-work';
    }
    load(key, fallback) {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : fallback;
        }
        catch {
            return fallback;
        }
    }
    save(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    async listSupport(range) {
        const rows = this.load(this.supportKey, []);
        if (!range)
            return rows;
        return rows.filter(r => r.date >= range.start && r.date <= range.end);
    }
    async saveSupportShift(shift) {
        const rows = this.load(this.supportKey, []);
        const now = new Date().toISOString();
        // 禁改過去日期
        try {
            const today = new Date();
            const d = new Date(shift.date + 'T00:00:00');
            if (d.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) {
                throw new Error('不可異動過去日期');
            }
        }
        catch { }
        const id = shift.id || `SS-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
        const next = { ...shift, id, updatedAt: now };
        const idx = rows.findIndex(r => r.id === id);
        if (idx >= 0)
            rows[idx] = next;
        else
            rows.push(next);
        this.save(this.supportKey, rows);
        return next;
    }
    async listTechnicianLeaves(range) {
        const rows = this.load(this.techLeaveKey, []);
        if (!range)
            return rows;
        return rows.filter(r => r.date >= range.start && r.date <= range.end);
    }
    async saveTechnicianLeave(leave) {
        const rows = this.load(this.techLeaveKey, []);
        const now = new Date().toISOString();
        // 禁改過去日期
        try {
            const today = new Date();
            const d = new Date(leave.date + 'T00:00:00');
            if (d.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) {
                throw new Error('不可異動過去日期');
            }
        }
        catch { }
        const id = leave.id || `TL-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
        const next = { ...leave, id, updatedAt: now };
        const idx = rows.findIndex(r => r.id === id);
        if (idx >= 0)
            rows[idx] = next;
        else
            rows.push(next);
        this.save(this.techLeaveKey, rows);
        return next;
    }
    async listWork(range, technicianEmail) {
        const rows = this.load(this.workKey, []);
        let filtered = rows;
        if (range)
            filtered = filtered.filter(r => r.date >= range.start && r.date <= range.end);
        if (technicianEmail)
            filtered = filtered.filter(r => r.technicianEmail.toLowerCase() === technicianEmail.toLowerCase());
        return filtered;
    }
    async saveWork(work) {
        const rows = this.load(this.workKey, []);
        const now = new Date().toISOString();
        const id = work.id || `TW-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
        const next = { ...work, id, updatedAt: now };
        const idx = rows.findIndex(r => r.id === id);
        if (idx >= 0)
            rows[idx] = next;
        else
            rows.push(next);
        this.save(this.workKey, rows);
        return next;
    }
    async removeWork(id) {
        const rows = this.load(this.workKey, []);
        this.save(this.workKey, rows.filter(r => r.id !== id));
    }
}
export const scheduleRepo = new LocalScheduleRepo();
