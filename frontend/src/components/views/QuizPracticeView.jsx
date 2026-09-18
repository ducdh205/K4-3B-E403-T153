import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Clock, ChevronLeft, ChevronRight, CheckCircle, 
  Send, Sparkles, BookOpen, AlertCircle 
} from 'lucide-react';
import SoundEffects from '../SoundEffects';

export default function QuizPracticeView({ 
  theme, 
  course, 
  exercise, 
  questions = [], 
  onBack, 
  onSubmitQuiz 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [qId]: optionIndex }
  const [timeLeft, setTimeLeft] = useState(90); // 90 seconds = 1:30

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Xử lý trường hợp chưa có câu hỏi nào được phát hành
  if (!questions || questions.length === 0) {
    return (
      <div className={`p-8 md:p-12 rounded-3xl border text-center max-w-xl mx-auto my-8 ${
        theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-5">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Chưa Có Đề Thi Nào Được Phát Hành
        </h3>
        <p className={`text-sm mb-6 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Bộ câu hỏi cần được Giảng viên kiểm duyệt và bấm <strong>"Duyệt & Phát Hành"</strong> từ Cổng Giảng Viên trước khi Học viên có thể vào làm bài.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onBack}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition ${
              theme === 'dark'
                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Quay lại bài học
          </button>
          <button
            onClick={() => {
              window.location.href = '/gv';
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Vào Cổng Giảng Viên
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const totalQuestions = questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleSelectOption = (idx) => {
    SoundEffects.playClick();
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id || currentIndex]: idx
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    SoundEffects.playCorrect();
    onSubmitQuiz({
      answers: selectedAnswers,
      timeSpent: 90 - timeLeft
    });
  };

  const selectedIdx = selectedAnswers[currentQ.id || currentIndex];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header with Breadcrumb and Timer matching Figma */}
      <div>
        <div className="flex items-center justify-between mb-2">
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

          {/* Timer matching Figma */}
          <div className={`flex items-center gap-2 text-xs font-bold px-4 py-1.5 rounded-full ${
            timeLeft < 20
              ? 'bg-red-100 text-red-600 animate-bounce'
              : 'bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Ôn tập trắc nghiệm
          </h2>
          <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
            {progressPercent}% Hoàn thành
          </span>
        </div>
      </div>

      {/* 2. Progress Bar */}
      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div 
          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* 3. Question Box with Dashed Border matching Figma frame 293:15943 */}
      <div className={`p-8 rounded-3xl border-2 border-dashed transition-all relative text-center ${
        theme === 'dark'
          ? 'bg-[#181824] border-indigo-500/40 text-gray-100'
          : 'bg-indigo-50/20 border-indigo-300/80 text-gray-900 shadow-sm'
      }`}>
        {/* Provenance Badge */}
        {currentQ.citation && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold mb-4">
            <BookOpen className="w-3 h-3" />
            <span>{currentQ.citation}</span>
          </div>
        )}

        <h3 className="text-base md:text-lg font-bold max-w-2xl mx-auto leading-relaxed">
          {currentQ.question}
        </h3>
      </div>

      {/* Question Counter (Red text matching Figma) */}
      <div className="text-right">
        <span className="text-sm font-extrabold text-rose-500">
          {currentIndex + 1}/{totalQuestions}
        </span>
      </div>

      {/* 4. Options List matching Figma (Radio style) */}
      <div className="space-y-3.5">
        {currentQ.options?.map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all duration-150 ${
                isSelected
                  ? 'border-indigo-600 bg-[#ede9fe]/40 dark:bg-indigo-950/40 ring-1 ring-indigo-500 shadow-sm'
                  : theme === 'dark'
                  ? 'border-gray-800 bg-[#181824] hover:border-gray-700 text-gray-300'
                  : 'border-gray-200 bg-white hover:border-indigo-200 text-gray-700 shadow-xs'
              }`}
            >
              {/* Custom Radio Icon matching Figma */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                isSelected
                  ? 'border-2 border-indigo-600 bg-white dark:bg-gray-900'
                  : 'border-2 border-gray-300 dark:border-gray-600'
              }`}>
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                )}
              </div>

              <span className={`text-sm font-semibold leading-snug ${
                isSelected ? 'text-indigo-900 dark:text-indigo-200 font-bold' : ''
              }`}>
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {/* 5. Bottom Navigation Controls matching Figma */}
      <div className="pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400'
                : 'bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 hover:scale-105 shadow-sm'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === totalQuestions - 1}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              currentIndex === totalQuestions - 1
                ? 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400'
                : 'bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 hover:scale-105 shadow-sm'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Submit Quiz button matching Figma */}
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2.5 px-7 py-3 rounded-2xl bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
        >
          <span>Nộp bài</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

