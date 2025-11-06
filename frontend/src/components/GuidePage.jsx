import React from "react";
import { Link } from "react-router-dom";
import { FaQuestionCircle } from "react-icons/fa";

export default function GuidePage() {
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
              <Link to="/guide" className="text-violet-600 font-medium">
                Hướng Dẫn
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-10 mb-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full shadow-lg mb-4">
              <FaQuestionCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent mb-4">
              Hướng Dẫn Mua Sắm
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tìm hiểu cách sử dụng PaceUpShop để có trải nghiệm mua sắm dễ dàng
              và thuận tiện.
            </p>
          </div>

          <div className="space-y-8">
            {/* FAQ 1: How to Place an Order */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Làm thế nào để đặt hàng?
              </h2>
              <p className="text-gray-600">
                1. Duyệt qua danh mục sản phẩm và chọn món hàng bạn muốn mua.
                <br />
                2. Thêm sản phẩm vào giỏ hàng và kiểm tra giỏ hàng của bạn.
                <br />
                3. Nhập thông tin giao hàng và thanh toán.
                <br />
                4. Xác nhận đơn hàng và chờ giao hàng trong 1-3 ngày làm việc.
              </p>
            </div>

            {/* FAQ 2: How to Return a Product */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Làm thế nào để đổi/trả hàng?
              </h2>
              <p className="text-gray-600">
                Nếu bạn không hài lòng với sản phẩm, bạn có thể yêu cầu đổi/trả
                trong vòng 7 ngày kể từ khi nhận hàng. Vui lòng liên hệ đội ngũ
                hỗ trợ qua email hoặc hotline để được hướng dẫn chi tiết.
              </p>
            </div>

            {/* FAQ 3: How to Track an Order */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Làm thế nào để theo dõi đơn hàng?
              </h2>
              <p className="text-gray-600">
                Sau khi đặt hàng, bạn sẽ nhận được mã theo dõi qua email hoặc
                SMS. Sử dụng mã này trên trang web của chúng tôi để kiểm tra
                trạng thái đơn hàng bất kỳ lúc nào.
              </p>
            </div>
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
