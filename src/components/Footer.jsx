// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import '../css/Footer.css';

const Footer = () => {
    // Shared text style — uses theme-aware variable so it works in both dark & light mode
    const textStyle = {
        fontFamily: "var(--font-head)",   // Syne
        color: "var(--text-primary)",     // ← theme‑aware: light in dark mode, dark in light mode
        fontWeight: 700,
        fontSize: "15px",
        lineHeight: 1.6,
    };

    return (
        <footer className="footer">
            <div className="footer-inner">

                {/* ── BRAND COL ── */}
                <div className="footer-brand">
                    <div className="footer-logo" style={{ ...textStyle, fontSize: "20px" }}>
                        Acou<span style={{ color: 'var(--ice)' }}>stiq</span>
                    </div>
                    <p className="footer-tagline" style={textStyle}>
                        Premium sound gear for musicians at every level.
                        Based in Nairobi, delivering across Kenya.
                    </p>
                    <div className="footer-contact">
                        <div className="footer-contact-item" style={textStyle}>
                            <FiMapPin size={15} style={{ marginRight: '6px' }} />
                            <span>Nairobi, Kenya</span>
                        </div>
                        <div className="footer-contact-item" style={textStyle}>
                            <FiPhone size={15} style={{ marginRight: '6px' }} />
                            <span>+254 119 043 365</span>
                        </div>
                        <div className="footer-contact-item" style={textStyle}>
                            <FiMail size={15} style={{ marginRight: '6px' }} />
                            <span>isaaccmaloba@gmail.com</span>
                        </div>
                    </div>
                </div>

                {/* ── SHOP COL ── */}
                <div className="footer-col">
                    <h4 style={{ ...textStyle, fontSize: "16px", letterSpacing: "0.05em", marginBottom: "12px" }}>Shop</h4>
                    <Link to="/?category=Physical+Instrument" style={{ ...textStyle, display: 'block', textDecoration: 'none' }}>Instruments</Link>
                    <Link to="/?category=VST+Plugin" style={{ ...textStyle, display: 'block', textDecoration: 'none' }}>VST Plugins</Link>
                    <Link to="/?category=Accessory" style={{ ...textStyle, display: 'block', textDecoration: 'none' }}>Accessories</Link>
                    <Link to="/" style={{ ...textStyle, display: 'block', textDecoration: 'none' }}>New Arrivals</Link>
                </div>

                {/* ── ACCOUNT COL ── */}
                <div className="footer-col">
                    <h4 style={{ ...textStyle, fontSize: "16px", letterSpacing: "0.05em", marginBottom: "12px" }}>Account</h4>
                    <Link to="/signin" style={{ ...textStyle, display: 'block', textDecoration: 'none' }}>Sign In</Link>
                    <Link to="/signup" style={{ ...textStyle, display: 'block', textDecoration: 'none' }}>Sign Up</Link>
                    <Link to="/cart" style={{ ...textStyle, display: 'block', textDecoration: 'none' }}>My Cart</Link>
                    <Link to="/favourites" style={{ ...textStyle, display: 'block', textDecoration: 'none' }}>Favourites</Link>
                    <Link to="/profile" style={{ ...textStyle, display: 'block', textDecoration: 'none' }}>My Profile</Link>
                </div>

                {/* ── INFO COL ── */}
                <div className="footer-col">
                    <h4 style={{ ...textStyle, fontSize: "16px", letterSpacing: "0.05em", marginBottom: "12px" }}>Info</h4>
                    <Link to="/about" style={{ ...textStyle, display: 'block', textDecoration: 'none' }}>About Us</Link>
                    <Link to="/contact" style={{ ...textStyle, display: 'block', textDecoration: 'none' }}>Contact</Link>
                    <Link to="/returns" style={{ ...textStyle, display: 'block', textDecoration: 'none' }}>Returns Policy</Link>
                    <Link to="/shipping" style={{ ...textStyle, display: 'block', textDecoration: 'none' }}>Shipping Info</Link>
                </div>

            </div>

            {/* ── BOTTOM BAR ── */}
            <div className="footer-bottom">
                <div className="footer-inner">
                    <p className="footer-copy" style={textStyle}>
                        © {new Date().getFullYear()} Acoustiq. All rights reserved. Developed by Isaac Maloba
                    </p>
                    <div className="footer-mpesa" style={textStyle}>
                        <span>Payments secured via</span>
                        <span className="mpesa-badge" style={{ marginLeft: '6px', color: 'var(--gold)', fontWeight: 800 }}>M-PESA</span>
                    </div>
                </div>
            </div>

        </footer>
    );
};

export default Footer;