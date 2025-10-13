import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Stethoscope,
  User,
  Mail,
  Lock,
  IdCard,
  Phone,
  MapPin,
  BookOpen,
  Briefcase,
  ShieldCheck,
  GraduationCap,
  UploadCloud,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// 🔹 Upload Component (with preview + animation)
const UploadBox = ({ label, name, file, setFile, accept = "image/*" }) => {
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    const fileObj = f instanceof File ? f : f[0];
    const preview =
      fileObj && fileObj.type.startsWith("image/")
        ? URL.createObjectURL(fileObj)
        : null;
    setFile({ file: fileObj, preview });
  };

  const remove = () => {
    if (file?.preview) URL.revokeObjectURL(file.preview);
    setFile(null);
    if (inputRef.current) inputRef.current.value = null;
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      {!file ? (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => inputRef.current.click()}
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-5 bg-white/40 backdrop-blur-lg cursor-pointer text-center transition hover:bg-white/60"
        >
          <UploadCloud className="text-blue-600 mb-2" size={24} />
          <p className="text-sm text-gray-700 font-medium">
            Click or drag & drop to upload
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports images or PDFs (max 5MB)
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            name={name}
            onChange={(e) => handleFile(e.target.files[0])}
            className="hidden"
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative rounded-xl overflow-hidden border bg-white/60 backdrop-blur-lg"
        >
          {file.preview ? (
            <img
              src={file.preview}
              alt="preview"
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="p-3 text-sm text-gray-700">{file.file?.name}</div>
          )}

          <div className="flex justify-between items-center p-3 border-t bg-gray-50/80">
            <button
              onClick={() => inputRef.current.click()}
              className="px-3 py-1 rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 text-sm"
            >
              Replace
            </button>
            <button
              onClick={remove}
              className="px-3 py-1 rounded-md text-red-600 bg-red-50 hover:bg-red-100 text-sm flex items-center gap-1"
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [profilePic, setProfilePic] = useState(null);
  const [uploadId, setUploadId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    bio: "",
    headline: "",
    specialization: "",
    experienceYears: "",
    university: "",
    degree: "",
    yearOfStudy: "",
    department: "",
    position: "",
    institute: "",
    phone: "",
    address: "",
    qualification: "",
    location: "",
    skills: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const canProceed = () => {
    if (step === 1)
      return (
        form.name &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
        form.password.length >= 6 &&
        form.role
      );
    if (step === 2)
      return (
        form.bio && form.headline && form.location && (profilePic?.file || true)
      );
    if (step === 3) {
      if (form.role === "doctor")
        return form.specialization && form.experienceYears && uploadId?.file;
      if (form.role === "student")
        return (
          form.university && form.degree && form.yearOfStudy && uploadId?.file
        );
      if (form.role === "staff")
        return form.department && form.position && uploadId?.file;
    }
    if (step === 4)
      return (
        form.institute &&
        form.phone &&
        form.address &&
        form.qualification &&
        uploadId
      );
    return false;
  };

  const next = () => {
    if (canProceed()) setStep((s) => s + 1);
    else toast.error("⚠️ Please fill all required fields.");
  };

  const back = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canProceed()) return toast.error("Complete all fields!");

    setLoading(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => v && data.append(k, v));
    if (profilePic?.file) data.append("profilePic", profilePic.file);
    if (uploadId?.file) data.append("uploadId", uploadId.file);

    try {
      await axios.post("http://localhost:5000/api/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("🎉 Account created successfully!");
      setTimeout(() => {
        navigate("/login", {
          state: { email: form.email, password: form.password },
        });
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-100 relative overflow-hidden p-6">
      <Toaster position="top-right" />

      {/* Animated glow */}
      <motion.div
        className="absolute -top-20 -left-20 w-96 h-96 bg-blue-300/40 blur-[120px] rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-indigo-300/30 blur-[130px] rounded-full"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
        transition={{ duration: 9, repeat: Infinity }}
      />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-3xl bg-white/60 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl px-8 py-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-md">
              <Stethoscope />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                MediLink Registration
              </h2>
              <p className="text-xs text-gray-500">
                Verified signup for doctors, students & staff
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Step {step} of 4</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`flex-1 h-2 rounded-full ${
                step >= n
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="grid gap-4"
              >
                <Input
                  label="Full Name"
                  icon={<User />}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
                <Input
                  label="Email"
                  icon={<Mail />}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
                <Input
                  label="Password"
                  icon={<Lock />}
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  hint="Minimum 6 characters"
                />
                <Select
                  label="Role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  options={["doctor", "student", "staff"]}
                />
              </motion.div>
            )}

            {/* Step 2: Common Info */}
            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-4"
              >
                <Input
                  label="Bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                />
                <Input
                  label="Headline"
                  name="headline"
                  value={form.headline}
                  onChange={handleChange}
                />
                <Input
                  label="Location"
                  name="location"
                  icon={<MapPin />}
                  value={form.location}
                  onChange={handleChange}
                />
                <Input
                  label="Skills (comma separated)"
                  name="skills"
                  icon={<BookOpen />}
                  value={form.skills}
                  onChange={handleChange}
                />
                <UploadBox
                  label="Profile Picture"
                  name="profilePic"
                  file={profilePic}
                  setFile={setProfilePic}
                />
              </motion.div>
            )}

            {/* Step 3: Role Specific */}
            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-4"
              >
                {form.role === "doctor" && (
                  <>
                    <Input
                      label="Specialization"
                      icon={<ShieldCheck />}
                      name="specialization"
                      value={form.specialization}
                      onChange={handleChange}
                    />
                    <Input
                      label="Experience (years)"
                      icon={<Briefcase />}
                      name="experienceYears"
                      type="number"
                      value={form.experienceYears}
                      onChange={handleChange}
                    />
                    <UploadBox
                      label="Upload Medical ID"
                      name="uploadId"
                      file={uploadId}
                      setFile={setUploadId}
                    />
                  </>
                )}
                {form.role === "student" && (
                  <>
                    <Input
                      label="University"
                      name="university"
                      icon={<GraduationCap />}
                      value={form.university}
                      onChange={handleChange}
                    />
                    <Input
                      label="Degree"
                      name="degree"
                      value={form.degree}
                      onChange={handleChange}
                    />
                    <Input
                      label="Year of Study"
                      name="yearOfStudy"
                      type="number"
                      value={form.yearOfStudy}
                      onChange={handleChange}
                    />
                    <UploadBox
                      label="Upload Student ID"
                      name="uploadId"
                      file={uploadId}
                      setFile={setUploadId}
                    />
                  </>
                )}
                {form.role === "staff" && (
                  <>
                    <Input
                      label="Department"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                    />
                    <Input
                      label="Position"
                      name="position"
                      value={form.position}
                      onChange={handleChange}
                    />
                    <UploadBox
                      label="Upload Staff ID"
                      name="uploadId"
                      file={uploadId}
                      setFile={setUploadId}
                    />
                  </>
                )}
              </motion.div>
            )}

            {/* Step 4: Extras */}
            {step === 4 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-4"
              >
                <Input
                  label="Institute"
                  name="institute"
                  value={form.institute}
                  onChange={handleChange}
                />
                <Input
                  label="Phone"
                  name="phone"
                  icon={<Phone />}
                  value={form.phone}
                  onChange={handleChange}
                />
                <Input
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                />
                <Input
                  label="Qualification"
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex justify-between pt-4">
            {step > 1 && (
              <button
                onClick={back}
                type="button"
                className="px-4 py-2 rounded-lg border bg-white/60 hover:bg-white/80 transition"
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={next}
                type="button"
                className={`px-6 py-2 rounded-lg font-semibold text-white ${
                  canProceed()
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition"
              >
                {loading ? "Registering..." : "Create Account"}
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-5">
          Already registered?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 font-semibold hover:underline"
          >
            Log in here
          </button>
        </p>
      </motion.div>
    </div>
  );
}

// 🔹 Reusable Inputs
const Input = ({ label, icon, hint, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-3 text-gray-400">{icon}</span>
      )}
      <input
        {...props}
        className="w-full h-11 pl-10 pr-3 rounded-lg border border-gray-300 bg-white/60 focus:ring-2 focus:ring-blue-400 outline-none transition"
      />
    </div>
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <select
      {...props}
      className="w-full h-11 rounded-lg border border-gray-300 px-3 bg-white/60 focus:ring-2 focus:ring-blue-400 outline-none transition"
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </option>
      ))}
    </select>
  </div>
);
