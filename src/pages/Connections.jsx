import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  UserPlus,
  MessageSquare,
  MapPin,
  Briefcase,
  Check,
} from "lucide-react";
import Navbar from "../components/DashboardNavbar";
import Sidebar from "../components/DashboardSidebar";
import api from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import MobileFabMenu from "../components/MobileFab"
export default function Connections() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [myConnections, setMyConnections] = useState([]);
  const [myChats, setMyChats] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadNetwork();
  }, []);

  const loadNetwork = async () => {
    try {
      setLoading(true);
      const [all, mine, chats] = await Promise.all([
        api.get("/users"),
        api.get("/users/connections"),
        api.get("/chat/conversations"), // ✅ FIXED route
      ]);
      setUsers(all.data.users || []);
      setMyConnections(mine.data.connections || []);
      setMyChats(chats.data.conversations || []); // ✅ backend returns "conversations"
    } catch (err) {
      console.error("Load network failed:", err);
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Connect with a user
  const handleConnect = async (id) => {
    try {
      setConnecting(true);
      const res = await api.post(`/users/connect/${id}`);
      if (res.data.success) {
        toast.success("✅ Connection request sent");
        loadNetwork();
      } else {
        toast.error(res.data.message || "Connection failed");
      }
    } catch (err) {
      console.error("❌ Connect error:", err);
      toast.error("Failed to connect");
    } finally {
      setConnecting(false);
    }
  };

  // ✅ Remove a connection
  const handleUnconnect = async (id) => {
    try {
      setConnecting(true);
      const res = await api.post(`/users/${id}/unconnect`);
      toast.success(res.data.message || "Connection removed");
      loadNetwork();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove");
    } finally {
      setConnecting(false);
    }
  };
  // ✅ Message a user (create or open chat)
  const handleMessage = async (userId) => {
    try {
      const res = await api.post("/chat/conversations", {
        otherUserId: userId,
      });

      if (res.data.success && res.data.conversation) {
        const convo = res.data.conversation;
        // store conversation temporarily
        localStorage.setItem("activeConversation", JSON.stringify(convo));
        // navigate to correct chat page
        navigate(`/chat?chat=${convo._id}`);
      } else {
        toast.error(res.data.message || "Failed to start chat");
      }
    } catch (err) {
      console.error("Error starting chat:", err);
      toast.error("Couldn't start chat");
    }
  };

  // ✅ Filter by search
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      (u.specialization || "").toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Check if user is already connected
  const isConnected = (id) => myConnections.some((c) => c._id === id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col">
      <Toaster position="top-right" />
      <Navbar />
      <div className="flex flex-1 max-w-7xl mx-auto w-full mt-24 px-4 lg:px-6 gap-4">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* ====== MAIN CONTENT ====== */}
        <motion.div
          className="flex-1 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/40 overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <Briefcase className="text-blue-600" /> Connections
            </h1>

            {/* Search Bar */}
            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-full border w-full md:w-72">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, role, specialization..."
                className="bg-transparent outline-none ml-2 text-sm w-full"
              />
            </div>
          </div>

          {/* ====== LOADING STATE ====== */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <motion.div
                className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              ></motion.div>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              No users found in your network.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((user) => (
                <motion.div
                  key={user._id}
                  className="p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-100 hover:shadow-lg transition-all"
                  whileHover={{ y: -4 }}
                >
                  {/* Profile Info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        user.profilePic
                          ? `${import.meta.env.VITE_BACKEND_URL}${
                              user.profilePic
                            }`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.name
                            )}`
                      }
                      alt={user.name}
                      className="w-14 h-14 rounded-full object-cover shadow"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {user.name}
                      </h3>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.role}
                        {user.specialization ? ` • ${user.specialization}` : ""}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {user.location || "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                    {user.bio || "No bio available"}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4">
                    {/* Connect / Connected */}
                    <button
                      onClick={() =>
                        isConnected(user._id)
                          ? handleUnconnect(user._id)
                          : handleConnect(user._id)
                      }
                      disabled={connecting}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        isConnected(user._id)
                          ? "bg-green-100 text-green-600 hover:bg-green-200"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isConnected(user._id) ? (
                        <>
                          <Check size={16} /> Connected
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} /> Connect
                        </>
                      )}
                    </button>

                    {/* Message button */}
                    {/* Message button */}
                    <button
                      onClick={() => handleMessage(user._id)}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition"
                    >
                      <MessageSquare size={16} /> Message
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    <MobileFabMenu />
    </div>
  );
}
