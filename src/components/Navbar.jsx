import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, LogIn, UserPlus, Bell, Check, X, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import api from "../api/axiosInstance"; // ✅ your axios instance
import { toast } from "react-toastify";

const Navbar = () => {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-600 font-semibold"
      : "text-gray-700 hover:text-blue-600";

  // ✅ Fetch + socket setup
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        if (res.data.success) setNotifications(res.data.notifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();

    const socket = io("http://localhost:5000");
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?._id) socket.emit("registerUser", user._id);

    socket.on("notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
      toast.info(data.message);
    });

    return () => socket.disconnect();
  }, []);

  // ✅ Handle Notification Actions
  const handleAction = async (id, action) => {
    try {
      const res = await api.post(`/notifications/${action}/${id}`);
      if (res.data.success) {
        toast.success(res.data.message);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === id ? { ...n, status: action } : n
          )
        );
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  // ✅ Count unread notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between h-16">
        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2 text-gray-800 font-bold text-xl tracking-tight"
        >
          <motion.div
            whileHover={{ rotate: 15 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-2 rounded-xl bg-blue-600 text-white"
          >
            <Stethoscope size={18} />
          </motion.div>
          <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
            MediLink
          </span>
        </NavLink>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={isActive("/")}>
            Home
          </NavLink>
          <NavLink to="/about" className={isActive("/about")}>
            About
          </NavLink>
          <NavLink to="/contact" className={isActive("/contact")}>
            Contact
          </NavLink>
        </nav>

        {/* Right Section (Buttons + Notifications) */}
        <div className="flex gap-4 items-center relative">
          {/* 🔔 Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="relative p-2 hover:bg-gray-100 rounded-full"
            >
              <Bell className="text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* 🔽 Notification Dropdown */}
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-3 bg-white shadow-2xl rounded-lg w-80 z-50 border border-gray-200"
              >
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 p-4 text-center">
                    No notifications yet
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className="p-3 border-b last:border-none text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={n.sender?.profilePic || "/default-avatar.png"}
                          className="w-8 h-8 rounded-full object-cover"
                          alt=""
                        />
                        <div>
                          <p className="font-medium">{n.message}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons for connection requests */}
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
          </div>

          {/* Register & Login Buttons */}
          <NavLink
            to="/register"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-sky-500 shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            <UserPlus size={16} /> Register
          </NavLink>

          <NavLink
            to="/login"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-gray-800 border border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <LogIn size={16} /> Login
          </NavLink>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden flex justify-center gap-8 py-2 bg-white/70 backdrop-blur-md border-t border-gray-200 shadow-sm text-sm">
        <NavLink to="/" className={isActive("/")}>
          Home
        </NavLink>
        <NavLink to="/about" className={isActive("/about")}>
          About
        </NavLink>
        <NavLink to="/contact" className={isActive("/contact")}>
          Contact
        </NavLink>
      </div>
    </header>
  );
};

export default Navbar;
