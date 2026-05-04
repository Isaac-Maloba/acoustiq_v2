// src/pages/seller/SellerOrders.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiSellerOrders, apiUpdateOrderStatus } from '../../utils/api';
import SellerLayout from '../../components/SellerLayout';
import Loader from '../../components/Loader';

const SellerOrders = () => {
  const { user } = useAuth();

  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' = all
  const [actionInProgress, setActionInProgress] = useState(null); // order_id

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiSellerOrders(user.user_id, statusFilter);
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
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    const formData = new FormData();
    formData.append('user_id', user.user_id);
    formData.append('status', newStatus);

    setActionInProgress(orderId);
    try {
      await apiUpdateOrderStatus(orderId, formData);
      // Optimistic update locally
      setOrders(prev =>
        prev.map(order =>
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setActionInProgress(null);
    }
  };

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

  const allowedNextStatuses = (currentStatus) => {
    // Seller can move from confirmed -> shipped -> delivered
    // Cannot change if cancelled or delivered
    const flow = {
      pending:   ['confirmed'],
      confirmed: ['shipped'],
      shipped:   ['delivered'],
      delivered: [],
      cancelled: [],
    };
    return flow[currentStatus] || [];
  };

  const content = () => {
    if (loading) return <div className="loader-wrapper"><Loader /></div>;
    if (error)   return <div className="alert alert-error">{error}</div>;

    if (orders.length === 0) {
      return (
        <div className="empty-state" style={{ padding: '30px' }}>
          <p>No orders found.</p>
          {statusFilter && (
            <button className="btn btn-ghost mt-2" onClick={() => setStatusFilter('')}>
              Show all orders
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="seller-table-wrapper">
        <table className="seller-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Buyer</th>
              <th>Your Total</th>
              <th>Order Status</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.order_id}>
                <td className="text-ice">#{order.order_id}</td>
                <td>{order.first_name} {order.last_name}</td>
                <td>KES {fmt(order.seller_total)}</td>
                <td>
                  <span className={`badge ${statusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="text-muted" style={{ fontSize: '13px' }}>
                  {new Date(order.created_at).toLocaleDateString('en-KE')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="seller-row-actions" style={{ justifyContent: 'flex-end' }}>
                    {/* Status update dropdown */}
                    {allowedNextStatuses(order.status).length > 0 && (
                      <select
                        className="admin-filter-select"
                        style={{ fontSize: '12px', padding: '4px 8px', minWidth: '100px' }}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                        disabled={actionInProgress === order.order_id}
                      >
                        <option value={order.status} disabled>
                          {order.status}
                        </option>
                        {allowedNextStatuses(order.status).map(next => (
                          <option key={next} value={next}>{next}</option>
                        ))}
                      </select>
                    )}
                    {/* If no further actions, show nothing */}
                    {allowedNextStatuses(order.status).length === 0 && (
                      <span className="text-faint" style={{ fontSize: '12px' }}>Final</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <SellerLayout title="Orders" subtitle="Orders containing your products" storeName={user?.first_name || 'Seller'}>
      <div className="seller-section">
        <div className="seller-section-header">
          <h2 className="seller-section-title">Order List</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Filter:</span>
            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {content()}
      </div>
    </SellerLayout>
  );
};

export default SellerOrders;