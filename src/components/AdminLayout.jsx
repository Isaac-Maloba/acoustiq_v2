import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiGrid, FiUsers, FiShoppingBag, FiFileText,
    FiStore, FiMessageSquare, FiShield
} from 'react-icons/fi';
import '../../css/Admin.css';

// ============================================================
//  ADMIN LAYOUT
//  Wraps all admin pages with a shared sidebar + main area.
//  Usage:
//    <AdminLayout title="Page Title" subtitle="optional sub">
//      {content}
//    </AdminLayout>
// ============================================================

const AdminLayout = ({ title, subtitle, children, pendingApplications = 0, openComplaints = 0 }) => {
    const { user }     = useAuth();
    const { pathname } = useLocation();

    const navItems = [
        {
            label:   'Dashboard',
            to:      '/admin/dashboard',
            icon:    <FiGrid size={15} />,
        },
        {
            label:   'Applications',
            to:      '/admin/applications',
            icon:    <FiFileText size={15} />,
            dot:     pendingApplications > 0,
        },
        {
            label:   'Users',
            to:      '/admin/users',
            icon:    <FiUsers size={15} />,
        },
        {
            label:   'Orders',
            to:      '/admin/orders',
            icon:    <FiShoppingBag size={15} />,
        },
        {
            label:   'Stores',
            to:      '/admin/stores',
            icon:    <FiStore size={15} />,
        },
        {
            label:   'Complaints',
            to:      '/admin/complaints',
            icon:    <FiMessageSquare size={15} />,
            dot:     openComplaints > 0,
        },
    ];

    return (
        <div className="page-wrapper">
            <div className="admin-page">

                {/* ── SIDEBAR ── */}
                <aside className="admin-sidebar">

                    <div className="admin-sidebar-header">
                        <FiShield size={18} className="admin-sidebar-icon" />
                        <div>
                            <p className="admin-sidebar-title">Admin Panel</p>
                            <p className="admin-sidebar-sub">{user?.first_name} {user?.last_name}</p>
                        </div>
                    </div>

                    <nav>
                        <p className="admin-nav-section-label">Management</p>
                        {navItems.map(item => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`admin-nav-item ${pathname === item.to ? 'active' : ''}`}
                            >
                                <span className="admin-nav-item-left">
                                    {item.icon}
                                    {item.label}
                                </span>
                                {item.dot && <span className="admin-nav-dot" />}
                            </Link>
                        ))}
                    </nav>

                </aside>

                {/* ── MAIN ── */}
                <main className="admin-main">
                    {(title || subtitle) && (
                        <div style={{ marginBottom: '24px' }}>
                            {title    && <h1 className="admin-page-title">{title}</h1>}
                            {subtitle && <p  className="admin-page-sub">{subtitle}</p>}
                        </div>
                    )}
                    {children}
                </main>

            </div>
        </div>
    );
};

export default AdminLayout;