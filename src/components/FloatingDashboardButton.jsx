import React from "react";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FloatingDashboardButton() {
  const navigate = useNavigate();
  return (
    <motion.button
      initial={{ scale: 0.9 }}
      animate={{ scale: [1, 1.06, 1], opacity: 1 }}
      transition={{ duration: 1.6, repeat: Infinity }}
      onClick={() => navigate("/dashboard")}
      className="fixed right-5 top-5 z-50 p-3 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 shadow-2xl text-white"
      aria-label="Go to dashboard"
    >
      <Home />
    </motion.button>
  );
}
