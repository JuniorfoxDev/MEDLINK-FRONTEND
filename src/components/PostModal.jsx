import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, X } from "lucide-react";
import api from "../api/axiosInstance";

export default function PostJobModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    title: "",
    hospital: "",
    location: "",
    type: "Full-Time",
    description: "",
    tags: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/jobs/create", { ...form, tags: form.tags.split(",") });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-2xl p-6 w-[90%] max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center gap-2">
              <Briefcase /> Post a New Job
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              {["title", "hospital", "location", "description", "tags"].map(
                (field) => (
                  <input
                    key={field}
                    name={field}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    className="w-full border border-gray-200 rounded-lg p-2"
                    onChange={handleChange}
                    required={field !== "tags"}
                  />
                )
              )}
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Post Job
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
