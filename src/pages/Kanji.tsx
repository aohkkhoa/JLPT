import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 1. Định nghĩa kiểu dữ liệu
type Kanji = {
  kanji: string;
  onyomi: string;
  kunyomi: string;
  meaning: string;
  examples: string[];
  image?: string; // Tùy chọn, nếu chưa có hình thì không lỗi
};

// 2. Dữ liệu Kanji từ 1 đến 10
// Lưu ý: Onyomi thường viết bằng Katakana, Kunyomi bằng Hiragana
const kanjiList: Kanji[] = [
  {
    kanji: "一",
    onyomi: "イチ, イツ",
    kunyomi: "ひと-, ひとつ",
    meaning: "Một",
    examples: [
      "一つ (ひとつ) - một cái (đếm chung)",
      "一人 (ひとり) - một người (đặc biệt)",
      "一月 (いちがつ) - tháng Một",
    ],
    // image: "/kanji/ichi.png", // Bỏ comment nếu bạn có hình
  },
  {
    kanji: "二",
    onyomi: "ニ",
    kunyomi: "ふた-, ふたつ",
    meaning: "Hai",
    examples: [
      "二つ (ふたつ) - hai cái",
      "二人 (ふたり) - hai người",
      "二時 (にじ) - 2 giờ",
    ],
  },
  {
    kanji: "三",
    onyomi: "サン",
    kunyomi: "み-, みっつ",
    meaning: "Ba",
    examples: [
      "三つ (みっつ) - ba cái",
      "三人 (さんにん) - ba người",
      "三月 (さんがつ) - tháng Ba",
    ],
  },
  {
    kanji: "四",
    onyomi: "シ",
    kunyomi: "よ, よん, よっつ",
    meaning: "Bốn",
    examples: [
      "四つ (よっつ) - bốn cái",
      "四人 (よにん) - bốn người",
      "四月 (しがつ) - tháng Tư (chú ý âm đọc)",
    ],
  },
  {
    kanji: "五",
    onyomi: "ゴ",
    kunyomi: "いつ, いつつ",
    meaning: "Năm",
    examples: [
      "五つ (いつつ) - năm cái",
      "五人 (ごにん) - năm người",
      "五月 (ごがつ) - tháng Năm",
    ],
  },
  {
    kanji: "六",
    onyomi: "ロク",
    kunyomi: "む, むっつ",
    meaning: "Sáu",
    examples: [
      "六つ (むっつ) - sáu cái",
      "六百 (ろっぴゃく) - 600 (biến âm)",
      "六時 (ろくじ) - 6 giờ",
    ],
  },
  {
    kanji: "七",
    onyomi: "シチ",
    kunyomi: "なな, ななつ",
    meaning: "Bảy",
    examples: [
      "七つ (ななつ) - bảy cái",
      "七時 (しちじ) - 7 giờ",
      "七人 (ななにん) - bảy người",
    ],
  },
  {
    kanji: "八",
    onyomi: "ハチ",
    kunyomi: "や, やっつ",
    meaning: "Tám",
    examples: [
      "八つ (やっつ) - tám cái",
      "八百 (はっぴゃく) - 800 (biến âm)",
      "八月 (はちがつ) - tháng Tám",
    ],
  },
  {
    kanji: "九",
    onyomi: "キュウ, ク",
    kunyomi: "ここのつ",
    meaning: "Chín",
    examples: [
      "九つ (ここのつ) - chín cái",
      "九月 (くがつ) - tháng Chín (chú ý âm đọc)",
      "九時 (くじ) - 9 giờ",
    ],
  },
  {
    kanji: "十",
    onyomi: "ジュウ, ジッ",
    kunyomi: "とお",
    meaning: "Mười",
    examples: [
      "十 (とお) - mười cái",
      "十月 (じゅうがつ) - tháng Mười",
      "十分 (じゅっぷん/じっぷん) - 10 phút",
    ],
  },
];

export default function KanjiPage() {
  const [selected, setSelected] = useState<Kanji | null>(null);

  return (
    <div className="min-h-[calc(100vh-88px)] bg-gradient-to-b from-pink-50 via-sky-50 to-indigo-50 p-6 relative">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-700 mb-8 text-center drop-shadow-sm">
          Kanji N5 - Số đếm cơ bản
        </h1>

        {/* Grid hiển thị Kanji */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
          {kanjiList.map((k) => (
            <motion.div
              key={k.kanji}
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelected(k)}
              className="cursor-pointer p-6 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/90 shadow-sm hover:shadow-md transition-all border border-white/50 flex flex-col items-center justify-center aspect-square"
            >
              {k.image && (
                <img
                  src={k.image}
                  alt={k.kanji}
                  className="w-12 h-12 mb-2 object-contain"
                />
              )}
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-500 to-indigo-600 mb-2">
                {k.kanji}
              </div>
              <div className="text-gray-600 font-medium">{k.meaning}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal chi tiết (Sử dụng AnimatePresence để có hiệu ứng đóng mở mượt mà) */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)} // Click ra ngoài để đóng
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // Ngăn click đóng khi click vào nội dung modal
              className="bg-white/90 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden"
            >
              {/* Nút đóng */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>

              {/* Header của Modal */}
              <div className="text-center mb-6">
                <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-pink-500 to-indigo-600 inline-block">
                  {selected.kanji}
                </div>
                <h2 className="text-2xl font-bold text-gray-700 mt-2">
                  Hán tự: {selected.meaning}
                </h2>
              </div>

              {/* Nội dung chi tiết */}
              <div className="space-y-4 text-lg">
                <div className="bg-pink-50 p-4 rounded-xl border border-pink-100">
                  <span className="font-bold text-pink-700 block mb-1">
                    Âm On (Hán-Nhật):
                  </span>
                  <span className="text-gray-800 text-xl">
                    {selected.onyomi}
                  </span>
                </div>
                <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                  <span className="font-bold text-sky-700 block mb-1">
                    Âm Kun (Thuần Nhật):
                  </span>
                  <span className="text-gray-800 text-xl">
                    {selected.kunyomi}
                  </span>
                </div>

                <div className="mt-6">
                  <span className="font-bold text-indigo-700 text-xl block mb-3">
                    Ví dụ thường gặp:
                  </span>
                  <ul className="space-y-2">
                    {selected.examples.map((ex, i) => (
                      <li
                        key={i}
                        className="flex items-start bg-indigo-50/50 p-3 rounded-lg"
                      >
                        <span className="text-indigo-400 mr-2">•</span>
                        <span className="text-gray-700 font-medium">{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}