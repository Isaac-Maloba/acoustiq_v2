// src/pages/seller/SellerStore.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiGetSellerStore, apiUpdateSellerStore } from '../../utils/api';
import SellerLayout from '../../components/SellerLayout';
import Loader from '../../components/Loader';

const SellerStore = () => {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [mpesaTill, setMpesaTill] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await apiGetSellerStore(user.user_id);
        const data = res.data;
        setStore(data);
        setStoreName(data.store_name || '');
        setDescription(data.store_description || '');
        setMpesaTill(data.mpesa_till || '');
      } catch {
        setError('Failed to load store details.');
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [user.user_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    setError('');

    const formData = new FormData();
    formData.append('user_id', user.user_id);
    formData.append('store_name', storeName.trim());
    formData.append('description', description.trim());
    formData.append('mpesa_till', mpesaTill.trim());
    if (logoFile) formData.append('store_logo', logoFile);
    if (bannerFile) formData.append('store_banner', bannerFile);

    try {
      const res = await apiUpdateSellerStore(formData);
      setSuccess(res.data.message);
      // Refresh store data
      const updated = await apiGetSellerStore(user.user_id);
      setStore(updated.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <SellerLayout title="My Store">
      <Loader />
    </SellerLayout>
  );

  if (!store) return (
    <SellerLayout title="My Store">
      <div className="alert alert-error">{error || 'Store not found.'}</div>
    </SellerLayout>
  );

  return (
    <SellerLayout title="My Store" subtitle="Edit your storefront" storeName={store.store_name}>
      {/* Status + Section */}
      <div className="seller-section">
        <div className="seller-section-header">
          <h2 className="seller-section-title">Store Details</h2>
          <span className={`badge ${store.status === 'active' ? 'badge-success' : store.status === 'suspended' ? 'badge-error' : 'badge-muted'}`}>
            {store.status}
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {success && <div className="alert alert-success">{success}</div>}
          {error   && <div className="alert alert-error">{error}</div>}

          {/* Banner preview + upload */}
          <div className="form-group">
            <label className="form-label">Store Banner</label>
            {store.store_banner ? (
              <img
                src={`/static/images/${store.store_banner}`}
                alt="Store banner"
                className="store-editor-banner"
              />
            ) : (
              <div className="store-editor-banner" style={{ background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
                No banner
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBannerFile(e.target.files[0])}
              style={{ marginTop: '8px' }}
            />
            <p className="form-hint">Recommended size: 1200 × 300 px. Leave empty to keep current.</p>
          </div>

          {/* Logo + basic info */}
          <div className="store-editor-logo-row">
            {store.store_logo ? (
              <img
                src={`/static/images/${store.store_logo}`}
                alt="Store logo"
                className="store-editor-logo"
              />
            ) : (
              <div className="store-editor-logo" style={{ background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)' }}>
                LOGO
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div className="form-group">
                <label className="form-label">Store Name *</label>
                <input
                  className="form-control"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Logo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="form-label">M‑Pesa Till Number</label>
            <input
              className="form-control"
              value={mpesaTill}
              onChange={(e) => setMpesaTill(e.target.value)}
              placeholder="e.g., 123456"
            />
            <p className="form-hint">Optional — shown to buyers on your store page.</p>
          </div>

          <button type="submit" className="btn btn-gold" disabled={submitting} style={{ marginTop: '8px' }}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </SellerLayout>
  );
};

export default SellerStore;