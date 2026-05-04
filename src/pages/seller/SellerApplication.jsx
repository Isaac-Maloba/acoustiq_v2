// src/pages/seller/SellerApplication.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiSellerApply, apiSellerApplicationStatus } from '../../utils/api';
import '../../css/Profile.css'; // reuse form styling from profile

const SellerApplication = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [idDocument, setIdDocument] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [existingApplication, setExistingApplication] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Check if user already applied or is already a seller
  useEffect(() => {
    const checkStatus = async () => {
      if (user?.role === 'seller') {
        // already a seller – redirect to dashboard
        navigate('/seller/dashboard');
        return;
      }
      try {
        const res = await apiSellerApplicationStatus(user.user_id);
        setExistingApplication(res.data.application);
      } catch (err) {
        // no application yet – fine
      } finally {
        setLoadingStatus(false);
      }
    };
    checkStatus();
  }, [user, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setIdDocument(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim()) {
      setError('Store name is required.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('user_id', user.user_id);
    formData.append('store_name', storeName.trim());
    formData.append('description', description.trim());
    formData.append('phone', phone.trim());
    if (idDocument) formData.append('id_document', idDocument);

    try {
      const res = await apiSellerApply(formData);
      setMessage(res.data.message);
      // After applying, fetch the application status so UI updates
      const statusRes = await apiSellerApplicationStatus(user.user_id);
      setExistingApplication(statusRes.data.application);
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="page-wrapper">
        <div className="loader-wrapper">
          <div className="loader" /> {/* use your Loader component */}
        </div>
      </div>
    );
  }

  // If user is already a seller (should have redirected earlier)
  if (user?.role === 'seller') {
    return null; // redirect already happened
  }

  return (
    <div className="page-wrapper profile-page">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 className="profile-name" style={{ marginBottom: '8px' }}>
          Become a Seller
        </h1>
        <p className="profile-email" style={{ marginBottom: '24px' }}>
          Fill in the details below to open your store on Acoustiq.
        </p>

        {/* Show existing application status */}
        {existingApplication && (
          <div
            className={
              existingApplication.status === 'pending'
                ? 'alert alert-warning'
                : existingApplication.status === 'approved'
                ? 'alert alert-success'
                : 'alert alert-error'
            }
            style={{ marginBottom: '24px' }}
          >
            {existingApplication.status === 'pending' && (
              <>
                <strong>Application pending.</strong> We are reviewing your
                application. You'll be able to access your seller dashboard once
                approved.
                {existingApplication.admin_note && (
                  <p style={{ marginTop: '8px', fontSize: '13px' }}>
                    Note from admin: {existingApplication.admin_note}
                  </p>
                )}
              </>
            )}
            {existingApplication.status === 'approved' && (
              <>
                <strong>Approved!</strong> Your store is now active.{' '}
                <Link to="/seller/dashboard" style={{ color: 'var(--ice)' }}>
                  Go to Seller Dashboard
                </Link>
              </>
            )}
            {existingApplication.status === 'rejected' && (
              <>
                <strong>Application rejected.</strong>{' '}
                {existingApplication.admin_note
                  ? `Reason: ${existingApplication.admin_note}`
                  : 'Please contact support for further information.'}
              </>
            )}
          </div>
        )}

        {/* If already approved, don't show the form */}
        {existingApplication?.status === 'approved' ? null : existingApplication?.status === 'pending' ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Your application is under review. You will be notified once a decision
            is made.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Store Name *</label>
              <input
                className="form-control"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g., Maloba Instruments"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Store Description</label>
              <textarea
                className="form-control"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell customers about your store..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                className="form-control"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 700 000 000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">ID Document (optional)</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                style={{
                  background: 'var(--bg-surface2)',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-2)',
                  color: 'var(--text-muted)',
                  width: '100%',
                }}
              />
              <p className="form-hint">Accepted: jpg, png, webp. Max 16MB.</p>
            </div>

            <button
              type="submit"
              className="btn btn-ice"
              disabled={submitting}
              style={{ marginTop: '8px' }}
            >
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SellerApplication;