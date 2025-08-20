class LocalReservationsRepo {
    constructor() {
        this.key = 'local-reservations';
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
    async get(id) { return this.load().find(r => r.id === id) || null; }
    async create(draft) {
        const rows = this.load();
        const obj = { id: `RSV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...draft };
        rows.unshift(obj);
        this.save(rows);
        return obj;
    }
    async update(id, patch) {
        const rows = this.load();
        const idx = rows.findIndex(r => r.id === id);
        if (idx < 0)
            return;
        rows[idx] = { ...rows[idx], ...patch, updatedAt: new Date().toISOString() };
        this.save(rows);
    }
}
export const reservationsRepo = new LocalReservationsRepo();
