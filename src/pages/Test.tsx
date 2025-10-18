import { useState, useEffect, useRef } from "react";
import { allRadicals } from "../pages/radicals";
import { motion } from "framer-motion";

const base = [
  ["あ", "a"],
  ["い", "i"],
  ["う", "u"],
  ["え", "e"],
  ["お", "o"],
  ["か", "ka"],
  ["き", "ki"],
  ["く", "ku"],
  ["け", "ke"],
  ["こ", "ko"],
  ["さ", "sa"],
  ["し", "shi"],
  ["す", "su"],
  ["せ", "se"],
  ["そ", "so"],
  ["た", "ta"],
  ["ち", "chi"],
  ["つ", "tsu"],
  ["て", "te"],
  ["と", "to"],
  ["な", "na"],
  ["に", "ni"],
  ["ぬ", "nu"],
  ["ね", "ne"],
  ["の", "no"],
  ["は", "ha"],
  ["ひ", "hi"],
  ["ふ", "fu"],
  ["へ", "he"],
  ["ほ", "ho"],
  ["ま", "ma"],
  ["み", "mi"],
  ["む", "mu"],
  ["め", "me"],
  ["も", "mo"],
  ["や", "ya"],
  ["ゆ", "yu"],
  ["よ", "yo"],
  ["ら", "ra"],
  ["り", "ri"],
  ["る", "ru"],
  ["れ", "re"],
  ["ろ", "ro"],
  ["わ", "wa"],
  ["を", "wo"],
  ["ん", "n"],
];

const dakuten = [
  ["が", "ga"],
  ["ぎ", "gi"],
  ["ぐ", "gu"],
  ["げ", "ge"],
  ["ご", "go"],
  ["ざ", "za"],
  ["じ", "ji"],
  ["ず", "zu"],
  ["ぜ", "ze"],
  ["ぞ", "zo"],
  ["だ", "da"],
  ["ぢ", "ji"],
  ["づ", "zu"],
  ["で", "de"],
  ["ど", "do"],
  ["ば", "ba"],
  ["び", "bi"],
  ["ぶ", "bu"],
  ["べ", "be"],
  ["ぼ", "bo"],
  ["ぱ", "pa"],
  ["ぴ", "pi"],
  ["ぷ", "pu"],
  ["ぺ", "pe"],
  ["ぽ", "po"],
];

const yoon = [
  ["きゃ", "kya"],
  ["きゅ", "kyu"],
  ["きょ", "kyo"],
  ["しゃ", "sha"],
  ["しゅ", "shu"],
  ["しょ", "sho"],
  ["ちゃ", "cha"],
  ["ちゅ", "chu"],
  ["ちょ", "cho"],
  ["にゃ", "nya"],
  ["にゅ", "nyu"],
  ["にょ", "nyo"],
  ["ひゃ", "hya"],
  ["ひゅ", "hyu"],
  ["ひょ", "hyo"],
  ["みゃ", "mya"],
  ["みゅ", "myu"],
  ["みょ", "myo"],
  ["りゃ", "rya"],
  ["りゅ", "ryu"],
  ["りょ", "ryo"],
];

const katakanaMap = (hiragana: string) => {
  return hiragana
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      // Check if it's a Hiragana character
      if (code >= 0x3041 && code <= 0x3096) {
        return String.fromCharCode(code + 0x60);
      }
      return char; // Return the same character if it's not Hiragana (like small ゃ, ゅ, ょ)
    })
    .join("");
};

type TestType = "base" | "dakuten" | "yoon" | "radical";
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

