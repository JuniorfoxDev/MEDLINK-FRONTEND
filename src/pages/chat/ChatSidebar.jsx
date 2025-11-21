import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import api from "../../api/axiosInstance";
import { Navigate, useNavigate } from "react-router-dom";

export default function ChatSidebar({
  conversations,
  setConversations,
  setActiveConvo,
  activeConvo,
  closeSidebar, // mobile only
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const myId = user?._id || user?.id;

  if (!myId) {
    return (
      <aside className="w-full  md:w-80 bg-neutral-800 border-r border-neutral-700 p-4 flex items-center justify-center text-neutral-400">
        Loading your chats...
      </aside>
    );
  }

  // Get other user from conversation
  const getOtherUser = (c) => {
    return c.participants?.find((p) => {
      const pid = p?._id || p?.id;
      return pid && pid !== myId;
    });
  };

  return (
    <aside
      className="
        fixed md:static 
        top-0 left-0 
        h-full 
        w-full md:w-80 
        bg-neutral-800 
        border-r border-neutral-700 
        p-4 flex flex-col 
        z-50
        md:translate-x-0 
        transition-transform duration-300
      "
    >
      {/* MOBILE HEADER WITH BACK BUTTON */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <button
          onClick={closeSidebar}
          className="p-2 text-neutral-300 hover:text-white transition"
        >
          <ArrowLeft size={22} />
        </button>
        <h3 className="text-lg font-semibold">Messages</h3>
        <div className="w-8" /> {/* Placeholder to center title */}
      </div>

      {/* DESKTOP HEADER */}
      <div className="hidden md:flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Messages</h3>
        <button
          className="text-sm text-blue-400 hover:text-blue-300 transition"
          onClick={() => navigate("/network")}
        >
          New
        </button>
      </div>

      {/* SEARCH BAR */}
      <input
        placeholder="Search people..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3 w-full bg-neutral-700 px-3 py-2 rounded text-sm outline-none placeholder-neutral-400"
      />

      {/* CONVERSATION LIST */}
      <div className="flex-1 overflow-y-auto space-y-2 custom-scroll">
        {conversations
          .filter((c) => {
            const u = getOtherUser(c);
            if (!u) return false;
            return u.name?.toLowerCase().includes(search.toLowerCase());
          })
          .map((c) => {
            const other = getOtherUser(c);
            if (!other) return null;

            return (
              <div
                key={c._id}
                onClick={() => {
                  setActiveConvo(c);
                  if (closeSidebar) closeSidebar(); // mobile: hide sidebar
                }}
                className={`
                  p-3 rounded cursor-pointer flex items-center gap-3 
                  transition-all
                  ${
                    activeConvo?._id === c._id
                      ? "bg-neutral-700 shadow-md"
                      : "hover:bg-neutral-700/50"
                  }
                `}
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
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
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

      <div className="mt-3 text-xs text-neutral-500 text-center">
        Tip: Tap “New” to start a conversation.
      </div>
    </aside>
  );
}
