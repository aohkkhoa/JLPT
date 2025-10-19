import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { base, dakuten, yoon } from "../../data/kana"; // Chú ý đường dẫn

// Các type, interface, và hàm tiện ích đã di chuyển cùng
type KanaSet = "base" | "dakuten" | "yoon";

interface QuizHistoryItem {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

const getFeedback = (percentage: number): { message: string; color: string } => {
  if (percentage === 100) {
    return { message: "Bạn là số 1 !! Quá đỉnh!", color: "text-green-500" };
  }
  if (percentage >= 80) {
    return { message: "Rất tốt! Cố gắng thêm chút nữa là hoàn hảo.", color: "text-green-500" };
  }
  if (percentage >= 50) {
    return { message: "Khá lắm! Bạn đã nắm được hơn một nửa rồi.", color: "text-sky-500" };
  }
  if (percentage >= 20) {
    return { message: "Cần cố gắng nhiều hơn nhé. Đừng nản lòng!", color: "text-orange-500" };
  }
  return { message: "Ôi dốt quá!! Học nhiều vào.", color: "text-red-500" };
};

// Component QuizMode
function QuizMode() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [quizState, setQuizState] = useState<"setup" | "playing" | "finished">("setup");
  const [questions, setQuestions] = useState<[string, string][]>([]);
  const [numQuestions, setNumQuestions] = useState(20);
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [selectedSets, setSelectedSets] = useState<Record<KanaSet, boolean>>({ base: true, dakuten: true, yoon: true });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const startQuiz = () => {
    let characterSet: [string, string][] = [];
    if (selectedSets.base) characterSet.push(...base as [string, string][]);
    if (selectedSets.dakuten) characterSet.push(...dakuten as [string, string][]);
    if (selectedSets.yoon) characterSet.push(...yoon as [string, string][]);

    if (characterSet.length === 0) {
      alert("Vui lòng chọn ít nhất một bảng chữ cái để kiểm tra!");
      return;
    }

    const shuffled = [...characterSet].sort(() => 0.5 - Math.random());
    const finalQuestions = shuffled.slice(0, numQuestions);

    if (finalQuestions.length === 0) {
      alert("Không có đủ câu hỏi cho lựa chọn của bạn.");
      return;
    }

    setQuestions(finalQuestions as [string, string][]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswer("");
    setIsAnswered(false);
    setHistory([]);
    setQuizState("playing");
  };

  useEffect(() => {
    if (quizState === "playing") {
      inputRef.current?.focus();
    }
  }, [currentQuestionIndex, quizState]);

  const handleAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered) {
      handleNext();
      return;
    }

    const [question, correctAnswer] = questions[currentQuestionIndex];
    const finalUserAnswer = userAnswer.toLowerCase().trim();
    const correct = finalUserAnswer === correctAnswer;

    setIsAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
    }

    setHistory(prev => [...prev, {
      question,
      correctAnswer,
      userAnswer: finalUserAnswer,
      isCorrect: correct,
    }]);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      setQuizState("finished");
    }
  };

  const handleSetSelection = (set: KanaSet) => {
    setSelectedSets(prev => ({ ...prev, [set]: !prev[set] }));
  };

  const kanaSetLabels: Record<KanaSet, string> = {
    base: "Bảng chữ cái cơ bản",
    dakuten: "Biến âm (Dakuten)",
    yoon: "Âm ghép (Yoon)",
  };

  if (quizState === "setup") {
    return (
      <div className="w-full max-w-lg mx-auto text-left">
        <h2 className="text-2xl font-bold text-indigo-600 mb-6 text-center">Cài đặt bài kiểm tra</h2>

        {/* Number of Questions */}
        <div className="mb-6">
          <label htmlFor="numQuestions" className="block text-lg font-semibold text-gray-700 mb-2">
            Số lượng câu hỏi
          </label>
          <input
            type="number"
            id="numQuestions"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-center text-xl focus:border-sky-400 focus:ring-sky-400"
            min="1"
            max={104} // Tổng số ký tự
          />
        </div>

        {/* Character Sets */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            Chọn bảng chữ cái
          </label>
          <div className="space-y-3">
            {(Object.keys(kanaSetLabels) as KanaSet[]).map(set => (
              <div key={set} className="flex items-center">
                <input
                  type="checkbox"
                  id={`set-${set}`}
                  checked={selectedSets[set]}
                  onChange={() => handleSetSelection(set)}
                  className="h-5 w-5 rounded border-gray-300 text-pink-500 focus:ring-pink-400 cursor-pointer"
                />
                <label htmlFor={`set-${set}`} className="ml-3 text-md font-medium text-gray-700 cursor-pointer">
                  {kanaSetLabels[set]}
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={startQuiz}
          className="w-full px-8 py-4 bg-gradient-to-r from-pink-400 to-sky-400 text-white rounded-full font-bold text-lg shadow-lg hover:opacity-90 transition-all"
        >
          Bắt đầu kiểm tra
        </button>
      </div>
    );
  }

  if (quizState === "finished") {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const feedback = getFeedback(percentage);

    return (
      <div className="w-full max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-2 text-indigo-600">Hoàn thành!</h2>
        <p className="text-2xl mb-2">
          Điểm của bạn:{" "}
          <span className="font-bold text-2xl text-pink-500">
            {score} / {questions.length}
          </span>
          <span className="text-xl text-gray-600 ml-2">({percentage}%)</span>
        </p>
        <p className={`text-lg font-semibold mb-6 ${feedback.color}`}>{feedback.message}</p>
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={startQuiz} // Làm lại với cài đặt cũ
            className="px-8 py-3 bg-gradient-to-r from-pink-400 to-sky-400 text-white rounded-full font-semibold shadow-lg hover:opacity-90 transition-all"
          >
            Làm lại
          </button>
          <button
            onClick={() => setQuizState("setup")} // Quay về màn hình cài đặt
            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-full font-semibold shadow-lg hover:bg-gray-300 transition-all"
          >
            Cài đặt mới
          </button>
        </div>

        <div className="bg-white/50 rounded-2xl p-4 text-left max-h-[35vh] overflow-y-auto">
          <h3 className="text-xl font-bold text-gray-700 mb-4">Xem lại bài làm</h3>
          <div className="space-y-2">
            {history.map((item, index) => (
              <div key={index} className={`p-3 rounded-lg flex items-center justify-between ${item.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center">
                  <span className={`mr-3 font-bold text-lg ${item.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {item.isCorrect ? '✓' : '✗'}
                  </span>
                  <span className="text-3xl font-bold text-indigo-700 w-16">{item.question}</span>
                  <div>
                    <div className="font-semibold text-gray-800">Đáp án đúng: {item.correctAnswer}</div>
                    {!item.isCorrect && (
                      <div className="text-sm text-red-700">
                        Bạn đã trả lời: <span className="font-semibold">{item.userAnswer || ' bỏ trống'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const [question, answer] = questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4 text-lg">
        Câu hỏi:{" "}
        <span className="font-bold">{currentQuestionIndex + 1}</span> /{" "}
        {numQuestions > questions.length ? questions.length : numQuestions}
        <span className="float-right">
          Điểm: <span className="font-bold">{score}</span>
        </span>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-inner text-center">
        <div className="text-8xl font-bold text-indigo-700 mb-6">{question}</div>
        <form onSubmit={handleAnswer}>
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
            Nhấn Enter để tiếp tục
          </div>
          {/* Nút này vẫn được giữ lại để người dùng có thể click nếu muốn */}
          <div className="mt-2">
            <button
              onClick={handleNext}
              className="w-full px-6 py-3 bg-sky-400 text-white rounded-full shadow hover:opacity-90 transition-all font-semibold"
            >
              {currentQuestionIndex === questions.length - 1
                ? "Xem kết quả"
                : "Câu tiếp theo"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Thêm dòng export ở cuối
export default QuizMode;