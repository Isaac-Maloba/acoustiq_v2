import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiPackage } from 'react-icons/fi';
import { apiGetStores, imgUrl } from '../utils/api';
import Loader from '../components/Loader';
import '../css/Store.css';

// ============================================================
//  STORES PAGE — public marketplace directory
// ============================================================
const StoresPage = () => {
    const navigate = useNavigate();

    const [stores,  setStores]  = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');
    const [search,  setSearch]  = useState('');
    const [query,   setQuery]   = useState(''); // debounced

    // Debounce search — fire API call 400ms after user stops typing
    useEffect(() => {
        const t = setTimeout(() => setQuery(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await apiGetStores(query);
                setStores(res.data);
            } catch {
                setError('Failed to load stores. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [query]);

    // ── STORE LOGO FALLBACK ──
    const StoreLogo = ({ store }) => {
        if (store.logo_filename) {
            return (
                <img
                    src={imgUrl(store.logo_filename)}
                    alt={store.store_name}
                    className="store-card-logo"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
            );
        }
        return (
            <div className="store-card-logo-placeholder">
                {store.store_name?.charAt(0).toUpperCase()}
            </div>
        );
    };

    return (
        <div className="page-wrapper stores-page">

            {/* ── HEADER ── */}
            <div className="stores-header">
                <h1 className="stores-title">Marketplace</h1>
                <p className="stores-sub">
                    Browse stores from independent sellers across Kenya.
                </p>

                <div className="stores-search-row">
                    <div className="stores-search-wrapper">
                        <FiSearch size={14} className="stores-search-icon" />
                        <input
                            type="text"
                            className="stores-search-input"
                            placeholder="Search stores…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* ── STATES ── */}
            {loading && <div className="loader-wrapper"><Loader /></div>}
            {error   && <div className="alert alert-error">{error}</div>}

            {!loading && !error && stores.length === 0 && (
                <div className="empty-state">
                    <FiShoppingBag size={36} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <p>
                        {query
                            ? `No stores found for "${query}".`
                            : 'No stores available yet.'}
                    </p>
                    {query && (
                        <button
                            className="btn btn-ghost mt-2"
                            onClick={() => setSearch('')}
                        >
                            Clear search
                        </button>
                    )}
                </div>
            )}

            {/* ── GRID ── */}
            {!loading && !error && stores.length > 0 && (
                <>
                    <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
                        {stores.length} store{stores.length !== 1 ? 's' : ''}
                        {query && ` for "${query}"`}
                    </p>

                    <div className="stores-grid">
                        {stores.map(store => (
                            <div
                                key={store.store_id}
                                className="store-card"
                                onClick={() => navigate(`/store/${store.slug}`)}
                            >
                                {/* Banner */}
                                {store.banner_filename ? (
                                    <img
                                        src={imgUrl(store.banner_filename)}
                                        alt=""
                                        className="store-card-banner"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="store-card-banner-placeholder">
                                        <FiShoppingBag size={24} />
                                    </div>
                                )}

                                <div className="store-card-body">
                                    {/* Floating logo */}
                                    <div className="store-card-logo-wrap">
                                        <StoreLogo store={store} />
                                    </div>

                                    <div className="store-card-info">
                                        <h3 className="store-card-name">{store.store_name}</h3>
                                        {store.tagline && (
                                            <p className="store-card-tagline">{store.tagline}</p>
                                        )}
                                        <div className="store-card-meta">
                                            <span className="store-card-meta-item">
                                                <FiPackage size={12} />
                                                {store.product_count ?? 0} product{store.product_count !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default StoresPage;