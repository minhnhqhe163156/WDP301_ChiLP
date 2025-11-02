import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaRunning, FaTshirt, FaShoePrints, FaBoxOpen } from "react-icons/fa";
import { getAllCategories } from "../api/categoryApi";

const ProductsDropdown = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getAllCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Lỗi khi lấy categories:", err));
  }, []);

  const isClothing = (name) =>
    name.toLowerCase().includes("áo") || name.toLowerCase().includes("quần");
  const isShoes = (name) => name.toLowerCase().includes("giày");
  const isAccessories = (name) => name.toLowerCase().includes("phụ kiện");

  const clothingCategories = categories.filter((cat) => isClothing(cat.name));
  const shoeCategories = categories.filter((cat) => isShoes(cat.name));
  const accessoryCategories = categories.filter((cat) =>
    isAccessories(cat.name)
  );

  const formatSlug = (str) =>
    str
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

  return (
    <div className="dropdown-content products-dropdown bg-white rounded-2xl shadow-2xl p-6 min-w-[700px] flex gap-8 border border-gray-100">
      {/* Nhóm: Quần Áo */}
      <div className="flex-1">
        <h4 className="font-bold text-blue-600 mb-2 flex items-center gap-2">
          <FaTshirt /> Quần Áo
        </h4>
        <ul className="space-y-2">
          {clothingCategories.map((cat) => (
            <li key={cat._id}>
              <Link
                to={`/collections/categories/${formatSlug(cat.name)}`}
                className="block px-3 py-2 rounded-lg hover:bg-blue-50 transition"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Nhóm: Giày */}
      <div className="flex-1">
        <h4 className="font-bold text-red-500 mb-2 flex items-center gap-2">
          <FaShoePrints /> Giày
        </h4>
        <ul className="space-y-2">
          {shoeCategories.map((cat) => (
            <li key={cat._id}>
              <Link
                to={`/collections/shoes/${formatSlug(cat.name)}`}
                className="block px-3 py-2 rounded-lg hover:bg-red-50 transition"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Nhóm: Phụ Kiện */}
      <div className="flex-1">
        <h4 className="font-bold text-green-600 mb-2 flex items-center gap-2">
          <FaBoxOpen /> Phụ Kiện
        </h4>
        <ul className="space-y-2">
          {accessoryCategories.map((cat) => (
            <li key={cat._id}>
              <Link
                to={`/collections/accessories/${formatSlug(cat.name)}`}
                className="block px-3 py-2 rounded-lg hover:bg-green-50 transition"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductsDropdown;
