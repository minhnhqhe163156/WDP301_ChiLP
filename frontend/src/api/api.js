import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("=== [PACEUPSHOP][FE] Request config:", {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data,
  });
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("=== [PACEUPSHOP][FE] Response error:", {
      url: error.config.url,
      method: error.config.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);
export const orderAPI = {
  getMyOrders: () => api.get("/orders/my-orders"),
  cancelOrder: (orderId) => api.patch(`/orders/${orderId}/cancel`),
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  confirmReceived: (orderId) => api.patch(`/orders/${orderId}/confirm-received`),
  confirmPayment: (orderId) => api.patch(`/orders/${orderId}/confirm-payment`),
};
export const marketingApi = {
  // Blogs
  getBlogs: () => api.get("/marketing/blogs"),
  createBlog: (formData) =>
    api.post("/marketing/blogs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateBlog: (id, formData) =>
    api.put(`/marketing/blogs/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getBlogById: (id) => api.get(`/marketing/blogs/${id}`),
  deleteBlog: (id) => api.delete(`/marketing/blogs/${id}`),

  // Rest of the API functions...
};

export const adminAPI = { 
  readUser:(data) => api.get("admin/users",data) 
}  
export default api;

// Chat API endpoints
export const chatAPI = {
  // Get all conversations for current user
  getConversations: () => api.get("/chat/conversations"),

  // Get specific conversation with messages
  getConversation: (conversationId) =>
    api.get(`/chat/conversation/${conversationId}`),

  // Send a message
  sendMessage: (messageData) => api.post("/chat/message", messageData),

  // Mark messages as read
  markAsRead: (conversationId) =>
    api.put(`/chat/conversation/${conversationId}/read`),

  // Get unread message count
  getUnreadCount: () => api.get("/chat/unread-count"),

  // Search users for chat
  searchUsers: (params) => api.get("/chat/search-users", { params }),

  // Get users for chat based on role
  getUsers: () => api.get("/chat/users"),

  // Create new conversation
  createConversation: (conversationData) =>
    api.post("/chat/conversation", conversationData),

  // Get sellers
  getSellers: () => api.get("/chat/sellers"),

  // Get customers
  getCustomers: () => api.get("/chat/customers"),
};

// Cart API endpoints
export const cartAPI = {
  // Get user's cart
  getCart: () => api.get("/cart"),

  // Add item to cart
  addToCart: (itemData) => api.post("/cart/add", itemData),

  // Update cart item quantity
  updateQuantity: (itemId, quantity) =>
    api.put(`/cart/items/${itemId}`, { quantity }),

  // Remove item from cart
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),

  // Clear entire cart
  clearCart: () => api.delete("/cart"),

  // Get cart count
  getCartCount: () => api.get("/cart/count"),
};

export const fetchCategories = () => api.get("/categories");

export const productAPI = {
  getProducts: () => api.get("/products"),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post("/products", data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// export const createOrder = async ({
//   user_id,
//   paymentMethod,
//   shipping_address,
//   items,
// }) => {
//   return api.post("/orders", {
//     user_id,
//     paymentMethod,
//     shipping_address,
//     items,
//   });
// };

export const reviewAPI = {
  createReview: (data) => api.post("/review", data),
  getReviewByProduct: (productId) => api.get(`/review/product/${productId}`),
  getReviewByUser: (userId) => api.get(`/review/user/${userId}`),
  getReviewByOrder: (orderId) => api.get(`/review/order/${orderId}`),
  updateReview: (reviewId, data) => api.put(`/review/${reviewId}`, data),
  deleteReview: (reviewId) => api.delete(`/review/${reviewId}`),
  getReviewStats: (productId) => api.get(`/review/product/${productId}/summary`),
  getReviewByUserEmail: (email) => api.get(`/review/user-email/${email}`),
};

export const userAPI = {
  updateProfile: (data) => api.put("/auth/update-profile", data),
  changePassword: (data) => api.post("/auth/change-password", data), // thêm API đổi mật khẩu
  getLoginHistory: () => api.get("/auth/login-history"),
};

export const wishlistAPI = {
  getWishlistByUserEmail: (email) => api.get(`/wishlist/user-email/${email}`),
  addToWishlist: (data) => api.post('/wishlist', data),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
};

