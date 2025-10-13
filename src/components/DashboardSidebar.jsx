import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  Briefcase,
  MessageCircle,
  Settings,
  PenSquare,
  Search,
  HeartHandshake,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { id: 1, icon: Home, label: "Home", path: "/dashboard" },
  { id: 2, icon: Users, label: "Network", path: "/network" },
  { id: 3, icon: Briefcase, label: "Jobs", path: "/jobs" },
  {
    id: 4,
    icon: MessageCircle,
    label: "Messages",
    path: "/messages",
    badge: 2,
  },
  { id: 5, icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 🧭 Determine active route based on current URL
  const activePath = location.pathname;

  // 📏 Auto collapse on scroll
  useEffect(() => {
    const handleScroll = () => setCollapsed(window.scrollY > 120);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🌈 Smooth slide animation on sidebar load
  return (
    <motion.aside
      initial={{ opacity: 0, x: -25 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={`hidden md:flex flex-col bg-white rounded-2xl shadow-md border border-gray-100 sticky top-24 h-fit overflow-hidden transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        {!collapsed && (
          <h2 className="font-bold text-lg text-blue-600 tracking-tight">
            Dashboard
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-blue-500 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-5 h-5 transition-transform duration-300 ${
              collapsed ? "" : "rotate-180"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.path;

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.path)} // 🧭 Redirect on click
              className={`relative flex items-center gap-3 rounded-lg cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-blue-50"
              } ${collapsed ? "justify-center py-3" : "px-4 py-2"}`}
            >
              <Icon size={20} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {item.badge && !collapsed && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-400 rounded-r-md"
                />
              )}
            </motion.div>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mt-4 border-t border-gray-100 pt-4 px-4 pb-3 space-y-2"
          >
            <button
              onClick={() => navigate("/create-post")}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
            >
              <PenSquare size={16} /> Create Post
            </button>
            <button
              onClick={() => navigate("/find-doctors")}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition"
            >
              <Search size={16} /> Find Doctor
            </button>
            <button
              onClick={() => navigate("/discussions")}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
            >
              <HeartHandshake size={16} /> Join Discussion
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Quote */}
      {!collapsed && (
        <div className="text-xs text-center text-gray-400 mt-4 pb-4 border-t border-gray-100 pt-3 italic">
          “Connect. Collaborate. Cure. 🌍”
        </div>
      )}
    </motion.aside>
  );
}
