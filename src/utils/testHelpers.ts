// src/utils/testHelpers.ts
// Tiện ích sinh câu cho BatchTest / Quiz
// Toàn bộ chú thích bằng tiếng Việt

import { allRadicals } from "../data/radicals"; // Nếu bạn để ở pages/radicals, đổi đường dẫn tương ứng
import { base_hira, base_kata, dakuten, yoon } from "../data/kana";

/**
 * Kiểu dữ liệu trả về: mảng cặp [question, answer]
 * - question: ký tự hiển thị (hoặc URL ảnh)
 * - answer: chuỗi đáp án (ví dụ romaji, hanViet + meaning, v.v.)
 */
export type QAItem = [string, string];

/** Fisher–Yates shuffle, trả về mảng mới */
export function shuffle<T>(arr: T[], _seed?: number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Chuyển hiragana sang katakana đơn giản (dùng trong BatchTest) */
export function hiraganaToKatakana(hiragana: string): string {
  return hiragana
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      // Hiragana range: 0x3041 - 0x3096
      if (code >= 0x3041 && code <= 0x3096) {
        return String.fromCharCode(code + 0x60);
      }
      return char;
    })
    .join("");
}

/** Lấy pool ký tự theo testType */
export function buildCharacterSet(testType: "radical" | "base" | "dakuten" | "yoon"): QAItem[] {
  if (testType === "radical") {
    // allRadicals kỳ vọng có shape: { char, hanViet, meaning, ... }
    return allRadicals.map(r => [r.char, `${r.hanViet}: ${r.meaning}`] as QAItem);
  }
  if (testType === "base") {
    // Note: base_kata and base_hira are arrays of [char, romaji]
    // Chúng ta muốn đồng nhất dạng QAItem: [char, romaji]
    return [...base_kata, ...base_hira] as QAItem[];
  }
  if (testType === "dakuten") {
    return [...base_kata, ...base_hira, ...dakuten] as QAItem[];
  }
  // yoon
  return [...base_kata, ...base_hira, ...dakuten, ...yoon] as QAItem[];
}

/**
 * Sinh danh sách câu hỏi cho BatchTest
 *
 * @param params.testType 'radical' | 'base' | 'dakuten' | 'yoon'
 * @param params.count số câu yêu cầu
 * @param params.inOrder (chỉ áp dụng với radical): nếu true => lấy từ khoảng startRange..endRange
 * @param params.startRange 1-based index bắt đầu (inclusive)
 * @param params.endRange 1-based index kết thúc (inclusive)
 *
 * Trả về QAItem[] đã được shuffle/cắt theo yêu cầu.
 */
export function generateBatchQuestions(params: {
  testType: "radical" | "base" | "dakuten" | "yoon";
  count: number;
  inOrder?: boolean;
  startRange?: number;
  endRange?: number;
}): QAItem[] {

  const { testType, count: rawCount, inOrder = false, startRange = 1, endRange = 10 } = params;
  const pool = buildCharacterSet(testType);

  if (!pool || pool.length === 0) return [];

  const count = Math.max(1, Math.floor(rawCount || 1));
  const safeCount = Math.min(count, pool.length);

  // Trường hợp radical + inOrder: lấy subrange trước, rồi shuffle subrange
  if (testType === "radical" && inOrder) {
    // Convert 1-based user input sang 0-based slice
    const startIndex = Math.max(0, (startRange || 1) - 1);
    // endRange là inclusive => slice endIndex = endRange (as index+1)
    const endIndexExclusive = Math.min(pool.length, (endRange ?? pool.length));
    if (startIndex >= endIndexExclusive) {
      // Invalid range -> trả về rỗng để component xử lý (alert)
      return [];
    }
    const sub = pool.slice(startIndex, endIndexExclusive);
    const shuffledSub = shuffle(sub);
    return shuffledSub.slice(0, Math.min(safeCount, shuffledSub.length));
  }

  // Bình thường: shuffle toàn pool rồi slice số lượng an toàn
  const shuffled = shuffle(pool);
  return shuffled.slice(0, safeCount);
}

/**
 * Hàm giúp parse đáp án người dùng khi họ nhập trong 1 ô (nếu bạn giữ input dạng single-line)
 * - Mặc định tách bằng dấu xuống dòng hoặc bằng dấu '|' hoặc bằng dấu phẩy
 * - Trả về mảng các đáp án đã normalize (trim)
 */
export function parseMultiAnswerInput(raw: string): string[] {
  if (!raw) return [];
  // Nếu người dùng nhập mỗi câu trên 1 dòng: split bằng newline
  const byNewline = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (byNewline.length > 1) return byNewline;

  // Nếu không có newline, tách bằng dấu '|' hoặc dấu phẩy hoặc khoảng trắng nhiều
  const byPipe = raw.split("|").map(s => s.trim()).filter(Boolean);
  if (byPipe.length > 1) return byPipe;

  const byComma = raw.split(",").map(s => s.trim()).filter(Boolean);
  if (byComma.length > 1) return byComma;

  // cuối cùng dùng whitespace (space) — nhưng lưu ý multi-word answers có thể bị split
  return raw.trim().split(/\s+/).map(s => s.trim()).filter(Boolean);
}

/**
 * So sánh hai chuỗi đáp án (normalize trước khi so sánh)
 * - Loại bỏ nhiều khoảng trắng, chuyển về lowercase
 * - Bạn có thể mở rộng rules (loại bỏ dấu, mapping đồng âm, v.v.)
 */
export function normalizeAnswer(s: string): string {
  return String(s ?? "").toLowerCase().trim().replace(/\s+/g, " ");
}

export function isAnswerEqual(a: string, b: string): boolean {
  return normalizeAnswer(a) === normalizeAnswer(b);
}
