// src/components/quiz/KanaTypingQuestion.tsx
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Question, QuizHistoryItem } from "../../types/quiz";

interface KanaTypingQuestionProps {
  questionData: Question;
  questionNumber: number;
  totalQuestions: number;
  score: number;
  onAnswer: (userAnswer: string) => void; // gửi romaji đã chuẩn hoá lên parent/hook
  timeLeft: number | null;
  isAnswered: boolean; // parent báo đã trả lời cho câu này chưa
  result: QuizHistoryItem | null; // lịch sử cho câu hiện tại (nếu có)
}

/**
 * KanaTypingQuestion
 * - Dùng cho dạng kiểm tra kana (1 ô romaji)
 * - Không tự chấm; parent (hook) là nguồn chân thực (isAnswered/result)
 * - Ghi chú toàn bộ bằng tiếng Việt
 */
export default function KanaTypingQuestion({
  questionData,
  questionNumber,
  totalQuestions,
  score,
  onAnswer,
  timeLeft,
  isAnswered,
  result,
}: KanaTypingQuestionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // input của user (romaji)
  const [userAnswer, setUserAnswer] = useState<string>("");

  // pending để tránh double submit trước khi parent xử lý
  const [pendingSubmit, setPendingSubmit] = useState<boolean>(false);
  const rollbackRef = useRef<number | null>(null);

  // focus mỗi khi chuyển câu
  useEffect(() => {
    inputRef.current?.focus();
  }, [questionNumber]);

  // reset khi questionData thay đổi
  useEffect(() => {
    setUserAnswer("");
    setPendingSubmit(false);
    if (rollbackRef.current) {
      clearTimeout(rollbackRef.current);
      rollbackRef.current = null;
    }
    inputRef.current?.focus();
  }, [questionData]);

  // Lấy trạng thái đúng/sai từ prop result (nếu có)
  const isCorrect = result ? result.isCorrect : null;

  // Xử lý submit (Enter hoặc click)
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    // Nếu parent đã báo answered => nút/Enter lúc này đóng vai trò next, component này chỉ gửi lên parent
    if (isAnswered) {
      return;
    }

    if (pendingSubmit) return;

    const normalized = userAnswer.toLowerCase().trim();
    setPendingSubmit(true);

    try {
      onAnswer(normalized);

      // rollback phòng hờ parent không cập nhật trong 5s
      rollbackRef.current = window.setTimeout(() => {
        setPendingSubmit(false);
        rollbackRef.current = null;
      }, 5000);
    } catch (err) {
      setPendingSubmit(false);
      if (rollbackRef.current) {
        clearTimeout(rollbackRef.current);
        rollbackRef.current = null;
      }
      throw err;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4 text-lg">
        <span>Câu hỏi: </span>
        <span className="font-bold">{questionNumber}</span>
        <span> / {totalQuestions}</span>
        <span className="float-right">
          Điểm: <span className="font-bold">{score}</span>
        </span>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-inner text-center">
        {/* Hiển thị ký tự kana hoặc văn bản question */}
        <div className="text-8xl font-bold text-indigo-700 mb-6 break-words">
          {questionData.questionText}
        </div>

        {timeLeft !== null && (
          <div className="text-center mb-4">
            <p
              className={`font-bold text-2xl transition-colors ${
                timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-gray-700"
              }`}
            >
              {timeLeft}
            </p>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e)}>
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Nhập phiên âm romaji"
            aria-label="Nhập romaji"
            readOnly={isAnswered || pendingSubmit}
            className={`w-full p-3 border-2 rounded-lg text-center text-xl transition-all duration-300 ${
              isAnswered
                ? isCorrect === null
                  ? "border-gray-300 bg-gray-50"
                  : isCorrect
                  ? "border-green-400 bg-green-50"
                  : "border-red-400 bg-red-50"
                : "border-gray-300 focus:border-sky-400 focus:ring-sky-400"
            }`}
          />
        </form>
      </div>

      <div className="mt-4 min-h-[96px]">
        {isAnswered ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div
              className={`p-3 rounded-lg text-center font-semibold mb-2 ${
                isCorrect === null
                  ? "bg-gray-100 text-gray-800"
                  : isCorrect
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isCorrect === null
                ? "Đã gửi — chờ kết quả..."
                : isCorrect
                ? "Chính xác!"
                : `Sai rồi! Đáp án đúng là: ${questionData.correctAnswers.romaji}`}
            </div>

            {pendingSubmit && <p className="text-center text-gray-500">Đang gửi kết quả...</p>}

            <div className="mt-2">
              <p className="text-center text-sm text-gray-500">Nhấn "Câu tiếp theo" hoặc chờ tự chuyển.</p>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => handleSubmit()}
            disabled={pendingSubmit}
            className={`w-full px-6 py-3 bg-sky-400 text-white rounded-full shadow hover:opacity-90 transition-all font-semibold ${
              pendingSubmit ? "opacity-80 cursor-wait" : ""
            }`}
          >
            {pendingSubmit ? "Đang kiểm tra..." : "Kiểm tra"}
          </button>
        )}
      </div>
    </div>
  );
}
