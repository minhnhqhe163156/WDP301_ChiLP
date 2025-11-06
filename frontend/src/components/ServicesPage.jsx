import React from "react";
import { Link } from "react-router-dom";
import { FaTruck, FaHeadset, FaShieldAlt } from "react-icons/fa";

export default function ServicesPage() {
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
              <Link to="/services" className="text-violet-600 font-medium">
                Dịch Vụ
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-10 mb-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full shadow-lg mb-4">
              <FaHeadset className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent mb-4">
              Dịch Vụ Của PaceUpShop
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cung cấp các dịch vụ hàng đầu để đảm bảo trải nghiệm mua
              sắm tuyệt vời cho bạn.
            </p>
          </div>

          <div className="space-y-12">
            {/* Service 1: Fast Delivery */}
            <section className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                  Giao Hàng Nhanh Chóng
                </h2>
                <p className="text-gray-600">
                  PaceUpShop cam kết giao hàng nhanh chóng trên toàn quốc, với
                  thời gian giao hàng từ 1-3 ngày làm việc. Theo dõi đơn hàng
                  của bạn mọi lúc, mọi nơi với hệ thống cập nhật trạng thái minh
                  bạch.
                </p>
              </div>
              <div className="hidden md:block">
                <img
                  src="https://th.bing.com/th/id/R.35c1b1f39ad2d671237f8c01b2b75a41?rik=XCad7yGU7EtRpw&riu=http%3a%2f%2fwww.wovenmonkey.com%2fwp%2fwp-content%2fuploads%2f2016%2f03%2fFast-Delivery.jpg&ehk=Dlc01HjW3L0%2beK2dayBdCU1ntJ5NsKK0Oy5SDz2f%2beg%3d&risl=&pid=ImgRaw&r=0"
                  alt="Fast Delivery"
                  className="rounded-2xl shadow-lg object-cover h-full"
                />
              </div>
            </section>

            {/* Service 2: Customer Support */}
            <section className="grid md:grid-cols-2 gap-8">
              <div className="order-2 md:order-1">
                <img
                  src="https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="Customer Support"
                  className="rounded-2xl shadow-lg object-cover h-full"
                />
              </div>
              <div className="order-1 md:order-2">
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                  Hỗ Trợ Khách Hàng 24/7
                </h2>
                <p className="text-gray-600">
                  Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giải đáp mọi thắc
                  mắc, từ tư vấn sản phẩm đến xử lý đơn hàng, bất kể ngày hay
                  đêm.
                </p>
              </div>
            </section>

            {/* Service 3: Quality Guarantee */}
            <section className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                  Bảo Đảm Chất Lượng
                </h2>
                <p className="text-gray-600">
                  Tất cả sản phẩm tại PaceUpShop đều được kiểm định chất lượng
                  nghiêm ngặt, đảm bảo mang đến cho bạn những sản phẩm bền bỉ và
                  an toàn.
                </p>
              </div>
              <div className="hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="Quality Guarantee"
                  className="rounded-2xl shadow-lg object-cover h-full"
                />
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
            © 2025 PaceUpShop. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
