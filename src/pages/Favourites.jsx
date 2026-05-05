// src/pages/Favourites.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiGetFavourites, apiToggleFavourite, imgUrl } from '../utils/api';
import Loader from '../components/Loader';
import '../css/Favourites.css';

// ============================================================
//  STAR DISPLAY
// ============================================================
const StarDisplay = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i)           stars.push(<FaStar key={i} className="star-filled" />);
        else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} className="star-filled" />);
        else                        stars.push(<FaRegStar key={i} className="star-empty" />);
    }
    return <div className="stars">{stars}</div>;
};

// ============================================================
//  FAVOURITES
// ============================================================
const Favourites = () => {
    const { user }      = useAuth();
    const { addToCart } = useCart();
    const navigate      = useNavigate();

    const [favourites, setFavourites] = useState([]);
    const [loading,    setLoading]    = useState(false);
    const [error,      setError]      = useState('');
    const [removing,   setRemoving]   = useState(null);
    const [cartMsgs,   setCartMsgs]   = useState({});

    useEffect(() => {
        if (!user) { navigate('/signin'); return; }
        fetchFavourites();
    }, [user]);

    const fetchFavourites = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiGetFavourites(user.user_id);
            setFavourites(response.data);
        } catch (err) {
            setError('Failed to load favourites. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        setRemoving(productId);
        try {
            const formData = new FormData();
            formData.append('user_id',    user.user_id);
            formData.append('product_id', productId);
            await apiToggleFavourite(formData);
            setFavourites(prev => prev.filter(f => f.product_id !== productId));
        } catch (err) {
            console.error('Failed to remove favourite:', err);
        } finally {
            setRemoving(null);
        }
    };

    const handleAddToCart = async (e, productId) => {
        e.stopPropagation();
        const success = await addToCart(productId);
        const msg = success ? 'Added to cart!' : 'Failed. Try again.';
        setCartMsgs(prev => ({ ...prev, [productId]: msg }));
        setTimeout(() => {
            setCartMsgs(prev => { const n = { ...prev }; delete n[productId]; return n; });
        }, 2500);
    };

    // ── FINAL PRICE HELPER ──
    const getFinalPrice = (item) => {
        const discount = Number(item.discount_percent) || 0;
        return Number(item.product_cost) * (1 - discount / 100);
    };

    if (!user) return null;

    return (
        <div className="page-wrapper favs-page">

            {/* ── HEADER ── */}
            <div className="favs-header">
                <div className="favs-title-row">
                    <FiHeart size={22} className="favs-heart-icon" />
                    <h1 className="favs-title">Favourites</h1>
                </div>
                {!loading && !error && (
                    <span className="favs-count">
                        {favourites.length} item{favourites.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <div className="divider" />

            {/* ── STATES ── */}
            {loading && <div className="loader-wrapper"><Loader /></div>}
            {error   && <div className="alert alert-error">{error}</div>}

            {/* ── EMPTY STATE ── */}
            {!loading && !error && favourites.length === 0 && (
                <div className="favs-empty">
                    <div className="favs-empty-icon">
                        <FiHeart size={48} />
                    </div>
                    <h2>Nothing saved yet</h2>
                    <p>Browse the store and tap the heart on any product to save it here.</p>
                    <button className="btn btn-ice mt-3" onClick={() => navigate('/')}>
                        Browse Products
                    </button>
                </div>
            )}

            {/* ── FAVOURITES GRID ── */}
            {!loading && !error && favourites.length > 0 && (
                <div className="favs-grid">
                    {favourites.map(item => {
                        const finalPrice = getFinalPrice(item);
                        const hasDiscount = Number(item.discount_percent) > 0;

                        return (
                            <div
                                key={item.fav_id}
                                className="fav-card"
                                onClick={() => navigate(`/product/${item.product_id}`)}
                                style={{ position: 'relative' }}
                            >
                                {/* Discount badge */}
                                {hasDiscount && (
                                    <span className="badge badge-error" style={{
                                        position: 'absolute',
                                        top: 10,
                                        left: 10,
                                        fontSize: '10px',
                                        zIndex: 2
                                    }}>
                                        -{item.discount_percent}%
                                    </span>
                                )}

                                {/* Remove button */}
                                <button
                                    className="fav-remove-btn"
                                    onClick={(e) => { e.stopPropagation(); handleRemove(item.product_id); }}
                                    disabled={removing === item.product_id}
                                    title="Remove from favourites"
                                >
                                    {removing === item.product_id
                                        ? <Loader small />
                                        : <FiTrash2 size={14} />
                                    }
                                </button>

                                {/* Image */}
                                <div className="fav-card-img">
                                    <img
                                        src={imgUrl(item.product_photo)}
                                        alt={item.product_name}
                                        onError={(e) => { e.target.src = '/placeholder.png'; }}
                                    />
                                </div>

                                {/* Info */}
                                <div className="fav-card-body">
                                    <h3 className="fav-card-name">{item.product_name}</h3>

                                    {item.avg_rating > 0
                                        ? <StarDisplay rating={item.avg_rating} />
                                        : <span className="text-faint" style={{ fontSize: '12px' }}>No reviews yet</span>
                                    }

                                    <div className="fav-card-price">
                                        {hasDiscount ? (
                                            <>
                                                <span style={{
                                                    color: 'var(--gold)',
                                                    fontWeight: 'bold',
                                                }}>
                                                    KES {finalPrice.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                                                </span> <br />
                                                <span style={{
                                                    color: 'var(--text-faint)',
                                                    textDecoration: 'line-through',
                                                    fontSize: '0.85em',
                                                    marginRight: '8px',
                                                    fontWeight: '400',
                                                }}>
                                                    KES {Number(item.product_cost).toLocaleString()}
                                                </span>
                                                
                                            </>
                                        ) : (
                                            <span style={{ color: 'var(--text-primary)' }}>
                                                KES {Number(item.product_cost).toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Cart feedback */}
                                    {cartMsgs[item.product_id] && (
                                        <div className={`fav-cart-msg ${cartMsgs[item.product_id].includes('Failed') ? 'text-error' : 'text-success'}`}>
                                            {cartMsgs[item.product_id]}
                                        </div>
                                    )}

                                    {/* Add to cart */}
                                    <button
                                        className="btn btn-ice fav-cart-btn"
                                        onClick={(e) => handleAddToCart(e, item.product_id)}
                                    >
                                        <FiShoppingCart size={14} /> Add to Cart
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Favourites;