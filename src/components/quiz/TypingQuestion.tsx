// src/components/quiz/TypingQuestion.tsx
import { useEffect, useRef, useState } from "react";
import type {
  Question,
  UserTypingAnswer,
  QuizHistoryItem,
  TypingAnswerResult,
} from "../../types/quiz";

/**
 * Props cho TypingQuestion
 */
interface TypingQuestionProps {
  questionData: Question;
  typingSettings: {
    checkRomaji: boolean;
    checkHiragana: boolean;
    checkKanji: boolean;
  };
  result: QuizHistoryItem | null;
  timeLeft: number | null;
  onAnswer: (userAnswer: UserTypingAnswer, meta?: { timeOut?: boolean }) => void;
  isLastQuestion?: boolean;
  isAnswered: boolean;
}

/**
 * Component TypingQuestion
 * - Dùng cho dạng typing (có thể check romaji / hiragana / kanji)
 * - Không tự quyết định đúng/sai — parent/hook là nguồn chân thật
 * - Gửi object UserTypingAnswer lên parent qua onAnswer
 */
export default function TypingQuestion({
  questionData,
  typingSettings,
  result,
  timeLeft,
  onAnswer,
  isAnswered,
}: TypingQuestionProps) {
  // local inputs người dùng
  const [userInputs, setUserInputs] = useState<UserTypingAnswer>({
    romaji: "",
    hiragana: "",
    kanji: "",
  });

  // pendingSubmit để tránh gửi nhiều lần trước khi parent cập nhật history/result
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const rollbackRef = useRef<number | null>(null);

  // refs để điều khiển focus (ưu tiên romaji, sau đó hiragana, sau đó kanji)
  const romajiRef = useRef<HTMLInputElement | null>(null);
  const kanaRef = useRef<HTMLInputElement | null>(null);
  const kanjiRef = useRef<HTMLInputElement | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus mỗi khi có question mới
  useEffect(() => {
    setUserInputs({ romaji: '', hiragana: '', kanji: '' });
    setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [questionData]);

  // Khi timeLeft về 0 => submit tự động với meta.timeOut = true
  useEffect(() => {
    if (timeLeft === 0 && !isAnswered) {
      // Gọi onAnswer với giá trị nhập hiện tại (bảo đảm lưu vào history)
      onAnswer(userInputs, { timeOut: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // reset input khi câu hỏi thay đổi
  useEffect(() => {
    setUserInputs({ romaji: "", hiragana: "", kanji: "" });
    setPendingSubmit(false);
    if (rollbackRef.current) {
      clearTimeout(rollbackRef.current);
      rollbackRef.current = null;
    }

    const t = setTimeout(() => {
      if (typingSettings.checkRomaji) {
        romajiRef.current?.focus();
      } else if (typingSettings.checkHiragana) {
        kanaRef.current?.focus();
      } else if (typingSettings.checkKanji) {
        kanjiRef.current?.focus();
      }
    }, 50);

    return () => clearTimeout(t);
  }, [questionData, typingSettings]);

  // Nếu timeLeft giảm tới 0 và parent vẫn chưa mark answered, auto submit (gửi TIME_OUT không cần vì hook xử lý TIME_OUT;
  // nhưng component có thể gửi empty so parent có thể treat as blank)
  useEffect(() => {
    if (timeLeft === 0 && !isAnswered && !pendingSubmit) {
      // gửi một payload rỗng (hook có thể hiểu) — tuỳ vào implement hook, nhưng safe để gửi empty strings
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInputs((prev) => ({ ...prev, [name]: value }));
  };

  // chuẩn hóa payload trước khi gửi
  const normalizedPayload = (): UserTypingAnswer => ({
    romaji: (userInputs.romaji ?? "").toLowerCase().trim(),
    hiragana: (userInputs.hiragana ?? "").trim(),
    kanji: (userInputs.kanji ?? "").trim(),
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isAnswered) return;
    if (pendingSubmit) return;

    const payload = normalizedPayload();
    setPendingSubmit(true);

    try {
      onAnswer(payload);

      // rollback sau 5s nếu parent không cập nhật (tránh treo UX)
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

  // helper: get input style dựa trên kết quả từ parent
  type PartKey = keyof TypingAnswerResult;
  const getInputClass = (part: PartKey) => {
    if (!isAnswered || !result) return "border-gray-300 focus:border-sky-400 focus:ring-sky-400";
    const partResult = result.results[part];
    if (partResult === null) return "border-gray-300";
    return partResult ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50 line-through";
  };

  // helper hiển thị đáp án đúng (nếu user sai)
  const renderCorrectIfWrong = (part: PartKey, _userValue: string | undefined, correctValue: string | undefined) => {
    const checked = result?.results[part];
    if (!isAnswered || checked === null) return null;
    if (checked === true) return null;
    return (
      <p className="text-left mt-1 text-sm text-red-700 font-semibold">
        Đáp án đúng: {correctValue ?? "(không có1)"}
      </p>
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-inner text-center">
        <p className="text-gray-600 mb-2 font-semibold">Dịch sang tiếng Nhật</p>

        <div className="text-3xl md:text-4xl font-bold text-indigo-700 mb-6 min-h-[4rem] flex items-center justify-center break-words">
          {questionData.questionText}
        </div>

        {timeLeft !== null && (
          <div className="text-center mb-4">
            <p
              className={`font-bold text-2xl transition-colors ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-gray-700"}`}
            >
              {timeLeft}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {typingSettings.checkHiragana && (
            <div>
              <label htmlFor="hiragana-input" className="block text-left font-medium text-gray-700 mb-1">
                Hiragana / Katakana
              </label>
              <input
                id="hiragana-input"
                name="hiragana"
                ref={kanaRef}
                type="text"
                value={userInputs.hiragana}
                onChange={handleChange}
                readOnly={isAnswered}
                autoComplete="off"
                aria-label="Hiragana input"
                placeholder="Nhập chữ kana..."
                className={`w-full p-3 border-2 rounded-lg text-lg transition-all duration-300 ${getInputClass("hiragana")}`}
              />
              {renderCorrectIfWrong("hiragana", userInputs.hiragana, questionData.correctAnswers.hiragana)}
            </div>
          )}

          {typingSettings.checkRomaji && (
            <div>
              <label htmlFor="romaji-input" className="block text-left font-medium text-gray-700 mb-1">
                Romaji
              </label>
              <input
                id="romaji-input"
                name="romaji"
                ref={romajiRef}
                type="text"
                value={userInputs.romaji}
                onChange={handleChange}
                readOnly={isAnswered}
                autoComplete="off"
                aria-label="Romaji input"
                placeholder="Nhập romaji..."
                className={`w-full p-3 border-2 rounded-lg text-lg transition-all duration-300 ${getInputClass("romaji")}`}
              />
              {renderCorrectIfWrong("romaji", userInputs.romaji, questionData.correctAnswers.romaji)}
            </div>
          )}

          {typingSettings.checkKanji && (
            <div>
              <label htmlFor="kanji-input" className="block text-left font-medium text-gray-700 mb-1">
                Kanji (nếu có)
              </label>
              <input
                id="kanji-input"
                name="kanji"
                ref={kanjiRef}
                type="text"
                value={userInputs.kanji}
                onChange={handleChange}
                readOnly={isAnswered}
                autoComplete="off"
                aria-label="Kanji input"
                placeholder="Nhập kanji..."
                className={`w-full p-3 border-2 rounded-lg text-lg transition-all duration-300 ${getInputClass("kanji")}`}
              />
              {renderCorrectIfWrong("kanji", userInputs.kanji, questionData.correctAnswers.kanji)}
            </div>
          )}
        </form>
      </div>

      <div className="mt-4">
        <button
          onClick={() => handleSubmit()}
          disabled={isAnswered || pendingSubmit}
          className={`w-full px-6 py-4 rounded-full shadow-lg transition-all font-bold text-lg ${
            isAnswered || pendingSubmit ? "bg-gray-400 text-white cursor-not-allowed" : "bg-sky-500 text-white hover:bg-sky-600"
          }`}
        >
          {pendingSubmit ? "Đang kiểm tra..." : isAnswered ? "Đang chuyển câu..." : "Kiểm tra"}
        </button>
      </div>
    </div>
  );
}
