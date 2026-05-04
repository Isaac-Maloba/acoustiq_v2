// src/components/SellerLayout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Seller.css';

const NAV_ITEMS = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/seller/store',     label: 'My Store',   icon: '⬡' },
  { to: '/seller/products',  label: 'My Products', icon: '◉' },
  { to: '/seller/orders',    label: 'Orders',      icon: '◎' },
  { to: '/seller/earnings',  label: 'Earnings',    icon: '◆' },
];

const SellerLayout = ({ title, subtitle, children, storeName }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="page-wrapper" style={{ padding: '32px 24px' }}>
      <div className="seller-page">
        <aside className="seller-sidebar">
          <div className="seller-sidebar-header">
            <p className="seller-sidebar-store-name">
              {storeName || user?.first_name || 'Seller'}
            </p>
            <p className="seller-sidebar-label">SELLER</p>
          </div>

          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`seller-nav-item${isActive ? ' active' : ''}`}
              >
                <span style={{ fontSize: '14px', lineHeight: 1 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </aside>

        <main className="seller-main">
          <h1 className="seller-page-title">{title}</h1>
          {subtitle && <p className="seller-page-sub">{subtitle}</p>}
          {children}
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;