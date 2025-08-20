class LocalNotificationRepo {
    constructor() {
        this.itemsKey = 'local-notifications';
        this.readsKey = 'local-notification-reads';
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
    async listForUser(user) {
        const all = this.load(this.itemsKey, this.getInitial());
        const reads = this.load(this.readsKey, {}); // id -> [emails]
        const filtered = all.filter(n => n.target === 'all' ||
            (n.target === 'user' && n.targetUserEmail?.toLowerCase() === user.email.toLowerCase()) ||
            (n.target === user.role));
        const unread = {};
        for (const it of filtered)
            unread[it.id] = !(reads[it.id] || []).includes(user.email);
        return { items: filtered, unreadIds: unread };
    }
    async markRead(user, id) {
        const reads = this.load(this.readsKey, {});
        const arr = new Set(reads[id] || []);
        arr.add(user.email);
        reads[id] = Array.from(arr);
        this.save(this.readsKey, reads);
    }
    async push(payload) {
        const all = this.load(this.itemsKey, this.getInitial());
        const now = new Date().toISOString();
        const item = {
            id: `NTF-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
            createdAt: now,
            sentAt: payload.sentAt || now,
            ...payload,
        };
        this.save(this.itemsKey, [item, ...all]);
        return item;
    }
    getInitial() {
        const now = new Date().toISOString();
        return [
            {
                id: 'NTF-WELCOME',
                title: '歡迎使用洗濯派工系統（本機重構）',
                body: '這裡會顯示站內通知與未讀徽章。',
                level: 'info',
                target: 'all',
                createdAt: now,
                sentAt: now,
            },
        ];
    }
}
export const notificationRepo = new LocalNotificationRepo();
