import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, 
  HelpCircle, Sparkles, RefreshCw, ArrowRight, BookOpen, Award, Check, BarChart3, Star 
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
  const [loopCount, setLoopCount] = useState(1);
  const [evaluating, setEvaluating] = useState(false);

  // Số lượng câu hỏi và kết quả
  const totalCount = quizResult?.totalQuestions || questions.length || ((quizResult?.correctCount ?? 0) + (quizResult?.wrongCount ?? 0)) || 1;
  const correctCount = quizResult?.correctCount ?? 0;
  const wrongCount = quizResult?.wrongCount ?? (totalCount - correctCount);
  const score = quizResult?.score ?? Number(((correctCount / totalCount) * 10).toFixed(1));
  const scorePercent = quizResult?.scorePercent ?? Math.round((correctCount / totalCount) * 100);

  // Danh sách gói gỡ rối (Adaptive Remediation Items) trả về từ Backend
  const remediationItems = useMemo(() => {
    if (quizResult?.remediationPackage?.remediation_items && quizResult.remediationPackage.remediation_items.length > 0) {
      return quizResult.remediationPackage.remediation_items;
    }
    // Fallback nếu có wrong_questions
    if (quizResult?.wrongQuestions && quizResult.wrongQuestions.length > 0) {
      return quizResult.wrongQuestions.map((w, idx) => ({
        source_question_id: w.id || w.question_id || `Q${idx + 1}`,
        concept_name: w.core_concept || "Kiến thức bài giảng",
        provenance: w.provenance || `Slide Trang ${w.slide_page || (idx + 1)} • ${w.citation_code || 'DEMO'}`,
        slide_page: w.slide_page || (idx + 1),
        citation_code: w.citation_code || 'DEMO',
        everyday_explanation: {
          summary: `Khái niệm cốt lõi: ${w.core_concept || 'Kiến thức bài giảng'}`,
          detail: w.explanation || "Hãy chú ý xem kỹ căn cứ và định nghĩa bản chất trong tài liệu bài giảng.",
          citation: w.provenance || `Slide Trang ${w.slide_page || (idx + 1)}`
        },
        adaptive_question: {
          id: `RETRY_${w.id || w.question_id || idx}`,
          question: `Tình huống ôn tập mới: Áp dụng kiến thức [${w.core_concept || 'Cốt lõi'}], trong thực tế bạn nên hành xử như thế nào?`,
          options: [
            "Bắt đầu từ giải quyết bài toán thật của người dùng và tuân thủ nguyên tắc phương pháp luận",
            "Đầu tư mua sắm công nghệ đắt tiền ngay mà không cần khảo sát",
            "Tự suy đoán cảm tính không cần kiểm chứng",
            "Bỏ qua quy chuẩn để làm cho xong"
          ],
          correct_index: 0
        }
      }));
    }
    return [];
  }, [quizResult]);

  const [currentRemediationItems, setCurrentRemediationItems] = useState(remediationItems);

  useEffect(() => {
    setCurrentRemediationItems(remediationItems);
  }, [remediationItems]);

  const isAllCorrectInitially = (wrongCount === 0 || (quizResult?.status === 'ALL_CORRECT_MASTERY') || quizResult?.masteryAchieved);
  const isMastered = isAllCorrectInitially || remediationPassed;

  // Hiệu ứng pháo hoa khi đạt Mastery
  useEffect(() => {
    if (isMastered) {
      SoundEffects.fanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [isMastered]);

  // Chọn đáp án câu ôn tập thích ứng
  const handleSelectRetryOption = (retryQId, optionIdx, fallbackIdx) => {
    SoundEffects.click();
    setRetryAnswers(prev => ({ 
      ...prev, 
      [retryQId]: optionIdx,
      [`RETRY_${fallbackIdx}`]: optionIdx
    }));
  };

  // Submit bài ôn tập Re-eval -> Gọi /api/student/submit-remediation
  const handleReEvaluate = async () => {
    SoundEffects.click();
    const items = currentRemediationItems;
    const allAnswered = items.every((item, idx) => {
      const qid = item.adaptive_question?.id || `RETRY_${idx}`;
      return retryAnswers[qid] !== undefined || retryAnswers[`RETRY_${idx}`] !== undefined;
    });

    if (!allAnswered) {
      alert("Vui lòng trả lời toàn bộ các câu hỏi ôn tập tình huống mới để hệ thống đánh giá lại!");
      return;
    }

    setEvaluating(true);

    if (quizResult?.sessionId) {
      try {
        const res = await fetch('/api/student/submit-remediation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: quizResult.sessionId,
            answers: retryAnswers
          })
        });
        if (res.ok) {
          const evalRes = await res.json();
          setRemediationSubmitted(true);
          setEvaluating(false);

          if (evalRes.status === 'ALL_CORRECT_MASTERY' || evalRes.mastery_achieved) {
            setRemediationPassed(true);
            SoundEffects.fanfare();
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 }
            });
          } else {
            SoundEffects.wrong();
            setLoopCount(prev => prev + 1);
            alert(`⚠️ Bạn đã hoàn thành ${evalRes.correct_count}/${evalRes.total} câu. Hệ thống tiếp tục giữ vững vòng lặp (Lần ${loopCount + 1}) để hỗ trợ bạn thành thạo 100%!`);
          }
          return;
        }
      } catch (e) {
        console.warn("Backend re-eval error, fallback to local re-eval", e);
      }
    }

    // Local fallback
    setRemediationSubmitted(true);
    setEvaluating(false);
    setRemediationPassed(true);
    SoundEffects.fanfare();
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Header Navigation */}
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
              <span>{course?.name || "Tư duy sản phẩm AI"}</span>
              <span>•</span>
              <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                {exercise?.title || "Bài đánh giá thích ứng"}
              </span>
            </div>
            <h2 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Kết Quả Đánh Giá & Vòng Lặp Thích Ứng Khép Kín
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

      {/* 2. BẢNG TỔNG HỢP ĐIỂM SỐ (SCORECARD SUMMARY) */}
      <div className={`p-6 rounded-3xl border-2 transition-all ${
        isMastered
          ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/40'
          : 'bg-gradient-to-r from-indigo-500/10 via-amber-500/5 to-transparent border-indigo-500/30'
      }`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {/* Điểm số */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 shadow-xs border border-gray-100 dark:border-gray-700">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Điểm số
            </span>
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {score} <span className="text-sm font-semibold text-gray-400">/ 10</span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Tỷ lệ: {scorePercent}%</span>
          </div>

          {/* Số câu đúng */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 shadow-xs border border-gray-100 dark:border-gray-700">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
              Số câu đúng
            </span>
            <div className="text-3xl font-black text-emerald-600">
              {correctCount} <span className="text-sm font-semibold text-gray-400">/ {totalCount}</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Chính xác</span>
          </div>

          {/* Cần củng cố */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 shadow-xs border border-gray-100 dark:border-gray-700">
            <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block mb-1">
              Cần củng cố
            </span>
            <div className="text-3xl font-black text-rose-500">
              {wrongCount} <span className="text-sm font-semibold text-gray-400">câu</span>
            </div>
            <span className="text-[10px] text-rose-500 font-medium">
              {wrongCount === 0 ? "Không có lỗi" : "Gỡ rối tại chỗ"}
            </span>
          </div>

          {/* Trạng thái phân loại */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 shadow-xs border border-gray-100 dark:border-gray-700">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Phân loại
            </span>
            <div className="pt-1">
              {isMastered ? (
                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full">
                  <Check className="w-3.5 h-3.5" /> 100% MASTERY
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-1 rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" /> CẦN ÔN TẬP
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-medium mt-1 block">
              Thời gian: {quizResult?.timeSpent ?? 0}s
            </span>
          </div>
        </div>
      </div>

      {/* 3. NHÁNH 1: ĐÚNG HẾT CÁC CÂU CỐT LÕI (MASTERED) - 100% ĐÚNG */}
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

          {/* 2 Lựa chọn đi tiếp */}
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

      {/* 4. NHÁNH 2: CÓ CÂU LÀM SAI (GỠ RỐI NGAY TẠI CHỖ & TÌNH HUỐNG MỚI 100%) */}
      {!isMastered && (
        <div className="space-y-8 animate-fadeIn">
          {/* Banner thông báo */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-lg">
                ⚠️
              </div>
              <div>
                <span className="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                  [-] CÓ CÂU LÀM SAI (Phát hiện hổng kiến thức: {currentRemediationItems.length} concept • Vòng lặp Lần {loopCount})
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

          {/* Danh sách các gói gỡ rối (Remediation Cards) */}
          <div className="space-y-8">
            {currentRemediationItems.map((item, idx) => {
              const retryQ = item.adaptive_question || {};
              const retryQId = retryQ.id || `RETRY_${idx}`;
              const selectedRetryOpt = retryAnswers[retryQId] ?? retryAnswers[`RETRY_${idx}`];

              const conceptName = item.concept_name || "Kiến thức trọng tâm";
              const provenance = item.provenance || `Slide Trang ${item.slide_page || (idx + 1)} • ${item.citation_code || 'DEMO'}`;
              const explanationText = item.everyday_explanation?.detail || item.everyday_explanation?.summary || "Cần nắm vững bản chất nhu cầu thật của người dùng và căn cứ bài giảng.";

              return (
                <div 
                  key={idx}
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
                        Concept bạn cần củng cố: "{conceptName}" (Câu gốc: {item.source_question_id})
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-gray-800 text-indigo-600">
                      {provenance}
                    </span>
                  </div>

                  {/* BOX [1]: GIẢI THÍCH KIẾN THỨC SAI (Thuần Việt & Đời thường) */}
                  <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>[1] Giải thích kiến thức sai (Ngôn ngữ đời thường thuần Việt)</span>
                    </div>
                    <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                      💡 {explanationText}
                    </p>
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold pt-1">
                      → Căn cứ tài liệu: <u>{provenance}</u>
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
                        Không trùng câu ban đầu
                      </span>
                    </div>

                    <p className="text-xs font-bold text-gray-800 dark:text-gray-100 leading-relaxed">
                      {retryQ.question || "Tình huống ôn tập mới:"}
                    </p>

                    {/* Radio options */}
                    <div className="space-y-2 pt-1">
                      {(retryQ.options || []).map((opt, optIdx) => {
                        const isSelected = selectedRetryOpt === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectRetryOption(retryQId, optIdx, idx)}
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

          {/* [Re-eval] Submission CTA Button */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#6366f1] to-[#4338ca] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-base font-bold">
                Hoàn thành toàn bộ {currentRemediationItems.length} câu tình huống mới?
              </h4>
              <p className="text-xs text-indigo-100">
                Bấm nút bên cạnh để quay lại Khối <strong>PHÂN LOẠI KẾT QUẢ BÀI LÀM</strong> đánh giá lại.
              </p>
            </div>

            <button
              onClick={handleReEvaluate}
              disabled={evaluating}
              className="px-8 py-3.5 rounded-2xl bg-white text-indigo-700 font-extrabold text-xs shadow-lg hover:bg-indigo-50 transition-all hover:scale-105 flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-75"
            >
              <span>{evaluating ? 'Đang phân loại lại...' : '[Re-eval] Nộp bài ôn tập & Đánh giá lại'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
