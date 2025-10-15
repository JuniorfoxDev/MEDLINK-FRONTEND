// src/pages/EditProfile.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  User,
  Mail,
  Briefcase,
  MapPin,
  FileEdit,
  University,
  Stethoscope,
  Building2,
} from "lucide-react";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";
import Navbar from "../components/DashboardNavbar";
import Sidebar from "../components/DashboardSidebar";

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data?.success) {
          setUser(res.data.user);
          setPreview(res.data.user.profilePic || null);
        } else {
          toast.error("Failed to load user");
        }
      } catch (err) {
        console.error(err);
        toast.error("Session expired, please login");
        window.location.href = "/login";
      }
    };
    loadUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((p) => ({ ...p, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setUser((p) => ({ ...p, profilePicFile: file })); // temporarily store file
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const formData = new FormData();

      // append fields
      const fields = [
        "name",
        "bio",
        "location",
        "specialization",
        "university",
        "degree",
        "yearOfStudy",
        "department",
        "position",
        "headline",
        "skills",
        "experienceYears",
        "phone",
        "address",
        "qualification",
        "institute",
      ];

      fields.forEach((f) => {
        if (user[f] !== undefined && user[f] !== null) {
          // For arrays (skills), if user typed comma string convert to string (backend will parse)
          if (Array.isArray(user[f])) formData.append(f, user[f].join(","));
          else formData.append(f, user[f]);
        }
      });

      // profile pic file if present
      if (user.profilePicFile instanceof File) {
        formData.append("profilePic", user.profilePicFile);
      }

      const res = await api.post("/auth/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        toast.success("Profile updated");
        setUser(res.data.user);
        setPreview(res.data.user.profilePic || preview);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading your profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-7xl mx-auto w-full mt-24 px-3 gap-4">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-8"
        >
          <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2 mb-6">
            <FileEdit className="text-blue-600" /> Edit Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 shadow-md">
                <img
                  src={
                    user.profilePic
                      ? `${import.meta.env.VITE_BACKEND_URL}${user.profilePic}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
                  }

                  alt="Profile"
                  className="object-cover w-full h-full"
                />

                <label
                  htmlFor="fileInput"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition"
                  title="Change profile picture"
                >
                  <Camera size={18} />
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>
              <h3 className="mt-3 font-semibold text-gray-800 text-lg">
                {user.name}
              </h3>
              <p className="text-gray-500 text-sm capitalize">{user.role}</p>
            </div>

            {/* Grid fields */}
            <div className="grid md:grid-cols-2 gap-5">
              <InputField
                icon={<User />}
                label="Full Name"
                name="name"
                value={user.name || ""}
                onChange={handleChange}
              />
              <InputField
                icon={<Mail />}
                label="Email (read-only)"
                name="email"
                value={user.email || ""}
                disabled
              />
              <InputField
                icon={<Briefcase />}
                label="Role (read-only)"
                name="role"
                value={user.role || ""}
                disabled
              />
              <InputField
                icon={<MapPin />}
                label="Location"
                name="location"
                value={user.location || ""}
                onChange={handleChange}
              />
            </div>

            {/* More fields */}
            <div className="grid md:grid-cols-2 gap-5">
              <InputField
                label="Headline"
                name="headline"
                value={user.headline || ""}
                onChange={handleChange}
              />
              <InputField
                label="Phone"
                name="phone"
                value={user.phone || ""}
                onChange={handleChange}
              />
              <InputField
                label="Address"
                name="address"
                value={user.address || ""}
                onChange={handleChange}
              />
              <InputField
                label="Qualification"
                name="qualification"
                value={user.qualification || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={user.bio || ""}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded-lg p-3 bg-white/70 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Tell us something about yourself..."
              />
            </div>

            {user.role === "doctor" && (
              <div className="grid md:grid-cols-2 gap-5">
                <InputField
                  icon={<Stethoscope />}
                  label="Specialization"
                  name="specialization"
                  value={user.specialization || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Experience (years)"
                  name="experienceYears"
                  value={user.experienceYears || ""}
                  onChange={handleChange}
                />
              </div>
            )}

            {user.role === "student" && (
              <div className="grid md:grid-cols-2 gap-5">
                <InputField
                  icon={<University />}
                  label="University"
                  name="university"
                  value={user.university || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Degree"
                  name="degree"
                  value={user.degree || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Year of Study"
                  name="yearOfStudy"
                  value={user.yearOfStudy || ""}
                  onChange={handleChange}
                />
              </div>
            )}

            {user.role === "staff" && (
              <div className="grid md:grid-cols-2 gap-5">
                <InputField
                  icon={<Building2 />}
                  label="Department"
                  name="department"
                  value={user.department || ""}
                  onChange={handleChange}
                />
                <InputField
                  label="Position"
                  name="position"
                  value={user.position || ""}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="flex justify-end pt-6">
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={saving}
                type="submit"
                className={`px-6 py-2 rounded-lg font-semibold text-white shadow ${
                  saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 transition"
                }`}
              >
                {saving ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

/* Small InputField component */
const InputField = ({ label, name, value, onChange, disabled, icon }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-3 text-gray-400">{icon}</span>
      )}
      <input
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full h-11 border border-gray-300 rounded-lg px-10 focus:ring-2 focus:ring-blue-400 bg-white/70 outline-none ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
      />
    </div>
  </div>
);
