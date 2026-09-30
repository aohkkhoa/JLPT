// src/pages/TestPage.tsx (đã cập nhật)

import { useState } from "react";
import { motion } from "framer-motion";
import BatchTest from "../components/test/BatchTest";
// --- THAY ĐỔI Ở ĐÂY ---
import QuizPage from "./QuizPage"; // Import component mới
import MatchingGame from "../components/test/MatchingGame";

export default function TestPage() {
  const [quizMode, setQuizMode] = useState<"batch" | "quiz" | "matching">("batch");

  return (
    <div className={`${quizMode === "matching" ? "min-h-[calc(100vh-108px)] p-2 pt-0 sm:p-4 sm:pt-5" : "min-h-[calc(100vh-88px)] p-4 pt-8"} bg-gradient-to-b from-sky-50 via-pink-50 to-indigo-50 flex flex-col items-center`}>
      <div className={`bg-white/80 backdrop-blur-md rounded-3xl shadow-xl max-w-4xl w-full text-center ${quizMode === "matching" ? "px-3 py-2 sm:p-4" : "p-6"}`}>
        {/* --- Nút chuyển giữa hai chế độ --- */}
        <div className="mb-6 grid grid-cols-3 justify-center border-b">
          {([
            ["batch", "Luyện tập"],
            ["quiz", "Kiểm tra tính điểm"],
            ["matching", "Ghép cặp"],
          ] as const).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setQuizMode(mode)}
              className={`relative px-3 py-2 text-sm font-semibold text-gray-600 transition-colors sm:px-6 sm:text-base ${quizMode === mode ? "text-indigo-600" : "hover:text-indigo-500"}`}
            >
              {label}
              {quizMode === mode && (
                <motion.div
                  layoutId="testModeUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* --- Hai chế độ hiển thị song song (ẩn/hiện bằng CSS) --- */}
        <div className="relative w-full">
          <div
            className={`transition-opacity duration-300 ${quizMode === "batch" ? "opacity-100" : "opacity-0 hidden"
              }`}
          >
            <BatchTest />
          </div>

          <div
            className={`transition-opacity duration-300 ${quizMode === "quiz" ? "opacity-100" : "opacity-0 hidden"
              }`}
          >
            <QuizPage />
          </div>

          {quizMode === "matching" && <MatchingGame />}
        </div>
      </div>
    </div>
  );
}