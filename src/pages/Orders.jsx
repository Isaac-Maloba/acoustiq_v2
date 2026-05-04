import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { apiGetOrders, apiGetOrder, imgUrl } from '../utils/api';
import Loader from '../components/Loader';
import '../css/Orders.css';

// ============================================================
//  HELPERS
// ============================================================
const statusClass = (status) => `badge status-${status?.toLowerCase().replace(' ', '-')}`;

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-KE', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
};

const formatAmount = (n) =>
    `KES ${Number(n || 0).toLocaleString()}`;

// ============================================================
//  ORDER DETAIL VIEW
// ============================================================
const OrderDetail = ({ orderId, onBack }) => {
    const { user }  = useAuth();
    const [order,   setOrder]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await apiGetOrder(orderId, user.user_id);
                setOrder(res.data);
            } catch {
                setError('Could not load order details.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [orderId]);

    if (loading) return <div className="loader-wrapper"><Loader /></div>;
    if (error)   return <div className="alert alert-error">{error}</div>;
    if (!order)  return null;

    const subtotal = order.items?.reduce((s, i) => s + Number(i.subtotal || 0), 0) ?? 0;

    return (
        <div>
            <button className="order-detail-back" onClick={onBack}>
                <FiArrowLeft size={14} /> Back to orders
            </button>

            <div className="order-detail-header">
                <div>
                    <h1 className="order-detail-title">Order #{order.order_id}</h1>
                    <p className="order-detail-date">Placed on {formatDate(order.created_at)}</p>
                </div>
                <span className={`badge ${statusClass(order.status)}`}>
                    {order.status}
                </span>
            </div>

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
                    <span className="order-summary-label">M-Pesa Phone</span>
                    <span className="order-summary-value">{order.mpesa_phone || '—'}</span>
                </div>
                <div className="order-summary-row">
                    <span className="order-summary-label">Transaction Code</span>
                    <span className="order-summary-value">{order.mpesa_code || 'Pending'}</span>
                </div>
                <div className="order-summary-row total">
                    <span>Total Paid</span>
                    <span>{formatAmount(order.total_amount)}</span>
                </div>
            </div>
        </div>
    );
};

// ============================================================
//  ORDERS LIST
// ============================================================
const Orders = () => {
    const { user }       = useAuth();
    const navigate       = useNavigate();
    const [orders,   setOrders]   = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState('');
    const [selected, setSelected] = useState(null); // order_id for detail view

    useEffect(() => {
        if (!user) { navigate('/signin'); return; }
        const fetch = async () => {
            try {
                const res = await apiGetOrders(user.user_id);
                setOrders(res.data);
            } catch {
                setError('Failed to load orders. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [user]);

    if (!user) return null;

    // ── DETAIL VIEW ──
    if (selected) {
        return (
            <div className="page-wrapper orders-page">
                <OrderDetail
                    orderId={selected}
                    onBack={() => setSelected(null)}
                />
            </div>
        );
    }

    // ── LIST VIEW ──
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
                    <button
                        className="btn btn-ice mt-3"
                        onClick={() => navigate('/')}
                    >
                        Start Shopping
                    </button>
                </div>
            )}

            {orders.map(order => (
                <div
                    key={order.order_id}
                    className="order-card"
                    onClick={() => setSelected(order.order_id)}
                >
                    {/* ── HEADER ── */}
                    <div className="order-card-header">
                        <div className="order-id-row">
                            <span className="order-id">Order #{order.order_id}</span>
                            <span className="order-date">{formatDate(order.created_at)}</span>
                        </div>
                        <div className="order-card-meta">
                            <span className={`badge ${statusClass(order.status)}`}>
                                {order.status}
                            </span>
                            <FiChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
                        </div>
                    </div>

                    {/* ── ITEMS PREVIEW (max 2) ── */}
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
                                +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

                    {/* ── FOOTER ── */}
                    <div className="order-card-footer">
                        <div>
                            <p className="order-total-label">Total</p>
                            <p className="order-total-amount">
                                {formatAmount(order.total_amount)}
                            </p>
                        </div>
                        <span className="text-faint" style={{ fontSize: '12px' }}>
                            {order.mpesa_code ? `M-Pesa: ${order.mpesa_code}` : 'Payment pending'}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Orders;