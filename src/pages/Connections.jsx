import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function Network() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [myConnections, setMyConnections] = useState([]);

  useEffect(() => {
    loadNetwork();
  }, []);

  const loadNetwork = async () => {
    try {
      setLoading(true);
      const [all, mine] = await Promise.all([
        api.get("/users"), // get all users
        api.get("/users/connections"), // get my connections
      ]);
      setUsers(all.data.users || []);
      setMyConnections(mine.data.connections || []);
    } catch (err) {
      console.error("Load network failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (id) => {
    try {
      setConnecting(true);
      const res = await api.post(`/users/${id}/connect`);
      toast.success(res.data.message || "Connected successfully!");
      loadNetwork();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to connect");
    } finally {
      setConnecting(false);
    }
  };

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

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      (u.specialization || "").toLowerCase().includes(search.toLowerCase())
  );

  const isConnected = (id) => myConnections.some((c) => c._id === id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col">
      <Toaster position="top-right" />
      <Navbar />
      <div className="flex flex-1 max-w-7xl mx-auto w-full mt-24 px-4 lg:px-6 gap-4">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <motion.div
          className="flex-1 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/40 overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <Briefcase className="text-blue-600" /> Network
            </h1>

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

          {/* Loading */}
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
                  className="p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-100 hover:shadow-lg transition-all"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        user.profilePic
                          ? `http://localhost:5000${user.profilePic}`
                          : `https://ui-avatars.com/api/?name=${user.name}`
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

                  <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                    {user.bio || "No bio available"}
                  </p>

                  <div className="flex items-center justify-between mt-4">
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

                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition">
                      <MessageSquare size={16} /> Message
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
