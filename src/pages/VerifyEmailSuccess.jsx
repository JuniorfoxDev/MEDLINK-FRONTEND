import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, MailCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function VerifyEmailSuccess() {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/verify-email?token=${token}`
        );
        if (res.status === 200 || res.status === 302) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
          setTimeout(() => navigate("/login?verified=true"), 3000);
        } else {
          throw new Error("Invalid verification link");
        }
      } catch (err) {
        console.error("Verification Error:", err);
        setStatus("error");
        setMessage("Verification link is invalid or expired.");
      }
    };
    if (token) verifyEmail();
    else setStatus("error");
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 overflow-hidden relative">
      {/* Background glow */}
      <motion.div
        className="absolute top-10 left-10 w-96 h-96 bg-blue-300/40 blur-[120px] rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.15, 0.4] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-indigo-300/30 blur-[130px] rounded-full"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.15, 0.4] }}
        transition={{ duration: 9, repeat: Infinity }}
      />

      <AnimatePresence mode="wait">
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center"
          >
            <Loader2 className="animate-spin text-blue-600 mb-4" size={60} />
            <h2 className="text-xl font-semibold text-gray-700">
              Verifying your email...
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Please wait while we confirm your account.
            </p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              className="bg-green-100 rounded-full p-6 mb-4"
              initial={{ scale: 0.6 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <CheckCircle2 className="text-green-600" size={80} />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-800">
              Email Verified Successfully 🎉
            </h2>
            <p className="text-gray-600 mt-2">{message}</p>

            <motion.div
              className="flex items-center gap-2 mt-5 text-blue-700 font-medium"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ShieldCheck size={18} />
              Redirecting you to login...
            </motion.div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <MailCheck className="text-red-500 mb-4" size={60} />
            <h2 className="text-2xl font-bold text-gray-800">
              Verification Failed ❌
            </h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition-all"
            >
              Back to Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
