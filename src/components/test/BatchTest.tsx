import { useState, useRef, useEffect } from "react";
import { allRadicals } from "../../pages/radicals"; // Chú ý đường dẫn có thể cần thay đổi
import { base_hira, base_kata, dakuten, yoon } from "../../data/kana"; // Chú ý đường dẫn

// Dán katakanaMap vào đây
const katakanaMap = (hiragana: string) => {
  return hiragana
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 0x3041 && code <= 0x3096) {
        return String.fromCharCode(code + 0x60);
      }
      return char;
    })
    .join("");
};

// Dán type vào đây
type TestType = "base" | "dakuten" | "yoon" | "radical";

// Dán function component vào đây
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

  const [activeTooltipIndex, setActiveTooltipIndex] = useState<number | null>(null);

  const testAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hàm này sẽ được gọi mỗi khi có cú click chuột
    const handleClickOutside = (event: MouseEvent) => {
      // Nếu không có tooltip nào đang mở thì không làm gì cả
      if (activeTooltipIndex === null) {
        return;
      }

      // Kiểm tra xem ref đã được gán chưa và cú click có nằm ngoài phần tử được ref trỏ tới không
      if (testAreaRef.current && !testAreaRef.current.contains(event.target as Node)) {
        // Nếu click ra ngoài, đóng tooltip
        setActiveTooltipIndex(null);
      }
    };

    // Thêm event listener vào document
    document.addEventListener("mousedown", handleClickOutside);

    // Hàm dọn dẹp: gỡ bỏ event listener khi component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeTooltipIndex]); // Dependency array: useEffect sẽ chạy lại nếu activeTooltipIndex thay đổi

  const startTest = () => {
    let characterSet: [string, string][];

    if (testType === "radical") {
      characterSet = allRadicals.map((r) => [r.char, r.hanViet + ": " + r.meaning] as [string, string]);
    } else if (testType === "base") {
      characterSet = [...base_kata, ...base_hira] as [string, string][];
    } else if (testType === "dakuten") {
      characterSet = [...base_kata, ...base_hira, ...dakuten] as [string, string][];
    } else {
      characterSet = [...base_kata, ...base_hira, ...dakuten, ...yoon] as [string, string][];
    }

    const safeCount = Math.min(count, characterSet.length);
    let questionsToSet: [string, string][];

    if (testType === "radical" && inOrder) {
      const startIndex = Math.max(0, startRange - 1);
      const endIndex = Math.min(characterSet.length, endRange);

      if (startIndex >= endIndex) {
        alert("Số bắt đầu phải nhỏ hơn số kết thúc.");
        setQuestions([]);
        return;
      }
      const rangeOfRadicals = characterSet.slice(startIndex, endIndex);
      const shuffledRange = [...rangeOfRadicals].sort(() => Math.random() - 0.5);
      const finalCount = Math.min(count, shuffledRange.length);
      questionsToSet = shuffledRange.slice(0, finalCount);

    } else {
      const shuffledSet = [...characterSet].sort(() => Math.random() - 0.5);
      questionsToSet = shuffledSet.slice(0, safeCount);
    }
    setQuestions(questionsToSet);
    setInput("");
    setShowAnswer(false);
    setActiveTooltipIndex(null);
  };

  const checkAnswers = () => {
    setShowAnswer(true);
  };

  const all =
    testType === "radical"
      ? allRadicals
      : testType === "base"
        ? base_hira
        : testType === "dakuten"
          ? [...base_hira, ...dakuten]
          : [...base_hira, ...dakuten, ...yoon];

  const testTypeLabels: Record<TestType, string> = {
    radical: "Bộ thủ",
    base: "Cơ bản",
    dakuten: "Biến âm",
    yoon: "Âm ghép",
  };

  const handleCharacterClick = (index: number) => {
    // Nếu click vào chính chữ đang hiển thị tooltip, hãy ẩn nó đi.
    // Ngược lại, hiển thị tooltip cho chữ được click.
    setActiveTooltipIndex(prevIndex => (prevIndex === index ? null : index));
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
              {questions.map(([question, answer], i) => (
                // Bọc mỗi item trong một div relative để định vị tooltip
                <div
                  key={i}
                  className="relative cursor-pointer"
                  onClick={() => handleCharacterClick(i)}
                >
                  {question.endsWith(".png") ? (
                    <img src={question} alt="radical" className="h-20 w-20 object-contain" />
                  ) : (
                    <div ref={testAreaRef}  className="text-6xl font-serif font-bold tracking-wider text-indigo-800">
                      {question}
                    </div>
                  )}
                  {/* Tooltip hiển thị có điều kiện */}
                  {activeTooltipIndex === i && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md shadow-lg z-10 whitespace-nowrap">
                      {answer}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-3xl mb-4 font-bold tracking-widest">
              {questions.map(([question, answer], i) => {
                const displayChar = mode === 'jp2en' ? question : answer;
                const tooltipText = mode === 'jp2en' ? answer : `${question} / ${katakanaMap(question)}`;

                return (
                  // Bọc mỗi item trong một div relative để định vị tooltip
                  <div
                    key={i}
                    className="relative cursor-pointer"
                    onClick={() => handleCharacterClick(i)}
                  >
                    <span>{displayChar}</span>
                    {/* Tooltip hiển thị có điều kiện */}
                    {activeTooltipIndex === i && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md shadow-lg z-10 whitespace-nowrap">
                        {tooltipText}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
                      </div>
                    )}
                  </div>
                );
              })}
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

// Thêm dòng export ở cuối
export default BatchTest;