import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image, Video, Loader2 } from "lucide-react";
import api from "../api/axiosInstance";
import { toast } from "react-toastify";

export default function EditPostModal({ post, onClose, onPostUpdated }) {
  const [text, setText] = useState(post.text || "");
  const [media, setMedia] = useState(post.media || []);
  const [loading, setLoading] = useState(false);
  const [newFiles, setNewFiles] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.includes("video") ? "video" : "image",
    }));
    setNewFiles((prev) => [...prev, ...previews]);
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!text.trim() && newFiles.length === 0) {
      toast.warn("Post cannot be empty!");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("text", text);
      newFiles.forEach((fileObj) => formData.append("media", fileObj.file));

      const res = await api.put(`/posts/${post._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast.success("✅ Post updated successfully!");
        onPostUpdated(res.data.post);
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100"
          >
            <X size={18} />
          </button>

          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            ✏️ Edit Post
          </h2>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Update your post text..."
          />

          {/* Existing Media */}
          {media.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {media.map((m, i) =>
                m.type === "video" ? (
                  <video
                    key={i}
                    src={m.url}
                    controls
                    className="rounded-lg w-full h-32 object-cover"
                  />
                ) : (
                  <img
                    key={i}
                    src={m.url}
                    alt="media"
                    className="rounded-lg w-full h-32 object-cover"
                  />
                )
              )}
            </div>
          )}

          {/* New Media */}
          {newFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {newFiles.map((file, i) => (
                <div key={i} className="relative">
                  {file.type === "video" ? (
                    <video
                      src={file.url}
                      className="rounded-lg w-full h-32 object-cover"
                    />
                  ) : (
                    <img
                      src={file.url}
                      className="rounded-lg w-full h-32 object-cover"
                      alt="preview"
                    />
                  )}
                  <button
                    onClick={() => handleRemoveNewFile(i)}
                    className="absolute top-1 right-1 bg-black/40 text-white rounded-full p-1 hover:bg-black/60"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer text-blue-600 hover:underline">
              <Image size={16} /> Add Photo
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer text-purple-600 hover:underline">
              <Video size={16} /> Add Video
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
