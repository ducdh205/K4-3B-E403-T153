import React, { useState } from 'react';
import { 
  ArrowLeft, Sparkles, ShieldCheck, Database, Server, 
  ExternalLink, Sun, Moon, UserCheck, BookOpen, FileText, 
  Edit3, CheckCircle2, Lock, Menu, X, ChevronRight, Sliders,
  Layers, FolderCheck, ListFilter, PlusCircle
} from 'lucide-react';
import TeacherStudio from '../TeacherStudio';

export default function TeacherPortalView({ 
  theme, 
  setTheme, 
  systemStatus, 
  fetchStatus, 
  onQuizPublished, 
  onNavigateStudent,
  onNavigateStudentQuiz
}) {
  // 4 Menu tabs:
  // 1: 'upload' -> 1. Tài liệu PDF → Nội dung trích xuất
  // 2: 'notes'  -> 2. Ghi Chú & Chỉ Lệnh Bài Dạy
  // 3: 'quiz'   -> 3. Sinh câu hỏi và Giảng viên kiểm duyệt
  // 4: 'manage' -> 4. Quản lý các bài đánh giá đã duyệt (Thêm, sửa, xóa, hủy quyền làm bài)
  const [activeTab, setActiveTab] = useState('upload');
  
  // Real-time status synced from TeacherStudio
  const [studioState, setStudioState] = useState({
    slidesCount: 0,
    hasFile: false,
    fileName: '',
    constraintApplied: false,
    questionsCount: 0,
    maxQuestions: 10,
    totalQuizzesCount: 0,
    activeQuizzesCount: 0
  });

  // Mobile menu collapse state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const teacherMenuItems = [
    {
      id: 'upload',
      stepNum: 1,
      title: '1. Tài liệu PDF → Nội dung trích xuất',
      shortTitle: 'Tài liệu PDF & Trích xuất',
      desc: 'Nạp file PDF và trích xuất Markdown có cấu trúc',
      icon: FileText,
      badge: studioState.slidesCount > 0 
        ? `${studioState.slidesCount} slides` 
        : studioState.hasFile 
        ? 'Đã nạp file' 
        : 'Chưa nạp',
      badgeColor: studioState.slidesCount > 0 
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
        : studioState.hasFile 
        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
        : 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      isCompleted: studioState.slidesCount > 0
    },
    {
      id: 'notes',
      stepNum: 2,
      title: '2. Ghi Chú & Chỉ Lệnh Bài Dạy',
      shortTitle: 'Ghi chú & Chỉ lệnh bài dạy',
      desc: '3 ô chỉ lệnh: Phạm vi, Trọng tâm, Số câu tối đa',
      icon: Edit3,
      badge: studioState.constraintApplied 
        ? '✓ Đã khóa ranh giới' 
        : '🔒 Điều kiện tiên quyết',
      badgeColor: studioState.constraintApplied 
        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
        : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse',
      isCompleted: studioState.constraintApplied
    },
    {
      id: 'quiz',
      stepNum: 3,
      title: '3. Sinh câu hỏi và Giảng viên kiểm duyệt',
      shortTitle: 'Sinh câu hỏi & Kiểm duyệt',
      desc: 'AI sinh quiz tình huống & duyệt phát hành',
      icon: Sparkles,
      badge: studioState.questionsCount > 0 
        ? `${studioState.questionsCount} câu hỏi` 
        : 'Chờ sinh đề',
      badgeColor: studioState.questionsCount > 0 
        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
        : 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      isCompleted: studioState.questionsCount > 0
    },
    {
      id: 'manage',
      stepNum: 4,
      title: '4. Quản lý các bài đánh giá đã duyệt',
      shortTitle: 'Quản lý bài đã duyệt',
      desc: 'Thêm, sửa, xóa & đóng/mở quyền làm bài SV',
      icon: Layers,
      badge: studioState.totalQuizzesCount > 0 
        ? `${studioState.totalQuizzesCount} đề thi` 
        : '0 đề thi',
      badgeColor: studioState.totalQuizzesCount > 0 
        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
        : 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      isCompleted: studioState.totalQuizzesCount > 0
    }
  ];

  const currentItem = teacherMenuItems.find(m => m.id === activeTab) || teacherMenuItems[0];

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#0f0f18] text-gray-100' : 'bg-[#f8f9fc] text-gray-800'
    }`}>
      {/* ========================================================================= */}
      {/* 1. SIDEBAR CHO GIẢNG VIÊN (4 MENU CHUYÊN BIỆT)                           */}
      {/* ========================================================================= */}
      <aside className={`w-full lg:w-80 shrink-0 lg:min-h-screen p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r transition-colors duration-200 ${
        theme === 'dark' 
          ? 'bg-[#151522] border-purple-900/30 text-gray-200' 
          : 'bg-[#f4f5fa] border-purple-100 text-gray-700 shadow-sm'
      }`}>
        <div>
          {/* Logo & Header branding */}
          <div className="flex items-center justify-between pb-6 mb-4 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-500/25">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-lg font-black tracking-tight ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}>
                    CỔNG GIẢNG VIÊN
                  </span>
                </div>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                  Studio Backend GV · Giai đoạn 1
                </span>
              </div>
            </div>

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Teacher Navigation: 4 Menus */}
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block space-y-2`}>
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
              Quy trình & Quản lý bài đánh giá
            </div>

            <nav className="space-y-2">
              {teacherMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all duration-200 flex flex-col gap-1.5 border ${
                      isActive
                        ? theme === 'dark'
                          ? 'bg-purple-950/40 border-purple-500/60 shadow-md shadow-purple-950/50'
                          : 'bg-purple-50 border-purple-300 shadow-sm'
                        : theme === 'dark'
                        ? 'bg-transparent border-transparent hover:bg-white/5 text-slate-300 hover:text-white'
                        : 'bg-transparent border-transparent hover:bg-white/80 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isActive
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                            : item.isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : theme === 'dark'
                            ? 'bg-gray-800 text-slate-400'
                            : 'bg-gray-200 text-slate-600'
                        }`}>
                          {item.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <span className={`text-xs font-black tracking-tight leading-snug ${
                          isActive
                            ? theme === 'dark' ? 'text-white' : 'text-purple-900'
                            : theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                        }`}>
                          {item.title}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pl-10.5 pr-1">
                      <span className="text-[10px] text-slate-400 line-clamp-1">
                        {item.desc}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border shrink-0 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block pt-4 mt-6 border-t border-purple-500/20 space-y-3`}>
          {/* Back to student UI button */}
          <button
            onClick={onNavigateStudent}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
            title="Quay lại giao diện dành cho Học viên ôn tập"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Giao diện Học viên</span>
          </button>

          {/* Theme Switcher Pill */}
          <div className={`p-1 rounded-full flex items-center gap-1 ${
            theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-gray-200/80'
          }`}>
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-full text-xs font-semibold transition-all ${
                theme === 'light'
                  ? 'bg-white text-purple-700 shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Sáng</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-full text-xs font-semibold transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 text-purple-300 shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Tối</span>
            </button>
          </div>

          {/* Backend Status info */}
          <div className="flex items-center justify-between px-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>FastAPI Backend 8000</span>
            </span>
            <span className="font-mono">MySQL 3306</span>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. KHÔNG GIAN LÀM VIỆC CHÍNH (RIGHT MAIN CONTENT)                        */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
          theme === 'dark' 
            ? 'bg-[#151522]/95 border-purple-900/30' 
            : 'bg-white/95 border-purple-100 shadow-xs'
        }`}>
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            
            {/* Breadcrumb current active menu */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <span className="text-slate-400">Cổng Giảng Viên</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="text-purple-600 dark:text-purple-400 font-extrabold truncate">
                {currentItem.title}
              </span>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-3">
              {/* Nút Làm bài thi Học viên (mở trực tiếp bộ đề vừa duyệt) */}
              {onNavigateStudentQuiz && (
                <button
                  onClick={onNavigateStudentQuiz}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm shadow-indigo-500/25 transition hover:scale-[1.02]"
                  title="Chuyển ngay sang bài làm trắc nghiệm của sinh viên"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Làm bài thi SV</span>
                </button>
              )}

              {/* Back to student UI (Top shortcut) */}
              <button
                onClick={onNavigateStudent}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-300 dark:border-purple-800/60 hover:bg-purple-500/10 text-xs font-semibold text-purple-700 dark:text-purple-300 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Về Học viên</span>
              </button>

              {/* Theme Toggle in Header */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-xl border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white' 
                    : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'
                }`}
                title="Đổi giao diện Sáng / Tối"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </header>

        {/* Main Content: TeacherStudio loaded with activeTab */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <TeacherStudio
            systemStatus={systemStatus}
            refreshStatus={fetchStatus}
            onQuizPublished={onQuizPublished}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onStudioStateChange={setStudioState}
            onNavigateStudent={onNavigateStudent}
            onNavigateStudentQuiz={onNavigateStudentQuiz}
          />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-xs text-gray-500">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span>Hệ thống UTTQ Adaptive Loop AI</span>
            <span>•</span>
            <span>Cổng Giảng Viên & Backend GV</span>
            <span>•</span>
            <span>4 Menu Quản Lý Toàn Diện</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
