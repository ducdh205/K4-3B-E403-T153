import React, { useState, useEffect } from 'react';
import { Flame, Star, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { SoundEffects } from './SoundEffects';

const OPTION_STYLES = [
  {
    bg: 'bg-quiz-red hover:bg-quiz-redHover',
    border: 'border-b-[#9e1028]',
    symbol: '▲',
    label: 'A'
  },
  {
    bg: 'bg-quiz-blue hover:bg-quiz-blueHover',
    border: 'border-b-[#0d4f9e]',
    symbol: '◆',
    label: 'B'
  },
  {
    bg: 'bg-quiz-yellow hover:bg-quiz-yellowHover',
    border: 'border-b-[#9c7200]',
    symbol: '●',
    label: 'C'
  },
  {
    bg: 'bg-quiz-green hover:bg-quiz-greenHover',
    border: 'border-b-[#195e08]',
    symbol: '■',
    label: 'D'
  }
];

export default function QuizPlayer({ questions, playerProfile, onSubmitQuiz }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const currentQ = questions[currentIndex];
  const total = questions.length;

  // Countdown timer bar
  useEffect(() => {
    setTimeLeft(30);
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  // Keyboard shortcut listener (1,2,3,4 or a,b,c,d)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['1', 'a'].includes(key)) handleSelectOption(0);
      else if (['2', 'b'].includes(key)) handleSelectOption(1);
      else if (['3', 'c'].includes(key)) handleSelectOption(2);
      else if (['4', 'd'].includes(key)) handleSelectOption(3);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, answers]);

  const handleSelectOption = (optIndex) => {
    SoundEffects.click();
    const nextAnswers = { ...answers, [currentQ.id]: optIndex };
    setAnswers(nextAnswers);
    setScore((prev) => prev + 100);
    setStreak((prev) => prev + 1);

    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finished all questions -> Submit
      onSubmitQuiz(nextAnswers);
    }
  };

  const handleNext = () => {
    SoundEffects.click();
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onSubmitQuiz(answers);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      SoundEffects.click();
      setCurrentIndex(currentIndex - 1);
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-between py-4 space-y-6">
      
      {/* Top HUD Header (Quiz.com layout) */}
      <div className="bg-quiz-panel border-2 border-quiz-border rounded-3xl p-4 shadow-xl space-y-3">
        
        {/* Top Info Bar */}
        <div className="flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <span className="text-xl sm:text-2xl">{playerProfile?.avatar?.emoji || "🎮"}</span>
            <div>
              <span className="text-xs font-black text-white">{playerProfile?.name || "Học viên"}</span>
              <div className="text-[10px] text-purple-300 font-mono">
                {currentQ.provenance}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-5">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-quiz-dark border border-quiz-border text-xs font-bold text-amber-300">
              <Flame className="w-4 h-4 text-orange-400 fill-current animate-pulse" />
              <span>{streak} Chuỗi</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-quiz-dark border border-quiz-border text-xs font-bold text-yellow-300">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{score} Điểm</span>
            </div>

            <div className="px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-black">
              Câu {currentIndex + 1} / {total}
            </div>
          </div>

        </div>

        {/* Animated Timer Progress Bar */}
        <div className="w-full bg-quiz-dark h-2.5 rounded-full overflow-hidden border border-quiz-border">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

      </div>

      {/* Center Question Card */}
      <div className="bg-gradient-to-b from-quiz-panel to-quiz-dark border-2 border-quiz-border rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden flex-1 flex flex-col justify-center">
        <div className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider mb-2">
          {currentQ.core_concept}
        </div>
        <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white font-display leading-relaxed max-w-3xl mx-auto">
          {currentQ.question}
        </h2>
      </div>

      {/* 4 Large Quiz.com Option Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {currentQ.options.map((optionText, optIdx) => {
          const style = OPTION_STYLES[optIdx];
          const isSelected = (answers[currentQ.id] === optIdx);

          return (
            <button
              key={optIdx}
              onClick={() => handleSelectOption(optIdx)}
              className={`quiz-opt-card text-left p-4 sm:p-6 rounded-2xl ${style.bg} ${style.border} text-white shadow-xl flex items-start space-x-4 cursor-pointer relative ${
                isSelected ? 'ring-4 ring-white' : ''
              }`}
            >
              {/* Geometric Symbol Badge */}
              <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center font-black text-lg shrink-0 shadow-inner">
                {style.symbol}
              </div>

              {/* Text */}
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
                  Phương án {style.label} (Phím {optIdx + 1})
                </span>
                <p className="text-sm sm:text-base font-bold text-white mt-0.5 leading-snug">
                  {optionText}
                </p>
              </div>

              {isSelected && (
                <CheckCircle2 className="w-5 h-5 text-white fill-current shrink-0 self-center" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Nav Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded-xl bg-quiz-panel hover:bg-quiz-card border border-quiz-border text-xs font-bold text-slate-300 disabled:opacity-30 transition flex items-center space-x-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Câu trước</span>
        </button>

        <button
          onClick={handleNext}
          className="btn-quiz-3d px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-black flex items-center space-x-1 shadow-lg"
        >
          <span>{currentIndex === total - 1 ? 'Nộp bài 🎯' : 'Câu tiếp theo'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}

