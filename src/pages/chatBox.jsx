import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");

export default function ChatBox({ selectedChat }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      const res = await api.get(`/messages/${selectedChat._id}`);
      if (res.data.success) setMessages(res.data.messages);
    };
    fetchMessages();

    socket.emit("joinChat", selectedChat._id);
    socket.on("newMessage", (msg) => {
      if (msg.chat === selectedChat._id)
        setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("newMessage");
  }, [selectedChat]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const res = await api.post("/messages", {
      chatId: selectedChat._id,
      text,
    });
    if (res.data.success) setText("");
  };

  if (!selectedChat)
    return <div className="w-2/3 flex items-center justify-center text-gray-500">Select a chat to start</div>;

  return (
    <div className="w-2/3 flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m._id}
            className={`my-2 flex ${
              m.sender._id === selectedChat.participants[0]?._id
                ? "justify-start"
                : "justify-end"
            }`}
          >
            <div className="bg-blue-500 text-white px-3 py-2 rounded-lg max-w-xs">
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t p-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-full"
        >
          Send
        </button>
      </div>
    </div>
  );
}
