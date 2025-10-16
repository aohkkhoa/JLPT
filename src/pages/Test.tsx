import { useState } from "react";
import { allRadicals } from "../pages/radicals";

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

export default function TestBatch() {
  const [mode, setMode] = useState<"jp2en" | "en2jp">("jp2en");
  const [testType, setTestType] = useState<TestType>("radical");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<[string, string][]>([]);
  const [input, setInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [inOrder, setInOrder] = useState(false);

  const startTest = () => {
    let characterSet: [string, string][];

    if (testType === "radical") {
      // Nếu là bộ thủ, câu hỏi là hình ảnh/ký tự, câu trả lời là Hán Việt
      characterSet = allRadicals.map((r) => [r.image || r.char, r.hanViet]);
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
      const selection = characterSet.slice(0, safeCount);
      const shuffledSelection = [...selection].sort(() => Math.random() - 0.5);
      questionsToSet = shuffledSelection;
    } else {
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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-pink-50 to-indigo-50 flex flex-col items-center justify-center">
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-xl max-w-3xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-700 mb-6">
          🧠 Kana Batch Test
        </h1>

        {/* Mode: JP -> EN or EN -> JP */}
        <div className={`flex justify-center gap-4 mb-4 ${testType === 'radical' ? 'hidden' : ''}`}>
          <button
            onClick={() => setMode("jp2en")}
            className={`px-4 py-2 rounded-full font-semibold shadow-md transition-all ${
              mode === "jp2en"
                ? "bg-sky-300 text-white"
                : "bg-white text-gray-600 hover:bg-sky-50"
            }`}
          >
            🇯🇵 → 🇺🇸
          </button>
          <button
            onClick={() => setMode("en2jp")}
            className={`px-4 py-2 rounded-full font-semibold shadow-md transition-all ${
              mode === "en2jp"
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
              className={`px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm transition-all ${
                testType === type
                  ? "bg-pink-300 text-white"
                  : "bg-white text-gray-500 hover:bg-pink-50"
              }`}
            >
              {testTypeLabels[type]}
            </button>
          ))}
        </div>

        {/* Number of questions */}
        <div className="flex justify-center gap-4 mb-4">
          <input
            type="number"
            min={1}
            max={all.length}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-24 text-center p-2 rounded-lg border border-gray-300"
          />
          <button
            onClick={startTest}
            className="px-6 py-2 bg-gradient-to-r from-pink-300 via-sky-300 to-indigo-300 text-white rounded-full font-semibold shadow-md hover:opacity-90 transition-all"
          >
            Bắt đầu
          </button>
        </div>

        {/* In-order learning option for radicals */}
        <div className={`flex justify-center items-center gap-2 mb-4 ${testType !== 'radical' ? 'hidden' : ''}`}>
          <input
            type="checkbox"
            id="inOrder"
            checked={inOrder}
            onChange={(e) => setInOrder(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-pink-400 focus:ring-pink-300"
          />
          <label htmlFor="inOrder" className="text-sm text-gray-600">Học theo thứ tự</label>
        </div>

        {/* Test Area */}
        {questions.length > 0 && (
          <div className="mt-6 w-full">
            {testType === "radical" ? (
              <div className="flex justify-center items-end gap-4 mb-4 h-24">
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
              <div className="text-3xl mb-4 font-bold tracking-widest">
                {mode === "jp2en"
                  ? questions.map((q) => q[0]).join("  ")
                  : questions.map((q) => q[1]).join("  ")}
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
                      {question.endsWith(".png") ? (
                         <img src={question} alt="radical" className="h-10 w-10 mx-auto object-contain" />
                      ) : (
                        <div className="font-bold text-2xl">{question}</div>
                      )}
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
      </div>
    </div>
  );
}
