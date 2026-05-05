// src/pages/Orders.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPackage, FiChevronRight, FiArrowLeft, FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import {
  apiGetOrders,
  apiGetOrder,
  apiUpdateOrderStatus,
  apiCreateComplaint,
  imgUrl,
} from '../utils/api';
import Loader from '../components/Loader';
import '../css/Orders.css';

// ============================================================
//  HELPERS
// ============================================================
const statusClass = (status) =>
  `badge status-${status?.toLowerCase().replace(' ', '-')}`;

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatAmount = (n) =>
  `KES ${Number(n || 0).toLocaleString()}`;

// ============================================================
//  ORDER DETAIL VIEW (with cancel + complaint)
// ============================================================
const OrderDetail = ({ orderId, onBack, onOrderCancelled }) => {
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // ── COMPLAINT STATE ──
  const [showComplaint, setShowComplaint] = useState(false);
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);
  const [complaintMsg, setComplaintMsg] = useState('');
  const [complaintErr, setComplaintErr] = useState('');

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGetOrder(orderId, user.user_id);
      setOrder(res.data);
    } catch {
      setError('Could not load order details.');
    } finally {
      setLoading(false);
    }
  }, [orderId, user.user_id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;

    setCancelling(true);
    setCancelError('');

    const formData = new FormData();
    formData.append('user_id', user.user_id);
    formData.append('status', 'cancelled');

    try {
      await apiUpdateOrderStatus(orderId, formData);
      if (onOrderCancelled) onOrderCancelled(orderId);
      onBack();
    } catch (err) {
      setCancelError(
        err.response?.data?.message || 'Failed to cancel order. Please try again.'
      );
    } finally {
      setCancelling(false);
    }
  };

  // ── COMPLAINT HANDLER ──
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDesc.trim()) {
      setComplaintErr('Please provide both a subject and description.');
      return;
    }

    setComplaintSubmitting(true);
    setComplaintErr('');
    setComplaintMsg('');

    const formData = new FormData();
    formData.append('user_id', user.user_id);
    formData.append('order_id', orderId);
    formData.append('subject', complaintSubject.trim());
    formData.append('description', complaintDesc.trim());

    try {
      await apiCreateComplaint(formData);
      setComplaintMsg('Complaint submitted successfully. An admin will review it.');
      setComplaintSubject('');
      setComplaintDesc('');
    } catch (err) {
      setComplaintErr(
        err.response?.data?.message || 'Failed to submit complaint. Please try again.'
      );
    } finally {
      setComplaintSubmitting(false);
    }
  };

  if (loading) return <div className="loader-wrapper"><Loader /></div>;
  if (error)   return <div className="alert alert-error">{error}</div>;
  if (!order)  return null;

  const isPending = order.status === 'pending';
  const canComplain = order.status !== 'cancelled'; // allow complaints on other statuses
  const subtotal = order.items?.reduce((s, i) => s + Number(i.subtotal || 0), 0) ?? 0;

  return (
    <div>
      <button className="order-detail-back" onClick={onBack}>
        <FiArrowLeft size={14} /> Back to orders
      </button>

      <div className="order-detail-header">
        <div>
          <h1 className="order-detail-title">Order #{order.order_id}</h1>
          <p className="order-detail-date">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <span className={`${statusClass(order.status)}`}>
          {order.status}
        </span>
      </div>

      {cancelError && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          {cancelError}
        </div>
      )}

      {/* ── ITEMS ── */}
      <div className="order-section">
        <p className="order-section-title">Items</p>
        {order.items?.map((item, i) => (
          <div key={i} className="order-detail-item">
            <img
              src={imgUrl(item.product_photo)}
              alt={item.product_name}
              className="order-detail-item-img"
              onError={(e) => { e.target.src = '/placeholder.png'; }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="order-detail-item-name">{item.product_name}</p>
              <p className="order-detail-item-meta">
                Qty: {item.quantity} · {item.store_name || 'Acoustiq'}
              </p>
            </div>
            <p className="order-detail-item-price">
              {formatAmount(item.subtotal)}
            </p>
          </div>
        ))}
      </div>

      {/* ── PAYMENT SUMMARY ── */}
      <div className="order-section">
        <p className="order-section-title">Payment Summary</p>
        <div className="order-summary-row">
          <span className="order-summary-label">Subtotal</span>
          <span className="order-summary-value">{formatAmount(subtotal)}</span>
        </div>
        <div className="order-summary-row">
          <span className="order-summary-label">M‑Pesa Receipt</span>
          <span className="order-summary-value">
            {order.mpesa_receipt || 'Pending'}
          </span>
        </div>
        <div className="order-summary-row">
          <span className="order-summary-label">Delivery Address</span>
          <span className="order-summary-value">
            {order.delivery_address || '—'}
          </span>
        </div>
        <div className="order-summary-row total">
          <span>Total Paid</span>
          <span>{formatAmount(order.total_amount)}</span>
        </div>
      </div>

      {/* ── ACTIONS ROW: Cancel + Complaint ── */}
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {canComplain && (
          <button
            className="btn btn-ghost"
            onClick={() => setShowComplaint(!showComplaint)}
            style={{ fontSize: '13px' }}
          >
            <FiAlertCircle size={14} style={{ marginRight: '6px' }} />
            File a Complaint
          </button>
        )}

        {isPending && (
          <button
            className="btn btn-danger"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? <Loader small /> : 'Cancel Order'}
          </button>
        )}
      </div>

      {/* ── COMPLAINT FORM ── */}
      {showComplaint && (
        <div className="order-section" style={{ marginTop: '16px' }}>
          <p className="order-section-title">File a Complaint</p>

          {complaintMsg && <div className="alert alert-success">{complaintMsg}</div>}
          {complaintErr && <div className="alert alert-error">{complaintErr}</div>}

          <form onSubmit={handleSubmitComplaint}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-control"
                placeholder="Brief title for your complaint"
                value={complaintSubject}
                onChange={(e) => setComplaintSubject(e.target.value)}
                maxLength={255}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                placeholder="Explain the issue in detail..."
                value={complaintDesc}
                onChange={(e) => setComplaintDesc(e.target.value)}
                rows={4}
                maxLength={2000}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-ice"
              disabled={complaintSubmitting}
              style={{ fontSize: '13px', padding: '8px 20px' }}
            >
              {complaintSubmitting ? <Loader small /> : 'Submit Complaint'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// ============================================================
//  ORDERS LIST (unchanged, but now passes onOrderCancelled)
// ============================================================
const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiGetOrders(user.user_id);
      setOrders(res.data);
    } catch {
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderCancelled = (cancelledOrderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.order_id === cancelledOrderId ? { ...o, status: 'cancelled' } : o
      )
    );
  };

  if (!user) return null;

  if (selected) {
    return (
      <div className="page-wrapper orders-page">
        <OrderDetail
          orderId={selected}
          onBack={() => setSelected(null)}
          onOrderCancelled={handleOrderCancelled}
        />
      </div>
    );
  }

  return (
    <div className="page-wrapper orders-page">
      <div className="orders-header">
        <h1 className="orders-title">My Orders</h1>
        {!loading && !error && (
          <span className="orders-count">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading && <div className="loader-wrapper"><Loader /></div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="orders-empty">
          <div className="orders-empty-icon">
            <FiPackage size={48} />
          </div>
          <h3>No orders yet</h3>
          <p className="text-muted mt-1">
            When you make a purchase, your orders will appear here.
          </p>
          <button className="btn btn-ice mt-3" onClick={() => navigate('/')}>
            Start Shopping
          </button>
        </div>
      )}

      {orders.map((order) => (
        <div
          key={order.order_id}
          className="order-card"
          onClick={() => setSelected(order.order_id)}
        >
          <div className="order-card-header">
            <div className="order-id-row">
              <span className="order-id">Order #{order.order_id}</span>
              <span className="order-date">{formatDate(order.created_at)}</span>
            </div>
            <div className="order-card-meta">
              <span className={`${statusClass(order.status)}`}>
                {order.status}
              </span>
              <FiChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
            </div>
          </div>

          <div className="order-items-preview">
            {order.items?.slice(0, 2).map((item, i) => (
              <div key={i} className="order-item-row">
                <img
                  src={imgUrl(item.product_photo)}
                  alt={item.product_name}
                  className="order-item-img"
                  onError={(e) => { e.target.src = '/placeholder.png'; }}
                />
                <div className="order-item-info">
                  <p className="order-item-name">{item.product_name}</p>
                  <p className="order-item-qty">Qty: {item.quantity}</p>
                </div>
                <span className="order-item-price">
                  {formatAmount(item.subtotal)}
                </span>
              </div>
            ))}
            {order.items?.length > 2 && (
              <p className="order-more-items">
                +{order.items.length - 2} more item
                {order.items.length - 2 !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="order-card-footer">
            <div>
              <p className="order-total-label">Total</p>
              <p className="order-total-amount">
                {formatAmount(order.total_amount)}
              </p>
            </div>
            <span className="text-faint" style={{ fontSize: '12px' }}>
              {order.mpesa_receipt
                ? `M-Pesa: ${order.mpesa_receipt}`
                : 'Payment pending'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;