const USE_SUPABASE = String(import.meta.env.VITE_USE_SUPABASE || '0') === '1'

export async function loadAdapters() {
  if (USE_SUPABASE) {
    const a = await import('./supabase/_exports')
    // bootstrap：若雲端沒有產品，先上傳 4 樣預設產品（不使用固定 id，避免衝突）
    try {
      const list = await a.productRepo.list()
      if (!list || list.length === 0) {
        await a.productRepo.upsert({ id: '', name: '分離式冷氣清洗', unitPrice: 1800, groupPrice: 1600, groupMinQty: 2, description: '室內外機標準清洗，包含濾網、蒸發器、冷凝器清潔', imageUrls: [], safeStock: 20 } as any)
        await a.productRepo.upsert({ id: '', name: '洗衣機清洗（滾筒）', unitPrice: 1999, groupPrice: 1799, groupMinQty: 2, description: '滾筒式洗衣機拆洗保養，包含內筒、外筒、管路清潔', imageUrls: [], safeStock: 20 } as any)
        await a.productRepo.upsert({ id: '', name: '倒T型抽油煙機清洗', unitPrice: 2200, groupPrice: 2000, groupMinQty: 2, description: '不鏽鋼倒T型抽油煙機，包含內部機械清洗', imageUrls: [], safeStock: 20 } as any)
        await a.productRepo.upsert({ id: '', name: '傳統雙渦輪抽油煙機清洗', unitPrice: 1800, groupPrice: 1600, groupMinQty: 2, description: '傳統型雙渦輪抽油煙機清洗保養', imageUrls: [], safeStock: 20 } as any)
      }
    } catch {}
    return a
  } else {
    return await import('./local/_exports')
  }
}


