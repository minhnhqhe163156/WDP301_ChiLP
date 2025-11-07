import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, User, Phone, MapPin, ChevronRight } from "lucide-react";
import AddressSelect from "./AddressSelect";

export default function ShippingInfoPage() {
  const [info, setInfo] = useState({
    name: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    postalCode: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!info.name) {
      newErrors.name = "Họ tên không được để trống";
    } else if (info.name.length < 2 || info.name.length > 50) {
      newErrors.name = "Họ tên phải từ 2 đến 50 ký tự";
    }

    // Phone validation
    const phoneRegex = /^(0|\+84)[35789][0-9]{8}$/;
    if (!info.phone) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!phoneRegex.test(info.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    // Address validation
    if (!info.address) {
      newErrors.address = "Địa chỉ không được để trống";
    } else if (info.address.length < 5) {
      newErrors.address = "Địa chỉ phải có ít nhất 5 ký tự";
    }

    // Postal code validation (optional)
    if (info.postalCode && !/^\d{6}$/.test(info.postalCode)) {
      newErrors.postalCode = "Mã bưu điện phải là 6 chữ số";
    }

    // Province, District, Ward validation (assuming AddressSelect handles these)
    if (!info.province) newErrors.province = "Vui lòng chọn tỉnh/thành phố";
    if (!info.district) newErrors.district = "Vui lòng chọn quận/huyện";
    if (!info.ward) newErrors.ward = "Vui lòng chọn phường/xã";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setInfo({ ...info, [e.target.name]: e.target.value });
    // Clear error for the field being edited
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("=== [PACEUPSHOP] Đang lưu thông tin shipping:", info);
      localStorage.setItem("shipping_address", JSON.stringify(info));
      navigate("/checkout/payment");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full shadow-lg mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent mb-2">
            Thông tin giao hàng
          </h1>
          <p className="text-gray-600">
            Vui lòng nhập thông tin để hoàn tất đơn hàng
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ tên người nhận
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-violet-600 transition-colors" />
                </div>
                <input
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.name ? "border-red-500" : "border-gray-200"
                  } rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white`}
                  name="name"
                  placeholder="Nhập họ tên đầy đủ"
                  value={info.name}
                  onChange={handleChange}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-violet-600 transition-colors" />
                </div>
                <input
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.phone ? "border-red-500" : "border-gray-200"
                  } rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white`}
                  name="phone"
                  placeholder="Nhập số điện thoại"
                  type="tel"
                  value={info.phone}
                  onChange={handleChange}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Province, District, Ward Select */}
            <AddressSelect info={info} setInfo={setInfo} errors={errors} />

            {/* Postal Code Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã bưu điện (nếu có)
              </label>
              <input
                className={`w-full pl-4 pr-4 py-3 border ${
                  errors.postalCode ? "border-red-500" : "border-gray-200"
                } rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white`}
                name="postalCode"
                placeholder="Nhập mã bưu điện"
                value={info.postalCode}
                onChange={handleChange}
              />
              {errors.postalCode && (
                <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
              )}
            </div>

            {/* Address Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ chi tiết (số nhà, đường, ...)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-violet-600 transition-colors" />
                </div>
                <input
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.address ? "border-red-500" : "border-gray-200"
                  } rounded-2xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 focus:bg-white`}
                  name="address"
                  placeholder="Nhập địa chỉ chi tiết"
                  value={info.address}
                  onChange={handleChange}
                />
              </div>
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-2xl font-medium hover:from-violet-700 hover:to-purple-700 focus:ring-4 focus:ring-violet-200 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              type="submit"
            >
              <span>Tiếp tục</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            🔒 Thông tin của bạn được bảo mật an toàn
          </p>
        </div>
      </div>
    </div>
  );
}
