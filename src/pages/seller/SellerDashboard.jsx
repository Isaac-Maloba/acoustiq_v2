// src/pages/seller/SellerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiSellerDashboard } from '../../utils/api';
import SellerLayout from '../../components/SellerLayout';
import Loader from '../../components/Loader';

const SellerDashboard = () => {
  const { user } = useAuth();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiSellerDashboard(user.user_id);
        setData(res.data);
      } catch {
        setError('Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user.user_id]);

  const fmt = (n) => Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 });

  if (loading) return (
    <SellerLayout title="Dashboard">
      <div className="loader-wrapper"><Loader /></div>
    </SellerLayout>
  );

  if (error || !data) return (
    <SellerLayout title="Dashboard">
      <div className="alert alert-error">{error || 'Dashboard data unavailable.'}</div>
    </SellerLayout>
  );

  const { store, stats, recent_orders } = data;

  return (
    <SellerLayout title="Dashboard" subtitle={`Welcome back, ${user.first_name}`} storeName={store?.store_name}>
      {/* ── STAT CARDS ── */}
      <div className="seller-stats-grid">
        <div className="seller-stat-card">
          <p className="seller-stat-label">📦 Total Products</p>
          <p className="seller-stat-value">{fmt(stats.total_products)}</p>
          <p className="seller-stat-sub">Listings in your store</p>
          <Link to="/seller/products" className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 12px', marginTop: '8px' }}>
            Manage products →
          </Link>
        </div>

        <div className="seller-stat-card">
          <p className="seller-stat-label">📋 Total Orders</p>
          <p className="seller-stat-value">{fmt(stats.total_orders)}</p>
          <p className="seller-stat-sub">Orders containing your items</p>
          <Link to="/seller/orders" className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 12px', marginTop: '8px' }}>
            View orders →
          </Link>
        </div>

        <div className="seller-stat-card">
          <p className="seller-stat-label">💰 Total Revenue</p>
          <p className="seller-stat-value">KES {fmt(stats.total_revenue)}</p>
          <p className="seller-stat-sub">From delivered orders</p>
          <Link to="/seller/earnings" className="btn btn-ghost" style={{ fontSize: '12px', padding: '4px 12px', marginTop: '8px' }}>
            View earnings →
          </Link>
        </div>
      </div>

      {/* ── RECENT ORDERS ── */}
      <div className="seller-section">
        <div className="seller-section-header">
          <h2 className="seller-section-title">Recent Orders</h2>
          <Link to="/seller/orders" className="btn btn-ghost" style={{ fontSize: '13px' }}>
            View all →
          </Link>
        </div>

        {recent_orders.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <p>No orders yet.</p>
          </div>
        ) : (
          <div className="seller-table-wrapper">
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Buyer</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent_orders.map((order, idx) => (
                  <tr key={idx}>
                    <td className="seller-product-thumb">
                      {order.product_photo ? (
                        <img src={`/static/images/${order.product_photo}`} alt="" />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-surface2)' }} />
                      )}
                      <span className="seller-product-thumb-name">{order.product_name}</span>
                    </td>
                    <td>{order.first_name} {order.last_name}</td>
                    <td>{order.quantity}</td>
                    <td>KES {fmt(order.subtotal)}</td>
                    <td>
                      <span className={`badge ${
                        order.status === 'delivered' ? 'badge-success' :
                        order.status === 'shipped' ? 'badge-gold' :
                        order.status === 'confirmed' ? 'badge-ice' :
                        order.status === 'cancelled' ? 'badge-error' : 'badge-muted'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
        <Link to="/add-product" className="btn btn-ice" style={{ fontSize: '13px', padding: '10px 20px' }}>
          + Add Product
        </Link>
        <Link to="/seller/store" className="btn btn-ghost" style={{ fontSize: '13px', padding: '10px 20px' }}>
          Edit Store
        </Link>
      </div>
    </SellerLayout>
  );
};

export default SellerDashboard;