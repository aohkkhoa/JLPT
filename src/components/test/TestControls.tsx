// src/components/test/TestControls.tsx
import React, { useMemo } from "react";
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
  initialEnd = 10,
  onStart,
}: ControlsProps) {
  const [testType, setTestType] = React.useState<TestType>(initialType);
  const [count, setCount] = React.useState<number>(initialCount);
  const [inOrder, setInOrder] = React.useState<boolean>(initialInOrder);
  const [startRange, setStartRange] = React.useState<number>(initialStart);
  const [endRange, setEndRange] = React.useState<number>(initialEnd);

  // Dùng memo để tránh gọi buildCharacterSet nặng nhiều lần
  const totalCount = useMemo(() => {
    // NOTE: sử dụng buildCharacterSet từ utils không export ở đây,
    // nên đơn giản lấy estimate bằng generateBatchQuestions với count = large
    // nhưng để tránh import lại, bạn có thể pass max từ parent.
    return 9999; // nếu muốn cụ thể, parent có thể truyền max
  }, [testType]);

  const labels: Record<TestType, string> = {
    radical: "Bộ thủ",
    base: "Cơ bản",
    dakuten: "Biến âm",
    yoon: "Âm ghép",
  };

  const handleStart = () => {
    // Kiểm tra cơ bản
    if (testType === "radical" && inOrder) {
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
    });

    if (!qs || qs.length === 0) {
      alert("Không có câu phù hợp — kiểm tra lại cài đặt hoặc dữ liệu.");
      return;
    }

    onStart(qs, { testType, count, inOrder, startRange, endRange });
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

        {testType === "radical" && (
          <div className="flex items-center gap-2">
            <input id="inOrder" type="checkbox" checked={inOrder} onChange={(e) => setInOrder(e.target.checked)} className="h-4 w-4" />
            <label htmlFor="inOrder" className="text-sm text-gray-600">Chọn khoảng</label>
          </div>
        )}
      </div>

      {testType === "radical" && inOrder && (
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <label className="text-sm text-gray-600 mb-1">Từ bộ số</label>
            <input type="number" min={1} value={startRange} onChange={(e) => setStartRange(Math.max(1, Number(e.target.value || 1)))} className="w-24 text-center p-2 rounded-lg border border-gray-300" />
          </div>
          <div className="flex flex-col items-center">
            <label className="text-sm text-gray-600 mb-1">Đến bộ số</label>
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
