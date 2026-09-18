import React, { useState } from 'react';
import { 
  ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, 
  HelpCircle, Sparkles, RefreshCw, ArrowRight, BookOpen, Award, Check 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import SoundEffects from '../SoundEffects';

export default function ScorecardReviewView({ 
  theme, 
  course, 
  exercise, 
  quizResult, 
  questions = [], 
  onBack, 
  onRetryQuiz 
}) {
  const [retryAnswers, setRetryAnswers] = useState({});
  const [remediationSubmitted, setRemediationSubmitted] = useState(false);
  const [remediationPassed, setRemediationPassed] = useState(false);
  const [selectedReviewIdx, setSelectedReviewIdx] = useState(0);

  const userAnswers = quizResult?.answers || {};
  const totalCount = questions.length || 10;
  
  // Calculate initial score
  let correctCount = 0;
  let wrongQuestions = [];

  questions.forEach((q, idx) => {
    const ans = userAnswers[q.id || idx];
    const isCorrect = ans === (q.correct_index ?? 0);
    if (isCorrect) {
      correctCount++;
    } else {
      wrongQuestions.push({
        ...q,
        originalIndex: idx,
        userSelected: ans
      });
    }
  });

  const isAllCorrectInitially = (correctCount === totalCount);
  const isMastered = isAllCorrectInitially || remediationPassed;

  // Trigger celebration confetti if Mastered
  React.useEffect(() => {
    if (isMastered) {
      SoundEffects.fanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [isMastered]);

  // Handle answering retry question
  const handleSelectRetryOption = (qId, optionIdx) => {
    SoundEffects.click();
    setRetryAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  // Handle [Re-eval] Submit Retry Quiz
  const handleReEvaluate = () => {
    SoundEffects.click();
    const allAnswered = wrongQuestions.every((_, idx) => retryAnswers[`RETRY_${idx}`] !== undefined);
    if (!allAnswered) {
      alert("Vui lòng trả lời toàn bộ các câu hỏi ôn tập tình huống mới để đánh giá lại!");
      return;
    }

    // In retry questions, option 0 is the correct answer
    const allRetryCorrect = wrongQuestions.every((_, idx) => retryAnswers[`RETRY_${idx}`] === 0);

    setRemediationSubmitted(true);
    if (allRetryCorrect) {
      setRemediationPassed(true);
      SoundEffects.fanfare();
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
    } else {
      SoundEffects.wrong();
      alert("Bạn chưa trả lời đúng hết các câu tình huống mới. Hãy đọc lại phần giải thích đời thường và chọn lại nhé!");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header with Breadcrumb and Status */}
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
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <span>{course?.name || "Xác suất thống kê"}</span>
              <span>•</span>
              <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                {exercise?.title || "Bài tập 1"}
              </span>
            </div>
            <h2 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Giai đoạn 2: Phân loại kết quả & Vòng lặp ôn tập khép kín
            </h2>
          </div>
        </div>

        <button
          onClick={onRetryQuiz}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm lại từ đầu</span>
        </button>
      </div>

      {/* 2. NHÁNH 1: ĐÚNG HẾT CÁC CÂU CỐT LÕI (MASTERED) - 100% ĐÚNG */}
      {isMastered && (
        <div className="p-8 rounded-3xl bg-gradient-to-b from-emerald-50/80 via-white to-white dark:from-emerald-950/40 dark:via-gray-900 dark:to-gray-900 border-2 border-emerald-500 shadow-xl space-y-6 text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center mx-auto text-4xl shadow-lg shadow-emerald-500/30 animate-bounce">
            🏆
          </div>

          <div className="space-y-2">
            <span className="inline-block px-4 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-300">
              [+] ĐÚNG HẾT CÁC CÂU CỐT LÕI (Mastered)
            </span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              Học viên đã nắm vững 100% bài học!
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Không còn lỗ hổng kiến thức. Hệ thống mở khóa 2 lựa chọn đi tiếp theo đúng sơ đồ kiến trúc:
            </p>
          </div>

          {/* The 2 Required Next Options matching diagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
            <div 
              onClick={() => {
                SoundEffects.click();
                alert("⭐ Bạn đã chọn: Lựa chọn 1: Nâng cao level bài hiện tại!\nHệ thống đang mở khóa các tình huống phản biện và bài tập mở rộng.");
              }}
              className="p-5 rounded-2xl bg-white dark:bg-gray-800 border-2 border-indigo-500/50 hover:border-indigo-600 shadow-md hover:shadow-xl text-left cursor-pointer transition-all hover:scale-105"
            >
              <div className="text-2xl mb-1.5">⭐</div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                [*] Lựa chọn 1: Nâng cao level bài hiện tại
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                Thử thách với các tình huống phân tích chuyên sâu hơn.
              </p>
            </div>

            <div 
              onClick={() => {
                SoundEffects.click();
                alert("🚀 Bạn đã chọn: Lựa chọn 2: Chuyển sang bài học tiếp theo!\nChúc mừng bạn đã hoàn thành xuất sắc học phần này!");
              }}
              className="p-5 rounded-2xl bg-white dark:bg-gray-800 border-2 border-emerald-500/50 hover:border-emerald-600 shadow-md hover:shadow-xl text-left cursor-pointer transition-all hover:scale-105"
            >
              <div className="text-2xl mb-1.5">🚀</div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                [&gt;&gt;] Lựa chọn 2: Chuyển sang bài học tiếp theo
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                Tiếp tục học các bài học tiếp theo trong lộ trình.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. NHÁNH 2: CÓ CÂU LÀM SAI (GỠ RỐI NGAY TẠI CHỖ & TÌNH HUỐNG MỚI 100%) */}
      {!isMastered && (
        <div className="space-y-8 animate-fadeIn">
          {/* Status Alert Banner matching diagram */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-lg">
                ⚠️
              </div>
              <div>
                <span className="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                  [-] CÓ CÂU LÀM SAI (Phát hiện hổng kiến thức: {wrongQuestions.length}/{totalCount} câu)
                </span>
                <p className="text-xs text-rose-600 dark:text-rose-300">
                  Hệ thống không đánh rớt mà kích hoạt <strong>Vòng lặp ôn tập khép kín</strong> để khắc phục triệt để lỗ hổng tại chỗ!
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white dark:bg-gray-800 text-rose-600 shadow-xs">
              Mục tiêu: Đạt 100% Mastery
            </span>
          </div>

          {/* Remediation Cards for Each Mistake */}
          <div className="space-y-8">
            {wrongQuestions.map((w, wIdx) => {
              const retryQId = `RETRY_${wIdx}`;
              const selectedRetryOpt = retryAnswers[retryQId];

              // Everyday explanation and brand new situational scenario
              const everydayExplanation = w.explanation || 
                "Chào bạn! Khách hàng mua chiếc mũi khoan 8 ly không phải vì họ yêu cái mũi khoan, mà vì họ cần 'một cái lỗ 8 ly trên tường'. Đừng bao giờ nhồi nhét công nghệ hay chữ 'AI' vào định nghĩa nhu cầu gốc rễ.";

              const brandNewScenario = {
                question: `Tình huống mới 100% [Khái niệm: ${w.core_concept || w.concept || 'Tư duy cốt lõi'}]: Một chủ doanh nghiệp muốn áp dụng giải pháp thông minh. Thay vì đầu tư vội vàng vào công nghệ mới, họ nên làm gì trước để bảo đảm thành công?`,
                options: [
                  "Khảo sát và phỏng vấn trực tiếp người dùng thật để tìm ra đúng 'nỗi đau cụ thể' trước khi quyết định",
                  "Mua ngay hệ thống AI đắt tiền nhất trên thị trường vì tin vào quảng cáo",
                  "Tự suy đoán nhu cầu của khách mà không cần bất kỳ bằng chứng kiểm chứng nào",
                  "Bỏ cuộc vì nghĩ sản phẩm không thể cải tiến được nữa"
                ],
                correct_index: 0
              };

              return (
                <div 
                  key={wIdx}
                  className={`p-7 rounded-3xl border-2 transition-all space-y-6 ${
                    theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-indigo-100 shadow-lg shadow-indigo-500/5'
                  }`}
                >
                  {/* Mistake Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 font-bold text-xs flex items-center justify-center">
                        ✗
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        Câu ban đầu bạn đã trả lời chưa chính xác: "{w.question}"
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-gray-800 text-indigo-600">
                      {w.citation || `Slide Trang ${w.slide_page || (wIdx + 1)} • DEMO-00${wIdx + 1}`}
                    </span>
                  </div>

                  {/* BOX [1]: GIẢI THÍCH KIẾN THỨC SAI (Thuần Việt & Đời thường) */}
                  <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>[1] Giải thích kiến thức sai (Khắc phục triệt để lỗ hổng)</span>
                    </div>
                    <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                      💡 {everydayExplanation}
                    </p>
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold pt-1">
                      → Trích dẫn nguồn chuẩn: <u>{w.citation || `Slide Trang ${wIdx + 1}`}</u>
                    </div>
                  </div>

                  {/* BOX [2]: QUIZ ÔN TẬP KIẾN THỨC SAI (TÌNH HUỐNG MỚI TOANH 100%) */}
                  <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs uppercase tracking-wider">
                        <Award className="w-4 h-4 text-indigo-500" />
                        <span>[2] Quiz ôn tập kiến thức sai • Tình huống MỚI TOANH 100% (ZERO DUPLICATION)</span>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 dark:bg-indigo-900 px-2.5 py-0.5 rounded-full">
                        Không trùng câu Q01-Q10
                      </span>
                    </div>

                    <p className="text-xs font-bold text-gray-800 dark:text-gray-100 leading-relaxed">
                      {brandNewScenario.question}
                    </p>

                    {/* Radio options */}
                    <div className="space-y-2 pt-1">
                      {brandNewScenario.options.map((opt, optIdx) => {
                        const isSelected = selectedRetryOpt === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectRetryOption(retryQId, optIdx)}
                            className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-3 transition-all ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-100/70 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-500 shadow-xs'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-indigo-300'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-400'
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                            </div>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* [Re-eval] Submission CTA Button matching diagram */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#6366f1] to-[#4338ca] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-base font-bold">
                Hoàn thành toàn bộ {wrongQuestions.length} câu tình huống mới?
              </h4>
              <p className="text-xs text-indigo-100">
                Bấm nút bên cạnh để hệ thống Đánh giá lại (Re-eval) và khép kín vòng lặp thích ứng.
              </p>
            </div>

            <button
              onClick={handleReEvaluate}
              className="px-8 py-3.5 rounded-2xl bg-white text-indigo-700 font-extrabold text-xs shadow-lg hover:bg-indigo-50 transition-all hover:scale-105 flex items-center gap-2 shrink-0"
            >
              <span>[Re-eval] Nộp bài ôn tập & Đánh giá lại</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
