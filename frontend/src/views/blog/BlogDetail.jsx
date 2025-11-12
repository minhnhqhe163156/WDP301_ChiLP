import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketingApi } from '../../api/api';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await marketingApi.getBlogById(id);
        setBlog(response.data);
      } catch (error) {
        toast.error('Không thể tải bài viết');
        navigate('/blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, navigate]);

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

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            Không tìm thấy bài viết
          </div>
          <button
            onClick={() => navigate('/blogs')}
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách bài viết
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/blogs')}
        className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-700"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại danh sách bài viết
      </button>

      {/* Blog content */}
      <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Featured image */}
        {blog.featured_image && (
          <div className="relative h-[400px]">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {blog.title}
          </h1>

          {/* Meta information */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(blog.created_at).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            {blog.category && (
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">
                  {blog.category}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap">{blog.content}</div>
          </div>
        </div>
      </article>

      {/* Related blogs section can be added here */}
    </div>
  );
};

export default BlogDetail; 