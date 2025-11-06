import React from "react";
import { Link } from "react-router-dom";
import { FaNewspaper } from "react-icons/fa";

export default function NewsPage() {
  const newsArticles = [
    {
      id: 1,
      title: "Top 5 Mẫu Giày Chạy Bộ Hot Nhất 2025",
      excerpt:
        "Khám phá những mẫu giày chạy bộ mới nhất với công nghệ tiên tiến, mang lại sự thoải mái và hiệu suất vượt trội.",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      date: "20/07/2025",
    },
    {
      id: 2,
      title: "Cách Chọn Quần Áo Thể Thao Phù Hợp",
      excerpt:
        "Hướng dẫn chi tiết giúp bạn chọn quần áo thể thao phù hợp với từng loại hình vận động và phong cách cá nhân.",
      image:
        "https://images.unsplash.com/photo-1552675464-1721e8b3f5c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      date: "15/07/2025",
    },
    {
      id: 3,
      title: "Xu Hướng Thể Thao Mới Nhất 2025",
      excerpt:
        "Cập nhật những xu hướng thể thao đang làm mưa làm gió trên toàn cầu, từ yoga đến chạy bộ địa hình.",
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      date: "10/07/2025",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-3xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent"
            >
              PaceUpShop
            </Link>
            <nav className="flex space-x-6">
              <Link
                to="/"
                className="text-gray-600 hover:text-violet-600 transition-colors"
              >
                Trang Chủ
              </Link>
              <Link
                to="/products"
                className="text-gray-600 hover:text-violet-600 transition-colors"
              >
                Sản Phẩm
              </Link>
              <Link to="/news" className="text-violet-600 font-medium">
                Tin Tức
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-10 mb-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full shadow-lg mb-4">
              <FaNewspaper className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent mb-4">
              Tin Tức Đồ Thể Thao Mới
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cập nhật những tin tức mới nhất về xu hướng thể thao, sản phẩm hot
              và mẹo hay từ PaceUpShop.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {newsArticles.map((article) => (
              <div
                key={article.id}
                className="bg-gray-50 rounded-2xl shadow-md overflow-hidden"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2">{article.date}</p>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <Link
                    to={`/news/${article.id}`}
                    className="text-violet-600 hover:text-violet-800 font-medium"
                  >
                    Đọc thêm
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center mt-6">
          <p className="text-sm text-gray-500">
            🔒 Thông tin của bạn được bảo mật an toàn
          </p>
          <p className="text-sm text-gray-500 mt-2">
            © 2025 PaceUpShop. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