function BatchTest() {
  const [mode, setMode] = useState<"jp2en" | "en2jp">("jp2en");
  const [testType, setTestType] = useState<TestType>("radical");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<[string, string][]>([]);
  const [input, setInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [inOrder, setInOrder] = useState(false);

  const [startRange, setStartRange] = useState(1);
  const [endRange, setEndRange] = useState(10);

  const startTest = () => {
    let characterSet: [string, string][];

    if (testType === "radical") {
      // Nếu là bộ thủ, câu hỏi là hình ảnh/ký tự, câu trả lời là Hán Việt
      characterSet = allRadicals.map((r) => [r.char, r.meaning] as [string, string]);
    } else if (testType === "base") {
      characterSet = base as [string, string][];;
    } else if (testType === "dakuten") {
      characterSet = [...base, ...dakuten] as [string, string][];
    } else {
      // yoon
      characterSet = [...base, ...dakuten, ...yoon] as [string, string][];
    }

    const safeCount = Math.min(count, characterSet.length);
    let questionsToSet: [string, string][];

    if (testType === "radical" && inOrder) {
      // 1. Xác định chỉ số bắt đầu và kết thúc
      const startIndex = Math.max(0, startRange - 1);
      const endIndex = Math.min(characterSet.length, endRange);

      // Kiểm tra nếu dải không hợp lệ
      if (startIndex >= endIndex) {
        alert("Số bắt đầu phải nhỏ hơn số kết thúc.");
        setQuestions([]); // Xóa câu hỏi cũ
        return;
      }

      // 2. Cắt mảng để lấy ra các bộ thủ trong dải đã chọn
      const rangeOfRadicals = characterSet.slice(startIndex, endIndex);

      // 3. Xáo trộn các bộ thủ trong dải đó
      const shuffledRange = [...rangeOfRadicals].sort(() => Math.random() - 0.5);

      // 4. Lấy ra số lượng câu hỏi mong muốn từ dải đã xáo trộn
      const finalCount = Math.min(count, shuffledRange.length);
      questionsToSet = shuffledRange.slice(0, finalCount);

    } else {
      // Logic cũ cho việc lấy ngẫu nhiên trên toàn bộ danh sách
      const shuffledSet = [...characterSet].sort(() => Math.random() - 0.5);
      questionsToSet = shuffledSet.slice(0, safeCount);
    }
    setQuestions(questionsToSet);
    setInput("");
    setShowAnswer(false);
  };

  const checkAnswers = () => {
    setShowAnswer(true);
  };

  const all =
    testType === "radical"
      ? allRadicals
      : testType === "base"
        ? base
        : testType === "dakuten"
          ? [...base, ...dakuten]
          : [...base, ...dakuten, ...yoon];

  const testTypeLabels: Record<TestType, string> = {
    radical: "Bộ thủ",
    base: "Cơ bản",
    dakuten: "Biến âm",
    yoon: "Âm ghép",
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-700 mb-6">
        🧠 Luyện tập theo nhóm
      </h1>

      {/* Mode: JP -> EN or EN -> JP */}
      <div className={`flex justify-center gap-4 mb-4 ${testType === 'radical' ? 'hidden' : ''}`}>
        <button
          onClick={() => setMode("jp2en")}
          className={`px-4 py-2 rounded-full font-semibold shadow-md transition-all ${mode === "jp2en"
              ? "bg-sky-300 text-white"
              : "bg-white text-gray-600 hover:bg-sky-50"
            }`}
        >
          🇯🇵 → 🇺🇸
        </button>
        <button
          onClick={() => setMode("en2jp")}
          className={`px-4 py-2 rounded-full font-semibold shadow-md transition-all ${mode === "en2jp"
              ? "bg-sky-300 text-white"
              : "bg-white text-gray-600 hover:bg-sky-50"
            }`}
        >
          🇺🇸 → 🇯🇵
        </button>
      </div>

      {/* Test Type Selection */}
      <div className="flex justify-center gap-2 mb-4 border-b pb-4">
        {(Object.keys(testTypeLabels) as TestType[]).map((type) => (
          <button
            key={type}
            onClick={() => setTestType(type)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm transition-all ${testType === type
                ? "bg-pink-300 text-white"
                : "bg-white text-gray-500 hover:bg-pink-50"
              }`}
          >
            {testTypeLabels[type]}
          </button>
        ))}
      </div>

      {/* --- CÀI ĐẶT BÀI KIỂM TRA --- */}
      <div className="flex flex-col items-center gap-4 mb-4">
        {/* Dòng 1: Số lượng câu hỏi & Lựa chọn học theo thứ tự */}
        <div className="flex items-end justify-center gap-4">
          <div className="flex flex-col items-center">
            <label htmlFor="questionCount" className="text-sm text-gray-600 mb-1">Số câu hỏi</label>
            <input
              id="questionCount"
              type="number"
              min={1}
              max={all.length}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-24 text-center p-2 rounded-lg border border-gray-300"
            />
          </div>
          <div className={`flex items-center gap-2 pb-2 ${testType !== 'radical' ? 'hidden' : ''}`}>
            <input
              type="checkbox"
              id="inOrder"
              checked={inOrder}
              onChange={(e) => setInOrder(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-pink-400 focus:ring-pink-300"
            />
            <label htmlFor="inOrder" className="text-sm text-gray-600">Chọn khoảng</label>
          </div>
        </div>

        {/* Dòng 2: Chọn khoảng (chỉ hiện khi cần) */}
        {testType === 'radical' && inOrder && (
          <div className="flex items-end justify-center gap-4">
            <div className="flex flex-col items-center">
              <label htmlFor="startRange" className="text-sm text-gray-600 mb-1">Từ bộ số</label>
              <input
                id="startRange"
                type="number"
                min={1}
                max={all.length}
                value={startRange}
                onChange={(e) => setStartRange(Number(e.target.value))}
                className="w-24 text-center p-2 rounded-lg border border-gray-300"
              />
            </div>
            <div className="flex flex-col items-center">
              <label htmlFor="endRange" className="text-sm text-gray-600 mb-1">Đến bộ số</label>
              <input
                id="endRange"
                type="number"
                min={1}
                max={all.length}
                value={endRange}
                onChange={(e) => setEndRange(Number(e.target.value))}
                className="w-24 text-center p-2 rounded-lg border border-gray-300"
              />
            </div>
          </div>
        )}
      </div>

      {/* Nút Bắt đầu */}
      <div className="flex justify-center mb-4">
        <button
          onClick={startTest}
          className="px-6 py-2 bg-gradient-to-r from-pink-300 via-sky-300 to-indigo-300 text-white rounded-full font-semibold shadow-md hover:opacity-90 transition-all"
        >
          Bắt đầu
        </button>
      </div>

      {/* Test Area */}
      {questions.length > 0 && (
        <div className="mt-6 w-full">
          {testType === "radical" ? (
            <div className="flex flex-wrap justify-center items-end gap-4 mb-4 min-h-[6rem]">
              {questions.map(([question, _], i) =>
                question.endsWith(".png") ? (
                  <img key={i} src={question} alt="radical" className="h-20 w-20 object-contain" />
                ) : (
                  <div key={i} className="text-6xl font-serif font-bold text-indigo-800">
                    {question}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-3xl mb-4 font-bold tracking-widest">
              {(mode === "jp2en"
                ? questions.map((q) => q[0])
                : questions.map((q) => q[1])
              ).map((char, index) => (
                <span key={index}>{char}</span>
              ))}
            </div>
          )}

          <input
            type="text"
            placeholder={testType === 'radical' ? "Nhập tên Hán Việt, cách nhau bằng dấu cách..." : "Nhập đáp án cách nhau bằng dấu cách..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full text-center p-2 border border-gray-300 rounded-lg text-lg"
            disabled={showAnswer}
          />

          <div className="mt-4 flex justify-center gap-4 mb-4">
            {!showAnswer ? (
              <button
                onClick={checkAnswers}
                className="px-6 py-2 bg-sky-300 text-white rounded-full shadow hover:opacity-90 transition-all"
              >
                Xem đáp án
              </button>
            ) : (
              <button
                onClick={startTest}
                className="px-6 py-2 bg-pink-300 text-white rounded-full shadow hover:opacity-90 transition-all"
              >
                Làm lại
              </button>
            )}
          </div>

          {/* Answers */}
          {showAnswer && (
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-lg">
              {questions.map(([question, answer], i) =>
                testType === "radical" ? (
                  <div key={i} className="p-2 rounded-lg bg-green-200 text-green-800 font-semibold">
                    {/* {question.endsWith(".png") ? (
                       <img src={question} alt="radical" className="h-10 w-10 mx-auto object-contain" />
                    ) : (
                      <div className="font-bold text-2xl">{answer}</div>
                    )} */}
                    <div>{answer}</div>
                  </div>
                ) : (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-lg font-semibold bg-sky-200 text-sky-800"
                  >
                    {mode === "jp2en" ? answer : `${question} / ${katakanaMap(question)}`}
                  </span>
                )
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function TestPage() {
  const [quizMode, setQuizMode] = useState<"batch" | "quiz">("batch");

  return (
    <div className="min-h-[calc(100vh-88px)] bg-gradient-to-b from-sky-50 via-pink-50 to-indigo-50 flex flex-col items-center p-4 pt-8">
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl max-w-4xl w-full text-center">
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

        {quizMode === "batch" ? <BatchTest /> : <QuizMode />}
      </div>
    </div>
  );
}
