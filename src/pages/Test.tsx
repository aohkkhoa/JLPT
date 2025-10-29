// src/pages/TestPage.tsx (đã cập nhật)

import { useState } from "react";
import { motion } from "framer-motion";
import BatchTest from "../components/test/BatchTest";
// --- THAY ĐỔI Ở ĐÂY ---
import QuizPage from "./QuizPage"; // Import component mới

export default function TestPage() {
  const [quizMode, setQuizMode] = useState<"batch" | "quiz">("batch");

  return (
    <div className="min-h-[calc(100vh-88px)] bg-gradient-to-b from-sky-50 via-pink-50 to-indigo-50 flex flex-col items-center p-4 pt-8">
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl max-w-4xl w-full text-center">
        {/* ... phần JSX cho các nút chuyển đổi không thay đổi ... */}
        <div className="flex justify-center border-b mb-6">
          <button
            onClick={() => setQuizMode("batch")}
            className={`px-6 py-2 font-semibold text-gray-600 relative transition-colors ${quizMode === "batch" ? "text-indigo-600" : "hover:text-indigo-500"
              }`}
          >
            Luyện tập
            {quizMode === "batch" && (
              <motion.div
                layoutId="testModeUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
              />
            )}
          </button>
          <button
            onClick={() => setQuizMode("quiz")}
            className={`px-6 py-2 font-semibold text-gray-600 relative transition-colors ${quizMode === "quiz" ? "text-indigo-600" : "hover:text-indigo-500"
              }`}
          >
            Kiểm tra tính điểm
            {quizMode === "quiz" && (
              <motion.div
                layoutId="testModeUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
              />
            )}
          </button>
        </div>

        {/* --- THAY ĐỔI Ở ĐÂY --- */}
        {quizMode === "batch" ? <BatchTest /> : <QuizPage />}
      </div>
    </div>
  );
}