import React, { useState } from 'react';
import { 
  ArrowLeft, RotateCw, Check, X, Sparkles, BookOpen, ChevronRight 
} from 'lucide-react';
import SoundEffects from '../SoundEffects';

export default function FlashcardView({ 
  theme, 
  course, 
  exercise, 
  onBack, 
  onFinish 
}) {
  const cards = [
    {
      id: 1,
      concept: "Tư duy sản phẩm lấy người dùng làm trung tâm",
      citation: "Slide Trang 1 • DEMO-001",
      question: "Điều cốt lõi khi bắt đầu thiết kế sản phẩm AI là gì?",
      answer: "Bắt đầu từ nỗi đau có thật của người dùng cụ thể (ai - đang làm gì - vướng đâu - hậu quả gì) thay vì tìm chỗ nhét công nghệ AI."
    },
    {
      id: 2,
      concept: "Khung JTBD (Jobs-to-be-Done)",
      citation: "Slide Trang 2 • DEMO-002",
      question: "Job Statement có được chứa tên sản phẩm hoặc AI không?",
      answer: "Tuyệt đối không! Việc cần làm (Job) phải tồn tại độc lập kể cả khi không có AI."
    },
    {
      id: 3,
      concept: "Chuẩn Bằng Chứng A và B",
      citation: "Slide Trang 3 • DEMO-003",
      question: "Bằng chứng Chuẩn A và Chuẩn B khác nhau như thế nào?",
      answer: "Chuẩn A là khảo sát ≥20 người ngoài nhóm (≥50% xác nhận). Chuẩn B là mining data đếm được kèm ≥5 ví dụ nguyên văn."
    },
    {
      id: 4,
      concept: "Vòng lặp thích ứng (Adaptive Loop)",
      citation: "Slide Trang 10 • DEMO-010",
      question: "Tại sao không được đưa lại câu hỏi cũ khi học viên làm sai?",
      answer: "Để chống học vẹt đáp án; hệ thống bắt buộc sinh câu hỏi tình huống mới 100% để kiểm tra độ thuần thục (Mastery)."
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  const currentCard = cards[currentIndex];
  const isFinished = currentIndex >= cards.length;

  const handleNext = (isCorrect) => {
    if (isCorrect) {
      SoundEffects.playCorrect();
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      SoundEffects.playWrong();
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }

    setIsFlipped(false);
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className={`p-2 rounded-2xl transition-colors ${
              theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Luyện tập Flashcard
            </h2>
            <span className="text-xs text-gray-400 font-medium">Lật thẻ ghi nhớ & lặp lại ngắt quãng</span>
          </div>
        </div>

        {!isFinished && (
          <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800 px-3 py-1.5 rounded-full">
            Thẻ {currentIndex + 1} / {cards.length}
          </span>
        )}
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Flashcard Box */}
          <div
            onClick={() => {
              SoundEffects.playClick();
              setIsFlipped(!isFlipped);
            }}
            className={`h-80 rounded-3xl border-2 p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 transform perspective-1000 shadow-lg ${
              isFlipped
                ? 'bg-gradient-to-br from-[#6366f1] to-[#4338ca] text-white border-indigo-400'
                : theme === 'dark'
                ? 'bg-[#181824] border-gray-800 text-gray-100'
                : 'bg-white border-indigo-100 text-gray-800 hover:border-indigo-300'
            }`}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                isFlipped ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-gray-800 text-indigo-600'
              }`}>
                {currentCard.citation}
              </span>

              <span className={`text-xs font-bold flex items-center gap-1.5 ${
                isFlipped ? 'text-indigo-200' : 'text-gray-400'
              }`}>
                <RotateCw className="w-3.5 h-3.5" />
                <span>{isFlipped ? 'Đáp án' : 'Bấm để lật thẻ'}</span>
              </span>
            </div>

            {/* Card Content */}
            <div className="text-center px-4">
              {!isFlipped ? (
                <div className="space-y-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-500">
                    Khái niệm: {currentCard.concept}
                  </span>
                  <h3 className="text-lg md:text-xl font-bold leading-relaxed">
                    {currentCard.question}
                  </h3>
                </div>
              ) : (
                <div className="space-y-3 animate-fadeIn">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Đáp án chuẩn
                  </span>
                  <p className="text-sm md:text-base font-medium leading-relaxed">
                    {currentCard.answer}
                  </p>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="text-center text-[11px] opacity-70">
              {isFlipped ? 'Chọn kết quả bên dưới để sang câu tiếp' : 'Bấm vào thẻ để xem câu trả lời'}
            </div>
          </div>

          {/* Action buttons (Quẹt trái khi sai, quẹt phải khi đúng matching Figma) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNext(false)}
              className="flex-1 py-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900/60 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors shadow-sm"
            >
              <X className="w-4 h-4" />
              <span>Chưa thuộc (Quẹt trái)</span>
            </button>

            <button
              onClick={() => handleNext(true)}
              className="flex-1 py-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25"
            >
              <Check className="w-4 h-4" />
              <span>Đã thuộc (Quẹt phải)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Finished Screen */
        <div className={`p-10 rounded-3xl border text-center space-y-6 ${
          theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-md'
        }`}>
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
            🎉
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Hoàn thành phiên Flashcard!
            </h3>
            <p className="text-xs text-gray-500">
              Bạn đã ôn tập xong {cards.length} thẻ ghi nhớ của môn học.
            </p>
          </div>

          <div className="flex justify-center gap-8 text-sm">
            <div>
              <div className="text-xl font-black text-emerald-600">{score.correct}</div>
              <div className="text-xs text-gray-400">Đã nhớ tốt</div>
            </div>
            <div>
              <div className="text-xl font-black text-rose-500">{score.wrong}</div>
              <div className="text-xs text-gray-400">Cần ôn thêm</div>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setScore({ correct: 0, wrong: 0 });
              }}
              className="px-6 py-2.5 rounded-full text-xs font-bold border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              Luyện lại
            </button>
            <button
              onClick={onFinish}
              className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#6366f1] text-white hover:bg-[#4f46e5] shadow-md shadow-indigo-500/20"
            >
              Về chi tiết môn học
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

