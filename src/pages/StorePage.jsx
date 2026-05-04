// src/pages/StorePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPackage, FiAlertCircle, FiArrowLeft, FiHeart } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { apiGetStore, apiToggleFavourite, apiGetFavourites, imgUrl } from '../utils/api';
import Loader from '../components/Loader';
import '../css/Store.css';

const StarDisplay = ({ rating, count }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i)           stars.push(<FaStar key={i}         className="star-filled" />);
    else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} className="star-filled" />);
    else                        stars.push(<FaRegStar key={i}      className="star-empty" />);
  }
  return (
    <div className="stars">
      {stars}
      {count > 0 && <span style={{ fontSize: '12px', color: 'var(--text-faint)', marginLeft: 4 }}>({count})</span>}
    </div>
  );
};

const formatAmount = (n) => `KES ${Number(n || 0).toLocaleString()}`;

const discountedPrice = (cost, discount) => {
  if (!discount || discount === 0) return null;
  return cost - (cost * discount / 100);
};

const StorePage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [store, setStore]           = useState(null);
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [favouriteIds, setFavouriteIds] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiGetStore(slug);
        const data = res.data;
        // data is the store object with .products appended
        setStore(data);
        setProducts(data.products || []);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Store not found.');
        } else {
          setError('Failed to load store.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  // Favourites (only if logged in)
  useEffect(() => {
    if (!user || !user.user_id) return;
    apiGetFavourites(user.user_id)
      .then(res => setFavouriteIds(res.data.map(f => f.product_id)))
      .catch(() => {});
  }, [user]);

  const handleToggleFavourite = async (e, productId) => {
    e.stopPropagation();
    if (!user) { navigate('/signin'); return; }
    try {
      const fd = new FormData();
      fd.append('user_id', user.user_id);
      fd.append('product_id', productId);
      const res = await apiToggleFavourite(fd);
      if (res.data.status === 'added') {
        setFavouriteIds(prev => [...prev, productId]);
      } else {
        setFavouriteIds(prev => prev.filter(id => id !== productId));
      }
    } catch {}
  };

  if (loading) return <div className="page-wrapper"><div className="loader-wrapper"><Loader /></div></div>;

  if (error) return (
    <div className="page-wrapper">
      <button className="order-detail-back" onClick={() => navigate('/stores')}>
        <FiArrowLeft size={14} /> All Stores
      </button>
      <div className="alert alert-error">{error}</div>
    </div>
  );

  if (!store) return null;

  const isSuspended = store.status === 'suspended';
  const initial     = store.store_name?.charAt(0).toUpperCase();

  return (
    <div className="page-wrapper store-page">
      <button className="order-detail-back" onClick={() => navigate('/stores')}>
        <FiArrowLeft size={14} /> All Stores
      </button>

      {isSuspended && (
        <div className="store-suspended-banner">
          <FiAlertCircle size={16} />
          This store is currently unavailable.
        </div>
      )}

      <div className="store-hero">
        {store.store_banner ? (
          <img
            src={imgUrl(store.store_banner)}
            alt=""
            className="store-hero-banner"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="store-hero-banner-placeholder" />
        )}

        <div className="store-hero-identity">
          {store.store_logo ? (
            <img
              src={imgUrl(store.store_logo)}
              alt={store.store_name}
              className="store-hero-logo"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="store-hero-logo-placeholder">{initial}</div>
          )}

          <div className="store-hero-info">
            <h1 className="store-hero-name">{store.store_name}</h1>
            <div className="store-hero-meta">
              <span className="store-hero-meta-item">
                <FiPackage size={13} />
                {products.length} product{products.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {store.store_description && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '18px 20px',
          marginBottom: '24px'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            {store.store_description}
          </p>
        </div>
      )}

      <div className="store-products-header">
        <h2 className="store-products-title">Products</h2>
        <span className="store-products-count">
          {products.length} listing{products.length !== 1 ? 's' : ''}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <FiPackage size={36} style={{ opacity: 0.3, marginBottom: 16 }} />
          <p>This store has no products yet.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => {
            const final = discountedPrice(product.product_cost, product.discount_percent);
            const isFav = favouriteIds.includes(product.product_id);
            return (
              <div
                key={product.product_id}
                className="product-card"
                onClick={() => navigate(`/product/${product.product_id}`)}
              >
                <button
                  className={`fav-btn ${isFav ? 'fav-active' : ''}`}
                  onClick={(e) => handleToggleFavourite(e, product.product_id)}
                  title={isFav ? 'Remove from favourites' : 'Add to favourites'}
                >
                  <FiHeart size={14} />
                </button>
                {product.discount_percent > 0 && (
                  <span className="badge badge-error" style={{ position: 'absolute', top: 10, left: 10, fontSize: '10px' }}>
                    -{product.discount_percent}%
                  </span>
                )}
                {product.stock_quantity === 0 && (
                  <span className="badge badge-muted" style={{ position: 'absolute', top: 10, left: 10, fontSize: '10px' }}>
                    Out of stock
                  </span>
                )}
                <div className="product-card-img">
                  <img
                    src={imgUrl(product.product_photo)}
                    alt={product.product_name}
                    onError={(e) => { e.target.src = '/placeholder.png'; }}
                  />
                </div>
                <div className="product-card-body">
                  <div className="product-card-category">{product.category}</div>
                  <h3 className="product-card-name">{product.product_name}</h3>
                  <StarDisplay rating={product.avg_rating} count={product.rating_count} />
                  <div className="product-card-price">
                    {final ? (
                      <>
                        <span style={{ color: 'var(--text-faint)', textDecoration: 'line-through', fontSize: '12px', marginRight: 6 }}>
                          {formatAmount(product.product_cost)}
                        </span>
                        <span style={{ color: 'var(--ice)' }}>{formatAmount(final)}</span>
                      </>
                    ) : (
                      formatAmount(product.product_cost)
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StorePage;