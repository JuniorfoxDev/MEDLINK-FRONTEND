import React from "react";
import clsx from "clsx";

export default function MessageBubble({ message, currentUserId }) {
  // Normalize sender ID from any backend format
  const senderId =
    message?.sender?._id || message?.sender?.id || message?.sender || null;

  const isMine =
    String(senderId) === String(currentUserId) ||
    String(senderId) === String(JSON.parse(localStorage.getItem("user"))?.id);

  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className={clsx(
        "flex items-end gap-3 mb-2",
        isMine ? "justify-end" : "justify-start"
      )}
    >
      {/* Other user's profile pic */}
      {!isMine && (
        <img
          src={
            message.sender?.profilePic ||
            `https://img.icons8.com/?size=200&id=HEBTcR9O3uzR&format=png`
          }
          alt={message.sender?.name}
          className="w-8 h-8 rounded-full object-cover"
        />
      )}

      <div
        className={clsx(
          "max-w-[70%] break-words flex flex-col",
          isMine ? "items-end text-right" : "items-start text-left"
        )}
      >
        <div
          className={clsx(
            "px-4 py-2 rounded-2xl shadow-sm",
            isMine
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-neutral-700 text-neutral-100 rounded-bl-none"
          )}
        >
          <div className="whitespace-pre-wrap">{message.text}</div>
        </div>
        <div className="text-[10px] text-neutral-500 mt-1">{time}</div>
      </div>

      {isMine && <div style={{ width: 32 }} />}
    </div>
  );
}
