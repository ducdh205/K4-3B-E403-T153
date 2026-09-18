import React, { useState } from 'react';
import { 
  ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, 
  HelpCircle, Sparkles, RefreshCw, ArrowRight, BookOpen, Award 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ScorecardReviewView({ 
  theme, 
  course, 
  exercise, 
  quizResult, 
  questions = [], 
  onBack, 
  onRetryQuiz, 
  onStartAdaptiveRemediation 
}) {
  const [selectedQIndex, setSelectedQIndex] = useState(0);

  // Trigger celebration confetti if high score
  React.useEffect(() => {
    const score = quizResult?.score || 8.5;
    if (score >= 8.0) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [quizResult]);

  const userAnswers = quizResult?.answers || {};
  const totalCount = questions.length || 10;
  
  // Calculate stats
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  questions.forEach((q, idx) => {
    const ans = userAnswers[q.id || idx];
    if (ans === undefined) {
      skippedCount++;
    } else if (ans === q.correct_index || ans === 0) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const finalScore = quizResult?.score !== undefined 
    ? quizResult.score 
    : ((correctCount / totalCount) * 10).toFixed(1);

  const currentQ = questions[selectedQIndex] || {
    id: "Q01",
    question: "Theo Ăngghen, vấn đề cơ bản lớn của mọi triết học là gì?",
    citation: "Slide Trang 1 • DEMO-001",
    correct_index: 0,
    explanation: "Theo Ăngghen, vấn đề cơ bản của mọi triết học là mối quan hệ giữa tư duy và tồn tại, hay giữa ý thức và vật chất.",
    options: [
      "Mối quan hệ giữa tư duy và tồn tại, giữa ý thức và vật chất",
      "Vấn đề nguồn gốc của vũ trụ và muôn loài",
      "Mối quan hệ giữa cá nhân và xã hội",
      "Vấn đề logic học và phương pháp luận nhận thức"
    ]
  };

  const userAnsForCurrent = userAnswers[currentQ.id || selectedQIndex];
  const isCurrentCorrect = userAnsForCurrent === (currentQ.correct_index ?? 0);
  const isCurrentSkipped = userAnsForCurrent === undefined;

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumb */}
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
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
            <span>{course?.name || "Xác suất thống kê"}</span>
            <span>•</span>
            <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
              {exercise?.title || "Bài tập 1"}
            </span>
          </div>
        </div>

        <button
          onClick={onRetryQuiz}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm lại bài</span>
        </button>
      </div>

      {/* 2. Main Grid: Left Scorecard & Right Review matching Figma frame 293:16649 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Scorecard */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-7 rounded-3xl border transition-all text-center space-y-6 ${
            theme === 'dark'
              ? 'bg-[#181824] border-gray-800'
              : 'bg-gradient-to-b from-[#f5f3ff] via-white to-white border-indigo-100 shadow-lg shadow-indigo-500/10'
          }`}>
            <div className="flex items-center justify-end">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-xs">
                <Clock className="w-3 h-3 text-indigo-500" />
                <span>01:30</span>
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-500">
                Bạn đã trả lời đúng
              </h3>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {correctCount}/{totalCount} câu
              </div>
            </div>

            {/* Radial Circular Progress Ring */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#6366f1"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * (finalScore / 10))}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-gray-900 dark:text-white">
                  {finalScore}
                  <span className="text-xs font-medium text-gray-400">/10</span>
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  Điểm
                </span>
              </div>
            </div>

            {/* 3 Summary Boxes matching Figma */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
                <div className="text-base font-black text-gray-800 dark:text-gray-100">{skippedCount}</div>
                <div className="text-[10px] font-medium text-gray-400 mt-0.5">Chưa làm</div>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 shadow-xs">
                <div className="text-base font-black text-rose-500">{wrongCount}</div>
                <div className="text-[10px] font-medium text-rose-400 mt-0.5">Sai</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#6366f1] text-white shadow-md shadow-indigo-500/20">
                <div className="text-base font-black">{correctCount}</div>
                <div className="text-[10px] font-medium text-indigo-100 mt-0.5">Đúng</div>
              </div>
            </div>

            {/* Adaptive Remediation CTA */}
            {wrongCount > 0 && (
              <div className="pt-2">
                <button
                  onClick={onStartAdaptiveRemediation}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Kích hoạt Gỡ rối tại chỗ ({wrongCount} câu sai)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Detail: Question Palette & Answer Review matching Figma */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`p-7 rounded-3xl border transition-colors ${
            theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <h3 className={`text-base font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Xem đáp án
            </h3>

            {/* Question Palette with colored indicator dots */}
            <div className="flex flex-wrap gap-2.5 pb-6 border-b border-gray-100 dark:border-gray-800">
              {questions.map((q, idx) => {
                const ans = userAnswers[q.id || idx];
                const isCorrect = ans === (q.correct_index ?? 0);
                const isSkipped = ans === undefined;
                const isSelected = selectedQIndex === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedQIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'ring-2 ring-indigo-500 scale-105 shadow-sm'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    } ${
                      isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200'
                        : isSkipped
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      isCorrect ? 'bg-emerald-500' : isSkipped ? 'bg-amber-400' : 'bg-rose-500'
                    }`}></span>
                  </button>
                );
              })}
            </div>

            {/* Current Question Review */}
            <div className="pt-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                    Câu hỏi {selectedQIndex + 1}:
                  </span>
                  <h4 className={`text-base font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                    {currentQ.question}
                  </h4>
                </div>

                {currentQ.citation && (
                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-gray-800 text-indigo-600 text-[10px] font-mono font-bold">
                    {currentQ.citation}
                  </span>
                )}
              </div>

              {/* Options with correctness styles matching Figma */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options?.map((opt, optIdx) => {
                  const isCorrect = optIdx === (currentQ.correct_index ?? 0);
                  const isUserChosen = userAnsForCurrent === optIdx;

                  let cardStyle = "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300";
                  if (isCorrect) {
                    cardStyle = "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-400 font-bold";
                  } else if (isUserChosen && !isCorrect) {
                    cardStyle = "border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-1 ring-rose-400 line-through";
                  }

                  return (
                    <div
                      key={optIdx}
                      className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between transition-all ${cardStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isCorrect ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-400'
                        }`}>
                          {isCorrect && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span>{opt}</span>
                      </div>

                      {isCorrect && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          Đáp án đúng
                        </span>
                      )}
                      {isUserChosen && !isCorrect && (
                        <span className="text-[11px] font-bold text-rose-500">
                          Bạn đã chọn
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Everyday Explanation */}
              {currentQ.explanation && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-gray-800/60 border border-indigo-100 dark:border-gray-700 mt-4">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Giải thích cặn kẽ & ví dụ đời thường:</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

