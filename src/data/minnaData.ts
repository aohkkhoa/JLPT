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
  2: {
    grammar: [
      {
        id: 'g2-1',
        text: 'これ・それ・あれ (Chỉ vật)',
        structure: 'これ／それ／あれ は Danh từ です。',
        meaning: 'Đây là các đại từ chỉ định dùng cho đồ vật. 「これ」 (cái này) dùng để chỉ vật ở gần người nói. 「それ」 (cái đó) dùng để chỉ vật ở gần người nghe. 「あれ」 (cái kia) dùng để chỉ vật ở xa cả người nói và người nghe.',
        examples: [
          { jp: 'これ は じしょ です。', vi: 'Đây là quyển từ điển.' },
          { jp: 'それ は わたし の かさ です。', vi: 'Đó là cái ô của tôi.' },
          { jp: 'あれ は なん ですか。…あれ は とけい です。', vi: 'Cái kia là cái gì vậy? …Cái kia là cái đồng hồ.' },
        ],
        notes: [
          'Các từ này đứng một mình và đóng vai trò như một danh từ.',
          'Nghi vấn từ tương ứng là 「なん」(cái gì).',
        ],
      },
      {
        id: 'g2-2',
        text: 'この・その・あの (Bổ nghĩa cho danh từ)',
        structure: 'この／その／あの Danh từ',
        meaning: 'Đây cũng là các từ chỉ định nhưng chúng phải đi kèm với một danh từ ngay sau nó để bổ nghĩa cho danh từ đó. Vị trí gần xa cũng tương tự như これ／それ／あれ. 「この N」 (N này), 「その N」 (N đó), 「あの N」 (N kia).',
        examples: [
          { jp: 'この ほん は わたし の です。', vi: 'Quyển sách này là của tôi.' },
          { jp: 'その かばん は あなた の ですか。', vi: 'Cái cặp đó có phải của bạn không?' },
          { jp: 'あの かた は どなた ですか。', vi: 'Vị kia là ai vậy?' },
        ],
        notes: [
          'Điểm khác biệt cốt lõi: 「これ は ほん です。」 (Đây là quyển sách) nhưng 「この ほん は…」 (Quyển sách này thì...).',
          'Không bao giờ có cấu trúc 「この は…」.',
        ],
      },
      {
        id: 'g2-3',
        text: 'そうです / ちがいます',
        structure: 'はい、そうです。 / いいえ、ちがいます。',
        meaning: 'Dùng để trả lời cho một câu hỏi xác nhận (câu hỏi có ですか). 「はい、そうです。」 có nghĩa là "Vâng, đúng vậy." dùng để xác nhận thông tin là đúng. 「いいえ、ちがいます。」 có nghĩa là "Không, không phải/sai rồi." dùng để phủ nhận thông tin.',
        examples: [
          { jp: '「それ は テレホンカード ですか。」「はい、そうです。」', vi: '「Đó có phải là thẻ điện thoại không?」「Vâng, đúng vậy.」' },
          { jp: '「これ は ボールペン ですか。」「いいえ、ちがいます。シャープペンシル です。」', vi: '「Đây có phải là bút bi không?」「Không, không phải. Là bút chì kim.」' },
        ],
        notes: [
          'Đây là cách trả lời ngắn gọn và tự nhiên.',
        ],
      },
      {
        id: 'g2-4',
        text: 'Câu hỏi lựa chọn A か, B か',
        structure: '～は A ですか、B ですか。',
        meaning: 'Đây là mẫu câu hỏi yêu cầu người nghe chọn một trong hai (hoặc nhiều) phương án được đưa ra. Người trả lời sẽ không dùng 「はい」 hay 「いいえ」 mà sẽ nói thẳng ra lựa chọn của mình.',
        examples: [
          { jp: 'これ は 「９」 ですか、「７」 ですか。…「９」 です。', vi: 'Đây là số "9" hay số "7"? ...Là số "9".' },
          { jp: 'それ は にほんご の ほん ですか、えいご の ほん ですか。…にほんご の ほん です。', vi: 'Đó là sách tiếng Nhật hay sách tiếng Anh? ...Là sách tiếng Nhật.' },
        ],
        notes: [
          'Lưu ý, không trả lời bằng 「はい」/「いいえ」 cho loại câu hỏi này.',
        ],
      },
      {
        id: 'g2-5',
        text: 'Danh từ 1 の Danh từ 2 (Nội dung, Sở hữu)',
        structure: 'N1 の N2',
        meaning: 'Ngoài ý nghĩa sở hữu đã học ở Bài 1, trợ từ 「の」 còn dùng để chỉ rõ hơn về nội dung hoặc chủng loại của N2. N1 sẽ giải thích N2 là về cái gì.',
        examples: [
          { jp: 'これ は コンピューター の ほん です。', vi: 'Đây là quyển sách về máy tính.' },
          { jp: 'あれ は なん の ざっし ですか。…じどうしゃ の ざっし です。', vi: 'Kia là tạp chí về cái gì vậy? ...Là tạp chí về ô tô.' },
          { jp: 'これ は だれ の かばん ですか。…わたし の かばん です。', vi: 'Đây là cái cặp của ai vậy? ...Là cặp của tôi.' },
        ],
        notes: [
          'Nghi vấn từ tương ứng là 「なんの～」(về cái gì) và 「だれの～」(của ai).',
        ],
      },
      {
        id: 'g2-6',
        text: 'そうですか',
        structure: 'そうですか。',
        meaning: 'Không phải là một câu hỏi, mà là một câu cảm thán thể hiện rằng người nói đã tiếp nhận một thông tin mới. Nó có nghĩa là "Thế à.", "Vậy à.", "Tôi hiểu rồi.".',
        examples: [
          { jp: '「この かさ は あなた の ですか。」「いいえ、ちがいます。ミラーさん の です。」「そうですか。」', vi: '「Cái ô này có phải của bạn không?」「Không, không phải. Là của anh Miller.」「Vậy à.」' },
        ],
        notes: [
          'Khi nói, người ta thường hạ giọng ở cuối câu để phân biệt với câu hỏi 「そうですか？」 (Có đúng vậy không?).',
        ],
      },
    ],
    vocabulary: [
      { id: 'v2-1', jp: 'これ', romaji: 'kore', vi: 'Cái này, đây (vật gần người nói)' },
      { id: 'v2-2', jp: 'それ', romaji: 'sore', vi: 'Cái đó, đó (vật gần người nghe)' },
      { id: 'v2-3', jp: 'あれ', romaji: 'are', vi: 'Cái kia, kia (vật xa cả hai)' },
      { id: 'v2-4', jp: 'この～', romaji: 'kono~', vi: '~ này' },
      { id: 'v2-5', jp: 'その～', romaji: 'sono~', vi: '~ đó' },
      { id: 'v2-6', jp: 'あの～', romaji: 'ano~', vi: '~ kia' },
      { id: 'v2-7', jp: 'ほん', romaji: 'hon', vi: 'Sách' },
      { id: 'v2-8', jp: 'じしょ', romaji: 'jisho', vi: 'Từ điển' },
      { id: 'v2-9', jp: 'ざっし', romaji: 'zasshi', vi: 'Tạp chí' },
      { id: 'v2-10', jp: 'しんぶん', romaji: 'shinbun', vi: 'Báo' },
      { id: 'v2-11', jp: 'ノート', romaji: 'no-to', vi: 'Vở, sổ tay' },
      { id: 'v2-12', jp: 'てちょう', romaji: 'techou', vi: 'Sổ tay' },
      { id: 'v2-13', jp: 'めいし', romaji: 'meishi', vi: 'Danh thiếp' },
      { id: 'v2-14', jp: 'カード', romaji: 'ka-do', vi: 'Thẻ, cạc' },
      { id: 'v2-15', jp: 'えんぴつ', romaji: 'enpitsu', vi: 'Bút chì' },
      { id: 'v2-16', jp: 'ボールペン', romaji: 'bo-rupen', vi: 'Bút bi' },
      { id: 'v2-17', jp: 'シャープペンシル', romaji: 'sha-pupenshiru', vi: 'Bút chì kim' },
      { id: 'v2-18', jp: 'かぎ', romaji: 'kagi', vi: 'Chìa khóa' },
      { id: 'v2-19', jp: 'とけい', romaji: 'tokei', vi: 'Đồng hồ' },
      { id: 'v2-20', jp: 'かさ', romaji: 'kasa', vi: 'Ô, dù' },
      { id: 'v2-21', jp: 'かばん', romaji: 'kaban', vi: 'Cặp sách, túi xách' },
      { id: 'v2-22', jp: 'テレビ', romaji: 'terebi', vi: 'Tivi' },
      { id: 'v2-23', jp: 'ラジオ', romaji: 'rajio', vi: 'Radio, đài' },
      { id: 'v2-24', jp: 'カメラ', romaji: 'kamera', vi: 'Máy ảnh' },
      { id: 'v2-25', jp: 'コンピューター', romaji: 'konpyu-ta-', vi: 'Máy vi tính' },
      { id: 'v2-26', jp: 'くるま', romaji: 'kuruma', vi: 'Ô tô, xe hơi' },
      { id: 'v2-27', jp: 'つくえ', romaji: 'tsukue', vi: 'Cái bàn' },
      { id: 'v2-28', jp: 'いす', romaji: 'isu', vi: 'Cái ghế' },
      { id: 'v2-29', jp: 'チョコレート', romaji: 'chokore-to', vi: 'Sô-cô-la' },
      { id: 'v2-30', jp: 'コーヒー', romaji: 'ko-hi-', vi: 'Cà phê' },
      { id: 'v2-31', jp: 'おみやげ', romaji: 'omiyage', vi: 'Quà (lưu niệm)' },
      { id: 'v2-32', jp: 'えいご', romaji: 'eigo', vi: 'Tiếng Anh' },
      { id: 'v2-33', jp: 'にほんご', romaji: 'nihongo', vi: 'Tiếng Nhật' },
      { id: 'v2-34', jp: '～ご', romaji: '~go', vi: 'Tiếng ~' },
      { id: 'v2-35', jp: 'なん', romaji: 'nan', vi: 'Cái gì' },
      { id: 'v2-36', jp: 'そう', romaji: 'sou', vi: 'Đúng, phải' },
      { id: 'v2-37', jp: 'ちがいます', romaji: 'chigaimasu', vi: 'Không phải, sai rồi' },
      { id: 'v2-38', jp: 'そうですか', romaji: 'sou desu ka', vi: 'Thế à?/Vậy à?' },
      { id: 'v2-39', jp: 'あのう', romaji: 'anou', vi: 'À, ờ... (từ đệm)' },
      { id: 'v2-40', jp: 'ほんのきもちです', romaji: 'honno kimochi desu', vi: 'Đây là chút lòng thành của tôi' },
      { id: 'v2-41', jp: 'どうぞ', romaji: 'douzo', vi: 'Xin mời' },
      { id: 'v2-42', jp: 'どうも', romaji: 'doumo', vi: 'Cảm ơn' },
      { id: 'v2-43', jp: 'どうもありがとうございます', romaji: 'doumo arigatou gozaimasu', vi: 'Xin chân thành cảm ơn' },
      { id: 'v2-44', jp: 'これからおせわになります', romaji: 'korekara osewa ni narimasu', vi: 'Từ nay mong được anh/chị giúp đỡ' },
      { id: 'v2-45', jp: 'こちらこそよろしく', romaji: 'kochirakoso yoroshiku', vi: 'Chính tôi mới mong được anh/chị giúp đỡ' },
    ],
  },
  // ... dữ liệu cho các bài tiếp theo
};