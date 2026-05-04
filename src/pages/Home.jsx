import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHeart, FiSearch, FiChevronDown, FiX } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useAuth } from '../context/AuthContext';
import { apiGetProducts, apiToggleFavourite, apiGetFavourites, imgUrl } from '../utils/api';
import Loader from '../components/Loader';
import '../css/Home.css';

// ============================================================
//  STAR DISPLAY HELPER
// ============================================================
const StarDisplay = ({ rating, count }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            stars.push(<FaStar key={i} className="star-filled" />);
        } else if (rating >= i - 0.5) {
            stars.push(<FaStarHalfAlt key={i} className="star-filled" />);
        } else {
            stars.push(<FaRegStar key={i} className="star-empty" />);
        }
    }
    return (
        <div className="stars">
            {stars}
            {count > 0 && <span className="review-count">({count})</span>}
        </div>
    );
};

// ============================================================
//  FILTER OPTIONS
// ============================================================
const CATEGORIES  = ['Physical Instrument', 'VST Plugin', 'Accessory'];
const BRANDS      = [
    'Fender','Gibson','Yamaha','Roland','Ibanez','Novation','Akai','Shure',
    'Audio-Technica','Focusrite','Boss','Ernie Ball','Hercules','Fiddlerman',
    'Steinberg','Native Instruments','Arturia','Korg','Casio','Pearl',
    'Zildjian','Meinl','Sennheiser','Rode','Behringer','Blackstar',
    'Marshall','Orange','Vox','Other'
];
const LEVELS      = ['Beginner', 'Intermediate', 'Professional'];
const CONDITIONS  = ['New', 'Used - Excellent', 'Used - Good', 'Used - Fair'];
const GENRES      = [
    'Universal','Rock','Blues','Jazz','Classical','Pop','EDM',
    'Hip-Hop','Afrobeats','Gospel','Country','Metal','Reggae','R&B','Folk'
];

