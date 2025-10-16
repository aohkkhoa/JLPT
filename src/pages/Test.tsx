import { useState } from "react";

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

const all = [...base, ...dakuten];

const katakanaMap = (s: string) => String.fromCharCode(s.charCodeAt(0) + 0x60);

export default function TestBatch() {
  const [mode, setMode] = useState<"jp2en" | "en2jp">("jp2en");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<[string, string][]>([]);
  const [input, setInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const startTest = () => {
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, count));
    setInput("");
    setShowAnswer(false);
  };

  const checkAnswers = () => {
    setShowAnswer(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-pink-50 to-indigo-50 flex flex-col items-center justify-center">
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-xl max-w-3xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-700 mb-6">
          🧠 Kana Batch Test
        </h1>

        {/* Mode */}
        <div className="flex justify-center gap-4 mb-4">
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

        {/* Số chữ */}
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

        {/* Batch hiển thị */}
        {questions.length > 0 && (
          <div className="mt-6">
            <div className="text-3xl mb-4 font-bold">
              {mode === "jp2en"
                ? questions.map((q) => q[0]).join("  ")
                : questions.map((q) => q[1]).join("  ")}
            </div>

            <input
              type="text"
              placeholder="Nhập đáp án cách nhau bằng dấu cách..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full text-center p-2 border border-gray-300 rounded-lg text-lg"
              disabled={showAnswer}
            />

            <div className="mt-4 flex justify-center gap-4">
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

            {/* Chỉ hiển thị đáp án */}
            {showAnswer && (
              <div className="mt-4 flex flex-wrap justify-center gap-3 text-lg">
                {questions.map(([jp, romaji], i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-lg font-semibold bg-sky-200 text-sky-800"
                  >
                    {mode === "jp2en" ? romaji : `${jp} / ${katakanaMap(jp)}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
