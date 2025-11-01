import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Users, BarChart as BarChart2, UserCog } from "lucide-react";
import { toast } from "react-toastify";

import {
  fetchUsers,
  updateUserStatus,
  changeOwnPassword,
  getRevenueStats,
  getOrderStats,
  getCategoryStats,
  updateUserRole,
} from "../../api/adminApi";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [changePasswordData, setChangePasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [filter, setFilter] = useState({
    name: "",
    email: "",
    phone: "",
    departmentName: "all",
    role: "all",
    status: "all",
  });
  const [appliedFilter, setAppliedFilter] = useState({ ...filter });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [revenueType, setRevenueType] = useState("week");
  const [orderData, setOrderData] = useState([]);
  const [orderStatType, setOrderStatType] = useState("month");
  const [categoryData, setCategoryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // get user
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetchUsers();
        setUsers(res.data || []);
      } catch {
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  // income

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await getRevenueStats(revenueType);
        const rawData = res.data || [];

        if (revenueType === "month") {
          const currentYear = 2025;
          const months = Array.from({ length: 12 }, (_, i) => {
            const key = `${currentYear}-${String(i + 1).padStart(2, "0")}`; // YYYY-MM
            return { label: `Tháng ${i + 1}`, revenue: 0, _id: key };
          });

          rawData.forEach((item) => {
            const index = months.findIndex((m) => m._id === item._id);
            if (index !== -1) {
              months[index].revenue = item.total;
            }
          });

          setRevenueData(months);
        } else {
          // Với tuần thì chỉ cần gán dữ liệu
          const data = rawData.map((item) => ({
            label: item._id, // _id = YYYY-MM-DD
            revenue: item.total,
          }));
          setRevenueData(data);
        }
      } catch (err) {
        console.error("Lỗi khi fetch doanh thu:", err);
        setRevenueData([]);
      }
    };

    fetchRevenue();
  }, [revenueType]);

  // get order stats

  useEffect(() => {
    const loadOrderStats = async () => {
      try {
        const res = await getOrderStats(orderStatType);
        const rawData = res.data || [];

        if (orderStatType === "month") {
          const currentYear = 2025;
          const months = Array.from({ length: 12 }, (_, i) => {
            const key = `${currentYear}-${String(i + 1).padStart(2, "0")}`;
            return { label: `Tháng ${i + 1}`, orders: 0, _id: key };
          });

          rawData.forEach((item) => {
            const index = months.findIndex((m) => m._id === item._id);
            if (index !== -1) {
              months[index].orders = item.totalOrders;
            }
          });

          setOrderData(months.map(({ label, orders }) => ({ label, orders })));
        } else {
          // Hiển thị theo tuần (7 ngày gần nhất)
          const weekData = rawData.map((item) => ({
            label: item._id?.slice(5) || "N/A", // hiển thị MM-DD
            orders: item.totalOrders || 0,
          }));
          setOrderData(weekData);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu đơn hàng:", err);
        setOrderData([]);
      }
    };

    loadOrderStats();
  }, [orderStatType]);

  // get category stats
  useEffect(() => {
    if (activeTab !== "stats") return;

    const fetchCategoryStats = async () => {
      try {
        const res = await getCategoryStats(); // API đã có
        const formatted = res.data.map((item) => ({
          name: item.name || "Không xác định",
          value: item.value,
        }));
        setCategoryData(formatted);
      } catch (err) {
        console.error("Lỗi lấy thống kê danh mục:", err);
        setCategoryData([]);
      }
    };

    fetchCategoryStats();
  }, [activeTab]);

  const handleUpdateStatus = async (userId, isActive) => {
    try {
      await updateUserStatus(userId, isActive);
      const res = await fetchUsers();
      setUsers(res.data || []);
      toast.success(
        `Tài khoản đã được ${isActive ? "kích hoạt" : "vô hiệu hóa"} thành công!`
      );
    } catch {
      toast.error("Không thể cập nhật trạng thái tài khoản");
    }
  };

  const handleUpdateUserRole = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
      const res = await fetchUsers();
      setUsers(res.data || []);
      toast.success("Cập nhật vai trò thành công!");
    } catch (error) {
      toast.error("Không thể cập nhật vai trò người dùng");
    }
  };

  const getRoleInfo = (role) => {
    const r = (role || "").toLowerCase();
    if (r === "admin")
      return { label: "Quản trị viên", color: "bg-red-500 text-white" };
    if (r === "seller")
      return { label: "Người bán", color: "bg-blue-500 text-white" };
    if (r === "customer")
      return { label: "Khách hàng", color: "bg-green-500 text-white" };
    if (r.includes("staff"))
      return { label: "Nhân viên", color: "bg-yellow-500 text-white" };
    return { label: role, color: "bg-gray-400 text-white" };
  };

  const filteredUsers = users.filter((user) => {
    const nameMatch =
      !appliedFilter.name ||
      (user.fullName || user.name || "")
        .toLowerCase()
        .includes(appliedFilter.name.toLowerCase());
    const emailMatch =
      !appliedFilter.email ||
      (user.email || "")
        .toLowerCase()
        .includes(appliedFilter.email.toLowerCase());
    const userRole = (user.role || "").toLowerCase();
    const filterRole = (appliedFilter.role || "").toLowerCase();
    const roleMatch =
      filterRole === "all" ||
      (filterRole === "admin" && userRole === "admin") ||
      (filterRole === "employee" &&
        (userRole === "employee" || userRole.includes("staff"))) ||
      (filterRole === "seller" && userRole === "seller") ||
      (filterRole === "customer" && userRole === "customer");
    const statusMatch =
      appliedFilter.status === "all" ||
      (appliedFilter.status === "active" && user.is_active) ||
      (appliedFilter.status === "inactive" && !user.is_active);

    return nameMatch && emailMatch && roleMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-4 space-y-4">
        <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>

        <button
          className={`w-full flex items-center gap-2 text-left px-4 py-2 rounded ${
            activeTab === "users" ? "bg-white text-black font-semibold" : ""
          }`}
          onClick={() => setActiveTab("users")}
        >
          <Users size={18} />
          Quản lý người dùng
        </button>

        <button
          className={`w-full flex items-center gap-2 text-left px-4 py-2 rounded ${
            activeTab === "stats" ? "bg-white text-black font-semibold" : ""
          }`}
          onClick={() => setActiveTab("stats")}
        >
          <BarChart2 size={18} />
          Thống kê
        </button>

        <button
          className={`w-full flex items-center gap-2 text-left px-4 py-2 rounded ${
            activeTab === "profile" ? "bg-white text-black font-semibold" : ""
          }`}
          onClick={() => setActiveTab("profile")}
        >
          <UserCog size={18} />
          Hồ sơ
        </button>
      </div>

      {/* Nội dung */}
      <div className="flex-1 bg-gray-50 p-6">
        {activeTab === "users" && (
          <Card>
            <CardContent>
              <div
                className="bg-muted/50 py-4 rounded-lg mb-6 px-4"
                style={{ position: "relative", zIndex: 50 }}
              >
                <form
                  className="flex flex-wrap gap-4"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="flex flex-col gap-1 min-w-[180px] flex-1 sm:max-w-[220px]">
                    <Label className="text-sm font-medium">Người dùng</Label>
                    <Input
                      placeholder="Tìm theo tên..."
                      className="w-full"
                      value={filter.name}
                      onChange={(e) =>
                        setFilter((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1 min-w-[180px] flex-1 sm:max-w-[220px]">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input
                      placeholder="Tìm theo email..."
                      className="w-full"
                      value={filter.email}
                      onChange={(e) =>
                        setFilter((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1 min-w-[180px] flex-1 sm:max-w-[220px]">
                    <Label className="text-sm font-medium">Vai trò</Label>
                    <Select
                      value={filter.role}
                      onValueChange={(value) =>
                        setFilter((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Lọc theo vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả vai trò</SelectItem>
                        <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                        <SelectItem value="EMPLOYEE">Nhân viên</SelectItem>
                        <SelectItem value="SELLER">Người bán</SelectItem>
                        <SelectItem value="CUSTOMER">Khách hàng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1 min-w-[180px] flex-1 sm:max-w-[220px]">
                    <Label className="text-sm font-medium">Trạng thái</Label>
                    <Select
                      value={filter.status}
                      onValueChange={(value) =>
                        setFilter((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Lọc theo trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="active">Đang hoạt động</SelectItem>
                        <SelectItem value="inactive">
                          Không hoạt động
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end min-w-[120px]">
                    <Button
                      className="w-full"
                      type="button"
                      onClick={() => setAppliedFilter({ ...filter })}
                    >
                      Lọc
                    </Button>
                  </div>
                </form>
              </div>
              <div
                className="rounded-md border overflow-x-auto bg-white"
                style={{ position: "relative", zIndex: 1 }}
              >
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow className="border-b bg-muted/50">
                      <TableHead className="p-2 text-left">STT</TableHead>
                      <TableHead className="p-2 text-left">Họ và tên</TableHead>
                      <TableHead className="p-2 text-left">Email</TableHead>
                      <TableHead className="p-2 text-left">Giới tính</TableHead>
                      <TableHead className="p-2 text-left">Vai trò</TableHead>
                      <TableHead className="p-2 text-left">
                        Trạng thái
                      </TableHead>
                      <TableHead className="p-2 text-left">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingUsers ? (
                      <TableRow>
                        <TableCell colSpan={8} className="p-4 text-center">
                          Đang tải danh sách người dùng...
                        </TableCell>
                      </TableRow>
                    ) : paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user, index) => (
                        <TableRow
                          key={user._id || user.id}
                          className="border-b"
                        >
                          <TableCell className="p-2">{index + 1}</TableCell>
                          <TableCell className="p-2">
                            {user.fullName || user.name}
                          </TableCell>
                          <TableCell className="p-2">{user.email}</TableCell>
                          <TableCell className="p-2">{user.gender}</TableCell>
                          <TableCell className="p-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Badge
                                  className={`${getRoleInfo(user.role).color} mr-2 capitalize cursor-pointer`}
                                >
                                  {getRoleInfo(user.role).label}
                                </Badge>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {[
                                  {
                                    role: "marketing_staff",
                                    label: "Nhân viên",
                                  },
                                  {role:"seller", label: "Người bán"},
                                  { role: "customer", label: "Khách hàng" },
                                ].map((item) => (
                                  <DropdownMenuItem
                                    key={item.role}
                                    onClick={() =>
                                      handleUpdateUserRole(user._id, item.role)
                                    }
                                  >
                                    {item.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                          <TableCell className="p-2">
                            <Badge
                              className={
                                user.is_active
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-400 text-white"
                              }
                            >
                              {user.is_active
                                ? "Đang hoạt động"
                                : "Không hoạt động"}
                            </Badge>
                          </TableCell>
                          <TableCell className="p-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(user._id, !user.is_active)
                              }
                              className={
                                user.is_active
                                  ? "bg-red-500 text-white rounded hover:bg-red-600"
                                  : "bg-green-500 text-white rounded hover:bg-green-600"
                              }
                            >
                              {user.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="p-4 text-center text-muted-foreground"
                        >
                          Không có người dùng nào.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="flex justify-center items-center mt-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter />
          </Card>
        )}

        {activeTab === "stats" && (
          <div className="space-y-10">
            {/* <h2 className="text-2xl font-semibold mb-4">Thống kê</h2> */}

            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">
                  Doanh thu theo {revenueType === "month" ? "tháng" : "tuần"}
                </h3>
                <select
                  className="border px-2 py-1 rounded text-sm"
                  value={revenueType}
                  onChange={(e) => setRevenueType(e.target.value)}
                >
                  <option value="month">12 tháng gần nhất</option>
                  <option value="week">7 ngày gần nhất</option>
                </select>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={revenueData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }} // thêm dòng này
                >
                  <XAxis
                    dataKey="label"
                    textAnchor="end"
                    // interval={0} // Hiển thị tất cả nhãn
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        maximumFractionDigits: 0,
                      }).format(value)
                    }
                    width={100}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#82ca9d"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">
                  Số đơn hàng theo {orderStatType === "week" ? "tuần" : "tháng"}
                </h3>
                <select
                  className="border px-2 py-1 rounded text-sm"
                  value={orderStatType}
                  onChange={(e) => setOrderStatType(e.target.value)}
                >
                  <option value="month">12 tháng gần nhất</option>
                  <option value="week">7 ngày gần nhất</option>
                </select>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orderData}>
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} /> {/* ✅ chỉ hiện số nguyên */}
                  <Tooltip />
                  <Bar dataKey="orders" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-2">
                Số lượng sản phẩm bán ra theo danh mục
              </h3>
              {categoryData.length === 0 ? (
                <p className="text-center text-gray-500">
                  Không có dữ liệu để hiển thị
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
        {activeTab === "profile" && (
          <Card className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">Đổi mật khẩu</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await changeOwnPassword(
                      changePasswordData.oldPassword,
                      changePasswordData.newPassword
                    );

                    toast(res?.data?.message || "Đổi mật khẩu thành công!");
                    setChangePasswordData({ oldPassword: "", newPassword: "" });
                  } catch (err) {
                    const errorMessage =
                      err?.response?.data?.message ||
                      err?.response?.data?.error ||
                      "Lỗi không xác định từ server.";
                    toast(errorMessage);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
                  <Input
                    type="password"
                    id="oldPassword"
                    value={changePasswordData.oldPassword}
                    onChange={(e) =>
                      setChangePasswordData((prev) => ({
                        ...prev,
                        oldPassword: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    type="password"
                    id="newPassword"
                    value={changePasswordData.newPassword}
                    onChange={(e) =>
                      setChangePasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-black text-white">
                  Đổi mật khẩu
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
