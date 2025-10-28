// src/components/quiz/QuizResults.tsx

import { getFeedback, type QuizHistoryItem } from '../../hooks/useQuizEngine';

// Props mà component này cần
interface QuizResultsProps {
    score: number;
    totalQuestions: number;
    history: QuizHistoryItem[];
    onRestart: () => void; // Làm lại với cài đặt cũ
    onNewSetup: () => void; // Quay về màn hình cài đặt
}

export default function QuizResults({
    score,
    totalQuestions,
    history,
    onRestart,
    onNewSetup
}: QuizResultsProps) {
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const feedback = getFeedback(percentage);

    // --- JSX được copy từ file QuizMode cũ ---
    return (
        <div className="w-full max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-2 text-indigo-600">Hoàn thành!</h2>
            <p className="text-2xl mb-2">
                Điểm của bạn:{" "}
                <span className="font-bold text-2xl text-pink-500">
                    {score} / {totalQuestions}
                </span>
                <span className="text-xl text-gray-600 ml-2">({percentage}%)</span>
            </p>
            <p className={`text-lg font-semibold mb-6 ${feedback.color}`}>{feedback.message}</p>
            <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={onRestart}
                    className="px-8 py-3 bg-gradient-to-r from-pink-400 to-sky-400 text-white rounded-full font-semibold shadow-lg hover:opacity-90 transition-all"
                >
                    Làm lại
                </button>
                <button
                    onClick={onNewSetup}
                    className="px-8 py-3 bg-gray-200 text-gray-700 rounded-full font-semibold shadow-lg hover:bg-gray-300 transition-all"
                >
                    Cài đặt mới
                </button>
            </div>

            <div className="bg-white/50 rounded-2xl p-4 text-left max-h-[35vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-700 mb-4">Xem lại bài làm</h3>
                <div className="space-y-3">
                    {history.map((item, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-lg ${item.isCorrect ? 'bg-green-100/70' : 'bg-red-100/70'}`}
                        >
                            <div className="flex items-start">
                                {/* Cột 1: Dấu check/cross */}
                                <span className={`mr-3 font-bold text-xl ${item.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                    {item.isCorrect ? '✓' : '✗'}
                                </span>

                                {/* Cột 2: Nội dung câu hỏi và câu trả lời */}
                                <div className="flex-1">
                                    {/* Dòng 1: Câu hỏi */}
                                    <p className="font-semibold text-gray-800 break-words">
                                        <span className="text-gray-500 font-medium">Câu hỏi: </span>
                                        {item.question}
                                    </p>

                                    {/* Dòng 2: Đáp án đúng */}
                                    <p className="mt-1 text-green-700 break-words">
                                        <span className="font-medium">Đáp án: </span>
                                        <span className="font-bold">{item.correctAnswer}</span>
                                    </p>

                                    {/* Dòng 3: Câu trả lời của bạn (chỉ hiện khi sai) */}
                                    {!item.isCorrect && (
                                        <p className="mt-1 text-red-700 break-words">
                                            <span className="font-medium">Bạn trả lời: </span>
                                            <span className="font-semibold">{item.userAnswer || '(bỏ trống)'}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}