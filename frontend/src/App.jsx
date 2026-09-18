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
import TeacherStudio from './components/TeacherStudio';
import TeacherPortalView from './components/views/TeacherPortalView';
import EvalRunnerView from './components/views/EvalRunnerView';
import AddSubjectModal from './components/modals/AddSubjectModal';
import AddExerciseModal from './components/modals/AddExerciseModal';
import SoundEffects from './components/SoundEffects';

export default function App() {
  // Mode: 'student' | 'teacher' (Backend GV)
  const [portalMode, setPortalMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p === '/gv' || p === '/teacher') return 'teacher';
    }
    return 'student';
  });

  // Page mode for student: 'landing' or 'dashboard'
  const [page, setPage] = useState('landing');
  
  // Dashboard sidebar tab: 'review' | 'teacher' | 'account' | 'settings'
  const [currentTab, setCurrentTab] = useState('review');
  
  // Review subviews: 'courses' | 'subject_detail' | 'method_select' | 'summary' | 'quiz' | 'flashcard' | 'scorecard'
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

  // Courses thật dựa trên tài liệu bài giảng
  const [courses, setCourses] = useState([
    {
      id: 1,
      name: "Tư duy sản phẩm AI & Bài học thích ứng",
      code: "PROD-K4",
      docsCount: 1,
      description: "Đánh giá và thích ứng dựa trên tài liệu bài giảng và chỉ lệnh của Giảng viên.",
      exercises: [
        { id: 1, title: "Bài đánh giá kiến thức AI thích ứng", time: "Hôm nay", progress: 0, color: "indigo" }
      ]
    }
  ]);

  const [recentCourses] = useState([courses[0]]);

  // Fetch backend quiz - CHỈ sử dụng câu hỏi thật được phát hành từ CSDL / Giảng viên
  const fetchBackendQuiz = async () => {
    try {
      const res = await fetch('/api/student/current-quiz');
      if (res.ok) {
        const data = await res.json();
        if (data && data.is_published && data.questions && data.questions.length > 0) {
          setQuizQuestions(data.questions);
          return;
        }
      }
    } catch (e) {
      console.warn("Chưa có đề thi được phát hành từ Giảng viên:", e);
    }
    setQuizQuestions([]);
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
    setSelectedCourse(courses[0]);
    setSelectedExercise(courses[0].exercises[0]);

    const handlePopState = () => {
      const p = window.location.pathname;
      if (p === '/gv' || p === '/teacher') {
        setPortalMode('teacher');
      } else {
        setPortalMode('student');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigate to Teacher Portal (Backend GV)
  const navigateToTeacherPortal = () => {
    SoundEffects.click();
    window.history.pushState({}, '', '/gv');
    setPortalMode('teacher');
  };

  // Navigate to Student Portal
  const navigateToStudentPortal = () => {
    SoundEffects.click();
    window.history.pushState({}, '', '/');
    setPortalMode('student');
  };

  // Chuyển thẳng sang làm bài thi Học viên (với bộ đề mới nhất vừa duyệt)
  const navigateToStudentQuiz = async () => {
    SoundEffects.click();
    await fetchBackendQuiz();
    window.history.pushState({}, '', '/');
    setPortalMode('student');
    setPage('dashboard');
    setCurrentTab('review');
    setSelectedCourse(courses[0]);
    setSelectedExercise(courses[0].exercises[0]);
    setReviewView('quiz');
  };

  // Submit quiz handler
  const handleSubmitQuiz = async (quizSubmission) => {
    const questionsToScore = quizQuestions;
    if (!questionsToScore || questionsToScore.length === 0) {
      alert("Chưa có đề thi nào được phát hành để chấm điểm!");
      return;
    }

    // Gọi API thật để kích hoạt Khối Phân Loại Kết Quả Bài Làm & Thống Kê Sai
    let backendResult = null;
    try {
      const res = await fetch('/api/student/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: currentQuizId || undefined,
          student_name: 'Học viên T153',
          answers: quizSubmission.answers
        })
      });
      if (res.ok) {
        backendResult = await res.json();
      }
    } catch (e) {
      console.warn("Backend submit error, fallback to local scoring", e);
    }

    let result;
    if (backendResult) {
      const totalQ = backendResult.total_questions || questionsToScore.length || 1;
      const correctCount = backendResult.correct_count ?? 0;
      const wrongCount = backendResult.wrong_count ?? (totalQ - correctCount);
      const score = Number(((correctCount / totalQ) * 10).toFixed(1));

      result = {
        score,
        scorePercent: backendResult.score_percent ?? Math.round((correctCount / totalQ) * 100),
        correctCount,
        wrongCount,
        totalQuestions: totalQ,
        answers: quizSubmission.answers,
        timeSpent: quizSubmission.timeSpent,
        wrongQuestions: backendResult.wrong_questions || [],
        sessionId: backendResult.session_id,
        status: backendResult.status,
        masteryAchieved: backendResult.mastery_achieved,
        nextOptions: backendResult.next_options || [],
        remediationPackage: backendResult.remediation_package,
        mistakeAnalytics: backendResult.mistake_analytics
      };
    } else {
      let correct = 0;
      let wrong = 0;
      let wrongList = [];

      questionsToScore.forEach((q, idx) => {
        const qKey = q.id || idx;
        const ans = quizSubmission.answers[qKey];
        if (ans !== undefined && ans === (q.correct_index ?? 0)) {
          correct++;
        } else {
          wrong++;
          wrongList.push({
            ...q,
            question_id: q.id,
            user_selected: ans,
            user_selected_text: ans !== undefined && q.options ? q.options[ans] : "Chưa chọn",
            core_concept: q.core_concept || "Kiến thức trọng tâm",
            slide_page: q.slide_page || 1,
            citation_code: q.citation_code || "DEMO-001"
          });
        }
      });

      const totalQ = questionsToScore.length || 1;
      const score = Number(((correct / totalQ) * 10).toFixed(1));

      result = {
        score,
        scorePercent: Math.round((correct / totalQ) * 100),
        correctCount: correct,
        wrongCount: wrong,
        totalQuestions: totalQ,
        answers: quizSubmission.answers,
        timeSpent: quizSubmission.timeSpent,
        wrongQuestions: wrongList,
        status: correct === totalQ ? 'ALL_CORRECT_MASTERY' : 'HAS_WRONG_ANSWERS',
        masteryAchieved: correct === totalQ
      };
    }

    setQuizResult(result);
    setReviewView('scorecard');
  };

  return (
    <div className={theme === 'dark' ? 'dark bg-[#12121c] text-gray-100 min-h-screen' : 'bg-[#fafbfc] text-gray-800 min-h-screen'}>
      {/* ========================================================================= */}
      {/* 1. CỔNG GIẢNG VIÊN (BACKEND GV) - TÁCH BIỆT THÀNH KHÔNG GIAN RIÊNG /gv   */}
      {/* ========================================================================= */}
      {portalMode === 'teacher' ? (
        <TeacherPortalView
          theme={theme}
          setTheme={setTheme}
          systemStatus={systemStatus}
          fetchStatus={fetchStatus}
          onQuizPublished={() => {
            fetchBackendQuiz();
            fetchStatus();
            alert("🎉 Đã phát hành Quiz thành công! Học viên có thể vào làm bài ngay tại giao diện ôn tập.");
          }}
          onNavigateStudent={navigateToStudentPortal}
          onNavigateStudentQuiz={navigateToStudentQuiz}
        />
      ) : (
        /* ======================================================================= */
        /* 2. GIAO DIỆN HỌC VIÊN: Landing Page & Ôn tập thích ứng                  */
        /* ======================================================================= */
        <>
          {/* 2.1 Landing Page */}
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
              onEnterTeacherPortal={navigateToTeacherPortal}
            />
          )}

          {/* 2.2 Student Dashboard */}
          {page === 'dashboard' && (
            <div className="flex min-h-screen">
              {/* Sidebar dành cho Học viên */}
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
                onNavigateTeacher={navigateToTeacherPortal}
              />

              {/* Main Content */}
              <div className="flex-1 flex flex-col min-w-0">
                <Topbar
                  theme={theme}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onNotificationClick={() => alert("Hệ thống đã sẵn sàng cho buổi bảo vệ đề tài!")}
                  onNavigateTeacher={navigateToTeacherPortal}
                />

                <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto">
                  {/* TAB EVAL: KIỂM THỬ 20 TESTCASE */}
                  {currentTab === 'eval' && (
                    <EvalRunnerView theme={theme} />
                  )}

                  {/* TAB 2: ÔN TẬP THÍCH ỨNG (GIAI ĐOẠN 2: Làm Quiz -> Phân loại -> Gỡ rối -> Mastery) */}
              {currentTab === 'review' && (
                <>
                  {reviewView === 'courses' && (
                    <CourseListView
                      theme={theme}
                      courses={courses}
                      recentCourses={recentCourses}
                      onSelectCourse={(c) => {
                        SoundEffects.click();
                        setSelectedCourse(c);
                        setReviewView('subject_detail');
                      }}
                      onAddCourseModal={() => setIsAddSubjectOpen(true)}
                      onDeleteCourse={(id) => setCourses(courses.filter(c => c.id !== id))}
                    />
                  )}

                  {reviewView === 'subject_detail' && (
                    <SubjectDetailView
                      theme={theme}
                      course={selectedCourse}
                      onBack={() => setReviewView('courses')}
                      onSelectExercise={(ex) => {
                        SoundEffects.click();
                        setSelectedExercise(ex);
                        setReviewView('method_select');
                      }}
                      onAddExerciseModal={() => setIsAddExerciseOpen(true)}
                    />
                  )}

                  {reviewView === 'method_select' && (
                    <MethodSelectView
                      theme={theme}
                      course={selectedCourse}
                      exercise={selectedExercise}
                      onBack={() => setReviewView('subject_detail')}
                      onSelectMethod={(m) => {
                        SoundEffects.click();
                        if (m === 'summary') setReviewView('summary');
                        if (m === 'quiz') setReviewView('quiz');
                        if (m === 'flashcard') setReviewView('flashcard');
                      }}
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
                      questions={quizQuestions}
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
                      questions={quizQuestions}
                      onBack={() => setReviewView('subject_detail')}
                      onRetryQuiz={() => setReviewView('quiz')}
                    />
                  )}
                </>
              )}

              {/* TAB 3: TÀI KHOẢN */}
              {currentTab === 'account' && (
                <div className={`p-8 rounded-3xl border ${theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-200 to-amber-400 flex items-center justify-center text-3xl shadow-md">
                      👑
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Học viên: T153</h3>
                      <p className="text-xs text-gray-400">Khóa K4 AI Thực Chiến • Phòng E403 • Lớp 3B</p>
                      <span className="inline-block mt-1 text-[11px] font-mono text-indigo-500 font-semibold bg-indigo-50 dark:bg-gray-800 px-2.5 py-0.5 rounded-full">
                        Mã: 2A202602362
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                    <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-gray-800/50">
                      <div className="text-xs text-gray-400">Chế độ học tập</div>
                      <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                        Closed Remediation Loop (Vòng lặp thích ứng khép kín)
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-gray-800/50">
                      <div className="text-xs text-gray-400">Trạng thái ranh giới kiến thức</div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        Câu hỏi được giới hạn theo phạm vi giảng viên đã áp dụng
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CÀI ĐẶT */}
              {currentTab === 'settings' && (
                <div className={`p-8 rounded-3xl border space-y-4 ${theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <h3 className="text-lg font-bold">Cài đặt quy chế thi & đánh giá</h3>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 text-xs space-y-2">
                    <div className="font-bold text-indigo-600">Quy tắc sư phạm: Zero Duplication</div>
                    <p className="text-gray-500">
                      Không lặp lại câu hỏi ban đầu khi học viên ôn tập phần kiến thức còn sai. Mọi câu hỏi ôn tập đều là tình huống mới toanh 100%.
                    </p>
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
        onAddSubject={(newSub) => setCourses([newSub, ...courses])}
        theme={theme}
      />

      <AddExerciseModal
        isOpen={isAddExerciseOpen}
        onClose={() => setIsAddExerciseOpen(false)}
        onAddExercise={(newEx) => {
          if (selectedCourse) {
            const updated = { ...selectedCourse, exercises: [newEx, ...(selectedCourse.exercises || [])] };
            setSelectedCourse(updated);
            setCourses(courses.map(c => c.id === updated.id ? updated : c));
          }
        }}
        theme={theme}
      />
        </>
      )}
    </div>
  );
}
