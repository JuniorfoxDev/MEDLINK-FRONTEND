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

  const [showSidebar, setShowSidebar] = useState(true);

  // Load all conversations
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

  // Restore last conversation
  useEffect(() => {
    const saved = localStorage.getItem("activeConversation");
    if (saved) {
      setActiveConvo(JSON.parse(saved));
      localStorage.removeItem("activeConversation");
    }
  }, []);

  // Apply chatId from URL
  useEffect(() => {
    if (!chatId || !conversations.length) return;

    const match = conversations.find((c) => c._id === chatId);
    if (match) setActiveConvo(match);
  }, [chatId, conversations]);

  // REALTIME MESSAGES
  useEffect(() => {
    const handleIncoming = (data) => {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === data.conversationId
            ? { ...c, lastMessage: data.message }
            : c
        )
      );

      if (activeConvo?._id === data.conversationId) {
        setActiveConvo((prev) =>
          prev ? { ...prev, lastMessage: data.message } : prev
        );
      }
    };

    socket.on("newMessage", handleIncoming);
    return () => socket.off("newMessage", handleIncoming);
  }, [activeConvo]);

  // MOBILE auto hide sidebar
  useEffect(() => {
    if (window.innerWidth < 768 && activeConvo) {
      setShowSidebar(false);
    }
  }, [activeConvo]);

  return (
    <div className="flex h-screen bg-neutral-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? "block" : "hidden"
        } md:block w-full md:w-80`}
      >
        <ChatSidebar
          conversations={conversations}
          setConversations={setConversations}
          setActiveConvo={setActiveConvo}
          activeConvo={activeConvo}
          closeSidebar={() => setShowSidebar(false)}
        />
      </div>

      <div className={`${showSidebar ? "hidden md:flex" : "flex"} flex-1`}>
        {loading ? (
          <div className="flex h-full items-center justify-center text-neutral-400">
            Loading your chats...
          </div>
        ) : activeConvo ? (
          <ChatWindow
            activeConvo={activeConvo}
            goBack={() => setShowSidebar(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>

      <FloatingDashboardButton />
    </div>
  );
};

export default ChatPage;
