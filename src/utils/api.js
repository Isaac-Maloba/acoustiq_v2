import axios from 'axios';

const BASE_URL = "https://maloba.alwaysdata.net";

export const imgUrl = (filename) => {
    return `${BASE_URL}/static/images/${filename}`;
};

// Auth
export const apiSignup = (formData) =>
    axios.post(`${BASE_URL}/api/signup`, formData);

export const apiSignin = (formData) =>
    axios.post(`${BASE_URL}/api/signin`, formData);

export const apiVerifyOtp = (formData) =>
    axios.post(`${BASE_URL}/api/signin/verify-otp`, formData);

export const apiGoogleAuth = (formData) =>
    axios.post(`${BASE_URL}/api/auth/google`, formData);

// Profile
export const apiUpdateProfile = (formData) =>
    axios.put(`${BASE_URL}/api/profile/update`, formData);

export const apiChangePassword = (formData) =>
    axios.put(`${BASE_URL}/api/profile/password`, formData);

export const apiToggle2FA = (formData) =>
    axios.put(`${BASE_URL}/api/profile/toggle-2fa`, formData);

export const apiDeleteAccount = (userId) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    return axios.delete(`${BASE_URL}/api/profile/delete/${userId}`, { data: formData });
};

// Products
export const apiGetProducts = (params = {}) =>
    axios.get(`${BASE_URL}/api/products`, { params });

export const apiGetProduct = (productId) =>
    axios.get(`${BASE_URL}/api/product/${productId}`);

export const apiAddProduct = (formData) =>
    axios.post(`${BASE_URL}/api/add_product`, formData, { timeout: 30000 });

export const apiEditProduct = (productId, formData) =>
    axios.put(`${BASE_URL}/api/edit_product/${productId}`, formData);

export const apiDeleteProduct = (productId, userId) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    return axios.delete(`${BASE_URL}/api/delete_product/${productId}`, { data: formData });
};

// Cart
export const apiGetCart = (userId) =>
    axios.get(`${BASE_URL}/api/cart/${userId}`, { params: { user_id: userId } });

export const apiAddToCart = (formData) =>
    axios.post(`${BASE_URL}/api/cart/add`, formData);

export const apiDecrementCartItem = (cartId, userId) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    return axios.put(`${BASE_URL}/api/cart/decrement/${cartId}`, formData);
};

export const apiRemoveFromCart = (cartId, userId) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    return axios.delete(`${BASE_URL}/api/cart/remove/${cartId}`, { data: formData });
};

export const apiClearCart = (userId) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    return axios.delete(`${BASE_URL}/api/cart/clear/${userId}`, { data: formData });
};

// Favourites
export const apiToggleFavourite = (formData) =>
    axios.post(`${BASE_URL}/api/favourites/toggle`, formData);

export const apiGetFavourites = (userId) =>
    axios.get(`${BASE_URL}/api/favourites/${userId}`, { params: { user_id: userId } });

// Ratings
export const apiAddRating = (formData) =>
    axios.post(`${BASE_URL}/api/ratings/add`, formData);

export const apiGetRatings = (productId) =>
    axios.get(`${BASE_URL}/api/ratings/${productId}`);

// Payments & Orders
export const apiMpesaPayment = (formData) =>
    axios.post(`${BASE_URL}/api/mpesa_payment`, formData);

export const apiGetOrders = (userId) =>
    axios.get(`${BASE_URL}/api/orders/${userId}`, { params: { user_id: userId } });

export const apiGetOrder = (orderId, userId) =>
    axios.get(`${BASE_URL}/api/order/${orderId}`, { params: { user_id: userId } });

export const apiUpdateOrderStatus = (orderId, formData) =>
    axios.put(`${BASE_URL}/api/order/${orderId}/status`, formData);

// Seller
export const apiSellerApply = (formData) =>
    axios.post(`${BASE_URL}/api/seller/apply`, formData);

export const apiSellerApplicationStatus = (userId) =>
    axios.get(`${BASE_URL}/api/seller/application-status`, { params: { user_id: userId } });

