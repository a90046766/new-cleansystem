import { supabase } from '../../utils/supabase';
function toDbRow(input) {
    if (!input)
        return {};
    const row = { ...input };
    // 雙寫 camelCase 與 snake_case，兼容不同建表命名
    const map = {
        customerName: 'customer_name',
        customerPhone: 'customer_phone',
        customerAddress: 'customer_address',
        preferredDate: 'preferred_date',
        preferredTimeStart: 'preferred_time_start',
        preferredTimeEnd: 'preferred_time_end',
        referrerCode: 'referrer_code',
        memberId: 'member_id',
        assignedTechnicians: 'assigned_technicians',
        serviceItems: 'service_items',
        signatures: 'signatures',
        photos: 'photos',
        photosBefore: 'photos_before',
        photosAfter: 'photos_after',
        paymentMethod: 'payment_method',
        paymentStatus: 'payment_status',
        pointsUsed: 'points_used',
        pointsDeductAmount: 'points_deduct_amount',
        workStartedAt: 'work_started_at',
        workCompletedAt: 'work_completed_at',
        serviceFinishedAt: 'service_finished_at',
    };
    for (const [camel, snake] of Object.entries(map)) {
        if (camel in row)
            row[snake] = row[camel];
    }
    return row;
}
function fromDbRow(row) {
    const r = row || {};
    const pick = (a, b) => (r[a] ?? r[b]);
    return {
        id: r.id,
        memberId: pick('memberId', 'member_id'),
        customerName: pick('customerName', 'customer_name') || '',
        customerPhone: pick('customerPhone', 'customer_phone') || '',
        customerAddress: pick('customerAddress', 'customer_address') || '',
        preferredDate: pick('preferredDate', 'preferred_date') || '',
        preferredTimeStart: pick('preferredTimeStart', 'preferred_time_start') || '09:00',
        preferredTimeEnd: pick('preferredTimeEnd', 'preferred_time_end') || '12:00',
        referrerCode: pick('referrerCode', 'referrer_code') || '',
        paymentMethod: pick('paymentMethod', 'payment_method'),
        paymentStatus: pick('paymentStatus', 'payment_status'),
        pointsUsed: pick('pointsUsed', 'points_used') ?? 0,
        pointsDeductAmount: pick('pointsDeductAmount', 'points_deduct_amount') ?? 0,
        serviceItems: pick('serviceItems', 'service_items') || [],
        assignedTechnicians: pick('assignedTechnicians', 'assigned_technicians') || [],
        signatureTechnician: r.signatureTechnician,
        status: r.status || 'draft',
        platform: r.platform || '日',
        photos: r.photos || [],
        photosBefore: pick('photosBefore', 'photos_before') || [],
        photosAfter: pick('photosAfter', 'photos_after') || [],
        signatures: r.signatures || {},
        workStartedAt: pick('workStartedAt', 'work_started_at'),
        workCompletedAt: pick('workCompletedAt', 'work_completed_at'),
        serviceFinishedAt: pick('serviceFinishedAt', 'service_finished_at'),
        canceledReason: pick('canceledReason', 'canceled_reason'),
        closedAt: pick('closedAt', 'closed_at'),
        createdAt: pick('createdAt', 'created_at') || new Date().toISOString(),
        updatedAt: pick('updatedAt', 'updated_at') || new Date().toISOString(),
    };
}
class SupabaseOrderRepo {
    async list() {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return (data || []).map(fromDbRow);
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
        return data ? fromDbRow(data) : null;
    }
    async create(draft) {
        const now = new Date().toISOString();
        const row = { ...toDbRow(draft), created_at: now, updated_at: now };
        const { data, error } = await supabase.from('orders').insert(row).select().single();
        if (error)
            throw error;
        return fromDbRow(data);
    }
    async update(id, patch) {
        const row = { ...toDbRow(patch), updated_at: new Date().toISOString() };
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
