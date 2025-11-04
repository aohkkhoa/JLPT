// src/pages/QuizPage.tsx

import { useState } from 'react';
import { useQuizEngine } from '../hooks/useQuizEngine';
import QuizSetup from '../components/quiz/QuizSetup';
import QuizResults from '../components/quiz/QuizResults';
import TypingQuestion from '../components/quiz/TypingQuestion'; // <-- IMPORT MỚI
import KanaTypingQuestion from '../components/quiz/KanaTypingQuestion'; // <-- IMPORT MỚI
import McqQuestion from '../components/quiz/McqQuestion';
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
    quizSettings,
    startQuiz,
    handleAnswer,
    handleNext,
    handleMcqAnswer,
    resetToSetup,
  } = useQuizEngine();

  // isCurrentQuestionAnswered giờ có thể được tính toán đơn giản hơn
  const isCurrentQuestionAnswered = !!currentQuestionResult;
  const allowEnterAdvance = quizSettings?.difficulty === "easy";
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
        correctButTimedOut={history.filter(item => item.isCorrect && item.timedOut).length} // Đếm số câu đúng nhưng hết giờ
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
          onAnswer={(userAnswer: UserTypingAnswer, meta?: { timeOut?: boolean }) => handleAnswer(userAnswer, lastQuizSettings, meta?.timeOut ? { timedOut: true } : undefined)}
          isLastQuestion={currentQuestionIndex === questions.length - 1}
          isAnswered={isCurrentQuestionAnswered} // <-- TRUYỀN PROP MỚI
          result={currentQuestionResult} // <-- TRUYỀN PROP MỚI
          onNext={handleNext}
          allowEnterAdvanceOnAnswered={allowEnterAdvance}
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
          onAnswer={(userAnswer: string, meta?: { timeOut?: boolean }) => handleAnswer({ romaji: userAnswer, hiragana: '', kanji: '' }, lastQuizSettings, meta?.timeOut ? { timedOut: true } : undefined)}
          score={score}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          isAnswered={isCurrentQuestionAnswered} // <-- TRUYỀN PROP MỚI
          result={currentQuestionResult} // <-- TRUYỀN PROP MỚI
          onNext={handleNext}
          allowEnterAdvanceOnAnswered={allowEnterAdvance}
        />
      );
    }

    // Sau này sẽ thêm các dạng MCQ ở đây
    if (lastQuizSettings.quizType === 'VOCABULARY' && (lastQuizSettings as any).quizFormat === 'JP_TO_VI_MCQ') {
      return (
        <McqQuestion
          timeLeft={timeLeft}
          questionData={currentQuestion}
          onAnswer={(selected: string, meta?: { timeOut?: boolean }) => handleMcqAnswer(selected, lastQuizSettings, meta?.timeOut ? { timedOut: true } : undefined)}
          isAnswered={isCurrentQuestionAnswered}
          // result can be used by MCQ component later
          currentResult={currentQuestionResult ? {
            correctAnswer: currentQuestionResult.correctAnswer?.romaji ?? "", // correctVi was stored in romaji field
            userAnswer: currentQuestionResult.userAnswer?.romaji ?? "",
            timedOut: !!currentQuestionResult.timedOut,
          }
            : null}
          onNext={handleNext}
          allowEnterAdvanceOnAnswered={allowEnterAdvance}
        />
      );
    }
  }

  return <div>Đang tải bài kiểm tra...</div>;
}