import React, { useState } from "react";
import ChatList from "./chatList";
import ChatBox from "./chatBox";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="flex h-[85vh] bg-white rounded-2xl shadow-lg overflow-hidden">
      <ChatList onSelectChat={setSelectedChat} />
      <ChatBox selectedChat={selectedChat} />
    </div>
  );
}
