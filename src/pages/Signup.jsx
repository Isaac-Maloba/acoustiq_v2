import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { apiSignup } from '../utils/api';
import Loader from '../components/Loader';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import '../css/Auth.css';

const Signup = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [firstName,   setFirstName]   = useState('');
    const [lastName,    setLastName]    = useState('');
    const [email,       setEmail]       = useState('');
    const [phone,       setPhone]       = useState('');
    const [password,    setPassword]    = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showPass,    setShowPass]    = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading,     setLoading]     = useState(false);
    const [error,       setError]       = useState('');
    const [success,     setSuccess]     = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPass) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (phone.length < 10) {
            setError('Please enter a valid phone number.');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('first_name', firstName);
            formData.append('last_name',  lastName);
            formData.append('email',      email);
            formData.append('phone',      phone);
            formData.append('password',   password);

            const response = await apiSignup(formData);
            setSuccess(response.data.message);

            setFirstName('');
            setLastName('');
            setEmail('');
            setPhone('');
            setPassword('');
            setConfirmPass('');

            setTimeout(() => navigate('/signin'), 2000);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Something went wrong. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('credential', credentialResponse.credential);

            const res = await fetch('https://maloba.alwaysdata.net/api/auth/google', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok && data.user) {
                login(data.user);
                navigate('/');
            } else {
                setError(data.message || 'Google Sign-In failed.');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                {/* ── HEADER ── */}
                <div className="auth-header">
                    <div className="auth-logo">Acou<span>stiq</span></div>
                    <h1 className="auth-title">Create your account</h1>
                    <p className="auth-sub">Join Acoustiq and start shopping</p>
                </div>

                {/* ── ALERTS ── */}
                {error   && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success} Redirecting to sign in...</div>}

                {/* ── FORM ── */}
                <form onSubmit={handleSubmit} className="auth-form">

                    <div className="name-row">
                        <div className="form-group">
                            <label className="form-label">First Name</label>
                            <div className="input-wrapper">
                                <FiUser size={15} className="input-icon" />
                                <input
                                    type="text"
                                    className="form-control input-with-icon"
                                    placeholder="Isaac"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Last Name</label>
                            <div className="input-wrapper">
                                <FiUser size={15} className="input-icon" />
                                <input
                                    type="text"
                                    className="form-control input-with-icon"
                                    placeholder="Maloba"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-wrapper">
                            <FiMail size={15} className="input-icon" />
                            <input
                                type="email"
                                className="form-control input-with-icon"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <div className="input-wrapper">
                            <FiPhone size={15} className="input-icon" />
                            <input
                                type="tel"
                                className="form-control input-with-icon"
                                placeholder="2547XXXXXXXX"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrapper">
                            <FiLock size={15} className="input-icon" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                className="form-control input-with-icon input-with-action"
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="input-action-btn"
                                onClick={() => setShowPass(!showPass)}
                            >
                                {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <div className="input-wrapper">
                            <FiLock size={15} className="input-icon" />
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                className="form-control input-with-icon input-with-action"
                                placeholder="Repeat your password"
                                value={confirmPass}
                                onChange={(e) => setConfirmPass(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="input-action-btn"
                                onClick={() => setShowConfirm(!showConfirm)}
                            >
                                {showConfirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-ice w-full"
                        style={{ marginTop: '8px', padding: '12px' }}
                        disabled={loading}
                    >
                        {loading ? <Loader small /> : 'Create Account'}
                    </button>

                </form>

                {/* ── DIVIDER ── */}
                <div className="auth-divider">
                    <span>or</span>
                </div>

                {/* ── GOOGLE ── */}
                <div className="google-btn-wrapper">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Sign-In failed. Please try again.')}
                        width="100%"
                    />
                </div>

                {/* ── FOOTER ── */}
                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/signin">Sign In</Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Signup;