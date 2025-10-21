import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useState, useEffect } from "react";

export default function Header() {
  const location = useLocation();
  const [hovered, setHovered] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State cho mobile menu

  const links = [
    { name: "Trang chủ", path: "/" },
    { name: "Bảng chữ cái", path: "/alphabet" },
    { name: "Từ vựng", path: "/vocabulary" },
    { name: "Ngữ pháp", path: "/grammar" },
    {
      name: "Kanji",
      path: "/kanji",
      dropdown: [
        { name: "Học theo cấp độ (N5)", path: "/kanji" },
        { name: "Học theo Bộ thủ", path: "/radicals" },
        { name: "Tra cứu Kanji", path: "#" }, // Placeholder
      ],
    },
    { name: "Flashcard", path: "/flashcard" },
    { name: "Kiểm tra Tổng hợp", path: "/test" },
  ];

  // Đóng menu mobile khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Ngăn cuộn trang nền khi menu mobile mở
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);


  const dropdownVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const mobileMenuVariants: Variants = {
    hidden: { x: "100%", opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "tween", ease: "easeOut", duration: 0.3 } },
    exit: { x: "100%", opacity: 0, transition: { type: "tween", ease: "easeIn", duration: 0.2 } },
  }

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-sky-100/80 via-pink-100/80 to-indigo-100/80 shadow-md"
      >
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
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
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 text-sky-800 font-medium">
            {links.map((item) => {
              const isActive = location.pathname === item.path;
              const isHovering = hovered === item.name;

              return (
                <motion.div
                  key={item.name}
                  onHoverStart={() => setHovered(item.name)}
                  onHoverEnd={() => setHovered(null)}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Link
                    to={item.path}
                    className={`transition-all duration-300 flex items-center gap-1 ${
                      isActive ? "text-sky-600 font-semibold" : "hover:text-pink-500"
                    }`}
                  >
                    {item.name}
                    {item.dropdown && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>

                  {(isActive || isHovering) && (
                    <motion.div
                      layoutId="underline"
                      className="absolute left-0 right-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-sky-300 via-pink-300 to-indigo-300"
                      transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    />
                  )}

                  <AnimatePresence>
                    {isHovering && item.dropdown && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute z-10 top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5"
                      >
                        <div className="py-2">
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.path}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-sky-50 hover:to-pink-50 hover:text-sky-600 font-medium transition-all duration-200"
                              onClick={() => setHovered(null)}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-sky-600 font-bold text-2xl p-2 rounded-md hover:bg-sky-100/50 transition-colors"
            >
              ☰
            </button>
          </div>
        </div>

        <div className="h-[3px] bg-gradient-to-r from-sky-200 via-pink-200 to-indigo-200 opacity-70" />
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
            />
            {/* Menu Content */}
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white z-40 md:hidden shadow-2xl"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-sky-700">Menu</h2>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-3xl text-gray-500 hover:text-sky-600 transition-colors">
                    &times;
                  </button>
                </div>
                <nav className="flex flex-col gap-6">
                  {links.map(item => (
                    <div key={item.name}>
                        {/* If it's a dropdown, just link to the main page on mobile for simplicity */}
                        <Link to={item.path} className="text-lg font-medium text-sky-800 hover:text-pink-500 transition-colors">
                            {item.name}
                        </Link>
                        {/* Optionally, you can implement a collapsible dropdown for mobile too */}
                        {item.dropdown && (
                             <div className="pl-4 mt-2 flex flex-col gap-2 border-l-2 border-sky-100">
                                {item.dropdown.map(subItem => (
                                    <Link key={subItem.name} to={subItem.path} className="text-base text-gray-600 hover:text-sky-600 transition-colors">
                                        {subItem.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}