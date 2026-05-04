// src/pages/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiChevronLeft, FiEdit, FiPackage } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
    apiGetProduct,
    apiGetRatings,
    apiAddRating,
    apiToggleFavourite,
    apiGetFavourites,
    imgUrl
} from '../utils/api';
import Loader from '../components/Loader';
import '../css/ProductDetail.css';

// ============================================================
//  STAR DISPLAY
// ============================================================
const StarDisplay = ({ rating, count }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) stars.push(<FaStar key={i} className="star-filled" />);
        else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} className="star-filled" />);
        else stars.push(<FaRegStar key={i} className="star-empty" />);
    }
    return (
        <div className="stars">
            {stars}
            {count > 0 && <span className="review-count">({count} review{count !== 1 ? 's' : ''})</span>}
        </div>
    );
};

// ============================================================
//  INTERACTIVE STAR PICKER
// ============================================================
const StarPicker = ({ value, onChange }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="star-picker">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    className={`star-pick-btn ${(hovered || value) >= star ? 'lit' : ''}`}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(star)}
                >
                    <FaStar size={22} />
                </button>
            ))}
            {value > 0 && (
                <span className="star-pick-label">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
                </span>
            )}
        </div>
    );
};

// ============================================================
//  PRODUCT DETAIL
// ============================================================
const ProductDetail = () => {
    const { product_id } = useParams();
    const { user }       = useAuth();
    const { addToCart }  = useCart();
    const navigate       = useNavigate();

    const isAdmin = user?.role === 'admin';

    // ── PRODUCT STATE ──
    const [product,     setProduct]     = useState(null);
    const [allImages,   setAllImages]   = useState([]);
    const [activeImg,   setActiveImg]   = useState('');
    const [related,     setRelated]     = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [error,       setError]       = useState('');

    // ── FAVOURITE STATE ──
    const [isFav,       setIsFav]       = useState(false);

    // ── CART STATE ──
    const [cartMsg,     setCartMsg]     = useState('');
    const [cartAdding,  setCartAdding]  = useState(false);

    // ── RATINGS STATE ──
    const [ratings,     setRatings]     = useState([]);
    const [ratingsLoad, setRatingsLoad] = useState(false);
    const [myStars,     setMyStars]     = useState(0);
    const [myComment,   setMyComment]   = useState('');
    const [ratingMsg,   setRatingMsg]   = useState('');
    const [ratingErr,   setRatingErr]   = useState('');
    const [submitting,  setSubmitting]  = useState(false);

    // ── FETCH PRODUCT ──
    useEffect(() => {
        fetchProduct();
        fetchRatings();
        window.scrollTo(0, 0);
    }, [product_id]);

    // ── FETCH FAVOURITES ──
    useEffect(() => {
        if (user) fetchFavouriteStatus();
    }, [user, product_id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiGetProduct(product_id);
            const data     = response.data;
            setProduct(data);
            setRelated(data.related || []);

            // Build image gallery: main photo + extra images
            const imgs = [data.product_photo, ...(data.extra_images || []).map(i => i.image_name)];
            setAllImages(imgs);
            setActiveImg(imgs[0]);
            setLoading(false);
        } catch (err) {
            setError('Failed to load product. Please try again.');
            setLoading(false);
        }
    };

    const fetchRatings = async () => {
        try {
            setRatingsLoad(true);
            const response = await apiGetRatings(product_id);
            // API returns { ratings: [...], average: ..., count: ... }
            setRatings(response.data.ratings || []);
            setRatingsLoad(false);
        } catch (err) {
            setRatingsLoad(false);
        }
    };

    const fetchFavouriteStatus = async () => {
        try {
            const response = await apiGetFavourites(user.user_id);
            const ids      = response.data.map(f => f.product_id);
            setIsFav(ids.includes(parseInt(product_id)));
        } catch (err) {
            console.error('Failed to fetch favourite status:', err);
        }
    };

    // ── ADD TO CART ──
    const handleAddToCart = async () => {
        if (!user) { navigate('/signin'); return; }
        setCartAdding(true);
        const success = await addToCart(product_id);
        setCartAdding(false);
        if (success) {
            setCartMsg('Added to cart!');
            setTimeout(() => setCartMsg(''), 3000);
        } else {
            setCartMsg('Failed to add. Please try again.');
        }
    };

    // ── TOGGLE FAVOURITE ──
    const handleToggleFav = async () => {
        if (!user) { navigate('/signin'); return; }
        try {
            const formData = new FormData();
            formData.append('user_id',    user.user_id);
            formData.append('product_id', product_id);
            const response = await apiToggleFavourite(formData);
            setIsFav(response.data.status === 'added');
        } catch (err) {
            console.error('Failed to toggle favourite:', err);
        }
    };

    // ── SUBMIT RATING ──
    const handleSubmitRating = async (e) => {
        e.preventDefault();
        if (!user)        { navigate('/signin'); return; }
        if (myStars === 0) { setRatingErr('Please select a star rating.'); return; }

        setSubmitting(true);
        setRatingErr('');
        setRatingMsg('');

        try {
            const formData = new FormData();
            formData.append('user_id',    user.user_id);
            formData.append('product_id', product_id);
            formData.append('stars',      myStars);
            formData.append('comment',    myComment);

            await apiAddRating(formData);
            setRatingMsg('Rating submitted successfully!');
            setMyStars(0);
            setMyComment('');
            fetchRatings();
            fetchProduct();
            setTimeout(() => setRatingMsg(''), 4000);
        } catch (err) {
            setRatingErr(
                err.response?.data?.message ||
                'Failed to submit rating. Please try again.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ── LOADING / ERROR STATES ──
    if (loading) return <div className="loader-wrapper"><Loader /></div>;
    if (error)   return <div className="page-wrapper"><div className="alert alert-error">{error}</div></div>;
    if (!product) return null;

    // ── PRICE CALCULATION ──
    const discount   = Number(product.discount_percent) || 0;
    const finalPrice = Number(product.product_cost) * (1 - discount / 100);
    const hasDiscount = discount > 0;

    // ── STOCK STATUS ──
    const stock       = Number(product.stock_quantity);
    const outOfStock  = stock === 0;
    const lowStock    = stock > 0 && stock <= 5;

    // ── CAN EDIT: owner or admin ──
    const canEdit = user && (user.user_id === product.added_by || isAdmin);

    // ============================================================
    //  RENDER
    // ============================================================
    return (
        <div className="product-detail-page">
            <div className="product-detail-inner">

                {/* ── BACK BUTTON ── */}
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FiChevronLeft size={16} /> Back
                </button>

                {/* ── MAIN PRODUCT SECTION ── */}
                <div className="product-main">

                    {/* ── IMAGE GALLERY ── */}
                    <div className="product-gallery">
                        <div className="gallery-main">
                            <img
                                src={imgUrl(activeImg)}
                                alt={product.product_name}
                                onError={(e) => { e.target.src = '/placeholder.png'; }}
                            />
                            {outOfStock && (
                                <div className="gallery-out-of-stock-overlay">Out of Stock</div>
                            )}
                        </div>
                        {allImages.length > 1 && (
                            <div className="gallery-thumbs">
                                {allImages.map((img, i) => (
                                    <div
                                        key={i}
                                        className={`gallery-thumb ${activeImg === img ? 'active' : ''}`}
                                        onClick={() => setActiveImg(img)}
                                    >
                                        <img
                                            src={imgUrl(img)}
                                            alt={`View ${i + 1}`}
                                            onError={(e) => { e.target.src = '/placeholder.png'; }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── PRODUCT INFO ── */}
                    <div className="product-info">

                        {/* Category + Edit button */}
                        <div className="product-info-top">
                            <span className="badge badge-ice">{product.category}</span>
                            {canEdit && (
                                <button
                                    className="btn btn-ghost"
                                    style={{ fontSize: '12px', padding: '6px 12px' }}
                                    onClick={() => navigate(`/edit-product/${product.product_id}`)}
                                >
                                    <FiEdit size={13} /> Edit Product
                                </button>
                            )}
                        </div>

                        <h1 className="product-name">{product.product_name}</h1>

                        {/* Store link */}
                        {product.store_name && (
                            <button
                                className="product-store-link"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/store/${product.store_slug}`);
                                }}
                            >
                                {product.store_name}
                            </button>
                        )}

                        {/* Rating summary */}
                        <div className="product-rating-row">
                            <StarDisplay rating={product.avg_rating || 0} count={product.rating_count || 0} />
                        </div>

                        {/* Price */}
                        <div className="product-price">
                            KES {finalPrice.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                            {hasDiscount && (
                                <span className="product-original-price">
                                    KES {Number(product.product_cost).toLocaleString()}
                                </span>
                            )}
                            {hasDiscount && (
                                <span className="badge badge-error" style={{ fontSize: '11px', marginLeft: '8px' }}>
                                    -{discount}% OFF
                                </span>
                            )}
                        </div>

                        {/* Stock status */}
                        <div className="product-stock-status">
                            <FiPackage size={13} />
                            {outOfStock
                                ? <span className="stock-out">Out of stock</span>
                                : lowStock
                                    ? <span className="stock-low">Only {stock} left</span>
                                    : <span className="stock-ok">In stock</span>
                            }
                        </div>

                        {/* Description */}
                        <div className="product-description">
                            <h3>Description</h3>
                            <p>{product.product_description}</p>
                        </div>

                        {/* Specs */}
                        <div className="product-specs">
                            {[
                                { label: 'Brand',     value: product.brand },
                                { label: 'Type',      value: product.instrument_type },
                                { label: 'Genre',     value: product.genre },
                                { label: 'Level',     value: product.level },
                                { label: 'Condition', value: product.condition_status },
                                { label: 'Format',    value: product.format !== 'N/A' ? product.format : null },
                            ].filter(s => s.value).map(spec => (
                                <div key={spec.label} className="spec-row">
                                    <span className="spec-label">{spec.label}</span>
                                    <span className="spec-value">{spec.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Cart feedback */}
                        {cartMsg && (
                            <div className={`alert ${cartMsg.includes('Failed') ? 'alert-error' : 'alert-success'}`}>
                                {cartMsg}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="product-actions">
                            <button
                                className="btn btn-ice"
                                style={{ flex: 1, padding: '13px' }}
                                onClick={handleAddToCart}
                                disabled={cartAdding || outOfStock}
                            >
                                {cartAdding
                                    ? <Loader small />
                                    : outOfStock
                                        ? 'Out of Stock'
                                        : <><FiShoppingCart size={16} /> Add to Cart</>
                                }
                            </button>
                            <button
                                className={`btn fav-action-btn ${isFav ? 'fav-action-active' : 'btn-ghost'}`}
                                onClick={handleToggleFav}
                                title={isFav ? 'Remove from favourites' : 'Add to favourites'}
                            >
                                <FiHeart size={18} />
                            </button>
                        </div>

                    </div>
                </div>

                {/* ── RATINGS SECTION ── */}
                <div className="ratings-section">
                    <h2 className="ratings-title">Customer Reviews</h2>

                    {/* Submit rating form */}
                    {user ? (
                        <div className="rating-form-card">
                            <h3>Leave a Review</h3>
                            {ratingErr && <div className="alert alert-error">{ratingErr}</div>}
                            {ratingMsg && <div className="alert alert-success">{ratingMsg}</div>}
                            <form onSubmit={handleSubmitRating}>
                                <div className="form-group">
                                    <label className="form-label">Your Rating</label>
                                    <StarPicker value={myStars} onChange={setMyStars} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Your Review (optional)</label>
                                    <textarea
                                        className="form-control"
                                        placeholder="Share your experience with this product..."
                                        value={myComment}
                                        onChange={(e) => setMyComment(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-ice"
                                    disabled={submitting}
                                >
                                    {submitting ? <Loader small /> : 'Submit Review'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="rating-signin-prompt">
                            <p>
                                <button className="link-btn" onClick={() => navigate('/signin')}>
                                    Sign in
                                </button>{' '}
                                to leave a review.
                            </p>
                        </div>
                    )}

                    {/* Existing ratings */}
                    <div className="ratings-list">
                        {ratingsLoad && <div className="loader-wrapper"><Loader /></div>}
                        {!ratingsLoad && ratings.length === 0 && (
                            <p className="no-ratings">No reviews yet. Be the first!</p>
                        )}
                        {ratings.map(rating => (
                            <div key={rating.rating_id} className="rating-card">
                                <div className="rating-card-header">
                                    <div className="rating-avatar">
                                        {rating.first_name.charAt(0)}{rating.last_name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="rating-author">
                                            {rating.first_name} {rating.last_name}
                                        </div>
                                        <div className="rating-date">
                                            {new Date(rating.created_at).toLocaleDateString('en-KE', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <div className="rating-stars-display">
                                        <StarDisplay rating={rating.stars} count={0} />
                                    </div>
                                </div>
                                {rating.comment && (
                                    <p className="rating-comment">{rating.comment}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── RELATED PRODUCTS ── */}
                {related.length > 0 && (
                    <div className="related-section">
                        <h2 className="related-title">Related Products</h2>
                        <div className="related-grid">
                            {related.map(item => {
                                const relDiscount   = Number(item.discount_percent) || 0;
                                const relFinalPrice = Number(item.product_cost) * (1 - relDiscount / 100);
                                return (
                                    <div
                                        key={item.product_id}
                                        className="related-card"
                                        onClick={() => navigate(`/product/${item.product_id}`)}
                                    >
                                        <div className="related-card-img">
                                            <img
                                                src={imgUrl(item.product_photo)}
                                                alt={item.product_name}
                                                onError={(e) => { e.target.src = '/placeholder.png'; }}
                                            />
                                        </div>
                                        <div className="related-card-body">
                                            <h4 className="related-card-name">{item.product_name}</h4>
                                            <StarDisplay rating={item.avg_rating || 0} count={0} />
                                            <div className="related-card-price">
                                                KES {relFinalPrice.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                                                {relDiscount > 0 && (
                                                    <span className="product-card-original-price">
                                                        KES {Number(item.product_cost).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProductDetail;