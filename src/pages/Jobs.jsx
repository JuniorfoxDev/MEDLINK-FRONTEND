import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Briefcase,
  Bookmark,
  X,
  Building,
  Plus,
  Loader2,
  Download,
} from "lucide-react";
import Sidebar from "../components/DashboardSidebar";
import Navbar from "../components/DashboardNavbar";
import api from "../api/axiosInstance";
import CreateJobModal from "../components/CreateJobModal";
import toast, { Toaster } from "react-hot-toast";
import socket from "../socket";
import MobileFabMenu from "../components/MobileFab"

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load logged-in user
  useEffect(() => {
    let mounted = true;
    (async function loadUser() {
      try {
        const res = await api.get("/auth/me");
        if (mounted && res.data?.user) setUser(res.data.user);
      } catch (err) {
        console.error("User load failed", err?.response?.data || err?.message);
      }
    })();
    return () => (mounted = false);
  }, []);

  // Load jobs
  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/jobs");
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Jobs fetch failed", err?.response?.data || err?.message);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();

    // real-time: when someone applies, doctors may want to refresh
    socket.connect();
    socket.on("newApplicant", (payload) => {
      // payload: { jobId, applicant }
      toast.success(`🧾 New applicant for a job`);
      // If logged-in user is the doctor who posted any job, refresh to show latest applicants
      // We'll always refresh to keep list fresh (could optimize)
      loadJobs();
    });

    return () => {
      socket.off("newApplicant");
      // socket.disconnect(); // avoid disconnecting global socket if shared elsewhere
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshJobs = async () => {
    await loadJobs();
  };

  const filteredJobs = jobs.filter((j) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return (
      (j.title || "").toLowerCase().includes(s) ||
      (j.hospital || "").toLowerCase().includes(s) ||
      (j.location || "").toLowerCase().includes(s) ||
      (j.tags || []).join(" ").toLowerCase().includes(s)
    );
  });

  // Save / Unsave job - toggles
  const handleSave = async (jobId) => {
    try {
      setSaving(true);
      const res = await api.post(`/jobs/${jobId}/save`);
      if (res.data?.success) {
        toast.success(res.data.saved ? "💾 Job saved" : "Removed from saved");
        // update local job saved flag (we store `saved` on job client-side)
        setJobs((prev) =>
          prev.map((j) =>
            j._id === jobId ? { ...j, saved: !!res.data.saved } : j
          )
        );
      } else {
        toast.error("Unable to save job");
      }
    } catch (err) {
      console.error("Save job failed", err?.response?.data || err?.message);
      toast.error(err?.response?.data?.message || "Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  // Apply for job (multipart with resume)
  const handleApply = async (jobId) => {
    if (!user) {
      toast.error("Please login to apply");
      return;
    }

    try {
      setApplying(true);

      const form = new FormData();
      form.append("coverLetter", coverLetter || "");
      if (resumeFile) form.append("resume", resumeFile);

      const res = await api.post(`/jobs/${jobId}/apply`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        toast.success("✅ Applied successfully!");
        setSelectedJob(null);
        setCoverLetter("");
        setResumeFile(null);
        // refresh jobs to show applicant count
        await loadJobs();
      } else {
        toast.error(res.data?.message || "Failed to apply");
      }
    } catch (err) {
      console.error("Apply failed", err?.response?.data || err?.message);
      toast.error(
        err?.response?.data?.message || "Failed to apply — try again later"
      );
    } finally {
      setApplying(false);
    }
  };

  // Resume file change handler
  const onResumeSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Simple validation
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(f.type)) {
      toast.error("Only PDF or DOC/DOCX allowed");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Resume must be under 5 MB");
      return;
    }
    setResumeFile(f);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f9fc] via-[#eef2f7] to-[#f6fbff] flex flex-col">
      <Toaster position="top-right" />
      <Navbar />

      <div className="flex flex-1 max-w-7xl mx-auto w-full mt-24 px-4 gap-6">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar user={user} />
        </div>

        {/* Main Job Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 relative p-6 rounded-3xl border border-gray-200 shadow-lg bg-white/70 backdrop-blur-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-2">
              <Briefcase size={24} className="text-blue-600" />
              Explore Medical Jobs
            </h1>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center bg-white/70 px-3 py-2 rounded-full border border-gray-200 shadow-sm w-full md:w-64">
                <Search size={16} className="text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, hospital, location or tag..."
                  className="bg-transparent outline-none ml-2 text-sm w-full"
                />
              </div>

              {/* Doctor-only button */}
              {user?.role === "doctor" && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-blue-700 transition"
                >
                  <Plus size={18} /> Post Job
                </motion.button>
              )}
            </div>
          </div>

          {/* Job List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-blue-600" size={28} />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center text-gray-500 py-20">
              <p>No jobs found.</p>
              {user?.role === "doctor" && (
                <p className="text-blue-500 font-medium mt-2">
                  Create your first job post!
                </p>
              )}
            </div>
          ) : (
            <motion.div
              layout
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ scale: 1.02 }}
                  className="group bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all relative"
                >
                  {/* Applicant badge */}
                  {job.applicants?.length > 0 && (
                    <motion.div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow">
                      {job.applicants.length} Applicant
                      {job.applicants.length > 1 ? "s" : ""}
                    </motion.div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Building size={14} /> {job.hospital}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {job.location}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 mt-3 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex justify-between items-center mt-5">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                      {job.type || "Full-Time"}
                    </span>
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setSelectedJob(job)}
                        className="px-3 py-1 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        View
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setSelectedJob(job)}
                        className="px-3 py-1 rounded-lg border text-sm hover:bg-gray-50"
                      >
                        Apply
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleSave(job._id)}
                        className={`px-2 py-1 rounded-lg text-sm flex items-center gap-2 transition ${
                          job.saved ? "bg-blue-600 text-white" : "bg-white"
                        }`}
                        aria-disabled={saving}
                      >
                        <Bookmark size={14} />
                        {job.saved ? "Saved" : "Save"}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Create Job Modal */}
      <CreateJobModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={refreshJobs}
      />

      {/* Job Details + Apply Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 w-[95%] max-w-2xl relative shadow-2xl"
            >
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setCoverLetter("");
                  setResumeFile(null);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X />
              </button>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {selectedJob.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                    <Building size={14} /> {selectedJob.hospital} •{" "}
                    <MapPin size={12} /> {selectedJob.location}
                  </p>

                  <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedJob.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(selectedJob.tags || []).map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Applicants list summary for doctors */}
                  {user?.role === "doctor" &&
                    selectedJob.applicants &&
                    selectedJob.applicants.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-gray-800 mb-2">
                          Applicants ({selectedJob.applicants.length})
                        </h3>
                        <div className="space-y-2 max-h-40 overflow-auto">
                          {selectedJob.applicants.map((a, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50"
                            >
                              <div>
                                <div className="font-medium text-sm">
                                  {a.user?.name || a.name || "Applicant"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {a.user?.email || ""}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {a.resume && (
                                  <a
                                    href={
                                      a.resume.startsWith("http")
                                        ? a.resume
                                        : `${a.resume}`
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
                                  >
                                    <Download size={14} />
                                    Resume
                                  </a>
                                )}
                                <span className="text-xs text-gray-400">
                                  {new Date(a.appliedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Apply panel */}
                <div className="w-full md:w-[360px] bg-gray-50 p-4 rounded-xl flex-shrink-0">
                  <h4 className="font-semibold mb-2">Apply for this job</h4>

                  <label className="text-xs text-gray-500">Cover letter</label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Optional: short intro about you..."
                    className="w-full mt-2 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    rows={4}
                  />

                  <div className="mt-3">
                    <label className="text-xs text-gray-500">Resume</label>
                    <input
                      id="resume-file"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={onResumeSelect}
                      className="w-full mt-2 text-sm"
                    />
                    {resumeFile && (
                      <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{resumeFile.name}</span>
                          <span className="text-xs text-gray-400">
                            {(resumeFile.size / 1024 ** 2).toFixed(2)} MB
                          </span>
                        </div>
                        <button
                          onClick={() => setResumeFile(null)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setSelectedJob(null);
                        setCoverLetter("");
                        setResumeFile(null);
                      }}
                      className="flex-1 px-3 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => handleApply(selectedJob._id)}
                      disabled={applying}
                      className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      {applying ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Briefcase size={16} /> Apply Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <MobileFabMenu />
    </div>
  );
}
