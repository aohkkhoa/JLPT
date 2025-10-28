// src/pages/QuizPage.tsx

import { useQuizEngine, type QuizSettings  } from '../hooks/useQuizEngine';
import QuizSetup from '../components/quiz/QuizSetup';
import QuizPlayer from '../components/quiz/QuizPlayer';
import QuizResults from '../components/quiz/QuizResults';

export default function QuizPage() {
  // --- 1. GỌI HOOK: Lấy tất cả state và logic từ "bộ não" ---
  const {
    quizState,
    currentQuestion,
    questions,
    currentQuestionIndex,
    score,
    history,
    startQuiz,
    handleAnswer,
    handleNext,
    resetToSetup,
  } = useQuizEngine();

  // --- 2. HÀM TRUNG GIAN: Để kết nối các component với hook ---
  const handleStart = (settings: QuizSettings ) => {
    // Khi component QuizSetup báo 'start', gọi hàm startQuiz từ hook
    startQuiz(settings);
  };
  
  const handleRestartWithSameSettings = () => {
    // Để làm lại, ta chỉ cần gọi lại `startQuiz` với cài đặt cũ,
    // nhưng chúng ta chưa lưu cài đặt cũ. Một cách đơn giản hơn là
    // chỉ cần reset về màn hình setup.
    // Tạm thời chúng ta sẽ làm cách đơn giản.
    // Để nâng cao, bạn có thể lưu `settings` vào một state ở đây.
    resetToSetup(); // Tạm thời làm lại là quay về cài đặt
  }

  // --- 3. LOGIC RENDER: Dựa vào quizState để hiển thị component tương ứng ---

  // Nếu đang ở màn hình cài đặt
  if (quizState === 'setup') {
    return <QuizSetup onStart={handleStart} />;
  }

  // Nếu đang ở màn hình kết quả
  if (quizState === 'finished') {
    return (
      <QuizResults
        score={score}
        totalQuestions={questions.length}
        history={history}
        onRestart={handleRestartWithSameSettings} // Sẽ cải tiến sau
        onNewSetup={resetToSetup}
      />
    );
  }

  // Nếu đang chơi (và có câu hỏi để hiển thị)
  if (quizState === 'playing' && currentQuestion) {
    const currentQuestion = questions[currentQuestionIndex];
    // --- KHÔNG CẦN THAY ĐỔI GÌ Ở ĐÂY ---
    // Code cũ của chúng ta đã được cập nhật để xử lý object `Question`
    // Vì vậy, chúng ta chỉ cần truyền `questionText` và `correctAnswer` xuống.
    // Điều này sẽ hoạt động cho cả quiz Kana và quiz Từ vựng.
    return (
      <QuizPlayer
        question={currentQuestion.questionText}
        answer={currentQuestion.correctAnswer}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        score={score}
        onAnswer={handleAnswer} // Truyền thẳng hàm từ hook xuống
        onNext={handleNext}       // Truyền thẳng hàm từ hook xuống
      />
    );
  }

  // Fallback UI trong trường hợp không có trạng thái nào khớp
  return <div>Đang tải...</div>;
}