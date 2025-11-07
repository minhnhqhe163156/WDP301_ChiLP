// src/components/chat/ProductBanner.jsx
import React from "react";
import { Package } from "lucide-react";

const ProductBanner = ({ product, productRef }) => {
  // Handle both direct product object and productRef from SellerChat
  const productData = productRef ? productRef.productSnapshot : product;

  if (!productData) return null;

  return (
    <div className="my-4 bg-white rounded-lg p-3 border border-gray-200 max-w-md mx-auto shadow-sm">
      <div className="text-sm text-gray-500 mb-2">
        Bạn đang trao đổi với Người mua về sản phẩm này
      </div>
      <div className="flex items-center">
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0 border border-gray-200 shadow-sm">
          {productData.imageUrl ? (
            <img
              src={productData.imageUrl}
              alt={productData.title}
              className="w-full h-full object-cover rounded-lg"
              style={{
                display: "block",
                objectFit: "cover",
                width: "100%",
                height: "100%",
              }}
              onError={(e) => {
                e.target.src =
                  "https://subiz.com.vn/blog/wp-content/uploads/2023/02/subiz-bao-bi-trong-marketing-bao-quan-san-pham-e1676812875330.png";
                e.target.alt = "Product image not available";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={32} className="text-gray-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-base font-semibold mb-1 truncate"
            style={{ wordBreak: "break-word" }}
          >
            {productData.title}
          </div>
          <div className="text-red-600 font-bold text-base">
            ₫{(productData.price || 0).toLocaleString("vi-VN")}
          </div>
        </div>
      </div>
    </div>
  );
};

// For displaying in customer side chat
export const CustomerProductBanner = ({ product, productRef }) => {
  // Handle both direct product object and productRef from API
  const productData = productRef ? productRef.productSnapshot : product;

  if (!productData) return null;

  return (
    <div className="my-4 bg-white rounded-lg p-3 border border-gray-200 max-w-md mx-auto shadow-sm">
      <div className="text-sm text-gray-500 mb-2">
        Bạn đang trao đổi với Người bán về sản phẩm này
      </div>
      <div className="flex items-center">
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0 border border-gray-200 shadow-sm">
          {productData.imageUrl ? (
            <img
              src={productData.imageUrl}
              alt={productData.title}
              className="w-full h-full object-cover rounded-lg"
              style={{
                display: "block",
                objectFit: "cover",
                width: "100%",
                height: "100%",
              }}
              onError={(e) => {
                e.target.src =
                  "https://subiz.com.vn/blog/wp-content/uploads/2023/02/subiz-bao-bi-trong-marketing-bao-quan-san-pham-e1676812875330.png";
                e.target.alt = "Product image not available";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={32} className="text-gray-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="text-base font-semibold mb-1 truncate"
            style={{ wordBreak: "break-word" }}
          >
            {productData.title}
          </div>
          <div className="text-red-600 font-bold text-base">
            ₫{(productData.price || 0).toLocaleString("vi-VN")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductBanner;
