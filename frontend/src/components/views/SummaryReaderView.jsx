import React from 'react';
import { ArrowLeft, Clock, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SummaryReaderView({ 
  theme, 
  course, 
  exercise, 
  onBack, 
  onGoToQuiz 
}) {
  return (
    <div className="space-y-6">
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
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3.5 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>01:30</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Ôn tập tóm tắt
          </h2>
          <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
            Nội dung trọng tâm theo tài liệu bài học
          </span>
        </div>
      </div>

      {/* 2. Progress bar matching Figma */}
      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div className="h-full bg-indigo-600 rounded-full w-[36%] transition-all"></div>
      </div>

      {/* 3. Main Text Card matching Figma frame 293:15309 */}
      <div className={`p-8 rounded-3xl border transition-colors ${
        theme === 'dark' ? 'bg-[#181824] border-gray-800 text-gray-200' : 'bg-white border-gray-100 text-gray-800 shadow-sm'
      }`}>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-gray-800/60 border border-indigo-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
              <BookOpen className="w-4 h-4" />
              <span>Nguồn: Microsoft MarkItDown trích xuất từ Slide Bài Giảng Chuẩn</span>
            </div>
            <span className="text-[11px] font-mono text-gray-400">Slide Trang 1 - 10</span>
          </div>

          <div>
            <h3 className="text-base font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              1. Khái niệm cốt lõi & Tư duy sản phẩm lấy người dùng làm trung tâm
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
              <li>Mọi quyết định thiết kế AI đều bắt đầu từ <strong>nỗi đau có thật</strong> của người dùng cụ thể.</li>
              <li>Tránh bẫy "Tìm chỗ nhét AI": Luôn tự kiểm tra xem khi bỏ AI đi, công việc của người dùng có còn tồn tại không.</li>
              <li>Bằng chứng thực tế phải đo đếm được (Khảo sát Chuẩn A $\ge 20$ người hoặc Mining Chuẩn B với con số cụ thể).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              2. Khung việc cần làm (Jobs-to-be-Done - JTBD) & Lát cắt MỘT CÂU
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
              <li>Người dùng không mua "sản phẩm AI", họ "thuê" giải pháp để hoàn thành một tiến trình cuộc sống.</li>
              <li>Lát cắt prototype bắt buộc gồm 4 thành tố: <em>1 người dùng · 1 công việc · 1 quyết định AI · 1 kết quả</em>.</li>
              <li>Chi phí sai sót (Cost of Error) quyết định mức độ tự động: Giáo dục chọn <strong>Augment</strong> (AI đề xuất, người duyệt).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              3. Vòng lặp thích ứng 100% tình huống mới
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
              <li>Chống học vẹt: Khi học viên làm sai, không đưa lại câu hỏi cũ.</li>
              <li>Gỡ rối bằng ví dụ đời thường thuần Việt gần gũi.</li>
              <li>Tạo bài tập ôn tập tình huống mới toanh bám đúng lỗ hổng để đạt độ thuần thục (Mastery).</li>
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-8 mt-8 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onGoToQuiz}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
          >
            <span>Đã đọc xong • Vào làm trắc nghiệm</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

