// src/components/quiz/QuizSetup.tsx
import { useState } from "react";
import type { QuizSettings, KanaSet } from "../../types/quiz";
import { ALL_LESSONS_DATA } from "../../data/minnaData";

interface QuizSetupProps {
  onStart: (settings: QuizSettings) => void;
}

/**
 * Component QuizSetup
 * - Cho phép người dùng chọn loại quiz (KANA / VOCABULARY)
 * - Chọn số lượng câu hỏi, bộ kana, bài học, độ khó, và các ô kiểm tra (romaji/hiragana/kanji)
 * - Validation trước khi gọi onStart(settings)
 *
 * Toàn bộ chú thích bằng tiếng Việt
 */
const availableLessons = Object.keys(ALL_LESSONS_DATA).map((k) => Number(k));

export default function QuizSetup({ onStart }: QuizSetupProps) {
  // --- State chung ---
  const [quizType, setQuizType] = useState<"KANA" | "VOCABULARY">("KANA");
  const [numQuestions, setNumQuestions] = useState<number>(10);

  // --- State cho KANA (có setter) ---
  const [selectedKanaSets, setSelectedKanaSets] = useState<Record<KanaSet, boolean>>({
    base: true,
    dakuten: true,
    yoon: true,
  });

  // --- State cho VOCABULARY ---
  const [selectedLessons, setSelectedLessons] = useState<number[]>([1]);

  // --- Cài đặt bổ sung ---
  const [difficulty, setDifficulty] = useState<"easy" | "hard">("easy");
  const [typingChecks, setTypingChecks] = useState({
    checkRomaji: true,
    checkHiragana: true,
    checkKanji: false,
  });

  // Thêm định dạng mới cho MCQ: VI -> JP
  const [vocabFormat, setVocabFormat] = useState<'VI_TO_JP_TYPING' | 'JP_TO_VI_MCQ' | 'VI_TO_JP_MCQ'>('VI_TO_JP_TYPING');

  // --- Handlers ---
  const toggleKanaSet = (key: KanaSet) => {
    setSelectedKanaSets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleLesson = (n: number) => {
    setSelectedLessons((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));
  };

  const handleTypingCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTypingChecks((prev) => ({ ...prev, [name]: checked }));
  };

  const handleStart = () => {
    // validation cơ bản
    if (numQuestions <= 0) {
      alert("Số lượng câu hỏi phải lớn hơn 0");
      return;
    }

    if (quizType === "KANA") {
      if (!selectedKanaSets.base && !selectedKanaSets.dakuten && !selectedKanaSets.yoon) {
        alert("Vui lòng chọn ít nhất một bộ kana (base / dakuten / yoon)");
        return;
      }
      const settings: QuizSettings = {
        quizType: "KANA",
        numQuestions: Math.max(1, Math.floor(numQuestions)),
        selectedSets: selectedKanaSets,
        difficulty,
      };
      onStart(settings);
    } else {
      // VOCABULARY
      if (selectedLessons.length === 0) {
        alert("Vui lòng chọn ít nhất một bài học");
        return;
      }

      // Nếu là dạng typing (VI -> JP typing), thì yêu cầu ít nhất 1 typing check.
      if (vocabFormat === 'VI_TO_JP_TYPING') {
        if (!typingChecks.checkRomaji && !typingChecks.checkHiragana && !typingChecks.checkKanji) {
          alert("Vui lòng chọn ít nhất một kiểu kiểm tra (Romaji / Hiragana / Kanji)");
          return;
        }
      }

      const settings: QuizSettings = {
        quizType: "VOCABULARY",
        numQuestions: Math.max(1, Math.floor(numQuestions)),
        selectedLessons,
        quizFormat: vocabFormat,
        // Chỉ include typingSettings khi định dạng là VI_TO_JP_TYPING
        ...(vocabFormat === 'VI_TO_JP_TYPING' ? { typingSettings: typingChecks } : {}),
        difficulty,
      } as QuizSettings;

      onStart(settings);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto text-left">
      <h2 className="text-2xl font-bold text-indigo-600 mb-6 text-center">Cài đặt bài kiểm tra</h2>

      {/* Chọn loại quiz */}
      <div className="flex justify-center gap-2 mb-6 p-1 bg-gray-200 rounded-full">
        <button
          onClick={() => setQuizType("KANA")}
          className={`w-1/2 py-2 rounded-full font-semibold transition-all ${quizType === "KANA" ? "bg-white text-pink-500 shadow" : "text-gray-600"}`}
        >
          Bảng chữ cái
        </button>
        <button
          onClick={() => setQuizType("VOCABULARY")}
          className={`w-1/2 py-2 rounded-full font-semibold transition-all ${quizType === "VOCABULARY" ? "bg-white text-sky-500 shadow" : "text-gray-600"}`}
        >
          Từ vựng
        </button>
      </div>

      {/* Số lượng câu hỏi */}
      <div className="mb-6">
        <label htmlFor="numQuestions" className="block text-lg font-semibold text-gray-700 mb-2">Số lượng câu hỏi</label>
        <input
          id="numQuestions"
          type="number"
          min={1}
          value={numQuestions}
          onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value || "1", 10)))}
          className="w-full p-3 border-2 border-gray-300 rounded-lg text-center text-xl focus:border-sky-400 focus:ring-sky-400"
        />
      </div>

      {/* Độ khó */}
      <div className="mb-6">
        <label className="block text-lg font-semibold text-gray-700 mb-3">Độ khó</label>
        <div className="flex justify-center gap-2 p-1 bg-gray-100 rounded-full">
          <button
            onClick={() => setDifficulty("easy")}
            className={`w-1/2 py-2 rounded-full font-semibold transition-colors ${difficulty === "easy" ? "bg-green-400 text-white shadow" : "text-gray-600"}`}
          >
            Dễ (Không tính giờ)
          </button>
          <button
            onClick={() => setDifficulty("hard")}
            className={`w-1/2 py-2 rounded-full font-semibold transition-colors ${difficulty === "hard" ? "bg-red-500 text-white shadow" : "text-gray-600"}`}
          >
            Khó (Tính giờ)
          </button>
        </div>
      </div>

      {/* Cài đặt động theo loại quiz */}
      {quizType === "KANA" ? (
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-700 mb-3">Chọn bộ kana</label>
          <div className="flex gap-3">
            <button
              onClick={() => toggleKanaSet("base")}
              className={`flex-1 p-3 rounded-lg font-semibold transition ${selectedKanaSets.base ? "bg-sky-500 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-sky-100"}`}
            >
              Bảng cơ bản
            </button>
            <button
              onClick={() => toggleKanaSet("dakuten")}
              className={`flex-1 p-3 rounded-lg font-semibold transition ${selectedKanaSets.dakuten ? "bg-sky-500 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-sky-100"}`}
            >
              Dakuten
            </button>
            <button
              onClick={() => toggleKanaSet("yoon")}
              className={`flex-1 p-3 rounded-lg font-semibold transition ${selectedKanaSets.yoon ? "bg-sky-500 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-sky-100"}`}
            >
              Yoon
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-md font-semibold text-gray-700 mb-2">Định dạng bài Từ vựng</label>
            <div className="flex gap-2">
              <button
                onClick={() => setVocabFormat('VI_TO_JP_TYPING')}
                className={`flex-1 p-2 rounded-lg ${vocabFormat === 'VI_TO_JP_TYPING' ? 'bg-sky-500 text-white' : 'bg-gray-100'}`}
              >
                Gõ (VI → JP)
              </button>
              <button
                onClick={() => setVocabFormat('JP_TO_VI_MCQ')}
                className={`flex-1 p-2 rounded-lg ${vocabFormat === 'JP_TO_VI_MCQ' ? 'bg-sky-500 text-white' : 'bg-gray-100'}`}
              >
                Trắc nghiệm (JP → VI)
              </button>
              <button
                onClick={() => setVocabFormat('VI_TO_JP_MCQ')}
                className={`flex-1 p-2 rounded-lg ${vocabFormat === 'VI_TO_JP_MCQ' ? 'bg-sky-500 text-white' : 'bg-gray-100'}`}
              >
                Trắc nghiệm (VI → JP)
              </button>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-700 mb-3">Chọn bài học</label>
            <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
              {availableLessons.map((n) => (
                <button
                  key={n}
                  onClick={() => toggleLesson(n)}
                  className={`p-2 rounded-lg font-semibold text-center transition-all ${selectedLessons.includes(n) ? "bg-sky-500 text-white shadow" : "bg-gray-100 text-gray-700 hover:bg-sky-100"}`}
                >
                  Bài {n}
                </button>
              ))}
            </div>
          </div>

          {/* Chỉ hiển thị typingChecks khi đang ở chế độ Gõ (VI -> JP) */}
          {vocabFormat === 'VI_TO_JP_TYPING' && (
            <div className="mb-6">
              <div className="space-y-3 mt-4 p-4 border rounded-lg">
                <div className="flex items-center">
                  <input
                    id="checkHiragana"
                    name="checkHiragana"
                    type="checkbox"
                    checked={typingChecks.checkHiragana}
                    onChange={handleTypingCheckChange}
                    className="h-5 w-5 rounded border-gray-300 text-sky-500 focus:ring-sky-400"
                  />
                  <label htmlFor="checkHiragana" className="ml-3 text-md font-medium text-gray-700">Kiểm tra Hiragana / Katakana</label>
                </div>

                <div className="flex items-center">
                  <input
                    id="checkRomaji"
                    name="checkRomaji"
                    type="checkbox"
                    checked={typingChecks.checkRomaji}
                    onChange={handleTypingCheckChange}
                    className="h-5 w-5 rounded border-gray-300 text-sky-500 focus:ring-sky-400"
                  />
                  <label htmlFor="checkRomaji" className="ml-3 text-md font-medium text-gray-700">Kiểm tra Romaji</label>
                </div>

                <div className="flex items-center opacity-50">
                  <input
                    id="checkKanji"
                    name="checkKanji"
                    type="checkbox"
                    checked={typingChecks.checkKanji}
                    onChange={handleTypingCheckChange}
                    className="h-5 w-5 rounded border-gray-300"
                    disabled
                  />
                  <label htmlFor="checkKanji" className="ml-3 text-md font-medium text-gray-700">Kiểm tra Kanji (sắp có)</label>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <button
        onClick={handleStart}
        className="w-full px-8 py-4 bg-gradient-to-r from-pink-400 to-sky-400 text-white rounded-full font-bold text-lg shadow-lg hover:opacity-90 transition-all"
      >
        Bắt đầu kiểm tra
      </button>
    </div>
  );
}
