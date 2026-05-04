import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiAdminStats } from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import Loader from '../../components/Loader';

const AdminDashboard = () => {
    const { user } = useAuth();

    const [stats,   setStats]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiAdminStats(user.user_id);
                setStats(res.data);
            } catch {
                setError('Failed to load dashboard stats.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user.user_id]);

    const fmt = (n) => Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 });

    if (loading) return (
        <AdminLayout title="Dashboard">
            <div className="loader-wrapper"><Loader /></div>
        </AdminLayout>
    );

    if (error) return (
        <AdminLayout title="Dashboard">
            <div className="alert alert-error">{error}</div>
        </AdminLayout>
    );

    const alerts = {
        pendingApplications: stats.pending_applications,
        openComplaints:      stats.open_complaints,
    };

    return (
        <AdminLayout
            title="Dashboard"
            subtitle={`Platform overview — welcome back, ${user.first_name}`}
            alerts={alerts}
        >
            {/* ── STAT CARDS ── */}
            <div className="admin-stats-grid">

                <div className="admin-stat-card">
                    <p className="admin-stat-label">Total Users</p>
                    <p className="admin-stat-value">{fmt(stats.users.total)}</p>
                    <p className="admin-stat-sub">{fmt(stats.users.sellers)} sellers</p>
                    <Link to="/admin/users" className="admin-stat-link">Manage users →</Link>
                </div>

                <div className="admin-stat-card">
                    <p className="admin-stat-label">Total Orders</p>
                    <p className="admin-stat-value">{fmt(stats.orders.total)}</p>
                    <p className="admin-stat-sub">KES {fmt(stats.orders.revenue)} revenue</p>
                    <Link to="/admin/orders" className="admin-stat-link">View orders →</Link>
                </div>

                <div className="admin-stat-card">
                    <p className="admin-stat-label">Active Stores</p>
                    <p className="admin-stat-value">{fmt(stats.total_stores)}</p>
                    <p className="admin-stat-sub">Live seller storefronts</p>
                    <Link to="/admin/stores" className="admin-stat-link">Manage stores →</Link>
                </div>

                <div className="admin-stat-card">
                    <p className="admin-stat-label">Pending Applications</p>
                    <p className="admin-stat-value text-gold">{fmt(stats.pending_applications)}</p>
                    <p className="admin-stat-sub">Awaiting your review</p>
                    <Link to="/admin/applications" className="admin-stat-link">Review now →</Link>
                </div>

                <div className="admin-stat-card">
                    <p className="admin-stat-label">Open Complaints</p>
                    <p className="admin-stat-value text-error">{fmt(stats.open_complaints)}</p>
                    <p className="admin-stat-sub">Unresolved disputes</p>
                    <Link to="/admin/complaints" className="admin-stat-link">View complaints →</Link>
                </div>

            </div>

            {/* ── RECENT ORDERS ── */}
            <div className="admin-section">
                <div className="admin-section-header">
                    <h2 className="admin-section-title">Recent Orders</h2>
                    <Link to="/admin/orders" className="btn btn-ghost" style={{ fontSize: '13px' }}>
                        View all →
                    </Link>
                </div>

                {stats.recent_orders.length === 0 ? (
                    <p className="admin-empty" style={{ padding: '20px' }}>No orders yet.</p>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Buyer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent_orders.map(order => (
                                    <tr key={order.order_id}>
                                        <td className="text-ice">#{order.order_id}</td>
                                        <td className="col-primary">{order.first_name} {order.last_name}</td>
                                        <td>KES {fmt(order.total_amount)}</td>
                                        <td>
                                            <span className={`badge ${statusBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="text-muted">
                                            {new Date(order.created_at).toLocaleDateString('en-KE')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </AdminLayout>
    );
};

const statusBadge = (status) => {
    switch (status) {
        case 'confirmed':  return 'badge-ice';
        case 'shipped':    return 'badge-gold';
        case 'delivered':  return 'badge-success';
        case 'cancelled':  return 'badge-error';
        default:           return 'badge-muted';
    }
};

export default AdminDashboard;