// src/hooks/useQuizEngine.ts

import { useState, useCallback } from 'react';
import { base_hira, dakuten, yoon } from '../data/kana'; // <-- Đường dẫn có thể cần điều chỉnh
import { generateViToJpTypingQuestions } from '../utils/quizHelpers';


// =================================================================
// 1. DI CHUYỂN CÁC TYPE & INTERFACE RA NGOÀI COMPONENT
//    Các định nghĩa này không phụ thuộc vào React, nên có thể đặt ở đây
//    để tái sử dụng và giúp hook dễ đọc hơn.
// =================================================================
export type KanaSet = "base" | "dakuten" | "yoon";

export interface QuizHistoryItem {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  // Thêm options để sau này hiển thị lại câu hỏi trắc nghiệm
  options?: string[]; 
}

// Cấu trúc của một câu hỏi duy nhất
export interface Question {
  questionText: string;
  correctAnswer: string;
  // Options sẽ chỉ tồn tại cho câu hỏi trắc nghiệm
  options?: string[];
}

// Định nghĩa CÀI ĐẶT cho quiz KANA
export interface KanaQuizSettings {
  quizType: 'KANA';
  numQuestions: number;
  selectedSets: Record<KanaSet, boolean>;
}

// Định nghĩa CÀI ĐẶT cho quiz TỪ VỰNG
interface VocabQuizSettings {
  quizType: 'VOCABULARY';
  numQuestions: number;
  selectedLessons: number[];
  quizFormat: 'VI_TO_JP_TYPING' | 'JP_TO_VI_MCQ' | 'VI_TO_KANJI_MCQ';
}

