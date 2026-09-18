import React, { useState } from 'react';
import { Trophy, ArrowRight, Sparkles, CheckCircle2, RotateCcw, BookOpen, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundEffects } from './SoundEffects';

export default function AdaptiveRemediation({ resultData, onResetGame }) {
  const [retryAnswers, setRetryAnswers] = useState({});
  const [remediationPassed, setRemediationPassed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isMastery = resultData?.status === 'ALL_CORRECT_MASTERY' || remediationPassed;
  const remItems = resultData?.remediation_package?.remediation_items || [];

  const handleSelectRetryOption = (qid, optIdx) => {
    SoundEffects.click();
    setRetryAnswers({ ...retryAnswers, [qid]: optIdx });
  };

  const handleSubmitRetry = async () => {
    if (Object.keys(retryAnswers).length < remItems.length) {
      alert("Vui lòng hoàn thành toàn bộ các câu hỏi ôn tập tình huống mới!");
      return;
    }

    SoundEffects.click();
    setSubmitting(true);
    try {
      const res = await fetch('/api/student/submit-remediation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: resultData.session_id,
          answers: retryAnswers
        })
      });
      const data = await res.json();
      if (data.status === 'REMEDIATION_PASSED') {
        SoundEffects.fanfare();
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        setRemediationPassed(true);
      } else {
        SoundEffects.wrong();
        alert(`Bạn đã trả lời đúng ${data.correct_count}/${data.total} câu. Hãy đọc kỹ lại phần trích dẫn và thử lại nhé!`);
      }
    } catch (e) {
      alert("Lỗi đánh giá lại: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 100% MASTERY BRANCH
  if (isMastery) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8 text-center space-y-6 animate-fadeIn">
        <div className="bg-quiz-panel border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 mx-auto flex items-center justify-center shadow-xl shadow-amber-500/30 text-5xl animate-bounce">
            🏆
          </div>

          <div>
            <span className="px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider border border-emerald-500/40">
              ĐÚNG HẾT CÁC CÂU CỐT LÕI (100% MASTERY)
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white font-display mt-3">
              XUẤT SẮC! BẠN ĐÃ LÀM CHỦ BÀI HỌC!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
              Học viên đã nắm vững toàn bộ kiến thức bài học. Hãy chọn 1 trong 2 lựa chọn đi tiếp theo sơ đồ:
            </p>
          </div>

          {/* The 2 Required Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2">
            
            <button
              onClick={() => {
                SoundEffects.click();
                alert("⭐ Bạn đã chọn: LỰA CHỌN 1 - NÂNG CAO LEVEL BÀI HIỆN TẠI.\nHệ thống đang mở khóa các bài toán phản biện nâng cao!");
              }}
              className="btn-quiz-3d p-5 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-900 border border-purple-500/40 text-left transition cursor-pointer"
            >
              <div className="text-2xl mb-2">⭐</div>
              <h3 className="font-bold text-white text-sm sm:text-base">Lựa chọn 1: Nâng cao level bài hiện tại</h3>
              <p className="text-[11px] text-purple-200 mt-1">
                Thử thách với các tình huống phân tích chuyên sâu hơn.
              </p>
            </button>

            <button
              onClick={() => {
                SoundEffects.click();
                alert("🚀 Bạn đã chọn: LỰA CHỌN 2 - CHUYỂN SANG BÀI HỌC TIẾP THEO.\nChuyển tiếp thành công sang học phần tiếp theo trong chương trình!");
              }}
              className="btn-quiz-3d p-5 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-900 border border-emerald-500/40 text-left transition cursor-pointer"
            >
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-bold text-white text-sm sm:text-base">Lựa chọn 2: Chuyển sang bài học tiếp theo</h3>
              <p className="text-[11px] text-emerald-200 mt-1">
                Hoàn tất học phần và mở khóa nội dung mới.
              </p>
            </button>

          </div>

          <div className="pt-4">
            <button
              onClick={onResetGame}
              className="text-xs font-bold text-slate-400 hover:text-white underline"
            >
              Quay lại sảnh chính
            </button>
          </div>

        </div>
      </div>
    );
  }

  // HAS MISTAKES BRANCH: GỠ RỐI NGAY TẠI CHỖ
  return (
    <div className="w-full max-w-3xl mx-auto py-6 space-y-6 animate-fadeIn">
      
      {/* Alert Header */}
      <div className="bg-gradient-to-r from-red-950 via-quiz-panel to-quiz-dark border-2 border-red-500/40 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-red-600/30 text-red-400 flex items-center justify-center text-3xl shrink-0 border border-red-500/40">
            💡
          </div>
          <div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-black border border-red-500/30 uppercase tracking-wider">
              Phân Loại: Có Câu Làm Sai
            </span>
            <h2 className="text-xl font-black text-white font-display mt-1">
              Kích Hoạt Chế Độ: "Gỡ Rối Ngay Tại Chỗ"
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Đừng lo! AI đã bóc tách đúng phần bạn vừa làm sai và chuẩn bị bài ôn tập tình huống mới 100%.
            </p>
          </div>
        </div>

        <div className="text-center sm:text-right shrink-0">
          <span className="text-3xl font-black text-rose-400 font-display">
            {resultData.score_percent}%
          </span>
          <p className="text-[11px] text-slate-400 font-mono">
            {resultData.correct_count} / {resultData.total_questions} câu đúng
          </p>
        </div>
      </div>

      {/* Remediation Cards */}
      <div className="space-y-6">
        {remItems.map((item, idx) => {
          const exp = item.everyday_explanation;
          const q = item.adaptive_question;
          const userAns = retryAnswers[q.id];

          return (
            <div key={q.id} className="bg-quiz-panel border-2 border-quiz-border rounded-3xl p-6 shadow-xl space-y-4">
              
              {/* Part 1: Giải thích kiến thức sai */}
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-amber-300 flex items-center space-x-1.5">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>1. Giải Thích Kiến Thức Sai (Ngôn ngữ đời thường):</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-900/60 text-amber-200 border border-amber-600/60 font-mono text-[11px]">
                    📍 Nguồn: {exp.citation}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {exp.detail}
                </p>
              </div>

              {/* Part 2: Quiz ôn tập tình huống MỚI TOANH 100% */}
              <div className="bg-quiz-dark border border-quiz-border rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-purple-400 flex items-center space-x-1.5">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <span>2. Quiz Ôn Tập Kiến Thức Sai:</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-black text-[10px] uppercase tracking-wider">
                    Tình Huống Mới Toanh 100%
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                  {q.question}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = (userAns === optIdx);
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectRetryOption(q.id, optIdx)}
                        className={`text-left p-3.5 rounded-xl border transition flex items-start space-x-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 border-white text-white font-bold shadow-md'
                            : 'bg-quiz-panel hover:bg-quiz-card border-quiz-border text-slate-300'
                        }`}
                      >
                        <span className="font-mono font-black">{String.fromCharCode(65 + optIdx)}.</span>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Submit Remediation Button */}
      <div className="text-center pt-2">
        <button
          onClick={handleSubmitRetry}
          disabled={submitting}
          className="btn-quiz-3d py-4 px-8 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-black text-base shadow-xl flex items-center justify-center space-x-2 mx-auto"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>NỘP BÀI ÔN TẬP & ĐÁNH GIÁ LẠI NĂNG LỰC</span>
        </button>
        <p className="text-xs text-slate-400 mt-2">
          Đạt đúng các câu hỏi tình huống mới để thăng cấp lên Mastery!
        </p>
      </div>

    </div>
  );
}
