// src/pages/admin/AdminComplaints.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  apiAdminGetComplaints,
  apiAdminResolveComplaint,
} from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import Loader from '../../components/Loader';

const AdminComplaints = () => {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [statusFilter, setStatusFilter] = useState('open'); // 'open' or 'resolved'
  const [resolutionText, setResolutionText] = useState({}); // key: complaint_id, value: text
  const [actionInProgress, setActionInProgress] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiAdminGetComplaints(user.user_id, statusFilter);
      setComplaints(res.data);
    } catch {
      setError('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleResolve = async (complaintId) => {
    const response = resolutionText[complaintId] || '';
    const formData = new FormData();
    formData.append('user_id', user.user_id);
    formData.append('admin_response', response);

    setActionInProgress(complaintId);
    try {
      await apiAdminResolveComplaint(complaintId, formData);
      // Remove from current list or refresh
      if (statusFilter === 'open') {
        setComplaints(prev => prev.filter(c => c.complaint_id !== complaintId));
      } else {
        // If viewing resolved, refresh to show updated response
        fetchComplaints();
      }
      // Clear resolution text
      setResolutionText(prev => {
        const next = { ...prev };
        delete next[complaintId];
        return next;
      });
    } catch {
      alert('Failed to resolve complaint.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleTextChange = (complaintId, value) => {
    setResolutionText(prev => ({ ...prev, [complaintId]: value }));
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'open':     return 'badge-error';
      case 'resolved': return 'badge-success';
      default:         return 'badge-muted';
    }
  };

  const content = () => {
    if (loading) return <div className="loader-wrapper"><Loader /></div>;
    if (error)   return <div className="alert alert-error">{error}</div>;

    if (complaints.length === 0) {
      return (
        <div className="empty-state">
          <p>No {statusFilter} complaints found.</p>
          {statusFilter !== 'open' && (
            <button className="btn btn-ghost mt-2" onClick={() => setStatusFilter('open')}>
              View open complaints
            </button>
          )}
        </div>
      );
    }

    return (
      <div>
        {complaints.map(complaint => (
          <div key={complaint.complaint_id} className="complaint-card">
            <div className="complaint-card-header">
              <div>
                <h3 className="complaint-card-subject">{complaint.subject}</h3>
                <div className="complaint-card-meta">
                  <span>Order #{complaint.order_id}</span>
                  <span className="text-faint"> • </span>
                  <span>
                    From: {complaint.complainant_name} → To: {complaint.respondent_name}
                  </span>
                  <span className="text-faint"> • </span>
                  <span>{new Date(complaint.created_at).toLocaleDateString('en-KE')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={`badge ${statusBadge(complaint.status)}`}>
                  {complaint.status}
                </span>
                {complaint.order_status && (
                  <span className="badge badge-muted">{complaint.order_status}</span>
                )}
              </div>
            </div>

            <div className="complaint-card-body">
              {complaint.description}
            </div>

            {/* Existing admin response for resolved complaints */}
            {complaint.status === 'resolved' && complaint.admin_response && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '10px 14px',
                  background: 'var(--success-dim)',
                  border: '1px solid rgba(76, 175, 130, 0.35)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  color: 'var(--success)',
                }}
              >
                <strong style={{ color: 'var(--text-primary)' }}>Admin Response:</strong>{' '}
                {complaint.admin_response}
              </div>
            )}

            {/* Resolution form for open complaints */}
            {complaint.status === 'open' && (
              <div style={{ marginTop: '14px' }}>
                <textarea
                  className="complaint-resolution-input"
                  placeholder="Write a resolution response..."
                  value={resolutionText[complaint.complaint_id] || ''}
                  onChange={(e) => handleTextChange(complaint.complaint_id, e.target.value)}
                  rows={3}
                />
                <button
                  className="btn btn-success"
                  style={{ fontSize: '13px', padding: '7px 16px' }}
                  disabled={actionInProgress === complaint.complaint_id}
                  onClick={() => handleResolve(complaint.complaint_id)}
                >
                  {actionInProgress === complaint.complaint_id ? 'Resolving…' : 'Resolve Complaint'}
                </button>
              </div>
            )}

            {complaint.resolved_at && (
              <div className="text-faint" style={{ fontSize: '11px', marginTop: '8px' }}>
                Resolved on {new Date(complaint.resolved_at).toLocaleDateString('en-KE')}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout
      title="Complaints"
      subtitle="Review and resolve platform disputes"
      alerts={{
        openComplaints: statusFilter === 'open' ? complaints.length : undefined,
      }}
    >
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">Complaints</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Filter:</span>
            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {content()}
      </div>
    </AdminLayout>
  );
};

export default AdminComplaints;