import { useState } from "react";
import { motion } from "framer-motion";

type VocabularyItem = {
  word: string;
  reading: string;
  meaning: string;
  level: "N5";
};

const n5Vocabulary: VocabularyItem[] = [
  { word: "私", reading: "わたし", meaning: "tôi", level: "N5" },
  { word: "私たち", reading: "わたしたち", meaning: "chúng tôi, chúng ta", level: "N5" },
  { word: "あなた", reading: "あなた", meaning: "bạn, anh, chị (ngôi thứ 2)", level: "N5" },
  { word: "あの人", reading: "あのひと", meaning: "người kia, người đó", level: "N5" },
  { word: "あの方", reading: "あのかた", meaning: "vị kia (lịch sự)", level: "N5" },
  { word: "皆さん", reading: "みなさん", meaning: "mọi người", level: "N5" },
  { word: "～さん", reading: "～さん", meaning: "anh, chị, ông, bà (hậu tố)", level: "N5" },
  { word: "～ちゃん", reading: "～ちゃん", meaning: "bé (hậu tố tên bé gái)", level: "N5" },
  { word: "～くん", reading: "～くん", meaning: "bé (hậu tố tên bé trai)", level: "N5" },
  { word: "先生", reading: "せんせい", meaning: "thầy/cô giáo, giáo viên", level: "N5" },
];

const Vocabulary = () => {
  const [level] = useState<"N5">("N5");

  const data = level === "N5" ? n5Vocabulary : [];

  return (
    <div className="min-h-[calc(100vh-88px)] bg-gradient-to-b from-sky-50 via-pink-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-700 mb-8 text-center drop-shadow-md">
          Học từ vựng N5
        </h1>

        {/* TODO: Add level selector when more data is available */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-sm text-pink-500 font-semibold mb-1">{item.reading}</div>
              <div className="text-3xl font-bold text-indigo-700 mb-2">{item.word}</div>
              <div className="border-t border-gray-200 pt-2">
                <p className="text-gray-800 font-medium">{item.meaning}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Vocabulary;
