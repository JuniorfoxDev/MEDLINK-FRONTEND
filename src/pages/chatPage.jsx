import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/DashboardNavbar";
import LeftPanel from "../components/DashboardSidebar";
import RightPanel from "../components/RightPanelDashboard";
import ChatList from "../pages/chatList";
import ChatBox from "../pages/chatBox";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    // ✅ Initialize socket
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // 🧠 Register user on socket
    socket.on("connect", () => {
      socket.emit("registerUser", user._id);
      console.log("🟢 Connected to socket:", socket.id);
    });

    // 📨 When new message request arrives
    socket.on("newMessageRequest", (payload) => {
      toast(`💌 New message request from ${payload.message.sender?.name}`);
      loadChats();
    });

    // ✅ When your request is accepted
    socket.on("messageRequestAccepted", () => {
      toast.success("✅ Your message request was accepted");
      loadChats();
    });

    // 💬 When a new message comes in real-time
    socket.on("newMessage", (msg) => {
      if (selectedChat && msg.chat?.toString() === selectedChat._id.toString()) {
        setSelectedChat((prev) => ({
          ...prev,
          messages: [...(prev.messages || []), msg],
        }));
      }
      loadChats();
    });

    loadChats();

    return () => socket.disconnect();
  }, []);

  // ✅ Fetch all chats (pending + active)
  const loadChats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/chats");
      setChats(res.data.chats || []);
    } catch (err) {
      console.error("❌ Failed to load chats:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Select chat from list
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    if (socketRef.current) socketRef.current.emit("joinChat", chat._id);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Navbar />

      <div className="flex justify-center mt-4 gap-6 px-4">
        {/* Left Panel */}
        <div className="hidden lg:block w-1/4">
          <LeftPanel />
        </div>

        {/* Chat Section */}
        <div className="w-full lg:w-1/2 bg-white shadow rounded-2xl p-4">
          <div className="flex h-[80vh]">
            <ChatList
              chats={chats}
              loading={loading}
              onSelectChat={handleSelectChat}
              selectedChat={selectedChat}
              reloadChats={loadChats}
            />
            <ChatBox
              selectedChat={selectedChat}
              socket={socketRef.current}
              reloadChats={loadChats}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden lg:block w-1/4">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
