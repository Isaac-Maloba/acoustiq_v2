// src/pages/admin/AdminOrders.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiAdminGetOrders } from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import Loader from '../../components/Loader';

const AdminOrders = () => {
  const { user } = useAuth();

  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [buyerSearch, setBuyerSearch]   = useState(''); // buyer_id exact
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce buyer_id search to avoid rapid API calls
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(buyerSearch), 400);
    return () => clearTimeout(timer);
  }, [buyerSearch]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (debouncedSearch) filters.buyer_id = debouncedSearch;
      const res = await apiAdminGetOrders(user.user_id, filters);
      setOrders(res.data);
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, debouncedSearch]);

  const clearFilters = () => {
    setStatusFilter('');
    setBuyerSearch('');
  };

  const hasFilters = statusFilter || buyerSearch;

  const statusBadge = (status) => {
    switch (status) {
      case 'confirmed':  return 'badge-ice';
      case 'shipped':    return 'badge-gold';
      case 'delivered':  return 'badge-success';
      case 'cancelled':  return 'badge-error';
      default:           return 'badge-muted'; // pending
    }
  };

  const fmt = (n) => Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 });

  const content = () => {
    if (loading) return <div className="loader-wrapper"><Loader /></div>;
    if (error)   return <div className="alert alert-error">{error}</div>;

    if (orders.length === 0) {
      return (
        <div className="empty-state">
          <p>No orders found.</p>
          {hasFilters && (
            <button className="btn btn-ghost mt-2" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Buyer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.order_id}>
                <td className="text-ice">#{order.order_id}</td>
                <td className="col-primary">
                  <div className="admin-user-cell">
                    <div className="admin-user-avatar">
                      {order.first_name.charAt(0)}{order.last_name.charAt(0)}
                    </div>
                    <div>
                      <div className="admin-user-name">
                        {order.first_name} {order.last_name}
                      </div>
                      <div className="admin-user-email">{order.email}</div>
                    </div>
                  </div>
                </td>
                <td>KES {fmt(order.total_amount)}</td>
                <td>
                  <span className={`badge ${statusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="text-muted" style={{ fontSize: '13px' }}>
                  {new Date(order.created_at).toLocaleDateString('en-KE')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <AdminLayout
      title="Orders"
      subtitle="View all platform orders"
    >
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Order List</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filters */}
        <div className="admin-filter-bar">
          <div className="admin-search-wrapper">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by buyer ID..."
              className="admin-search-input"
              value={buyerSearch}
              onChange={(e) => setBuyerSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {hasFilters && (
            <button
              className="btn btn-ghost"
              style={{ fontSize: '12px', padding: '5px 10px' }}
              onClick={clearFilters}
            >
              Clear
            </button>
          )}
        </div>

        {content()}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;