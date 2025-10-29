// src/hooks/useQuizEngine.ts
import { useCallback, useEffect, useRef, useState } from "react";
import type {
    KanaQuizSettings,
    VocabQuizSettings,
    Question,
    QuizHistoryItem,
    TypingAnswerResult,
    QuizSettings,
    UserTypingAnswer,
} from "../types/quiz";
import { generateKanaQuestions, generateViToJpTypingQuestions } from "../utils/quizHelpers";

/**
 * useQuizEngine - Hook chính quản lý luồng quiz
 *
 * Trả về nhiều giá trị & hàm để component UI sử dụng:
 * - quizState, questions, currentQuestionIndex, currentQuestion, score, history, timeLeft, currentQuestionResult
 * - startQuiz(settings), handleAnswer(answer, settings?), handleNext(), resetToSetup()
 *
 * Toàn bộ chú thích bên dưới bằng tiếng Việt.
 */
export const useQuizEngine = () => {
    // -------------------------
    // State quản lý chung
    // -------------------------
    const [quizState, setQuizState] = useState<"setup" | "playing" | "finished">("setup");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [,setScore] = useState<number>(0);
    const [history, setHistory] = useState<QuizHistoryItem[]>([]);

    // Thời gian còn lại cho câu hiện tại (null = không có timer)
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Lưu lại settings hiện tại của quiz (để handleAnswer & timer biết chế độ)
    const [quizSettings, setQuizSettings] = useState<QuizSettings | null>(null);

    // Ref để ghi lại những index đã được trả lời (ngăn double submit / race)
    const answeredSetRef = useRef<Set<number>>(new Set());

    // -------------------------
    // Tiện ích: trả về câu hỏi hiện tại và kết quả hiện tại
    // -------------------------
    const currentQuestion = questions[currentQuestionIndex] ?? null;
    const currentQuestionResult = history[currentQuestionIndex] ?? null;

    // -------------------------
    // Bắt đầu quiz mới
    // - Sinh câu hỏi dựa trên QuizSettings
    // - Reset toàn bộ state cần thiết
    // -------------------------
    const startQuiz = useCallback((settings: QuizSettings) => {
        let generatedQuestions: Question[] = [];

        if (settings.quizType === "KANA") {
            const s = settings as KanaQuizSettings;
            generatedQuestions = generateKanaQuestions(s.selectedSets, s.numQuestions);
        } else {
            const s = settings as VocabQuizSettings;
            generatedQuestions = generateViToJpTypingQuestions(s.selectedLessons, s.numQuestions);
        }

        if (!generatedQuestions || generatedQuestions.length === 0) {
            // Nếu không sinh được câu hỏi, cảnh báo và không chuyển state
            alert("Không có đủ câu hỏi cho lựa chọn của bạn.");
            return;
        }

        // Reset state cho phiên quiz mới
        setQuizSettings(settings);
        setQuestions(generatedQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setHistory([]);
        setQuizState("playing");
        answeredSetRef.current.clear();

        // Khởi tạo timer nếu cần (chế độ hard)
        if (settings.difficulty === "hard") {
            // Quy ước: thời gian mặc định: KANA = 5s, VOCABULARY = 15s (có thể điều chỉnh)
            const timePerQuestion = settings.quizType === "KANA" ? 5 : 15;
            setTimeLeft(timePerQuestion);
        } else {
            setTimeLeft(null);
        }
    }, []);

    // -------------------------
    // Hàm xử lý khi người dùng nộp đáp án
    // - Hỗ trợ nhận answer là string (romaji) hoặc object UserTypingAnswer
    // - Nếu settingsArg được truyền vào, sẽ dùng nó; nếu không, dùng quizSettings lưu trong state
    // - Bảo vệ double submit bằng answeredSetRef
    // -------------------------
    const handleAnswer = useCallback((
        rawAnswer: string | Partial<UserTypingAnswer>,
        settingsArg?: QuizSettings
    ) => {
        const settings = settingsArg ?? quizSettings;
        if (!settings) {
            console.warn("handleAnswer: thiếu quizSettings để chấm điểm.");
            return;
        }

        const idx = currentQuestionIndex;
        // Nếu đã chấm rồi thì ignore
        if (answeredSetRef.current.has(idx)) {
            console.warn("Double submission blocked for index", idx);
            return;
        }

        const q = questions[idx];
        if (!q) {
            console.warn("Không có câu hỏi hiện tại để chấm.");
            return;
        }

        // Chuẩn hoá user answer thành UserTypingAnswer để lưu lại history
        const finalUserAnswer: UserTypingAnswer = {
            romaji: typeof rawAnswer === "string" ? (rawAnswer ?? "").toLowerCase().trim() : ((rawAnswer.romaji ?? "") as string).toLowerCase().trim(),
            hiragana: typeof rawAnswer === "string" ? "" : (rawAnswer.hiragana ?? "").trim(),
            kanji: typeof rawAnswer === "string" ? "" : (rawAnswer.kanji ?? "").trim(),
        };

        // Kết quả chi tiết theo từng phần
        const answerResults: TypingAnswerResult = { romaji: null, hiragana: null, kanji: null };
        let isFullyCorrect = true;

        if (settings.quizType === "VOCABULARY") {
            // Với VOCABULARY, cần chú ý typingSettings
            const s = settings as VocabQuizSettings;
            const typingSettings = s.typingSettings ?? { checkRomaji: true, checkHiragana: false, checkKanji: false };

            const correctRomaji = q.correctAnswers.romaji ?? "";
            const correctHiragana = q.correctAnswers.hiragana ?? "";
            const correctKanji = q.correctAnswers.kanji ?? "";

            if (typingSettings.checkRomaji) {
                const ok = finalUserAnswer.romaji === correctRomaji;
                answerResults.romaji = ok;
                if (!ok) isFullyCorrect = false;
            }

            if (typingSettings.checkHiragana) {
                const ok = finalUserAnswer.hiragana === correctHiragana;
                answerResults.hiragana = ok;
                if (!ok) isFullyCorrect = false;
            }

            if (typingSettings.checkKanji) {
                const ok = (finalUserAnswer.kanji ?? "") === (correctKanji ?? "");
                answerResults.kanji = ok;
                if (!ok) isFullyCorrect = false;
            }

            // Nếu người dùng không bật bất kỳ phần nào, coi là sai (điều này đã được validate ở setup nhưng vẫn kiểm tra)
            if (!typingSettings.checkRomaji && !typingSettings.checkHiragana && !typingSettings.checkKanji) {
                isFullyCorrect = false;
            }
        } else {
            // Với KANA quiz tiêu chuẩn, chỉ check romaji
            const correctRomaji = q.correctAnswers.romaji ?? "";
            const ok = finalUserAnswer.romaji === correctRomaji;
            answerResults.romaji = ok;
            isFullyCorrect = ok;
        }

        // Cập nhật điểm & history
        if (isFullyCorrect) {
            setScore(prev => prev + 1);
        }

        const newHistoryItem: QuizHistoryItem = {
            question: q.questionText,
            correctAnswer: q.correctAnswers,
            userAnswer: finalUserAnswer,
            isCorrect: isFullyCorrect,
            results: answerResults,
            options: q.options,
        };

        answeredSetRef.current.add(idx);
        setHistory(prev => [...prev, newHistoryItem]);
        console.log(`[useQuizEngine] answered idx=${idx}, isFullyCorrect=${isFullyCorrect}, history now=${history.length + 1}`);
    }, [questions, currentQuestionIndex, quizSettings]);

    // -------------------------
    // handleNext: chuyển thủ công sang câu tiếp theo (nút Next)
    // -------------------------
    const handleNext = useCallback(() => {
        setCurrentQuestionIndex(prevIdx => {
            if (prevIdx < questions.length - 1) {
                // khi chuyển tiếp, reset timer theo settings
                if (quizSettings && quizSettings.difficulty === "hard") {
                    const timePerQuestion = quizSettings.quizType === "KANA" ? 5 : 15;
                    setTimeLeft(timePerQuestion);
                } else {
                    setTimeLeft(null);
                }
                return prevIdx + 1;
            } else {
                setTimeLeft(null);
                setQuizState("finished");
                return prevIdx;
            }
        });
    }, [questions.length, quizSettings]);

    // -------------------------
    // resetToSetup: quay lại màn hình cài đặt (tương tự resetQuiz)
    // -------------------------
    const resetToSetup = useCallback(() => {
        setQuizState("setup");
        setQuestions([]);
        setHistory([]);
        setCurrentQuestionIndex(0);
        setScore(0);
        setTimeLeft(null);
        setQuizSettings(null);
        answeredSetRef.current.clear();
    }, []);

    // -------------------------
    // useEffect cho timer: chỉ chạy khi quizState === 'playing' và quizSettings.difficulty === 'hard'
    // - Đồng thời bảo vệ: nếu câu hiện tại đã có lịch sử (đã trả lời) thì không khởi tạo timer
    // -------------------------
    useEffect(() => {
        if (quizState !== "playing" || !quizSettings || quizSettings.difficulty !== "hard") {
            return;
        }

        // Nếu câu này đã được trả lời (history chứa nó) thì không đặt timer
        if (history.length > currentQuestionIndex) {
            return;
        }

        // Nếu đã qua hết câu
        if (history.length === questions.length && questions.length > 0) {
            setTimeLeft(null);
            return;
        }

        // Nếu timeLeft null (ví dụ startQuiz set), set lại mặc định theo loại quiz
        if (timeLeft === null) {
            const defaultTime = quizSettings.quizType === "KANA" ? 5 : 15;
            setTimeLeft(defaultTime);
        }

        // Khởi động interval giảm thời gian
        const intervalId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null) return null;
                if (prev <= 1) {
                    // Hết giờ: tự nộp một đáp án TIME_OUT (đánh dấu sai)
                    // Gọi handleAnswer với payload TIME_OUT
                    handleAnswer({ romaji: "TIME_OUT", hiragana: "TIME_OUT", kanji: "" }, quizSettings);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [quizState, quizSettings, currentQuestionIndex, history.length, questions.length, timeLeft, handleAnswer]);

    // -------------------------
    // useEffect auto-advance khi history được cập nhật cho câu hiện tại
    // Nếu lịch sử đã có mục cho câu hiện tại, sau 1.2s tự gọi handleNext
    // -------------------------
    useEffect(() => {
        if (quizState !== "playing") return;

        if (history.length === currentQuestionIndex + 1) {
            console.log(`[useQuizEngine] auto-advance check: idx=${currentQuestionIndex}, historyLength=${history.length}, questionsLen=${questions.length}`);
            const t = setTimeout(() => {
                // Nếu chưa là câu cuối thì next, nếu là cuối, set finished (handleNext sẽ làm)
                if (currentQuestionIndex < questions.length - 1) {
                    handleNext();
                } else {
                    setTimeLeft(null);
                    setQuizState("finished");
                }
            }, 1200);
            return () => clearTimeout(t);
        }
    }, [history.length, currentQuestionIndex, quizState, handleNext, questions.length]);

    // -------------------------
    // Tính score/percent (tiện ích)
    // -------------------------
    // score được cập nhật trực tiếp khi chấm; tuy nhiên tính lại từ history để an toàn
    const computedScore = history.filter(h => h.isCorrect).length;
    // nếu bạn muốn giữ state score riêng, có thể đồng bộ setScore(computedScore) mỗi khi history thay đổi
    useEffect(() => {
        setScore(computedScore);
    }, [computedScore]);

    const percent = questions.length > 0 ? Math.round((computedScore / questions.length) * 100) : 0;

    // -------------------------
    // Trả về các giá trị & hàm — bao gồm các alias để tương thích với QuizPage
    // -------------------------
    return {
        // state chính
        quizState, // alias dùng trong QuizPage
        questions,
        currentQuestionIndex, // alias dùng trong QuizPage
        currentQuestion,
        score: computedScore,
        history,
        timeLeft,
        currentQuestionResult, // alias (history[currentQuestionIndex] || null)

        // hàm điều khiển
        startQuiz,
        handleAnswer,
        handleNext,
        resetToSetup, // alias tương thích với QuizPage

        // tiện ích
        quizSettings,
        percent,
    };
};
