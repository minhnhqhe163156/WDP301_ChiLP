import React, { useState } from "react";

const FILTERS = {
  brand: [
    { name: "NIKE", count: 12 },
    { name: "ADIDAS", count: 8 },
    { name: "PUMA", count: 5 },
    { name: "MIZUNO", count: 3 },
    { name: "KAMITO", count: 2 },
    { name: "KIKA", count: 1 },
  ],
  color: [
    { name: "Đen", value: "black", count: 10 },
    { name: "Trắng", value: "white", count: 7 },
    { name: "Đỏ", value: "red", count: 4 },
    { name: "Xanh", value: "blue", count: 6 },
    { name: "Vàng", value: "yellow", count: 2 },
  ],
  price: [
    { label: "Dưới 500K", value: "0-500000", count: 6 },
    { label: "500K - 1 triệu", value: "500000-1000000", count: 8 },
    { label: "1 triệu - 2 triệu", value: "1000000-2000000", count: 5 },
    { label: "Trên 2 triệu", value: "2000000-10000000", count: 3 },
  ],
  size: [
    { name: "36", count: 5 },
    { name: "37", count: 6 },
    { name: "38", count: 7 },
    { name: "39", count: 4 },
    { name: "40", count: 3 },
    { name: "41", count: 2 },
    { name: "42", count: 1 },
  ],
};

export default function ProductFilterSidebar({ filters, setFilters }) {
  const [open, setOpen] = useState({
    brand: true,
    color: false,
    price: false,
    size: false,
  });

  const handleCheckbox = (group, value) => {
    setFilters((prev) => ({
      ...prev,
      [group]: prev[group].includes(value)
        ? prev[group].filter((v) => v !== value)
        : [...prev[group], value],
    }));
  };

  return (
    <aside className="p-4 bg-white rounded-xl shadow sticky top-4 w-64">
      <div className="space-y-4">
        {/* Accordion Brand */}
        <div className="mb-4">
          <button
            onClick={() => setOpen((o) => ({ ...o, brand: !o.brand }))}
            className="w-full flex justify-between items-center font-semibold py-2 text-sm"
          >
            <span>Thương hiệu</span>
            <span>{open.brand ? "−" : "+"}</span>
          </button>
          {open.brand && (
            <ul className="pl-2 space-y-1">
              {FILTERS.brand.map((b) => (
                <li
                  key={b.name}
                  className="flex items-center justify-between py-0.5"
                >
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={filters.brand.includes(b.name)}
                      onChange={() => handleCheckbox("brand", b.name)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>{b.name}</span>
                  </label>
                  <span className="bg-gray-200 rounded px-2 text-xs">
                    {b.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Accordion Color */}
        <div className="mb-4">
          <button
            onClick={() => setOpen((o) => ({ ...o, color: !o.color }))}
            className="w-full flex justify-between items-center font-semibold py-2 text-sm"
          >
            <span>Màu sắc</span>
            <span>{open.color ? "−" : "+"}</span>
          </button>
          {open.color && (
            <ul className="pl-2 space-y-1">
              {FILTERS.color.map((c) => (
                <li
                  key={c.value}
                  className="flex items-center justify-between py-0.5"
                >
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={filters.color.includes(c.value)}
                      onChange={() => handleCheckbox("color", c.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>{c.name}</span>
                  </label>
                  <span className="bg-gray-200 rounded px-2 text-xs">
                    {c.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Accordion Price */}
        <div className="mb-4">
          <button
            onClick={() => setOpen((o) => ({ ...o, price: !o.price }))}
            className="w-full flex justify-between items-center font-semibold py-2 text-sm"
          >
            <span>Khoảng giá</span>
            <span>{open.price ? "−" : "+"}</span>
          </button>
          {open.price && (
            <ul className="pl-2 space-y-1">
              {FILTERS.price.map((p) => (
                <li
                  key={p.value}
                  className="flex items-center justify-between py-0.5"
                >
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={filters.price.includes(p.value)}
                      onChange={() => handleCheckbox("price", p.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>{p.label}</span>
                  </label>
                  <span className="bg-gray-200 rounded px-2 text-xs">
                    {p.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Accordion Size */}
        <div className="mb-4">
          <button
            onClick={() => setOpen((o) => ({ ...o, size: !o.size }))}
            className="w-full flex justify-between items-center font-semibold py-2 text-sm"
          >
            <span>Kích thước</span>
            <span>{open.size ? "−" : "+"}</span>
          </button>
          {open.size && (
            <ul className="pl-2 space-y-1">
              {FILTERS.size.map((s) => (
                <li
                  key={s.name}
                  className="flex items-center justify-between py-0.5"
                >
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={filters.size?.includes(s.name) || false}
                      onChange={() => handleCheckbox("size", s.name)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span>{s.name}</span>
                  </label>
                  <span className="bg-gray-200 rounded px-2 text-xs">
                    {s.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Clear Filters */}
        <button
          className="w-full bg-gray-100 hover:bg-gray-200 rounded py-2 mt-4 font-semibold text-sm"
          onClick={() =>
            setFilters({ brand: [], color: [], price: [], size: [] })
          }
        >
          Xóa bộ lọc
        </button>
      </div>
    </aside>
  );
}
