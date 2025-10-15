// ✅ /src/socket/socket.js
import { io } from "socket.io-client";

// 🌍 Smart environment detection
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000" // local backend
    : "https://medlink-backend-eb22.onrender.com"); // deployed backend on Render

// ✅ Initialize Socket.IO client
const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // fallback to polling if websocket fails
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  autoConnect: true, // connect automatically when imported
  withCredentials: true, // important for CORS-safe connections
});

// ✅ Log key socket events
socket.on("connect", () => {
  console.log(`🟢 Connected to Socket.IO: ${SOCKET_URL}`);
});

socket.on("disconnect", (reason) => {
  console.warn("🔴 Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("⚠️ Socket connection error:", err.message);
});

// 🧩 Optional helper to re-connect manually if needed
export const reconnectSocket = () => {
  if (!socket.connected) {
    console.log("🔁 Attempting socket reconnection...");
    socket.connect();
  }
};

// ✅ Export socket instance for use in components
export default socket;
