import React from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Layers, Sparkles } from 'lucide-react';

export default function MethodSelectView({ 
  theme, 
  course, 
  exercise, 
  onBack, 
  onSelectMethod 
}) {
  return (
    <div className="space-y-8">
      {/* 1. Header with Breadcrumbs */}
      <div>
        <div className="flex items-center gap-3 mb-2">
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

        <h2 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Lựa chọn phương pháp
        </h2>
        <p className="text-xs text-gray-400 font-medium mt-1">
          Chọn hình thức ôn tập phù hợp với mục tiêu học của bạn hôm nay
        </p>
      </div>

      {/* 2. 3 Method Cards matching Figma */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Method 1: Tóm tắt */}
        <div className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
          theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <div>
            <div className="text-center mb-6">
              <h3 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Tóm tắt
              </h3>
              <p className="text-xs text-gray-400">
                Xem nội dung trọng tâm và ghi chú rút gọn
              </p>
            </div>

            {/* Illustration Card */}
            <div className="h-48 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 p-5 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden border border-indigo-100/50 dark:border-gray-700">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20">
                📑
              </div>
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 max-w-[200px]">
                Trích xuất từ slide tài liệu chính xác 100%
              </div>
            </div>
          </div>

          <div className="pt-6 text-center">
            <button
              onClick={() => onSelectMethod('summary')}
              className="w-full py-3 rounded-full bg-white dark:bg-gray-800 border-2 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              Bắt đầu
            </button>
          </div>
        </div>

        {/* Method 2: Trắc nghiệm (Primary Featured Card) */}
        <div className="rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white relative overflow-hidden">
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase">
            Khuyên dùng
          </div>

          <div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold mb-1">
                Trắc nghiệm
              </h3>
              <p className="text-xs text-indigo-100">
                Chọn một trong 4 đáp án đúng nhất
              </p>
            </div>

            {/* Illustration */}
            <div className="h-48 rounded-2xl bg-white/10 backdrop-blur-md p-5 flex flex-col items-center justify-center text-center space-y-3 border border-white/20">
              <div className="w-14 h-14 rounded-2xl bg-white text-indigo-600 flex items-center justify-center text-2xl shadow-lg">
                🎯
              </div>
              <div className="text-xs font-medium text-indigo-100 max-w-[200px]">
                Kiểm tra kiến thức tức thì kèm trích dẫn provenance Slide Trang X
              </div>
            </div>
          </div>

          <div className="pt-6 text-center">
            <button
              onClick={() => onSelectMethod('quiz')}
              className="w-full py-3 rounded-full bg-white text-indigo-600 font-extrabold text-xs hover:bg-indigo-50 transition-colors shadow-lg hover:scale-105"
            >
              Thử thách
            </button>
          </div>
        </div>

        {/* Method 3: Flashcard */}
        <div className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
          theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <div>
            <div className="text-center mb-6">
              <h3 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Flashcard
              </h3>
              <p className="text-xs text-gray-400">
                Quẹt trái khi sai, quẹt phải khi đúng
              </p>
            </div>

            {/* Illustration */}
            <div className="h-48 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-5 flex flex-col items-center justify-center text-center space-y-3 border border-sky-100/50 dark:border-gray-700">
              <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-sky-500/20">
                🃏
              </div>
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 max-w-[200px]">
                Luyện trí nhớ dài hạn qua cơ chế lặp lại ngắt quãng
              </div>
            </div>
          </div>

          <div className="pt-6 text-center">
            <button
              onClick={() => onSelectMethod('flashcard')}
              className="w-full py-3 rounded-full bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition-colors shadow-md shadow-sky-500/20"
            >
              Luyện tập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

