import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Home, User,Users2Icon, Briefcase, PenSquare, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MobileFabMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const menuItems = [
    { icon: <Home size={18} />, label: "Home", path: "/dashboard" },
    {
      icon: <Users2Icon size={18} />,
      
      label: "Network",
      path: "/network",
    },
    { icon: <Briefcase size={18} />, label: "Jobs", path: "/jobs" },
    {
      icon: <PenSquare size={18} />,
      label: "Create Post",
      path: "/create-post",
    },
    { icon: <User size={18} />, label: "Profile", path: "/profile" },
    { icon: <Settings size={18} />, label: "Settings", path: "/settings" },
  ];

  // ✅ Auto-close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="md:hidden fixed bottom-5 left-5 z-50" ref={menuRef}>
      {/* Menu Box */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="mb-4 bg-white/70 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-3 flex flex-col gap-2"
          >
            {menuItems.map((item, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigate(item.path);
                  setOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-800 hover:bg-blue-100/60 transition"
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating “+” Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: open ? 45 : 0 }}
        className="p-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl animate-[pulse_2s_infinite]"
      >
        <Plus size={22} />
      </motion.button>
    </div>
  );
};

export default MobileFabMenu;
