import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";

export default function ChatList({ onSelectChat }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      const res = await api.get("/chats");
      if (res.data.success) setChats(res.data.chats);
    };
    fetchChats();
  }, []);

  return (
    <div className="w-1/3 border-r p-4 overflow-y-auto">
      {chats.map((chat) => (
        <div
          key={chat._id}
          onClick={() => onSelectChat(chat)}
          className="p-3 flex items-center gap-3 hover:bg-gray-100 cursor-pointer rounded-md"
        >
          <img
            src={chat.participants[1]?.profilePic}
            alt="user"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">
              {chat.participants[1]?.name || "Unknown"}
            </p>
            <p className="text-xs text-gray-500">
              {chat.lastMessage?.text || "Start chatting..."}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
