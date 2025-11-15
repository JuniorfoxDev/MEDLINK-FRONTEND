import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import Navbar from "../components/DashboardNavbar";
import Sidebar from "../components/DashboardSidebar";
import CreatePost from "../components/CreatePost";
import FeedCard from "../components/FeedCard";
import RightPanel from "../components/RightPanelDashboard";
import MobileFabMenu from "../components/MobileFab";
import socket from "../socket";
import { toast } from "react-toastify";
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found, redirecting to login...");
        navigate("/login");
        return;
      }

      try {
        const res = await api.get("/auth/me");
        if (res.data?.success) {
          console.log("✅ User fetched successfully:", res.data.user);
          setUser(res.data.user);
        } else {
          console.warn("⚠️ Unexpected user response:", res.data);
          navigate("/login");
        }
      } catch (err) {
        console.error("❌ Auth Error:", err.response?.data || err.message);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  // ✅ Fetch all posts
  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      if (res.data?.success) {
        setPosts(res.data.posts);
        console.log("🧾 Posts loaded:", res.data.posts);
      }
    } catch (err) {
      console.error("❌ Failed to fetch posts:", err.message);
      toast.error("Unable to load feed right now.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initialize sockets and handle real-time updates
  useEffect(() => {
    fetchPosts();
    socket.connect();

    // 🆕 New Post
    socket.on("newPost", (newPost) => {
      console.log("🆕 New post received:", newPost);
      setPosts((prev) => {
        const exists = prev.some((p) => p._id === newPost._id);
        if (exists) return prev;
        return [newPost, ...prev];
      });
    });

    // 📝 Post Updated
    socket.on("postUpdated", (updatedPost) => {
      console.log("📝 Post updated via socket:", updatedPost);
      setPosts((prev) =>
        prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      );
    });

    // 🗑️ Post Deleted
    socket.on("postDeleted", (deletedId) => {
      console.log("🗑️ Post deleted via socket:", deletedId);
      setPosts((prev) => prev.filter((p) => p._id !== deletedId));
    });

    // ❤️ Like Update
    socket.on("postLiked", (data) => {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === data.postId ? { ...p, likes: data.likes } : p
        )
      );
    });

    // 💬 Comment Update
    socket.on("newComment", (data) => {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === data.postId ? { ...p, comments: data.comments } : p
        )
      );
    });

    // 🔖 Save/Unsave Update
    socket.on("postSaved", (data) => {
      console.log("🔖 Post save/unsave detected:", data);
      if (data.userId === user?._id) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === data.postId ? { ...p, isSaved: data.saved } : p
          )
        );
      }
    });

    return () => {
      socket.off("newPost");
      socket.off("postUpdated");
      socket.off("postDeleted");
      socket.off("postLiked");
      socket.off("newComment");
      socket.off("postSaved");
      socket.disconnect();
    };
  }, [user]);

  // ✅ Handle Post Creation Success
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // ✅ Handle Post Deletion
  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  // ✅ Handle Post Update
  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  // ✅ Loading Screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-[#0d141c] font-semibold text-lg">
        Loading your feed...
      </div>
    );
  }

  // ✅ Fallback for unauthenticated users
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-[#0d141c] font-semibold text-lg">
        Session expired, redirecting to login...
      </div>
    );
  }

  // ✅ Main Dashboard Layout
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Navbar */}
      <Navbar user={user} />

      <div className="flex flex-1 max-w-7xl mx-auto w-full mt-24 px-3 gap-4">
        {/* Sidebar */}
        <Sidebar user={user} />

        {/* Feed Section */}
        <main className="flex-1 space-y-4">
          {/* Create Post */}
          <CreatePost user={user} onPostCreated={handlePostCreated} />

          {/* Feed List */}
          {posts.length > 0 ? (
            posts.map((post) => (
              <FeedCard
                key={post._id}
                post={post}
                currentUser={user}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
              />
            ))
          ) : (
            <div className="text-center text-gray-400 mt-8">
              No posts yet. Be the first to share something!
            </div>
          )}
        </main>

        {/* Right Panel */}
        <RightPanel user={user} />
      </div>

      <MobileFabMenu user={user} />
    </div>
  );
}
