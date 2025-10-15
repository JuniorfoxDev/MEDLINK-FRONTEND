import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, CheckCircle2, Sparkles, Clock } from "lucide-react";
import api from "../api/axiosInstance";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

export default function RightPanel() {
  const [suggestions, setSuggestions] = useState([]);
  const [connected, setConnected] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);

  // ✅ Fetch logged-in user & suggestions
  useEffect(() => {
    const init = async () => {
      try {
        const resUser = await api.get("/auth/me");
        if (resUser.data.success) setUser(resUser.data.user);

        const res = await api.get("/auth/all-users");
        if (res.data.success) {
          // Exclude current user
          const allUsers = res.data.users.filter(
            (u) => u._id !== resUser.data.user._id
          );
          const shuffled = allUsers.sort(() => 0.5 - Math.random());
          setSuggestions(shuffled);
        } else {
          toast.error("Failed to fetch users");
        }
      } catch (err) {
        console.error("❌ Error fetching suggestions:", err);
        toast.error("Error loading suggestions");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ✅ Setup Socket.io
  // ✅ Setup Socket.io
  useEffect(() => {
    if (!user?._id) return;
    const s = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    s.emit("registerUser", user._id);
    setSocket(s);

    s.on("notification", (data) => {
      console.log("🔔 Notification received:", data);

      if (data.type === "connection_request") {
        toast.info(`${data.sender.name} sent you a connection request`);
        // 🔥 Optional: show real-time incoming requests without refresh
        setSuggestions((prev) =>
          prev.map((u) =>
            u._id === data.sender._id ? { ...u, requestReceived: true } : u
          )
        );
      } else if (data.type === "connection_accept") {
        toast.success(`${data.sender.name} accepted your request`);
        // ✅ Update connected instantly
        setConnected((prev) => [...prev, data.sender._id]);
        setPendingRequests((prev) =>
          prev.filter((id) => id !== data.sender._id)
        );
      } else if (data.type === "post_like") {
        toast(`${data.sender.name} liked your post ❤️`);
      } else if (data.type === "post_comment") {
        toast(`${data.sender.name} commented on your post 💬`);
      }
    });

    return () => s.disconnect();
  }, [user]);

  // ✅ Handle connection request
  const handleConnect = async (targetId) => {
    try {
      const res = await api.post(`/users/connect/${targetId}`);
      if (res.data.success) {
        toast.success("✅ Connection request sent");
        setPendingRequests((prev) => [...prev, targetId]);
      } else {
        toast.error(res.data.message || "Connection failed");
      }
    } catch (err) {
      console.error("❌ Connect failed:", err);
      toast.error("Error sending connection request");
    }
  };

  // ✅ Determine visible suggestions
  const visibleSuggestions = showAll ? suggestions : suggestions.slice(0, 3);

  if (loading) {
    return (
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden lg:flex flex-col w-72 bg-white rounded-2xl shadow-md p-5 h-fit sticky top-24 border border-gray-100"
      >
        <p className="text-gray-500 text-sm text-center animate-pulse">
          Loading suggestions...
        </p>
      </motion.aside>
    );
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="hidden lg:flex flex-col w-72 bg-white rounded-2xl shadow-md p-5 h-fit sticky top-24 border border-gray-100"
    >
      {/* 🧩 Header */}
      <motion.h2 className="font-semibold text-gray-800 mb-4 text-lg bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 bg-[length:200%_auto] text-transparent bg-clip-text animate-[shine_4s_linear_infinite]">
        Suggested Connections
      </motion.h2>

      <style>
        {`@keyframes shine {
          to { background-position: 200% center; }
        }`}
      </style>

      {/* 💡 User Suggestions */}
      <div className="space-y-3">
        {visibleSuggestions.map((u, i) => {
          const isConnected = connected.includes(u._id);
          const isPending = pendingRequests.includes(u._id);

          return (
            <motion.div
              key={u._id}
              className="flex items-center justify-between p-2 rounded-lg group hover:shadow-sm transition-all border border-transparent hover:border-gray-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  src={
                    u.profilePic ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      u.name
                    )}&background=0072ff&color=fff`
                  }
                  alt={u.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <p className="font-medium text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{u.role}</p>
                </div>
              </div>

              {/* ⚡ Connect Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleConnect(u._id)}
                disabled={isConnected || isPending}
                className={`relative flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-300 ${
                  isConnected
                    ? "bg-green-100 text-green-700 cursor-default"
                    : isPending
                    ? "bg-gray-300 text-gray-700 cursor-default"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                }`}
              >
                {isConnected ? (
                  <>
                    <CheckCircle2 size={14} /> Connected
                  </>
                ) : isPending ? (
                  <>
                    <Clock size={14} /> Pending
                  </>
                ) : (
                  <>
                    <UserPlus size={14} /> Connect
                  </>
                )}

                {/* 🎇 Sparkle Animation */}
                <AnimatePresence>
                  {isConnected && (
                    <motion.span
                      className="absolute inset-0 bg-green-300/40 rounded-md"
                      initial={{ scale: 0.3, opacity: 0.8 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* 🧭 Show More / Less */}
      <AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition flex items-center gap-1 justify-center"
          onClick={() => setShowAll(!showAll)}
        >
          <Sparkles size={14} />
          {showAll ? "Show Less" : "Show More"}
        </motion.button>
      </AnimatePresence>

      {/* ✨ Footer */}
      <div className="text-xs text-gray-400 text-center mt-4 border-t border-gray-100 pt-3 italic">
        “Expand your circle. Collaboration fuels innovation.”
      </div>
    </motion.aside>
  );
}
