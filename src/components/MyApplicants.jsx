import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  MoreVertical,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import Navbar from "./DashboardNavbar";
import Sidebar from "./DashboardSidebar"; // ✅ Sidebar imported

export default function MyApplicants() {
  const [jobs, setJobs] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  // ✅ Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          toast.error("Unable to verify user");
        }
      } catch (err) {
        console.error("User check failed:", err);
        toast.error("Session expired, please log in again");
        window.location.href = "/login";
      }
    };
    fetchUser();
  }, []);

  // ✅ Fetch applicants (only for doctors)
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await api.get("/jobs/my-applicants");
        if (res.data.success) setJobs(res.data.jobs);
      } catch (err) {
        console.error("Failed to load applicants:", err);
        toast.error("Error loading job applicants");
      } finally {
        setLoading(false);
      }
    };
    if (user && user.role === "doctor") {
      fetchApplicants();
    }
  }, [user]);

  // ✅ Update applicant status
  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const res = await api.patch(`/jobs/update-status/${applicationId}`, {
        status: newStatus,
      });
      if (res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setJobs((prev) =>
          prev.map((job) => ({
            ...job,
            applicants: job.applicants.map((a) =>
              a._id === applicationId ? { ...a, status: newStatus } : a
            ),
          }))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Error updating applicant status");
    } finally {
      setMenuOpen(null);
    }
  };

  // ✅ Role-based protection
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 font-medium">
        Loading your applicants...
      </div>
    );

  if (!user || user.role !== "doctor") {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 font-semibold text-lg">
        🚫 Access Denied — This page is only for doctors.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f9fc] via-[#eef2f7] to-[#f6fbff] flex flex-col">
      <Navbar />

      <div className="flex flex-1 max-w-7xl mx-auto w-full mt-24 px-4 gap-6">
        {/* ✅ Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* ✅ Main content */}
        <div className="flex-1 bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-gray-200 overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            👩‍⚕️ My Job Applicants
          </h1>

          {jobs.length === 0 ? (
            <p className="text-gray-500 text-center">
              No job applicants yet. Start posting jobs to receive applications.
            </p>
          ) : (
            jobs.map((job, index) => (
              <motion.div
                key={job._id}
                className="bg-white shadow-md rounded-2xl mb-5 pb- border border-gray-100 overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Job Header */}
                <div
                  className="flex justify-between items-center px-5 py-4  cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpanded(expanded === index ? null : index)}
                >
                  <div>
                    <h2 className="font-semibold text-lg text-gray-800">
                      {job.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {job.hospital} • {job.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-sm font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                      {job.totalApplicants} Applicant
                      {job.totalApplicants !== 1 ? "s" : ""}
                    </span>
                    {expanded === index ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>

                {/* Applicant List */}
                <AnimatePresence>
                  {expanded === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pb-5 bg-gray-50"
                    >
                      {job.applicants.length > 0 ? (
                        job.applicants.map((app, idx) => (
                          <motion.div
                            key={idx}
                            className="flex justify-between items-center bg-white p-4 rounded-xl mb-2 shadow-sm hover:shadow-md transition-all border border-gray-100 relative"
                            whileHover={{ scale: 1.01 }}
                          >
                            {/* Left - Applicant Info */}
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  app.profilePic ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    app.name || "User"
                                  )}`
                                }
                                alt={app.name}
                                className="w-10 h-10 rounded-full border"
                              />
                              <div>
                                <p className="font-semibold text-gray-800 flex items-center gap-1">
                                  <User size={15} /> {app.name}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Mail size={13} /> {app.email}
                                </p>
                              </div>
                            </div>

                            {/* Right - Actions */}
                            <div className="flex items-center gap-3">
                              {app.resume && (
                                <a
                                  href={app.resume}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline"
                                >
                                  <FileText size={15} /> Resume
                                </a>
                              )}
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  app.status === "shortlisted"
                                    ? "bg-green-100 text-green-700"
                                    : app.status === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {app.status.charAt(0).toUpperCase() +
                                  app.status.slice(1)}
                              </span>

                              {/* More Menu */}
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setMenuOpen(menuOpen === idx ? null : idx)
                                  }
                                  className="p-1 hover:bg-gray-100 rounded-full"
                                >
                                  <MoreVertical size={16} />
                                </button>
                                <AnimatePresence>
                                  {menuOpen === idx && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      className="absolute right-0 top-6  bg-white border border-gray-200 rounded-lg shadow-lg w-36 z-10"
                                    >
                                      <button
                                        onClick={() =>
                                          handleStatusChange(
                                            app._id,
                                            "shortlisted"
                                          )
                                        }
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-green-50 text-green-700"
                                      >
                                        <CheckCircle size={14} /> Shortlist
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleStatusChange(
                                            app._id,
                                            "rejected"
                                          )
                                        }
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-red-50 text-red-700"
                                      >
                                        <XCircle size={14} /> Reject
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleStatusChange(app._id, "applied")
                                        }
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-gray-600"
                                      >
                                        <RotateCcw size={14} /> Reset
                                      </button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              <span className="text-gray-400 text-xs">
                                {app.appliedAt
                                  ? new Date(app.appliedAt).toLocaleDateString()
                                  : ""}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 mt-3 text-center">
                          No applicants yet.
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
