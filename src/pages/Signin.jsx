import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { apiSignin } from '../utils/api';
import Loader from '../components/Loader';
import { GoogleLogin } from '@react-oauth/google';
import '../css/Auth.css';

const Signin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);

            const response = await apiSignin(formData);

            if (response.data.user) {
                login(response.data.user);
                navigate('/');
            } else {
                setError(response.data.message);
            }
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
                    <h1 className="auth-title">Welcome back</h1>
                    <p className="auth-sub">Sign in to your account to continue</p>
                </div>

                {/* ── ERROR ── */}
                {error && <div className="alert alert-error">{error}</div>}

                {/* ── FORM ── */}
                <form onSubmit={handleSubmit} className="auth-form">

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
                        <label className="form-label">Password</label>
                        <div className="input-wrapper">
                            <FiLock size={15} className="input-icon" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                className="form-control input-with-icon input-with-action"
                                placeholder="Enter your password"
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

                    <button
                        type="submit"
                        className="btn btn-ice w-full"
                        style={{ marginTop: '8px', padding: '12px' }}
                        disabled={loading}
                    >
                        {loading ? <Loader small /> : 'Sign In'}
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
                        Don't have an account?{' '}
                        <Link to="/signup">Sign Up</Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Signin;