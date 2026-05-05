import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiCheckCircle, FiChevronLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { apiGetComplaints } from '../utils/api';
import Loader from '../components/Loader';
import '../css/Orders.css'; // reuse existing card styles

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      try {
        const res = await apiGetComplaints(user.user_id);
        setComplaints(res.data);
      } catch {
        setError('Failed to load complaints.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  if (!user) return null;

  return (
    <div className="page-wrapper orders-page">
      <div className="order-detail-back" style={{ marginBottom: '16px' }}>
        <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none' }}>
          <FiChevronLeft size={14} style={{ marginRight: '4px' }} />
          Back to shop
        </Link>
      </div>

      <h1 className="orders-title" style={{ marginBottom: '8px' }}>My Complaints</h1>
      <p className="text-muted" style={{ marginBottom: '28px' }}>
        View complaints you've filed or received, along with admin responses.
      </p>

      {loading && <div className="loader-wrapper"><Loader /></div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {!loading && !error && complaints.length === 0 && (
        <div className="orders-empty">
          <div className="orders-empty-icon">
            <FiCheckCircle size={48} />
          </div>
          <h3>No complaints</h3>
          <p className="text-muted mt-1">
            Any complaints you file or receive will appear here.
          </p>
        </div>
      )}

      {complaints.map((complaint) => (
        <div key={complaint.complaint_id} className="order-card" style={{ cursor: 'default' }}>
          <div className="order-card-header">
            <div className="order-id-row">
              <span className="order-id">{complaint.subject}</span>
              <span className="order-date">
                {new Date(complaint.created_at).toLocaleDateString('en-KE')}
              </span>
            </div>
            <div className="order-card-meta">
              <span className={`badge ${complaint.status === 'open' ? 'badge-error' : 'badge-success'}`}>
                {complaint.status === 'open' ? <FiAlertCircle size={12} style={{ marginRight: '4px' }} /> : <FiCheckCircle size={12} style={{ marginRight: '4px' }} />}
                {complaint.status}
              </span>
            </div>
          </div>

          <div className="order-items-preview">
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '8px' }}>
              {complaint.description}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
              Regarding order #{complaint.order_id} · Other party: {complaint.other_party_name}
            </div>

            {/* Admin response (if complaint is resolved) */}
            {complaint.status === 'resolved' && complaint.admin_response && (
              <div style={{
                marginTop: '12px',
                padding: '10px 14px',
                background: 'var(--success-dim)',
                border: '1px solid rgba(76, 175, 130, 0.35)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                color: 'var(--success)',
                lineHeight: 1.6,
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Admin Response:</strong>{' '}
                {complaint.admin_response}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Complaints;