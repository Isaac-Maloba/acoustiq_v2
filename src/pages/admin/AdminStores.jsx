// src/pages/admin/AdminStores.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  apiAdminGetStores,
  apiAdminSuspendStore,
  apiAdminReinstateStore,
} from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import Loader from '../../components/Loader';

const AdminStores = () => {
  const { user } = useAuth();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // active, suspended, '' (all)
  const [actionInProgress, setActionInProgress] = useState(null);

  const fetchStores = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiAdminGetStores(user.user_id, statusFilter);
      setStores(res.data);
    } catch {
      setError('Failed to load stores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSuspend = async (storeId) => {
    const formData = new FormData();
    formData.append('user_id', user.user_id);
    setActionInProgress(storeId);
    try {
      await apiAdminSuspendStore(storeId, formData);
      // Optimistic update: set status locally
      setStores(prev =>
        prev.map(store =>
          store.store_id === storeId ? { ...store, status: 'suspended' } : store
        )
      );
    } catch {
      alert('Failed to suspend store.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReinstate = async (storeId) => {
    const formData = new FormData();
    formData.append('user_id', user.user_id);
    setActionInProgress(storeId);
    try {
      await apiAdminReinstateStore(storeId, formData);
      setStores(prev =>
        prev.map(store =>
          store.store_id === storeId ? { ...store, status: 'active' } : store
        )
      );
    } catch {
      alert('Failed to reinstate store.');
    } finally {
      setActionInProgress(null);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'active':    return 'badge-success';
      case 'suspended': return 'badge-error';
      default:          return 'badge-muted';
    }
  };

  const content = () => {
    if (loading) return <div className="loader-wrapper"><Loader /></div>;
    if (error)   return <div className="alert alert-error">{error}</div>;

    if (stores.length === 0) {
      return (
        <div className="empty-state">
          <p>No {statusFilter || 'active'} stores found.</p>
        </div>
      );
    }

    return (
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Store</th>
              <th>Seller</th>
              <th>Products</th>
              <th>Total Sales</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(store => (
              <tr key={store.store_id}>
                <td className="col-primary">
                  <div className="admin-user-cell">
                    {store.store_logo ? (
                      <img
                        src={`/static/images/${store.store_logo}`}
                        alt=""
                        style={{ width: '28px', height: '28px', borderRadius: '4px', marginRight: '8px' }}
                      />
                    ) : (
                      <div className="admin-user-avatar">
                        {store.store_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="admin-user-name">{store.store_name}</div>
                      <div className="admin-user-email">{store.store_slug}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="admin-user-email">{store.email}</div>
                  {store.phone && (
                    <div className="admin-user-email">{store.phone}</div>
                  )}
                </td>
                <td>{store.product_count ?? 0}</td>
                <td>KES {Number(store.total_sales).toLocaleString()}</td>
                <td>
                  <span className={`badge ${statusBadge(store.status)}`}>
                    {store.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="admin-row-actions" style={{ justifyContent: 'flex-end' }}>
                    {store.status === 'active' && (
                      <button
                        className="admin-action-btn warning"
                        title="Suspend store"
                        disabled={actionInProgress === store.store_id}
                        onClick={() => handleSuspend(store.store_id)}
                      >
                        {/* using unicode "pause" or text */}
                        <span style={{ fontSize: '14px' }}>⏸</span>
                      </button>
                    )}
                    {store.status === 'suspended' && (
                      <button
                        className="admin-action-btn success"
                        title="Reinstate store"
                        disabled={actionInProgress === store.store_id}
                        onClick={() => handleReinstate(store.store_id)}
                      >
                        <span style={{ fontSize: '14px' }}>↩</span>
                      </button>
                    )}
                    {store.status === 'pending' && (
                      <span className="text-muted" style={{ fontSize: '12px' }}>Pending approval</span>
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
    <AdminLayout
      title="Stores"
      subtitle="Manage all seller storefronts"
    >
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Store List</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Filter:</span>
            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="">All</option>
            </select>
          </div>
        </div>

        {content()}
      </div>
    </AdminLayout>
  );
};

export default AdminStores;