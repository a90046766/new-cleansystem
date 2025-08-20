import { supabase } from '../../utils/supabase';
class SupabaseOrderRepo {
    async list() {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return (data || []);
    }
    async get(id) {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            // PGRST116: No rows found
            if (error.code === 'PGRST116')
                return null;
            throw error;
        }
        return data || null;
    }
    async create(draft) {
        const row = {
            ...draft,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const { data, error } = await supabase.from('orders').insert(row).select().single();
        if (error)
            throw error;
        return data;
    }
    async update(id, patch) {
        const row = { ...patch, updated_at: new Date().toISOString() };
        const { error } = await supabase.from('orders').update(row).eq('id', id);
        if (error)
            throw error;
    }
    async delete(id, reason) {
        // 僅允許刪除草稿；否則請使用 cancel
        const { data, error } = await supabase.from('orders').select('status').eq('id', id).single();
        if (error)
            throw error;
        if (!data)
            throw new Error('訂單不存在');
        if (data.status !== 'draft')
            throw new Error('僅草稿可刪除');
        const { error: e2 } = await supabase.from('orders').delete().eq('id', id);
        if (e2)
            throw e2;
    }
    async cancel(id, reason) {
        const { error } = await supabase.from('orders').update({ status: 'canceled', canceled_reason: reason, updated_at: new Date().toISOString() }).eq('id', id);
        if (error)
            throw error;
    }
    async confirm(id) {
        const { error } = await supabase.from('orders').update({ status: 'confirmed', updated_at: new Date().toISOString() }).eq('id', id);
        if (error)
            throw error;
    }
    async startWork(id, at) {
        const { error } = await supabase.from('orders').update({ status: 'in_progress', work_started_at: at, updated_at: new Date().toISOString() }).eq('id', id);
        if (error)
            throw error;
    }
    async finishWork(id, at) {
        const { error } = await supabase.from('orders').update({ status: 'completed', work_completed_at: at, service_finished_at: at, updated_at: new Date().toISOString() }).eq('id', id);
        if (error)
            throw error;
    }
}
export const orderRepo = new SupabaseOrderRepo();
