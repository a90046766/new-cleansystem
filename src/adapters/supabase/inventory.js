import { supabase } from '../../utils/supabase';
function toDbRow(item) {
    const r = { ...item };
    const map = {
        productId: 'product_id',
        imageUrls: 'image_urls',
        safeStock: 'safe_stock',
    };
    for (const [camel, snake] of Object.entries(map)) {
        if (camel in r)
            r[snake] = r[camel];
    }
    return r;
}
function fromDbRow(row) {
    const r = row || {};
    return {
        id: r.id,
        name: r.name || '',
        productId: r.product_id ?? r.productId,
        quantity: r.quantity ?? 0,
        description: r.description || '',
        imageUrls: r.image_urls ?? r.imageUrls ?? [],
        safeStock: r.safe_stock ?? r.safeStock,
        updatedAt: r.updated_at ?? new Date().toISOString(),
    };
}
class SupabaseInventoryRepo {
    async list() {
        const { data, error } = await supabase.from('inventory').select('*').order('updated_at', { ascending: false });
        if (error)
            throw error;
        return (data || []).map(fromDbRow);
    }
    async upsert(item) {
        const now = new Date().toISOString();
        const row = { ...toDbRow(item), updated_at: now };
        if (!row.id || row.id === '') {
            row.id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `${Date.now()}`;
        }
        const { data, error } = await supabase.from('inventory').upsert(row).select().single();
        if (error)
            throw error;
        return fromDbRow(data);
    }
    async remove(id) {
        const { error } = await supabase.from('inventory').delete().eq('id', id);
        if (error)
            throw error;
    }
}
export const inventoryRepo = new SupabaseInventoryRepo();
