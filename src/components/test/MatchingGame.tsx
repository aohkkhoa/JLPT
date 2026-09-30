import { useEffect, useRef, useState } from "react";
import { base_hira, base_kata } from "../../data/kana";
import { ALL_LESSONS_DATA } from "../../data/minnaData";

type MatchDeck = "vocabulary" | "hiragana" | "katakana";
type MatchStatus = "setup" | "playing" | "completed";
type MatchPair = {
  id: string;
  left: string;
  right: string;
};

const deckOptions: { id: MatchDeck; label: string }[] = [
  { id: "vocabulary", label: "Từ vựng JP - VI" },
  { id: "hiragana", label: "Hiragana - Romaji" },
  { id: "katakana", label: "Katakana - Romaji" },
];

const shuffle = <T,>(items: T[]): T[] => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]];
  }
  return shuffled;
};

const getPairs = (deck: MatchDeck): MatchPair[] => {
  if (deck === "vocabulary") {
    const pairs = Object.values(ALL_LESSONS_DATA).flatMap((lesson) =>
      lesson.vocabulary.map((item) => ({ id: item.id, left: item.jp, right: item.vi })),
    );
    return [...new Map(pairs.map((pair) => [`${pair.left}\u0000${pair.right}`, pair])).values()];
  }

  const kanaData = deck === "hiragana" ? base_hira : base_kata;
  return kanaData.map(([kana, romaji]) => ({ id: kana, left: kana, right: romaji }));
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

export default function MatchingGame() {
  const [deck, setDeck] = useState<MatchDeck>("vocabulary");
  const [pairCount, setPairCount] = useState(6);
  const [status, setStatus] = useState<MatchStatus>("setup");
  const [pairs, setPairs] = useState<MatchPair[]>([]);
  const [leftItems, setLeftItems] = useState<MatchPair[]>([]);
  const [rightItems, setRightItems] = useState<MatchPair[]>([]);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(() => new Set());
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isResolving, setIsResolving] = useState(false);
  const wrongTimeoutRef = useRef<number | null>(null);
  const availablePairCount = getPairs(deck).length;

  useEffect(() => {
    if (status !== "playing" || startedAt === null) return;

    const intervalId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [startedAt, status]);

  useEffect(() => () => {
    if (wrongTimeoutRef.current !== null) {
      window.clearTimeout(wrongTimeoutRef.current);
    }
  }, []);

  const startGame = () => {
    const selectedPairs = shuffle(getPairs(deck)).slice(0, Math.min(pairCount, availablePairCount));
    if (selectedPairs.length === 0) return;

    if (wrongTimeoutRef.current !== null) {
      window.clearTimeout(wrongTimeoutRef.current);
      wrongTimeoutRef.current = null;
    }
    setPairs(selectedPairs);
    setLeftItems(shuffle(selectedPairs));
    setRightItems(shuffle(selectedPairs));
    setMatchedIds(new Set());
    setSelectedLeft(null);
    setSelectedRight(null);
    setWrongIds([]);
    setMistakes(0);
    setElapsedSeconds(0);
    setIsResolving(false);
    setStartedAt(Date.now());
    setStatus("playing");
  };

  const handlePick = (side: "left" | "right", id: string) => {
    if (status !== "playing" || isResolving || matchedIds.has(id)) return;

    const oppositeSelection = side === "left" ? selectedRight : selectedLeft;
    if (!oppositeSelection) {
      if (side === "left") {
        setSelectedLeft((previous) => previous === id ? null : id);
      } else {
        setSelectedRight((previous) => previous === id ? null : id);
      }
      return;
    }

    if (oppositeSelection === id) {
      const nextMatchedIds = new Set(matchedIds).add(id);
      setMatchedIds(nextMatchedIds);
      setSelectedLeft(null);
      setSelectedRight(null);

      if (nextMatchedIds.size === pairs.length && startedAt !== null) {
        setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
        setStatus("completed");
      }
      return;
    }

    setMistakes((previous) => previous + 1);
    setWrongIds([id, oppositeSelection]);
    setIsResolving(true);
    wrongTimeoutRef.current = window.setTimeout(() => {
      setWrongIds([]);
      setSelectedLeft(null);
      setSelectedRight(null);
      setIsResolving(false);
      wrongTimeoutRef.current = null;
    }, 650);
  };

  const getItemClassName = (id: string, selectedId: string | null) => {
    const base = "min-h-12 w-full break-words rounded-lg border px-2 py-2 text-sm font-semibold leading-tight transition-colors sm:min-h-14 sm:px-3 sm:text-base";
    if (matchedIds.has(id)) return `${base} border-emerald-300 bg-emerald-100 text-emerald-800 opacity-70`;
    if (wrongIds.includes(id)) return `${base} border-red-400 bg-red-100 text-red-800`;
    if (selectedId === id) return `${base} border-sky-500 bg-sky-100 text-sky-900`;
    return `${base} border-gray-200 bg-white text-gray-800 hover:border-sky-300 hover:bg-sky-50`;
  };

  const leftLabel = deck === "vocabulary" ? "Tiếng Nhật" : deck === "hiragana" ? "Hiragana" : "Katakana";
  const rightLabel = deck === "vocabulary" ? "Tiếng Việt" : "Romaji";

  if (status === "setup") {
    return (
      <section className="mx-auto w-full max-w-2xl text-left" aria-labelledby="matching-title">
        <h2 id="matching-title" className="mb-6 text-center text-2xl font-bold text-indigo-700">Ghép cặp nhanh</h2>

        <fieldset className="mb-6">
          <legend className="mb-3 text-lg font-semibold text-gray-700">Bộ học</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {deckOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={deck === option.id}
                onClick={() => setDeck(option.id)}
                className={`rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${deck === option.id ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-sky-100"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-6">
          <legend className="mb-3 text-lg font-semibold text-gray-700">Số cặp</legend>
          <div className="grid grid-cols-3 gap-2">
            {[6, 8, 10].map((count) => (
              <button
                key={count}
                type="button"
                aria-pressed={pairCount === count}
                onClick={() => setPairCount(count)}
                className={`rounded-lg px-3 py-2 font-semibold transition-colors ${pairCount === count ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-pink-50"}`}
              >
                {count}
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={startGame}
          className="w-full rounded-lg bg-indigo-600 px-5 py-3 text-lg font-bold text-white hover:bg-indigo-700"
        >
          Bắt đầu
        </button>
      </section>
    );
  }

  if (status === "completed") {
    return (
      <section className="mx-auto w-full max-w-lg rounded-lg bg-white p-6 text-center shadow-sm" aria-labelledby="matching-complete-title">
        <h2 id="matching-complete-title" className="text-2xl font-bold text-emerald-700">Hoàn thành!</h2>
        <p className="mt-4 text-lg text-gray-700">Thời gian: <strong>{formatTime(elapsedSeconds)}</strong></p>
        <p className="mt-1 text-gray-600">Số lượt ghép sai: {mistakes}</p>
        <button
          type="button"
          onClick={() => setStatus("setup")}
          className="mt-6 w-full rounded-lg bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700"
        >
          Chơi lượt khác
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl" aria-label="Trò chơi ghép cặp">
      <div className="mb-2 grid grid-cols-2 gap-3 sm:gap-5">
        <h3 className="text-center text-sm font-semibold text-gray-600 sm:text-base">{leftLabel}</h3>
        <h3 className="text-center text-sm font-semibold text-gray-600 sm:text-base">{rightLabel}</h3>
      </div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-gray-600 sm:text-base">
        <span>Đã ghép {matchedIds.size} / {pairs.length}</span>
        <span>Thời gian {formatTime(elapsedSeconds)}</span>
        <span>Lượt sai {mistakes}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-5">
        {[{ side: "left" as const, items: leftItems, selectedId: selectedLeft }, { side: "right" as const, items: rightItems, selectedId: selectedRight }].map(({ side, items, selectedId }) => (
          <div key={side} className="grid grid-cols-1 content-start gap-2 sm:grid-cols-2 sm:gap-3">
            {items.map((item) => (
              <button
                key={`${side}:${item.id}`}
                type="button"
                disabled={matchedIds.has(item.id) || isResolving}
                aria-pressed={selectedId === item.id}
                onClick={() => handlePick(side, item.id)}
                className={getItemClassName(item.id, selectedId)}
              >
                {side === "left" ? item.left : item.right}
              </button>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
