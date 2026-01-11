import api from "./api"; // import instance axios đã tạo
import { AxiosResponse } from "axios";

// ================= TYPES =================
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
}
export interface ChangePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}
// ================= AUTH SERVICE =================
const AuthService = {
  // 👉 Đăng ký
  register: async (data: RegisterData) => {
    const res: AxiosResponse = await api.post("/register", data);
    return res.data;
  },

  // 👉 Xác thực email bằng token
verifyEmail: async (token: string) => {
  const res: AxiosResponse = await api.get(`/verify-email`, { params: { token } });
  return res.data;
},


// 👉 Login
login: async (data: LoginData) => {
  const res: AxiosResponse = await api.post("/login", data);

  if (res.data.token) {
    // Lưu token vào localStorage
    localStorage.setItem("token", res.data.token);

    // Đồng thời lưu token vào cookie để middleware đọc
    document.cookie = `admin_token=${res.data.token}; path=/; max-age=86400; secure; samesite=strict`;
  }

  return res.data;
},

// 👉 Logout
logout: async () => {
  const res: AxiosResponse = await api.post("/logout");

  // Xóa localStorage
  localStorage.removeItem("token");

  // Xóa cookie admin_token
  document.cookie = "admin_token=; path=/; max-age=0";

  return res.data;
},


  // 👉 Lấy thông tin user
  me: async () => {
    const res: AxiosResponse = await api.get("/me");
    return res.data;
  },

  // 👉 Gửi OTP quên mật khẩu
  forgotPassword: async (data: ForgotPasswordData) => {
    const res: AxiosResponse = await api.post("/forgot-password", data);
    return res.data;
  },

  // 👉 Reset mật khẩu
  resetPassword: async (data: ResetPasswordData) => {
    const res: AxiosResponse = await api.post("/reset-password", data);
    return res.data;
  },

  // 👉 Xác thực email trực tiếp (dùng backend test)
  verifyEmailDirect: async (email: string) => {
    const res: AxiosResponse = await api.post("/verify-email-direct", { email });
    return res.data;
  },
  // 👉 Đổi mật khẩu (đã đăng nhập)
changePassword: async (data: ChangePasswordData) => {
  const res: AxiosResponse = await api.post("/change-password", data);
  return res.data;
},
};

export default AuthService;
