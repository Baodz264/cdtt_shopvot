"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FaEnvelope, FaArrowLeft, FaLock, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import { useToast } from "@/context/ToastProvider";
import AuthService from "@/services/AuthService";
import { useRouter } from "next/navigation";

// Định nghĩa kiểu dữ liệu cho lỗi API
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(new Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const router = useRouter();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, "");
    if (!value && element.value !== "") return;

    const newOtp = [...otpValues];
    newOtp[index] = value.substring(value.length - 1);
    setOtpValues(newOtp);

    if (value !== "" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    if (newOtp.every(v => v !== "") && index === 5) {
      void handleVerifyOTP(newOtp.join(""));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      setLoading(true);
      await AuthService.forgotPassword({ email: formData.email });
      toast.success("Mã OTP 6 số đã được gửi đến Email của bạn!");
      setStep(2);
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err.response?.data?.message || "Không thể gửi mã, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpFromAutoSubmit?: string) => {
    const finalOtp = otpFromAutoSubmit || otpValues.join("");

    if (finalOtp.length !== 6) {
      return toast.error("Vui lòng nhập đủ 6 chữ số");
    }

    try {
      setIsVerifying(true);
      // Giả lập delay
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      toast.success("Xác thực mã OTP thành công!");
      setStep(3);
    } catch (error: unknown) {
      toast.error("Mã OTP không chính xác, vui lòng kiểm tra lại");
      setOtpValues(new Array(6).fill(""));
      otpRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      return toast.error("Mật khẩu phải có ít nhất 6 ký tự");
    }
    if (formData.password !== formData.password_confirmation) {
      return toast.error("Mật khẩu xác nhận không khớp");
    }

    try {
      setLoading(true);
      await AuthService.resetPassword({
        email: formData.email,
        otp: otpValues.join(""),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });
      toast.success("Mật khẩu đã được thay đổi thành công!");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err.response?.data?.message || "Đã có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-white">
        
        <button 
          onClick={() => (step > 1 ? setStep(step - 1) : router.push('/auth/login'))}
          className="group flex items-center text-sm font-medium text-slate-400 hover:text-blue-600 mb-8 transition-all"
        >
          <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Quay lại
        </button>

        <div className="text-center mb-10">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 transition-all duration-500 shadow-lg ${
              step === 1 ? "bg-blue-600 text-white" : 
              step === 2 ? "bg-amber-500 text-white rotate-12" : "bg-emerald-500 text-white scale-110"
          }`}>
              {step === 1 && <FaEnvelope size={32} />}
              {step === 2 && <FaShieldAlt size={32} />}
              {step === 3 && <FaLock size={32} />}
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {step === 1 && "Quên mật khẩu?"}
              {step === 2 && "Xác thực OTP"}
              {step === 3 && "Mật khẩu mới"}
          </h2>
          <p className="text-slate-500 mt-3 text-sm leading-relaxed px-4">
              {step === 1 && "Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác thực cho bạn."}
              {step === 2 && <span>Mã xác thực đã được gửi tới <b className="text-slate-700">{formData.email}</b></span>}
              {step === 3 && "Hãy nhập mật khẩu mới để bảo vệ tài khoản."}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div className="relative group">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="email"
                required
                placeholder="Email của bạn"
                className="w-full border-2 border-slate-100 focus:border-blue-500 outline-none rounded-2xl px-12 py-4 transition-all bg-slate-50/50 focus:bg-white"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
            >
              {loading ? "Đang gửi mã..." : "Gửi mã xác thực"}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between gap-2 px-1">
              {otpValues.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  // FIX: Ref callback không được return giá trị
                  ref={(el) => { otpRefs.current[index] = el; }}
                  className={`w-12 h-16 border-2 rounded-2xl text-center text-2xl font-black outline-none transition-all 
                    ${data ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-inner' : 'border-slate-100 focus:border-blue-500'}`}
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  disabled={isVerifying}
                />
              ))}
            </div>
            
            <div className="space-y-4">
                <button 
                    onClick={() => void handleVerifyOTP()}
                    disabled={isVerifying || otpValues.some(v => v === "")}
                    className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                >
                    {isVerifying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Xác nhận OTP"}
                </button>
                <div className="text-center">
                    <button 
                        type="button" 
                        onClick={() => void handleSendOTP()} 
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        Tôi chưa nhận được mã? Gửi lại
                    </button>
                </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Mật khẩu mới"
                className="w-full border-2 border-slate-100 focus:border-blue-500 outline-none rounded-2xl px-12 py-4 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="relative">
              <FaCheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Xác nhận mật khẩu"
                className="w-full border-2 border-slate-100 focus:border-blue-500 outline-none rounded-2xl px-12 py-4 transition-all"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
              />
            </div>
            <button 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
            >
              {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}