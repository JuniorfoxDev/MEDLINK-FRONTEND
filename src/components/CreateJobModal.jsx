// src/components/jobs/CreateJobModal.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Briefcase,
  Building2,
  MapPin,
  FileText,
  PlusCircle,
} from "lucide-react";
import axios from "../api/axiosInstance";

export default function CreateJobModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    hospital: "",
    location: "",
    type: "",
    description: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/jobs/create", form);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setLoading(false);
      alert(err.response?.data?.message || "Error creating job");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center gap-2">
              <Briefcase size={20} /> Post a New Job
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Cardiologist Specialist"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Hospital
                </label>
                <input
                  type="text"
                  name="hospital"
                  value={form.hospital}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Apollo Hospitals"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Location
                  </label>
                  <div className="flex items-center border rounded-lg px-3 py-2">
                    <MapPin size={16} className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="flex-1 outline-none text-sm"
                      placeholder="e.g. Mumbai, India"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Surgery, MBBS, Teamwork"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe the role responsibilities..."
                ></textarea>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "#2563eb",
                  boxShadow: "0 0 12px rgba(37,99,235,0.5)",
                }}
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Posting..."
                ) : (
                  <>
                    <PlusCircle size={18} /> Post Job
                  </>
                )}
              </motion.button>
            </form>

            {/* ✅ Success Popup */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-green-100 p-4 rounded-full"
                  >
                    ✅
                  </motion.div>
                  <p className="mt-3 text-green-600 font-semibold">
                    Job Posted Successfully!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
