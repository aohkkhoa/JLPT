import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Header() {
  const location = useLocation();
  const [hovered, setHovered] = useState<string | null>(null);

  const links = [
    { name: "Trang chủ", path: "/" },
    { name: "Bảng chữ cái", path: "/alphabet" },
    { name: "Từ vựng", path: "/vocabulary" },
    { name: "Ngữ pháp", path: "/grammar" },
    { name: "Kanji", path: "/kanji" },
    { name: "Flashcard", path: "/flashcard" },
    { name: "Kiểm tra Tổng hợp", path: "/test" },
  ];

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-sky-100/80 via-pink-100/80 to-indigo-100/80 shadow-md"
    >
      <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 3 }}
          className="flex items-center gap-2 select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-300 via-pink-300 to-indigo-300 shadow-lg shadow-sky-200 flex items-center justify-center font-bold text-white text-xl">
            JP
          </div>
          <h1 className="text-xl font-bold text-sky-700 drop-shadow-sm tracking-wide">
            JLPT Learner
          </h1>
        </motion.div>

        {/* Navigation */}
        <nav className="hidden md:flex gap-6 text-sky-800 font-medium">
          {links.map((item) => {
            const isActive = location.pathname === item.path;
            const isHover = hovered === item.name;

            return (
              <motion.div
                key={item.name}
                onHoverStart={() => setHovered(item.name)}
                onHoverEnd={() => setHovered(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Link
                  to={item.path}
                  className={`transition-all duration-300 ${
                    isActive
                      ? "text-sky-600 font-semibold"
                      : "hover:text-pink-500"
                  }`}
                >
                  {item.name}
                </Link>

                {/* Underline animation */}
                {(isActive || isHover) && (
                  <motion.div
                    layoutId="underline"
                    className="absolute left-0 right-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-sky-300 via-pink-300 to-indigo-300"
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  />
                )}
              </motion.div>
            );
          })}
        </nav>

        {/* Mobile menu icon */}
        <div className="md:hidden text-sky-600 font-bold text-2xl">☰</div>
      </div>

      {/* Soft bottom shadow */}
      <div className="h-[3px] bg-gradient-to-r from-sky-200 via-pink-200 to-indigo-200 opacity-70" />
    </motion.header>
  );
}
