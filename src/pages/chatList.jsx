import React from "react";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

export default function ChatList({
  chats = [],
  loading = false,
  selectedChat,
  onSelectChat,
  reloadChats,
}) {
  const handleAccept = async (chatId) => {
    try {
      await api.post(`/chats/${chatId}/accept`);
      toast.success("Message request accepted ✅");
      reloadChats(); // reload the chat list
    } catch (err) {
      toast.error("Failed to accept request");
    }
  };

  const handleIgnore = async (chatId) => {
    try {
      await api.post(`/chats/${chatId}/ignore`);
      toast.success("Message request ignored 🚫");
      reloadChats();
    } catch (err) {
      toast.error("Failed to ignore request");
    }
  };

  if (loading) {
    return <p className="text-gray-500 text-sm p-4">Loading chats...</p>;
  }

  if (chats.length === 0) {
    return (
      <div className="w-1/3 border-r pr-3 flex items-center justify-center text-gray-500 text-sm">
        No conversations yet.
      </div>
    );
  }

  const me = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="w-1/3 border-r pr-3 overflow-y-auto">
      <h2 className="font-semibold text-lg mb-3">Your Conversations</h2>

      {chats.map((chat) => {
        const friend = chat.participants.find((p) => p._id !== me._id);

        return (
          <div
            key={chat._id}
            onClick={() => onSelectChat(chat)}
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition ${
              selectedChat?._id === chat._id
                ? "bg-gray-100"
                : chat.status === "pending"
                ? "bg-yellow-50 hover:bg-yellow-100"
                : "hover:bg-gray-100"
            }`}
          >
            {/* Profile Info */}
            <div className="flex items-center gap-3 flex-1">
              <img
                src={
                  friend?.profilePic
                    ? `${import.meta.env.VITE_BACKEND_URL}${friend.profilePic}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        friend?.name || "User"
                      )}`
                }
                alt={friend?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <p className="font-medium text-gray-800">{friend?.name}</p>
                <p className="text-xs text-gray-500">
                  {chat.lastMessage?.text
                    ? chat.lastMessage.text.slice(0, 35)
                    : chat.status === "pending"
                    ? "Message Request"
                    : "Start a conversation"}
                </p>
              </div>
            </div>

            {/* Request Actions */}
            {chat.status === "pending" ? (
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAccept(chat._id);
                  }}
                  className="bg-green-500 text-white text-xs px-2 py-1 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIgnore(chat._id);
                  }}
                  className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  Ignore
                </button>
              </div>
            ) : (
              <span
                className={`text-xs px-2 py-1 rounded ${
                  chat.status === "active"
                    ? "bg-green-100 text-green-700"
                    : chat.status === "ignored"
                    ? "bg-gray-100 text-gray-500"
                    : ""
                }`}
              >
                {chat.status === "active"
                  ? "Active"
                  : chat.status === "ignored"
                  ? "Ignored"
                  : ""}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
