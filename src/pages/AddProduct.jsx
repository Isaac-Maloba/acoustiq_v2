import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiSave, FiX, FiAlertCircle, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { apiAddProduct } from '../utils/api';
import Loader from '../components/Loader';
import '../css/AddProduct.css';

// ============================================================
//  DROPDOWN OPTIONS
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
//  IMAGE COMPRESSOR (unchanged)
// ============================================================
const compressImage = (file) =>
    new Promise((resolve, reject) => {
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
//  VALIDATION
// ============================================================
const validate = ({ productName, description, cost, category, mainPhoto }) => {
    const errors = {};
    if (!productName.trim())       errors.productName  = 'Product name is required.';
    if (!description.trim())       errors.description  = 'Description is required.';
    if (!cost || Number(cost) < 1) errors.cost         = 'Enter a valid price greater than 0.';
    if (!category)                 errors.category     = 'Please select a category.';
    if (!mainPhoto)                errors.mainPhoto    = 'A main product photo is required.';
    return errors;
};

// ============================================================
//  ADD PRODUCT
// ============================================================
const AddProduct = () => {
    const { user }   = useAuth();
    const navigate   = useNavigate();

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
    const [mainPhoto,    setMainPhoto]    = useState(null);
    const [mainPreview,  setMainPreview]  = useState('');
    const [compressing,  setCompressing]  = useState(false);

    // ── EXTRA IMAGES ──
    const [extraImages, setExtraImages] = useState([]);
    const [extraCompressing, setExtraCompressing] = useState(false);

    // ── UI STATE ──
    const [loading,  setLoading]  = useState(false);
    const [errors,   setErrors]   = useState({});
    const [apiError, setApiError] = useState('');
    const [success,  setSuccess]  = useState('');

    if (!user) { navigate('/signin'); return null; }

    // ── MAIN PHOTO HANDLER ──
    const handleMainPhoto = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setErrors(prev => ({ ...prev, mainPhoto: '' }));
        setMainPreview(URL.createObjectURL(file));
        setCompressing(true);
        try {
            const processed = await compressImage(file);
            setMainPhoto(processed);
            setMainPreview(URL.createObjectURL(processed));
        } catch (err) {
            console.error('Compression error:', err);
            setMainPhoto(file);
            setMainPreview(URL.createObjectURL(file));
        } finally {
            setCompressing(false);
        }
    };

    const handleClearPhoto = (e) => {
        e.stopPropagation();
        setMainPhoto(null);
        setMainPreview('');
        const input = document.getElementById('main-photo-input');
        if (input) input.value = '';
    };

    // ── EXTRA IMAGES ──
    const handleExtraImages = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setExtraCompressing(true);
        const newImages = [];
        for (const file of files) {
            try {
                const processed = await compressImage(file);
                newImages.push({ file: processed, preview: URL.createObjectURL(processed) });
            } catch {
                newImages.push({ file, preview: URL.createObjectURL(file) });
            }
        }
        setExtraImages(prev => {
            const combined = [...prev, ...newImages];
            if (combined.length > 5) {
                combined.slice(5).forEach(img => URL.revokeObjectURL(img.preview));
                return combined.slice(0, 5);
            }
            return combined;
        });
        setExtraCompressing(false);
        e.target.value = '';
    };

    const removeExtraImage = (index) => {
        setExtraImages(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].preview);
            updated.splice(index, 1);
            return updated;
        });
    };

    const clearError = (field) => {
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    // ── SUBMIT ──
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setSuccess('');

        const validationErrors = validate({ productName, description, cost, category, mainPhoto });
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('user_id',             user.user_id);
            formData.append('product_name',        productName.trim());
            formData.append('product_description', description.trim());
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
            formData.append('product_photo',       mainPhoto);

            extraImages.forEach(img => {
                formData.append('extra_images', img.file);
            });

            await apiAddProduct(formData);
            setSuccess('Product added successfully!');
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            if (err.code === 'ECONNABORTED') {
                setApiError('The request timed out. Please check your connection and try again.');
            } else if (err.response?.data?.message) {
                setApiError(err.response.data.message);
            } else {
                setApiError('Failed to add product. Please try again.');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    //  RENDER
    // ============================================================
    return (
        <div className="addproduct-page">
            <div className="addproduct-inner">

                {/* ── HEADER ── */}
                <div className="addproduct-header">
                    <h1>Add a Product</h1>
                    <p>List an instrument, plugin, or accessory for sale</p>
                </div>

                {apiError && (
                    <div className="alert alert-error">
                        <FiAlertCircle size={15} style={{ flexShrink: 0 }} />
                        {apiError}
                    </div>
                )}
                {success && <div className="alert alert-success">{success} Redirecting...</div>}

                <p className="required-note">Fields marked <span className="req-star">*</span> are required.</p>

                <form onSubmit={handleSubmit} className="addproduct-form" noValidate>
                    <div className="addproduct-grid">

                        {/* ══ LEFT COLUMN ══ */}
                        <div className="addproduct-left">

                            {/* Main photo */}
                            <div className="form-section">
                                <h3 className="form-section-title">
                                    Main Photo <span className="req-star">*</span>
                                </h3>
                                <div
                                    className={`photo-upload-box ${mainPreview ? 'has-preview' : ''} ${errors.mainPhoto ? 'photo-error' : ''}`}
                                    onClick={() => !compressing && document.getElementById('main-photo-input').click()}
                                    style={{ cursor: compressing ? 'wait' : 'pointer' }}
                                >
                                    {mainPreview ? (
                                        <>
                                            <img src={mainPreview} alt="Preview" className="photo-preview" />
                                            <button type="button" className="photo-clear-btn" onClick={handleClearPhoto} title="Remove photo">
                                                <FiX size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="photo-upload-placeholder">
                                            {compressing
                                                ? <><Loader small /><p>Processing…</p></>
                                                : <><FiUpload size={28} /><p>Click to upload photo</p><span>JPG, PNG, WEBP · auto-optimized</span></>
                                            }
                                        </div>
                                    )}
                                </div>
                                {errors.mainPhoto && <p className="field-error">{errors.mainPhoto}</p>}
                                <input type="file" id="main-photo-input" accept="image/*" onChange={handleMainPhoto} style={{ display: 'none' }} />
                            </div>

                            {/* Extra images */}
                            <div className="form-section">
                                <h3 className="form-section-title">Additional Images ({extraImages.length}/5)</h3>
                                <div className="extra-images-area">
                                    {extraImages.map((img, idx) => (
                                        <div key={idx} className="extra-image-preview" style={{ position: 'relative', display: 'inline-block' }}>
                                            <img src={img.preview} alt={`Extra ${idx+1}`} className="extra-image-thumb" />
                                            <button type="button" className="photo-clear-btn" onClick={() => removeExtraImage(idx)} title="Remove image">
                                                <FiX size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {extraImages.length < 5 && (
                                        <div
                                            className="extra-image-upload-box"
                                            onClick={() => document.getElementById('extra-images-input').click()}
                                            style={{ cursor: extraCompressing ? 'wait' : 'pointer' }}
                                        >
                                            {extraCompressing ? <Loader small /> : <><FiPlus size={20} /><span>Add photos</span></>}
                                        </div>
                                    )}
                                </div>
                                <input type="file" id="extra-images-input" accept="image/*" multiple onChange={handleExtraImages} style={{ display: 'none' }} />
                                <p className="photo-hint" style={{ marginTop: '6px' }}>Up to 5 additional images. Same quality rules as main photo.</p>
                            </div>

                            {/* Featured toggle */}
                            <div className="form-section">
                                <div className="featured-toggle-row">
                                    <div>
                                        <h3 className="form-section-title" style={{ marginBottom: '2px' }}>Featured Product</h3>
                                        <p style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Show in Editor's Pick section</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                                        <span className="toggle-knob" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* ══ RIGHT COLUMN ══ */}
                        <div className="addproduct-right">
                            <div className="form-section">
                                <h3 className="form-section-title">Basic Info</h3>

                                <div className="form-group">
                                    <label className="form-label">Product Name <span className="req-star">*</span></label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.productName ? 'input-error' : ''}`}
                                        placeholder="e.g. Fender Player Stratocaster"
                                        value={productName}
                                        onChange={(e) => { setProductName(e.target.value); clearError('productName'); }}
                                        maxLength={255}
                                    />
                                    {errors.productName && <p className="field-error">{errors.productName}</p>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description <span className="req-star">*</span></label>
                                    <textarea
                                        className={`form-control ${errors.description ? 'input-error' : ''}`}
                                        placeholder="Describe the product — condition, features, what's included..."
                                        value={description}
                                        onChange={(e) => { setDescription(e.target.value); clearError('description'); }}
                                        rows={5}
                                        maxLength={2000}
                                    />
                                    {errors.description && <p className="field-error">{errors.description}</p>}
                                    <p className="char-count">{description.length} / 2000</p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Price (KES) <span className="req-star">*</span></label>
                                    <input
                                        type="number"
                                        className={`form-control ${errors.cost ? 'input-error' : ''}`}
                                        placeholder="e.g. 45000"
                                        value={cost}
                                        onChange={(e) => { setCost(e.target.value); clearError('cost'); }}
                                        min="1"
                                        max="9999999"
                                    />
                                    {errors.cost && <p className="field-error">{errors.cost}</p>}
                                </div>

                                {/* ══ NEW: Stock + Discount ══ */}
                                <div className="form-row-2">
                                    <div className="form-group">
                                        <label className="form-label">Stock Quantity <span className="req-star">*</span></label>
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
                                        <label className="form-label">Category <span className="req-star">*</span></label>
                                        <select
                                            className={`form-control ${errors.category ? 'input-error' : ''}`}
                                            value={category}
                                            onChange={(e) => { setCategory(e.target.value); clearError('category'); }}
                                        >
                                            <option value="">Select category</option>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        {errors.category && <p className="field-error">{errors.category}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Instrument Type</label>
                                        <select className="form-control" value={instrumentType} onChange={(e) => setInstrumentType(e.target.value)}>
                                            <option value="">Select type</option>
                                            {INSTRUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row-2">
                                    <div className="form-group">
                                        <label className="form-label">Brand</label>
                                        <select className="form-control" value={brand} onChange={(e) => setBrand(e.target.value)}>
                                            <option value="">Select brand</option>
                                            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Genre</label>
                                        <select className="form-control" value={genre} onChange={(e) => setGenre(e.target.value)}>
                                            <option value="">Select genre</option>
                                            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row-3">
                                    <div className="form-group">
                                        <label className="form-label">Level</label>
                                        <select className="form-control" value={level} onChange={(e) => setLevel(e.target.value)}>
                                            <option value="">Select level</option>
                                            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Condition</label>
                                        <select className="form-control" value={condition} onChange={(e) => setCondition(e.target.value)}>
                                            <option value="">Select condition</option>
                                            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Format</label>
                                        <select className="form-control" value={format} onChange={(e) => setFormat(e.target.value)}>
                                            {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── SUBMIT ROW ── */}
                    <div className="addproduct-submit">
                        <button type="button" className="btn btn-ghost" onClick={() => navigate('/')} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-ice" style={{ padding: '12px 32px' }} disabled={loading || compressing || extraCompressing}>
                            {loading ? <><Loader small /> Uploading...</> : <><FiSave size={15} /> Add Product</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;