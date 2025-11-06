import React from "react";
import { Link } from "react-router-dom";
import { FaInfoCircle } from "react-icons/fa";

export default function AboutPage() {
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
              <Link to="/about" className="text-violet-600 font-medium">
                Về PaceUpShop
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-10 mb-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full shadow-lg mb-4">
              <FaInfoCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent mb-4">
              Về PaceUpShop
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chào mừng bạn đến với PaceUpShop - điểm đến lý tưởng cho những
              người yêu thích đồ thể thao chất lượng cao và phong cách hiện đại.
            </p>
          </div>

          <div className="space-y-12">
            {/* Mission Section */}
            <section className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                  Sứ Mệnh Của Chúng Tôi
                </h2>
                <p className="text-gray-600">
                  Tại PaceUpShop, chúng tôi cam kết mang đến những sản phẩm thể
                  thao chất lượng cao, kết hợp giữa hiệu suất vượt trội và phong
                  cách thời thượng. Sứ mệnh của chúng tôi là truyền cảm hứng để
                  mọi người sống năng động hơn, tự tin hơn và đạt được mục tiêu
                  cá nhân của mình thông qua các sản phẩm được thiết kế tỉ mỉ.
                </p>
              </div>
              <div className="hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="Mission"
                  className="rounded-2xl shadow-lg object-cover h-full"
                />
              </div>
            </section>

            {/* Vision Section */}
            <section className="grid md:grid-cols-2 gap-8">
              <div className="order-2 md:order-1">
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="Vision"
                  className="rounded-2xl shadow-lg object-cover h-full"
                />
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                  Tầm Nhìn
                </h2>
                <p className="text-gray-600">
                  Chúng tôi hướng đến việc trở thành thương hiệu thể thao hàng
                  đầu tại Việt Nam, mang đến trải nghiệm mua sắm trực tuyến
                  tuyệt vời với các sản phẩm đa dạng, dịch vụ giao hàng nhanh
                  chóng và hỗ trợ khách hàng tận tâm. PaceUpShop không chỉ bán
                  sản phẩm, mà còn xây dựng một cộng đồng yêu thích thể thao và
                  phong cách sống lành mạnh.
                </p>
              </div>
            </section>

            {/* Why Choose Us */}
            <section className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Tại Sao Chọn PaceUpShop?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-50 rounded-2xl shadow-md">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Chất Lượng Đảm Bảo
                  </h3>
                  <p className="text-gray-600">
                    Tất cả sản phẩm đều được kiểm định kỹ lưỡng, đảm bảo chất
                    lượng cao nhất cho khách hàng.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl shadow-md">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Giao Hàng Nhanh Chóng
                  </h3>
                  <p className="text-gray-600">
                    Dịch vụ giao hàng toàn quốc nhanh chóng, tiện lợi, với thông
                    tin theo dõi đơn hàng minh bạch.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl shadow-md">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Hỗ Trợ Tận Tâm
                  </h3>
                  <p className="text-gray-600">
                    Đội ngũ hỗ trợ khách hàng luôn sẵn sàng giải đáp mọi thắc
                    mắc của bạn 24/7.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center mt-6">
          <p className="text-sm text-gray-500">
            🔒 Thông tin của bạn được bảo mật an toàn
          </p>
          <p className="text-sm text-gray-500 mt-2">
            &copy; 2025 PaceUpShop. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
