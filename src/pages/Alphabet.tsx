import { useState } from "react";
import { motion } from "framer-motion";

const hiragana = [
  ["あ", "a"],
  ["い", "i"],
  ["う", "u"],
  ["え", "e"],
  ["お", "o"],
  ["か", "ka"],
  ["き", "ki"],
  ["く", "ku"],
  ["け", "ke"],
  ["こ", "ko"],
  ["さ", "sa"],
  ["し", "shi"],
  ["す", "su"],
  ["せ", "se"],
  ["そ", "so"],
  ["た", "ta"],
  ["ち", "chi"],
  ["つ", "tsu"],
  ["て", "te"],
  ["と", "to"],
  ["な", "na"],
  ["に", "ni"],
  ["ぬ", "nu"],
  ["ね", "ne"],
  ["の", "no"],
  ["は", "ha"],
  ["ひ", "hi"],
  ["ふ", "fu"],
  ["へ", "he"],
  ["ほ", "ho"],
  ["ま", "ma"],
  ["み", "mi"],
  ["む", "mu"],
  ["め", "me"],
  ["も", "mo"],
  ["や", "ya"],
  ["ゆ", "yu"],
  ["よ", "yo"],
  ["ら", "ra"],
  ["り", "ri"],
  ["る", "ru"],
  ["れ", "re"],
  ["ろ", "ro"],
  ["わ", "wa"],
  ["を", "wo"],
  ["ん", "n"],
];

const katakana = [
  ["ア", "a"],
  ["イ", "i"],
  ["ウ", "u"],
  ["エ", "e"],
  ["オ", "o"],
  ["カ", "ka"],
  ["キ", "ki"],
  ["ク", "ku"],
  ["ケ", "ke"],
  ["コ", "ko"],
  ["サ", "sa"],
  ["シ", "shi"],
  ["ス", "su"],
  ["セ", "se"],
  ["ソ", "so"],
  ["タ", "ta"],
  ["チ", "chi"],
  ["ツ", "tsu"],
  ["テ", "te"],
  ["ト", "to"],
  ["ナ", "na"],
  ["ニ", "ni"],
  ["ヌ", "nu"],
  ["ネ", "ne"],
  ["ノ", "no"],
  ["ハ", "ha"],
  ["ヒ", "hi"],
  ["フ", "fu"],
  ["ヘ", "he"],
  ["ホ", "ho"],
  ["マ", "ma"],
  ["ミ", "mi"],
  ["ム", "mu"],
  ["メ", "me"],
  ["モ", "mo"],
  ["ヤ", "ya"],
  ["ユ", "yu"],
  ["ヨ", "yo"],
  ["ラ", "ra"],
  ["リ", "ri"],
  ["ル", "ru"],
  ["レ", "re"],
  ["ロ", "ro"],
  ["ワ", "wa"],
  ["ヲ", "wo"],
  ["ン", "n"],
];

const dakuten = [
  ["が", "ga"],
  ["ぎ", "gi"],
  ["ぐ", "gu"],
  ["げ", "ge"],
  ["ご", "go"],
  ["ざ", "za"],
  ["じ", "ji"],
  ["ず", "zu"],
  ["ぜ", "ze"],
  ["ぞ", "zo"],
  ["だ", "da"],
  ["ぢ", "ji"],
  ["づ", "zu"],
  ["で", "de"],
  ["ど", "do"],
  ["ば", "ba"],
  ["び", "bi"],
  ["ぶ", "bu"],
  ["べ", "be"],
  ["ぼ", "bo"],
  ["ぱ", "pa"],
  ["ぴ", "pi"],
  ["ぷ", "pu"],
  ["ぺ", "pe"],
  ["ぽ", "po"],
];

const yoon = [
  ["きゃ", "kya"],
  ["きゅ", "kyu"],
  ["きょ", "kyo"],
  ["しゃ", "sha"],
  ["しゅ", "shu"],
  ["しょ", "sho"],
  ["ちゃ", "cha"],
  ["ちゅ", "chu"],
  ["ちょ", "cho"],
  ["にゃ", "nya"],
  ["にゅ", "nyu"],
  ["にょ", "nyo"],
  ["ひゃ", "hya"],
  ["ひゅ", "hyu"],
  ["ひょ", "hyo"],
  ["みゃ", "mya"],
  ["みゅ", "myu"],
  ["みょ", "myo"],
  ["りゃ", "rya"],
  ["りゅ", "ryu"],
  ["りょ", "ryo"],
];

const Alphabet = () => {
  const [tab, setTab] = useState<"hiragana" | "katakana">("hiragana");

  const data = tab === "hiragana" ? hiragana : katakana;

  return (
    <div className="min-h-screen from-sky-50 via-pink-50 to-indigo-50 py-12 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-sky-700 mb-6 drop-shadow-md">
          Bảng chữ cái tiếng Nhật (
          {tab === "hiragana" ? "Hiragana" : "Katakana"})
        </h1>

        {/* Tab chọn bảng */}
        <div className="flex justify-center gap-4 mb-8">
          {["hiragana", "katakana"].map((t) => (
            <motion.button
              key={t}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTab(t as any)}
              className={`px-6 py-2 rounded-full shadow-md font-semibold transition-all duration-300 ${
                tab === t
                  ? "bg-gradient-to-r from-sky-300 via-pink-300 to-indigo-300 text-white"
                  : "bg-white text-sky-600 hover:bg-pink-50"
              }`}
            >
              {t === "hiragana" ? "Hiragana" : "Katakana"}
            </motion.button>
          ))}
        </div>

        {/* Bảng chính */}
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-4 justify-center">
          {data.map(([jp, romaji]) => (
            <motion.div
              key={jp}
              whileHover={{ scale: 1.1, rotate: 3 }}
              className="p-3 rounded-2xl shadow-md bg-white bg-opacity-80 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-3xl text-pink-500 font-bold drop-shadow-sm">
                {jp}
              </div>
              <div className="text-sky-700 text-sm">{romaji}</div>
            </motion.div>
          ))}
        </div>

        {/* Biến âm */}
        <h2 className="text-2xl font-bold text-sky-700 mt-12 mb-4 drop-shadow-sm">
          Biến âm (Dakuten)
        </h2>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
          {dakuten.map(([jp, romaji]) => (
            <motion.div
              key={jp}
              whileHover={{ scale: 1.1 }}
              className="p-2 rounded-xl bg-gradient-to-br from-pink-100 to-sky-100 shadow"
            >
              <div className="text-2xl font-bold text-pink-600">{jp}</div>
              <div className="text-sky-700 text-xs">{romaji}</div>
            </motion.div>
          ))}
        </div>

        {/* Âm ghép */}
        <h2 className="text-2xl font-bold text-sky-700 mt-12 mb-4 drop-shadow-sm">
          Âm ghép (Yoon)
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3 justify-center">
          {yoon.map(([jp, romaji]) => (
            <motion.div
              key={jp}
              whileHover={{ scale: 1.1 }}
              className="p-2 rounded-xl bg-gradient-to-br from-indigo-100 to-pink-100 shadow"
            >
              <div className="text-2xl font-bold text-indigo-600">{jp}</div>
              <div className="text-sky-700 text-xs">{romaji}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alphabet;
