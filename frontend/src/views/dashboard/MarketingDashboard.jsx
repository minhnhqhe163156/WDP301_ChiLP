// src/views/dashboard/MarketingDashboard.jsx
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaChartLine,
  FaImage,
  FaBlog,
  FaTicketAlt,
  FaPlus,
} from "react-icons/fa";
import { marketingApi } from "../../utils/api";
import BlogModal from "../../components/marketing/BlogModal";
import BannerModal from "../../components/marketing/BannerModal";

import toast from "react-hot-toast";
import "../../styles/MarketingDashboard.css";
import VoucherModal from "../../components/marketing/VoucherModal";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CardWrapper = ({ children }) => (
  <div className="marketing-card content-card">{children}</div>
);

const BannerCard = ({ banner, onEdit, onDelete }) => (
  <CardWrapper>
    <img
      src={banner.image_url}
      alt={banner.title}
      className="card-img-top"
      style={{ height: "200px", objectFit: "cover" }}
    />
    <div className="card-body">
      <h5 className="card-title">{banner.title}</h5>
      <div className="d-flex gap-2 mt-3">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => onEdit(banner)}
        >
          Sửa
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(banner._id)}
        >
          Xóa
        </button>
      </div>
    </div>
  </CardWrapper>
);

const BlogCard = ({ blog, onEdit, onDelete }) => (
  <CardWrapper>
    <div className="card-body">
      {blog.featured_image && (
        <img
          src={blog.featured_image}
          alt={blog.title}
          className="card-img-top mb-3"
          style={{ height: "150px", objectFit: "cover" }}
        />
      )}
      <h5 className="card-title">{blog.title}</h5>
      <p className="card-text text-truncate">{blog.content}</p>
      <div className="mt-2">
        <span className="badge bg-primary me-2">{blog.category}</span>
        {blog.tags?.map((tag) => (
          <span key={tag} className="badge bg-secondary me-1">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3 d-flex gap-2">
        <a
          href={`/blog/${blog._id}`}
          className="btn btn-sm btn-outline-info"
          target="_blank"
          rel="noopener noreferrer"
        >
          Xem
        </a>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => onEdit(blog)}
        >
          Sửa
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(blog._id)}
        >
          Xóa
        </button>
      </div>
    </div>
  </CardWrapper>
);

const VoucherCard = ({ voucher, onEdit, onDelete }) => (
  <CardWrapper>
    <div className="card-body">
      <h5 className="card-title">{voucher.voucher_code}</h5>
      <p>Giảm giá: {voucher.discount_value}%</p>
      <p className="text-muted small">
        {new Date(voucher.start_date).toLocaleDateString()} -{" "}
        {new Date(voucher.end_date).toLocaleDateString()}
      </p>
      <p className="text-muted small">
        Đã sử dụng: {voucher.used_count} / {voucher.usage_limit}
      </p>
      <div className="d-flex gap-2 mt-3">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => onEdit(voucher)}
        >
          Sửa
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(voucher._id)}
        >
          Xóa
        </button>
      </div>
    </div>
  </CardWrapper>
);

