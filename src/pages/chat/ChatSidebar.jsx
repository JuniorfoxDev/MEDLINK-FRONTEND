import React, { useState } from "react";
import api from "../../api/axiosInstance";

export default function Sidebar({
  conversations,
  setConversations,
  setActiveConvo,
  activeConvo,
}) {
  const [search, setSearch] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const myId = user?._id || user?.id; // safest possible

  // 🛑 If user not loaded, show fallback
  if (!myId) {
    return (
      <aside className="w-80 bg-neutral-800 border-r border-neutral-700 p-4 flex items-center justify-center text-neutral-400">
        Loading your chats...
      </aside>
    );
  }

  // ⭐ SAFE helper to get "other user"
  const getOtherUser = (c) => {
    if (!c?.participants) return null;

    return c.participants.find((p) => {
      const pid = p?._id || p?.id;
      return pid && pid !== myId;
    });
  };

  return (
    <aside className="w-80 bg-neutral-800 border-r border-neutral-700 p-4 flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Messages</h3>
        <button
          type="button"
          className="text-sm text-blue-400"
          onClick={() => console.log("open new message UI")}
        >
          New
        </button>
      </div>

      {/* 🔍 Search bar */}
      <input
        placeholder="Search people..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3 w-full bg-neutral-700 px-3 py-2 rounded text-sm outline-none"
      />

      {/* 🧩 Conversation List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {conversations
          .filter((c) => {
            const other = getOtherUser(c);
            if (!other) return false;

            return other.name?.toLowerCase().includes(search.toLowerCase());
          })
          .map((c) => {
            const other = getOtherUser(c);
            if (!other) return null;

            return (
              <div
                key={c._id}
                className={`p-3 rounded cursor-pointer flex items-center gap-3 ${
                  activeConvo?._id === c._id
                    ? "bg-neutral-700"
                    : "hover:bg-neutral-700/50"
                }`}
                onClick={() => setActiveConvo(c)}
              >
                <img
                  src={
                    other.profilePic ||
                    `https://img.icons8.com/?size=200&id=HEBTcR9O3uzR&format=png`
                  }
                  alt={other.name}
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div className="flex-1">
                  <div className="flex justify-between">
                    <div className="font-medium text-white">{other.name}</div>

                    <div className="text-xs text-neutral-400">
                      {c.lastMessage
                        ? new Date(c.lastMessage.createdAt).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )
                        : ""}
                    </div>
                  </div>

                  <div className="text-xs text-neutral-400 truncate">
                    {c.lastMessage?.text || "No messages yet"}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <div className="mt-3 text-xs text-neutral-500">
        Tip: click "New" to start a conversation.
      </div>
    </aside>
  );
}
