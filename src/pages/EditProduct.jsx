// src/pages/EditProduct.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUpload, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { apiGetProduct, apiEditProduct, apiDeleteProduct } from '../utils/api';
import Loader from '../components/Loader';
import '../css/AddProduct.css';

// ============================================================
//  DROPDOWN OPTIONS (same as AddProduct)
// ============================================================
const CATEGORIES = ['Physical Instrument', 'VST Plugin', 'Accessory'];

const INSTRUMENT_TYPES = [
    'Electric Guitar', 'Acoustic Guitar', 'Bass Guitar', 'Classical Guitar',
    'Electronic Drum Kit', 'Acoustic Drum Kit',
    'Digital Piano', 'Acoustic Piano', 'Keyboard',
    'MIDI Controller', 'Audio Interface', 'Microphone',
    'Studio Headphones', 'Violin', 'Viola', 'Cello', 'Double Bass',
    'Ukulele', 'Saxophone', 'Trumpet', 'Flute', 'Clarinet', 'Trombone',
    'DJ Controller', 'Synthesizer', 'Amplifier', 'Effects Pedal',
    'Studio Monitor', 'VST Instrument', 'VST Effect', 'VST Bundle',
    'Guitar Strings', 'Bass Strings', 'Violin Strings',
    'Guitar Pick', 'Guitar Strap', 'Guitar Stand', 'Guitar Capo',
    'Drum Sticks', 'Drum Pad', 'Drum Hardware',
    'Instrument Cable', 'Audio Cable',
    'Microphone Stand', 'Pop Filter',
    'Rosin', 'Bow', 'Case', 'Tuner', 'Metronome',
    'Sheet Music', 'Music Book'
];

const BRANDS = [
    'Fender', 'Gibson', 'Yamaha', 'Roland', 'Ibanez', 'Novation',
    'Akai', 'Shure', 'Audio-Technica', 'Focusrite', 'Boss',
    'Ernie Ball', 'Hercules', 'Fiddlerman', 'Steinberg',
    'Native Instruments', 'Arturia', 'Korg', 'Casio', 'Pearl',
    'Zildjian', 'Meinl', 'Sennheiser', 'Rode', 'Behringer',
    'Blackstar', 'Marshall', 'Orange', 'Vox', 'Other'
];

const GENRES = [
    'Universal', 'Rock', 'Blues', 'Jazz', 'Classical', 'Pop',
    'EDM', 'Hip-Hop', 'Afrobeats', 'Gospel', 'Country',
    'Metal', 'Reggae', 'R&B', 'Folk'
];

const LEVELS     = ['Beginner', 'Intermediate', 'Professional'];
const CONDITIONS = ['New', 'Used - Excellent', 'Used - Good', 'Used - Fair'];
const FORMATS    = ['N/A', 'VST2', 'VST3', 'AU', 'AAX', 'Standalone'];

// ============================================================
//  IMAGE COMPRESSOR (same as AddProduct)
// ============================================================
const compressImage = (file) =>
    new Promise((resolve, reject) => {
        const TARGET_SIZE = 1.5 * 1024 * 1024; // 1.5 MB

        // If file is already small, keep original
        if (file.size <= TARGET_SIZE) {
            resolve(file);
            return;
        }

        const MAX_WIDTH  = 1600;
        const MAX_HEIGHT = 1600;
        const QUALITY    = 0.8;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                    width  = Math.round(width  * ratio);
                    height = Math.round(height * ratio);
                }
                const canvas = document.createElement('canvas');
                canvas.width  = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => {
                        if (!blob) { reject(new Error('Compression failed')); return; }
                        const safeName = file.name.replace(/\.[^.]+$/, '') + '_compressed.jpg';
                        resolve(new File([blob], safeName, { type: 'image/jpeg' }));
                    },
                    'image/jpeg',
                    QUALITY
                );
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });

