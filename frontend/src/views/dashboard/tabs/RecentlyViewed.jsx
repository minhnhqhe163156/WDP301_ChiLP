import React from "react";

const viewed = [
  { _id: "p1", name: "Áo thun nam" },
  { _id: "p2", name: "Giày sneaker" },
];

const suggestions = [
  { _id: "p3", name: "Quần short thể thao" },
  { _id: "p4", name: "Balo thời trang" },
];

export default function RecentlyViewed() {
  return (
    <div>
      <h4>Sản phẩm đã xem gần đây</h4>
      <ul>
        {viewed.map(p => <li key={p._id}>{p.name}</li>)}
      </ul>
      <h5 className="mt-4">Gợi ý cho bạn</h5>
      <ul>
        {suggestions.map(p => <li key={p._id}>{p.name}</li>)}
      </ul>
    </div>
  );
} 