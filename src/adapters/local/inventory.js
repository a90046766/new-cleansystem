class LocalInventoryRepo {
    constructor() {
        this.key = 'local-inventory';
    }
    load() { try {
        const s = localStorage.getItem(this.key);
        return s ? JSON.parse(s) : [];
    }
    catch {
        return [];
    } }
    save(rows) { localStorage.setItem(this.key, JSON.stringify(rows)); }
    async list() { return this.load(); }
    async upsert(item) {
        const rows = this.load();
        const now = new Date().toISOString();
        const idx = rows.findIndex(r => r.id === item.id);
        if (idx >= 0) {
            rows[idx] = { ...rows[idx], ...item, updatedAt: now };
            this.save(rows);
            return rows[idx];
        }
        const id = item.id || `INV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const obj = { ...item, id, updatedAt: now };
        this.save([obj, ...rows]);
        return obj;
    }
    async remove(id) { this.save(this.load().filter(r => r.id !== id)); }
}
export const inventoryRepo = new LocalInventoryRepo();
