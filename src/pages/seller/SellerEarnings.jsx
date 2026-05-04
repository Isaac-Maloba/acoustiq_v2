// src/pages/seller/SellerEarnings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiSellerEarnings, apiSellerPayoutRequest } from '../../utils/api';
import SellerLayout from '../../components/SellerLayout';
import Loader from '../../components/Loader';

const SellerEarnings = () => {
  const { user } = useAuth();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Payout request form
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMsg, setPayoutMsg]       = useState('');
  const [payoutErr, setPayoutErr]       = useState('');
  const [payoutBusy, setPayoutBusy]     = useState(false);

  const fetchEarnings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiSellerEarnings(user.user_id);
      setData(res.data);
    } catch {
      setError('Failed to load earnings data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePayoutRequest = async (e) => {
    e.preventDefault();
    const amount = parseFloat(payoutAmount);
    if (!amount || amount < 1000) {
      setPayoutErr('Minimum payout amount is KES 1,000.');
      return;
    }
    if (amount > (data.available_balance || 0)) {
      setPayoutErr(`Insufficient available balance. You can request up to KES ${fmt(data.available_balance)}.`);
      return;
    }

    setPayoutBusy(true);
    setPayoutMsg('');
    setPayoutErr('');

    const formData = new FormData();
    formData.append('user_id', user.user_id);
    formData.append('amount', amount);

    try {
      const res = await apiSellerPayoutRequest(formData);
      setPayoutMsg(res.data.message);
      setPayoutAmount('');
      // Refresh earnings data after successful request
      fetchEarnings();
    } catch (err) {
      setPayoutErr(err.response?.data?.message || 'Payout request failed.');
    } finally {
      setPayoutBusy(false);
    }
  };

  const fmt = (n) => Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 });

  const statusBadge = (status) => {
    switch (status) {
      case 'completed':  return 'badge-success';
      case 'processing': return 'badge-ice';
      case 'pending':    return 'badge-warning';
      case 'rejected':   return 'badge-error';
      default:           return 'badge-muted';
    }
  };

  if (loading) return (
    <SellerLayout title="Earnings">
      <div className="loader-wrapper"><Loader /></div>
    </SellerLayout>
  );

  if (error || !data) return (
    <SellerLayout title="Earnings">
      <div className="alert alert-error">{error || 'Earnings data unavailable.'}</div>
    </SellerLayout>
  );

  return (
    <SellerLayout title="Earnings" subtitle="Track revenue and request payouts" storeName={user?.first_name || 'Seller'}>
      {/* ── EARNINGS BREAKDOWN ── */}
      <div className="earnings-breakdown">
        <div className="earnings-card">
          <p className="earnings-card-label">Total Earnings</p>
          <p className="earnings-card-value">KES {fmt(data.total_earnings)}</p>
          <p className="seller-stat-sub">{data.total_orders} delivered orders</p>
        </div>

        <div className="earnings-card highlight">
          <p className="earnings-card-label">Available Balance</p>
          <p className="earnings-card-value">KES {fmt(data.available_balance)}</p>
          <p className="seller-stat-sub">Ready for payout</p>
        </div>

        <div className="earnings-card">
          <p className="earnings-card-label">Pending Payouts</p>
          <p className="earnings-card-value">KES {fmt(data.pending)}</p>
          <p className="seller-stat-sub">Processing</p>
        </div>

        <div className="earnings-card">
          <p className="earnings-card-label">Total Paid</p>
          <p className="earnings-card-value">KES {fmt(data.total_paid)}</p>
          <p className="seller-stat-sub">Completed</p>
        </div>
      </div>

      {/* ── PAYOUT REQUEST FORM ── */}
      <div className="payout-form" style={{ marginBottom: '28px' }}>
        <h3 className="payout-form-title">Request Payout</h3>
        <p className="payout-form-sub">
          Minimum KES 1,000. A 10% platform commission will be deducted.
        </p>

        {payoutMsg && <div className="alert alert-success">{payoutMsg}</div>}
        {payoutErr && <div className="alert alert-error">{payoutErr}</div>}

        <form onSubmit={handlePayoutRequest} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
            <label className="form-label">Amount (KES)</label>
            <input
              className="form-control"
              type="number"
              min="1000"
              step="100"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              placeholder={`Up to ${fmt(data.available_balance)}`}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-gold"
            disabled={payoutBusy || !data.available_balance || data.available_balance < 1000}
            style={{ padding: '11px 20px', fontSize: '14px' }}
          >
            {payoutBusy ? 'Requesting…' : 'Request Payout'}
          </button>
        </form>

        {data.available_balance < 1000 && (
          <p className="form-hint" style={{ marginTop: '8px' }}>
            You need at least KES 1,000 available to request a payout.
          </p>
        )}
      </div>

      {/* ── PAYOUT HISTORY ── */}
      <div className="seller-section">
        <div className="seller-section-header">
          <h2 className="seller-section-title">Payout History</h2>
        </div>

        {data.history.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <p>No payout requests yet.</p>
          </div>
        ) : (
          <div className="seller-table-wrapper">
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Gross</th>
                  <th>Commission (10%)</th>
                  <th>Net</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map(payout => (
                  <tr key={payout.payout_id}>
                    <td className="text-muted" style={{ fontSize: '13px' }}>
                      {new Date(payout.requested_at).toLocaleDateString('en-KE')}
                    </td>
                    <td>KES {fmt(payout.amount)}</td>
                    <td>KES {fmt(payout.commission_amount)}</td>
                    <td className="col-name">KES {fmt(payout.net_amount)}</td>
                    <td>
                      <span className={`badge ${statusBadge(payout.status)}`}>
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SellerLayout>
  );
};

export default SellerEarnings;