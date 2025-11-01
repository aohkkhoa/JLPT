// src/components/quiz/QuizResults.tsx
import type { QuizHistoryItem } from "../../types/quiz";
import { getFeedback } from "../../utils/quizHelpers";

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  history: QuizHistoryItem[];
  onRestart: () => void; // bắt đầu lại với cài đặt cũ
  onNewSetup: () => void; // quay về màn hình cài đặt mới
  correctButTimedOut: number; // số câu đúng nhưng hết giờ
}

/**
 * QuizResults
 * - Hiển thị điểm, feedback tổng quan và danh sách chi tiết history
 * - Toàn bộ chú thích và text bằng tiếng Việt
 */
export default function QuizResults({ score, totalQuestions, history, onRestart, onNewSetup }: QuizResultsProps) {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const feedback = getFeedback(percentage);
  const correctButTimedOut = history.filter(item => item.isCorrect && item.timedOut).length;


  // Hiển thị giá trị người dùng trả lời (xử lý TIME_OUT / rỗng)
  const renderUserAnswer = (answer?: string | null) => {
    if (answer === "TIME_OUT") return <span className="italic opacity-75">(hết giờ)</span>;
    if (!answer || answer.trim() === "") return <span className="italic opacity-75">(bỏ trống)</span>;
    return <span>{answer}</span>;
  };
  const getResultColor = (result: QuizHistoryItem) => {
    if (result.timedOut && result.isCorrect) {
      return "bg-yellow-100 border-yellow-400"; // 🟡 đúng nhưng hết giờ
    }
    if (result.isCorrect) {
      return "bg-green-100 border-green-400"; // ✅ đúng
    }
    return "bg-red-100 border-red-400"; // ❌ sai
  };
  // Hiển thị 1 phần (Romaji / Hiragana / Kanji) với màu dựa trên kết quả
  const renderPart = (label: string, userValue?: string | null, correctValue?: string | null, partResult?: boolean | null) => {
    const isChecked = partResult !== null && typeof partResult !== "undefined";
    const isOk = partResult === true;
    const baseClass = isChecked ? (isOk ? "text-green-700" : "text-red-700 line-through") : "text-gray-700";

    return (
      <div className="mt-1">
        <span className="font-medium text-sm text-gray-600 mr-2">{label}</span>
        <span className={`font-semibold ${baseClass}`}>{renderUserAnswer(userValue ?? "")}</span>
        {!isOk && isChecked && correctValue && (
          <span className="ml-2 text-sm text-gray-500">→ đúng: <span className="font-medium">{correctValue}</span></span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-2 text-indigo-600">Hoàn thành!</h2>

      <p className="text-2xl mb-2">
        Điểm của bạn:{" "}
        <span className="font-bold text-2xl text-pink-500">
          {score} / {totalQuestions}
        </span>
        <span className="text-xl text-gray-600 ml-2">({percentage}%)</span>
      </p>

      <p className={`text-lg font-semibold mb-6 ${feedback.color}`}>{feedback.message}</p>
      {/* Thêm dòng thông tin chi tiết */}
      {correctButTimedOut > 0 && (
        <p className="text-yellow-600 mt-2 font-medium">
          ⚠️ Có {correctButTimedOut} câu đúng nhưng hết giờ – không được tính điểm.
        </p>
      )}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-gradient-to-r from-pink-400 to-sky-400 text-white rounded-full font-semibold shadow-lg hover:opacity-90 transition-all"
        >
          Làm lại
        </button>
        <button
          onClick={onNewSetup}
          className="px-8 py-3 bg-gray-200 text-gray-700 rounded-full font-semibold shadow-lg hover:bg-gray-300 transition-all"
        >
          Cài đặt mới
        </button>
      </div>

      <div className="bg-white/50 rounded-2xl p-4 text-left max-h-[50vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-700 mb-4">Xem lại bài làm</h3>

        {history.length === 0 ? (
          <p className="text-center text-gray-500">Không có lịch sử bài làm.</p>
        ) : (
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border-2 ${getResultColor(item)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <span
                      className={`text-2xl font-bold ${item.timedOut && item.isCorrect
                        ? "text-yellow-500"
                        : item.isCorrect
                          ? "text-green-500"
                          : "text-red-500"
                        }`}
                    >
                      {item.isCorrect ? "✓" : "✗"}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800 break-words">
                        <span className="text-gray-500 font-medium">#{idx + 1} Câu hỏi: </span>
                        {item.question}
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">Đáp án (kanji / kana / romaji): </span>
                      <span className="font-semibold text-green-700">
                        {item.correctAnswer.kanji ? `${item.correctAnswer.kanji} / ` : ""}
                        {item.correctAnswer.hiragana} / {item.correctAnswer.romaji}
                      </span>
                    </p>

                    <div className="mt-2">
                      {item.results.hiragana !== null &&
                        renderPart(
                          "Hiragana",
                          item.userAnswer.hiragana,
                          item.correctAnswer.hiragana,
                          item.results.hiragana
                        )}
                      {item.results.romaji !== null &&
                        renderPart(
                          "Romaji",
                          item.userAnswer.romaji,
                          item.correctAnswer.romaji,
                          item.results.romaji
                        )}
                      {typeof item.results.kanji !== "undefined" &&
                        item.results.kanji !== null &&
                        renderPart(
                          "Kanji",
                          item.userAnswer.kanji,
                          item.correctAnswer.kanji ?? "",
                          item.results.kanji
                        )}

                      {item.results.hiragana === null &&
                        item.results.romaji === null &&
                        (typeof item.results.kanji === "undefined" ||
                          item.results.kanji === null) && (
                          <div className="mt-1 text-sm text-gray-700">
                            <span className="font-medium">Bạn trả lời: </span>
                            <span className="font-semibold">
                              {renderUserAnswer(
                                item.userAnswer.romaji ||
                                item.userAnswer.hiragana ||
                                item.userAnswer.kanji
                              )}
                            </span>
                          </div>
                        )}

                      {item.timedOut && (
                        <p className="text-xs italic text-yellow-700 mt-1">
                          (Trả lời khi hết giờ)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
