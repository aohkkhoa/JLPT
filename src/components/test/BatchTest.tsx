import TestControls from "./TestControls";
import useOutsideClick from "../../hooks/useOutsideClick";
import React, { useRef } from "react";
import type { QAItem } from "../../utils/testHelpers";

// Dán function component vào đây
export default function BatchTest() {
  // trạng thái chính
  const [questions, setQuestions] = React.useState<QAItem[]>([]);
  const [input, setInput] = React.useState("");
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [activeTooltipIndex, setActiveTooltipIndex] = React.useState<number | null>(null);

    // ref bao bọc toàn bộ vùng test (fix click-outside)
  const containerRef = useRef<HTMLDivElement | null>(null);
  // khi click ngoài, đóng tooltip
  useOutsideClick(containerRef, () => setActiveTooltipIndex(null), [activeTooltipIndex]);

  // onStart nhận từ TestControls -> set questions + reset UI
  const handleStart = (qs: QAItem[], meta: {
    testType: string;
    count: number;
    inOrder: boolean;
    startRange?: number;
    endRange?: number;
    filterByStrokes?: boolean;
  }) => {
    setQuestions(qs);
    setInput("");
    setShowAnswer(false);
    setActiveTooltipIndex(null);

    console.log("[BatchTest] started", meta, "questionsCount=", qs.length);
  };

  // checkAnswers đơn giản: bật showAnswer (mình sẽ bổ sung so sánh sau)
  const checkAnswers = () => setShowAnswer(true);

  // handle click item -> mở/đóng tooltip
  const handleCharacterClick = (index: number) => setActiveTooltipIndex(prev => prev === index ? null : index);

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-700 mb-6">🧠 Luyện tập theo nhóm</h1>

      {/* --> Thay phần controls cũ bằng component TestControls */}
      <TestControls onStart={handleStart} />

      {/* Test area: bao bọc bởi containerRef để useOutsideClick hoạt động */}
      {questions.length > 0 && (
        <div ref={containerRef} className="mt-6 w-full">
          {/* hiển thị câu (giữ nguyên layout bạn có) */}
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            {questions.map(([q, a], i) => (
              <div key={i} className="relative cursor-pointer" onClick={() => handleCharacterClick(i)}>
                <span className="text-3xl">{q}</span>

                {activeTooltipIndex === i && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-md shadow-lg z-10">
                    {a}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* input + actions */}
          <input
            type="text"
            placeholder="Nhập đáp án cách nhau bằng dấu cách hoặc xuống dòng..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full text-center p-2 border border-gray-300 rounded-lg text-lg"
            disabled={showAnswer}
          />

          <div className="mt-4 flex justify-center gap-4 mb-4">
            {!showAnswer ? (
              <button onClick={checkAnswers} className="px-6 py-2 bg-sky-300 text-white rounded-full shadow hover:opacity-90 transition-all">Xem đáp án</button>
            ) : (
              <button onClick={() => {/* rerun last settings: simply restart with same questions */ setQuestions([]); }} className="px-6 py-2 bg-pink-300 text-white rounded-full shadow hover:opacity-90 transition-all">Làm lại</button>
            )}
          </div>

          {/* show answers khi showAnswer = true */}
          {showAnswer && (
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-lg">
              {questions.map(([_q, a], i) => (
                <div key={i} className="px-3 py-2 bg-green-100 rounded-md">
                  {a}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}