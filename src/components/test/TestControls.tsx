// src/components/test/TestControls.tsx
import React from "react";
import type { QAItem } from "../../utils/testHelpers";
import { generateBatchQuestions } from "../../utils/testHelpers";

type TestType = "radical" | "base" | "dakuten" | "yoon";

interface ControlsProps {
  initialType?: TestType;
  initialCount?: number;
  initialInOrder?: boolean;
  initialStart?: number;
  initialEnd?: number;
  onStart: (questions: QAItem[], meta: {
    testType: TestType;
    count: number;
    inOrder: boolean;
    startRange?: number;
    endRange?: number;
    filterByStrokes?: boolean;
  }) => void;
}

/**
 * TestControls
 * - Rút gọn từ QuizSetup cho BatchTest
 * - Chỉ export giao diện + gọi generateBatchQuestions khi bấm Start
 */
export default function TestControls({
  initialType = "radical",
  initialCount = 5,
  initialInOrder = false,
  initialStart = 1,
  initialEnd = 10, // Mặc định cho khoảng dựa trên chỉ mục
  onStart,
}: ControlsProps) {
  const [testType, setTestType] = React.useState<TestType>(initialType);
  const [count, setCount] = React.useState<number>(initialCount);
  const [filterByStrokes, setFilterByStrokes] = React.useState<boolean>(false); // State mới, mặc định là false
  const [inOrder, setInOrder] = React.useState<boolean>(initialInOrder);
  const [startRange, setStartRange] = React.useState<number>(initialStart);
  const [endRange, setEndRange] = React.useState<number>(initialEnd);

  const labels: Record<TestType, string> = {
    radical: "Bộ thủ",
    base: "Cơ bản",
    dakuten: "Biến âm",
    yoon: "Âm ghép",
  };

  const handleStart = () => {
    // Kiểm tra cơ bản
    if (testType === "radical" && (inOrder || filterByStrokes)) {
      if (startRange < 1 || endRange < 1 || startRange > endRange) {
        alert("Khoảng không hợp lệ: start <= end và >= 1");
        return;
      }
    }

    const qs = generateBatchQuestions({
      testType,
      count,
      inOrder,
      startRange,
      endRange,
      filterByStrokes, // Truyền tham số mới
    });

    if (!qs || qs.length === 0) {
      alert("Không có câu phù hợp — kiểm tra lại cài đặt hoặc dữ liệu.");
      return;
    }

    onStart(qs, { testType, count, inOrder, startRange, endRange, filterByStrokes }); // Truyền filterByStrokes trong meta
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-4">
      <div className="flex gap-2">
        {(["radical", "base", "dakuten", "yoon"] as TestType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTestType(t)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${testType === t ? "bg-pink-300 text-white" : "bg-white text-gray-500 hover:bg-pink-50"}`}
          >
            {labels[t]}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-4">
        <div className="flex flex-col items-center">
          <label className="text-sm text-gray-600 mb-1">Số câu</label>
          <input
            type="number"
            min={1}
            value={count}
            onChange={(e) => setCount(Math.max(1, Number(e.target.value || 1)))}
            className="w-24 text-center p-2 rounded-lg border border-gray-300"
          />
        </div>
      </div>
      <div className="flex item-center">
        {/* Checkbox để lọc theo số nét */}
        {testType === "radical" && (
          <>
            <div className="flex items-center gap-2 mr-4">
              <input id="filterByStrokes" type="checkbox" checked={filterByStrokes} onChange={(e) => setFilterByStrokes(e.target.checked)} className="h-4 w-4" />
              <label htmlFor="filterByStrokes" className="text-sm text-gray-600">Lọc theo số nét</label>
            </div>
            {/* Đổi tên label của checkbox "Chọn khoảng" thành "Giữ nguyên thứ tự" cho rõ nghĩa hơn */}
            <div className="flex items-center gap-2">
              <input id="inOrder" type="checkbox" checked={inOrder} onChange={(e) => setInOrder(e.target.checked)} className="h-4 w-4" />
              <label htmlFor="inOrder" className="text-sm text-gray-600">Giữ nguyên thứ tự</label>
            </div>
          </>
        )}
      </div>

      {/* Input cho khoảng, hiển thị khi testType là radical VÀ (inOrder là true HOẶC filterByStrokes là true) */}
      {testType === "radical" && (inOrder || filterByStrokes) && (
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <label className="text-sm text-gray-600 mb-1">
              {filterByStrokes ? "Từ số nét" : "Từ bộ số"}
            </label>
            <input type="number" min={1} value={startRange} onChange={(e) => setStartRange(Math.max(1, Number(e.target.value || 1)))} className="w-24 text-center p-2 rounded-lg border border-gray-300" />
          </div>
          <div className="flex flex-col items-center">
            <label className="text-sm text-gray-600 mb-1">
              {filterByStrokes ? "Đến số nét" : "Đến bộ số"}
            </label>
            <input type="number" min={1} value={endRange} onChange={(e) => setEndRange(Math.max(1, Number(e.target.value || 1)))} className="w-24 text-center p-2 rounded-lg border border-gray-300" />
          </div>
        </div>
      )}

      <div>
        <button onClick={handleStart} className="px-6 py-2 bg-gradient-to-r from-pink-300 via-sky-300 to-indigo-300 text-white rounded-full font-semibold shadow-md hover:opacity-90 transition-all">
          Bắt đầu
        </button>
      </div>
    </div>
  );
}
