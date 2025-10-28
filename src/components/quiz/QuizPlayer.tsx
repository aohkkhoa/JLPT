// src/components/quiz/QuizPlayer.tsx

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Props mà component này cần
interface QuizPlayerProps {
  question: string;
  answer: string;
  questionNumber: number;
  totalQuestions: number;
  score: number;
  onAnswer: (userAnswer: string) => boolean; // Hàm trả về true nếu đúng, false nếu sai
  onNext: () => void;
}

export default function QuizPlayer({
  question,
  answer,
  questionNumber,
  totalQuestions,
  score,
  onAnswer,
  onNext,
}: QuizPlayerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Focus vào input mỗi khi chuyển câu hỏi
  useEffect(() => {
    inputRef.current?.focus();
  }, [questionNumber]);

  // Reset trạng thái của component khi chuyển câu hỏi
  useEffect(() => {
    setUserAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered) {
      onNext();
      return;
    }
    const result = onAnswer(userAnswer);
    setIsCorrect(result);
    setIsAnswered(true);
  };

  // --- JSX được copy từ file QuizMode cũ ---
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4 text-lg">
        Câu hỏi:{" "}
        <span className="font-bold">{questionNumber}</span> /{" "}
        {totalQuestions}
        <span className="float-right">
          Điểm: <span className="font-bold">{score}</span>
        </span>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-inner text-center">
        <div className="text-8xl font-bold text-indigo-700 mb-6">{question}</div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            ref={inputRef}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className={`w-full p-3 border-2 rounded-lg text-center text-xl transition-all duration-300 ${isAnswered
              ? isCorrect
                ? "border-green-400 bg-green-50"
                : "border-red-400 bg-red-50"
              : "border-gray-300 focus:border-sky-400 focus:ring-sky-400"
              }`}
            placeholder="Nhập phiên âm romaji"
            readOnly={isAnswered}
          />
        </form>
      </div>

      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <div
            className={`p-3 rounded-lg text-center font-semibold ${isCorrect
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}
          >
            {isCorrect ? "Chính xác!" : `Sai rồi! Đáp án đúng là: ${answer}`}
          </div>
          <div className="mt-2 text-center text-sm text-gray-500">
            Nhấn Enter hoặc click nút bên dưới để tiếp tục
          </div>
          <div className="mt-2">
            <button
              onClick={onNext}
              className="w-full px-6 py-3 bg-sky-400 text-white rounded-full shadow hover:opacity-90 transition-all font-semibold"
            >
              {questionNumber === totalQuestions
                ? "Xem kết quả"
                : "Câu tiếp theo"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}