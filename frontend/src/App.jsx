import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import WorkflowStepper from './components/layout/WorkflowStepper';
import LandingPageView from './components/views/LandingPageView';
import CourseListView from './components/views/CourseListView';
import SubjectDetailView from './components/views/SubjectDetailView';
import MethodSelectView from './components/views/MethodSelectView';
import SummaryReaderView from './components/views/SummaryReaderView';
import QuizPracticeView from './components/views/QuizPracticeView';
import FlashcardView from './components/views/FlashcardView';
import ScorecardReviewView from './components/views/ScorecardReviewView';
import TeacherStudio from './components/TeacherStudio';
import AddSubjectModal from './components/modals/AddSubjectModal';
import AddExerciseModal from './components/modals/AddExerciseModal';
import SoundEffects from './components/SoundEffects';

export default function App() {
  // Page mode: 'landing' or 'dashboard'
  const [page, setPage] = useState('landing');
  
  // Dashboard sidebar tab: 'review' | 'teacher' | 'account' | 'settings'
  const [currentTab, setCurrentTab] = useState('review');
  
  // Review subviews: 'courses' | 'subject_detail' | 'method_select' | 'summary' | 'quiz' | 'flashcard' | 'scorecard'
  const [reviewView, setReviewView] = useState('courses');

  // Active step in WorkflowStepper
  const [activeWorkflowStep, setActiveWorkflowStep] = useState('step_quiz');

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

  // 10 Sample Questions strictly adhering to Slide 1-10 with Provenance citations
  const defaultQuestions = [
    {
      id: "Q01",
      question: "Anh Nam muốn làm app AI cho người học tiếng Anh. Anh nên làm gì đầu tiên theo tư duy sản phẩm AI đúng đắn?",
      citation: "Slide Trang 1 • DEMO-001",
      correct_index: 0,
      slide_page: 1,
      core_concept: "Tư duy sản phẩm lấy người dùng làm trung tâm",
      explanation: "Đừng vội mua búa thông minh khi chưa biết chiếc đinh nằm ở đâu! Hãy bắt đầu từ việc tìm hiểu sâu sắc nỗi đau có thật của người học tiếng Anh.",
      options: [
        "Phỏng vấn 20 người học xem họ gặp khó khăn gì lớn nhất khi tự học",
        "Thuê ngay lập tức mô hình GPT-4 đắt nhất về tích hợp",
        "Tự suy diễn tính năng rồi làm app theo ý mình",
        "Bỏ qua khâu khảo sát vì AI luôn biết người dùng cần gì"
      ]
    },
    {
      id: "Q02",
      question: "Một bạn viết tuyên bố JTBD: 'Người dùng cần trạm sạc xe điện thông minh tích hợp AI'. Câu này sai nguyên tắc gì?",
      citation: "Slide Trang 2 • DEMO-002",
      correct_index: 1,
      slide_page: 2,
      core_concept: "Khung JTBD chuẩn",
      explanation: "Khách hàng mua mũi khoan 8 ly không phải vì họ yêu mũi khoan, mà vì họ cần một cái lỗ 8 ly trên tường. Tuyệt đối không cho chữ 'AI' hay công nghệ vào câu JTBD!",
      options: [
        "Câu quá ngắn, cần viết dài ít nhất 3 dòng",
        "Đã nhồi nhét công nghệ 'AI' và giải pháp vào nhu cầu cốt lõi",
        "Vì xe điện không thể dùng AI",
        "Không có lỗi nào cả"
      ]
    },
    {
      id: "Q03",
      question: "Dữ liệu nào sau đây được coi là Bằng chứng Chuẩn A theo đề bài?",
      citation: "Slide Trang 3 • DEMO-003",
      correct_index: 0,
      slide_page: 3,
      core_concept: "Chuẩn bằng chứng A & B",
      explanation: "Chuẩn A bắt buộc phải có ít nhất 20 người ngoài nhóm được khảo sát độc lập với tỷ lệ xác nhận ≥50% kèm câu hỏi và câu trả lời nguyên văn.",
      options: [
        "Khảo sát 24 người ngoài nhóm với 87.5% xác nhận nỗi đau có thật",
        "Hỏi 3 người bạn thân trong cùng nhóm làm bài",
        "Đoán là 90% sinh viên trên mạng đều thích",
        "Trích dẫn một bài báo không rõ tác giả trên mạng xã hội"
      ]
    },
    {
      id: "Q04",
      question: "Format chuẩn của 'Lát cắt một câu' cho prototype bắt buộc phải có những thành tố nào?",
      citation: "Slide Trang 4 • DEMO-004",
      correct_index: 2,
      slide_page: 4,
      core_concept: "Lát cắt một câu",
      explanation: "Lát cắt một câu bắt buộc gồm 4 thành tố rõ ràng: 1 người dùng · 1 công việc · 1 quyết định AI · 1 kết quả.",
      options: [
        "1 công nghệ · 1 máy chủ · 1 database · 1 mô hình AI",
        "1 doanh nghiệp · 1 kế hoạch tài chính · 1 chiến dịch marketing",
        "1 người dùng · 1 công việc · 1 quyết định AI · 1 kết quả",
        "1 lập trình viên · 1 ngôn ngữ code · 1 framework"
      ]
    },
    {
      id: "Q05",
      question: "Trong giáo dục, chi phí sai sót (Cost of Error) của AI rất đắt nếu sinh câu hỏi sai. Cần chọn mức tự động nào?",
      citation: "Slide Trang 5 • DEMO-005",
      correct_index: 0,
      slide_page: 5,
      core_concept: "Chi phí sai sót & Tự động hóa",
      explanation: "Khi sai thì sửa rất đắt, cần chọn mức Augment (AI đề xuất, giảng viên giữ quyền tối cao duyệt và phát hành).",
      options: [
        "Mức Augment: AI đề xuất bản thảo, Giảng viên kiểm duyệt (Human-in-the-loop)",
        "Mức Automate hoàn toàn: AI tự sinh và tự gửi đề cho học viên thi",
        "Bỏ qua không dùng AI",
        "Để học sinh tự chấm bài của nhau"
      ]
    },
    {
      id: "Q06",
      question: "Học viên yêu cầu bot tạo mã độc tấn công máy chủ trường học. Bot từ chối. Đây là xử lý chỗ khó lớp nào?",
      citation: "Slide Trang 6 • DEMO-006",
      correct_index: 2,
      slide_page: 6,
      core_concept: "Bốn lớp chỗ khó - Ngoài phạm vi",
      explanation: "Chỗ khó Lớp 3: Ngoài phạm vi & thẩm quyền (Out-of-scope). Cần từ chối an toàn và giải thích ranh giới rõ ràng.",
      options: [
        "Lớp 1: Nguồn sự thật",
        "Lớp 2: Mơ hồ / thiếu thông tin",
        "Lớp 3: Ngoài phạm vi / thẩm quyền",
        "Lớp 4: Lỗi cú pháp mạng"
      ]
    },
    {
      id: "Q07",
      question: "Giảng viên ghi chú 'Mới dạy Slide 1-10'. Hệ thống AI.Graph Engine phải hành xử như thế nào?",
      citation: "Slide Trang 7 • DEMO-007",
      correct_index: 0,
      slide_page: 7,
      core_concept: "Ràng buộc phạm vi bài dạy",
      explanation: "AI.Graph Engine kích hoạt Hard Boundary Block, chặn 100% câu hỏi thuộc Slide 11 trở đi để không làm người học hoang mang.",
      options: [
        "Kích hoạt Hard Boundary, chặn 100% câu hỏi thuộc Slide 11 trở đi",
        "Cứ sinh hết cả slide 11-15 cho học viên học trước",
        "Tự động xóa slide của giảng viên",
        "Bỏ qua ghi chú của giảng viên"
      ]
    },
    {
      id: "Q08",
      question: "Tính năng Provenance gắn mã [DEMO-NNN] và số trang vào từng câu hỏi nhằm mục đích gì?",
      citation: "Slide Trang 8 • DEMO-008",
      correct_index: 1,
      slide_page: 8,
      core_concept: "Trích dẫn nguồn chuẩn xác",
      explanation: "Provenance giúp minh bạch 100% căn cứ tri thức, để giảng viên và học viên kiểm tra ngay lập tức mà không sợ ảo giác.",
      options: [
        "Để trang trí cho câu hỏi đẹp hơn",
        "Chứng minh 100% câu hỏi có căn cứ trong tài liệu, chống ảo giác (Hallucination)",
        "Làm tăng dung lượng file dữ liệu",
        "Để mã hóa câu hỏi không cho người khác copy"
      ]
    },
    {
      id: "Q09",
      question: "Vì sao hệ thống bắt buộc phải có bước 'Giảng viên duyệt' trước khi phát hành đề thi cho học viên?",
      citation: "Slide Trang 9 • DEMO-009",
      correct_index: 0,
      slide_page: 9,
      core_concept: "Chốt chặn kiểm duyệt",
      explanation: "Human-in-the-loop là chốt chặn bảo vệ niềm tin giáo dục, đảm bảo không có câu hỏi sai sót lọt đến học viên.",
      options: [
        "Đảm bảo chốt chặn con người (Human-in-the-loop), bảo vệ chất lượng đề thi và niềm tin",
        "Để mất thêm thời gian",
        "Vì máy tính không thể kết nối mạng",
        "Để giảm điểm của học viên"
      ]
    },
    {
      id: "Q10",
      question: "Khi học viên làm sai, tại sao hệ thống bắt buộc phải tạo câu hỏi tình huống MỚI TOANH 100%?",
      citation: "Slide Trang 10 • DEMO-010",
      correct_index: 2,
      slide_page: 10,
      core_concept: "Vòng lặp học tập thích ứng",
      explanation: "Chống học vẹt! Đưa tình huống mới toanh giúp kiểm tra thực chất xem học viên đã thực sự làm chủ kiến thức hay chưa.",
      options: [
        "Để làm khó học sinh",
        "Vì hệ thống không lưu được câu hỏi cũ",
        "Tuyệt đối chống học vẹt đáp án; củng cố năng lực thật thông qua tình huống tương đương mới 100%",
        "Vì slide bài giảng bị thay đổi liên tục"
      ]
    }
  ];

  // Mock initial courses
  const [courses, setCourses] = useState([
    {
      id: 1,
      name: "Tư duy sản phẩm AI & Bài học thích ứng",
      code: "PROD-K4",
      docsCount: 3,
      description: "Slide bài giảng chuẩn từ BTC (15 trang) • Chặn Slide > 10 • Vòng lặp thích ứng khép kín.",
      exercises: [
        { id: 1, title: "Bộ đề thi cốt lõi ban đầu (Q01 - Q10) • Slide 1-10", time: "Hôm nay", progress: 0, color: "indigo" },
        { id: 2, title: "Bài tập 2: Khung JTBD & 5 Tiêu chí nghiệm thu", time: "Hôm qua", progress: 100, color: "emerald" },
      ]
    },
    {
      id: 2,
      name: "Xác suất thống kê",
      code: "MTA02",
      docsCount: 3,
      description: "Kiến thức nâng cao về xác suất và biến cố ngẫu nhiên.",
      exercises: [
        { id: 1, title: "Bài tập 1: Khái niệm biến cố & Không gian mẫu", time: "Hôm qua", progress: 100, color: "emerald" },
      ]
    }
  ]);

  const [recentCourses] = useState([courses[0]]);

  // Fetch backend quiz or fallback to default 10 questions
  const fetchBackendQuiz = async () => {
    try {
      const res = await fetch('/api/student/current-quiz');
      if (res.ok) {
        const data = await res.json();
        if (data && data.questions && data.questions.length > 0) {
          setQuizQuestions(data.questions);
          return;
        }
      }
    } catch (e) {
      console.log("Using default 10 core questions");
    }
    setQuizQuestions(defaultQuestions);
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
  }, []);

  // Handle Workflow Stepper Navigation
  const handleWorkflowStepClick = (stepId) => {
    SoundEffects.click();
    setActiveWorkflowStep(stepId);
    setPage('dashboard');

    if (['step_pdf', 'step_note', 'step_graph', 'step_review'].includes(stepId)) {
      setCurrentTab('teacher');
    } else if (stepId === 'step_quiz') {
      setCurrentTab('review');
      setReviewView('quiz');
    } else if (stepId === 'step_remediation') {
      setCurrentTab('review');
      // Mock result with 2 wrong questions to demonstrate remediation
      setQuizResult({
        score: 8.0,
        correctCount: 8,
        wrongCount: 2,
        answers: { Q01: 1, Q02: 0, Q03: 0, Q04: 2, Q05: 0, Q06: 2, Q07: 0, Q08: 1, Q09: 0, Q10: 2 },
        wrongQuestions: [defaultQuestions[0], defaultQuestions[1]]
      });
      setReviewView('scorecard');
    } else if (stepId === 'step_mastery') {
      setCurrentTab('review');
      // Mock result with 100% correct
      const perfectAnswers = {};
      defaultQuestions.forEach(q => { perfectAnswers[q.id] = q.correct_index; });
      setQuizResult({
        score: 10.0,
        correctCount: 10,
        wrongCount: 0,
        answers: perfectAnswers,
        wrongQuestions: []
      });
      setReviewView('scorecard');
    }
  };

  // Submit quiz handler
  const handleSubmitQuiz = (quizSubmission) => {
    const questionsToScore = quizQuestions.length > 0 ? quizQuestions : defaultQuestions;

    let correct = 0;
    let wrong = 0;
    let wrongList = [];

    questionsToScore.forEach((q, idx) => {
      const qKey = q.id || idx;
      const ans = quizSubmission.answers[qKey];
      if (ans === (q.correct_index ?? 0)) {
        correct++;
      } else {
        wrong++;
        wrongList.push(q);
      }
    });

    const score = Number(((correct / questionsToScore.length) * 10).toFixed(1));

    const result = {
      score,
      correctCount: correct,
      wrongCount: wrong,
      answers: quizSubmission.answers,
      timeSpent: quizSubmission.timeSpent,
      wrongQuestions: wrongList
    };

    setQuizResult(result);
    setReviewView('scorecard');
    setActiveWorkflowStep(correct === questionsToScore.length ? 'step_mastery' : 'step_remediation');
  };

  return (
    <div className={theme === 'dark' ? 'dark bg-[#12121c] text-gray-100 min-h-screen' : 'bg-[#fafbfc] text-gray-800 min-h-screen'}>
      {/* 1. Landing Page */}
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
            setActiveWorkflowStep('step_quiz');
          }}
        />
      )}

      {/* 2. Dashboard with Workflow Stepper Bar */}
      {page === 'dashboard' && (
        <div className="flex min-h-screen">
          {/* Sidebar (Đã loại bỏ Thống kê theo sơ đồ) */}
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

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar
              theme={theme}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onNotificationClick={() => alert("Hệ thống đã sẵn sàng cho buổi bảo vệ đề tài!")}
            />

            <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto">
              {/* Process Stepper Bar matching the 2-stage Diagram */}
              <WorkflowStepper
                activeStep={activeWorkflowStep}
                onStepClick={handleWorkflowStepClick}
                theme={theme}
              />

              {/* TAB 1: GIẢNG VIÊN STUDIO (GIAI ĐOẠN 1: Nạp Slide, Ghi chú, Chặn Slide > 10, Duyệt) */}
              {currentTab === 'teacher' && (
                <TeacherStudio
                  systemStatus={systemStatus}
                  refreshStatus={fetchStatus}
                  onQuizPublished={() => {
                    fetchBackendQuiz();
                    SoundEffects.fanfare();
                    alert("🎉 Đã phát hành Quiz thành công! Hệ thống chuyển trực tiếp sang Giai đoạn 2 cho học viên làm bài.");
                    setCurrentTab('review');
                    setReviewView('quiz');
                    setActiveWorkflowStep('step_quiz');
                  }}
                />
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
                        if (m === 'quiz') {
                          setReviewView('quiz');
                          setActiveWorkflowStep('step_quiz');
                        }
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
                      onGoToQuiz={() => {
                        setReviewView('quiz');
                        setActiveWorkflowStep('step_quiz');
                      }}
                    />
                  )}

                  {reviewView === 'quiz' && (
                    <QuizPracticeView
                      theme={theme}
                      course={selectedCourse}
                      exercise={selectedExercise}
                      questions={quizQuestions.length > 0 ? quizQuestions : defaultQuestions}
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
                      questions={quizQuestions.length > 0 ? quizQuestions : defaultQuestions}
                      onBack={() => setReviewView('subject_detail')}
                      onRetryQuiz={() => {
                        setReviewView('quiz');
                        setActiveWorkflowStep('step_quiz');
                      }}
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
                      <h3 className="text-xl font-bold">Học viên: Hiền Trang</h3>
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
                        Hard Boundary: Chặn Slide 11 - 15 (Tuân thủ Slide 1-10)
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
                      Tuyệt đối không lặp lại câu hỏi ban đầu Q01 - Q10 khi học viên làm sai. Mọi câu hỏi ôn tập đều là tình huống mới toanh 100%.
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
    </div>
  );
}
