import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function EditJobModal({ job, onClose, onUpdate }) {
  const [form, setForm] = useState(job || {});

  if (!job) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(form);
  };

  return (
    <AnimatePresence>
      {job && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white p-6 rounded-xl w-full max-w-md relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold text-blue-700 mb-4">
              Edit Job
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-lg"
                placeholder="Job Title"
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="w-full border px-3 py-2 rounded-lg"
                placeholder="Job Description"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700"
              >
                Update Job
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
