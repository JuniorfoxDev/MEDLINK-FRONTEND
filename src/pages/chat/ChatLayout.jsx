import React, { useEffect, useState } from "react";
import Sidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import socket from "../../socket";
import api from "../../api/axiosInstance";
import FloatingDashboardButton from "../../components/FloatingDashboardButton";

export default function ChatLayout() {
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);

  // mobile: show sidebar or not
  const [showSidebar, setShowSidebar] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const myId = user?._id || user?.id;

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

  // SOCKET SETUP
  useEffect(() => {
    if (!myId) return;

    if (!socket.connected) socket.connect();

    socket.emit("registerUser", myId);

    // Listen to new message
    const handleIncoming = ({ conversationId, message }) => {
      setConversations((prev) => {
        let updated = prev.map((c) =>
          c._id === conversationId
            ? { ...c, lastMessage: message, updatedAt: message.createdAt }
            : c
        );

        updated = updated.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        return updated;
      });

      if (activeConvo?._id === conversationId) {
        setActiveConvo((prev) =>
          prev ? { ...prev, lastMessage: message } : prev
        );
      }
    };

    socket.on("newMessage", handleIncoming);

    return () => socket.off("newMessage", handleIncoming);
  }, [myId, activeConvo]);

  // MOBILE AUTO-HIDE SIDEBAR WHEN CHAT SELECTED
  useEffect(() => {
    if (window.innerWidth < 768 && activeConvo) {
      setShowSidebar(false);
    }
  }, [activeConvo]);

  return (
    <div className="h-screen flex bg-neutral-900 text-white overflow-hidden">
      {/* SIDEBAR */}
      <div
        className={`${
          showSidebar ? "block" : "hidden"
        } md:block w-full md:w-80`}
      >
        <Sidebar
          conversations={conversations}
          setConversations={setConversations}
          setActiveConvo={setActiveConvo}
          activeConvo={activeConvo}
          closeSidebar={() => setShowSidebar(false)}
        />
      </div>

      {/* CHAT WINDOW */}
      <div className={`${showSidebar ? "hidden md:flex" : "flex"} flex-1`}>
        <ChatWindow
          activeConvo={activeConvo}
          goBack={() => setShowSidebar(true)}
          setConversations={setConversations}
        />
      </div>

      <FloatingDashboardButton />
    </div>
  );
}
