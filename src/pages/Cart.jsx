import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiMpesaPayment } from '../utils/api';
import Loader from '../components/Loader';
import '../css/Cart.css';

const Cart = () => {
    const { user }                                        = useAuth();
    const { cartItems, cartTotal, cartLoading, getFinalPrice,
            removeFromCart, decrementCartItem,
            clearCart, fetchCart, addToCart }             = useCart();
    const navigate                                        = useNavigate();

    const [phone,   setPhone]   = useState('');
    const [paying,  setPaying]  = useState(false);
    const [payMsg,  setPayMsg]  = useState('');
    const [payErr,  setPayErr]  = useState('');

    // Track which cart_id is busy so buttons disable individually
    const [busyId,  setBusyId]  = useState(null);

    if (!user) {
        return (
            <div className="page-wrapper">
                <div className="alert alert-error">
                    You must be signed in to view your cart.{' '}
                    <button className="link-btn" onClick={() => navigate('/signin')}>Sign In</button>
                </div>
            </div>
        );
    }

    // ── INCREASE QTY ──
    const handleIncrease = async (productId, cartId) => {
        setBusyId(cartId);
        try {
            await addToCart(productId);
        } catch (err) {
            console.error('Failed to increase quantity:', err);
        } finally {
            setBusyId(null);
        }
    };

    // ── DECREASE QTY ──
    const handleDecrease = async (cartId, currentQty) => {
        setBusyId(cartId);
        try {
            if (currentQty <= 1) {
                await removeFromCart(cartId);
            } else {
                await decrementCartItem(cartId);
            }
        } catch (err) {
            console.error('Failed to decrease quantity:', err);
        } finally {
            setBusyId(null);
        }
    };

    // ── REMOVE ──
    const handleRemove = async (cartId) => {
        setBusyId(cartId);
        await removeFromCart(cartId);
        setBusyId(null);
    };

    // ── CHECKOUT ──
    const handleCheckout = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) return;
        setPaying(true);
        setPayErr('');
        setPayMsg('');
        try {
            const formData = new FormData();
            formData.append('user_id', user.user_id);
            formData.append('phone',   phone);
            formData.append('amount',  Math.round(cartTotal));
            await apiMpesaPayment(formData);
            setPayMsg('Payment initiated! Check your phone to complete the M-Pesa prompt. Your cart will clear once confirmed.');
            setPhone('');
        } catch (err) {
            setPayErr(err.response?.data?.message || 'Payment failed. Please try again.');
        } finally {
            setPaying(false);
        }
    };

    return (
        <div className="cart-page">
            <div className="cart-inner">

                <div className="cart-header">
                    <h1>My Cart</h1>
                    <span className="cart-header-count">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
                </div>

                {cartLoading && <div className="loader-wrapper"><Loader /></div>}

                {!cartLoading && cartItems.length === 0 && (
                    <div className="cart-empty">
                        <FiShoppingCart size={48} />
                        <h3>Your cart is empty</h3>
                        <p>Browse our products and add something you like</p>
                        <button className="btn btn-ice" onClick={() => navigate('/')}>
                            Browse Products
                        </button>
                    </div>
                )}

                {!cartLoading && cartItems.length > 0 && (
                    <div className="cart-layout">

                        {/* ── CART ITEMS ── */}
                        <div className="cart-items">
                            {cartItems.map(item => {
                                const finalPrice = getFinalPrice(item);
                                const hasDiscount = Number(item.discount_percent) > 0;

                                return (
                                    <div key={item.cart_id} className="cart-item">

                                        {/* Image */}
                                        <div
                                            className="cart-item-img"
                                            onClick={() => navigate(`/product/${item.product_id}`)}
                                        >
                                            <img
                                                src={`https://maloba.alwaysdata.net/static/images/${item.product_photo}`}
                                                alt={item.product_name}
                                                onError={(e) => { e.target.src = '/placeholder.png'; }}
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="cart-item-info">
                                            <h3
                                                className="cart-item-name"
                                                onClick={() => navigate(`/product/${item.product_id}`)}
                                            >
                                                {item.product_name}
                                            </h3>

                                            {/* Price — show strikethrough if discounted */}
                                            <div className="cart-item-price">
                                                KES {finalPrice.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                                                {hasDiscount && (
                                                    <>
                                                        <span className="cart-item-original-price">
                                                            KES {Number(item.product_cost).toLocaleString()}
                                                        </span>
                                                        <span className="cart-item-discount-badge">
                                                            -{item.discount_percent}%
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {/* ── QTY CONTROLS ── */}
                                            <div className="cart-qty-row">
                                                <div className="cart-qty-controls">
                                                    <button
                                                        className="qty-btn"
                                                        onClick={() => handleDecrease(item.cart_id, item.quantity)}
                                                        disabled={busyId === item.cart_id}
                                                        title={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                                                    >
                                                        {item.quantity === 1
                                                            ? <FiTrash2 size={13} />
                                                            : <FiMinus size={13} />
                                                        }
                                                    </button>

                                                    <span className="qty-value">
                                                        {busyId === item.cart_id
                                                            ? <Loader small />
                                                            : item.quantity
                                                        }
                                                    </span>

                                                    <button
                                                        className="qty-btn"
                                                        onClick={() => handleIncrease(item.product_id, item.cart_id)}
                                                        disabled={busyId === item.cart_id}
                                                        title="Increase quantity"
                                                    >
                                                        <FiPlus size={13} />
                                                    </button>
                                                </div>

                                                <span className="qty-subtotal">
                                                    KES {(finalPrice * item.quantity).toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            className="cart-item-remove"
                                            onClick={() => handleRemove(item.cart_id)}
                                            disabled={busyId === item.cart_id}
                                            title="Remove item"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>

                                    </div>
                                );
                            })}
                        </div>

                        {/* ── ORDER SUMMARY ── */}
                        <div className="cart-summary">
                            <div className="summary-card">
                                <h3 className="summary-title">Order Summary</h3>

                                <div className="summary-rows">
                                    {cartItems.map(item => (
                                        <div key={item.cart_id} className="summary-row">
                                            <span>{item.product_name} × {item.quantity}</span>
                                            <span>
                                                KES {(getFinalPrice(item) * item.quantity).toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="summary-divider" />

                                <div className="summary-total">
                                    <span>Total</span>
                                    <span className="summary-total-amount">
                                        KES {Number(cartTotal).toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                                    </span>
                                </div>

                                {payMsg && <div className="alert alert-success" style={{ marginTop: '16px' }}>{payMsg}</div>}
                                {payErr && <div className="alert alert-error"   style={{ marginTop: '16px' }}>{payErr}</div>}

                                <form onSubmit={handleCheckout} style={{ marginTop: '20px' }}>
                                    <div className="form-group">
                                        <label className="form-label">M-Pesa Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            placeholder="2547XXXXXXXX"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-ice w-full"
                                        style={{ padding: '13px', marginTop: '4px' }}
                                        disabled={paying}
                                    >
                                        {paying
                                            ? <Loader small />
                                            : `Pay KES ${Number(cartTotal).toLocaleString('en-KE', { maximumFractionDigits: 0 })} via M-Pesa`
                                        }
                                    </button>
                                </form>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;