// ============================================================
//  EDIT PRODUCT
// ============================================================
const EditProduct = () => {
    const { product_id } = useParams();
    const { user }       = useAuth();
    const navigate       = useNavigate();

    // ── FORM STATE ──
    const [productName,    setProductName]    = useState('');
    const [description,    setDescription]    = useState('');
    const [cost,           setCost]           = useState('');
    const [category,       setCategory]       = useState('');
    const [instrumentType, setInstrumentType] = useState('');
    const [brand,          setBrand]          = useState('');
    const [genre,          setGenre]          = useState('');
    const [level,          setLevel]          = useState('');
    const [condition,      setCondition]      = useState('');
    const [format,         setFormat]         = useState('N/A');
    const [featured,       setFeatured]       = useState(false);
    const [stockQuantity,  setStockQuantity]  = useState('1');       // NEW
    const [discountPercent,setDiscountPercent]= useState('0');       // NEW

    // ── PHOTO STATE ──
    const [newMainPhoto,  setNewMainPhoto]  = useState(null);
    const [mainPreview,   setMainPreview]   = useState('');
    const [compressing,   setCompressing]   = useState(false);

    // ── UI STATE ──
    const [loading,  setLoading]  = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error,    setError]    = useState('');
    const [success,  setSuccess]  = useState('');

    // ── DELETE STATE ──
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting,          setDeleting]          = useState(false);
    const [deleteErr,         setDeleteErr]         = useState('');

    // ── FETCH EXISTING PRODUCT DATA ──
    useEffect(() => {
        if (!user) { navigate('/signin'); return; }

        const fetchProduct = async () => {
            try {
                setFetching(true);
                const response = await apiGetProduct(product_id);
                const p        = response.data;

                if (p.added_by !== user.user_id) { navigate('/'); return; }

                setProductName(p.product_name        || '');
                setDescription(p.product_description || '');
                setCost(p.product_cost                || '');
                setCategory(p.category                || '');
                setInstrumentType(p.instrument_type   || '');
                setBrand(p.brand                      || '');
                setGenre(p.genre                      || '');
                setLevel(p.level                      || '');
                setCondition(p.condition_status        || '');
                setFormat(p.format                    || 'N/A');
                setFeatured(p.featured === 1);
                setStockQuantity(String(p.stock_quantity ?? 1));    // NEW
                setDiscountPercent(String(p.discount_percent ?? 0)); // NEW
                setMainPreview(
                    `https://maloba.alwaysdata.net/static/images/${p.product_photo}`
                );
                setFetching(false);
            } catch (err) {
                setError('Failed to load product details.');
                setFetching(false);
            }
        };

        fetchProduct();
    }, [product_id, user]);

    // ── NEW MAIN PHOTO HANDLER (with compression) ──
    const handleMainPhoto = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show original preview immediately
        setMainPreview(URL.createObjectURL(file));
        setCompressing(true);

        try {
            const processed = await compressImage(file);
            setNewMainPhoto(processed);
            setMainPreview(URL.createObjectURL(processed));
        } catch (err) {
            console.error('Compression error:', err);
            // Fallback to original
            setNewMainPhoto(file);
            setMainPreview(URL.createObjectURL(file));
        } finally {
            setCompressing(false);
        }
    };

    const handleClearPhoto = (e) => {
        e.stopPropagation();
        setNewMainPhoto(null);
        setMainPreview('');
        const input = document.getElementById('edit-main-photo');
        if (input) input.value = '';
    };

    // ── SUBMIT EDIT ──
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!category) { setError('Please select a category.'); return; }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('user_id',             user.user_id);
            formData.append('product_name',        productName);
            formData.append('product_description', description);
            formData.append('product_cost',        cost);
            formData.append('category',            category);
            formData.append('instrument_type',     instrumentType);
            formData.append('brand',               brand);
            formData.append('genre',               genre);
            formData.append('level',               level);
            formData.append('condition_status',    condition);
            formData.append('format',              format);
            formData.append('featured',            featured ? 1 : 0);
            formData.append('stock_quantity',      stockQuantity || 1);       // NEW
            formData.append('discount_percent',    discountPercent || 0);     // NEW

            if (newMainPhoto) formData.append('product_photo', newMainPhoto);

            await apiEditProduct(product_id, formData);
            setSuccess('Product updated successfully!');
            setTimeout(() => navigate(`/product/${product_id}`), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── DELETE ──
    const handleDelete = async () => {
        setDeleting(true);
        setDeleteErr('');
        try {
            await apiDeleteProduct(product_id, user.user_id);
            navigate('/');
        } catch (err) {
            setDeleteErr(err.response?.data?.message || 'Failed to delete product. Please try again.');
            setDeleting(false);
        }
    };

    // ── LOADING STATE ──
    if (fetching) return <div className="loader-wrapper"><Loader /></div>;

    // ============================================================
    //  RENDER
    // ============================================================
    return (
        <div className="addproduct-page">
            <div className="addproduct-inner">

                {/* ── HEADER ── */}
                <div className="addproduct-header">
                    <h1>Edit Product</h1>
                    <p>Update the details of your listed product</p>
                </div>

                {/* ── ALERTS ── */}
                {error   && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success} Redirecting...</div>}

                <form onSubmit={handleSubmit} className="addproduct-form">
                    <div className="addproduct-grid">

                        {/* ══ LEFT COLUMN ══ */}
                        <div className="addproduct-left">

                            {/* Main photo */}
                            <div className="form-section">
                                <h3 className="form-section-title">Main Photo</h3>
                                <div
                                    className={`photo-upload-box ${mainPreview ? 'has-preview' : ''}`}
                                    onClick={() => !compressing && document.getElementById('edit-main-photo').click()}
                                    style={{ cursor: compressing ? 'wait' : 'pointer' }}
                                >
                                    {mainPreview ? (
                                        <>
                                            <img src={mainPreview} alt="Main preview" className="photo-preview" />
                                            <button
                                                type="button"
                                                className="photo-clear-btn"
                                                onClick={handleClearPhoto}
                                                title="Remove photo"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="photo-upload-placeholder">
                                            {compressing
                                                ? <><Loader small /><p>Processing…</p></>
                                                : <><FiUpload size={28} /><p>Click to change photo</p><span>JPG, PNG, WEBP · auto-optimized</span></>
                                            }
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    id="edit-main-photo"
                                    accept="image/*"
                                    onChange={handleMainPhoto}
                                    style={{ display: 'none' }}
                                />
                                {mainPreview && !compressing && (
                                    <p style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '8px', textAlign: 'center' }}>
                                        Click the image to change it
                                    </p>
                                )}
                            </div>

                            {/* Featured toggle */}
                            <div className="form-section">
                                <div className="featured-toggle-row">
                                    <div>
                                        <h3 className="form-section-title" style={{ marginBottom: '2px' }}>
                                            Featured Product
                                        </h3>
                                        <p style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                                            Show in the Editor's Pick section
                                        </p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={featured}
                                            onChange={(e) => setFeatured(e.target.checked)}
                                        />
                                        <span className="toggle-knob" />
                                    </label>
                                </div>
                            </div>

                            {/* ── DANGER ZONE ── */}
                            <div className="form-section edit-danger-zone">
                                <h3 className="form-section-title" style={{ color: 'var(--error)' }}>
                                    Danger Zone
                                </h3>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                                    Permanently removes this product, its images, and all associated reviews.
                                </p>

                                {deleteErr && <div className="alert alert-error" style={{ marginBottom: '12px' }}>{deleteErr}</div>}

                                {!showDeleteConfirm ? (
                                    <button
                                        type="button"
                                        className="btn btn-danger w-full"
                                        onClick={() => setShowDeleteConfirm(true)}
                                    >
                                        <FiTrash2 size={14} /> Delete Product
                                    </button>
                                ) : (
                                    <div className="delete-confirm-block">
                                        <p className="delete-confirm-label">
                                            Are you sure? This cannot be undone.
                                        </p>
                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={handleDelete}
                                                disabled={deleting}
                                                style={{ flex: 1 }}
                                            >
                                                {deleting ? <Loader small /> : 'Yes, Delete'}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-ghost"
                                                onClick={() => setShowDeleteConfirm(false)}
                                                disabled={deleting}
                                                style={{ flex: 1 }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* ══ RIGHT COLUMN ══ */}
                        <div className="addproduct-right">

                            {/* Basic info */}
                            <div className="form-section">
                                <h3 className="form-section-title">Basic Info</h3>

                                <div className="form-group">
                                    <label className="form-label">Product Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Fender Stratocaster"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description *</label>
                                    <textarea
                                        className="form-control"
                                        placeholder="Describe the product in detail..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={5}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Price (KES) *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="e.g. 45000"
                                        value={cost}
                                        onChange={(e) => setCost(e.target.value)}
                                        min="1"
                                        required
                                    />
                                </div>

                                {/* ══ NEW: Stock + Discount ══ */}
                                <div className="form-row-2">
                                    <div className="form-group">
                                        <label className="form-label">Stock Quantity *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="e.g. 1 (set 999 for digital goods)"
                                            value={stockQuantity}
                                            onChange={(e) => setStockQuantity(e.target.value)}
                                            min="1"
                                            max="9999"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Discount (%)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="0 – 90"
                                            value={discountPercent}
                                            onChange={(e) => setDiscountPercent(e.target.value)}
                                            min="0"
                                            max="90"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Classification */}
                            <div className="form-section">
                                <h3 className="form-section-title">Classification</h3>

                                <div className="form-row-2">
                                    <div className="form-group">
                                        <label className="form-label">Category *</label>
                                        <select
                                            className="form-control"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            required
                                        >
                                            <option value="">Select category</option>
                                            {CATEGORIES.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Instrument Type</label>
                                        <select
                                            className="form-control"
                                            value={instrumentType}
                                            onChange={(e) => setInstrumentType(e.target.value)}
                                        >
                                            <option value="">Select type</option>
                                            {INSTRUMENT_TYPES.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row-2">
                                    <div className="form-group">
                                        <label className="form-label">Brand</label>
                                        <select
                                            className="form-control"
                                            value={brand}
                                            onChange={(e) => setBrand(e.target.value)}
                                        >
                                            <option value="">Select brand</option>
                                            {BRANDS.map(b => (
                                                <option key={b} value={b}>{b}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Genre</label>
                                        <select
                                            className="form-control"
                                            value={genre}
                                            onChange={(e) => setGenre(e.target.value)}
                                        >
                                            <option value="">Select genre</option>
                                            {GENRES.map(g => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row-3">
                                    <div className="form-group">
                                        <label className="form-label">Level</label>
                                        <select
                                            className="form-control"
                                            value={level}
                                            onChange={(e) => setLevel(e.target.value)}
                                        >
                                            <option value="">Select level</option>
                                            {LEVELS.map(l => (
                                                <option key={l} value={l}>{l}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Condition</label>
                                        <select
                                            className="form-control"
                                            value={condition}
                                            onChange={(e) => setCondition(e.target.value)}
                                        >
                                            <option value="">Select condition</option>
                                            {CONDITIONS.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Format</label>
                                        <select
                                            className="form-control"
                                            value={format}
                                            onChange={(e) => setFormat(e.target.value)}
                                        >
                                            {FORMATS.map(f => (
                                                <option key={f} value={f}>{f}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ── SUBMIT ── */}
                    <div className="addproduct-submit">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => navigate(`/product/${product_id}`)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-ice"
                            style={{ padding: '12px 32px' }}
                            disabled={loading || compressing}
                        >
                            {loading ? <Loader small /> : <><FiSave size={15} /> Save Changes</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditProduct;