// src/utils/quizHelpers.ts
// Các hàm tiện ích để sinh câu hỏi cho Quiz
// Toàn bộ chú thích bằng tiếng Việt

import type { Question } from "../types/quiz";
import { base_hira, base_kata, dakuten, yoon } from "../data/kana";
import { ALL_LESSONS_DATA } from "../data/minnaData";

/**
 * Trộn mảng (Fisher–Yates)
 */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Sinh câu hỏi cho KANA
 *
 * selectedSets: { base: boolean, dakuten: boolean, yoon: boolean }
 * num: số câu hỏi mong muốn
 *
 * Trả về Question[] với:
 * - questionText: ký tự kana (hiragana/katakana) để hiển thị
 * - correctAnswers: { romaji, hiragana }
 */
export function generateKanaQuestions(
  selectedSets: Record<"base" | "dakuten" | "yoon", boolean>,
  num: number
): Question[] {
  const pool: [string, string][] = [];

  // mỗi file data kỳ vọng dạng array [kanaChar, romaji]
  if (selectedSets.base) pool.push(...(base_hira as [string, string][]));
  if (selectedSets.dakuten) pool.push(...(dakuten as [string, string][]));
  if (selectedSets.yoon) pool.push(...(yoon as [string, string][]));

  if (pool.length === 0) return [];

  const shuffled = shuffle(pool);
  const slice = shuffled.slice(0, Math.min(num, shuffled.length));

  return slice.map(([kana, romaji]) => ({
    questionText: kana,
    correctAnswers: {
      romaji,
      hiragana: kana,
    },
    type: "TYPING",
  }));
}

export function generateKanaListeningQuestions(
  selectedSets: Record<"base" | "dakuten" | "yoon", boolean>,
  num: number,
  script: "hiragana" | "katakana",
): Question[] {
  const pool: [string, string][] = [];
  const baseKana = script === "hiragana" ? base_hira : base_kata;
  const toScript = ([kana, romaji]: [string, string]): [string, string] => [
    script === "katakana"
      ? kana.replace(/[\u3041-\u3096]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60))
      : kana,
    romaji,
  ];

  if (selectedSets.base) pool.push(...(baseKana as [string, string][]));
  if (selectedSets.dakuten) pool.push(...(dakuten as [string, string][]).map(toScript));
  if (selectedSets.yoon) pool.push(...(yoon as [string, string][]).map(toScript));

  const pronunciationCounts = new Map<string, number>();
  for (const [, romaji] of pool) {
    pronunciationCounts.set(romaji, (pronunciationCounts.get(romaji) ?? 0) + 1);
  }

  const unambiguousPool = pool.filter(([, romaji]) => pronunciationCounts.get(romaji) === 1);
  if (unambiguousPool.length < 4) return [];

  const selectedQuestions = shuffle(unambiguousPool).slice(0, Math.min(num, unambiguousPool.length));

  return selectedQuestions.map(([kana, romaji]) => {
    const distractors = shuffle(unambiguousPool.filter(([candidate]) => candidate !== kana))
      .slice(0, 3)
      .map(([candidate]) => candidate);

    return {
      questionText: "Nghe âm và chọn kana",
      correctAnswers: { romaji, hiragana: kana },
      options: shuffle([kana, ...distractors]),
      type: "MCQ",
    };
  });
}

/**
 * Hàm trả về phản hồi (feedback) dựa trên điểm phần trăm
 * @param score - điểm số phần trăm (0–100)
 * @returns Object gồm message (nội dung) và color (class màu)
 */
export function getFeedback(score: number): { message: string; color: string } {
  if (score === 100) {
    return { message: "Hoàn hảo! Bạn làm đúng tất cả 🎉", color: "text-green-500" };
  }
  if (score >= 90) {
    return { message: "Rất tốt! Gần như hoàn hảo 💪", color: "text-emerald-500" };
  }
  if (score >= 70) {
    return { message: "Tốt rồi! Hãy luyện thêm một chút nhé 👍", color: "text-sky-500" };
  }
  if (score >= 50) {
    return { message: "Ổn, nhưng cần ôn lại thêm 👀", color: "text-yellow-500" };
  }
  return { message: "Hãy thử lại nhé! Bạn sẽ tiến bộ nhanh thôi 💡", color: "text-red-500" };
}