export const apiGetSellerStore = (userId) =>
    axios.get(`${BASE_URL}/api/seller/store/${userId}`, { params: { user_id: userId } });

export const apiUpdateSellerStore = (formData) =>
    axios.put(`${BASE_URL}/api/seller/store`, formData);

export const apiSellerDashboard = (userId) =>
    axios.get(`${BASE_URL}/api/seller/dashboard`, { params: { user_id: userId } });

export const apiSellerProducts = (userId) =>
    axios.get(`${BASE_URL}/api/seller/products/${userId}`, { params: { user_id: userId } });

export const apiSellerOrders = (userId, status = '') =>
    axios.get(`${BASE_URL}/api/seller/orders`, {
        params: { user_id: userId, ...(status && { status }) }
    });

export const apiSellerEarnings = (userId) =>
    axios.get(`${BASE_URL}/api/seller/earnings`, { params: { user_id: userId } });

export const apiSellerPayoutRequest = (formData) =>
    axios.post(`${BASE_URL}/api/seller/payout-request`, formData);

// Public Stores
export const apiGetStores = (search = '') =>
    axios.get(`${BASE_URL}/api/stores`, { params: { ...(search && { search }) } });

export const apiGetStore = (slug) =>
    axios.get(`${BASE_URL}/api/store/${slug}`);

// Complaints
export const apiCreateComplaint = (formData) =>
    axios.post(`${BASE_URL}/api/complaint/create`, formData);

export const apiGetComplaints = (userId) =>
    axios.get(`${BASE_URL}/api/complaints/${userId}`, { params: { user_id: userId } });

// Admin
export const apiAdminStats = (userId) =>
    axios.get(`${BASE_URL}/api/admin/stats`, { params: { user_id: userId } });

export const apiAdminGetUsers = (userId, filters = {}) =>
    axios.get(`${BASE_URL}/api/admin/users`, { params: { user_id: userId, ...filters } });

export const apiAdminSetUserRole = (targetUserId, formData) =>
    axios.put(`${BASE_URL}/api/admin/users/${targetUserId}/role`, formData);

export const apiAdminDeleteUser = (targetUserId, adminUserId) => {
    const formData = new FormData();
    formData.append('user_id', adminUserId);
    return axios.delete(`${BASE_URL}/api/admin/users/${targetUserId}`, { data: formData });
};

export const apiAdminGetOrders = (userId, filters = {}) =>
    axios.get(`${BASE_URL}/api/admin/orders`, { params: { user_id: userId, ...filters } });

export const apiAdminDeleteRating = (ratingId, adminUserId) => {
    const formData = new FormData();
    formData.append('user_id', adminUserId);
    return axios.delete(`${BASE_URL}/api/admin/ratings/${ratingId}`, { data: formData });
};

export const apiAdminGetApplications = (userId, status = 'pending') =>
    axios.get(`${BASE_URL}/api/admin/applications`, { params: { user_id: userId, status } });

export const apiAdminReviewApplication = (applicationId, formData) =>
    axios.post(`${BASE_URL}/api/admin/applications/${applicationId}/review`, formData);

export const apiAdminGetStores = (userId, status = '') =>
    axios.get(`${BASE_URL}/api/admin/stores`, {
        params: { user_id: userId, ...(status && { status }) }
    });

export const apiAdminSuspendStore = (storeId, formData) =>
    axios.put(`${BASE_URL}/api/admin/stores/${storeId}/suspend`, formData);

export const apiAdminReinstateStore = (storeId, formData) =>
    axios.put(`${BASE_URL}/api/admin/stores/${storeId}/reinstate`, formData);

export const apiAdminGetComplaints = (userId, status = 'open') =>
    axios.get(`${BASE_URL}/api/admin/complaints`, { params: { user_id: userId, status } });

export const apiAdminResolveComplaint = (complaintId, formData) =>
    axios.put(`${BASE_URL}/api/admin/complaints/${complaintId}/resolve`, formData);