import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { allRadicals } from '../data/radicals';
import type { Radical } from '../data/radicals'; // Điều chỉnh đường dẫn nếu cần
import { base_hira, base_kata, dakuten, yoon } from '../data/kana';

type FlashcardItem = {
  char: string;
  answer: string;
  meaning?: string;
  strokes?: number;
};

type DeckType = 'radical' | 'hiragana' | 'katakana' | 'dakuten' | 'yoon';

const deckOptions: { type: DeckType; label: string }[] = [
  { type: 'radical', label: 'Bộ thủ' },
  { type: 'hiragana', label: 'Hiragana' },
  { type: 'katakana', label: 'Katakana' },
  { type: 'dakuten', label: 'Dakuten' },
  { type: 'yoon', label: 'Yoon' },
];

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
const shuffleArray = (array: FlashcardItem[]): FlashcardItem[] => {
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

const getDeckItems = (deckType: DeckType): FlashcardItem[] => {
  if (deckType === 'radical') {
    return allRadicals.map((radical: Radical) => ({
      char: radical.char,
      answer: radical.hanViet,
      meaning: radical.meaning,
      strokes: radical.strokes,
    }));
  }

  const kanaData = deckType === 'hiragana'
    ? base_hira
    : deckType === 'katakana'
      ? base_kata
      : deckType === 'dakuten'
        ? dakuten
        : yoon;
  return kanaData.map(([char, answer]) => ({ char, answer }));
};

const Flashcard: React.FC = () => {
  const [deckType, setDeckType] = useState<DeckType>('radical');
  const all = useMemo(() => getDeckItems(deckType), [deckType]);
  const maxStrokeCount = useMemo(
    () => Math.max(...all.map((card) => card.strokes ?? 0)),
    [all],
  );

  const [studyPool, setStudyPool] = useState<FlashcardItem[]>(all);
  const [cards, setCards] = useState<FlashcardItem[]>(all);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasCompletedDeck, setHasCompletedDeck] = useState(false);
  const [isReviewRound, setIsReviewRound] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(() => new Set());
  // State để người dùng chủ động đổi chế độ
  const [isReversed, setIsReversed] = useState(false); // false: Chữ -> Nghĩa, true: Nghĩa -> Chữ
  const [filterByStrokes, setFilterByStrokes] = useState(false);

  // --- New: range selection ---
  // start/end là 1-based indices hiển thị cho người dùng
  const [startIdx, setStartIdx] = useState<number>(1);
  const [endIdx, setEndIdx] = useState<number>(all.length);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rangeDirty, setRangeDirty] = useState(false);
  const rangeTimeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
      if (rangeTimeoutRef.current !== null) {
        window.clearTimeout(rangeTimeoutRef.current);
        rangeTimeoutRef.current = null;
      }
    }, []);

  // helper: apply range and optionally shuffle
  const applyRange = (shuffle = true, rangeStart = startIdx, rangeEnd = endIdx) => {
    // normalize and validate
    const rangeMax = deckType === 'radical' && filterByStrokes ? maxStrokeCount : all.length;
    const s = Math.max(1, Math.min(rangeStart, rangeMax));
    const e = Math.max(1, Math.min(rangeEnd, rangeMax));
    if (s > e) {
      setErrorMsg('Giá trị bắt đầu phải nhỏ hơn hoặc bằng kết thúc.');
      return;
    }
    const selectedCards = deckType === 'radical' && filterByStrokes
      ? all.filter((card) => card.strokes !== undefined && card.strokes >= s && card.strokes <= e)
      : all.slice(s - 1, e); // slice uses 0-based
    if (selectedCards.length === 0) {
      setErrorMsg('Không có thẻ trong khoảng đã chọn.');
      return;
    }
    setErrorMsg(null);
    setRangeDirty(false);

    // đảm bảo thẻ hiện tại đang ở mặt trước trước khi chuyển dữ liệu
    setIsFlipped(false);
    // đợi animation lật về mặt trước hoàn tất rồi mới cập nhật danh sách để tránh hiện tượng "nháy" mặt sau
    if (rangeTimeoutRef.current !== null) {
      window.clearTimeout(rangeTimeoutRef.current);
    }
    rangeTimeoutRef.current = window.setTimeout(() => {
      const nextCards = shuffle ? shuffleArray(selectedCards) : selectedCards;
      setStudyPool(selectedCards);
      setCards(nextCards);
      setCurrentIndex(0);
      setHasCompletedDeck(false);
      setIsReviewRound(false);
      setMasteredIds(new Set());
      setReviewIds(new Set());
      rangeTimeoutRef.current = null;
    }, 650); // khớp với duration animation 600ms + đệm
  };

  const handleShuffle = useCallback(() => {
    setIsFlipped(false);
    setErrorMsg(null);
    setCards(shuffleArray(studyPool.length ? studyPool : all));
    setCurrentIndex(0);
    setHasCompletedDeck(false);
    setIsReviewRound(false);
    setMasteredIds(new Set());
    setReviewIds(new Set());
  }, [all, studyPool]);

  const handleNext = () => {
    if (hasCompletedDeck) return;
    setIsFlipped(false);
    if (currentIndex >= cards.length - 1) {
      setHasCompletedDeck(true);
      return;
    }
    setCurrentIndex((index) => index + 1);
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

  const currentCard = cards[currentIndex];
  const getCardId = (card: FlashcardItem) => `${deckType}:${card.char}`;
  const masteredCount = studyPool.filter((card) => masteredIds.has(getCardId(card))).length;
  const reviewCount = studyPool.filter((card) => reviewIds.has(getCardId(card))).length;
  const unratedCount = studyPool.length - masteredCount - reviewCount;

  const handlePrevious = () => {
    if (hasCompletedDeck) return;
    setIsFlipped(false);
    setCurrentIndex((index) => Math.max(0, index - 1));
  };

  const handleRateCard = (known: boolean) => {
    if (!currentCard) return;
    const id = getCardId(currentCard);
    if (known) {
      setMasteredIds((previous) => new Set(previous).add(id));
      setReviewIds((previous) => {
        const next = new Set(previous);
        next.delete(id);
        return next;
      });
    } else {
      setReviewIds((previous) => new Set(previous).add(id));
      setMasteredIds((previous) => {
        const next = new Set(previous);
        next.delete(id);
        return next;
      });
    }
    handleNext();
  };

  const handleReviewMissed = () => {
    const missedCards = studyPool.filter((card) => reviewIds.has(getCardId(card)));
    if (missedCards.length === 0) return;
    setCards(shuffleArray(missedCards));
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsReviewRound(true);
    setHasCompletedDeck(false);
  };

  const handleRestartStudy = () => {
    setCards(shuffleArray(studyPool));
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsReviewRound(false);
    setHasCompletedDeck(false);
    setMasteredIds(new Set());
    setReviewIds(new Set());
  };

  const handleSelectAll = () => {
    const rangeEnd = deckType === 'radical' && filterByStrokes ? maxStrokeCount : all.length;
    setStartIdx(1);
    setEndIdx(rangeEnd);
    applyRange(true, 1, rangeEnd);
  };

  const handleStrokeFilterChange = (enabled: boolean) => {
    setFilterByStrokes(enabled);
    setStartIdx(1);
    setEndIdx(enabled ? maxStrokeCount : all.length);
    setErrorMsg(null);
    setRangeDirty(true);
  };

  const handleDeckChange = (nextDeckType: DeckType) => {
    const nextDeck = getDeckItems(nextDeckType);
    if (rangeTimeoutRef.current !== null) {
      window.clearTimeout(rangeTimeoutRef.current);
      rangeTimeoutRef.current = null;
    }
    setDeckType(nextDeckType);
    setStudyPool(nextDeck);
    setCards(nextDeck);
    setStartIdx(1);
    setEndIdx(nextDeck.length);
    setFilterByStrokes(false);
    setRangeDirty(false);
    setErrorMsg(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsReversed(false);
    setHasCompletedDeck(false);
    setIsReviewRound(false);
    setMasteredIds(new Set());
    setReviewIds(new Set());
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) {
        return;
      }
      if (target instanceof HTMLButtonElement) return;
      if (hasCompletedDeck) return;

      if (event.code === 'Space') {
        event.preventDefault();
        handleCardFlip();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevious();
      } else if (event.key.toLowerCase() === 'r') {
        handleToggleReverse();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cards.length, currentIndex, hasCompletedDeck, handleNext, handlePrevious, handleToggleReverse]);

  if (!currentCard) {
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

  const FrontFaceContent = !effectiveReversed ? (
    <span className="text-8xl font-bold text-gray-800 select-none">{currentCard.char}</span>
  ) : (
    <div className="text-center space-y-2">
      <p className="text-5xl font-bold text-sky-800 capitalize">{currentCard.answer}</p>
      {currentCard.meaning && <p className="text-2xl text-gray-600 mt-2">{currentCard.meaning}</p>}
      {currentCard.strokes !== undefined && <p className="text-sm text-gray-400 mt-1">Gợi ý: {currentCard.strokes} nét</p>}
    </div>
  );

  const BackFaceContent = !effectiveReversed ? (
    <div className="text-center space-y-2 text-lg">
      {currentCard.meaning ? (
        <>
          <p><strong className="font-semibold text-sky-700">Hán Việt:</strong> {currentCard.answer}</p>
          <p><strong className="font-semibold text-sky-700">Nghĩa:</strong> {currentCard.meaning}</p>
          {currentCard.strokes !== undefined && <p><strong className="font-semibold text-sky-700">Số nét:</strong> {currentCard.strokes}</p>}
        </>
      ) : (
        <p><strong className="font-semibold text-sky-700">Romaji:</strong> {currentCard.answer}</p>
      )}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-8xl font-bold text-sky-800 select-none">{currentCard.char}</h2>
    </div>
  );

  return (
    <div style={{ perspective: '1200px' }} className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] bg-gray-50/50 p-4 font-sans">
      <div className="mb-6 w-full max-w-sm text-center">
        <p className="text-xl font-semibold text-sky-700">Flashcard tiếng Nhật</p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label="Chọn bộ flashcard">
          {deckOptions.map(({ type, label }) => (
            <button
              key={type}
              type="button"
              aria-pressed={deckType === type}
              onClick={() => handleDeckChange(type)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${deckType === type ? 'bg-sky-600 text-white' : 'bg-white text-gray-600 hover:bg-sky-50'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-gray-500 mt-3">{hasCompletedDeck ? cards.length : currentIndex + 1} / {cards.length}</p>
        <p className="mt-1 text-sm text-gray-500">
          Đã thuộc {masteredCount} · Cần ôn {reviewCount}{isReviewRound ? ' · Lượt ôn' : ''}
        </p>
        <p className="text-sm font-medium text-pink-600 bg-pink-100 rounded-full px-3 py-1 mt-2 inline-block">
          Chế độ: {isReversed ? 'Đáp án ➔ Chữ' : 'Chữ ➔ Đáp án'}
        </p>
      </div>

      {/* Range selector UI */}
      <div className="w-full max-w-sm bg-white p-4 rounded-lg shadow mb-6">
        {deckType === 'radical' && (
          <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={filterByStrokes}
              onChange={(event) => handleStrokeFilterChange(event.target.checked)}
              className="h-4 w-4 accent-sky-600"
            />
            Lọc theo số nét
          </label>
        )}
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            {filterByStrokes ? `Số nét (1 - ${maxStrokeCount}):` : `Chọn thẻ (1 - ${all.length}):`}
          </label>
          <div className="text-sm text-gray-500">Đang học {cards.length} thẻ</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm text-gray-600">
            Từ {filterByStrokes ? 'nét' : 'thẻ'}
            <input
              type="number"
              min={1}
              max={filterByStrokes ? maxStrokeCount : all.length}
              value={startIdx}
              onChange={(event) => { setStartIdx(Number(event.target.value)); setRangeDirty(true); }}
              className="mt-1 w-full px-3 py-2 border rounded"
            />
          </label>
          <label className="text-sm text-gray-600">
            Đến {filterByStrokes ? 'nét' : 'thẻ'}
            <input
              type="number"
              min={1}
              max={filterByStrokes ? maxStrokeCount : all.length}
              value={endIdx}
              onChange={(event) => { setEndIdx(Number(event.target.value)); setRangeDirty(true); }}
              className="mt-1 w-full px-3 py-2 border rounded"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button onClick={() => applyRange(true)} className="px-3 py-2 bg-sky-600 text-white rounded">Áp dụng & Xáo</button>
          <button onClick={() => applyRange(false)} className="px-3 py-2 bg-white border rounded">Áp dụng</button>
          <button onClick={handleSelectAll} className="px-3 py-2 bg-gray-100 rounded">Toàn bộ</button>
        </div>
        {rangeDirty && <p className="text-sm text-gray-500 mt-2">Bấm Áp dụng để cập nhật bộ thẻ.</p>}
        {errorMsg && <p className="text-sm text-red-500 mt-2">{errorMsg}</p>}
      </div>

      {hasCompletedDeck ? (
        <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow">
          <h2 className="text-2xl font-bold text-sky-800">Hoàn thành lượt học</h2>
          <p className="mt-3 text-gray-700">Đã thuộc: {masteredCount} / {studyPool.length}</p>
          <p className="text-gray-700">Cần ôn lại: {reviewCount}</p>
          <p className="text-gray-500">Chưa đánh giá: {unratedCount}</p>
          <div className="mt-5 flex flex-col gap-2">
            {reviewCount > 0 && (
              <button onClick={handleReviewMissed} className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-white hover:bg-amber-600">
                Ôn lại {reviewCount} thẻ chưa thuộc
              </button>
            )}
            <button onClick={handleRestartStudy} className="rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700">
              Học lại bộ này
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="w-full max-w-sm h-96 cursor-pointer border-0 bg-transparent p-0 text-left"
            aria-label="Lật thẻ"
            aria-pressed={isFlipped}
            onClick={handleCardFlip}
          >
            <motion.div
              key={`${deckType}:${currentCard.char}:${currentIndex}`}
              className="relative w-full h-full"
              style={{ transformStyle: 'preserve-3d' }}
              initial="enter" animate="center"
              variants={cardVariants}
              transition={{ y: { type: "spring", stiffness: 300, damping: 25 }, opacity: { duration: 0.3 } }}
            >
              <motion.div
                className="absolute flex flex-col items-center justify-center w-full h-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
                style={{ backfaceVisibility: 'hidden' }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: frontRotate }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                {FrontFaceContent}
              </motion.div>
              <motion.div
                className="absolute flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-sky-100 to-indigo-100 rounded-2xl shadow-xl p-6"
                style={{ backfaceVisibility: 'hidden' }}
                initial={{ rotateY: -180 }}
                animate={{ rotateY: backRotate }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                {BackFaceContent}
              </motion.div>
            </motion.div>
          </button>

          {isFlipped && (
            <div className="mt-4 grid w-full max-w-sm grid-cols-2 gap-3">
              <button onClick={() => handleRateCard(false)} className="rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white hover:bg-amber-600">
                Chưa thuộc
              </button>
              <button onClick={() => handleRateCard(true)} className="rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700">
                Đã thuộc
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleShuffle}
              className="flex items-center justify-center px-4 py-3 bg-white text-sky-700 font-semibold rounded-lg shadow-md border border-sky-200 hover:bg-sky-50 transition-colors duration-200">
              <ShuffleIcon /> Xáo trộn
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleToggleReverse}
              className="flex items-center justify-center px-4 py-3 bg-white text-pink-700 font-semibold rounded-lg shadow-md border border-pink-200 hover:bg-pink-50 transition-colors duration-200">
              <SwapIcon /> Đảo chiều
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePrevious} disabled={currentIndex === 0}
              className="flex items-center justify-center px-4 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-md border border-gray-200 disabled:opacity-40">
              Trước
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleNext}
              className="flex items-center justify-center px-4 py-3 bg-sky-600 text-white font-bold rounded-lg shadow-lg shadow-sky-200 hover:bg-sky-700 transition-colors duration-200">
              {currentIndex === cards.length - 1 ? 'Hoàn tất' : 'Tiếp theo'} <NextIcon />
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
};

export default Flashcard;
