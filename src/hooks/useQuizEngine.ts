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
import { generateKanaQuestions, generateViToJpTypingQuestions, generateJpToViMcqQuestions } from "../utils/quizHelpers";
import { ALL_LESSONS_DATA } from "../data/minnaData";

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
    const [, setScore] = useState<number>(0);
    const [history, setHistory] = useState<QuizHistoryItem[]>([]);

    // Thời gian còn lại cho câu hiện tại (null = không có timer)
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Lưu lại settings hiện tại của quiz (để handleAnswer & timer biết chế độ)
    const [quizSettings, setQuizSettings] = useState<QuizSettings | null>(null);

    // Ref để ghi lại những index đã được trả lời (ngăn double submit / race)
    const answeredSetRef = useRef<Set<number>>(new Set());

    /**
    * ADDED: Cờ đảm bảo timeout chỉ được trigger một lần cho mỗi câu.
    * Dùng để tránh gọi handleAnswer/handleMcqAnswer nhiều lần khi timeLeft === 0.
    */
    const timedOutTriggeredRef = useRef<boolean>(false);
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
            if (s.quizFormat === "JP_TO_VI_MCQ") {
                generatedQuestions = generateJpToViMcqQuestions(s.selectedLessons, s.numQuestions);
            } else {
                generatedQuestions = generateViToJpTypingQuestions(s.selectedLessons, s.numQuestions);
            }
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
        // ADDED: reset cờ timed-out khi khởi tạo phiên quiz mới
        timedOutTriggeredRef.current = false;

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
        settingsArg?: QuizSettings,
        meta?: { timedOut?: boolean }
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

        // Nếu là timeout nhưng user input đúng, ta ĐÁNH DẤU là đúng nhưng flagged timedOut
        const wasTimedOut = !!(meta && meta.timedOut);
        // Trong yêu cầu bạn muốn màu vàng khi timedOut nhưng input đúng
        //  -> chúng ta vẫn coi isFullyCorrect là true nếu match, và lưu timedOut flag
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
            timedOut: wasTimedOut ?? false,
        };

        answeredSetRef.current.add(idx);
        setHistory(prev => [...prev, newHistoryItem]);
        console.log(`[useQuizEngine] answered idx=${idx}, isFullyCorrect=${isFullyCorrect}, history now=${history.length + 1}`);
    }, [questions, currentQuestionIndex, quizSettings]);

    // -------------------------
    // Hàm xử lý dành cho MCQ (JP -> VI)
    // rawAnswer: chuỗi là đáp án VI được chọn
    // Thao tác tương tự handleAnswer nhưng đơn giản hơn vì so sánh trực tiếp VI
    const handleMcqAnswer = useCallback((rawAnswer: string, settingsArg?: QuizSettings, meta?: { timedOut?: boolean }) => {
        const settings = settingsArg ?? quizSettings;
        if (!settings) {
            console.warn("handleMcqAnswer: thiếu quizSettings");
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
            console.warn("Không có câu hỏi hiện tại để chấm (MCQ).");
            return;
        }

        const selected = String(rawAnswer ?? "").trim();

        // Tìm correctVi từ ALL_LESSONS_DATA bằng cách match questionText (JP)
        let correctVi: string | null = null;
        try {
            const lessons = Object.keys(ALL_LESSONS_DATA).map(Number);
            outer: for (const n of lessons) {
                const lesson = (ALL_LESSONS_DATA as any)[n];
                if (!lesson || !lesson.vocabulary) continue;
                for (const item of lesson.vocabulary) {
                    if (!item) continue;
                    if (String(item.jp ?? "").trim() === String(q.questionText).trim() || String(item.hira ?? "").trim() === String(q.questionText).trim()) {
                        correctVi = String(item.vi ?? "").trim();
                        break outer;
                    }
                }
            }
        } catch (e) {
            console.warn("handleMcqAnswer: error searching ALL_LESSONS_DATA", e);
        }

        // fallback: if we couldn't find correctVi, fallback to a conservative default (mark incorrect)
        const isCorrect = correctVi ? selected === correctVi : false;

        const newHistoryItem: QuizHistoryItem = {
            question: q.questionText,
            correctAnswer: {
                romaji: correctVi ?? "",
                hiragana: q.correctAnswers.hiragana,
                kanji: q.correctAnswers.kanji,
            },
            userAnswer: {
                romaji: selected,
                hiragana: "",
                kanji: "",
            },
            isCorrect,
            results: { romaji: null, hiragana: null, kanji: null },
            options: q.options,
            timedOut: !!(meta && meta.timedOut),
        };

        if (isCorrect) setScore(prev => prev + 1);

        answeredSetRef.current.add(idx);
        setHistory(prev => [...prev, newHistoryItem]);
        console.log(`[useQuizEngine][MCQ] answered idx=${idx}, selected=${selected}, isCorrect=${isCorrect}, history now=${history.length + 1}`);
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
                timedOutTriggeredRef.current = false;
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
        timedOutTriggeredRef.current = false;
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
                    //code cũ: handleAnswer({ romaji: "TIME_OUT", hiragana: "TIME_OUT", kanji: "" }, quizSettings);
                    //thiết bị UI sẽ nhận timeLeft === 0 và tự nộp với nội dung hiện có (để lưu đúng input).
                    clearInterval(intervalId);
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

    /**
    * ADDED: Parent-driven timeout handling
    * - Khi timeLeft === 0 sẽ tự gọi chấm điểm cho câu hiện tại (MCQ gọi handleMcqAnswer, typing gọi handleAnswer)
    * - Dùng answeredSetRef + timedOutTriggeredRef để đảm bảo chỉ trigger 1 lần và tránh double submit
    */
    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft > 0) return;

        const idx = currentQuestionIndex;

        // Nếu đã chấm rồi hoặc đã trigger timeout trước đó thì dừng
        if (answeredSetRef.current.has(idx) || timedOutTriggeredRef.current) {
            return;
        }

        // Đánh dấu đã trigger để không gọi lại
        timedOutTriggeredRef.current = true;

        try {
            // Nếu là MCQ (JP -> VI) thì gọi handleMcqAnswer
            if (quizSettings && quizSettings.quizType === "VOCABULARY" && (quizSettings as VocabQuizSettings).quizFormat === "JP_TO_VI_MCQ") {
                handleMcqAnswer("", undefined, { timedOut: true });
            } else {
                // Với typing quiz (KANA hoặc VI->JP), nộp payload TIME_OUT để chấm (theo logic hiện tại của bạn)
                handleAnswer({ romaji: "TIME_OUT", hiragana: "TIME_OUT", kanji: "" }, undefined, { timedOut: true });
            }
        } catch (e) {
            console.warn("Error auto-submitting on timeout:", e);
        }
    }, [timeLeft, currentQuestionIndex, quizSettings, handleMcqAnswer, handleAnswer]);

    // -------------------------
    // Tính score/percent (tiện ích)
    // -------------------------
    // score được cập nhật trực tiếp khi chấm; tuy nhiên tính lại từ history để an toàn
    const computedScore = history.filter(h => h.isCorrect).length;
    // Đếm số câu đúng nhưng hết giờ
    const correctButTimedOut = history.filter(h => h.isCorrect && h.timedOut).length;
    // nếu bạn muốn giữ state score riêng, có thể đồng bộ setScore(computedScore) mỗi khi history thay đổi
    useEffect(() => {
        setScore(computedScore);
    }, [computedScore]);

    // ADDED: đảm bảo reset timedOutTriggeredRef mỗi khi currentQuestionIndex hoặc questions.length thay đổi
    useEffect(() => {
        timedOutTriggeredRef.current = false;
    }, [currentQuestionIndex, questions.length]);

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
        // Đếm số câu đúng nhưng hết giờ
        correctButTimedOut,

        // hàm điều khiển
        startQuiz,
        handleAnswer,
        handleMcqAnswer,
        handleNext,
        resetToSetup, // alias tương thích với QuizPage

        // tiện ích
        quizSettings,
        percent,
    };
};
