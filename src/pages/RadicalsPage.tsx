import { motion } from "framer-motion";
import { allRadicals } from "./radicals";

export default function RadicalsPage() {
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
    </div>
  );
}