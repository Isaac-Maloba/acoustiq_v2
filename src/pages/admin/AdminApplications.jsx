// src/pages/admin/AdminApplications.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  apiAdminGetApplications,
  apiAdminReviewApplication,
} from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import Loader from '../../components/Loader';

const AdminApplications = () => {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [reviewNote, setReviewNote] = useState({}); // key: application_id, value: note text
  const [actionInProgress, setActionInProgress] = useState(null); // application_id being processed

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiAdminGetApplications(user.user_id, statusFilter);
      setApplications(res.data);
    } catch {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleReview = async (applicationId, action) => {
    const note = reviewNote[applicationId] || '';
    const formData = new FormData();
    formData.append('user_id', user.user_id);
    formData.append('action', action);
    if (note) formData.append('admin_note', note);

    setActionInProgress(applicationId);
    try {
      await apiAdminReviewApplication(applicationId, formData);
      // Remove from list or refresh
      setApplications(prev => prev.filter(app => app.application_id !== applicationId));
      // Clear note
      setReviewNote(prev => {
        const next = { ...prev };
        delete next[applicationId];
        return next;
      });
    } catch {
      alert('Failed to review application. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleNoteChange = (applicationId, value) => {
    setReviewNote(prev => ({ ...prev, [applicationId]: value }));
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-error';
      case 'pending': return 'badge-warning';
      default: return 'badge-muted';
    }
  };

  const countByStatus = (status) =>
    applications.filter(a => a.status === status).length;

  const content = () => {
    if (loading) return <div className="loader-wrapper"><Loader /></div>;
    if (error)   return <div className="alert alert-error">{error}</div>;

    if (applications.length === 0) {
      return (
        <div className="empty-state">
          <p>No {statusFilter} applications found.</p>
          <button className="btn btn-ghost mt-2" onClick={() => setStatusFilter('pending')}>
            View pending
          </button>
        </div>
      );
    }

    return (
      <div>
        {applications.map(app => (
          <div key={app.application_id} className="application-card">
            <div className="application-card-header">
              <div>
                <h3 className="application-card-name">
                  {app.store_name}
                </h3>
                <div className="application-card-meta">
                  <span>{app.first_name} {app.last_name}</span>
                  <span className="text-faint"> • </span>
                  <span>{app.email}</span>
                  {app.phone && <><span className="text-faint"> • </span><span>{app.phone}</span></>}
                  <span className="text-faint"> • </span>
                  <span>Submitted {new Date(app.submitted_at).toLocaleDateString('en-KE')}</span>
                </div>
              </div>
              <span className={`badge ${statusBadge(app.status)}`}>
                {app.status}
              </span>
            </div>

            {app.description && (
              <div className="application-card-reason">
                {app.description}
              </div>
            )}

            {app.id_document && (
              <div className="mb-2" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                📄 <a href={`/static/images/${app.id_document}`} target="_blank" rel="noreferrer">
                  View submitted ID document
                </a>
              </div>
            )}

            {app.status === 'pending' && (
              <>
                {/* Admin note input (optional) */}
                <div className="form-group mb-2">
                  <textarea
                    className="complaint-resolution-input"
                    placeholder="Admin note (optional, visible to seller)"
                    value={reviewNote[app.application_id] || ''}
                    onChange={(e) => handleNoteChange(app.application_id, e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="application-card-actions">
                  <button
                    className="btn btn-success"
                    style={{ fontSize: '13px', padding: '8px 16px' }}
                    disabled={actionInProgress === app.application_id}
                    onClick={() => handleReview(app.application_id, 'approve')}
                  >
                    {actionInProgress === app.application_id ? 'Processing…' : 'Approve'}
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ fontSize: '13px', padding: '8px 16px' }}
                    disabled={actionInProgress === app.application_id}
                    onClick={() => handleReview(app.application_id, 'reject')}
                  >
                    {actionInProgress === app.application_id ? 'Processing…' : 'Reject'}
                  </button>
                </div>
              </>
            )}

            {/* Show admin note for reviewed applications */}
            {(app.status === 'approved' || app.status === 'rejected') && app.admin_note && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  background: 'var(--bg-surface2)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}
              >
                <strong className="text-faint">Admin Note:</strong> {app.admin_note}
              </div>
            )}

            {/* Reviewed date */}
            {app.reviewed_at && (
              <div className="text-faint" style={{ fontSize: '11px', marginTop: '8px' }}>
                Reviewed on {new Date(app.reviewed_at).toLocaleDateString('en-KE')}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout
      title="Seller Applications"
      subtitle="Review and manage seller onboarding requests"
      alerts={{
        pendingApplications: countByStatus('pending'),
        openComplaints: undefined, // not relevant
      }}
    >
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Applications</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Filter:
            </span>
            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {content()}
      </div>
    </AdminLayout>
  );
};

export default AdminApplications;