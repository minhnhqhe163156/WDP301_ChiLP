import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Star,
  Heart,
  Eye,
  ArrowRight,
  Play,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import axios from "axios";
import AuthContext from "../contexts/AuthContext";
import "./Home.css";
import { Link, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { Route } from "react-router-dom";
import { cartAPI } from "../api/api";
// import AllProducts from "./AllProducts";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [productReviews, setProductReviews] = useState({});

  const fetchReviewSummaries = useCallback(async (products) => {
    const summaries = {};
    await Promise.all(
      products.map(async (product) => {
        try {
          const res = await axios.get(
            `https://localhost:5000/api/review/product/${product._id}/summary`
          );
          summaries[product._id] = res.data;
        } catch {
          summaries[product._id] = { averageRating: 0, totalReviews: 0 };
        }
      })
    );
    setProductReviews(summaries);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch banners
        const bannerRes = await axios.get("https://localhost:5000/api/marketing/banners");
        setBanners(bannerRes.data);

        // Fetch products
        const productRes = await axios.get(
          "https://localhost:5000/api/products"
        );
        setProducts(productRes.data);
        // Fetch review summaries for products
        fetchReviewSummaries(productRes.data);

        // Fetch blogs
        const res = await axios.get("https://localhost:5000/api/marketing/blogs");
        setBlogs(res.data);

        // Derive brands from products
        const uniqueBrands = [
          ...new Set(productRes.data.map((p) => p.brand).filter(Boolean)),
        ];
        setBrands(
          uniqueBrands.map((name, index) => ({
            id: index + 1,
            name,
            logo: `https://via.placeholder.com/100x50?text=${name}`,
          }))
        );

        setLoading(false);
      } catch {
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };
    fetchData();

    // Auto-slide for banners
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length, fetchReviewSummaries]);

  const addToCart = async (productId) => {
    if (!user) {
      alert("Please log in to add items to your cart.");
      return;
    }
    try {
      await cartAPI.addToCart(productId, 1);
      alert("Product added to cart!");
    } catch {
      alert("Failed to add product to cart.");
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const toggleFavorite = (productId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  if (loading)
    return (
      <div className="text-center py-10 text-gray-600 text-lg">Loading...</div>
    );
  if (error)
    return (
      <div className="text-center py-10 text-red-500 text-lg font-medium">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="relative w-full h-full">
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
                index === currentSlide
                  ? "translate-x-0"
                  : index < currentSlide
                  ? "-translate-x-full"
                  : "translate-x-full"
              }`}
            >
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
            </div>
          ))}
        </div>

        {/* Banner Content */}
        {/* <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl text-white">
              <h1 className="text-5xl font-bold mb-4 animate-fade-in-up">
                Pace Up
              </h1>
              <p className="text-xl mb-2 opacity-90">Bắt đầu từ 11/11/2021</p>
              <p className="text-lg mb-8 opacity-80">
                Ưu đãi giảm giá lên đến 50% - Đặt hàng ngay!
              </p>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                Khám phá ngay
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </div> */}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </section>

      <div className="container mx-auto px-6 py-16 space-y-20">
        {/* Featured Products */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Sản phẩm nổi bật
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products
              .filter((p) => p.is_featured)
              .slice(0, 8)
              .map((product) => (
                <ProductCard
                  key={product._id}
                  product={{
                    ...product,
                    averageRating: productReviews[product._id]?.averageRating,
                    totalReviews: productReviews[product._id]?.totalReviews,
                  }}
                  user={user}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  addToCart={undefined}
                  hoveredProduct={hoveredProduct}
                  setHoveredProduct={setHoveredProduct}
                />
              ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/collections/featured/all')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-lg hover:shadow-xl"
            >
              Xem tất cả sản phẩm nổi bật
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* New Arrivals */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Hàng mới về
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, 4)
              .map((product) => (
                <ProductCard
                  key={product._id}
                  product={{
                    ...product,
                    averageRating: productReviews[product._id]?.averageRating,
                    totalReviews: productReviews[product._id]?.totalReviews,
                  }}
                  user={user}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  addToCart={addToCart}
                  hoveredProduct={hoveredProduct}
                  setHoveredProduct={setHoveredProduct}
                />
              ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/collections/new/arrivals')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-lg hover:shadow-xl"
            >
              Xem tất cả hàng mới về
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Best Sellers */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Bán chạy nhất
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-red-500 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-6">
            {products
              .sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0))
              .slice(0, 3)
              .map((product, index) => (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
                >
                  <div className="flex items-center p-6">
                    <div className="flex-shrink-0 mr-6">
                      <div className="relative">
                        <img
                          src={product.imageurl}
                          alt={product.product_name}
                          className="w-24 h-24 object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                      </div>
                    </div>

                    <div className="flex-grow">
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {product.brand}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {product.product_name}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating || 0)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          ({product.totalReviews || 0} đánh giá)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-800">
                          {(
                            product.discount_price || product.price
                          ).toLocaleString()}
                          ₫
                        </span>
                        {product.discount_price && (
                          <span className="text-lg text-gray-500 line-through">
                            {product.price.toLocaleString()}₫
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Latest News */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Tin tức mới nhất
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(Array.isArray(blogs) ? blogs.slice(0, 3) : []).map((blog) => (
              <article
                key={blog._id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={blog.featured_image}
                    alt={blog.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                    {new Date(blog.created_at).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {blog.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {blog.content}
                  </p>
                  <button
                    onClick={() => navigate(`/blog/${blog._id}`)}
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
                  >
                    Đọc thêm
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/blogs')}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Xem tất cả bài viết
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* YouTube Section */}
        <section className="bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl p-12 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">
              Kênh YouTube của chúng tôi
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Khám phá những video hướng dẫn, review sản phẩm và tips thể thao
              hữu ích
            </p>
            <button className="bg-white text-red-500 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
              <Play className="inline-block mr-2 w-5 h-5" />
              Xem video
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-white">
                Hỗ trợ khách hàng
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span>Hotline: 0909 123 456</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span>Email: support@paceup.vn</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6 text-white">Hướng dẫn</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="no-underline text-inherit hover:text-blue-400 transition-colors"
                  >
                    Chính sách đổi trả
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="no-underline text-inherit hover:text-blue-400 transition-colors"
                  >
                    Chính sách bảo hành
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="no-underline text-inherit hover:text-blue-400 transition-colors"
                  >
                    Hướng dẫn mua hàng
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="no-underline text-inherit hover:text-blue-400 transition-colors"
                  >
                    Phương thức thanh toán
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6 text-white">
                Kết nối với chúng tôi
              </h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="no-underline text-inherit p-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="no-underline text-inherit p-3 bg-pink-600 rounded-full hover:bg-pink-700 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="no-underline text-inherit p-3 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6 text-white">
                Pace Up Team
              </h3>
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=200&fit=crop"
                  alt="Team"
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 PaceUp Shop. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
