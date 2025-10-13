import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Send,
  X,
  MoreVertical,
  Edit,
  Trash,
  Bookmark,
  Users,
  Loader2,
} from "lucide-react";
import api from "../api/axiosInstance";
import socket from "../socket";
import { toast } from "react-toastify";
import EditPostModal from "./EditPostModal";

export default function FeedCard({
  post = {},
  currentUser = {},
  onPostDeleted,
  onPostUpdated,
}) {
  const {
    _id,
    text = "",
    media = [],
    likes: initialLikes = [],
    comments: initialComments = [],
    author = {},
    createdAt,
  } = post;

  const [likes, setLikes] = useState(initialLikes);
  const [comments, setComments] = useState(initialComments);
  const [liked, setLiked] = useState(
    initialLikes.some((u) => u?._id === currentUser?._id)
  );
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showLikesList, setShowLikesList] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [typing, setTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Sync initial saved state
  useEffect(() => {
    if (currentUser?.savedPosts?.includes(_id)) {
      setIsSaved(true);
    }
  }, [currentUser, _id]);

  // ❤️ Like / Unlike
  const handleLike = async () => {
    try {
      const res = await api.post(`/posts/${_id}/like`);
      if (res.data.success) {
        setLikes(res.data.post.likes || []);
        setLiked(res.data.liked);
        toast.success(res.data.liked ? "❤️ Liked!" : "💔 Unliked");
      }
    } catch {
      toast.error("Error liking post");
    }
  };

  // 🗑️ Delete Post
  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await api.delete(`/posts/${_id}`);
      if (res.data.success) {
        toast.success("🗑️ Post deleted!");
        onPostDeleted?.(_id);
        socket.emit("postDeleted", _id);
      }
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setMenuOpen(false);
    }
  };

  // 🔖 Save / Unsave Post
  const handleSavePost = async () => {
    try {
      const res = await api.post(`/posts/${_id}/save`);
      if (res.data.success) {
        setIsSaved(res.data.saved);
        toast.success(res.data.message);
      }
    } catch {
      toast.error("Error saving/unsaving post");
    } finally {
      setMenuOpen(false);
    }
  };

  // 💬 Add Comment
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      setLoading(true);
      const res = await api.post(`/posts/${_id}/comment`, {
        text: commentText,
      });
      if (res.data.success) {
        setComments(res.data.post.comments || []);
        setCommentText("");
        toast.success("💬 Comment added!");
      }
    } catch {
      toast.error("Error adding comment");
    } finally {
      setLoading(false);
    }
  };

  // ✍️ Typing
  const handleTyping = (e) => {
    const val = e.target.value;
    setCommentText(val);
    if (!_id || !currentUser?.name) return;
    socket.emit("typing", { postId: _id, user: currentUser.name });
    if (!typing) setTyping(true);
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket.emit("stopTyping", { postId: _id });
      setTyping(false);
    }, 1000);
  };

  // 🔄 Real-time sync
  useEffect(() => {
    socket.on("postLiked", (data) => {
      if (data.postId === _id) setLikes(data.likes || []);
    });
    socket.on("newComment", (data) => {
      if (data.postId === _id) setComments(data.comments || []);
    });
    socket.on("postUpdated", (updated) => {
      if (updated._id === _id) onPostUpdated?.(updated);
    });
    socket.on("postSaved", (data) => {
      if (data.postId === _id && data.userId === currentUser._id) {
        setIsSaved(data.saved);
      }
    });
    return () => {
      socket.off("postLiked");
      socket.off("newComment");
      socket.off("postUpdated");
      socket.off("postSaved");
    };
  }, [_id]);

  const timeAgo = (date) => {
    if (!date) return "";
    const diff = Math.floor((Date.now() - new Date(date)) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  if (!author?.name)
    return (
      <div className="p-6 text-center text-gray-400 italic border rounded-xl">
        ⚠️ Post unavailable
      </div>
    );

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md overflow-hidden border pb-6 border-gray-100 hover:shadow-lg transition-all"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              author.name
            )}&background=0D8ABC&color=fff`}
            alt={author.name}
            className="w-11 h-11 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-800">{author.name}</h3>
            <p className="text-xs text-gray-500">
              {author.role || "Medical Professional"} • {timeAgo(createdAt)}
            </p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen((s) => !s)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical size={18} />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-100 z-50"
                >
                  {author?._id === currentUser?._id ? (
                    <>
                      <button
                        onClick={() => {
                          setEditModal(true);
                          setMenuOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit size={15} /> Edit Post
                      </button>
                      <button
                        onClick={handleDeletePost}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash size={15} /> Delete Post
                      </button>
                    </>
                  ) : null}

                  {/* Save / Unsave */}
                  <button
                    onClick={handleSavePost}
                    className={`flex items-center gap-2 w-full px-4 py-2 text-sm transition ${
                      isSaved
                        ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Bookmark
                      size={15}
                      className={isSaved ? "fill-blue-600 text-blue-600" : ""}
                    />
                    {isSaved ? "Saved" : "Save Post"}
                  </button>
                </motion.div>

                {/* Click outside to close */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                ></div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Text */}
      {text && (
        <p className="px-4 text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-line">
          {text}
        </p>
      )}

      {/* Media */}
      {media.length > 0 && (
        <div className="p-3">
          <div
            className={`grid ${
              media.length === 1
                ? "grid-cols-1"
                : media.length === 2
                ? "grid-cols-2"
                : "grid-cols-2 md:grid-cols-3"
            } gap-2`}
          >
            {media.map((m, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => setSelectedMedia(m.url)}
              >
                {m.url?.endsWith(".mp4") ? (
                  <video
                    src={m.url}
                    className="rounded-xl w-full h-[250px] object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={m.url}
                    alt="post media"
                    className="rounded-xl w-full h-[250px] object-cover"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-around text-gray-600 border-t border-gray-100 p-3 text-sm font-medium">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className={`flex items-center gap-1 ${
            liked ? "text-red-500" : "hover:text-blue-500"
          }`}
        >
          <Heart
            size={18}
            fill={liked ? "red" : "none"}
            strokeWidth={liked ? 0 : 2}
          />
          {likes.length} Like
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1 hover:text-blue-500"
        >
          <MessageCircle size={18} /> {comments.length} Comment
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowLikesList(true)}
          className="flex items-center gap-1 hover:text-blue-500"
        >
          <Users size={18} /> View Likes
        </motion.button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 border-t bg-gray-50"
          >
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={commentText}
                onChange={handleTyping}
                placeholder="Write a comment..."
                className="flex-1 border rounded-full px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                disabled={!commentText.trim() || loading}
                onClick={handleAddComment}
                className="bg-blue-600 text-white px-3 rounded-full text-sm flex items-center gap-1 hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Send size={14} />
                )}
                Post
              </button>
            </div>

            {typing && (
              <div className="text-xs text-gray-500 mb-2 animate-pulse">
                ✍️ Someone is typing...
              </div>
            )}

            {comments.length > 0 ? (
              comments.map((c, i) => (
                <div key={i} className="text-sm text-gray-700 mb-2">
                  <strong>{c.user?.name || "User"}:</strong> {c.text}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600">
                💬 No comments yet. Be the first!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      {editModal && (
        <EditPostModal
          post={post}
          onClose={() => setEditModal(false)}
          onPostUpdated={(updated) => {
            onPostUpdated?.(updated);
            setEditModal(false);
            socket.emit("postUpdated", updated);
          }}
        />
      )}

      {/* Likes Modal */}
      <AnimatePresence>
        {showLikesList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLikesList(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-lg p-5 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-gray-800">
                  {likes.length} People liked this
                </h2>
                <button
                  onClick={() => setShowLikesList(false)}
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  <X size={18} />
                </button>
              </div>
              {likes.length > 0 ? (
                <div className="space-y-2">
                  {likes.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${u.name}`}
                        alt={u.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center">
                  No likes yet.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Media Viewer */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl max-h-[85vh] w-auto"
            >
              {selectedMedia.endsWith(".mp4") ? (
                <video
                  src={selectedMedia}
                  controls
                  autoPlay
                  className="rounded-2xl max-h-[85vh] object-contain"
                />
              ) : (
                <img
                  src={selectedMedia}
                  alt="Full view"
                  className="rounded-2xl max-h-[85vh] object-contain"
                />
              )}
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-2 right-2 bg-white/20 text-white p-2 rounded-full hover:bg-white/40 transition"
              >
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
