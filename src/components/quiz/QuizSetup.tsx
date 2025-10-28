// src/components/quiz/QuizSetup.tsx

import { useState } from 'react';
import type { QuizSettings, KanaSet } from '../../hooks/useQuizEngine';
import { ALL_LESSONS_DATA } from '../../data/minnaData';

// Props mà component này cần từ component cha
interface QuizSetupProps {
  onStart: (settings: QuizSettings) => void;
}

// Lấy danh sách các bài học có sẵn từ dữ liệu
const availableLessons = Object.keys(ALL_LESSONS_DATA).map(Number);

const kanaSetLabels: Record<KanaSet, string> = {
  base: "Bảng chữ cái cơ bản",
  dakuten: "Biến âm (Dakuten)",
  yoon: "Âm ghép (Yoon)",
};

export default function QuizSetup({ onStart }: QuizSetupProps) {
  // =================================================================
  // STATE QUẢN LÝ TOÀN BỘ FORM
  // =================================================================
  const [quizType, setQuizType] = useState<'KANA' | 'VOCABULARY'>('KANA');
  const [numQuestions, setNumQuestions] = useState(10);
  
  // State cho cài đặt Kana
  const [selectedKanaSets, setSelectedKanaSets] = useState<Record<KanaSet, boolean>>({
    base: true,
    dakuten: true,
    yoon: true,
  });

  // State cho cài đặt Từ vựng
  const [selectedLessons, setSelectedLessons] = useState<number[]>([1]); // Mặc định chọn bài 1

  // =================================================================
  // CÁC HÀM XỬ LÝ SỰ KIỆN
  // =================================================================
  const handleKanaSetSelection = (set: KanaSet) => {
    setSelectedKanaSets(prev => ({ ...prev, [set]: !prev[set] }));
  };

  const handleLessonSelection = (lessonNumber: number) => {
    setSelectedLessons(prev => 
      prev.includes(lessonNumber)
        ? prev.filter(n => n !== lessonNumber) // Bỏ chọn nếu đã được chọn
        : [...prev, lessonNumber] // Thêm vào nếu chưa được chọn
    );
  };

  const handleStartClick = () => {
    let settings: QuizSettings;

    if (quizType === 'KANA') {
      settings = {
        quizType: 'KANA',
        numQuestions: numQuestions,
        selectedSets: selectedKanaSets,
      };
    } else { // quizType === 'VOCABULARY'
      if (selectedLessons.length === 0) {
        alert("Vui lòng chọn ít nhất một bài học!");
        return;
      }
      settings = {
        quizType: 'VOCABULARY',
        numQuestions: numQuestions,
        selectedLessons: selectedLessons,
        // Hiện tại hard-code, sau này sẽ có thêm lựa chọn
        quizFormat: 'VI_TO_JP_TYPING', 
      };
    }
    onStart(settings);
  };

  // =================================================================
  // JSX - GIAO DIỆN
  // =================================================================
  return (
    <div className="w-full max-w-lg mx-auto text-left">
      <h2 className="text-2xl font-bold text-indigo-600 mb-6 text-center">Cài đặt bài kiểm tra</h2>

      {/* --- 1. BỘ CHỌN LOẠI QUIZ --- */}
      <div className="flex justify-center gap-2 mb-6 p-1 bg-gray-200 rounded-full">
        <button
          onClick={() => setQuizType('KANA')}
          className={`w-1/2 py-2 rounded-full font-semibold transition-all ${
            quizType === 'KANA' ? 'bg-white text-pink-500 shadow' : 'text-gray-600'
          }`}
        >
          Bảng chữ cái
        </button>
        <button
          onClick={() => setQuizType('VOCABULARY')}
          className={`w-1/2 py-2 rounded-full font-semibold transition-all ${
            quizType === 'VOCABULARY' ? 'bg-white text-sky-500 shadow' : 'text-gray-600'
          }`}
        >
          Từ vựng
        </button>
      </div>
      
      {/* --- 2. INPUT SỐ LƯỢNG CÂU HỎI (DÙNG CHUNG) --- */}
      <div className="mb-6">
        <label htmlFor="numQuestions" className="block text-lg font-semibold text-gray-700 mb-2">
          Số lượng câu hỏi
        </label>
        <input
          type="number"
          id="numQuestions"
          defaultValue={10}
          value={numQuestions}
          onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className="w-full p-3 border-2 border-gray-300 rounded-lg text-center text-xl focus:border-sky-400 focus:ring-sky-400"
          min="1"
        />
      </div>

      {/* --- 3. HIỂN THỊ CÀI ĐẶT ĐỘNG --- */}
      {quizType === 'KANA' ? (
        // --- CÀI ĐẶT CHO KANA ---
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
                  checked={selectedKanaSets[set]}
                  onChange={() => handleKanaSetSelection(set)}
                  className="h-5 w-5 rounded border-gray-300 text-pink-500 focus:ring-pink-400 cursor-pointer"
                />
                <label htmlFor={`set-${set}`} className="ml-3 text-md font-medium text-gray-700 cursor-pointer">
                  {kanaSetLabels[set]}
                </label>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // --- CÀI ĐẶT CHO TỪ VỰNG ---
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            Chọn bài học (có thể chọn nhiều)
          </label>
          <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
            {availableLessons.map(lessonNum => (
              <button
                key={lessonNum}
                onClick={() => handleLessonSelection(lessonNum)}
                className={`p-2 rounded-lg font-semibold text-center transition-all ${
                  selectedLessons.includes(lessonNum)
                    ? 'bg-sky-500 text-white shadow'
                    : 'bg-gray-100 text-gray-700 hover:bg-sky-100'
                }`}
              >
                Bài {lessonNum}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- 4. NÚT BẮT ĐẦU (DÙNG CHUNG) --- */}
      <button
        onClick={handleStartClick}
        className="w-full px-8 py-4 bg-gradient-to-r from-pink-400 to-sky-400 text-white rounded-full font-bold text-lg shadow-lg hover:opacity-90 transition-all"
      >
        Bắt đầu kiểm tra
      </button>
    </div>
  );
}