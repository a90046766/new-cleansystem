const USE_SUPABASE = String(import.meta.env.VITE_USE_SUPABASE || '0') === '1';
export async function loadAdapters() {
    if (USE_SUPABASE) {
        return await import('./supabase/_exports');
    }
    else {
        return await import('./local/_exports');
    }
}
