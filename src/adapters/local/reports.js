class LocalReportsRepo {
    constructor() {
        this.key = 'local-reports';
    }
    load() {
        try {
            const s = localStorage.getItem(this.key);
            return s ? JSON.parse(s) : [];
        }
        catch {
            return [];
        }
    }
    save(rows) { localStorage.setItem(this.key, JSON.stringify(rows)); }
    async list() { return this.load(); }
    async get(id) { return this.load().find(t => t.id === id) || null; }
    async create(thread) {
        const rows = this.load();
        const now = new Date().toISOString();
        const obj = { id: `RPT-${Math.random().toString(36).slice(2, 9).toUpperCase()}`, createdAt: now, status: 'open', messages: thread.messages || [], ...thread };
        rows.unshift(obj);
        this.save(rows);
        return obj;
    }
    async appendMessage(id, msg) {
        const rows = this.load();
        const idx = rows.findIndex(r => r.id === id);
        if (idx < 0)
            return;
        const mm = rows[idx].messages || [];
        mm.push({ id: `MSG-${Math.random().toString(36).slice(2, 9)}`, createdAt: new Date().toISOString(), ...msg });
        rows[idx].messages = mm;
        this.save(rows);
    }
    async close(id) {
        const rows = this.load();
        const idx = rows.findIndex(r => r.id === id);
        if (idx < 0)
            return;
        rows[idx].status = 'closed';
        rows[idx].closedAt = new Date().toISOString();
        this.save(rows);
    }
    // 其他擴充：刪除回報串與刪除訊息
    async removeThread(id) {
        const rows = this.load();
        this.save(rows.filter(r => r.id !== id));
    }
    async removeMessage(threadId, messageId) {
        const rows = this.load();
        const idx = rows.findIndex(r => r.id === threadId);
        if (idx < 0)
            return;
        const mm = rows[idx].messages || [];
        rows[idx].messages = mm.filter(m => m.id !== messageId);
        this.save(rows);
    }
}
export const reportsRepo = new LocalReportsRepo();
