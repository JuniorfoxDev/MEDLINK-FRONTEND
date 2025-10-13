import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Trash2, Edit3, Eye, Users, X } from "lucide-react";
import axios from "../../utils/axiosInstance";
import CreateJobModal from "../../components/jobs/CreateJobModal";

export default function DoctorDashboard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplicants, setShowApplicants] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("/jobs/my");
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Fetch jobs failed:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const deleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    await axios.delete(`/jobs/${id}`);
    fetchJobs();
  };

  const handleEdit = (job) => {
    setEditingJob(job);
  };

  const handleUpdate = async (updated) => {
    await axios.put(`/jobs/${updated._id}`, updated);
    setEditingJob(null);
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 md:px-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
          <Briefcase size={22} /> My Job Posts
        </h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Post New Job
        </motion.button>
      </div>

      {/* Jobs List */}
      <div className="grid gap-4">
        {jobs.length === 0 && (
          <p className="text-gray-500 text-sm italic">No jobs posted yet.</p>
        )}
        {jobs.map((job) => (
          <motion.div
            key={job._id}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-gray-800">{job.title}</h2>
                <p className="text-sm text-gray-500">{job.hospital}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {job.location} • {job.type}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(job)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => setShowApplicants(job)}
                  className="text-green-500 hover:text-green-700"
                >
                  <Users size={18} />
                </button>
                <button
                  onClick={() => deleteJob(job._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Job Modal */}
      <CreateJobModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchJobs}
      />

      {/* Applicants Modal */}
      <ApplicantsModal
        job={showApplicants}
        onClose={() => setShowApplicants(false)}
      />

      {/* Edit Job Modal */}
      <EditJobModal
        job={editingJob}
        onClose={() => setEditingJob(null)}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
