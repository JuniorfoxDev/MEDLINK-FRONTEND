import React, { useEffect, useState } from "react";
import Sidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import socket from "../../socket";
import api from "../../api/axiosInstance";
import FloatingDashboardButton from "../../components/FloatingDashboardButton"
export default function ChatLayout() {
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const myId = user?._id || user?.id;

  // 🧠 Load conversations initially
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/chat/conversations");
        if (res.data.success) {
          setConversations(res.data.conversations || []);
        }
      } catch (err) {
        console.error("❌ Failed to load conversations", err);
      }
    };

    load();
  }, []);

  // 🔥 SOCKET SETUP
  useEffect(() => {
    if (!myId) return;

    if (!socket.connected) socket.connect();

    // Register user to socket rooms
    socket.emit("registerUser", myId);

    // LISTEN: New message received
    const handleIncoming = ({ conversationId, message }) => {
      setConversations((prev) => {
        let updated = prev.map((c) =>
          c._id === conversationId
            ? { ...c, lastMessage: message, updatedAt: message.createdAt }
            : c
        );

        // sort by last activity
        updated = updated.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        return updated;
      });

      // Update active conversation preview instantly (UI feels instant)
      if (activeConvo?._id === conversationId) {
        setActiveConvo((prev) =>
          prev ? { ...prev, lastMessage: message } : prev
        );
      }
    };

    socket.on("newMessage", handleIncoming);

    return () => {
      socket.off("newMessage", handleIncoming);
    };
  }, [myId, activeConvo]);

  return (
    <div className="h-screen flex bg-neutral-900 text-white">
      <Sidebar
        conversations={conversations}
        setConversations={setConversations}
        setActiveConvo={setActiveConvo}
        activeConvo={activeConvo}
      />

      <ChatWindow
        activeConvo={activeConvo}
        setConversations={setConversations}
      />
      <FloatingDashboardButton/>
    </div>
  );
}
