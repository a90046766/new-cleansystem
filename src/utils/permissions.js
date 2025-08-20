// 角色權限矩陣
const ROLE_PERMISSIONS = {
    admin: [
        'dashboard.view',
        'orders.list', 'orders.read', 'orders.create', 'orders.update', 'orders.delete', 'orders.cancel',
        'reservations.manage',
        'customers.manage',
        'technicians.manage', 'technicians.schedule.view', 'technicians.schedule.edit',
        'support.schedule.view', 'support.schedule.edit',
        'staff.manage', 'staff.payroll.view', 'staff.payroll.edit', 'payroll.view', 'payroll.edit',
        'products.manage', 'inventory.manage',
        'promotions.manage', 'documents.manage', 'models.manage',
        'notifications.send', 'notifications.read',
        'approvals.manage',
        'schedule.view',
        'inventory.manage',
        'reports.view', 'reports.manage'
    ],
    support: [
        'dashboard.view',
        'orders.list', 'orders.read', 'orders.create', 'orders.update', 'orders.cancel',
        'reservations.manage',
        'customers.manage',
        'technicians.schedule.view',
        'support.schedule.view', 'support.schedule.edit',
        'staff.payroll.view', // 僅自己
        'payroll.view',
        'products.manage', 'inventory.manage',
        'promotions.manage', 'documents.manage', 'models.manage',
        'notifications.send', 'notifications.read',
        'approvals.manage',
        'schedule.view',
        'inventory.manage',
        'reports.view'
    ],
    sales: [
        'dashboard.view',
        'customers.manage',
        'promotions.manage', 'documents.manage', 'models.manage',
        'notifications.read',
        'schedule.view',
        'reports.view'
    ],
    technician: [
        'dashboard.view',
        'orders.list', 'orders.read', 'orders.update', // 僅負數調整與照片
        'technicians.schedule.view',
        'notifications.read',
        'schedule.view'
    ],
    member: [
        'notifications.read'
    ]
};
function loadOverrides() {
    try {
        const s = localStorage.getItem('local-permission-overrides');
        return s ? JSON.parse(s) : {};
    }
    catch {
        return {};
    }
}
function saveOverrides(map) { try {
    localStorage.setItem('local-permission-overrides', JSON.stringify(map));
}
catch { } }
export function getPermissionOverride(email) {
    const all = loadOverrides();
    return all[(email || '').toLowerCase()];
}
export function setPermissionOverride(email, override) {
    const all = loadOverrides();
    all[(email || '').toLowerCase()] = override;
    saveOverrides(all);
}
export function can(user, permission) {
    if (!user)
        return false;
    const base = ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
    const ov = getPermissionOverride(user.email || '');
    if (ov?.deny && ov.deny.includes(permission))
        return false;
    if (ov?.allow && ov.allow.includes(permission))
        return true;
    return base;
}
// 便利函數（向後兼容）
export const canViewDashboard = (role) => role ? can({ role }, 'dashboard.view') : false;
export const canViewOrders = (role) => role ? can({ role }, 'orders.list') : false;
export const canCreateOrders = (role) => role ? can({ role }, 'orders.create') : false;
export const canDeleteOrders = (role) => role ? can({ role }, 'orders.delete') : false;
export const canViewReservations = (role) => role ? can({ role }, 'reservations.manage') : false;
export const canViewCustomers = (role) => role ? can({ role }, 'customers.manage') : false;
export const canViewTechnicians = (role) => role ? can({ role }, 'technicians.manage') : false;
export const canViewSchedule = (role) => role ? can({ role }, 'technicians.schedule.view') : false;
export const canViewStaffManagement = (role) => role ? can({ role }, 'staff.manage') : false;
export const canViewProducts = (role) => role ? can({ role }, 'products.manage') : false;
export const canViewInventory = (role) => role ? can({ role }, 'inventory.manage') : false;
export const canViewPromotions = (role) => role ? can({ role }, 'promotions.manage') : false;
export const canManageNotifications = (role) => role ? can({ role }, 'notifications.send') : false;
export const canViewApprovals = (role) => role ? can({ role }, 'approvals.manage') : false;