/**
 * Sinh câu hỏi dạng VI -> JP (typing) từ dữ liệu ALL_LESSONS_DATA (phiên bản mới)
 *
 * - selectedLessons: mảng số bài (ví dụ [1,2,3]); nếu rỗng/undefined => dùng tất cả bài
 * - num: tổng số câu muốn sinh
 *
 * Lưu ý:
 * - Nếu một mục vocabulary không có romaji thì sẽ bị bỏ qua (không thể chấm)
 * - Nếu không có hira, hàm sẽ dùng item.jp làm fallback cho hira
 */
export function generateViToJpTypingQuestions(selectedLessons: number[] = [], num: number): Question[] {
  const pool: {
    vi: string;
    jp: string;
    hira: string;
    romaji: string;
    kanji?: string;
  }[] = [];

  const skipped: { lesson: number; item: any; reason: string }[] = [];

  const lessonsToUse = (selectedLessons && selectedLessons.length > 0)
    ? selectedLessons
    : Object.keys(ALL_LESSONS_DATA).map(Number);


  for (const n of lessonsToUse) {
    const lesson = (ALL_LESSONS_DATA as any)[n];
    if (!lesson || !lesson.vocabulary || !Array.isArray(lesson.vocabulary)) {
      continue;
    }

    for (const item of lesson.vocabulary) {
      // item kỳ vọng có: jp, romaji, vi
      if (!item) {
        skipped.push({ lesson: n, item, reason: "item is falsy" });
        continue;
      }

      // Nếu không có romaji thì skip (theo logic hiện tại) — ghi lại để debug
      if (!item.romaji) {
        skipped.push({ lesson: n, item, reason: "missing romaji" });
        continue;
      }

      const romajiNorm = String(item.romaji).toLowerCase().trim().replace(/\s+/g, " ");
      const hira = (item as any).hira ? String((item as any).hira).trim() : String(item.jp ?? "").trim();

      pool.push({
        vi: String(item.vi ?? "").trim(),
        jp: String(item.jp ?? "").trim(),
        hira,
        romaji: romajiNorm,
        kanji: item.kanji ? String(item.kanji).trim() : undefined,
      });
    }
  }


  if (skipped.length > 0) {
    // in vài mẫu item bị skip (tối đa 10) để bạn kiểm tra dữ liệu
    console.log("[quizHelpers] skipped samples (up to 10):", skipped.slice(0, 10));
  }

  if (pool.length === 0) {
    console.warn("[quizHelpers] pool rỗng — không thể sinh câu hỏi (hãy kiểm tra ALL_LESSONS_DATA, romaji bị thiếu?)");
    return [];
  }

  const shuffled = shuffle(pool);
  const slice = shuffled.slice(0, Math.min(num, shuffled.length));

  // LOG: báo số câu cuối cùng trả về
  console.log(`[quizHelpers] returning ${slice.length} questions (requested ${num})`);

  return slice.map((entry) => ({
    questionText: entry.vi || entry.jp || entry.romaji,
    correctAnswers: {
      romaji: entry.romaji,
      hiragana: entry.hira || "",
      kanji: entry.kanji,
    },
    type: "TYPING",
  }));
}

/**
 * Sinh câu hỏi dạng JP -> VI (MCQ)
 * - Hiển thị chữ/kanji/kana tiếng Nhật (entry.jp)
 * - Tạo 4 đáp án tiếng Việt, bao gồm 1 đáp án đúng và 3 distractor ngẫu nhiên
 */
