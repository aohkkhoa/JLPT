// src/pages/QuizPage.tsx

import { useState } from 'react';
import { useQuizEngine } from '../hooks/useQuizEngine';
import QuizSetup from '../components/quiz/QuizSetup';
import QuizResults from '../components/quiz/QuizResults';
import TypingQuestion from '../components/quiz/TypingQuestion'; // <-- IMPORT MỚI
import KanaTypingQuestion from '../components/quiz/KanaTypingQuestion'; // <-- IMPORT MỚI
import type { QuizSettings, UserTypingAnswer } from '../types/quiz';

export default function QuizPage() {
  const {
    quizState,
    currentQuestion,
    questions,
    score,
    history,
    currentQuestionIndex,
    timeLeft,
    currentQuestionResult,
    startQuiz,
    handleAnswer,
    resetToSetup,
  } = useQuizEngine();

  // isCurrentQuestionAnswered giờ có thể được tính toán đơn giản hơn
  const isCurrentQuestionAnswered = !!currentQuestionResult;
  const [lastQuizSettings, setLastQuizSettings] = useState<QuizSettings | null>(null);

  const handleStart = (settings: QuizSettings) => {
    setLastQuizSettings(settings);
    startQuiz(settings);
  };

  const handleRestartWithSameSettings = () => {
    if (lastQuizSettings) {
      startQuiz(lastQuizSettings);
    } else {
      resetToSetup();
    }
  };

  // --- Logic Render được cập nhật ---
  if (quizState === 'setup') {
    return <QuizSetup onStart={handleStart} />;
  }

  if (quizState === 'finished') {
    return (
      <QuizResults
        score={score}
        totalQuestions={questions.length}
        history={history}
        onRestart={handleRestartWithSameSettings}
        onNewSetup={resetToSetup}
      />
    );
  }

  // LOGIC HIỂN THỊ COMPONENT CÂU HỎI PHÙ HỢP
  if (quizState === 'playing' && currentQuestion && lastQuizSettings) {
    // Nếu là quiz Từ vựng dạng Typing
    if (lastQuizSettings.quizType === 'VOCABULARY' && lastQuizSettings.quizFormat === 'VI_TO_JP_TYPING' && lastQuizSettings.typingSettings) {
      return (
        <TypingQuestion
          timeLeft={timeLeft}
          questionData={currentQuestion}
          typingSettings={lastQuizSettings.typingSettings}
          onAnswer={(userAnswer: UserTypingAnswer) => handleAnswer(userAnswer, lastQuizSettings)}
          isLastQuestion={currentQuestionIndex === questions.length - 1}
          isAnswered={isCurrentQuestionAnswered} // <-- TRUYỀN PROP MỚI
          result={currentQuestionResult} // <-- TRUYỀN PROP MỚI
        />
      );
    }

    // Nếu là quiz Bảng chữ cái (cũng là dạng Typing)
    if (lastQuizSettings.quizType === 'KANA') {
      // Chúng ta sẽ tạo một component riêng cho Kana để giữ cho code gọn gàng
      // Tạm thời có txhể dùng lại TypingQuestion với một số điều chỉnh, nhưng tách riêng sẽ tốt hơn
      return (
        <KanaTypingQuestion
          timeLeft={timeLeft}
          questionData={currentQuestion}
          onAnswer={(userAnswer: string) => handleAnswer({ romaji: userAnswer, hiragana: '', kanji: '' }, lastQuizSettings)}
          score={score}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          isAnswered={isCurrentQuestionAnswered} // <-- TRUYỀN PROP MỚI
          result={currentQuestionResult} // <-- TRUYỀN PROP MỚI
        />
      );
    }

    // Sau này sẽ thêm các dạng MCQ ở đây
    // if (lastQuizSettings.quizFormat === 'JP_TO_VI_MCQ') { ... }
  }

  return <div>Đang tải bài kiểm tra...</div>;
}