// src/types/quiz.ts
// Kiểu dữ liệu dùng chung cho hệ thống Quiz (kana + vocabulary)
// Tất cả chú thích bằng tiếng Việt để dễ đọc/maintain.

/**
 * Tên các bộ kana có thể chọn
 */
export type KanaSet = "base" | "dakuten" | "yoon";

/**
 * Cấu trúc câu hỏi chung
 * - questionText: văn bản hiển thị (ví dụ: chữ tiếng Việt khi hỏi từ vựng hoặc ký tự kana)
 * - correctAnswers: chứa các dạng đáp án (romaji, hiragana, kanji tùy trường hợp)
 * - type: 'TYPING' cho dạng gõ, 'MCQ' cho trắc nghiệm (mở rộng sau)
 */
export interface Question {
  questionText: string;
  correctAnswers: {
    romaji: string;
    hiragana?: string;
    kanji?: string;
  };
  options?: string[]; // cho dạng MCQ (nếu có)
  type: "TYPING" | "MCQ";
}

/**
 * Cấu trúc câu trả lời người dùng (dùng cho dạng typing)
 */
export interface UserTypingAnswer {
  romaji: string;
  hiragana: string;
  kanji: string;
}

/**
 * Kết quả chấm từng phần (romaji / hiragana / kanji)
 * - true  => phần đó đúng
 * - false => phần đó sai
 * - null  => phần đó không được kiểm tra (không bật trong settings)
 */
export interface TypingAnswerResult {
  romaji: boolean | null;
  hiragana: boolean | null;
  kanji: boolean | null;
}

/**
 * Item lưu trong lịch sử (history) cho mỗi câu
 * - question: nội dung câu hỏi (lưu dạng text để dễ render sau)
 * - correctAnswer: object chứa romaji/hiragana/kanji đúng
 * - userAnswer: câu trả lời của người dùng (UserTypingAnswer)
 * - isCorrect: tổng thể (true nếu tất cả phần được kiểm tra đều đúng)
 * - results: chi tiết từng phần (TypingAnswerResult)
 * - options?: các tùy chọn cho MCQ (nếu cần hiển thị lại)
 */
export interface QuizHistoryItem {
  question: string;
  correctAnswer: {
    romaji: string;
    hiragana?: string;
    kanji?: string;
  };
  userAnswer: UserTypingAnswer;
  isCorrect: boolean;
  results: TypingAnswerResult;
  options?: string[];
  timedOut?: boolean;
}

/**
 * Kiểu kết quả nội bộ/tiện ích có thể dùng để trả về từ hook/component
 * - userAnswer có thể là chuỗi (đơn giản, ví dụ chỉ romaji) hoặc object typing
 * - correctAnswer tương tự (chuỗi hoặc object) — nhưng khi dùng với Question ta thường dùng object
 * - type: 'TIME_OUT' | 'TYPING' | 'SINGLE' để phân biệt cách chấm/hiển thị
 * - detail: nếu là dạng typing sẽ chứa TypingAnswerResult
 */
export type ResultType = "TIME_OUT" | "TYPING" | "SINGLE";

export interface QuizResult {
  isCorrect: boolean;
  userAnswer: string | UserTypingAnswer;
  correctAnswer: string | { romaji: string; hiragana?: string; kanji?: string };
  type: ResultType;
  detail?: TypingAnswerResult | null;
}

/**
 * Cài đặt cho quiz loại KANA
 */
export interface KanaQuizSettings {
  quizType: "KANA";
  numQuestions: number;
  selectedSets: Record<KanaSet, boolean>;
  difficulty: "easy" | "hard";
}

/**
 * Cài đặt cho quiz loại VOCABULARY (từ vựng)
 */
export interface VocabQuizSettings {
  quizType: "VOCABULARY";
  numQuestions: number;
  selectedLessons: number[]; // danh sách số bài được chọn
  quizFormat: "VI_TO_JP_TYPING" | "JP_TO_VI_MCQ" | "VI_TO_KANJI_MCQ";
  typingSettings?: {
    checkRomaji: boolean;
    checkHiragana: boolean;
    checkKanji: boolean;
  };
  difficulty: "easy" | "hard";
}

/**
 * Union type cho tất cả các cấu hình quiz
 */
export type QuizSettings = KanaQuizSettings | VocabQuizSettings;

/**
 * Một vài alias / tiện ích
 */
export type TypingAnswer = UserTypingAnswer;
