import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth, googleProvider, appleProvider } from "../Firebase";
import { signInWithPopup, getIdToken } from "firebase/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  // ✅ Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOverlayVisible(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );
      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed!");
    } finally {
      setLoading(false);
      setOverlayVisible(false);
    }
  };

  // ✅ Google Login
  const handleGoogleLogin = async () => {
    setOverlayVisible(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await getIdToken(result.user);
      const res = await axios.post(
        "http://localhost:5000/api/auth/firebase-login",
        {
          token,
          provider: "google",
        }
      );
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Google Login Failed!");
    } finally {
      setOverlayVisible(false);
    }
  };

  // ✅ Apple Login
  const handleAppleLogin = async () => {
    setOverlayVisible(true);
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const token = await getIdToken(result.user);
      const res = await axios.post(
        "http://localhost:5000/api/auth/firebase-login",
        {
          token,
          provider: "apple",
        }
      );
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Apple Login Failed!");
    } finally {
      setOverlayVisible(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#f6f7f9] via-[#eef2f5] to-[#dee4ea] overflow-hidden">
      {/* ✨ Animated Overlay (during login) */}
      <AnimatePresence>
        {overlayVisible && (
          <motion.div
            className="absolute inset-0 bg-white/40 backdrop-blur-md flex flex-col items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              className="text-blue-600"
            >
              <Loader2 size={48} className="animate-spin" />
            </motion.div>
            <motion.p
              className="mt-4 text-lg font-semibold text-blue-700 tracking-wide"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Logging you in...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🍎 Glass Login Card */}
      <motion.div
        className="backdrop-blur-xl bg-white/70 p-10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.1)] border border-white/40 w-[380px] max-w-[90%]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="bg-gradient-to-tr from-blue-500 to-blue-700 text-white text-3xl font-bold w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            M
          </motion.div>
          <h1 className="text-2xl font-bold mt-3 text-gray-800 tracking-tight">
            Welcome to <span className="text-blue-600">MedLink</span>
          </h1>
        </motion.div>

        {/* 🔹 SSO Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 bg-white/80 border border-gray-300 hover:bg-gray-50 transition py-3 rounded-full shadow-sm font-semibold text-gray-800 backdrop-blur-sm"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleAppleLogin}
            className="flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-900 transition py-3 rounded-full shadow-sm font-semibold"
          >
            <img
              src="https://www.svgrepo.com/show/511330/apple-173.svg"
              alt="Apple"
              className="w-5 h-5 invert"
            />
            Sign in with Apple
          </motion.button>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center text-gray-500 mb-4">
          <hr className="w-1/3 border-gray-300" />
          <span className="px-2 text-sm">or</span>
          <hr className="w-1/3 border-gray-300" />
        </div>

        {/* 🔐 Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white/80 backdrop-blur-sm transition-all"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-600">
              Password
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white/80 backdrop-blur-sm transition-all"
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] cursor-pointer text-gray-500 hover:text-gray-700 transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          {/* Login Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white tracking-wide transition-all shadow-md ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-lg"
            }`}
          >
            {loading ? "Signing in..." : "Login"}
          </motion.button>
        </form>

        {/* 👇 Register Redirect */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-5 text-center text-gray-600 text-sm"
        >
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-blue-600 font-semibold hover:underline hover:text-blue-700 transition-all"
          >
            Register
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}
