import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiShoppingCart, FiHeart, FiUser, FiMenu, FiX,
    FiSun, FiMoon, FiLogOut, FiSettings, FiPackage,
    FiShield, FiAlertCircle, FiShoppingBag, FiBarChart2
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import '../css/Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const isSeller = user?.role === 'seller';
    const isAdmin = user?.role === 'admin';

    const handleLogout = () => {
        logout();
        setProfileOpen(false);
        setMenuOpen(false);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">

                {/* ── LOGO ── */}
                <Link to="/" className="navbar-logo">
                    Acou<span>stiq</span>
                </Link>

                {/* ── NAV LINKS (desktop) ── */}
                <div className="navbar-links">
                    <Link to="/">Shop</Link>
                    <Link to="/?category=Physical+Instrument">Instruments</Link>
                    <Link to="/?category=VST+Plugin">Plugins</Link>
                    <Link to="/?category=Accessory">Accessories</Link>
                    <Link to="/stores">Stores</Link>
                </div>

                {/* ── RIGHT SIDE ── */}
                <div className="navbar-right">

                    {/* Theme toggle */}
                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                        {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
                    </button>

                    {user ? (
                        <>
                            {/* Greeting */}
                            <span className="navbar-greeting">
                                Hi, {user.first_name} ✦
                            </span>

                            {/* Favourites */}
                            <Link to="/favourites" className="navbar-icon-btn" title="Favourites">
                                <FiHeart size={18} />
                            </Link>

                            {/* Cart */}
                            <Link to="/cart" className="navbar-icon-btn cart-btn" title="Cart">
                                <FiShoppingCart size={18} />
                                {cartCount > 0 && (
                                    <span className="cart-badge">{cartCount}</span>
                                )}
                            </Link>

                            {/* Profile dropdown */}
                            <div className="profile-menu-wrapper">
                                <button
                                    className="profile-avatar"
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    title="Account"
                                >
                                    {user.first_name.charAt(0).toUpperCase()}
                                    {user.last_name.charAt(0).toUpperCase()}
                                    {/* Role indicator dot */}
                                    {(isSeller || isAdmin) && (
                                        <span className={`role-dot ${isAdmin ? 'role-dot-admin' : 'role-dot-seller'}`} />
                                    )}
                                </button>

                                {profileOpen && (
                                    <div className="profile-dropdown">
                                        <div className="profile-dropdown-header">
                                            <p className="profile-name">
                                                {user.first_name} {user.last_name}
                                            </p>
                                            <p className="profile-email">{user.email}</p>
                                            {(isSeller || isAdmin) && (
                                                <span className={`navbar-role-badge ${isAdmin ? 'badge-admin' : 'badge-seller'}`}>
                                                    {isAdmin ? '⬡ Admin' : '◈ Seller'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="profile-dropdown-divider" />

                                        {/* Always visible */}
                                        <Link
                                            to="/profile"
                                            className="profile-dropdown-item"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <FiSettings size={14} /> My Profile
                                        </Link>
                                        <Link
                                            to="/orders"
                                            className="profile-dropdown-item"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <FiPackage size={14} /> My Orders
                                        </Link>
                                        <Link
                                            to="/complaints"
                                            className="profile-dropdown-item"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <FiAlertCircle size={14} /> My Complaints
                                        </Link>

                                        {/* Seller links */}
                                        {(isSeller || isAdmin) && (
                                            <>
                                                <div className="profile-dropdown-divider" />
                                                <div className="profile-dropdown-section-label">Seller</div>
                                                <Link
                                                    to="/seller/dashboard"
                                                    className="profile-dropdown-item"
                                                    onClick={() => setProfileOpen(false)}
                                                >
                                                    <FiBarChart2 size={14} /> Dashboard
                                                </Link>
                                                <Link
                                                    to="/seller/products"
                                                    className="profile-dropdown-item"
                                                    onClick={() => setProfileOpen(false)}
                                                >
                                                    <FiShoppingBag size={14} /> My Products
                                                </Link>
                                                <Link
                                                    to="/add-product"
                                                    className="profile-dropdown-item"
                                                    onClick={() => setProfileOpen(false)}
                                                >
                                                    <FiUser size={14} /> Add Product
                                                </Link>
                                            </>
                                        )}

                                        {/* Admin links */}
                                        {isAdmin && (
                                            <>
                                                <div className="profile-dropdown-divider" />
                                                <div className="profile-dropdown-section-label">Admin</div>
                                                <Link
                                                    to="/admin/dashboard"
                                                    className="profile-dropdown-item"
                                                    onClick={() => setProfileOpen(false)}
                                                >
                                                    <FiShield size={14} /> Admin Panel
                                                </Link>
                                            </>
                                        )}

                                        <div className="profile-dropdown-divider" />
                                        <button
                                            className="profile-dropdown-item danger"
                                            onClick={handleLogout}
                                        >
                                            <FiLogOut size={14} /> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/signin" className="btn btn-ghost" style={{ padding: '7px 16px', fontSize: '13px' }}>
                                Sign In
                            </Link>
                            <Link to="/signup" className="btn btn-ice" style={{ padding: '7px 16px', fontSize: '13px' }}>
                                Sign Up
                            </Link>
                        </>
                    )}

                    {/* Mobile menu toggle */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                    </button>
                </div>
            </div>

            {/* ── MOBILE MENU ── */}
            {menuOpen && (
                <div className="mobile-menu">
                    <Link to="/" onClick={() => setMenuOpen(false)}>Shop</Link>
                    <Link to="/?category=Physical+Instrument" onClick={() => setMenuOpen(false)}>Instruments</Link>
                    <Link to="/?category=VST+Plugin" onClick={() => setMenuOpen(false)}>Plugins</Link>
                    <Link to="/?category=Accessory" onClick={() => setMenuOpen(false)}>Accessories</Link>
                    <Link to="/stores" onClick={() => setMenuOpen(false)}>Stores</Link>

                    {user ? (
                        <>
                            <div className="mobile-menu-divider" />
                            <Link to="/favourites" onClick={() => setMenuOpen(false)}>Favourites</Link>
                            <Link to="/cart" onClick={() => setMenuOpen(false)}>
                                Cart {cartCount > 0 && `(${cartCount})`}
                            </Link>
                            <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
                            <Link to="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>

                            {(isSeller || isAdmin) && (
                                <>
                                    <div className="mobile-menu-divider" />
                                    <Link to="/seller/dashboard" onClick={() => setMenuOpen(false)}>Seller Dashboard</Link>
                                    <Link to="/seller/products" onClick={() => setMenuOpen(false)}>My Products</Link>
                                    <Link to="/add-product" onClick={() => setMenuOpen(false)}>Add Product</Link>
                                </>
                            )}

                            {isAdmin && (
                                <>
                                    <div className="mobile-menu-divider" />
                                    <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                                </>
                            )}

                            <div className="mobile-menu-divider" />
                            <button onClick={handleLogout}>Sign Out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/signin" onClick={() => setMenuOpen(false)}>Sign In</Link>
                            <Link to="/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;