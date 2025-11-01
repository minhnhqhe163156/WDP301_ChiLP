import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/LoginAndRegister.css";
import {
  FaGoogle,
  FaFacebook,
  FaGithub,
  FaLinkedin,
  FaArrowLeft,
  FaHome,
  FaTimes,
} from "react-icons/fa";

const LoginAndRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingGoogleLogin, setIsProcessingGoogleLogin] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [useOTPLogin, setUseOTPLogin] = useState(false);
  const [loginOTP, setLoginOTP] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: nhập email, 2: nhập OTP + mật khẩu mới
  const [forgotPasswordData, setForgotPasswordData] = useState({
    otp: "",
    newPassword: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("googleLogin") === "success") {
      const token = params.get("token");
      console.log("[Google Login] URL params:", {
        googleLogin: params.get("googleLogin"),
        token,
      });

      if (token) {
        setIsProcessingGoogleLogin(true);
        try {
          localStorage.setItem("token", token);
          // Set lại header Authorization cho axios
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          console.log("[Google Login] Token saved:", token);

          // Lấy thêm các trường từ URL nếu có
          const name = params.get("name");
          const email = params.get("email");
          const picture_avatar = params.get("picture_avatar");
          // Giải mã token để lấy role - sử dụng decode JWT đúng cách với UTF-8
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(escape(atob(base64)));
          const payload = JSON.parse(jsonPayload);
          // Gộp các trường lại nếu có
          payload.name = name || payload.name || "";
          payload.email = email || payload.email || "";
          payload.picture_avatar =
            picture_avatar ||
            payload.picture_avatar ||
            "https://via.placeholder.com/120";
          localStorage.setItem("storeduser", JSON.stringify(payload));
          localStorage.setItem("user", JSON.stringify(payload));
          if (window.authContext && window.authContext.setUser) {
            window.authContext.setUser(payload);
          }

          console.log("[Google Login] Navigating to role:", payload.role);

          // Đợi một chút để đảm bảo state được cập nhật
          setTimeout(() => {
            // Navigate theo role
            switch (payload.role) {
              case "admin":
                navigate("/admin/dashboard");
                break;
              case "marketing_staff":
                navigate("/marketing_staff/dashboard");
                break;
              case "seller":
                navigate("/seller/dashboard");
                break;
              case "customer":
                navigate("/customer/dashboard");
                break;
              default:
                console.log("[Google Login] Unknown role, navigating to home");
                navigate("/");
            }
            setIsProcessingGoogleLogin(false);
          }, 100);
        } catch (error) {
          console.error("[Google Login] Error processing token:", error);
          // Nếu decode lỗi, thử gọi API để lấy user info
          console.log("[Google Login] Trying to get user info from API...");
          // Có thể thêm logic gọi API ở đây nếu cần
          navigate("/");
          setIsProcessingGoogleLogin(false);
        }
      } else {
        console.error(
          "[Google Login] Không có token trong URL, không thể đăng nhập!"
        );
        navigate("/");
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTermsChange = (e) => {
    setAgreeTerms(e.target.checked);
  };

  // Gửi OTP cho forgot password
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      await axios.post("https://localhost:5000/api/auth/forgot-password/send-otp", { 
        email: forgotEmail 
      });
      setForgotPasswordStep(2);
      setMessage("OTP đã được gửi về email của bạn.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Có lỗi xảy ra!");
    }
    setIsLoading(false);
  };

  // Xác thực OTP và đổi mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      await axios.post("https://localhost:5000/api/auth/forgot-password/reset", {
        email: forgotEmail,
        otp: forgotPasswordData.otp,
        newPassword: forgotPasswordData.newPassword
      });
      setMessage("Đổi mật khẩu thành công!");
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotEmail("");
        setForgotPasswordData({ otp: "", newPassword: "" });
        setForgotPasswordStep(1);
        setMessage("");
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Có lỗi xảy ra!");
    }
    setIsLoading(false);
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({ ...forgotPasswordData, [e.target.name]: e.target.value });
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotEmail("");
    setForgotPasswordData({ otp: "", newPassword: "" });
    setForgotPasswordStep(1);
    setMessage("");
  };

  // Gửi OTP đăng nhập (theo Decathlon)
  const handleSendLoginOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const response = await axios.post("https://localhost:5000/api/auth/login/check-email", { 
        email: formData.email 
      });
      setUseOTPLogin(true);
      setMessage(`OTP đã được gửi về email của bạn. (${response.data.accountType})`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Có lỗi xảy ra!");
    }
    setIsLoading(false);
  };

  // Xác thực OTP đăng nhập
  const handleVerifyLoginOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      console.log("=== DEBUG: handleVerifyLoginOTP ===");
      console.log("Email:", formData.email);
      console.log("OTP (raw):", loginOTP);
      
      // Loại bỏ khoảng trắng và format OTP
      const cleanOTP = loginOTP.trim().replace(/\s/g, '');
      console.log("OTP (cleaned):", cleanOTP);
      
      const response = await axios.post("https://localhost:5000/api/auth/login/verify-otp", {
        email: formData.email,
        otp: cleanOTP
      });
      
      console.log("Response:", response.data);
      
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      console.log("User role:", user.role);
      console.log("Navigating to role:", user.role);
      
      // Cập nhật context nếu có
      if (window.authContext && window.authContext.setUser) {
        window.authContext.setUser(user);
      }
      
      // Chuyển hướng theo role
      handleRoleBasedNavigation(user.role);
    } catch (err) {
      console.error("OTP Login Error:", err);
      console.error("Error response:", err.response?.data);
      setMessage(err.response?.data?.message || "Có lỗi xảy ra!");
    }
    setIsLoading(false);
  };

  // Quay lại đăng nhập bằng password
  const handleBackToPasswordLogin = () => {
    setUseOTPLogin(false);
    setLoginOTP("");
    setMessage("");
  };

  const handleRoleBasedNavigation = (role) => {
    console.log("=== DEBUG: handleRoleBasedNavigation ===");
    console.log("Role received:", role);
    
    switch (role) {
      case "admin":
        console.log("Navigating to admin dashboard");
        navigate("/admin/dashboard");
        break;
      case "marketing_staff":
        console.log("Navigating to marketing dashboard");
        navigate("/marketing_staff/dashboard");
        break;
      case "seller":
        console.log("Navigating to seller dashboard");
        navigate("/seller/dashboard");
        break;
      case "customer":
        console.log("Navigating to customer dashboard");
        navigate("/customer/dashboard");
        break;
      default:
        console.log("Navigating to home (default)");
        navigate("/");
    }
  };

  const validateForm = (isLoginMode) => {
    // Đăng nhập chỉ cần email, password
    if (isLoginMode) {
      if (!formData.email.endsWith('@gmail.com')) {
        setMessage('Email phải có đuôi @gmail.com');
        return false;
      }
      if (!formData.password || formData.password.length > 20) {
        setMessage('Password tối đa 20 ký tự');
        return false;
      }
      return true;
    }
    // Đăng ký cần name, email, password
    const usernameRegex = /^[a-zA-Z0-9]{4,30}$/;
    if (!usernameRegex.test(formData.name)) {
      setMessage('Username phải từ 4-30 ký tự, không chứa ký tự đặc biệt');
      return false;
    }
    if (!formData.email.endsWith('@gmail.com')) {
      setMessage('Email phải có đuôi @gmail.com');
      return false;
    }
    if (!formData.password || formData.password.length > 20) {
      setMessage('Password tối đa 20 ký tự');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    // Validate trước khi gửi
    if (!validateForm(isLogin)) {
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const user = await login(formData.email, formData.password);
        handleRoleBasedNavigation(user.role);
      } else {
        if (!agreeTerms) {
          setMessage("Please agree to the terms and conditions");
          setIsLoading(false);
          return;
        }

        const res = await axios.post(
          "https://localhost:5000/api/auth/register",
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: "customer", // Default role for new registrations
          }
        );

        setMessage(
          res.data.message || "Registration successful! Please login."
        );
        setTimeout(() => {
          setIsLogin(true);
          setMessage("");
          setFormData({ name: "", email: "", password: "" });
          setAgreeTerms(false);
        }, 2000);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const renderSocialButtons = () => (
    <div className="social-icons">
      <a
        href="https://localhost:5000/api/auth/google"
        className="social-btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        disabled={isLoading}
      >
        <FaGoogle />
      </a>
      <button type="button" className="social-btn" disabled={isLoading}>
        <FaFacebook />
      </button>
      <button type="button" className="social-btn" disabled={isLoading}>
        <FaGithub />
      </button>
      <button type="button" className="social-btn" disabled={isLoading}>
        <FaLinkedin />
      </button>
    </div>
  );

  return (
    <div className="login-page">
      {isProcessingGoogleLogin && (
        <div className="google-login-loading">
          <div className="loading-spinner"></div>
          <p>Đang xử lý đăng nhập Google...</p>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="forgot-password-modal">
          <div className="forgot-password-content">
            <button className="close-btn" onClick={closeForgotPassword}>
              <FaTimes />
            </button>
            <h2>Quên mật khẩu</h2>
            <form onSubmit={forgotPasswordStep === 1 ? handleSendOTP : handleResetPassword}>
              {forgotPasswordStep === 1 ? (
                <>
                  <div className="input-box">
                    <input
                      type="email"
                      placeholder="Nhập email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      disabled={isLoading}
                    />
                    <i className="bx bxs-envelope"></i>
                  </div>
                  <button type="submit" className="btn" disabled={isLoading}>
                    {isLoading ? "Đang gửi..." : "Gửi OTP"}
                  </button>
                </>
              ) : (
                <>
                  <div className="input-box">
                    <input
                      type="text"
                      name="otp"
                      placeholder="Nhập mã OTP"
                      required
                      value={forgotPasswordData.otp}
                      onChange={handleForgotPasswordChange}
                      disabled={isLoading}
                    />
                    <i className="bx bxs-key"></i>
                  </div>
                  <div className="input-box">
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Nhập mật khẩu mới"
                      required
                      value={forgotPasswordData.newPassword}
                      onChange={handleForgotPasswordChange}
                      disabled={isLoading}
                    />
                    <i className="bx bxs-lock-alt"></i>
                  </div>
                  <button type="submit" className="btn" disabled={isLoading}>
                    {isLoading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                  </button>
                </>
              )}
              {message && <p className="message">{message}</p>}
            </form>
          </div>
        </div>
      )}

      <button className="back-to-home gradient" onClick={handleBackToHome}>
        <FaArrowLeft />
        <span>Quay về trang chủ</span>
      </button>
      <div className={`container ${!isLogin ? "active" : ""}`}>
        {/* Login Form */}
        <div className="form-box login">
          <form onSubmit={isLogin ? (useOTPLogin ? handleVerifyLoginOTP : handleSubmit) : (e) => e.preventDefault()}>
            <h1>Login</h1>
            <div className="input-box">
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                onChange={handleChange}
                value={formData.email}
                disabled={isLoading}
              />
              <i className="bx bxs-envelope"></i>
            </div>
            
            {!useOTPLogin ? (
              <div className="input-box">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  onChange={handleChange}
                  value={formData.password}
                  disabled={isLoading}
                />
                <i className="bx bxs-lock-alt"></i>
              </div>
            ) : (
              <>
                <div className="input-box">
                  <input
                    type="text"
                    placeholder="Nhập mã OTP"
                    required
                    value={loginOTP}
                    onChange={(e) => {
                      // Chỉ cho phép nhập số và tự động format
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setLoginOTP(value);
                    }}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    disabled={isLoading}
                  />
                  <i className="bx bxs-key"></i>
                </div>
                <button 
                  type="button" 
                  onClick={handleBackToPasswordLogin}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#6e8efb', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginTop: '10px'
                  }}
                >
                  ← Quay lại đăng nhập bằng mật khẩu
                </button>
              </>
            )}

            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? "Loading..." : (useOTPLogin ? "Xác thực email" : "Login")}
            </button>
            
            {/* {!useOTPLogin && (
              <button 
                type="button" 
                onClick={handleSendLoginOTP}
                className="btn"
                style={{ 
                  background: '#a777e3', 
                  marginTop: '10px',
                  width: '100%'
                }}
                disabled={isLoading || !formData.email}
              >
                {isLoading ? "Đang gửi..." : "Xác Thực Email"}
              </button>
            )} */}
            
            {message && isLogin && <p className="message">{message}</p>}
            
            {/* Forgot Password Link */}
            <div className="forgot-link">
              {/* <button 
                type="button" 
                onClick={() => setShowForgotPassword(true)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#a777e3', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '400',
                  textDecoration: 'none',
                  marginTop: '20px'
                }}
              >
                Forgot Password ?
              </button> */}
            </div>
            
            <p>or login with social platforms</p>
            {renderSocialButtons()}
          </form>
        </div>

        {/* Register Form */}
        <div className="form-box register">
          <form onSubmit={!isLogin ? handleSubmit : (e) => e.preventDefault()}>
            <h1>Register account</h1>
            <div className="input-box">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                onChange={handleChange}
                value={formData.name}
                disabled={isLoading}
              />
              <i className="bx bxs-user"></i>
            </div>
            <div className="input-box">
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                onChange={handleChange}
                value={formData.email}
                disabled={isLoading}
              />
              <i className="bx bxs-envelope"></i>
            </div>
            <div className="input-box">
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                onChange={handleChange}
                value={formData.password}
                disabled={isLoading}
              />
              <i className="bx bxs-lock-alt"></i>
            </div>
            <div className="terms-checkbox">
              <input
                type="checkbox"
                name="terms"
                id="terms"
                checked={agreeTerms}
                onChange={handleTermsChange}
                disabled={isLoading}
              />
              <label htmlFor="terms">I agree to the terms and conditions</label>
            </div>
            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? "Loading..." : "Register"}
            </button>
            {message && !isLogin && <p className="message">{message}</p>}
            <p>or register with social platforms</p>
            {renderSocialButtons()}
          </form>
        </div>

        {/* Toggle between Login and Register */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Hi, Welcome To PACEUP</h1>
            <p style={{color : "white"}}>Don't have an account?</p>
            <button 
              className="btn register-btn" 
              onClick={() => { setIsLogin(false); setMessage(''); }}
              disabled={isLoading}
            >
              Register now
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>Welcome, are you ready?</h1>
            <p style={{color : "white"}}>Already have an account?</p>
            <button 
              className="btn login-btn" 
              onClick={() => { setIsLogin(true); setMessage(''); }}
              disabled={isLoading}
            >
              Login now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAndRegister;
