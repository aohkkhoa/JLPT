import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { allRadicals } from "./radicals";
import type { Radical } from "./radicals";
export default function RadicalsPage() {
  const [selected, setSelected] = useState<Radical | null>(null);

  // Thêm useEffect để xử lý việc nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
      }
    };

    // Chỉ thêm listener khi modal đang mở
    if (selected) {
      document.addEventListener("keydown", handleKeyDown);
    }

    // Dọn dẹp listener khi component unmount hoặc khi `selected` thay đổi
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selected]); // Dependency array, effect sẽ chạy lại khi `selected` thay đổi

  return (
    <div className="min-h-[calc(100vh-88px)] bg-gradient-to-b from-indigo-50 via-sky-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-700 mb-8 text-center drop-shadow-md">
          214 Bộ thủ Kanji
        </h1>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {allRadicals.map((radical) => (
            <motion.div
              key={radical.char + radical.hanViet}
              whileHover={{ scale: 1.1, y: -5 }}
              onClick={() => setSelected(radical)}
              className="cursor-pointer p-3 rounded-2xl bg-white/80 backdrop-blur-sm shadow-md flex flex-col items-center justify-center text-center"
            >
              <div className="text-4xl font-bold text-indigo-600">
                {radical.char}
              </div>
              <div className="text-gray-800 font-semibold text-sm mt-1">{radical.hanViet}</div>
              <div className="text-gray-600 text-xs">{radical.meaning}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative"
              onClick={(e) => e.stopPropagation()} // Ngăn không cho click bên trong modal đóng modal
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-8xl font-bold text-indigo-700 mb-4">{selected.char}</div>
              <h2 className="text-3xl font-semibold text-gray-800">{selected.hanViet}</h2>
              <p className="text-gray-600 mb-4 text-lg">{selected.meaning}</p>

              {selected.image ? (
                <img src={selected.image} alt={`Minh họa cho bộ ${selected.hanViet}`} className="w-full h-48 object-contain rounded-lg bg-gray-100 p-2 mt-4" />
              ) : (
                <div className="w-full h-48 flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 mt-4">
                  (Chưa có hình ảnh)
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}