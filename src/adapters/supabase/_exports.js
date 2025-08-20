export { orderRepo } from './orders';
// 暫以 local auth 供路由保護使用；等 Supabase Auth 接上後再切換
export { authRepo } from '../local/auth';
// 產品暫走本地，確保可用「自訂」選項與列表
export { productRepo } from '../local/products';
// 後續逐步補上：technicians, staff, members, schedule, ...
