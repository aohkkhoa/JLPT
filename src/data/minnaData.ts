// src/data/minnaData.ts

// Kiểu dữ liệu cho một câu ví dụ
export interface Example {
  jp: string; // Câu tiếng Nhật
  vi: string; // Dịch nghĩa tiếng Việt
}

// Kiểu dữ liệu MỚI cho một điểm ngữ pháp chi tiết
export interface GrammarPoint {
  id: string;
  text: string; // Tên/tóm tắt ngữ pháp (giữ nguyên)
  structure: string; // Cấu trúc ngữ pháp
  meaning: string; // Diễn giải ý nghĩa
  examples: Example[]; // Mảng các ví dụ
  notes?: string[]; // Ghi chú, lưu ý (tùy chọn)
}

// Cập nhật kiểu LessonContent để sử dụng GrammarPoint
export interface LessonContent {
  grammar: GrammarPoint[];
  // Dữ liệu từ vựng giữ nguyên hoặc có thể mở rộng sau
  vocabulary: VocabularyItem[];
}
export interface VocabularyItem {
  id: string;
  jp: string;      // Chữ Nhật để phát âm
  romaji: string;  // Romaji để hiển thị
  vi: string;      // Nghĩa tiếng Việt
}

export type MinnaData = Record<number, LessonContent>;

