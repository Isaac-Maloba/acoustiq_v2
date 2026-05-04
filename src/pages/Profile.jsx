import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    FiUser, FiLock, FiTrash2, FiSave, FiLogOut,
    FiShield, FiShoppingBag, FiToggleLeft, FiToggleRight,
    FiChevronRight, FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import {
    apiUpdateProfile, apiChangePassword,
    apiDeleteAccount, apiToggle2FA
} from '../utils/api';
import '../css/Profile.css';

// ============================================================
//  PROFILE
// ============================================================
const Profile = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate                     = useNavigate();

    const isGoogleAccount = user?.auth_provider === 'google';
    const isSeller        = user?.role === 'seller';
    const isAdmin         = user?.role === 'admin';

    // ── ACTIVE TAB ──
    const [activeTab, setActiveTab] = useState('details');

    // ── PROFILE DETAILS FORM ──
    const [details, setDetails] = useState({
        first_name: user?.first_name || '',
        last_name:  user?.last_name  || '',
        email:      user?.email      || '',
        phone:      user?.phone      || '',
    });
    const [detailsMsg,  setDetailsMsg]  = useState('');
    const [detailsErr,  setDetailsErr]  = useState('');
    const [detailsBusy, setDetailsBusy] = useState(false);

    // ── PASSWORD FORM ──
    const [passwords, setPasswords] = useState({
        old_password: '',
        new_password: '',
        confirm:      '',
    });
    const [passMsg,  setPassMsg]  = useState('');
    const [passErr,  setPassErr]  = useState('');
    const [passBusy, setPassBusy] = useState(false);

    // ── 2FA STATE ──
    const [twoFaBusy, setTwoFaBusy] = useState(false);
    const [twoFaMsg,  setTwoFaMsg]  = useState('');
    const [twoFaErr,  setTwoFaErr]  = useState('');

    // ── DELETE CONFIRM ──
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting,          setDeleting]          = useState(false);
    const [deleteErr,         setDeleteErr]         = useState('');

    // ── REDIRECT IF NOT SIGNED IN ──
    if (!user) { navigate('/signin'); return null; }

    // ── HANDLERS ──

    const handleDetailsChange = (e) =>
        setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleDetailsSubmit = async (e) => {
        e.preventDefault();
        setDetailsMsg('');
        setDetailsErr('');
        setDetailsBusy(true);
        try {
            const formData = new FormData();
            formData.append('user_id',    user.user_id);
            formData.append('first_name', details.first_name.trim());
            formData.append('last_name',  details.last_name.trim());
            formData.append('email',      details.email.trim());
            formData.append('phone',      details.phone.trim());

            const response = await apiUpdateProfile(formData);
            setDetailsMsg(response.data.message);
            updateUser(details);
        } catch (err) {
            setDetailsErr(err.response?.data?.message || 'Update failed. Please try again.');
        } finally {
            setDetailsBusy(false);
        }
    };

    const handlePasswordChange = (e) =>
        setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPassMsg('');
        setPassErr('');

        if (passwords.new_password !== passwords.confirm) {
            setPassErr('New passwords do not match.');
            return;
        }
        if (passwords.new_password.length < 6) {
            setPassErr('New password must be at least 6 characters.');
            return;
        }

        setPassBusy(true);
        try {
            const formData = new FormData();
            formData.append('user_id',      user.user_id);
            formData.append('old_password', passwords.old_password);
            formData.append('new_password', passwords.new_password);

            const response = await apiChangePassword(formData);
            setPassMsg(response.data.message);
            setPasswords({ old_password: '', new_password: '', confirm: '' });
        } catch (err) {
            setPassErr(err.response?.data?.message || 'Password change failed. Please try again.');
        } finally {
            setPassBusy(false);
        }
    };

    const handleToggle2FA = async () => {
        setTwoFaBusy(true);
        setTwoFaMsg('');
        setTwoFaErr('');
        try {
            const formData = new FormData();
            formData.append('user_id', user.user_id);
            const response = await apiToggle2FA(formData);
            updateUser({ two_fa_enabled: response.data.two_fa_enabled });
            setTwoFaMsg(response.data.message);
        } catch (err) {
            setTwoFaErr(err.response?.data?.message || 'Failed to update 2FA setting.');
        } finally {
            setTwoFaBusy(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        setDeleteErr('');
        try {
            await apiDeleteAccount(user.user_id);
            logout();
            navigate('/');
        } catch (err) {
            setDeleteErr('Failed to delete account. Please try again.');
            setDeleting(false);
        }
    };

    // ── AVATAR INITIALS ──
    const initials = `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();

    // ── TABS CONFIG ──
    const tabs = [
        { id: 'details',  label: 'My Details', icon: <FiUser size={15} />   },
        { id: 'password', label: 'Password',   icon: <FiLock size={15} />   },
        { id: 'danger',   label: 'Account',    icon: <FiTrash2 size={15} /> },
    ];

    return (
        <div className="page-wrapper profile-page">

            {/* ── PROFILE HERO ── */}
            <div className="profile-hero">
                <div className="profile-avatar-circle">
                    {initials}
                    {(isSeller || isAdmin) && (
                        <span className={`avatar-role-dot ${isAdmin ? 'dot-admin' : 'dot-seller'}`} />
                    )}
                </div>
                <div className="profile-hero-info">
                    <h1 className="profile-name">{user.first_name} {user.last_name}</h1>
                    <p className="profile-email">{user.email}</p>
                    <div className="profile-hero-badges">
                        {isGoogleAccount && (
                            <span className="badge badge-ice" style={{ fontSize: '10px' }}>
                                G Google Account
                            </span>
                        )}
                        {isSeller && (
                            <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                                ◈ Seller
                            </span>
                        )}
                        {isAdmin && (
                            <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                                ⬡ Admin
                            </span>
                        )}
                    </div>
                </div>
                <button
                    className="btn btn-ghost profile-logout-btn"
                    onClick={() => { logout(); navigate('/'); }}
                >
                    <FiLogOut size={15} /> Sign Out
                </button>
            </div>

            {/* ── SELLER / ADMIN QUICK LINKS ── */}
            {(isSeller || isAdmin) && (
                <div className="profile-role-banner">
                    <div className="role-banner-icon">
                        {isAdmin ? <FiShield size={18} /> : <FiShoppingBag size={18} />}
                    </div>
                    <div className="role-banner-text">
                        <p className="role-banner-title">
                            {isAdmin ? 'Admin Account' : 'Seller Account'}
                        </p>
                        <p className="role-banner-sub">
                            {isAdmin
                                ? 'You have full platform access.'
                                : 'Manage your store, products, and earnings.'}
                        </p>
                    </div>
                    <Link
                        to={isAdmin ? '/admin/dashboard' : '/seller/dashboard'}
                        className="btn btn-gold"
                        style={{ fontSize: '13px', padding: '8px 16px', whiteSpace: 'nowrap' }}
                    >
                        {isAdmin ? 'Admin Panel' : 'Seller Dashboard'}
                        <FiChevronRight size={14} />
                    </Link>
                </div>
            )}

            {/* ── BECOME A SELLER CTA (customers only) ── */}
            {user.role === 'customer' && (
                <div className="profile-seller-cta">
                    <div className="seller-cta-icon"><FiShoppingBag size={18} /></div>
                    <div className="seller-cta-text">
                        <p className="seller-cta-title">Start selling on Acoustiq</p>
                        <p className="seller-cta-sub">
                            Apply to become a seller and list your instruments, plugins, and gear.
                        </p>
                    </div>
                    <Link
                        to="/seller/apply"
                        className="btn btn-ice"
                        style={{ fontSize: '13px', padding: '8px 16px', whiteSpace: 'nowrap' }}
                    >
                        Apply Now <FiChevronRight size={14} />
                    </Link>
                </div>
            )}

            <div className="divider" />

            {/* ── TAB NAV ── */}
            <div className="profile-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── TAB PANELS ── */}
            <div className="profile-panel">

                {/* ── DETAILS ── */}
                {activeTab === 'details' && (
                    <form onSubmit={handleDetailsSubmit} className="profile-form">
                        <h2 className="panel-title">Personal Information</h2>
                        <p className="panel-sub">Update your name, email and phone number.</p>

                        {detailsMsg && <div className="alert alert-success">{detailsMsg}</div>}
                        {detailsErr && <div className="alert alert-error">{detailsErr}</div>}

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">First Name</label>
                                <input
                                    className="form-control"
                                    name="first_name"
                                    value={details.first_name}
                                    onChange={handleDetailsChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name</label>
                                <input
                                    className="form-control"
                                    name="last_name"
                                    value={details.last_name}
                                    onChange={handleDetailsChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                className="form-control"
                                type="email"
                                name="email"
                                value={details.email}
                                onChange={handleDetailsChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                className="form-control"
                                type="tel"
                                name="phone"
                                value={details.phone}
                                onChange={handleDetailsChange}
                                placeholder={isGoogleAccount ? 'Add a phone number' : ''}
                            />
                            {isGoogleAccount && !user.phone && (
                                <p className="form-hint">
                                    <FiAlertCircle size={12} /> A phone number is required to enable 2FA.
                                </p>
                            )}
                        </div>

                        <button type="submit" className="btn btn-ice" disabled={detailsBusy}>
                            <FiSave size={15} />
                            {detailsBusy ? 'Saving…' : 'Save Changes'}
                        </button>
                    </form>
                )}

                {/* ── PASSWORD ── */}
                {activeTab === 'password' && (
                    <div className="profile-form">
                        <h2 className="panel-title">Change Password</h2>
                        <p className="panel-sub">Choose a strong password of at least 6 characters.</p>

                        {isGoogleAccount ? (
                            <div className="alert alert-error" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <FiAlertCircle size={16} />
                                Password change is not available for Google Sign-In accounts.
                            </div>
                        ) : (
                            <form onSubmit={handlePasswordSubmit}>
                                {passMsg && <div className="alert alert-success">{passMsg}</div>}
                                {passErr && <div className="alert alert-error">{passErr}</div>}

                                <div className="form-group">
                                    <label className="form-label">Current Password</label>
                                    <input
                                        className="form-control"
                                        type="password"
                                        name="old_password"
                                        value={passwords.old_password}
                                        onChange={handlePasswordChange}
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <input
                                        className="form-control"
                                        type="password"
                                        name="new_password"
                                        value={passwords.new_password}
                                        onChange={handlePasswordChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirm New Password</label>
                                    <input
                                        className="form-control"
                                        type="password"
                                        name="confirm"
                                        value={passwords.confirm}
                                        onChange={handlePasswordChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>
                                <button type="submit" className="btn btn-ice" disabled={passBusy}>
                                    <FiLock size={15} />
                                    {passBusy ? 'Updating…' : 'Update Password'}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* ── ACCOUNT / DANGER ZONE ── */}
                {activeTab === 'danger' && (
                    <div className="profile-form">
                        <h2 className="panel-title">Account Settings</h2>
                        <p className="panel-sub">Security and account management.</p>

                        {/* ── 2FA TOGGLE ── */}
                        <div className="settings-row">
                            <div className="settings-row-info">
                                <h3 className="settings-row-title">Two-Factor Authentication</h3>
                                <p className="settings-row-sub">
                                    {isGoogleAccount
                                        ? 'Not available for Google Sign-In accounts.'
                                        : !user.phone
                                        ? 'Add a phone number in My Details to enable 2FA.'
                                        : user.two_fa_enabled
                                        ? 'An OTP will be sent to your phone each time you sign in.'
                                        : 'Add an extra layer of security to your account.'}
                                </p>
                                {twoFaMsg && <p className="form-hint success">{twoFaMsg}</p>}
                                {twoFaErr && <p className="form-hint error">{twoFaErr}</p>}
                            </div>
                            <button
                                className={`toggle-btn ${user.two_fa_enabled ? 'toggle-on' : 'toggle-off'}`}
                                onClick={handleToggle2FA}
                                disabled={twoFaBusy || isGoogleAccount || !user.phone}
                                title={
                                    isGoogleAccount ? 'Not available for Google accounts'
                                    : !user.phone    ? 'Add a phone number first'
                                    : user.two_fa_enabled ? 'Disable 2FA' : 'Enable 2FA'
                                }
                            >
                                {user.two_fa_enabled
                                    ? <FiToggleRight size={28} />
                                    : <FiToggleLeft  size={28} />}
                                <span>{user.two_fa_enabled ? 'On' : 'Off'}</span>
                            </button>
                        </div>

                        <div className="divider" />

                        {/* ── DELETE ACCOUNT ── */}
                        <div className="danger-zone">
                            <div className="danger-zone-info">
                                <h3>Delete Account</h3>
                                <p>
                                    This will permanently delete your account, cart, favourites,
                                    and all your reviews. This cannot be reversed.
                                </p>
                            </div>

                            {deleteErr && <div className="alert alert-error">{deleteErr}</div>}

                            {!showDeleteConfirm ? (
                                <button
                                    className="btn btn-danger"
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    <FiTrash2 size={15} /> Delete My Account
                                </button>
                            ) : (
                                <div className="delete-confirm">
                                    <p className="delete-confirm-label">
                                        Are you sure? This is permanent.
                                    </p>
                                    <div className="flex gap-1">
                                        <button
                                            className="btn btn-danger"
                                            onClick={handleDeleteAccount}
                                            disabled={deleting}
                                        >
                                            {deleting ? 'Deleting…' : 'Yes, Delete'}
                                        </button>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => setShowDeleteConfirm(false)}
                                            disabled={deleting}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Profile;