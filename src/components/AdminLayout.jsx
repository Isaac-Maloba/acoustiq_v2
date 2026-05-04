import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Admin.css';

// ── NAV ITEMS ─────────────────────────────────────────────
const NAV_ITEMS = [
    {
        section: 'Overview',
        items: [
            { to: '/admin/dashboard',     label: 'Dashboard',     icon: '▦' },
        ]
    },
    {
        section: 'Manage',
        items: [
            { to: '/admin/applications',  label: 'Applications',  icon: '◈', alertKey: 'pendingApplications' },
            { to: '/admin/users',         label: 'Users',         icon: '◉' },
            { to: '/admin/stores',        label: 'Stores',        icon: '⬡' },
            { to: '/admin/orders',        label: 'Orders',        icon: '◎' },
            { to: '/admin/complaints',    label: 'Complaints',    icon: '◬', alertKey: 'openComplaints' },
        ]
    }
];

// ── COMPONENT ─────────────────────────────────────────────
const AdminLayout = ({ title, subtitle, children, alerts = {} }) => {
    const { user }   = useAuth();
    const { pathname } = useLocation();

    return (
        <div className="page-wrapper" style={{ padding: '32px 24px' }}>
            <div className="admin-page">

                {/* ── SIDEBAR ── */}
                <aside className="admin-sidebar">

                    <div className="admin-sidebar-header">
                        <span className="admin-sidebar-icon">⬡</span>
                        <div>
                            <p className="admin-sidebar-title">Admin Panel</p>
                            <p className="admin-sidebar-sub">{user?.first_name} {user?.last_name}</p>
                        </div>
                    </div>

                    {NAV_ITEMS.map(({ section, items }) => (
                        <div key={section}>
                            <p className="admin-nav-section-label">{section}</p>
                            {items.map(({ to, label, icon, alertKey }) => {
                                const isActive  = pathname === to;
                                const hasAlert  = alertKey && alerts[alertKey] > 0;
                                return (
                                    <Link
                                        key={to}
                                        to={to}
                                        className={`admin-nav-item${isActive ? ' active' : ''}`}
                                    >
                                        <span className="admin-nav-item-left">
                                            <span style={{ fontSize: '14px', lineHeight: 1 }}>{icon}</span>
                                            {label}
                                        </span>
                                        {hasAlert && <span className="admin-nav-dot" />}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}

                </aside>

                {/* ── MAIN ── */}
                <main className="admin-main">
                    <h1 className="admin-page-title">{title}</h1>
                    {subtitle && <p className="admin-page-sub">{subtitle}</p>}
                    {children}
                </main>

            </div>
        </div>
    );
};

export default AdminLayout;