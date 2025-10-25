// src/components/MinnaNihongoLessons.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Transition } from 'framer-motion';
// Đảm bảo đường dẫn này chính xác với cấu trúc project của bạn
import { ALL_LESSONS_DATA } from '../data/minnaData';
import type { GrammarPoint, VocabularyItem } from '../data/minnaData';
// Định nghĩa kiểu cho loại nội dung, khớp với các key trong data
type ContentType = 'grammar' | 'vocabulary';

// --- CÁC COMPONENT CON HỖ TRỢ ---

// Component cho Mũi tên phải, tạo bằng Tailwind CSS
const RightArrow = () => (
  <div className="w-3 h-3 border-t-2 border-r-2 border-gray-400 rotate-45 transition-transform group-hover:border-sky-500"></div>
);

// Component cho Mũi tên trái (để quay lại)
const LeftArrow = () => (
  <div className="w-3 h-3 border-t-2 border-l-2 border-white -rotate-45"></div>
);


// --- COMPONENT CHÍNH ---

const MinnaNihongoLessons: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [currentLesson, setCurrentLesson] = useState<number>(1);
  const [contentType, setContentType] = useState<ContentType>('grammar');
  // State mới để lưu ngữ pháp được chọn -> quyết định hiển thị màn hình nào
  const [selectedGrammar, setSelectedGrammar] = useState<GrammarPoint | null>(null);

  // --- LẤY DỮ LIỆU ---
  const availableLessons = Object.keys(ALL_LESSONS_DATA).map(Number);
  const contentToDisplay = ALL_LESSONS_DATA[currentLesson]?.[contentType] ?? [];
  const contentTypeLabels: Record<ContentType, string> = {
    grammar: 'Ngữ pháp',
    vocabulary: 'Từ vựng',
  };

  const speakJapanese = (text: string) => {
    // Kiểm tra xem trình duyệt có hỗ trợ API này không
    if ('speechSynthesis' in window) {
      // Dừng bất kỳ âm thanh nào đang phát
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      // Thiết lập ngôn ngữ là tiếng Nhật
      utterance.lang = 'ja-JP';
      // Tùy chỉnh tốc độ đọc (1 là bình thường)
      utterance.rate = 0.9;

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Trình duyệt của bạn không hỗ trợ chức năng phát âm.');
    }
  };

  // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
  const handleSelectGrammar = (grammarPoint: GrammarPoint) => {
    // Chỉ hoạt động khi đang ở tab ngữ pháp
    if (contentType === 'grammar') {
      setSelectedGrammar(grammarPoint);
    }
    // Nếu bạn muốn mở rộng cho từ vựng, có thể thêm logic ở đây
  };

  const handleGoBackToList = () => {
    setSelectedGrammar(null);
  };

  const handleContentTypeChange = (type: ContentType) => {
    setContentType(type);
    // Khi đổi tab (ví dụ từ Ngữ pháp sang Từ vựng), quay về màn hình danh sách
    setSelectedGrammar(null);
  }

  // --- CẤU HÌNH HIỆU ỨNG ---
  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -50 },
  };

  const pageTransition: Transition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-pink-50 to-indigo-50 py-12 px-4 sm:px-6 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        {/* --- HEADER CHUNG --- */}
        <header className="text-center mb-10">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-sky-700 mb-2 drop-shadow-md"
          >
            Minna No Nihongo
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-pink-500 font-semibold"
          >
            Bài {currentLesson}
          </motion.p>
        </header>

        {/* AnimatePresence để quản lý hiệu ứng ra/vào của component */}
        <AnimatePresence mode="wait">
          {selectedGrammar ? (
            // ===============================================
            //        GIAO DIỆN CHI TIẾT NGỮ PHÁP
            // ===============================================
            <motion.div
              key="detailView"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-pink-200">
                <h2 className="text-2xl font-bold text-sky-700">{selectedGrammar.text}</h2>
                <motion.button
                  onClick={handleGoBackToList}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-semibold shadow-md"
                >
                  <LeftArrow />
                  Quay lại
                </motion.button>
              </div>

              <div className="space-y-6">
                {/* Cấu trúc */}
                <div>
                  <h3 className="text-lg font-semibold text-pink-600 mb-2">Cấu trúc</h3>
                  <p className="px-4 py-2 bg-sky-100 rounded-md text-sky-800 font-mono text-lg">{selectedGrammar.structure}</p>
                </div>

                {/* Ý nghĩa */}
                <div>
                  <h3 className="text-lg font-semibold text-pink-600 mb-2">Ý nghĩa</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedGrammar.meaning}</p>
                </div>

                {/* Ví dụ */}
                // THAY BẰNG ĐOẠN NÀY
                <div>
                  <h3 className="text-lg font-semibold text-pink-600 mb-2">Ví dụ</h3>
                  <div className="space-y-3">
                    {selectedGrammar.examples.map((ex, index) => (
                      <div key={index} className="group flex items-center justify-between p-3 bg-gradient-to-r from-sky-50 to-white rounded-lg border border-sky-200">
                        <div>
                          <p className="text-lg text-sky-800">{ex.jp}</p>
                          <p className="text-sm text-gray-600 italic mt-1">{ex.vi}</p>
                        </div>

                        {/* Nút phát âm */}
                        <motion.button
                          onClick={() => speakJapanese(ex.jp)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-full hover:bg-sky-200/50 transition-colors"
                          aria-label="Phát âm câu ví dụ"
                        >
                          {/* Icon loa */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.88 5.88a15.257 15.257 0 0112.24 0M8.464 15.536a5 5 0 010-7.072M12 18.75a.75.75 0 01-.75-.75V6a.75.75 0 011.5 0v12a.75.75 0 01-.75-.75z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.5 6.5l-3.5-3.5m0 7l3.5-3.5m6 3.5l3.5 3.5m0-7l-3.5 3.5" />
                            <path d="M8 9.5a3.5 3.5 0 00-3.5 3.5V17a3.5 3.5 0 003.5 3.5h8A3.5 3.5 0 0019.5 17v-4a3.5 3.5 0 00-3.5-3.5h-8z" />
                          </svg>
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ghi chú */}
                {selectedGrammar.notes && selectedGrammar.notes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-pink-600 mb-2">Lưu ý</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selectedGrammar.notes.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            // ===============================================
            //             GIAO DIỆN DANH SÁCH
            // ===============================================
            <motion.div
              key="listView"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              {/* --- Bảng điều khiển chọn bài và nội dung --- */}
              <div className="space-y-6 mb-10">
                {/* Chọn Bài */}
                <div>
                  <h2 className="text-lg font-bold text-sky-700 mb-3 text-center">Chọn bài</h2>
                  <div className="flex justify-center flex-wrap gap-3">
                    {availableLessons.map((lessonNum) => (
                      <motion.button
                        key={lessonNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentLesson(lessonNum)}
                        className={`px-5 py-2 rounded-full shadow-md font-semibold transition-all duration-300 text-sm ${currentLesson === lessonNum
                          ? "bg-gradient-to-r from-sky-400 to-indigo-400 text-white"
                          : "bg-white text-sky-600 hover:bg-pink-50"
                          }`}
                      >
                        Bài {lessonNum}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Chọn Nội dung */}
                <div>
                  <h2 className="text-lg font-bold text-sky-700 mb-3 text-center">Chọn mục</h2>
                  <div className="flex justify-center flex-wrap gap-4">
                    {(Object.keys(contentTypeLabels) as ContentType[]).map((type) => (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleContentTypeChange(type)}
                        className={`px-6 py-2 rounded-full shadow-md font-semibold transition-all duration-300 ${contentType === type
                          ? "bg-gradient-to-r from-pink-400 to-indigo-400 text-white"
                          : "bg-white text-sky-600 hover:bg-pink-50"
                          }`}
                      >
                        {contentTypeLabels[type]}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* --- Danh sách nội dung --- */}
              <main className="space-y-3">
                {contentToDisplay.length > 0 ? (
                  contentToDisplay.map((item, index) => {
                    if (contentType === 'grammar') {
                      const grammarItem = item as GrammarPoint;
                      return (
                        <motion.div
                          key={item.id}
                          onClick={() => handleSelectGrammar(grammarItem)}
                          // ... (các props khác giữ nguyên) ...
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="group flex items-center justify-between p-4 rounded-xl shadow-md bg-white/80 hover:shadow-lg hover:border-sky-300 border border-transparent transition-all duration-300 cursor-pointer"
                        >
                          <span className="text-lg text-gray-700">
                            <span className="font-bold text-pink-500 mr-2">{index + 1}.</span>
                            {grammarItem.text}
                          </span>
                          <RightArrow />
                        </motion.div>
                      );
                    } else {
                      // Giao diện MỚI cho Từ vựng
                      const vocabItem = item as VocabularyItem; // Ép kiểu để TypeScript hiểu
                      return (
                        <motion.div
                          key={vocabItem.id}
                          onClick={() => speakJapanese(vocabItem.jp)} // <-- GỌI HÀM PHÁT ÂM
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="group flex items-center justify-between p-4 rounded-xl shadow-md bg-white/80 hover:shadow-lg hover:border-sky-300 border border-transparent transition-all duration-300 cursor-pointer"
                        >
                          {/* Hiển thị từ vựng với cấu trúc mới */}
                          <span className="text-lg text-gray-700">
                            <span className="font-bold text-pink-500 mr-2">{index + 1}.</span>
                            <span className="font-semibold text-sky-800">{vocabItem.jp}</span>
                            <span className="text-gray-500 text-base ml-2">({vocabItem.romaji})</span>
                            <span className="ml-3">- {vocabItem.vi}</span>
                          </span>
                          {/* Thêm icon loa để người dùng biết có thể click */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-sky-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.88 5.88a15.257 15.257 0 0112.24 0M8.464 15.536a5 5 0 010-7.072M12 18.75a.75.75 0 01-.75-.75V6a.75.75 0 011.5 0v12a.75.75 0 01-.75.75z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.5 6.5l-3.5-3.5m0 7l3.5-3.5m6 3.5l3.5 3.5m0-7l-3.5 3.5" />
                            <path d="M8 9.5a3.5 3.5 0 00-3.5 3.5V17a3.5 3.5 0 003.5 3.5h8A3.5 3.5 0 0019.5 17v-4a3.5 3.5 0 00-3.5-3.5h-8z" />
                          </svg>
                        </motion.div>
                      );
                    }
                  })
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">Chưa có dữ liệu cho mục này.</p>
                  </div>
                )}
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MinnaNihongoLessons;