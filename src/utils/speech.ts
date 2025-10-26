// src/utils/speech.ts

// Biến này giờ nằm ở cấp độ module, chỉ được khởi tạo một lần.
let voiceList: SpeechSynthesisVoice[] = [];

// Promise này cũng chỉ được tạo một lần.
const voicesPromise = new Promise<SpeechSynthesisVoice[]>((resolve, reject) => {
  // Nếu trình duyệt không hỗ trợ, reject sớm.
  if (!('speechSynthesis' in window)) {
    return reject('Speech Synthesis not supported');
  }

  // Hàm này sẽ được gọi khi voice đã sẵn sàng.
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voiceList = voices;
      resolve(voiceList);
      // Gỡ bỏ listener sau khi đã hoàn thành để tránh memory leak
      window.speechSynthesis.onvoiceschanged = null;
    }
  };

  // Đăng ký listener
  window.speechSynthesis.onvoiceschanged = loadVoices;

  // Gọi một lần phòng trường hợp voice đã được tải sẵn (thường thấy trên Chrome)
  loadVoices();
});

// Hàm phát âm chính, export để các component khác có thể sử dụng.
export const speakJapanese = async (text: string) => {
  try {
    // Chờ cho promise của giọng đọc hoàn thành.
    const voices = await voicesPromise;

    // Dừng âm thanh đang phát (nếu có)
    window.speechSynthesis.cancel();

    // Tìm giọng đọc tiếng Nhật (logic không đổi)
    let japaneseVoice = voices.find(voice => voice.lang === 'ja-JP' && voice.name.includes('Google'));
    if (!japaneseVoice) {
      japaneseVoice = voices.find(voice => voice.lang === 'ja-JP');
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;

    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    } else {
      console.warn('Japanese voice not found. Using default voice.');
      // Logic cảnh báo cho người dùng có thể giữ nguyên ở đây nếu muốn
      if (!(window as any).hasShownVoiceWarning) {
        setTimeout(() => {
          if (!window.speechSynthesis.speaking) {
            alert('Không tìm thấy gói giọng đọc tiếng Nhật trên trình duyệt này. Âm thanh có thể không chính xác.');
            (window as any).hasShownVoiceWarning = true;
          }
        }, 1000);
      }
    }

    window.speechSynthesis.speak(utterance);

  } catch (error) {
    console.error("Error speaking text:", error);
    // Có thể hiển thị alert cho người dùng ở đây
    alert('Đã xảy ra lỗi với chức năng phát âm.');
  }
};