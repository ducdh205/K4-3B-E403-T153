import React from 'react';
import { 
  Sparkles, CheckCircle2, ArrowRight, BookOpen, Clock, 
  Award, TrendingUp, Layers, HelpCircle, Phone, Mail, ChevronRight 
} from 'lucide-react';

export default function LandingPageView({ onEnterDashboard, onOpenQuizDirectly, onEnterTeacherPortal }) {
  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 font-sans">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#4338ca] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/25">
              U
            </div>
            <span className="text-2xl font-black text-[#1e1b4b] tracking-tight">UTTQ</span>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#giai-phap" className="hover:text-indigo-600 transition-colors">Giải pháp</a>
            <a href="#tinh-nang" className="hover:text-indigo-600 transition-colors">Tính năng</a>
            <a href="#so-lieu" className="hover:text-indigo-600 transition-colors">Số liệu</a>
            <a href="#ve-chung-toi" className="hover:text-indigo-600 transition-colors">Về chúng tôi</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onEnterTeacherPortal}
              className="px-4 py-2 rounded-full text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all hover:scale-[1.02] shadow-sm flex items-center gap-1.5"
              title="Truy cập Cổng Giảng viên & Backend GV"
            >
              <span>🎓 Cổng Giảng Viên (Backend GV)</span>
            </button>
            <button 
              onClick={onEnterDashboard}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              Đăng ký
            </button>
            <button 
              onClick={onEnterDashboard}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#6366f1] hover:bg-[#4f46e5] shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 bg-gradient-to-b from-indigo-50/50 via-white to-[#fafbfc]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Nền tảng ôn tập trắc nghiệm bằng AI</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15] mb-6">
            Học tập thông minh và <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              hiệu quả hơn
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base md:text-lg text-gray-600 font-medium mb-10 leading-relaxed">
            Học hỏi kiến thức mới thông qua những bộ câu hỏi đa dạng. Theo dõi tiến trình và cải thiện kỹ năng của bạn sau mỗi lần làm quiz.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button 
              onClick={onEnterDashboard}
              className="px-8 py-4 rounded-2xl bg-[#6366f1] hover:bg-[#4f46e5] text-white text-base font-bold shadow-xl shadow-indigo-500/25 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Vào học ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={onEnterDashboard}
              className="px-8 py-4 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 text-base font-bold border border-gray-200 shadow-sm transition-all"
            >
              Xem danh sách môn học
            </button>
          </div>

          {/* Mockup Preview Card */}
          <div className="relative mx-auto max-w-4xl p-4 bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl shadow-2xl shadow-indigo-500/10">
            <div className="bg-gradient-to-br from-indigo-600/5 via-violet-500/5 to-transparent p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  Sẵn sàng ôn thi
                </span>
                <h3 className="text-xl font-bold text-gray-900">
                  Môn học tiêu biểu: Xác suất thống kê & Tư duy sản phẩm
                </h3>
                <p className="text-xs text-gray-500 max-w-md">
                  Tự động chuyển đổi tài liệu bài giảng sang bộ câu hỏi trắc nghiệm có trích dẫn nguồn gốc chuẩn xác.
                </p>
              </div>
              <button 
                onClick={onEnterDashboard}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 whitespace-nowrap shadow-md"
              >
                Mở kho bài tập →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Ecosystem Section */}
      <section id="giai-phap" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 block mb-3">
            HỆ SINH THÁI SẢN PHẨM
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight max-w-2xl mx-auto mb-4">
            Toàn bộ quá trình ôn tập của bạn gói gọn trong một nền tảng.
          </h2>
          <p className="text-sm md:text-base text-gray-500 max-w-3xl mx-auto leading-relaxed mb-16">
            Hệ thống ôn tập thông minh giúp bạn quản lý môn học, theo dõi tiến độ và học hiệu quả hơn với nhiều phương pháp như tóm tắt, trắc nghiệm và flashcard. Tất cả đều được cá nhân hóa theo hành trình học của bạn.
          </p>

          {/* Two-column Feature Presentation */}
          <div id="tinh-nang" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left">
            {/* Left side: Student highlights */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold">
                <span>🏛️ Sinh viên</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-snug">
                Quản lý việc học và ôn tập hiệu quả trên một nền tảng duy nhất.
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Hệ thống hiển thị tiến độ học theo từng môn, từng bài ôn và lịch sử học gần đây — giúp bạn biết mình đang ở đâu và cần cải thiện gì.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Dashboard học tập real-time cho toàn bộ môn học",
                  "Tự động theo dõi tiến độ, kết quả và lịch sử ôn tập",
                  "Phát hiện sớm điểm yếu và nội dung cần cải thiện",
                  "Trải nghiệm học tập cá nhân hóa theo từng người dùng"
                ].map((text, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                    <span className="text-sm font-semibold text-gray-700">{text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button 
                  onClick={onEnterDashboard}
                  className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 inline-flex items-center gap-2"
                >
                  <span>Tìm hiểu thêm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right side: 3 cards matching Figma */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 mb-1">Theo dõi tiến độ</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Nắm rõ toàn bộ hành trình học tập của bạn trong một màn hình, không cần tự ghi nhớ.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 mb-1">Học tập thông minh</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Dữ liệu được lưu tự động giúp bạn quay lại bài đang học, tiếp tục đúng vị trí và tối ưu thời gian ôn tập.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900 mb-1">Cá nhân hóa trải nghiệm</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Hệ thống ghi nhớ thói quen học tập và ưu tiên hiển thị nội dung phù hợp năng lực.
                    </p>
                  </div>
                </div>
              </div>

              {/* Purple quote card */}
              <div className="p-5 rounded-2xl bg-[#6366f1] text-white shadow-lg shadow-indigo-500/20">
                <p className="text-xs font-semibold leading-relaxed">
                  "Hệ thống giúp tôi học có định hướng hơn và không bỏ sót kiến thức quan trọng."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Statistics Section */}
      <section id="so-lieu" className="py-16 bg-[#f8f9fe] border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-black text-indigo-600 mb-2">100%</div>
              <div className="text-sm font-bold text-gray-900 mb-1">Theo dõi tiến độ học tập</div>
              <div className="text-xs text-gray-400">Tiến độ học tập real-time</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-black text-indigo-600 mb-2">1,000+</div>
              <div className="text-sm font-bold text-gray-900 mb-1">Lượt học tập</div>
              <div className="text-xs text-gray-400">Trên nhiều môn học</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-black text-indigo-600 mb-2">24/7</div>
              <div className="text-sm font-bold text-gray-900 mb-1">Học mọi lúc</div>
              <div className="text-xs text-gray-400">Không giới hạn thời gian</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-black text-indigo-600 mb-2">3+</div>
              <div className="text-sm font-bold text-gray-900 mb-1">Phương pháp học</div>
              <div className="text-xs text-gray-400">Trong một nền tảng</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. About Us & Footer Section */}
      <footer id="ve-chung-toi" className="py-20 bg-gradient-to-br from-[#4f46e5] to-[#4338ca] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-200 block">
                VỀ CHÚNG TÔI
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Giải pháp hỗ trợ sinh viên học tập và ôn tập hiệu quả.
              </h2>
              <p className="text-sm text-indigo-100 leading-relaxed max-w-xl">
                Mang đến một công cụ học tập đơn giản, trực quan nhưng hiệu quả — giúp sinh viên học nhanh hơn, nhớ lâu hơn và chủ động hơn trong việc học.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Tối ưu hóa trải nghiệm ôn tập cho sinh viên",
                  "Kết hợp nhiều phương pháp học hiệu quả (tóm tắt, quiz, flashcard)",
                  "Cá nhân hóa lộ trình học tập theo từng người dùng",
                  "Hỗ trợ học mọi lúc, mọi nơi trên một nền tảng duy nhất"
                ].map((txt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span className="text-xs md:text-sm font-medium text-indigo-50">{txt}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-indigo-400/30 flex flex-wrap gap-8 text-xs text-indigo-200">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-300" />
                  <span>1234 1234 (Miễn phí, 8:00 – 17:30)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-300" />
                  <span>abg@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Illustration graphic */}
            <div className="md:col-span-5 flex justify-center">
              <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-center space-y-4 max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-white text-indigo-600 mx-auto flex items-center justify-center font-black text-2xl shadow-xl">
                  🚀
                </div>
                <h4 className="text-xl font-bold">Khám phá UTTQ ngay</h4>
                <p className="text-xs text-indigo-100">
                  Tận hưởng môi trường ôn tập được tối ưu hoá theo chuẩn đề cương thực tế.
                </p>
                <button
                  onClick={onEnterDashboard}
                  className="w-full py-3 rounded-xl bg-white text-indigo-700 font-bold text-xs hover:bg-indigo-50 transition-colors shadow-lg"
                >
                  Bắt đầu học miễn phí
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