export function generateJpToViMcqQuestions(selectedLessons: number[] = [], num: number): Question[] {
  const pool: { vi: string; jp: string; hira: string; romaji: string; kanji?: string }[] = [];

  const lessonsToUse = (selectedLessons && selectedLessons.length > 0)
    ? selectedLessons
    : Object.keys(ALL_LESSONS_DATA).map(Number);

  for (const n of lessonsToUse) {
    const lesson = (ALL_LESSONS_DATA as any)[n];
    if (!lesson || !lesson.vocabulary || !Array.isArray(lesson.vocabulary)) continue;

    for (const item of lesson.vocabulary) {
      if (!item) continue;
      if (!item.vi) continue; // cần có nghĩa tiếng Việt để làm options
      if (!item.jp) continue;
      // romaji/hira optional
      pool.push({
        vi: String(item.vi ?? "").trim(),
        jp: String(item.jp ?? "").trim(),
        hira: item.hira ? String(item.hira).trim() : String(item.jp ?? "").trim(),
        romaji: item.romaji ? String(item.romaji).toLowerCase().trim() : "",
        kanji: item.kanji ? String(item.kanji).trim() : undefined,
      });
    }
  }

  if (pool.length === 0) {
    console.warn('[quizHelpers] pool rỗng cho JP->VI MCQ');
    return [];
  }

  const shuffled = shuffle(pool);
  const slice = shuffled.slice(0, Math.min(num, shuffled.length));

  // For distractors, use the whole pool's vi values
  const allVi = pool.map(p => p.vi);

  return slice.map((entry) => {
    // pick up to 3 unique distractors that are != entry.vi
    const distractors = shuffle(allVi.filter(v => v !== entry.vi)).slice(0, 3);
    const options = shuffle([entry.vi, ...distractors]);

    return {
      questionText: entry.jp,
      correctAnswers: {
        romaji: entry.romaji,
        hiragana: entry.hira,
        kanji: entry.kanji,
      },
      options,
      type: "MCQ",
    } as Question;
  });
}

/**
 * Sinh câu hỏi MCQ: VI -> JP
 * - selectedLessons: mảng số lesson (ví dụ [1,2])
 * - numQuestions: tổng số câu muốn sinh
 *
 * Assumption: each vocabulary item has { jp, romaji, vi }
 */
export function generateViToJpMcqQuestions(selectedLessons: number[] = [], numQuestions: number): Question[] {
  const pool: { jp: string; romaji?: string; hira: string; vi: string; kanji?: string }[] = [];

  const lessonsToUse = (selectedLessons && selectedLessons.length > 0)
    ? selectedLessons
    : Object.keys(ALL_LESSONS_DATA).map(Number);

  for (const n of lessonsToUse) {
    const lesson = (ALL_LESSONS_DATA as any)[n];
    if (!lesson || !lesson.vocabulary || !Array.isArray(lesson.vocabulary)) continue;

    for (const item of lesson.vocabulary) {
      if (!item) continue;
      if (!item.vi) continue; // need Vietnamese prompt
      const jp = String(item.jp ?? item.hira ?? item.romaji ?? "").trim();
      const vi = String(item.vi ?? "").trim();
      if (!jp || !vi) continue;
      pool.push({ jp, romaji: item.romaji ? String(item.romaji).toLowerCase().trim() : "", hira: item.hira ? String(item.hira).trim() : jp, kanji: item.kanji ? String(item.kanji).trim() : undefined, vi });
    }
  }

  if (pool.length === 0) return [];

  const shuffled = shuffle(pool);
  const slice = shuffled.slice(0, Math.min(numQuestions, shuffled.length));

  // For distractors, use the whole pool's jp values
  const allJp = pool.map(p => p.jp);

  return slice.map((entry) => {
    const distractors = shuffle(allJp.filter(j => j !== entry.jp)).slice(0, 3);
    const options = shuffle([entry.jp, ...distractors]);

    return {
      questionText: entry.vi, // show Vietnamese prompt
      options,
      correctAnswers: {
        // store canonical JP string(s) inside correctAnswers fields so grader can use them
        romaji: entry.jp, // using romaji slot to hold JP display (consistent with earlier hack)
        hiragana: entry.hira,
        kanji: entry.kanji,
      },
      type: "MCQ",
    } as Question;
  });
}