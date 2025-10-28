// src/utils/quizHelpers.ts

import { ALL_LESSONS_DATA } from '../data/minnaData'; // <-- Điều chỉnh đường dẫn nếu cần
import type { Question } from '../hooks/useQuizEngine'; // <-- Điều chỉnh đường dẫn nếu cần
     // <-- Điều chỉnh đường dẫn nếu cần

/**
 * Hàm xáo trộn một mảng (Fisher-Yates shuffle algorithm)
 * @param array Mảng cần xáo trộn
 * @returns Mảng đã được xáo trộn
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Tạo ra các câu hỏi dạng VI -> JP Typing từ các bài học đã chọn.
 * @param selectedLessons Mảng các số thứ tự bài học (ví dụ: [1, 2, 5])
 * @param numQuestions Số lượng câu hỏi cần tạo
 * @returns Một mảng các câu hỏi
 */
export function generateViToJpTypingQuestions(
  selectedLessons: number[],
  numQuestions: number
): Question[] {
  // 1. Tập hợp tất cả từ vựng từ các bài học đã chọn
  let vocabularyPool: { jp: string; vi: string; }[] = [];
  selectedLessons.forEach(lessonNumber => {
    const lessonData = ALL_LESSONS_DATA[lessonNumber];
    if (lessonData && lessonData.vocabulary) {
      // Chỉ lấy các từ có nghĩa jp và vi
      const validVocab = lessonData.vocabulary.map(v => ({ jp: v.romaji, vi: v.vi }));
      vocabularyPool.push(...validVocab);
    }
  });
  
  // 2. Xáo trộn toàn bộ bộ từ vựng đã tập hợp
  const shuffledPool = shuffleArray(vocabularyPool);

  // 3. Lấy ra số lượng câu hỏi cần thiết
  const questionCount = Math.min(numQuestions, shuffledPool.length);
  const selectedVocab = shuffledPool.slice(0, questionCount);

  // 4. Chuyển đổi chúng thành định dạng Question
  const questions: Question[] = selectedVocab.map(vocab => ({
    questionText: vocab.vi,       // Câu hỏi là tiếng Việt
    correctAnswer: vocab.jp,    // Đáp án đúng là Romaji
  }));

  return questions;
}