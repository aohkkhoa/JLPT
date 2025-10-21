import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { allRadicals } from './radicals'; // Điều chỉnh đường dẫn nếu cần
import type { Radical } from './radicals'; // Điều chỉnh đường dẫn nếu cần

// --- Icons cho các nút điều khiển ---
const ShuffleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428A9 9 0 118.57 4.572" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 3l-4 4" />
  </svg>
);

const NextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const SwapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 12L3 8m4 4l4-4m6 12v-3.5a2.5 2.5 0 00-5 0V16m0 0H7m10 0l4-4m-4 4v-4" />
  </svg>
);

// Thuật toán xáo trộn
const shuffleArray = (array: Radical[]): Radical[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const cardVariants = {
  enter: { y: 50, opacity: 0, scale: 0.95 },
  center: { zIndex: 1, y: 0, opacity: 1, scale: 1 },
  exit: { zIndex: 0, y: -50, opacity: 0, scale: 0.95 }
};

const Flashcard: React.FC = () => {
  // full list (unchanged)
  const [all] = useState<Radical[]>(allRadicals);

  // radicals là danh sách đang học (có thể là một phần của all)
  const [radicals, setRadicals] = useState<Radical[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  // State để người dùng chủ động đổi chế độ
  const [isReversed, setIsReversed] = useState(false); // false: Chữ -> Nghĩa, true: Nghĩa -> Chữ

  // --- New: range selection ---
  // start/end là 1-based indices hiển thị cho người dùng
  const [startIdx, setStartIdx] = useState<number>(1);
  const [endIdx, setEndIdx] = useState<number>(all.length);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // helper: apply range and optionally shuffle
  const applyRange = (shuffle = true) => {
    // normalize and validate
    const s = Math.max(1, Math.min(startIdx, all.length));
    const e = Math.max(1, Math.min(endIdx, all.length));
    if (s > e) {
      setErrorMsg('Giá trị bắt đầu phải nhỏ hơn hoặc bằng kết thúc.');
      return;
    }
    setErrorMsg(null);
    const slice = all.slice(s - 1, e); // slice uses 0-based

    // đảm bảo thẻ hiện tại đang ở mặt trước trước khi chuyển dữ liệu
    setIsFlipped(false);
    // đợi animation lật về mặt trước hoàn tất rồi mới cập nhật danh sách để tránh hiện tượng "nháy" mặt sau
    setTimeout(() => {
      setRadicals(shuffle ? shuffleArray(slice) : slice);
      setCurrentIndex(0);
    }, 650); // khớp với duration animation 600ms + đệm
  };

  const handleShuffle = useCallback(() => {
    setIsFlipped(false);
    setErrorMsg(null);
    // shuffle currently selected range
    setRadicals(prev => shuffleArray(prev.length ? prev : all));
    setCurrentIndex(0);
  }, [all]);

  useEffect(() => {
    // on mount: apply default full range
    applyRange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = () => {
    // đảm bảo thẻ ở mặt trước trước khi chuyển
    setIsFlipped(false);

    // chờ React cập nhật trạng thái (next frame) rồi đổi index -> tránh flicker
    requestAnimationFrame(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % radicals.length);
    });
  };

  // click toàn bộ thẻ chỉ lật (không đổi nội dung)
  const handleCardFlip = () => {
    setIsFlipped(prev => !prev);
  };

  // Chức năng 2: Chỉ đổi chế độ, gán cho nút "Đảo chiều"
  const handleToggleReverse = () => {
    setIsFlipped(false); // Lật thẻ về mặt trước trước khi đổi chế độ
    setTimeout(() => setIsReversed(prev => !prev), 150);
  };

  const currentRadical = radicals[currentIndex];

  if (!currentRadical) {
    return <div className="flex flex-col items-center justify-center h-screen text-xl text-sky-700 gap-4">
      <div>Đang chuẩn bị thẻ...</div>
      <div className="flex gap-2">
        <button onClick={() => applyRange(false)} className="px-4 py-2 bg-sky-600 text-white rounded">Tải lại</button>
      </div>
    </div>;
  }

  // effectiveReversed = isReversed
  const effectiveReversed = Boolean(isReversed);

  // rotate values (để tránh phản chiếu): animate riêng từng mặt
  const frontRotate = isFlipped ? 180 : 0;
  const backRotate = isFlipped ? 0 : -180;

  const FrontFaceContent = (!effectiveReversed) ? (
    <>
      <span className="text-8xl font-bold text-gray-800 select-none">{currentRadical.char}</span>
    </>
  ) : (
    <div className="text-center space-y-2">
      <p className="text-4xl font-bold text-sky-800 capitalize">{currentRadical.hanViet}</p>
      <p className="text-2xl text-gray-600 mt-2">{currentRadical.meaning}</p>
      <p className="text-sm text-gray-400 mt-1">Gợi ý: {currentRadical.strokes} nét</p>
    </div>
  );

  const BackFaceContent = (!effectiveReversed) ? (
    <div className="text-center space-y-2 text-lg">
      <p><strong className="font-semibold text-sky-700">Hán Việt:</strong> {currentRadical.hanViet}</p>
      <p><strong className="font-semibold text-sky-700">Nghĩa:</strong> {currentRadical.meaning}</p>
      <p><strong className="font-semibold text-sky-700">Số nét:</strong> {currentRadical.strokes}</p>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-8xl font-bold text-sky-800 select-none">{currentRadical.char}</h2>
    </div>
  );

  return (
    <div style={{ perspective: '1200px' }} className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] bg-gray-50/50 p-4 font-sans">
      <div className="mb-6 w-full max-w-sm text-center">
        <p className="text-xl font-semibold text-sky-700">Bộ thủ Flashcard</p>
        <p className="text-gray-500">{currentIndex + 1} / {radicals.length}</p>
        <p className="text-sm font-medium text-pink-600 bg-pink-100 rounded-full px-3 py-1 mt-2 inline-block">
          Chế độ: {isReversed ? 'Nghĩa ➔ Chữ' : 'Chữ ➔ Nghĩa'}
        </p>
      </div>

      {/* Range selector UI */}
      <div className="w-full max-w-sm bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Chọn bộ (1 - {all.length}):</label>
          <div className="text-sm text-gray-500">Đang học {radicals.length} thẻ</div>
        </div>
        <div className="flex gap-2">
          <input type="number" min={1} max={all.length} value={startIdx} onChange={(e) => setStartIdx(Number(e.target.value))}
            className="w-1/2 px-3 py-2 border rounded" />
          <input type="number" min={1} max={all.length} value={endIdx} onChange={(e) => setEndIdx(Number(e.target.value))}
            className="w-1/2 px-3 py-2 border rounded" />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => applyRange(true)} className="px-4 py-2 bg-sky-600 text-white rounded">Áp dụng & Xáo</button>
          <button onClick={() => applyRange(false)} className="px-4 py-2 bg-white border rounded">Áp dụng</button>
          <button onClick={() => { setStartIdx(1); setEndIdx(all.length); applyRange(true); }} className="px-3 py-2 bg-gray-100 rounded">Toàn bộ</button>
        </div>
        {errorMsg && <p className="text-sm text-red-500 mt-2">{errorMsg}</p>}
      </div>

      <div className="w-full max-w-sm h-96 cursor-pointer" onClick={handleCardFlip}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            className="relative w-full h-full"
            style={{ transformStyle: 'preserve-3d' }}
            initial="enter" animate="center" exit="exit"
            variants={cardVariants}
            transition={{ y: { type: "spring", stiffness: 300, damping: 25 }, opacity: { duration: 0.3 } }}
          >
            {/* Front face animated separately to keep text readable */}
            <motion.div
              className="absolute flex flex-col items-center justify-center w-full h-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
              style={{ backfaceVisibility: 'hidden' }}
              initial={{ rotateY: 0 }}                // <-- ensure front starts at 0
              animate={{ rotateY: frontRotate }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              {FrontFaceContent}
            </motion.div>

            {/* Back face animated separately */}
            <motion.div
              className="absolute flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-sky-100 to-indigo-100 rounded-2xl shadow-xl p-6"
              style={{ backfaceVisibility: 'hidden' }}
              initial={{ rotateY: -180 }}             // <-- ensure back starts hidden
              animate={{ rotateY: backRotate }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              {BackFaceContent}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleShuffle}
          className="flex items-center justify-center px-5 py-3 bg-white text-sky-700 font-semibold rounded-lg shadow-md border border-sky-200 hover:bg-sky-50 transition-colors duration-200">
          <ShuffleIcon /> Xáo trộn
        </motion.button>

        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleToggleReverse}
          className="flex items-center justify-center px-5 py-3 bg-white text-pink-700 font-semibold rounded-lg shadow-md border border-pink-200 hover:bg-pink-50 transition-colors duration-200">
          <SwapIcon /> Đảo chiều
        </motion.button>

        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleNext}
          className="flex items-center justify-center px-6 py-3 bg-sky-600 text-white font-bold rounded-lg shadow-lg shadow-sky-200 hover:bg-sky-700 transition-colors duration-200">
          Tiếp theo <NextIcon />
        </motion.button>
      </div>
    </div>
  );
};

export default Flashcard;