// DỮ LIỆU MẪU ĐÃ ĐƯỢC MỞ RỘNG
export const ALL_LESSONS_DATA: MinnaData = {
  1: {
    grammar: [
      {
        id: 'g1-1',
        text: 'Danh từ 1 は Danh từ 2 です',
        structure: 'N1 は N2 です。',
        meaning: 'Dùng để khẳng định N1 là N2. 「は」 là trợ từ chủ đề, đọc là "wa". 「です」 thể hiện sự lịch sự và kết thúc câu.',
        examples: [
          { jp: 'わたし は マイク・ミラー です。', vi: 'Tôi là Mike Miller.' },
          { jp: 'サントスさん は がくせい です。', vi: 'Anh Santos là sinh viên.' },
          { jp: 'あれ は びょういん です。', vi: 'Kia là bệnh viện.' },
        ],
        notes: [
          'Đây là mẫu câu khẳng định cơ bản nhất trong tiếng Nhật.',
          'Chủ ngữ N1 có thể được lược bỏ nếu đã rõ trong ngữ cảnh.'
        ],
      },
      {
        id: 'g1-2',
        text: 'Danh từ 1 は Danh từ 2 じゃありません',
        structure: 'N1 は N2 じゃありません。',
        meaning: 'Dùng để phủ định N1 không phải là N2. 「じゃありません」 là thể phủ định của 「です」, thường dùng trong văn nói.',
        examples: [
          { jp: 'サントスさん は がくせい じゃありません。', vi: 'Anh Santos không phải là sinh viên.' },
          { jp: 'わたし は エンジニア じゃありません。', vi: 'Tôi không phải là kỹ sư.' },
        ],
        notes: [
          'Trong văn viết hoặc tình huống trang trọng hơn, người ta dùng 「ではありません」(dewa arimasen).',
        ],
      },
      {
        id: 'g1-3',
        text: 'Câu か',
        structure: 'Câu + か。',
        meaning: 'Trợ từ 「か」 được đặt ở cuối câu để tạo thành câu hỏi. Nội dung câu không thay đổi, chỉ cần thêm 「か」 và lên giọng ở cuối câu khi nói.',
        examples: [
          { jp: 'ミラーさん は アメリカじん ですか。', vi: 'Anh Miller có phải là người Mỹ không?' },
          { jp: 'あれ は あなた の かばん ですか。', vi: 'Kia có phải là cặp của bạn không?' },
          { jp: 'サントスさん は がくせい ですか。はい、がくせい です。', vi: 'Anh Santos có phải là sinh viên không? Vâng, là sinh viên.' },
          { jp: 'IMC の しゃいん ですか。いいえ、IMC の しゃいん じゃありません。', vi: 'Bạn có phải là nhân viên công ty IMC không? Không, tôi không phải là nhân viên công ty IMC.' },
        ],
        notes: [
          'Câu trả lời cho loại câu hỏi này thường là 「はい」(Vâng/Đúng) hoặc 「いいえ」(Không/Không phải).',
          'Không cần dùng dấu chấm hỏi (?) trong văn viết tiếng Nhật, vì 「か」 đã mang ý nghĩa của câu hỏi.'
        ],
      },
      {
        id: 'g1-4',
        text: 'Danh từ も',
        structure: 'N も',
        meaning: 'Trợ từ 「も」 có nghĩa là "cũng". Nó được dùng thay cho trợ từ 「は」 khi thông tin về chủ thể N giống với thông tin của một chủ thể đã được đề cập trước đó.',
        examples: [
          { jp: 'ミラーさん は かいしゃいん です。グプタさん も かいしゃいん です。', vi: 'Anh Miller là nhân viên công ty. Anh Gupta cũng là nhân viên công ty.' },
          { jp: 'わたし は ベトナムじん です。キムさん も ベトナムじん です。', vi: 'Tôi là người Việt Nam. Chị Kim cũng là người Việt Nam.' },
        ],
        notes: [
          '「も」 thay thế hoàn toàn cho 「は」. Không dùng 「はも」.',
          'Nếu câu trước là câu phủ định, 「も」 vẫn được dùng để diễn tả sự tương đồng trong sự phủ định đó. Ví dụ: A không phải sinh viên. B cũng không phải sinh viên.'
        ],
      },
      {
        id: 'g1-5',
        text: 'Danh từ 1 の danh từ 2',
        structure: 'N1 の N2',
        meaning: 'Trợ từ 「の」 được dùng để nối hai danh từ. N1 bổ nghĩa cho N2, làm rõ N2 thuộc về đâu hoặc có đặc tính gì.',
        examples: [
          { jp: 'ミラーさん は IMC の しゃいん です。', vi: 'Anh Miller là nhân viên của công ty IMC. (N1: IMC - chỉ tổ chức N2 thuộc về)' },
          { jp: 'これ は コンピューター の ほん です。', vi: 'Đây là quyển sách về máy tính. (N1: コンピューター - chỉ nội dung của N2)' },
          { jp: 'わたし の かさ です。', vi: 'Đây là cái ô của tôi. (N1: わたし - chỉ sự sở hữu N2)' },
        ],
        notes: [
          '「の」 có nhiều ý nghĩa, phổ biến nhất là chỉ sự sở hữu ("của"), nguồn gốc/xuất xứ, hoặc làm rõ thuộc tính.',
          'Thứ tự của danh từ ngược với tiếng Việt. Cái chính (N2) đứng sau, cái phụ (N1) đứng trước.'
        ],
      },
      {
        id: 'g1-6',
        text: '～さん',
        structure: 'Tên người + さん',
        meaning: '「さん」 là một hậu tố lịch sự được thêm vào sau tên của người khác để thể hiện sự tôn trọng. Nó tương đương với "anh", "chị", "ông", "bà" trong tiếng Việt và có thể dùng cho cả nam và nữ.',
        examples: [
          { jp: 'あの かた は ミラーさん です。', vi: 'Vị kia là anh Miller.' },
          { jp: 'キムさん は かんこくじん です。', vi: 'Chị Kim là người Hàn Quốc.' },
        ],
        notes: [
          'Tuyệt đối không dùng 「さん」 khi nói về tên của chính mình.',
          'Khi gọi tên trẻ em, có thể dùng 「～ちゃん」 (cho bé gái hoặc thân mật) hoặc 「～くん」 (cho bé trai).',
          'Không dùng 「さん」 khi nói về tên của người trong gia đình mình với người ngoài.'
        ],
      },
],
    vocabulary: [
      { id: 'v1-1', jp: 'わたし', romaji: 'watashi', vi: 'Tôi' },
      { id: 'v1-2', jp: 'あなた', romaji: 'anata', vi: 'Bạn, anh, chị' },
      { id: 'v1-3', jp: 'あのひと', romaji: 'ano hito', vi: 'Người kia, người đó' },
      { id: 'v1-4', jp: 'あのかた', romaji: 'ano kata', vi: 'Vị kia (lịch sự)' },
      { id: 'v1-5', jp: 'みなさん', romaji: 'minasan', vi: 'Các bạn, mọi người' },
      { id: 'v1-6', jp: '～さん', romaji: '~san', vi: 'Anh, chị, ông, bà' },
      { id: 'v1-7', jp: '～ちゃん', romaji: '~chan', vi: 'Hậu tố cho tên bé gái' },
      { id: 'v1-8', jp: '～くん', romaji: '~kun', vi: 'Hậu tố cho tên bé trai' },
      { id: 'v1-9', jp: '～じん', romaji: '~jin', vi: 'Người nước~' },
      { id: 'v1-10', jp: 'せんせい', romaji: 'sensei', vi: 'Thầy/cô giáo' },
      { id: 'v1-11', jp: 'きょうし', romaji: 'kyoushi', vi: 'Giáo viên (nghề nghiệp)' },
      { id: 'v1-12', jp: 'がくせい', romaji: 'gakusei', vi: 'Học sinh, sinh viên' },
      { id: 'v1-13', jp: 'かいしゃいん', romaji: 'kaishain', vi: 'Nhân viên công ty' },
      { id: 'v1-14', jp: 'しゃいん', romaji: 'shain', vi: 'Nhân viên của công ty ~' },
      { id: 'v1-15', jp: 'ぎんこういん', romaji: 'ginkouin', vi: 'Nhân viên ngân hàng' },
      { id: 'v1-16', jp: 'いしゃ', romaji: 'isha', vi: 'Bác sĩ' },
      { id: 'v1-17', jp: 'けんきゅうしゃ', romaji: 'kenkyuusha', vi: 'Nhà nghiên cứu' },
      { id: 'v1-18', jp: 'エンジニア', romaji: 'enjinia', vi: 'Kỹ sư' },
      { id: 'v1-19', jp: 'だいがく', romaji: 'daigaku', vi: 'Trường đại học' },
      { id: 'v1-20', jp: 'びょういん', romaji: 'byouin', vi: 'Bệnh viện' },
      { id: 'v1-21', jp: 'でんき', romaji: 'denki', vi: 'Điện, đèn điện' },
      { id: 'v1-22', jp: 'だれ', romaji: 'dare', vi: 'Ai' },
      { id: 'v1-23', jp: 'どなた', romaji: 'donata', vi: 'Vị nào (lịch sự)' },
      { id: 'v1-24', jp: '～さい', romaji: '~sai', vi: '~ tuổi' },
      { id: 'v1-25', jp: 'なんさい', romaji: 'nansai', vi: 'Mấy tuổi' },
      { id: 'v1-26', jp: 'おいくつ', romaji: 'oikutsu', vi: 'Mấy tuổi (lịch sự)' },
      { id: 'v1-27', jp: 'はい', romaji: 'hai', vi: 'Vâng, dạ' },
      { id: 'v1-28', jp: 'いいえ', romaji: 'iie', vi: 'Không' },
      { id: 'v1-29', jp: 'しつれいですが', romaji: 'shitsurei desu ga', vi: 'Xin lỗi, cho tôi hỏi...' },
      { id: 'v1-30', jp: 'おなまえは', romaji: 'onamae wa', vi: 'Tên bạn là gì?' },
      { id: 'v1-31', jp: 'はじめまして', romaji: 'hajimemashite', vi: 'Rất hân hạnh được gặp mặt' },
      { id: 'v1-32', jp: 'どうぞよろしくおねがいします', romaji: 'douzo yoroshiku onegaishimasu', vi: 'Rất mong được sự giúp đỡ của bạn' },
      { id: 'v1-33', jp: 'こちらは～さんです', romaji: 'kochira wa ~san desu', vi: 'Đây là anh/chị/ông/bà ~' },
      { id: 'v1-34', jp: 'からきました', romaji: 'kara kimashita', vi: 'Tôi đến từ ~' },
]
  },
  // ... dữ liệu cho Bài 2
};