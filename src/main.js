import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles.css';
// 頁面
import LoginPage from './ui/pages/Login';
import TechnicianApplyPage from './ui/pages/TechnicianApply';
import StaffApplyPage from './ui/pages/StaffApply';
import MemberApplyPage from './ui/pages/MemberApply';
import ApprovalsPage from './ui/pages/Approvals';
import AppShell from './ui/AppShell';
import PageDispatchHome from './ui/pages/DispatchHome';
import PageOrderDetail from './ui/pages/OrderDetail';
import PageProfile from './ui/pages/Profile';
import ResetPasswordPage from './ui/pages/ResetPassword';
import NotificationsPage from './ui/pages/Notifications';
import TechnicianSchedulePage from './ui/pages/TechnicianSchedule';
import MemberRegisterPage from './ui/pages/MemberRegister';
import ProductsPage from './ui/pages/Products';
import InventoryPage from './ui/pages/Inventory';
import TechnicianManagementPage from './ui/pages/TechnicianManagement';
import PromotionsPage from './ui/pages/Promotions';
import OrderManagementPage from './ui/pages/OrderManagement';
import ReservationsPage from './ui/pages/Reservations';
import StaffManagementPage from './ui/pages/StaffManagement';
import DocumentsPage from './ui/pages/Documents';
import ModelsPage from './ui/pages/Models';
import MembersPage from './ui/pages/Members';
import CustomersPage from './ui/pages/Customers';
import PayrollPage from './ui/pages/Payroll';
import ReportsPage from './ui/pages/Reports';
// 權限保護
import { loadAdapters } from './adapters/index';
import { can } from './utils/permissions';
let authRepo;
function PrivateRoute({ children, permission }) {
    const user = authRepo?.getCurrentUser?.();
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    if (permission && !can(user, permission)) {
        return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-[#F5F7FB] p-4", children: _jsxs("div", { className: "rounded-2xl bg-white p-6 shadow-card text-center", children: [_jsx("h1", { className: "text-xl font-bold text-gray-900", children: "\u6B0A\u9650\u4E0D\u8DB3" }), _jsx("p", { className: "mt-2 text-gray-600", children: "\u60A8\u6C92\u6709\u6B0A\u9650\u8A2A\u554F\u6B64\u9801\u9762" }), _jsx("button", { onClick: () => window.history.back(), className: "mt-4 rounded-xl bg-brand-500 px-4 py-2 text-white", children: "\u8FD4\u56DE" })] }) }));
    }
    return _jsx(_Fragment, { children: children });
}
;
(async () => {
    const a = await loadAdapters();
    authRepo = a.authRepo;
    createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/reset-password", element: _jsx(ResetPasswordPage, {}) }), _jsx(Route, { path: "/apply/technician", element: _jsx(TechnicianApplyPage, {}) }), _jsx(Route, { path: "/apply/staff", element: _jsx(StaffApplyPage, {}) }), _jsx(Route, { path: "/apply/member", element: _jsx(MemberApplyPage, {}) }), _jsx(Route, { path: "/register/member", element: _jsx(MemberRegisterPage, {}) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dispatch", replace: true }) }), _jsxs(Route, { element: _jsx(PrivateRoute, { children: _jsx(AppShell, {}) }), children: [_jsx(Route, { path: "/dispatch", element: _jsx(PrivateRoute, { children: _jsx(PageDispatchHome, {}) }) }), _jsx(Route, { path: "/orders/:id", element: _jsx(PrivateRoute, { permission: "orders.read", children: _jsx(PageOrderDetail, {}) }) }), _jsx(Route, { path: "/approvals", element: _jsx(PrivateRoute, { permission: "approvals.manage", children: _jsx(ApprovalsPage, {}) }) }), _jsx(Route, { path: "/notifications", element: _jsx(PrivateRoute, { children: _jsx(NotificationsPage, {}) }) }), _jsx(Route, { path: "/schedule", element: _jsx(PrivateRoute, { permission: "technicians.schedule.view", children: _jsx(TechnicianSchedulePage, {}) }) }), _jsx(Route, { path: "/products", element: _jsx(PrivateRoute, { permission: "products.manage", children: _jsx(ProductsPage, {}) }) }), _jsx(Route, { path: "/inventory", element: _jsx(PrivateRoute, { permission: "inventory.manage", children: _jsx(InventoryPage, {}) }) }), _jsx(Route, { path: "/orders", element: _jsx(PrivateRoute, { permission: "orders.list", children: _jsx(OrderManagementPage, {}) }) }), _jsx(Route, { path: "/reservations", element: _jsx(PrivateRoute, { permission: "reservations.manage", children: _jsx(ReservationsPage, {}) }) }), _jsx(Route, { path: "/staff", element: _jsx(PrivateRoute, { permission: "staff.manage", children: _jsx(StaffManagementPage, {}) }) }), _jsx(Route, { path: "/technicians", element: _jsx(PrivateRoute, { permission: "technicians.manage", children: _jsx(TechnicianManagementPage, {}) }) }), _jsx(Route, { path: "/promotions", element: _jsx(PrivateRoute, { permission: "promotions.manage", children: _jsx(PromotionsPage, {}) }) }), _jsx(Route, { path: "/documents", element: _jsx(PrivateRoute, { permission: "documents.manage", children: _jsx(DocumentsPage, {}) }) }), _jsx(Route, { path: "/models", element: _jsx(PrivateRoute, { permission: "models.manage", children: _jsx(ModelsPage, {}) }) }), _jsx(Route, { path: "/members", element: _jsx(PrivateRoute, { permission: "customers.manage", children: _jsx(MembersPage, {}) }) }), _jsx(Route, { path: "/customers", element: _jsx(PrivateRoute, { permission: "customers.manage", children: _jsx(CustomersPage, {}) }) }), _jsx(Route, { path: "/payroll", element: _jsx(PrivateRoute, { permission: "payroll.view", children: _jsx(PayrollPage, {}) }) }), _jsx(Route, { path: "/reports", element: _jsx(PrivateRoute, { permission: "reports.view", children: _jsx(ReportsPage, {}) }) }), _jsx(Route, { path: "/me", element: _jsx(PrivateRoute, { children: _jsx(PageProfile, {}) }) })] })] }) }) }));
})();
