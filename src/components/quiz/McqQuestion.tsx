import { useEffect, useState } from "react";
import type { Question } from "../../types/quiz";

interface McqQuestionProps {
  questionData: Question;
  timeLeft: number | null;
  onAnswer: (selectedOption: string, meta?: { timeOut?: boolean }) => void;
  isAnswered: boolean;
  // NEW: result from parent (history item for current question) - optional
  currentResult?: {
    correctAnswer?: string; // the correct Vietnamese text (vi)
    userAnswer?: string; // what user selected (vi)
    timedOut?: boolean;
  } | null;
  onNext?: () => void;
  allowEnterAdvanceOnAnswered?: boolean;
}

export default function McqQuestion({
  questionData,
  timeLeft,
  onAnswer,
  isAnswered,
  currentResult = null,
  onNext,
  allowEnterAdvanceOnAnswered = false,
}: McqQuestionProps) {
  const options = Array.isArray(questionData?.options) ? questionData.options : [];
  const [localSelectedIdx, setLocalSelectedIdx] = useState<number | null>(null);
  const [localDisabled, setLocalDisabled] = useState(false);

  useEffect(() => {
    // reset local selection when question changes or parent resets answered
    setLocalSelectedIdx(null);
    setLocalDisabled(false);
  }, [questionData, isAnswered]);

  const handleSelect = (idx: number) => {
    // Nếu đã được parent đánh dấu là answered:
    if (isAnswered) {
      // Chỉ advance khi chế độ easy (được truyền qua prop allowEnterAdvanceOnAnswered)
      if (allowEnterAdvanceOnAnswered && typeof onNext === "function") {
        onNext();
      }
      return;
    }

    // Nếu chưa answered, bảo vệ double click bằng localDisabled
    if (localDisabled) return;

    setLocalSelectedIdx(idx);
    setLocalDisabled(true); // disable ngay để tránh double clicks trước khi parent phản hồi
    onAnswer(options[idx]);
  };


  // helper: determine classes when showing result
  const getOptionClasses = (opt: string, idx: number) => {
    const baseClass = "p-4 rounded-lg text-left font-semibold transition-all border-2";
    const enabledClass = "bg-white border-gray-200 hover:bg-sky-50 hover:border-sky-200";
    const disabledClass = "bg-gray-50 text-gray-500 cursor-not-allowed";
    // result classes
    const correctClass = "bg-green-100 border-green-400";
    const wrongClass = "bg-red-100 border-red-400 text-red-800";
    const timedOutClass = "bg-yellow-100 border-yellow-300";

    const isSelected = localSelectedIdx === idx;
    const isParentSelected = currentResult && currentResult.userAnswer === opt;

    if (!isAnswered) {
      // not yet answered: show normal enabled/disabled
      return `${baseClass} ${isAnswered || localDisabled ? disabledClass : enabledClass} ${isSelected ? "bg-sky-50 border-sky-400" : ""}`;
    }

    // If answered, use currentResult to mark correct/wrong
    const correctOpt = currentResult?.correctAnswer ?? null;
    const timedOut = !!currentResult?.timedOut;

    // If we know correct option text, compare
    if (correctOpt !== null) {
      if (opt === correctOpt) {
        // correct answer
        // if user also selected it but it was timed out, still green but maybe show border
        return `${baseClass} ${correctClass}`;
      }
      if (isParentSelected) {
        // user's selected but not correct
        // If it was timed out, show timedOutClass (or red depending on UX)
        return `${baseClass} ${timedOut ? timedOutClass : wrongClass}`;
      }
    }

    // fallback - neutral disabled style
    return `${baseClass} ${disabledClass}`;
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-inner text-center">
        <p className="text-gray-600 mb-2 font-semibold">Chọn nghĩa tiếng Việt đúng</p>

        <div className="text-3xl md:text-4xl font-bold text-indigo-700 mb-6 min-h-[4rem] flex items-center justify-center break-words">
          {questionData?.questionText ?? "— Không có câu hỏi —"}
        </div>

        {timeLeft !== null && (
          <div className="text-center mb-4">
            <p className={`font-bold text-2xl transition-colors ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-gray-700"}`}>
              {Math.max(0, timeLeft)}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={localDisabled}
              aria-pressed={localSelectedIdx === idx}
              className={getOptionClasses(opt, idx)}
            >
              <div className="text-sm text-gray-600">{String.fromCharCode(65 + idx)}.</div>
              <div className="mt-1 text-lg text-gray-800 break-words">{opt}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
