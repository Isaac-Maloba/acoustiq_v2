import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// ── CONTEXTS ──────────────────────────────────────────────
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';

// ── LAYOUT ────────────────────────────────────────────────
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// ── PAGES — existing ──────────────────────────────────────
import Home from './pages/Home';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import ProductDetail from './pages/ProductDetail';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import Cart from './pages/Cart';
import Favourites from './pages/Favourites';
import Profile from './pages/Profile';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import Complaints from './pages/Complaints';
import ReturnsPolicy from './pages/ReturnsPolicy';
import ShippingInfo from './pages/ShippingInfo';
import NotFound from './pages/NotFound';
import ChatBot from './components/ChatBot';

// ── PAGES — new (Phase 3) ─────────────────────────────────
import Orders from './pages/Orders';
import StoresPage from './pages/StoresPage';
import StorePage from './pages/StorePage';

// ── PAGES — seller (Phase 4) ──────────────────────────────
import SellerApplication from './pages/seller/SellerApplication';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerStore from './pages/seller/SellerStore';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';
import SellerEarnings from './pages/seller/SellerEarnings';

// ── PAGES — admin (Phase 5) ───────────────────────────────
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplications from './pages/admin/AdminApplications';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminStores from './pages/admin/AdminStores';
import AdminComplaints from './pages/admin/AdminComplaints';

// ── GLOBAL STYLES ─────────────────────────────────────────
import './css/global.css';

// ============================================================
//  SCROLL TO TOP ON ROUTE CHANGE
// ============================================================
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
};

// ============================================================
//  PROTECTED ROUTE
//  Redirects to /signin if not logged in.
//  Redirects to / if logged in but wrong role.
// ============================================================
const ProtectedRoute = ({ children, roles }) => {
    const stored = localStorage.getItem('acoustiq_user');
    const user = stored ? JSON.parse(stored) : null;

    if (!user) return <Navigate to="/signin" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
};

// ============================================================
//  LAYOUT WRAPPER
// ============================================================
const Layout = ({ children }) => (
    <>
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 140px)' }}>
            {children}
        </main>
        <Footer />
    </>
);

// ============================================================
//  APP
// ============================================================
const App = () => {
    return (
        <AuthProvider>
            <ThemeProvider>
                <CartProvider>
                    <Router>
                        <ScrollToTop />
                        <Layout>
                            <Routes>

                                {/* ── PUBLIC ── */}
                                <Route path="/" element={<Home />} />
                                <Route path="/signin" element={<Signin />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/product/:product_id" element={<ProductDetail />} />
                                <Route path="/stores" element={<StoresPage />} />
                                <Route path="/store/:slug" element={<StorePage />} />
                                <Route path="/about" element={<AboutUs />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/returns" element={<ReturnsPolicy />} />
                                <Route path="/shipping" element={<ShippingInfo />} />

                                {/* ── AUTH REQUIRED ── */}
                                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                                <Route path="/favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
                                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
                                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

                                {/* ── SELLER APPLY (any logged-in user) ── */}
                                <Route path="/seller/apply" element={<ProtectedRoute><SellerApplication /></ProtectedRoute>} />

                                {/* ── SELLER ONLY ── */}
                                <Route path="/seller/dashboard" element={<ProtectedRoute roles={['seller', 'admin']}><SellerDashboard /></ProtectedRoute>} />
                                <Route path="/seller/store" element={<ProtectedRoute roles={['seller', 'admin']}><SellerStore /></ProtectedRoute>} />
                                <Route path="/seller/products" element={<ProtectedRoute roles={['seller', 'admin']}><SellerProducts /></ProtectedRoute>} />
                                <Route path="/seller/orders" element={<ProtectedRoute roles={['seller', 'admin']}><SellerOrders /></ProtectedRoute>} />
                                <Route path="/seller/earnings" element={<ProtectedRoute roles={['seller', 'admin']}><SellerEarnings /></ProtectedRoute>} />

                                {/* ── PRODUCT MANAGEMENT (seller/admin) ── */}
                                <Route path="/add-product" element={<ProtectedRoute roles={['seller', 'admin']}><AddProduct /></ProtectedRoute>} />
                                <Route path="/edit-product/:product_id" element={<ProtectedRoute roles={['seller', 'admin']}><EditProduct /></ProtectedRoute>} />

                                {/* ── ADMIN ONLY ── */}
                                <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                                <Route path="/admin/applications" element={<ProtectedRoute roles={['admin']}><AdminApplications /></ProtectedRoute>} />
                                <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
                                <Route path="/admin/orders" element={<ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>} />
                                <Route path="/admin/stores" element={<ProtectedRoute roles={['admin']}><AdminStores /></ProtectedRoute>} />
                                <Route path="/admin/complaints" element={<ProtectedRoute roles={['admin']}><AdminComplaints /></ProtectedRoute>} />

                                {/* ── 404 ── */}
                                <Route path="*" element={<NotFound />} />

                            </Routes>
                        </Layout>
                        <ChatBot />
                    </Router>
                </CartProvider>
            </ThemeProvider>
        </AuthProvider>
    );
};

export default App;