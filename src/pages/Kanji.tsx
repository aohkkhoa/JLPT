import { useState } from "react";
import { motion } from "framer-motion";

type Kanji = {
  kanji: string;
  onyomi: string;
  kunyomi: string;
  meaning: string;
  examples: string[];
  image?: string;
};

// Dữ liệu ví dụ N5 (thêm hình minh họa nếu có)
const kanjiList: Kanji[] = [
  {
    kanji: "一",
    onyomi: "イチ, イツ",
    kunyomi: "ひと-, ひとつ",
    meaning: "một",
    examples: ["一日 (いちにち) - một ngày", "一人 (ひとり) - một người"],
    image: "/kanji/ichi.png",
  },
  {
    kanji: "二",
    onyomi: "ニ",
    kunyomi: "ふた-, ふたつ",
    meaning: "hai",
    examples: ["二人 (ふたり) - hai người", "二日 (ふつか) - ngày mùng hai"],
    image: "/kanji/ni.png",
  },
  {
    kanji: "三",
    onyomi: "サン",
    kunyomi: "み-, みつ",
    meaning: "ba",
    examples: ["三日 (みっか) - ngày mùng ba", "三人 (さんにん) - ba người"],
    image: "/kanji/san.png",
  },
  // Thêm các kanji N5 khác
];

export default function KanjiPage() {
  const [selected, setSelected] = useState<Kanji | null>(null);

  return (
    <div className="min-h-[calc(100vh-88px)] bg-gradient-to-b from-pink-50 via-sky-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-700 mb-8 text-center drop-shadow-md">
          Kanji N5
        </h1>

        {/* Grid tổng hợp */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {kanjiList.map((k) => (
            <motion.div
              key={k.kanji}
              whileHover={{ scale: 1.1 }}
              onClick={() => setSelected(k)}
              className="cursor-pointer p-4 rounded-2xl bg-gradient-to-tr from-pink-100 via-sky-100 to-indigo-100 shadow-md flex flex-col items-center justify-center"
            >
              {k.image && (
                <img
                  src={k.image}
                  alt={k.kanji}
                  className="w-16 h-16 mb-2 object-contain rounded-md shadow-sm"
                />
              )}
              <div className="text-3xl font-bold text-pink-600">{k.kanji}</div>
              <div className="text-gray-700 text-sm">{k.meaning}</div>
            </motion.div>
          ))}
        </div>

        {/* Chi tiết kanji khi chọn */}
        {selected && (
          <div className="mt-8 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl text-center relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold"
            >
              ✕
            </button>
            <h2 className="text-5xl font-bold text-pink-600 mb-4 drop-shadow-sm">
              {selected.kanji}
            </h2>
            {selected.image && (
              <img
                src={selected.image}
                alt={selected.kanji}
                className="mx-auto mb-4 w-32 h-32 object-contain rounded-lg shadow-md"
              />
            )}
            <p className="text-gray-700 text-lg mb-2">
              <span className="font-semibold">On'yomi:</span> {selected.onyomi}
            </p>
            <p className="text-gray-700 text-lg mb-2">
              <span className="font-semibold">Kun'yomi:</span>{" "}
              {selected.kunyomi}
            </p>
            <p className="text-gray-800 text-lg mb-4">
              <span className="font-semibold">Nghĩa:</span> {selected.meaning}
            </p>
            <div className="text-gray-800 text-lg">
              <span className="font-semibold">Ví dụ:</span>
              <ul className="list-disc list-inside mt-2">
                {selected.examples.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
