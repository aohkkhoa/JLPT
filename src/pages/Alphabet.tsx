import { useState } from "react";
import { motion } from "framer-motion";
import { base_hira, base_kata,  dakuten, yoon } from "../data/kana";



const Alphabet = () => {
  const [tab, setTab] = useState<"hiragana" | "katakana">("hiragana");

  const data = tab === "hiragana" ? base_hira : base_kata;

  return (
    <div className="min-h-screen from-sky-50 via-pink-50 to-indigo-50 py-12 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-sky-700 mb-6 drop-shadow-md">
          Bảng chữ cái tiếng Nhật (
          {tab === "hiragana" ? "Hiragana" : "Katakana"})
        </h1>

        {/* Tab chọn bảng */}
        <div className="flex justify-center gap-4 mb-8">
          {["hiragana", "katakana"].map((t) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTab(t as any)}
              className={`px-6 py-2 rounded-full shadow-md font-semibold transition-all duration-300 ${
                tab === t
                  ? "bg-gradient-to-r from-sky-300 via-pink-300 to-indigo-300 text-white"
                  : "bg-white text-sky-600 hover:bg-pink-50"
              }`}
            >
              {t === "hiragana" ? "Hiragana" : "Katakana"}
            </motion.button>
          ))}
        </div>

        {/* Bảng chính */}
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-4 justify-center">
          {data.map(([jp, romaji]) => (
            <motion.div
              key={jp}
              whileHover={{ scale: 1.1, rotate: 3 }}
              className="p-3 rounded-2xl shadow-md bg-white bg-opacity-80 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-3xl text-pink-500 font-bold drop-shadow-sm">
                {jp}
              </div>
              <div className="text-sky-700 text-sm">{romaji}</div>
            </motion.div>
          ))}
        </div>

        {/* Biến âm */}
        <h2 className="text-2xl font-bold text-sky-700 mt-12 mb-4 drop-shadow-sm">
          Biến âm (Dakuten)
        </h2>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
          {dakuten.map(([jp, romaji]) => (
            <motion.div
              key={jp}
              whileHover={{ scale: 1.1 }}
              className="p-2 rounded-xl bg-gradient-to-br from-pink-100 to-sky-100 shadow"
            >
              <div className="text-2xl font-bold text-pink-600">{jp}</div>
              <div className="text-sky-700 text-xs">{romaji}</div>
            </motion.div>
          ))}
        </div>

        {/* Âm ghép */}
        <h2 className="text-2xl font-bold text-sky-700 mt-12 mb-4 drop-shadow-sm">
          Âm ghép (Yoon)
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3 justify-center">
          {yoon.map(([jp, romaji]) => (
            <motion.div
              key={jp}
              whileHover={{ scale: 1.1 }}
              className="p-2 rounded-xl bg-gradient-to-br from-indigo-100 to-pink-100 shadow"
            >
              <div className="text-2xl font-bold text-indigo-600">{jp}</div>
              <div className="text-sky-700 text-xs">{romaji}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alphabet;
