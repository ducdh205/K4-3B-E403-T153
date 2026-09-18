import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import LandingPageView from './components/views/LandingPageView';
import CourseListView from './components/views/CourseListView';
import SubjectDetailView from './components/views/SubjectDetailView';
import MethodSelectView from './components/views/MethodSelectView';
import SummaryReaderView from './components/views/SummaryReaderView';
import QuizPracticeView from './components/views/QuizPracticeView';
import FlashcardView from './components/views/FlashcardView';
import ScorecardReviewView from './components/views/ScorecardReviewView';
import AnalyticsStatsView from './components/views/AnalyticsStatsView';
import AdaptiveRemediation from './components/AdaptiveRemediation';
import TeacherStudio from './components/TeacherStudio';
import AddSubjectModal from './components/modals/AddSubjectModal';
import AddExerciseModal from './components/modals/AddExerciseModal';
import SoundEffects from './components/SoundEffects';
import { User, Settings, ShieldCheck, HelpCircle } from 'lucide-react';

export default function App() {
  // Page mode: 'landing' or 'dashboard' or 'teacher_studio'
  const [page, setPage] = useState('landing');
  
  // Dashboard sidebar tab: 'stats' | 'review' | 'account' | 'settings'
  const [currentTab, setCurrentTab] = useState('review');
  
  // Review subviews: 'courses' | 'subject_detail' | 'method_select' | 'summary' | 'quiz' | 'flashcard' | 'scorecard' | 'adaptive'
  const [reviewView, setReviewView] = useState('courses');

  // Theme: 'light' | 'dark'
  const [theme, setTheme] = useState('light');
  
  // Search query in topbar
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);

  // Active course & exercise
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Quiz questions & results
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);

  // Initial mock courses list matching Figma
  const [courses, setCourses] = useState([
    {
      id: 1,
      name: "Xác suất thống kê",
      code: "MTA02",
      docsCount: 3,
      description: "Kiến thức nâng cao về xác suất, biến ngẫu nhiên và suy diễn thống kê ứng dụng.",
      exercises: [
        { id: 1, title: "Bài tập 1: Khái niệm biến cố & Không gian mẫu", time: "Hôm qua", progress: 100, color: "emerald" },
        { id: 2, title: "Bài tập 2: Công thức cộng và nhân xác suất", time: "Hôm nay", progress: 36, color: "rose" },
        { id: 3, title: "Bài tập 3: Biến ngẫu nhiên rời rạc & kỳ vọng", time: "21/2/2025", progress: 50, color: "amber" },
        { id: 4, title: "Bài tập 4: Phân phối chuẩn Gauss và ứng dụng", time: "21/2/2025", progress: 70, color: "indigo" },
        { id: 5, title: "Bài tập 5: Ước lượng tham số & kiểm định giả thuyết", time: "21/2/2025", progress: 0, color: "gray" },
      ]
    },
    {
      id: 2,
      name: "Tư duy sản phẩm & Khởi nghiệp",
      code: "PROD101",
      docsCount: 4,
      description: "Khung JTBD, lát cắt MỘT CÂU, đo đếm bằng chứng A/B và thiết kế sản phẩm AI có kiểm soát.",
      exercises: [
        { id: 1, title: "Bài tập 1: Tư duy sản phẩm lấy người dùng làm trung tâm", time: "Hôm qua", progress: 100, color: "emerald" },
        { id: 2, title: "Bài tập 2: Khung JTBD & 5 Tiêu chí nghiệm thu", time: "Hôm nay", progress: 60, color: "indigo" },
        { id: 3, title: "Bài tập 3: 4 Lớp chỗ khó & Kịch bản rủi ro", time: "20/2/2025", progress: 20, color: "rose" },
      ]
    },
    {
      id: 3,
      name: "Toán rời rạc",
      code: "MTH202",
      docsCount: 2,
      description: "Lý thuyết đồ thị, đại số Boole, quy nạp toán học và giải thuật tổ hợp.",
      exercises: [
        { id: 1, title: "Bài tập 1: Đồ thị Euler và đồ thị Hamilton", time: "18/2/2025", progress: 80, color: "emerald" },
      ]
    },
    {
      id: 4,
      name: "Triết học Mác - Lênin",
      code: "PHI101",
      docsCount: 3,
      description: "Chủ nghĩa duy vật biện chứng và phép biện chứng duy vật.",
      exercises: [
        { id: 1, title: "Bài tập 1: Vấn đề cơ bản của triết học", time: "15/2/2025", progress: 100, color: "emerald" },
      ]
    }
  ]);

  const [recentCourses, setRecentCourses] = useState([
    courses[0],
    courses[1]
  ]);

  // Fetch current quiz from backend API if available
  const fetchBackendQuiz = async () => {
    try {
      const res = await fetch('/api/student/current-quiz');
      if (res.ok) {
        const data = await res.json();
        if (data && data.questions && data.questions.length > 0) {
          setQuizQuestions(data.questions);
        }
      }
    } catch (e) {
      console.warn("Backend quiz not reachable, using built-in questions", e);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/system/status');
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (e) {
      console.warn("Status check skipped", e);
    }
  };

  useEffect(() => {
    fetchBackendQuiz();
    fetchStatus();
  }, []);

  // When course selected
  const handleSelectCourse = (course) => {
    SoundEffects.click();
    setSelectedCourse(course);
    setReviewView('subject_detail');
  };

  // When exercise selected
  const handleSelectExercise = (exercise) => {
    SoundEffects.click();
    setSelectedExercise(exercise);
    setReviewView('method_select');
  };

  // When study method selected
  const handleSelectMethod = (method) => {
    SoundEffects.click();
    if (method === 'summary') {
      setReviewView('summary');
    } else if (method === 'quiz') {
      setReviewView('quiz');
    } else if (method === 'flashcard') {
      setReviewView('flashcard');
    }
  };

  // Submit quiz handler
  const handleSubmitQuiz = async (quizSubmission) => {
    const questionsToScore = quizQuestions.length > 0 ? quizQuestions : [
      { id: "Q01", correct_index: 0 },
      { id: "Q02", correct_index: 1 },
      { id: "Q03", correct_index: 2 },
      { id: "Q04", correct_index: 0 },
      { id: "Q05", correct_index: 3 },
    ];

    let correct = 0;
    let wrong = 0;
    let wrongQuestions = [];

    questionsToScore.forEach((q, idx) => {
      const ans = quizSubmission.answers[q.id || idx];
      if (ans === (q.correct_index ?? 0)) {
        correct++;
      } else {
        wrong++;
        wrongQuestions.push(q);
      }
    });

    const score = Number(((correct / questionsToScore.length) * 10).toFixed(1));

    const result = {
      score,
      correctCount: correct,
      wrongCount: wrong,
      answers: quizSubmission.answers,
      timeSpent: quizSubmission.timeSpent,
      wrongQuestions
    };

    setQuizResult(result);
    setReviewView('scorecard');

    // Also submit to backend if alive
    try {
      await fetch('/api/student/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: "Hiền Trang",
          answers: quizSubmission.answers
        })
      });
    } catch (e) {
      console.log("Local submit fallback");
    }
  };

  // Add course modal handler
  const handleAddCourse = (newCourse) => {
    setCourses(prev => [newCourse, ...prev]);
    SoundEffects.correct();
  };

  // Add exercise modal handler
  const handleAddExercise = (newExercise) => {
    if (!selectedCourse) return;
    const updated = {
      ...selectedCourse,
      exercises: [newExercise, ...(selectedCourse.exercises || [])]
    };
    setSelectedCourse(updated);
    setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
    SoundEffects.correct();
  };

  // Delete course handler
  const handleDeleteCourse = (courseId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa môn học này khỏi danh sách?")) {
      setCourses(prev => prev.filter(c => c.id !== courseId));
      setRecentCourses(prev => prev.filter(c => c.id !== courseId));
      SoundEffects.click();
    }
  };

  return (
    <div className={theme === 'dark' ? 'dark bg-[#12121c] text-gray-100 min-h-screen' : 'bg-[#fafbfc] text-gray-800 min-h-screen'}>
      {/* 1. Landing Page View matching Figma */}
      {page === 'landing' && (
        <LandingPageView
          onEnterDashboard={() => {
            SoundEffects.click();
            setPage('dashboard');
            setCurrentTab('review');
            setReviewView('courses');
          }}
          onOpenQuizDirectly={() => {
            SoundEffects.click();
            setPage('dashboard');
            setCurrentTab('review');
            setSelectedCourse(courses[0]);
            setSelectedExercise(courses[0].exercises[0]);
            setReviewView('quiz');
          }}
        />
      )}

      {/* 2. Teacher Studio View (Optional access) */}
      {page === 'teacher_studio' && (
        <div className="p-6 max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <button
              onClick={() => setPage('dashboard')}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs"
            >
              ← Về Cổng Học Viên UTTQ
            </button>
            <span className="text-xs font-bold text-indigo-600 uppercase">
              Chế độ Giảng viên (Human-in-the-loop Review Studio)
            </span>
          </div>
          <TeacherStudio
            systemStatus={systemStatus}
            refreshStatus={fetchStatus}
            onQuizPublished={() => {
              fetchBackendQuiz();
              alert("Đã duyệt phát hành bài Quiz!");
            }}
          />
        </div>
      )}

      {/* 3. Student Dashboard (Figma Desktop 1440px Portal) */}
      {page === 'dashboard' && (
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={(tab) => {
              SoundEffects.click();
              setCurrentTab(tab);
              if (tab === 'review') {
                setReviewView('courses');
              }
            }}
            theme={theme}
            setTheme={setTheme}
            onNavigateHome={() => setPage('landing')}
          />

          {/* Main Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Topbar */}
            <Topbar
              theme={theme}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onNotificationClick={() => alert("Bạn có 2 bài tập cần hoàn thành trong tuần này!")}
            />

            {/* View Content */}
            <main className="flex-1 p-8 max-w-6xl w-full mx-auto">
              {/* Tab 1: Thống kê */}
              {currentTab === 'stats' && (
                <AnalyticsStatsView theme={theme} />
              )}

              {/* Tab 2: Ôn tập (Course flows) */}
              {currentTab === 'review' && (
                <>
                  {reviewView === 'courses' && (
                    <CourseListView
                      theme={theme}
                      courses={courses.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                      recentCourses={recentCourses}
                      onSelectCourse={handleSelectCourse}
                      onAddCourseModal={() => setIsAddSubjectOpen(true)}
                      onDeleteCourse={handleDeleteCourse}
                    />
                  )}

                  {reviewView === 'subject_detail' && (
                    <SubjectDetailView
                      theme={theme}
                      course={selectedCourse}
                      onBack={() => setReviewView('courses')}
                      onSelectExercise={handleSelectExercise}
                      onAddExerciseModal={() => setIsAddExerciseOpen(true)}
                    />
                  )}

                  {reviewView === 'method_select' && (
                    <MethodSelectView
                      theme={theme}
                      course={selectedCourse}
                      exercise={selectedExercise}
                      onBack={() => setReviewView('subject_detail')}
                      onSelectMethod={handleSelectMethod}
                    />
                  )}

                  {reviewView === 'summary' && (
                    <SummaryReaderView
                      theme={theme}
                      course={selectedCourse}
                      exercise={selectedExercise}
                      onBack={() => setReviewView('method_select')}
                      onGoToQuiz={() => setReviewView('quiz')}
                    />
                  )}

                  {reviewView === 'quiz' && (
                    <QuizPracticeView
                      theme={theme}
                      course={selectedCourse}
                      exercise={selectedExercise}
                      questions={quizQuestions.length > 0 ? quizQuestions : undefined}
                      onBack={() => setReviewView('method_select')}
                      onSubmitQuiz={handleSubmitQuiz}
                    />
                  )}

                  {reviewView === 'flashcard' && (
                    <FlashcardView
                      theme={theme}
                      course={selectedCourse}
                      exercise={selectedExercise}
                      onBack={() => setReviewView('method_select')}
                      onFinish={() => setReviewView('subject_detail')}
                    />
                  )}

                  {reviewView === 'scorecard' && (
                    <ScorecardReviewView
                      theme={theme}
                      course={selectedCourse}
                      exercise={selectedExercise}
                      quizResult={quizResult}
                      questions={quizQuestions.length > 0 ? quizQuestions : undefined}
                      onBack={() => setReviewView('subject_detail')}
                      onRetryQuiz={() => setReviewView('quiz')}
                      onStartAdaptiveRemediation={() => setReviewView('adaptive')}
                    />
                  )}

                  {reviewView === 'adaptive' && (
                    <AdaptiveRemediation
                      resultData={quizResult}
                      onResetGame={() => setReviewView('subject_detail')}
                    />
                  )}
                </>
              )}

              {/* Tab 3: Tài khoản */}
              {currentTab === 'account' && (
                <div className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-200 to-amber-400 flex items-center justify-center text-3xl shadow-md">
                      👑
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Hiền Trang</h3>
                      <p className="text-xs text-gray-400">Sinh viên • Khóa K4 AI Thực Chiến</p>
                      <span className="inline-block mt-1 text-[11px] font-mono text-indigo-500 font-semibold bg-indigo-50 dark:bg-gray-800 px-2.5 py-0.5 rounded-full">
                        Mã: 2A202602362
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                    <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-gray-800/50">
                      <div className="text-xs text-gray-400">Môn đã hoàn thành</div>
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">4 / 12</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-gray-800/50">
                      <div className="text-xs text-gray-400">Điểm trung bình</div>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">8.8 / 10</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-gray-800/50">
                      <div className="text-xs text-gray-400">Thời gian ôn tập</div>
                      <div className="text-2xl font-black text-amber-500 mt-1">28.5 Giờ</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Cài đặt */}
              {currentTab === 'settings' && (
                <div className={`p-8 rounded-3xl border space-y-6 ${theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <h3 className="text-lg font-bold">Cài đặt hệ thống UTTQ</h3>
                  
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800">
                      <div>
                        <div className="font-bold">Âm thanh hiệu ứng & Chúc mừng</div>
                        <div className="text-gray-400">Web Audio API sound effects khi trả lời đúng / sai / hoàn thành</div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800">
                      <div>
                        <div className="font-bold">Trích dẫn nguồn gốc chi tiết (Provenance)</div>
                        <div className="text-gray-400">Hiển thị badge Slide Trang X • DEMO-NNN bên cạnh câu hỏi</div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800">
                      <div>
                        <div className="font-bold">Cơ chế Gỡ rối thích ứng (Adaptive Remediation)</div>
                        <div className="text-gray-400">Tự động kích hoạt khi có câu trả lời sai (100% tình huống mới)</div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => setPage('teacher_studio')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
                    >
                      Dành cho Giảng viên: Mở Teacher Studio (Quản trị đề) →
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onAddSubject={handleAddCourse}
        theme={theme}
      />

      <AddExerciseModal
        isOpen={isAddExerciseOpen}
        onClose={() => setIsAddExerciseOpen(false)}
        onAddExercise={handleAddExercise}
        theme={theme}
      />
    </div>
  );
}
