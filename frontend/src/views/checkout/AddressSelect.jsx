import React, { useState } from "react";
import addressData from "./addressData.json";

// Nếu addressData là object có key 'data', lấy mảng từ addressData.data
const rawData = Array.isArray(addressData) ? addressData : (Array.isArray(addressData.data) ? addressData.data : []);

export default function AddressSelect({ info, setInfo }) {
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const provinces = rawData.map(p => p.name);
  const districts = selectedProvince
    ? rawData.find(p => p.name === selectedProvince)?.level2s.map(d => d.name) || []
    : [];
  const wards = selectedDistrict
    ? (rawData
        .find(p => p.name === selectedProvince)
        ?.level2s.find(d => d.name === selectedDistrict)?.level3s.map(w => w.name) || [])
    : [];

  return (
    <>
      {/* Province */}
      <div className="group mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành phố</label>
        <select
          name="province"
          value={selectedProvince}
          onChange={e => {
            setSelectedProvince(e.target.value);
            setSelectedDistrict("");
            setInfo({ ...info, province: e.target.value, district: "", ward: "" });
          }}
          required
          className="form-control"
        >
          <option value="">Chọn Tỉnh/Thành phố</option>
          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* District */}
      <div className="group mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
        <select
          name="district"
          value={selectedDistrict}
          onChange={e => {
            setSelectedDistrict(e.target.value);
            setInfo({ ...info, district: e.target.value, ward: "" });
          }}
          required
          disabled={!selectedProvince}
          className="form-control"
        >
          <option value="">Chọn Quận/Huyện</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Ward */}
      <div className="group mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">Phường/Xã</label>
        <select
          name="ward"
          value={info.ward}
          onChange={e => setInfo({ ...info, ward: e.target.value })}
          required
          disabled={!selectedDistrict}
          className="form-control"
        >
          <option value="">Chọn Phường/Xã</option>
          {wards.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>
    </>
  );
} 