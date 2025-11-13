import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ChatSidebar from "../chat/ChatSidebar";
import ChatWindow from "../chat/ChatWindow";
import api from "../../api/axiosInstance";
import socket from "../../socket";
import FloatingDashboardButton from "../../components/FloatingDashboardButton";
const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("chat");

  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧠 Load all conversations once
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await api.get("/chat/conversations");
        if (res.data.success) {
          setConversations(res.data.conversations);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  // 🟦 Restore last opened chat
  useEffect(() => {
    const saved = localStorage.getItem("activeConversation");
    if (saved) {
      setActiveConvo(JSON.parse(saved));
      localStorage.removeItem("activeConversation");
    }
  }, []);

  // 🟦 If chatId param arrives externally (from Connections → Message button)
  useEffect(() => {
    if (!chatId || !conversations.length) return;

    const match = conversations.find((c) => c._id === chatId);
    if (match) {
      setActiveConvo(match);
    }
  }, [chatId, conversations]);

  // 🔥 REAL-TIME conversation updates (IMPORTANT FIX)
  useEffect(() => {
    const handleIncoming = (data) => {
      // update conversation list with last message
      setConversations((prev) =>
        prev.map((c) =>
          c._id === data.conversationId
            ? { ...c, lastMessage: data.message }
            : c
        )
      );

      // if currently open chat, update lastMessage
      if (activeConvo?._id === data.conversationId) {
        setActiveConvo((prev) =>
          prev ? { ...prev, lastMessage: data.message } : prev
        );
      }
    };

    socket.on("newMessage", handleIncoming);

    return () => socket.off("newMessage", handleIncoming);
  }, [activeConvo]);

  // UI Rendering
  return (
    <div className="flex h-screen bg-neutral-900 text-white">
      <ChatSidebar
        conversations={conversations}
        setConversations={setConversations}
        setActiveConvo={setActiveConvo}
        activeConvo={activeConvo}
      />

      <div className="flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center text-neutral-400">
            Loading your chats...
          </div>
        ) : activeConvo ? (
          <ChatWindow activeConvo={activeConvo} />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>
      <FloatingDashboardButton/>
    </div>
  );
};

export default ChatPage;
