// utils/sendMail.js
const nodemailer = require("nodemailer");

// Kiểm tra biến môi trường
if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
  throw new Error("Missing GMAIL_USER or GMAIL_PASS in environment variables");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "xuankhanh036@gmail.com",
    pass: process.env.GMAIL_PASS || "ksdt vlmm xazr jjzu",
  },
});

exports.sendRefundEmail = async (to, orderId) => {
  const from = transporter.options.auth.user;
  const now = new Date();
  const refundTime = now.toLocaleString("vi-VN", { hour12: false });

  const mailOptions = {
    from,
    to,
    subject: "PACEUPSHOP - Xác nhận hoàn tiền đơn hàng",
    text: `Đơn hàng #${orderId} của bạn đã được hoàn tiền thành công.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border:1px solid #eee; border-radius:8px; overflow:hidden;">
        <div style="background: #ee4d2d; color: white; padding: 24px 16px; text-align: center;">
          <h2 style="margin:0;">PACEUPSHOP</h2>
          <p style="margin:0; font-size: 18px;">Xác nhận hoàn tiền đơn hàng</p>
        </div>
        <div style="background: #fff; padding: 24px 16px;">
          <p>Xin chào quý khách,</p>
          <p>
            Đơn hàng <b style="color:#ee4d2d;">#${orderId}</b> của bạn đã được <b style="color:green;">hoàn tiền thành công</b>.<br/>
            Số tiền sẽ được chuyển về tài khoản/thẻ bạn đã dùng để thanh toán trong vòng 1-3 ngày làm việc (tùy ngân hàng).
          </p>
          <div style="background:#f7f7f7; border-radius:6px; padding:12px 16px; margin:16px 0;">
            <b>Thông tin đơn hàng:</b><br/>
            Mã đơn hàng: <b>#${orderId}</b><br/>
            Thời gian hoàn tiền: ${refundTime}
          </div>
          <p>
            Nếu có thắc mắc, vui lòng liên hệ CSKH PACEUPSHOP qua email này hoặc hotline <b>1900 1234</b>.
          </p>
          <p style="color:#888; font-size:13px;">Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của PACEUPSHOP!</p>
        </div>
        <div style="background: #f5f5f5; color: #888; text-align: center; padding: 12px; font-size: 12px;">
          © 2024 PACEUPSHOP. All rights reserved.
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

exports.sendMailOTP = async (to, otp) => {
  const from = transporter.options.auth.user;
  const mailOptions = {
    from,
    to,
    subject: "PACEUPSHOP - Mã OTP đặt lại mật khẩu",
    text: `Mã OTP của bạn là: ${otp}. Có hiệu lực trong 10 phút.`,
    html: `<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; border:1px solid #eee; border-radius:8px; overflow:hidden;\">
      <div style=\"background: #ee4d2d; color: white; padding: 24px 16px; text-align: center;\">
        <h2 style=\"margin:0;\">PACEUPSHOP</h2>
        <p style=\"margin:0; font-size: 18px;\">Mã OTP đặt lại mật khẩu</p>
      </div>
      <div style=\"background: #fff; padding: 24px 16px;\">
        <p>Xin chào,</p>
        <p>Mã OTP của bạn là: <b style=\"color:#ee4d2d; font-size:24px;\">${otp}</b></p>
        <p>Mã này có hiệu lực trong 10 phút.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      </div>
      <div style=\"background: #f5f5f5; color: #888; text-align: center; padding: 12px; font-size: 12px;\">
        © 2024 PACEUPSHOP. All rights reserved.
      </div>
    </div>`
  };
  await transporter.sendMail(mailOptions);
};

exports.sendLoginOTP = async (to, otp, deviceInfo = {}, accountType = "email") => {
  const from = transporter.options.auth.user;
  const now = new Date();
  const loginTime = now.toLocaleString("vi-VN", { hour12: false });

  const accountTypeText = accountType === "google" ? "Google" : 
                         accountType === "linked" ? "PaceupSHop (đã liên kết Google)" : "PaceupSHop";

  const mailOptions = {
    from,
    to,
    subject: "PACEUPSHOP - Mã OTP đăng nhập",
    text: `Mã OTP đăng nhập vào tài khoản ${accountTypeText} của bạn là: ${otp}. Có hiệu lực trong 5 phút.`,
    html: `<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; border:1px solid #eee; border-radius:8px; overflow:hidden;\">
      <div style=\"background: #ee4d2d; color: white; padding: 24px 16px; text-align: center;\">
        <h2 style=\"margin:0;\">PACEUPSHOP</h2>
        <p style=\"margin:0; font-size: 18px;\">Mã OTP đăng nhập</p>
      </div>
      <div style=\"background: #fff; padding: 24px 16px;\">
        <p>Xin chào,</p>
        <p>Chúng tôi nhận được yêu cầu đăng nhập vào tài khoản <b>${accountTypeText}</b> của bạn.</p>
        <p>Mã OTP của bạn là: <b style=\"color:#ee4d2d; font-size:24px;\">${otp}</b></p>
        <p>Mã này có hiệu lực trong 5 phút.</p>
        <div style=\"background:#f7f7f7; border-radius:6px; padding:12px 16px; margin:16px 0;\">
          <b>Thông tin đăng nhập:</b><br/>
          Tài khoản: ${accountTypeText}<br/>
          Thời gian: ${loginTime}<br/>
          Email: ${to}<br/>
          ${deviceInfo.browser ? `Trình duyệt: ${deviceInfo.browser}<br/>` : ''}
          ${deviceInfo.ip ? `IP: ${deviceInfo.ip}<br/>` : ''}
          ${deviceInfo.location ? `Vị trí: ${deviceInfo.location}<br/>` : ''}
        </div>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này và thay đổi mật khẩu ngay lập tức.</p>
      </div>
      <div style=\"background: #f5f5f5; color: #888; text-align: center; padding: 12px; font-size: 12px;\">
        © 2024 PACEUPSHOP. All rights reserved.
      </div>
    </div>`
  };
  await transporter.sendMail(mailOptions);
};
