import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { ChevronDown } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { TypeAnimation } from "react-type-animation";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

// ✅ Testimonials Data
const testimonials = [
  {
    name: "Dr. Priya Deshmukh",
    role: "Neurosurgeon | Fortis Mumbai",
    text: "MediLink has connected me with specialists I never thought I’d meet — it’s like LinkedIn for the medical world!",
    img: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Dr. Rahul Sharma",
    role: "Cardiologist | AIIMS Delhi",
    text: "The verified doctor feature builds real trust. I’ve collaborated on research projects through this platform.",
    img: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    name: "Aditi Sharma",
    role: "MBBS Intern | PGIMER Chandigarh",
    text: "As a student, MediLink helped me get mentorship and early exposure to medical research and discussions.",
    img: "https://randomuser.me/api/portraits/women/32.jpg",
  },
];

const Home = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col bg-[#f7faff]"
      style={{ fontFamily: "Manrope, Noto Sans, sans-serif" }}
    >
      {/* ✅ Floating Navbar */}
      <nav
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "bg-white/70 backdrop-blur-xl shadow-lg py-3"
            : "bg-transparent py-5"
        }`}
      >
        <Navbar />
      </nav>

      {/* ✅ Hero Section with Parallax */}
      <section className="relative h-[90vh] flex flex-col justify-center items-center text-center overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600959907703-125ba1374a12?auto=format&fit=crop&w=1920&q=80')",
          }}
          initial={{ scale: 1.2, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
        ></motion.div>
        <div className="absolute inset-0 bg-black/50"></div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-4xl md:text-6xl font-black text-white z-10"
        >
          Connect. Collaborate.{" "}
          <TypeAnimation
            sequence={["Cure.", 2000, "Inspire.", 2000, "Grow.", 2000]}
            wrapper="span"
            speed={40}
            className="text-blue-400"
            repeat={Infinity}
          />
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="text-gray-200 max-w-2xl mt-5 z-10"
        >
          Join a verified network of medical professionals, students, and
          healthcare experts. Share ideas. Advance medicine.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() =>
            document.getElementById("features").scrollIntoView({
              behavior: "smooth",
            })
          }
          className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700 z-10"
        >
          Get Started
        </motion.button>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 text-white/70"
        >
          <ChevronDown size={30} />
        </motion.div>
      </section>

      {/* ✅ Features Section */}
      <Section
        id="features"
        title="Features"
        subtitle="Empowering medical collaboration."
      >
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Secure Messaging"
            desc="Communicate privately and securely with verified peers and mentors."
            icon="💬"
          />
          <FeatureCard
            title="Case Discussions"
            desc="Share and analyze complex medical cases with top specialists."
            icon="🩺"
          />
          <FeatureCard
            title="Verified Profiles"
            desc="All professionals are verified — ensuring real, trusted connections."
            icon="✅"
          />
        </div>
      </Section>

      {/* ✅ Timeline Section */}
      <Section
        title="How It Works"
        subtitle="Simple steps to join the MediLink ecosystem."
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 mt-10">
          <TimelineStep
            number="1"
            title="Register & Verify"
            desc="Sign up and upload your valid ID for instant verification."
          />
          <TimelineStep
            number="2"
            title="Connect & Collaborate"
            desc="Find doctors, students, and healthcare institutions matching your field."
          />
          <TimelineStep
            number="3"
            title="Share & Grow"
            desc="Post cases, share research, and grow with a verified community."
          />
        </div>
      </Section>

      {/* ✅ Testimonials Section */}
      <Section title="What Professionals Say">
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="p-6 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={t.img}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-gray-800">{t.name}</h4>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">“{t.text}”</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ✅ Call to Action */}
      <motion.section
        className="relative py-24 text-center text-white overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-600"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1580281657525-1c1b6d4f5200?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-30"></div>
        <h2 className="text-4xl font-bold relative z-10 mb-4">
          Ready to Elevate Your Medical Career?
        </h2>
        <p className="text-white/90 mb-8 relative z-10">
          Join MediLink today — where verified doctors, students, and experts
          collaborate.
        </p>
        <motion.button
          whileHover={{ scale: 1.08 }}
          className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-xl shadow-md relative z-10"
        >
          Join Now
        </motion.button>
      </motion.section>
    </div>
  );
};

// ✅ Section Wrapper Component
const Section = ({ id, title, subtitle, children }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });
  return (
    <motion.section
      id={id}
      ref={ref}
      className="max-w-6xl mx-auto px-6 py-20 text-center"
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-3">{title}</h2>
      {subtitle && <p className="text-gray-600 mb-10">{subtitle}</p>}
      {children}
    </motion.section>
  );
};

// ✅ Feature Card
const FeatureCard = ({ title, desc, icon }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="p-8 rounded-2xl bg-white/60 backdrop-blur-md border border-white/30 shadow-lg"
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600 text-sm">{desc}</p>
  </motion.div>
);

// ✅ Timeline Step
const TimelineStep = ({ number, title, desc }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="flex flex-col items-center text-center max-w-xs"
  >
    <div className="text-5xl font-bold text-blue-600 mb-3">{number}</div>
    <h4 className="text-xl font-semibold text-gray-800 mb-2">{title}</h4>
    <p className="text-gray-600 text-sm">{desc}</p>
  </motion.div>
);

export default Home;