// ============================================================
//  HOME
// ============================================================
const Home = () => {
    const { user }   = useAuth();
    const navigate   = useNavigate();
    const location   = useLocation();

    const isSeller = user?.role === 'seller';
    const isAdmin  = user?.role === 'admin';

    // ── PRODUCTS STATE ──
    const [products,     setProducts]     = useState([]);
    const [featured,     setFeatured]     = useState([]);
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState('');
    const [favouriteIds, setFavouriteIds] = useState([]);

    // ── FILTER STATE ──
    const [search,      setSearch]      = useState('');
    const [category,    setCategory]    = useState('');
    const [brand,       setBrand]       = useState('');
    const [level,       setLevel]       = useState('');
    const [condition,   setCondition]   = useState('');
    const [genre,       setGenre]       = useState('');
    const [priceMin,    setPriceMin]    = useState('');
    const [priceMax,    setPriceMax]    = useState('');
    const [openFilter,  setOpenFilter]  = useState('');

    // ── READ CATEGORY FROM URL (navbar links) ──
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cat    = params.get('category');
        if (cat) setCategory(cat);
    }, [location.search]);

    // ── FETCH PRODUCTS ──
    useEffect(() => {
        fetchProducts();
    }, [search, category, brand, level, condition, genre, priceMin, priceMax]);

    // ── FETCH FAVOURITES ──
    useEffect(() => {
        if (user) fetchFavourites();
    }, [user]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError('');
            const params = {};
            if (search)    params.search          = search;
            if (category)  params.category        = category;
            if (brand)     params.brand            = brand;
            if (level)     params.level            = level;
            if (condition) params.condition_status = condition;
            if (genre)     params.genre            = genre;
            if (priceMin)  params.price_min        = priceMin;
            if (priceMax)  params.price_max        = priceMax;

            const response = await apiGetProducts(params);
            const all      = response.data;

            setProducts(all);
            setFeatured(all.filter(p => p.featured === 1).slice(0, 3));
            setLoading(false);
        } catch (err) {
            setError('Failed to load products. Please try again.');
            setLoading(false);
        }
    };

    const fetchFavourites = async () => {
        try {
            const response = await apiGetFavourites(user.user_id);
            setFavouriteIds(response.data.map(f => f.product_id));
        } catch (err) {
            console.error('Failed to fetch favourites:', err);
        }
    };

    const handleToggleFavourite = async (e, productId) => {
        e.stopPropagation();
        if (!user) { navigate('/signin'); return; }
        try {
            const formData = new FormData();
            formData.append('user_id',    user.user_id);
            formData.append('product_id', productId);
            const response = await apiToggleFavourite(formData);
            if (response.data.status === 'added') {
                setFavouriteIds(prev => [...prev, productId]);
            } else {
                setFavouriteIds(prev => prev.filter(id => id !== productId));
            }
        } catch (err) {
            console.error('Failed to toggle favourite:', err);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('');
        setBrand('');
        setLevel('');
        setCondition('');
        setGenre('');
        setPriceMin('');
        setPriceMax('');
    };

    const hasActiveFilters = search || category || brand || level || condition || genre || priceMin || priceMax;

    const toggleFilter = (name) => {
        setOpenFilter(prev => prev === name ? '' : name);
    };

    // ── FINAL PRICE HELPER ──
    const getFinalPrice = (product) => {
        const discount = Number(product.discount_percent) || 0;
        return Number(product.product_cost) * (1 - discount / 100);
    };

    // ── CAROUSEL SETTINGS ──
    const carouselSettings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: false,
        dotsClass: 'hero-dots'
    };

    // ── HERO SLIDES ──
    const heroSlides = [
        {
            tag:      'New Arrivals',
            title:    'Sound that moves',
            titleEm:  'you forward',
            sub:      'Professional instruments and plugins curated for every stage of your journey.',
            btnLabel: 'Shop Instruments',
            btnCat:   'Physical Instrument',
            bg:       'linear-gradient(135deg, #0f0f18 0%, #1a1530 50%, #0e1520 100%)'
        },
        {
            tag:      'VST Plugins',
            title:    'Your studio,',
            titleEm:  'elevated',
            sub:      'Industry-standard VST plugins for producers, beatmakers and sound designers.',
            btnLabel: 'Browse Plugins',
            btnCat:   'VST Plugin',
            bg:       'linear-gradient(135deg, #0d1510 0%, #0f2018 50%, #0a1510 100%)'
        },
        {
            tag:      'Accessories',
            title:    'Every detail',
            titleEm:  'matters',
            sub:      'Strings, stands, cables, cases and everything else your setup needs.',
            btnLabel: 'Shop Accessories',
            btnCat:   'Accessory',
            bg:       'linear-gradient(135deg, #150f0a 0%, #201510 50%, #150e09 100%)'
        }
    ];

    // ── HERO SECONDARY CTA ──
    // Only sellers/admins see "Add a Product"; customers see "Sell on Acoustiq"; guests see "Join Acoustiq"
    const getHeroCta = () => {
        if (isSeller || isAdmin) return { label: 'Add a Product',    path: '/add-product' };
        if (user)                return { label: 'Sell on Acoustiq', path: '/seller/apply' };
        return                          { label: 'Join Acoustiq',    path: '/signup' };
    };
    const heroCta = getHeroCta();

    // ============================================================
    //  RENDER
    // ============================================================
    return (
        <div className="home">

            {/* ── HERO CAROUSEL ── */}
            <section className="hero-section">
                <Slider {...carouselSettings}>
                    {heroSlides.map((slide, i) => (
                        <div key={i}>
                            <div className="hero-slide" style={{ background: slide.bg }}>
                                <div className="hero-glow" />
                                <div className="hero-content">
                                    <div className="hero-tag">✦ {slide.tag}</div>
                                    <h1 className="hero-title">
                                        {slide.title} <em>{slide.titleEm}</em>
                                    </h1>
                                    <p className="hero-sub">{slide.sub}</p>
                                    <div className="hero-cta-row">
                                        <button
                                            className="btn btn-ice"
                                            onClick={() => setCategory(slide.btnCat)}
                                        >
                                            {slide.btnLabel}
                                        </button>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => navigate(heroCta.path)}
                                        >
                                            {heroCta.label}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </section>

            {/* ── SEARCH + FILTER BAR ── */}
            <section className="filter-section">
                <div className="search-row">
                    <div className="search-input-wrapper">
                        <FiSearch size={15} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search instruments, plugins, accessories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                        />
                        {search && (
                            <button className="search-clear" onClick={() => setSearch('')}>
                                <FiX size={14} />
                            </button>
                        )}
                    </div>

                    {/* Filter dropdowns */}
                    {[
                        { name: 'category',  label: 'Category',  options: CATEGORIES, value: category,  setter: setCategory },
                        { name: 'brand',     label: 'Brand',     options: BRANDS,     value: brand,     setter: setBrand },
                        { name: 'level',     label: 'Level',     options: LEVELS,     value: level,     setter: setLevel },
                        { name: 'condition', label: 'Condition', options: CONDITIONS, value: condition, setter: setCondition },
                        { name: 'genre',     label: 'Genre',     options: GENRES,     value: genre,     setter: setGenre },
                    ].map(filter => (
                        <div key={filter.name} className="filter-dropdown-wrapper">
                            <button
                                className={`filter-chip ${filter.value ? 'active' : ''}`}
                                onClick={() => toggleFilter(filter.name)}
                            >
                                {filter.value || filter.label}
                                {filter.value
                                    ? <FiX size={12} onClick={(e) => { e.stopPropagation(); filter.setter(''); }} />
                                    : <FiChevronDown size={12} />
                                }
                            </button>
                            {openFilter === filter.name && (
                                <div className="filter-dropdown-menu">
                                    {filter.options.map(opt => (
                                        <div
                                            key={opt}
                                            className={`filter-dropdown-item ${filter.value === opt ? 'selected' : ''}`}
                                            onClick={() => { filter.setter(opt); setOpenFilter(''); }}
                                        >
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Price filter */}
                    <div className="filter-dropdown-wrapper">
                        <button
                            className={`filter-chip price-chip ${(priceMin || priceMax) ? 'active' : ''}`}
                            onClick={() => toggleFilter('price')}
                        >
                            {priceMin || priceMax ? `KES ${priceMin || '0'} – ${priceMax || '∞'}` : 'Price'}
                            <FiChevronDown size={12} />
                        </button>
                        {openFilter === 'price' && (
                            <div className="filter-dropdown-menu price-menu">
                                <div className="price-inputs">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceMin}
                                        onChange={(e) => setPriceMin(e.target.value)}
                                        className="price-input"
                                    />
                                    <span className="price-dash">–</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceMax}
                                        onChange={(e) => setPriceMax(e.target.value)}
                                        className="price-input"
                                    />
                                </div>
                                <button
                                    className="btn btn-ice w-full"
                                    style={{ fontSize: '12px', padding: '7px' }}
                                    onClick={() => setOpenFilter('')}
                                >
                                    Apply
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Clear all filters */}
                    {hasActiveFilters && (
                        <button className="clear-filters-btn" onClick={clearFilters}>
                            <FiX size={13} /> Clear all
                        </button>
                    )}
                </div>

                {/* ── CATEGORY PILLS ── */}
                <div className="category-pills">
                    {['', ...CATEGORIES].map((cat, i) => (
                        <button
                            key={i}
                            className={`cat-pill ${category === cat ? 'active' : ''}`}
                            onClick={() => setCategory(cat)}
                        >
                            {cat || 'All'}
                        </button>
                    ))}
                </div>
            </section>

            <div className="home-body">

                {/* ── FEATURED / EDITOR'S PICK ── */}
                {featured.length > 0 && !hasActiveFilters && (
                    <section className="featured-section">
                        <div className="section-header">
                            <h2>Editor's Pick</h2>
                        </div>
                        <div className="featured-strip">
                            {featured.map(product => {
                                const finalPrice = getFinalPrice(product);
                                const hasDiscount = Number(product.discount_percent) > 0;
                                return (
                                    <div
                                        key={product.product_id}
                                        className="featured-card"
                                        onClick={() => navigate(`/product/${product.product_id}`)}
                                    >
                                        <div className="featured-card-img">
                                            <img src={imgUrl(product.product_photo)} alt={product.product_name} />
                                        </div>
                                        <div className="featured-card-body">
                                            <span className="badge badge-gold">✦ Featured</span>
                                            <h3 className="featured-card-name">{product.product_name}</h3>
                                            <p className="featured-card-desc">
                                                {product.product_description.slice(0, 100)}...
                                            </p>
                                            <StarDisplay rating={product.avg_rating} count={product.rating_count} />
                                            <div className="featured-card-price">
                                                KES {finalPrice.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                                                {hasDiscount && (
                                                    <span className="product-card-original-price">
                                                        KES {Number(product.product_cost).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── PRODUCT GRID ── */}
                <section className="products-section">
                    <div className="section-header">
                        <h2>{hasActiveFilters ? 'Results' : 'All Products'}</h2>
                        <span className="product-count">{products.length} product{products.length !== 1 ? 's' : ''}</span>
                    </div>

                    {loading && <div className="loader-wrapper"><Loader /></div>}
                    {error   && <div className="alert alert-error">{error}</div>}

                    {!loading && !error && products.length === 0 && (
                        <div className="empty-state">
                            <p>No products found. Try adjusting your filters.</p>
                            <button className="btn btn-ghost mt-2" onClick={clearFilters}>Clear filters</button>
                        </div>
                    )}

                    <div className="product-grid">
                        {products.map(product => {
                            const finalPrice  = getFinalPrice(product);
                            const hasDiscount = Number(product.discount_percent) > 0;

                            return (
                                <div
                                    key={product.product_id}
                                    className="product-card"
                                    onClick={() => navigate(`/product/${product.product_id}`)}
                                >
                                    {/* Discount badge */}
                                    {hasDiscount && (
                                        <span className="product-card-discount-badge">
                                            -{product.discount_percent}%
                                        </span>
                                    )}

                                    {/* Favourite button */}
                                    <button
                                        className={`fav-btn ${favouriteIds.includes(product.product_id) ? 'fav-active' : ''}`}
                                        onClick={(e) => handleToggleFavourite(e, product.product_id)}
                                        title={favouriteIds.includes(product.product_id) ? 'Remove from favourites' : 'Add to favourites'}
                                    >
                                        <FiHeart size={14} />
                                    </button>

                                    {/* Product image */}
                                    <div className="product-card-img">
                                        <img
                                            src={imgUrl(product.product_photo)}
                                            alt={product.product_name}
                                            onError={(e) => { e.target.src = '/placeholder.png'; }}
                                        />
                                    </div>

                                    {/* Product info */}
                                    <div className="product-card-body">
                                        <div className="product-card-category">{product.category}</div>
                                        <h3 className="product-card-name">{product.product_name}</h3>
                                        <StarDisplay rating={product.avg_rating} count={product.rating_count} />
                                        <div className="product-card-price">
                                            KES {finalPrice.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                                            {hasDiscount && (
                                                <span className="product-card-original-price">
                                                    KES {Number(product.product_cost).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Home;