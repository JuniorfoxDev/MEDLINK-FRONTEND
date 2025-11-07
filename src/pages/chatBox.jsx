import React, { useEffect, useState, useRef } from "react";
import api from "../api/axiosInstance";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
  transports: ["websocket"],
  reconnectionAttempts: 5,
});

export default function ChatBox({ selectedChat, reloadChats }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 🔁 Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 📩 Load messages
  useEffect(() => {
    if (!selectedChat?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chats/${selectedChat._id}/messages`);
        if (res.data.success) setMessages(res.data.messages);
      } catch (err) {
        console.error("❌ Fetch messages failed:", err);
      }
    };

    fetchMessages();
    socket.emit("joinChat", selectedChat._id);

    socket.on("newMessage", (msg) => {
      if (msg.chat === selectedChat._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("typing", ({ chatId, from }) => {
      if (chatId === selectedChat._id && from !== user._id) setIsTyping(true);
    });

    socket.on("stopTyping", ({ chatId }) => {
      if (chatId === selectedChat._id) setIsTyping(false);
    });

    socket.on("messageSeen", ({ chatId }) => {
      if (chatId === selectedChat._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender._id === user._id ? { ...m, seen: true } : m
          )
        );
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("messageSeen");
    };
  }, [selectedChat]);

  // 🧠 Typing handler
  const handleTyping = (e) => {
    setText(e.target.value);
    if (!typing) {
      setTyping(true);
      socket.emit("typing", { chatId: selectedChat._id, from: user._id });
    }

    const lastTypingTime = new Date().getTime();
    const timerLength = 2000;

    setTimeout(() => {
      const now = new Date().getTime();
      const diff = now - lastTypingTime;
      if (diff >= timerLength && typing) {
        socket.emit("stopTyping", { chatId: selectedChat._id });
        setTyping(false);
      }
    }, timerLength);
  };

  // 📨 Send message
  const sendMessage = async () => {
    if (!text.trim() || !selectedChat?._id) return;
    socket.emit("stopTyping", { chatId: selectedChat._id });

    try {
      const res = await api.post(`/chats/${selectedChat._id}/message`, {
        text,
      });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setText("");
        reloadChats && reloadChats();

        // notify receiver that message is seen immediately if active
        socket.emit("messageSeen", { chatId: selectedChat._id });
      }
    } catch (err) {
      console.error("❌ Send message failed:", err);
    }
  };

  if (!selectedChat)
    return (
      <div className="w-2/3 flex items-center justify-center text-gray-500">
        Select a chat to start conversation
      </div>
    );

  const otherUser =
    selectedChat.participants?.find((p) => p._id !== user?._id) || {};

  return (
    <div className="w-2/3 flex flex-col bg-white rounded-xl shadow border border-gray-100">
      {/* Chat Header */}
      <div className="p-3 border-b flex items-center gap-3">
        <img
          src={
            otherUser.profilePic
              ? otherUser.profilePic.startsWith("http")
                ? otherUser.profilePic
                : `${import.meta.env.VITE_BACKEND_URL}${otherUser.profilePic}`
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  otherUser.name || "User"
                )}`
          }
          className="w-10 h-10 rounded-full object-cover"
          alt="avatar"
        />
        <div>
          <p className="font-semibold text-gray-800">{otherUser.name}</p>
          <p className="text-xs text-gray-500 capitalize">
            {isTyping
              ? "Typing..."
              : selectedChat.status === "active"
              ? "Active Chat"
              : "Pending"}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 rounded-b-xl">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">
            No messages yet. Say hi 👋
          </p>
        ) : (
          messages.map((m) => {
            const isMe = m.sender?._id === user?._id;
            return (
              <div
                key={m._id}
                className={`my-2 flex ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-xs ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p>{m.text}</p>
                  <div className="text-[10px] mt-1 flex justify-between opacity-70">
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isMe && <span>{m.seen ? "✅ Seen" : "✓ Sent"}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 flex gap-2">
        <input
          value={text}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 outline-none"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
