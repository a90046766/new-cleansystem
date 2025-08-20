class LocalCustomerRepo {
    constructor() {
        this.key = 'local-customers';
    }
    load() {
        try {
            const saved = localStorage.getItem(this.key);
            return saved ? JSON.parse(saved) : [];
        }
        catch {
            return [];
        }
    }
    save(rows) { localStorage.setItem(this.key, JSON.stringify(rows)); }
    async list() { return this.load(); }
    async get(id) { return this.load().find(c => c.id === id) || null; }
    async upsert(customer) {
        const rows = this.load();
        const now = new Date().toISOString();
        const id = customer.id || `CUS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const next = { ...customer, id, updatedAt: now };
        const idx = rows.findIndex(r => r.id === id);
        if (idx >= 0)
            rows[idx] = next;
        else
            rows.unshift(next);
        this.save(rows);
        return next;
    }
    async remove(id) { this.save(this.load().filter(r => r.id !== id)); }
}
export const customerRepo = new LocalCustomerRepo();
