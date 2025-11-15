import React, { useEffect, useRef, useState } from "react";
import api from "../../api/axiosInstance";
import socket from "../../socket";
import { Send, ArrowLeft, Home } from "lucide-react";

export default function ChatWindow({ activeConvo, goBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const myId = user?._id || user?.id;

  if (!myId) return null;

  // Extract other user
  const other =
    activeConvo?.participants?.find((p) => (p._id || p.id) !== myId) || null;

  // Load messages + socket join
  useEffect(() => {
    if (!activeConvo?._id) return;

    const load = async () => {
      try {
        const res = await api.get(`/chat/messages/${activeConvo._id}`);
        if (res.data.success) setMessages(res.data.messages);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    load();
    socket.emit("joinConversation", activeConvo._id);

    const handleIncoming = (data) => {
      if (data.conversationId === activeConvo._id) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    socket.on("newMessage", handleIncoming);
    return () => {
      socket.emit("leaveConversation", activeConvo._id);
      socket.off("newMessage", handleIncoming);
    };
  }, [activeConvo]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!text.trim()) return;

    const tempMsg = {
      _id: Date.now().toString(),
      sender: { _id: myId },
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setText("");

    try {
      await api.post(`/chat/messages/${activeConvo._id}`, { text });
    } catch (err) {
      console.error("send failed", err);
    }
  };

  if (!activeConvo)
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-400">
        Select a conversation to start chatting
      </div>
    );

  return (
    <div className="flex flex-col h-full flex-1 bg-neutral-900">
      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 border-b border-neutral-700 bg-neutral-800/60 backdrop-blur">
        {/* MOBILE BACK BUTTON */}
        <button
          className="md:hidden p-2 text-gray-300 hover:text-white transition"
          onClick={goBack}
        >
          <ArrowLeft size={22} />
        </button>

        <img
          src={
            other?.profilePic ||
            `https://img.icons8.com/?size=200&id=HEBTcR9O3uzR&format=png`
          }
          alt={other?.name}
          className="w-10 h-10 rounded-full object-cover border-2"
        />

        <div>
          <div className="font-semibold text-xl text-white">{other?.name}</div>
          <div className="text-sm text-neutral-400">
            {(other?.role || "User").charAt(0).toUpperCase() +
              (other?.role || "User").slice(1)}
          </div>
        </div>

        {/* Home/Dashboard Button */}
        <a
          href="/dashboard"
          className="ml-auto p-2 bg-blue-600 hover:bg-blue-500 rounded-full transition text-white"
        >
          <Home size={20} />
        </a>
      </div>

      {/* MESSAGE AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => {
          const sid = m.sender?._id || m.sender?.id || m.sender;
          const isMine = String(sid) === String(myId);

          return (
            <div
              key={m._id}
              className={`w-full flex ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  isMine
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-neutral-800 text-gray-200 rounded-bl-none"
                }`}
              >
                {m.text}
                <div className="text-[10px] opacity-50 mt-1">
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT BOX */}
      <div className="p-3 border-t border-neutral-700 bg-neutral-900 flex items-center gap-3 sticky bottom-0">
        <input
          className="flex-1 bg-neutral-800 rounded-full px-4 py-2 outline-none text-white"
          placeholder="Message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          onClick={sendMessage}
          className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
