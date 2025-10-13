import { io } from "socket.io-client";

// ✅ Prefer Vite environment variable
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  // Auto-detect localhost or production
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://your-production-api.com");

// ✅ Initialize socket connection
const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
  autoConnect: false, // connect manually when app mounts
});

// ✅ Log socket connection events
socket.on("connect", () => {
  console.log("🟢 Connected to Socket.IO server:", SOCKET_URL);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("⚠️ Socket connection error:", err.message);
});

export default socket;
