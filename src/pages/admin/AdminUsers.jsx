// src/pages/admin/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  apiAdminGetUsers,
  apiAdminSetUserRole,
  apiAdminDeleteUser,
} from '../../utils/api';
import AdminLayout from '../../components/AdminLayout';
import Loader from '../../components/Loader';

const AdminUsers = () => {
  const { user } = useAuth();

  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState(''); // '', 'customer', 'seller', 'admin'
  const [actionInProgress, setActionInProgress] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (search)     filters.search = search;
      if (roleFilter) filters.role   = roleFilter;
      const res = await apiAdminGetUsers(user.user_id, filters);
      setUsers(res.data);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter]);

  const handleRoleChange = async (targetUserId, newRole) => {
    const formData = new FormData();
    formData.append('user_id', user.user_id);
    formData.append('role', newRole);
    setActionInProgress(targetUserId);
    try {
      await apiAdminSetUserRole(targetUserId, formData);
      // Optimistic update
      setUsers(prev =>
        prev.map(u =>
          u.user_id === targetUserId ? { ...u, role: newRole } : u
        )
      );
    } catch {
      alert('Failed to update role.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (targetUserId) => {
    if (!window.confirm('Permanently delete this user and all their data?')) return;
    setActionInProgress(targetUserId);
    try {
      await apiAdminDeleteUser(targetUserId, user.user_id);
      setUsers(prev => prev.filter(u => u.user_id !== targetUserId));
    } catch {
      alert('Failed to delete user.');
    } finally {
      setActionInProgress(null);
    }
  };

  const roleBadge = (role) => {
    switch (role) {
      case 'admin':    return 'badge-ice';
      case 'seller':   return 'badge-gold';
      default:         return 'badge-muted';
    }
  };

  const content = () => {
    if (loading) return <div className="loader-wrapper"><Loader /></div>;
    if (error)   return <div className="alert alert-error">{error}</div>;

    if (users.length === 0) {
      return (
        <div className="empty-state">
          <p>No users found.</p>
          {search || roleFilter ? (
            <button className="btn btn-ghost mt-2" onClick={() => { setSearch(''); setRoleFilter(''); }}>
              Clear filters
            </button>
          ) : null}
        </div>
      );
    }

    return (
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Auth</th>
              <th>2FA</th>
              <th>Joined</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.user_id}>
                <td className="col-primary">
                  <div className="admin-user-cell">
                    <div className="admin-user-avatar">
                      {u.first_name.charAt(0).toUpperCase()}
                      {u.last_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="admin-user-name">
                        {u.first_name} {u.last_name}
                      </div>
                      <div className="admin-user-email">{u.email}</div>
                      {u.phone && (
                        <div className="admin-user-email">{u.phone}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${roleBadge(u.role)}`}>{u.role}</span>
                </td>
                <td>
                  <span className="text-muted" style={{ fontSize: '12px' }}>
                    {u.auth_provider === 'google' ? 'Google' : 'Local'}
                  </span>
                </td>
                <td>
                  {u.two_fa_enabled ? (
                    <span className="badge badge-success">ON</span>
                  ) : (
                    <span className="badge badge-muted">OFF</span>
                  )}
                </td>
                <td className="text-muted" style={{ fontSize: '13px' }}>
                  {new Date(u.created_at).toLocaleDateString('en-KE')}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="admin-row-actions" style={{ justifyContent: 'flex-end' }}>
                    {/* Role change dropdown – don't allow changing own role, cannot set admin role via API */}
                    {u.user_id !== user.user_id && u.role !== 'admin' && (
                      <select
                        className="admin-filter-select"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                        disabled={actionInProgress === u.user_id}
                        style={{ fontSize: '12px', padding: '4px 8px', minWidth: '80px' }}
                      >
                        <option value="customer">Customer</option>
                        <option value="seller">Seller</option>
                      </select>
                    )}
                    {u.role === 'admin' && (
                      <span className="text-faint" style={{ fontSize: '12px' }}>Admin (cannot change)</span>
                    )}
                    {u.user_id === user.user_id && (
                      <span className="text-faint" style={{ fontSize: '12px' }}>You</span>
                    )}

                    {/* Delete user (not self) */}
                    {u.user_id !== user.user_id && (
                      <button
                        className="admin-action-btn danger"
                        title="Delete user"
                        disabled={actionInProgress === u.user_id}
                        onClick={() => handleDelete(u.user_id)}
                        style={{ marginLeft: '8px' }}
                      >
                        🗑
                      </button>
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
      title="Users"
      subtitle="Manage all platform accounts"
    >
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">User List</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {users.length} user{users.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Search + filter bar */}
        <div className="admin-filter-bar">
          <div className="admin-search-wrapper">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="admin-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All roles</option>
            <option value="customer">Customer</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
          {(search || roleFilter) && (
            <button
              className="btn btn-ghost"
              style={{ fontSize: '12px', padding: '5px 10px' }}
              onClick={() => { setSearch(''); setRoleFilter(''); }}
            >
              Clear
            </button>
          )}
        </div>

        {content()}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;