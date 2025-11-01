import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, Share2, Heart, BookOpen } from "lucide-react";
import { marketingApi } from "../../api/api";

const ViewBlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await marketingApi.getBlogById(id);
        setBlog(res.data);
        setError(null);
      } catch {
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      }
      setLoading(false);
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20 animate-pulse"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 w-full max-w-md text-center border border-white/20">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Đang tải bài viết</h3>
            <p className="text-gray-500">Vui lòng chờ trong giây lát...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl blur opacity-20"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 w-full max-w-md text-center border border-white/20">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-red-700">Oops! Có lỗi xảy ra</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <ArrowLeft className="inline-block mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-gray-700 hover:text-indigo-600 font-medium transition-all duration-300"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Featured Image */}
        {blog?.featured_image && (
          <div className="relative mb-12 group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-3xl z-10"></div>
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-96 object-cover rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        )}

        {/* Article Content */}
        <article className="relative">
          <div className="absolute -left-4 top-0 w-1 h-32 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
          
          {/* Title */}
          <h1 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
            {blog?.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-600">
            {blog?.date && (
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {new Date(blog.date).toLocaleDateString("vi-VN", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            {blog?.author && (
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{blog.author}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">5 phút đọc</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-12">
            <button
              onClick={handleLike}
              className={`group flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                isLiked 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                  : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${isLiked ? 'fill-current' : ''}`} />
              <span>{isLiked ? 'Đã thích' : 'Thích'}</span>
            </button>
            
            <button
              onClick={handleShare}
              className="group flex items-center gap-2 bg-indigo-100 text-indigo-600 px-6 py-3 rounded-full font-medium hover:bg-indigo-200 transition-all duration-300"
            >
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Chia sẻ</span>
            </button>
          </div>

          {/* Content */}
          <div className="relative">
            <div className="absolute -left-8 top-0 w-2 h-full bg-gradient-to-b from-indigo-500/20 to-purple-500/20 rounded-full"></div>
            <div 
              className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
              style={{
                lineHeight: '1.8',
                fontSize: '1.125rem'
              }}
            >
              <div 
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: blog?.content || blog?.body || "" }}
                style={{
                  '--tw-prose-body': 'rgb(55 65 81)',
                  '--tw-prose-headings': 'rgb(17 24 39)',
                  '--tw-prose-links': 'rgb(79 70 229)',
                  '--tw-prose-bold': 'rgb(17 24 39)',
                  '--tw-prose-counters': 'rgb(107 114 128)',
                  '--tw-prose-bullets': 'rgb(209 213 219)',
                  '--tw-prose-hr': 'rgb(229 231 235)',
                  '--tw-prose-quotes': 'rgb(17 24 39)',
                  '--tw-prose-quote-borders': 'rgb(229 231 235)',
                  '--tw-prose-captions': 'rgb(107 114 128)',
                  '--tw-prose-code': 'rgb(17 24 39)',
                  '--tw-prose-pre-code': 'rgb(229 231 235)',
                  '--tw-prose-pre-bg': 'rgb(17 24 39)',
                  '--tw-prose-th-borders': 'rgb(209 213 219)',
                  '--tw-prose-td-borders': 'rgb(229 231 235)'
                }}
              />
            </div>
          </div>
        </article>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-black rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>

      <style jsx>{`
        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4,
        .blog-content h5,
        .blog-content h6 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 600;
          line-height: 1.4;
        }
        
        .blog-content h1 { font-size: 2.25rem; }
        .blog-content h2 { font-size: 1.875rem; }
        .blog-content h3 { font-size: 1.5rem; }
        
        .blog-content p {
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }
        
        .blog-content a {
          color: rgb(79 70 229);
          text-decoration: none;
          border-bottom: 1px solid rgb(79 70 229 / 0.3);
          transition: all 0.3s ease;
        }
        
        .blog-content a:hover {
          border-bottom-color: rgb(79 70 229);
        }
        
        .blog-content blockquote {
          border-left: 4px solid rgb(79 70 229);
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          background: rgb(79 70 229 / 0.05);
          padding: 1.5rem;
          border-radius: 0.5rem;
        }
        
        .blog-content ul,
        .blog-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }
        
        .blog-content li {
          margin-bottom: 0.5rem;
        }
        
        .blog-content img {
          border-radius: 1rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          margin: 2rem 0;
        }
        
        .blog-content code {
          background: rgb(243 244 246);
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        
        .blog-content pre {
          background: rgb(17 24 39);
          color: rgb(229 231 235);
          padding: 1.5rem;
          border-radius: 1rem;
          overflow-x: auto;
          margin: 2rem 0;
        }
        
        .blog-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default ViewBlogDetails;