// Sử dụng Union Type để QuizSettings có thể là một trong hai loại trên
export type QuizSettings = KanaQuizSettings | VocabQuizSettings;
// =================================================================
// 2. TẠO CUSTOM HOOK useQuizEngine
//    Tên hook luôn bắt đầu bằng chữ "use".
// =================================================================
export const useQuizEngine = () => {
  // =================================================================
  // 3. DI CHUYỂN TOÀN BỘ STATE TỪ QuizMode VÀO ĐÂY
  //    Tất cả các `useState` quản lý trạng thái của phiên quiz
  //    sẽ được tập trung tại một nơi.
  // =================================================================
  const [quizState, setQuizState] = useState<"setup" | "playing" | "finished">("setup");
  const [questions, setQuestions] = useState<Question[]>([]); // <-- THAY ĐỔI Ở ĐÂY
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  // =================================================================
  // 4. DI CHUYỂN VÀ TÁI CẤU TRÚC CÁC HÀM LOGIC
  //    Sử dụng `useCallback` để tối ưu hóa, đảm bảo các hàm này
  //    không bị tạo lại một cách không cần thiết sau mỗi lần render.
  // =================================================================

  /**
   * Bắt đầu một phiên quiz mới dựa trên các cài đặt được cung cấp.
   * @param settings - Một object chứa số lượng câu hỏi và các bộ kana đã chọn.
   */
  const startQuiz = useCallback((settings: QuizSettings) => {
    let generatedQuestions: Question[] = [];

    // KIỂM TRA LOẠI QUIZ VÀ GỌI HÀM TƯƠNG ỨNG
    if (settings.quizType === 'KANA') {
        let characterSet: [string, string][] = [];
        if (settings.selectedSets.base) characterSet.push(...base_hira as [string, string][]);
        if (settings.selectedSets.dakuten) characterSet.push(...dakuten as [string, string][]);
        if (settings.selectedSets.yoon) characterSet.push(...yoon as [string, string][]);

        if (characterSet.length === 0) {
            alert("Vui lòng chọn ít nhất một bảng chữ cái để kiểm tra!");
            return;
        }

        const shuffled = [...characterSet].sort(() => 0.5 - Math.random());
        const finalQuestions = shuffled.slice(0, settings.numQuestions);
        
        // Chuyển đổi định dạng câu hỏi Kana sang định dạng `Question` mới
        generatedQuestions = finalQuestions.map(([q, a]) => ({
            questionText: q,
            correctAnswer: a,
        }));

    } else if (settings.quizType === 'VOCABULARY') {
        // Hiện tại chỉ xử lý một dạng, sau này sẽ thêm các dạng khác
        if (settings.quizFormat === 'VI_TO_JP_TYPING') {
            generatedQuestions = generateViToJpTypingQuestions(
                settings.selectedLessons,
                settings.numQuestions
            );
        }
        // else if (settings.quizFormat === '...') { ... }
    }

    if (generatedQuestions.length === 0) {
      alert("Không có đủ câu hỏi cho lựa chọn của bạn.");
      return;
    }

    // Reset tất cả state về trạng thái ban đầu cho một phiên mới
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setHistory([]);
    setQuizState("playing");
  }, []); // Dependency rỗng vì hàm này không phụ thuộc vào state nào từ bên ngoài

  /**
   * Xử lý câu trả lời của người dùng.
   * @param userAnswer - Chuỗi câu trả lời người dùng nhập vào.
   */
  const handleAnswer = useCallback((userAnswer: string) => {
    // Logic chấm điểm giữ nguyên
    const currentQuestion = questions[currentQuestionIndex];
    const finalUserAnswer = userAnswer.toLowerCase().trim();
    const isCorrect = finalUserAnswer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }
    
    // Cập nhật lịch sử làm bài
    setHistory(prev => [...prev, {
      question: currentQuestion.questionText,
      correctAnswer: currentQuestion.correctAnswer,
      userAnswer: finalUserAnswer,
      isCorrect,
    }]);

    return isCorrect; // Trả về kết quả để component UI có thể hiển thị feedback ngay lập tức
  }, [questions, currentQuestionIndex]); // Phụ thuộc vào `questions` và `currentQuestionIndex`

  /**
   * Chuyển sang câu hỏi tiếp theo hoặc kết thúc quiz.
   */
  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setQuizState("finished");
    }
  }, [currentQuestionIndex, questions.length]);

  /**
   * Quay trở lại màn hình cài đặt để bắt đầu một quiz hoàn toàn mới.
   */
  const resetToSetup = useCallback(() => {
    setQuizState("setup");
    // Reset các state để không bị rò rỉ dữ liệu từ phiên trước
    setQuestions([]);
    setHistory([]);
    setCurrentQuestionIndex(0);
    setScore(0);
  }, []);

  // =================================================================
  // 5. "EXPORT" CÁC STATE VÀ HÀM CẦN THIẾT
  //    Component giao diện sẽ sử dụng các giá trị này để hiển thị
  //    và tương tác với logic của quiz.
  // =================================================================
  return {
    // Trạng thái của quiz
    quizState,
    
    // Dữ liệu cho phiên quiz đang diễn ra
    questions,
    currentQuestionIndex,
    currentQuestion: questions[currentQuestionIndex], // Tiện ích: trả về câu hỏi hiện tại
    score,
    history,
    
    // Các hàm để điều khiển quiz
    startQuiz,
    handleAnswer,
    handleNext,
    resetToSetup,
  };
};

// Các hàm tiện ích không phụ thuộc vào state có thể đặt bên ngoài hook
export const getFeedback = (percentage: number): { message: string; color: string } => {
    if (percentage === 100) return { message: "Bạn là số 1 !! Quá đỉnh!", color: "text-green-500" };
    if (percentage >= 80) return { message: "Rất tốt! Cố gắng thêm chút nữa là hoàn hảo.", color: "text-green-500" };
    if (percentage >= 50) return { message: "Khá lắm! Bạn đã nắm được hơn một nửa rồi.", color: "text-sky-500" };
    if (percentage >= 20) return { message: "Cần cố gắng nhiều hơn nhé. Đừng nản lòng!", color: "text-orange-500" };
    return { message: "Ôi dốt quá!! Học nhiều vào.", color: "text-red-500" };
};