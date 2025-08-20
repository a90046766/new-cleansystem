class LocalProductRepo {
    constructor() {
        this.storageKey = 'local-products-data';
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
                id: 'P-AC-CLEAN',
                name: '分離式冷氣清洗',
                unitPrice: 1800,
                groupPrice: 1600,
                groupMinQty: 2,
                description: '室內外機標準清洗，包含濾網、蒸發器、冷凝器清潔',
                imageUrls: [],
                updatedAt: new Date().toISOString()
            },
            {
                id: 'P-WASH-CLEAN',
                name: '洗衣機清洗（滾筒）',
                unitPrice: 1999,
                groupPrice: 1799,
                groupMinQty: 2,
                description: '滾筒式洗衣機拆洗保養，包含內筒、外筒、管路清潔',
                imageUrls: [],
                updatedAt: new Date().toISOString()
            },
            {
                id: 'P-HOOD-T',
                name: '倒T型抽油煙機清洗',
                unitPrice: 2200,
                groupPrice: 2000,
                groupMinQty: 2,
                description: '不鏽鋼倒T型抽油煙機，包含內部機械清洗',
                imageUrls: [],
                updatedAt: new Date().toISOString()
            },
            {
                id: 'P-HOOD-TRAD',
                name: '傳統雙渦輪抽油煙機清洗',
                unitPrice: 1800,
                groupPrice: 1600,
                groupMinQty: 2,
                description: '傳統型雙渦輪抽油煙機清洗保養',
                imageUrls: [],
                updatedAt: new Date().toISOString()
            }
        ];
    }
    async list() {
        return this.loadData();
    }
    async upsert(product) {
        const data = this.loadData();
        const existing = data.find(p => p.id === product.id);
        const now = new Date().toISOString();
        if (existing) {
            // 更新現有
            const updated = { ...existing, ...product, updatedAt: now };
            const newData = data.map(p => p.id === product.id ? updated : p);
            this.saveData(newData);
            return updated;
        }
        else {
            // 新增
            const newProduct = { ...product, updatedAt: now };
            this.saveData([...data, newProduct]);
            return newProduct;
        }
    }
    async remove(id) {
        const data = this.loadData();
        this.saveData(data.filter(p => p.id !== id));
    }
}
export const productRepo = new LocalProductRepo();
