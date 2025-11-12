import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketingApi } from '../../api/api';
import { ArrowRight, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await marketingApi.getBlogs();
        const blogsData = response.data || [];
        setBlogs(blogsData);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(blogsData.map(blog => blog.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (error) {
        toast.error('Không thể tải danh sách bài viết');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Filter blogs based on search term and category
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = searchTerm === '' || 
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || blog.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Tin Tức</h1>
      
      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-md">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Results Count */}
        <div className="mt-4 text-gray-600">
          Tìm thấy {filteredBlogs.length} bài viết
          {selectedCategory && ` trong danh mục "${selectedCategory}"`}
          {searchTerm && ` với từ khóa "${searchTerm}"`}
        </div>
      </div>
      
      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBlogs.map((blog) => (
          <article
            key={blog._id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2"
          >
            <div className="relative overflow-hidden">
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full h-48 object-cover hover:scale-110 transition-transform duration-700"
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
              <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2">
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

      {filteredBlogs.length === 0 && (
        <div className="text-center text-gray-500 mt-8 bg-gray-50 p-8 rounded-xl">
          <div className="text-xl font-semibold mb-2">Không tìm thấy bài viết nào</div>
          <p className="text-gray-600">
            Hãy thử tìm kiếm với từ khóa khác hoặc xem tất cả bài viết
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
            }}
            className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
          >
            Xem tất cả bài viết
          </button>
        </div>
      )}
    </div>
  );
};

export default BlogList; 