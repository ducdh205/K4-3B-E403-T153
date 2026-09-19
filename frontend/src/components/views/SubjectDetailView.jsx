import React from 'react';
import { 
  ArrowLeft, Plus, Star, CheckSquare, FileCode, Clock, 
  ChevronRight, PlayCircle, BookOpen 
} from 'lucide-react';

export default function SubjectDetailView({ 
  theme, 
  course, 
  onBack, 
  onSelectExercise
}) {
  const exercises = course?.exercises && course.exercises.length > 0 ? course.exercises : [
    {
      id: 1,
      title: `Bài đánh giá năng lực thích ứng: ${course?.name || "Tư duy sản phẩm AI"}`,
      time: "Hôm nay",
      progress: 0,
      color: "indigo",
      total_questions: 5,
      status: "PUBLISHED"
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header with Back button */}
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
              {course?.name || "Tư duy sản phẩm AI & Bài học thích ứng"}
            </h2>
            <span className="text-xs text-gray-400 font-medium">Chi tiết môn học & ngân hàng câu hỏi thích ứng</span>
          </div>
        </div>
      </div>

      {/* 2. Main Grid: Left info card & Right exercise list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Info Card matching Figma */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-7 rounded-3xl bg-gradient-to-br from-[#6366f1] to-[#4338ca] text-white shadow-xl shadow-indigo-500/25 space-y-6 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                </div>
                <div>
                  <div className="text-xs text-indigo-100 font-medium">Bộ đề đánh giá</div>
                  <div className="text-lg font-bold">{exercises.length} bộ đề sẵn sàng</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <div className="text-xs text-indigo-100 font-medium">Tài liệu bài giảng</div>
                  <div className="text-lg font-bold">{course?.total_slides ? `${course.total_slides} trang slide` : "1 tài liệu PDF"}</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                  <FileCode className="w-4 h-4 text-indigo-200" />
                </div>
                <div>
                  <div className="text-xs text-indigo-100 font-medium">Mã môn học</div>
                  <div className="text-lg font-mono font-bold tracking-wider">{course?.code || "PROD-K4"}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-indigo-400/30">
              <p className="text-xs text-indigo-100 leading-relaxed font-normal">
                {course?.description || "Hệ thống bài tập tự động đối chiếu với Slide bài giảng, có trích dẫn provenance chuẩn xác và cơ chế gỡ rối thích ứng khi học viên làm sai."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Exercise List matching Figma */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Danh sách bài tập
            </h3>
            <span className="text-xs text-gray-400 font-medium">
              {exercises.length} bộ đề sẵn sàng
            </span>
          </div>

          <div className="space-y-3">
            {exercises.map((ex) => {
              const isPerfect = ex.progress === 100;
              const isLow = ex.progress < 50 && ex.progress > 0;
              const isMedium = ex.progress >= 50 && ex.progress < 100;

              return (
                <div
                  key={ex.id}
                  onClick={() => onSelectExercise(ex)}
                  className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer group hover:shadow-md ${
                    theme === 'dark'
                      ? 'bg-[#181824] border-gray-800 hover:border-indigo-500/50'
                      : isPerfect
                      ? 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-400'
                      : isLow
                      ? 'bg-rose-50/30 border-rose-200/70 hover:border-rose-400'
                      : 'bg-white border-gray-100 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="space-y-1">
                      <h4 className={`text-sm font-bold transition-colors ${
                        theme === 'dark' ? 'text-gray-100 group-hover:text-indigo-400' : 'text-gray-900 group-hover:text-indigo-600'
                      }`}>
                        {ex.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{ex.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-extrabold ${
                        isPerfect ? 'text-emerald-600 dark:text-emerald-400' :
                        isLow ? 'text-rose-500' :
                        isMedium ? 'text-amber-500' : 'text-gray-400'
                      }`}>
                        {ex.progress}%
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  {/* Progress bar matching Figma */}
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPerfect ? 'bg-emerald-500' :
                        isLow ? 'bg-rose-500' :
                        isMedium ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                      style={{ width: `${ex.progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

