import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText } from "lucide-react";

export default function ApplicantsModal({ job, onClose }) {
  if (!job) return null;
  const applicants = job.applicants || [];

  return (
    <AnimatePresence>
      {job && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-2xl w-full max-w-lg p-6 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-semibold text-blue-700 mb-4">
              Applicants for {job.title}
            </h2>

            {applicants.length === 0 ? (
              <p className="text-gray-500 text-sm">No applicants yet.</p>
            ) : (
              <div className="space-y-3">
                {applicants.map((a, i) => (
                  <div
                    key={i}
                    className="border rounded-lg p-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {a.user?.name}
                      </p>
                      <p className="text-xs text-gray-500">{a.user?.email}</p>
                    </div>
                    {a.resume && (
                      <a
                        href={a.resume}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 flex items-center gap-1 text-sm"
                      >
                        <FileText size={14} /> Resume
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