const StatCard = ({ icon, title, value }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg">
    <div className="flex items-center mb-4">
      <div className="text-slate-600">{icon}</div>
    </div>
    <h3 className="text-sm font-medium text-slate-600">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const MarketingDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("analytics");
  const [banners, setBanners] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Analytics counts
  const [userCount, setUserCount] = useState(null);
  const [blogCount, setBlogCount] = useState(null);
  const [bannerCount, setBannerCount] = useState(null);
  const [voucherCount, setVoucherCount] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // State for registration chart
  const [regType, setRegType] = useState("month");
  const [regYear, setRegYear] = useState(new Date().getFullYear());
  const [regMonth, setRegMonth] = useState(new Date().getMonth() + 1);
  const [regStats, setRegStats] = useState({ labels: [], counts: [] });
  const [regLoading, setRegLoading] = useState(false);

  // State for voucher usage chart
  const [voucherType, setVoucherType] = useState("month");
  const [voucherYear, setVoucherYear] = useState(new Date().getFullYear());
  const [voucherMonth, setVoucherMonth] = useState(new Date().getMonth() + 1);
  const [voucherStats, setVoucherStats] = useState({ labels: [], counts: [] });
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState("");

  // Thêm state cho bảng chi tiết lượt sử dụng từng voucher
  const [voucherUsageDetail, setVoucherUsageDetail] = useState([]);
  const [voucherDetailLoading, setVoucherDetailLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bannersRes, blogsRes, vouchersRes] = await Promise.all([
          marketingApi.getBanners(),
          marketingApi.getBlogs(),
          marketingApi.getVouchers(),
        ]);
        setBanners(bannersRes?.data || []);
        setBlogs(blogsRes?.data || []);
        setVouchers(vouchersRes?.data?.vouchers || []);
      } catch (err) {
        setError("Failed to load data");
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchAnalyticsCounts = async () => {
      setAnalyticsLoading(true);
      try {
        const [userRes, blogRes, bannerRes, voucherRes] = await Promise.all([
          marketingApi.getUserCount(),
          marketingApi.getBlogCount(),
          marketingApi.getBannerCount(),
          marketingApi.getVoucherCount(),
        ]);
        setUserCount(userRes.data.count);
        setBlogCount(blogRes.data.count);
        setBannerCount(bannerRes.data.count);
        setVoucherCount(voucherRes.data.count);
      } catch (err) {
        toast.error("Failed to load analytics counts");
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalyticsCounts();
  }, []);

  // Fetch registration stats
  useEffect(() => {
    const fetchRegStats = async () => {
      setRegLoading(true);
      try {
        let params = `type=${regType}`;
        if (regType === "month" || regType === "day")
          params += `&year=${regYear}`;
        if (regType === "day") params += `&month=${regMonth}`;
        const res = await marketingApi.getUserRegistrationStats(params);
        setRegStats(res.data);
      } catch (err) {
        toast.error("Failed to load registration stats");
        setRegStats({ labels: [], counts: [] });
      } finally {
        setRegLoading(false);
      }
    };
    fetchRegStats();
  }, [regType, regYear, regMonth]);

  // Fetch voucher usage detail khi vào analytics
  useEffect(() => {
    if (activeTab === "analytics") {
      setVoucherDetailLoading(true);
      marketingApi
        .getVoucherUsageDetail()
        .then((res) => setVoucherUsageDetail(res.data))
        .catch(() => setVoucherUsageDetail([]))
        .finally(() => setVoucherDetailLoading(false));
    }
  }, [activeTab]);

  const handleAddClick = () => {
    if (activeTab === "blogs") setShowBlogModal(true);
    else if (activeTab === "banners") setShowBannerModal(true);
    else if (activeTab === "vouchers") setShowVoucherModal(true);
  };

  const handleEdit = (type, item) => {
    console.log("Editing item:", item); // Add logging to debug
    setEditingItem(item);
    if (type === "blog") setShowBlogModal(true);
    else if (type === "banner") setShowBannerModal(true);
    else if (type === "voucher") setShowVoucherModal(true);
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      if (type === "banner") {
        await marketingApi.deleteBanner(id);
        setBanners(banners.filter((b) => b._id !== id));
      } else if (type === "blog") {
        await marketingApi.deleteBlog(id);
        setBlogs(blogs.filter((b) => b._id !== id));
      } else if (type === "voucher") {
        await marketingApi.deleteVoucher(id);
        setVouchers(vouchers.filter((v) => v._id !== id));
      }
      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`
      );
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredContent = () => {
    const term = searchTerm.toLowerCase();
    if (activeTab === "banners")
      return banners.filter((b) => b.title?.toLowerCase().includes(term));
    if (activeTab === "blogs")
      return blogs.filter(
        (b) =>
          b.title?.toLowerCase().includes(term) ||
          b.content?.toLowerCase().includes(term)
      );
    if (activeTab === "vouchers")
      return vouchers.filter((v) =>
        v.voucher_code?.toLowerCase().includes(term)
      );
    return [];
  };

  // Add/Edit Banner handler
  const handleBannerSubmit = async (formData) => {
    try {
      let res;
      if (editingItem && editingItem._id) {
        res = await marketingApi.updateBanner(editingItem._id, formData);
        setBanners(
          banners.map((b) => (b._id === editingItem._id ? res.data : b))
        );
        toast.success("Banner updated successfully!");
      } else {
        res = await marketingApi.createBanner(formData);
        setBanners([res.data, ...banners]);
        toast.success("Banner created successfully!");
      }
      setShowBannerModal(false);
      setEditingItem(null);
    } catch (err) {
      toast.error("Failed to save banner");
    }
  };

  // Add/Edit Blog handler
  const handleBlogSubmit = async (formData) => {
    try {
      let res;
      if (editingItem && editingItem._id) {
        res = await marketingApi.updateBlog(editingItem._id, formData);
        setBlogs(blogs.map((b) => (b._id === editingItem._id ? res.data : b)));
        toast.success("Blog updated successfully!");
      } else {
        res = await marketingApi.createBlog(formData);
        setBlogs([res.data, ...blogs]);
        toast.success("Blog created successfully!");
      }
      setShowBlogModal(false);
      setEditingItem(null);
    } catch (err) {
      toast.error("Failed to save blog");
    }
  };

  // Add/Edit Voucher handler
  const handleVoucherSubmit = async (formData) => {
    try {
      let res;
      if (editingItem && editingItem._id) {
        res = await marketingApi.updateVoucher(editingItem._id, formData);
        setVouchers(
          vouchers.map((v) => (v._id === editingItem._id ? res.data.voucher : v))
        );
        toast.success("Voucher updated successfully!");
      } else {
        res = await marketingApi.createVoucher(formData);
        setVouchers([res.data.voucher, ...vouchers]);
        toast.success("Voucher created successfully!");
      }
      setShowVoucherModal(false);
      setEditingItem(null);
    } catch (err) {
      toast.error("Failed to save voucher");
    }
  };

  if (!user || user.role !== "marketing_staff")
    return <Navigate to="/loginandregister" />;
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const analyticsStats = [
    {
      icon: <FaChartLine />,
      title: "Tổng người dùng",
      value: userCount !== null ? userCount : "...",
      change: null,
    },
    {
      icon: <FaBlog />,
      title: "Tổng bài viết",
      value: blogCount !== null ? blogCount : "...",
      change: null,
    },
    {
      icon: <FaImage />,
      title: "Tổng banner",
      value: bannerCount !== null ? bannerCount : "...",
      change: null,
    },
    {
      icon: <FaTicketAlt />,
      title: "Tổng voucher",
      value: voucherCount !== null ? voucherCount : "...",
      change: null,
    },
  ];

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3 bg-dark sidebar p-3">
          <h5 className="text-white mb-4">Bảng điều khiển Marketing</h5>
          {[
            { id: "analytics", icon: <FaChartLine />, label: "Thống kê" },
            { id: "banners", icon: <FaImage />, label: "Banner" },
            { id: "blogs", icon: <FaBlog />, label: "Bài viết" },
            { id: "vouchers", icon: <FaTicketAlt />, label: "Voucher" },
          ].map(({ id, icon, label }) => (
            <button
              key={id}
              className={`nav-link text-white btn btn-dark w-100 mb-2 ${activeTab === id ? "active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              {icon} {label}
            </button>
          ))}
        </div>
        <div className="col-md-9 py-4 px-5">
          <h3>
            {activeTab === "analytics"
              ? "Thống kê tổng quan"
              : `Quản lý ${activeTab}`}
          </h3>
          {activeTab !== "analytics" && (
            <div className="d-flex justify-content-between align-items-center my-3">
              <input
                type="text"
                className="form-control w-50"
                placeholder={`Tìm kiếm ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleAddClick}>
                <FaPlus /> Thêm {activeTab.slice(0, -1)}
              </button>
            </div>
          )}
          {activeTab === "analytics" ? (
            <>
              <div className="row g-4">
                {analyticsLoading ? (
                  <div className="col-12 text-center">Đang tải thống kê...</div>
                ) : (
                  analyticsStats.map((stat, i) => (
                    <div key={i} className="col-md-6 col-lg-3">
                      <StatCard {...stat} />
                    </div>
                  ))
                )}
              </div>
              {/* Registration Bar Chart */}
              <div className="mt-5">
                <h5>Thống kê đăng ký người dùng</h5>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <select
                    className="form-select w-auto"
                    value={regType}
                    onChange={(e) => setRegType(e.target.value)}
                  >
                    <option value="year">Theo năm</option>
                    <option value="month">Theo tháng</option>
                    <option value="day">Theo ngày</option>
                  </select>
                  {(regType === "month" || regType === "day") && (
                    <input
                      type="number"
                      className="form-control w-auto"
                      min="2000"
                      max="2100"
                      value={regYear}
                      onChange={(e) => setRegYear(Number(e.target.value))}
                    />
                  )}
                  {regType === "day" && (
                    <input
                      type="number"
                      className="form-control w-auto"
                      min="1"
                      max="12"
                      value={regMonth}
                      onChange={(e) => setRegMonth(Number(e.target.value))}
                    />
                  )}
                </div>
                {regLoading ? (
                  <div>Đang tải biểu đồ...</div>
                ) : (
                  <Bar
                    data={{
                      labels: regStats.labels,
                      datasets: [
                        {
                          label: "Đăng ký người dùng",
                          data: regStats.counts,
                          backgroundColor: "rgba(54, 162, 235, 0.6)",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                    }}
                    height={80}
                  />
                )}
              </div>
              {/* Thay thế bar chart voucher cũ bằng chart tổng lượt sử dụng từng voucher */}
              <div className="mt-5">
                <h5>Thống kê lượt sử dụng từng voucher</h5>
                {voucherDetailLoading ? (
                  <div>Đang tải...</div>
                ) : (
                  <Bar
                    data={{
                      labels: voucherUsageDetail.map((v) => v.voucher_code),
                      datasets: [
                        {
                          label: "Lượt sử dụng",
                          data: voucherUsageDetail.map((v) => v.used_count),
                          backgroundColor: "rgba(255, 99, 132, 0.6)",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        title: { display: false },
                      },
                    }}
                    height={80}
                  />
                )}
              </div>
              {/* Bảng chi tiết lượt sử dụng từng voucher */}
              {activeTab === "analytics" && (
                <div className="mt-5">
                  <h5>Chi tiết lượt sử dụng từng voucher</h5>
                  {voucherDetailLoading ? (
                    <div>Đang tải...</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-bordered table-striped">
                        <thead>
                          <tr>
                            <th>Mã voucher</th>
                            <th>Đã dùng</th>
                            <th>Giới hạn</th>
                            <th>Trạng thái</th>
                            <th>Giá trị giảm</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày kết thúc</th>
                          </tr>
                        </thead>
                        <tbody>
                          {voucherUsageDetail.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="text-center">
                                Không có dữ liệu
                              </td>
                            </tr>
                          ) : (
                            voucherUsageDetail.map((v) => (
                              <tr key={v.voucher_code}>
                                <td>{v.voucher_code}</td>
                                <td>{v.used_count}</td>
                                <td>{v.usage_limit}</td>
                                <td>
                                  {v.status === "active"
                                    ? "Đang hoạt động"
                                    : v.status === "used"
                                      ? "Đã dùng hết"
                                      : "Hết hạn"}
                                </td>
                                <td>{v.discount_value?.toLocaleString()}đ</td>
                                <td>
                                  {v.start_date
                                    ? new Date(
                                        v.start_date
                                      ).toLocaleDateString()
                                    : ""}
                                </td>
                                <td>
                                  {v.end_date
                                    ? new Date(v.end_date).toLocaleDateString()
                                    : ""}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="row g-4">
              {filteredContent().map((item) => (
                <div key={item._id} className="col-md-6 col-lg-4">
                  {activeTab === "banners" && (
                    <BannerCard
                      banner={item}
                      onEdit={(item) => handleEdit("banner", item)}
                      onDelete={(id) => handleDelete("banner", id)}
                    />
                  )}
                  {activeTab === "blogs" && (
                    <BlogCard
                      blog={item}
                      onEdit={(item) => handleEdit("blog", item)}
                      onDelete={(id) => handleDelete("blog", id)}
                    />
                  )}
                  {activeTab === "vouchers" && (
                    <VoucherCard
                      voucher={item}
                      onEdit={(item) => handleEdit("voucher", item)}
                      onDelete={(id) => handleDelete("voucher", id)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <BlogModal
        show={showBlogModal}
        onHide={() => {
          setShowBlogModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleBlogSubmit}
        editingItem={editingItem}
      />
      <BannerModal
        show={showBannerModal}
        onHide={() => {
          setShowBannerModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleBannerSubmit}
        editingItem={editingItem}
        blogs={blogs}
      />
      <VoucherModal
        show={showVoucherModal}
        onHide={() => {
          setShowVoucherModal(false);
          setEditingItem(null);
        }}
        onSubmit={handleVoucherSubmit}
        editingItem={editingItem}
      />
    </div>
  );
};

export default MarketingDashboard;
