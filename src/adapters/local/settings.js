class LocalSettingsRepo {
    constructor() {
        this.key = 'local-app-settings';
    }
    load() {
        try {
            const s = localStorage.getItem(this.key);
            return s ? JSON.parse(s) : {};
        }
        catch {
            return {};
        }
    }
    save(obj) { localStorage.setItem(this.key, JSON.stringify(obj)); }
    async get() {
        const v = this.load();
        return {
            countdownEnabled: v.countdownEnabled ?? true,
            countdownMinutes: v.countdownMinutes ?? 20,
        };
    }
    async set(patch) {
        const cur = this.load();
        this.save({ ...cur, ...patch });
    }
}
export const settingsRepo = new LocalSettingsRepo();
