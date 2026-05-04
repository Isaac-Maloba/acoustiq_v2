// src/pages/seller/SellerProducts.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiSellerProducts, apiDeleteProduct } from '../../utils/api';
import SellerLayout from '../../components/SellerLayout';
import Loader from '../../components/Loader';

const SellerProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiSellerProducts(user.user_id);
      setProducts(res.data);
    } catch {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (productId) => {
    setDeleting(true);
    try {
      await apiDeleteProduct(productId, user.user_id);
      setProducts(prev => prev.filter(p => p.product_id !== productId));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  const fmt = (n) => Number(n).toLocaleString('en-KE', { maximumFractionDigits: 0 });

  const content = () => {
    if (loading) return <div className="loader-wrapper"><Loader /></div>;
    if (error)   return <div className="alert alert-error">{error}</div>;

    if (products.length === 0) {
      return (
        <div className="empty-state" style={{ padding: '30px' }}>
          <p>You haven't added any products yet.</p>
          <Link to="/add-product" className="btn btn-ice mt-2">
            Add Your First Product
          </Link>
        </div>
      );
    }

    return (
      <div className="seller-table-wrapper">
        <table className="seller-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Stock</th>
              <th>Rating</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const finalPrice = Number(product.product_cost) * (1 - (Number(product.discount_percent) || 0) / 100);
              return (
                <tr key={product.product_id}>
                  <td className="seller-product-thumb">
                    {product.product_photo ? (
                      <img src={`/static/images/${product.product_photo}`} alt="" />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-surface2)' }} />
                    )}
                    <span className="seller-product-thumb-name">{product.product_name}</span>
                  </td>
                  <td>KES {fmt(finalPrice)}</td>
                  <td>{product.discount_percent > 0 ? `${product.discount_percent}%` : '—'}</td>
                  <td>{product.stock_quantity}</td>
                  <td>{product.avg_rating ? `${Number(product.avg_rating).toFixed(1)} ★` : '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="seller-row-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="seller-action-btn"
                        title="Edit product"
                        onClick={() => navigate(`/edit-product/${product.product_id}`)}
                      >
                        ✎
                      </button>
                      <button
                        className="seller-action-btn danger"
                        title="Delete product"
                        onClick={() => setDeleteTarget(product.product_id)}
                        disabled={deleting}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <SellerLayout title="My Products" subtitle="Manage your store listings" storeName={user?.first_name || 'Seller'}>
      <div className="seller-section">
        <div className="seller-section-header">
          <h2 className="seller-section-title">Product List</h2>
          <Link to="/add-product" className="btn btn-ice" style={{ fontSize: '13px', padding: '8px 16px' }}>
            + Add Product
          </Link>
        </div>

        {content()}

        {/* Delete confirmation modal */}
        {deleteTarget && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '24px', maxWidth: '400px',
              width: '90%'
            }}>
              <h3 style={{ marginBottom: '12px' }}>Delete Product?</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                This action cannot be undone. Products with existing orders cannot be deleted.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteTarget)}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
};

export default SellerProducts;