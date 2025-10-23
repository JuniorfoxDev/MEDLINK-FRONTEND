import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  User,
  LogOut,
  UserCircle2,
  Users2,
  Check,
  X,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axiosInstance";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutAnim, setLogoutAnim] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  // ✅ Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data.success) setUser(res.data.user);
      } catch {
        console.error("Failed to fetch user");
      }
    };
    fetchUser();
  }, []);

  // ✅ Fetch notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get("/notifications");
        if (res.data.success) setNotifications(res.data.notifications);
      } catch (err) {
        console.error("Error loading notifications");
      }
    };
    fetchNotifs();

    // ✅ Realtime socket.io connection
    const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ["websocket", "polling"],
});

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser?._id) socket.emit("registerUser", currentUser._id);

    socket.on("notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
      toast.info(data.message);
    });

    return () => socket.disconnect();
  }, []);

  // ✅ Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🎬 Logout
  const handleLogout = () => {
    setLogoutAnim(true);
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }, 1600);
  };

  // ✅ Handle Notification Actions
  const handleAction = async (id, action) => {
    try {
      const res = await api.post(`/notifications/${action}/${id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, status: action } : n))
        );
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <>
      {/* 🔷 NAVBAR */}
      <nav className="bg-white/60 backdrop-blur-lg shadow-md fixed top-0 left-0 right-0 z-50 border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.h1
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-2xl font-bold text-blue-600 cursor-pointer select-none"
            onClick={() => navigate("/dashboard")}
          >
            MedLink
          </motion.h1>

          {/* Search + Icons */}
          <div className="flex items-center space-x-4 relative">
            {/* Search Input */}
            <div className="relative hidden sm:block">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white/70"
              />
            </div>

            {/* 🔔 Notification Bell */}
            <div className="relative" ref={notifRef}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative cursor-pointer"
                onClick={() => setNotifOpen((prev) => !prev)}
              >
                <Bell
                  className={`text-gray-600 hover:text-blue-600 transition-all duration-200 ${
                    notifOpen ? "text-blue-600" : ""
                  }`}
                />
                {notifications.some((n) => !n.isRead) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </motion.div>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute right-0 mt-3 bg-white shadow-xl rounded-xl w-80 z-50 border border-gray-200 overflow-hidden"
                  >
                    <div className="p-3 border-b bg-blue-50 font-semibold text-gray-700">
                      Notifications
                    </div>

                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-500 p-4 text-center">
                        No notifications yet
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className="p-3 border-b text-sm text-gray-700 hover:bg-gray-50 transition-all"
                        >
                          <div className="flex gap-2 items-start">
                            <img
                              src={
                                n.sender?.profilePic || "/default-avatar.png"
                              }
                              className="w-8 h-8 rounded-full"
                              alt=""
                            />
                            <div>
                              <p className="font-medium text-gray-800">
                                {n.message}
                              </p>
                              <span className="text-xs text-gray-400">
                                {new Date(n.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Connection Request Actions */}
                          {n.type === "connection_request" &&
                            n.status === "pending" && (
                              <div className="flex gap-2 mt-2 justify-end">
                                <button
                                  onClick={() => handleAction(n._id, "accept")}
                                  className="px-2 py-1 bg-green-500 text-white rounded flex items-center gap-1 text-xs"
                                >
                                  <Check size={12} /> Accept
                                </button>
                                <button
                                  onClick={() => handleAction(n._id, "reject")}
                                  className="px-2 py-1 bg-red-500 text-white rounded flex items-center gap-1 text-xs"
                                >
                                  <X size={12} /> Remove
                                </button>
                                <button
                                  onClick={() => handleAction(n._id, "maybe")}
                                  className="px-2 py-1 bg-gray-300 text-gray-700 rounded flex items-center gap-1 text-xs"
                                >
                                  <Clock size={12} /> Later
                                </button>
                              </div>
                            )}
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 👤 User Menu */}
            <div className="relative" ref={menuRef}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                whileHover={{ rotate: 8 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <User
                  className="text-gray-600 cursor-pointer hover:text-blue-600 transition-all duration-200"
                  onClick={() => setMenuOpen((prev) => !prev)}
                />
              </motion.div>

              {/* Dropdown */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="absolute right-0 mt-2 w-56 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    {/* Profile */}
                    <motion.button
                      onClick={() => {
                        navigate("/profile");
                        setMenuOpen(false);
                      }}
                      whileHover={{
                        scale: 1.02,
                        background: "linear-gradient(90deg, #4facfe, #00f2fe)",
                        color: "#fff",
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700"
                    >
                      <UserCircle2 size={16} /> View Profile
                    </motion.button>

                    {/* Doctor-only */}
                    {user?.role === "doctor" && (
                      <>
                        <div className="h-[1px] bg-gray-200 w-full"></div>
                        <motion.button
                          onClick={() => {
                            navigate("/my-applicants");
                            setMenuOpen(false);
                          }}
                          whileHover={{
                            scale: 1.02,
                            background:
                              "linear-gradient(90deg, #0072ff, #00c6ff, #00f2fe)",
                            color: "#fff",
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700"
                        >
                          <Users2 size={16} /> My Applicants
                        </motion.button>
                      </>
                    )}

                    {/* Divider */}
                    <div className="h-[1px] bg-gray-200 w-full"></div>

                    {/* Logout */}
                    <motion.button
                      onClick={handleLogout}
                      whileHover={{
                        scale: 1.05,
                        background:
                          "linear-gradient(90deg, #0072ff, #00c6ff, #00f2fe)",
                        color: "#fff",
                        boxShadow:
                          "0 4px 20px rgba(0, 150, 255, 0.4), 0 0 15px rgba(0, 200, 255, 0.3)",
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-gray-700"
                    >
                      <LogOut size={16} /> Logout
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* 🎬 Logout Animation */}
      <AnimatePresence>
        {logoutAnim && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-[9998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-[9999]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              <motion.div
                className="text-white text-3xl font-bold tracking-wide"
                animate={{ scale: [1, 1.05, 1], opacity: [1, 0.8, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                Logging you out...
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
