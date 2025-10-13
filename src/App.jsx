import "./App.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Jobs from "./pages/Jobs";
import Connection from "./pages/Connections";
import EditProfile from "./pages/UpdateProfile";
import VerifyEmailSuccess from "./pages/VerifyEmailSuccess";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import socket from "./socket";
import MyApplicants from './components/MyApplicants'
/**
 * ✅ App.jsx (Updated)
 * - Adds ToastContainer globally
 * - Handles Socket.IO connection
 * - Listens for push events (like new posts/comments)
 * - Cleans up socket on unmount
 * - Keeps routing clean and scalable
 */

function App() {
  useEffect(() => {
    // ✅ Connect to socket server
    socket.connect();
    socket.on("notification", (msg) => {
      console.log("🔔 Notification:", msg);
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmailSuccess />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <Jobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/network"
            element={
              <ProtectedRoute>
                <Connection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
           <Route
          path="/my-applicants"
          element={
            <ProtectedRoute>
              <MyApplicants />
            </ProtectedRoute>
          }
        />
          {/* Fallback route for invalid URLs */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* ✅ Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;
