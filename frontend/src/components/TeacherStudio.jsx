import React, { useState, useEffect } from 'react';
import { 
  Upload, Sparkles, ShieldCheck, CheckCircle2, FileText, 
  AlertTriangle, ArrowRight, ArrowLeft, Lock, Unlock, BarChart3, 
  TrendingUp, RefreshCw, Edit3, Trash2, X, Save, MessageSquare,
  ChevronRight, Sliders, Check, FolderOpen, Layers, BookOpen,
  PlusCircle, Eye, EyeOff, HelpCircle, CheckSquare, GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundEffects } from './SoundEffects';

export default function TeacherStudio({ 
  systemStatus, 
  refreshStatus, 
  onQuizPublished,
  activeTab = 'upload',
  setActiveTab,
  onStudioStateChange,
  onNavigateStudent,
  onNavigateStudentQuiz
}) {
  const [loading, setLoading] = useState(false);
  const [publishSuccessInfo, setPublishSuccessInfo] = useState(null);
  const [markdownData, setMarkdownData] = useState(null);
  const [transcriptText, setTranscriptText] = useState('');
  const [showTranscriptInput, setShowTranscriptInput] = useState(false);
  
  // 3 ô chỉ lệnh bài dạy của Giảng viên:
  // Ô 1: Nội dung đã học đến đâu
  const [scopeNote, setScopeNote] = useState('Mới dạy xong Slide 1 - 10');
  // Ô 2: Cần lưu ý và nhấn mạnh ở đâu
  const [emphasisNote, setEmphasisNote] = useState('Nhấn mạnh vào tư duy JTBD (Jobs-to-be-done) và nỗi đau thực tế của người dùng, chuyển thành tình huống kinh doanh thuần Việt gần gũi.');
  // Ô 3: Sinh ra tối đa bao nhiêu câu hỏi
  const [maxQuestions, setMaxQuestions] = useState(10);
  
  const [scopeSummary, setScopeSummary] = useState(null);
  const [constraintApplied, setConstraintApplied] = useState(false);
  const [draftQuiz, setDraftQuiz] = useState(null);
  const [verifiedHuman, setVerifiedHuman] = useState(false);
  const [mistakeAnalytics, setMistakeAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  // Danh sách tài liệu đã có trong hệ thống
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [loadingDocList, setLoadingDocList] = useState(false);

  // Môn học liên kết với tài liệu & bài tập sinh viên
  const [subjectName, setSubjectName] = useState('Tư duy sản phẩm AI & Bài học thích ứng');
  const [subjectCode, setSubjectCode] = useState('PROD-K4');

  // =========================================================================
  // STATE CHO MENU 4: QUẢN LÝ CÁC BÀI ĐÁNH GIÁ ĐÃ DUYỆT
  // =========================================================================
  const [quizzesList, setQuizzesList] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loadingQuizDetail, setLoadingQuizDetail] = useState(false);

  // Modals quản lý đề thi
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('Đề kiểm tra kiến thức Tư duy sản phẩm AI');
  const [newQuizStatus, setNewQuizStatus] = useState('PUBLISHED');

  const [editingQuizTitleModal, setEditingQuizTitleModal] = useState(null);
  const [editingQuestionModal, setEditingQuestionModal] = useState(null);

  // Sync state to parent layout (for live badges in sidebar)
  useEffect(() => {
    if (onStudioStateChange) {
      const activeCount = quizzesList.filter(q => q.status === 'PUBLISHED').length;
      onStudioStateChange({
        slidesCount: markdownData?.total_slides || 0,
        hasFile: !!selectedFile,
        fileName: selectedFile?.name || '',
        constraintApplied: !!(constraintApplied || scopeSummary),
        questionsCount: draftQuiz?.total_questions || draftQuiz?.questions?.length || 0,
        maxQuestions: maxQuestions,
        totalQuizzesCount: quizzesList.length,
        activeQuizzesCount: activeCount
      });
    }
  }, [markdownData, selectedFile, constraintApplied, scopeSummary, draftQuiz, maxQuestions, quizzesList]);

  // Fetch mistake analytics from Stage 2 (Dashed feedback loop)
  const fetchMistakeAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await fetch('/api/lecturer/mistake-analytics');
      const data = await res.json();
      if (data.success) {
        setMistakeAnalytics(data);
      }
    } catch (e) {
      console.warn("Could not load mistake analytics:", e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Fetch danh sách tài liệu đã có trong hệ thống
  const fetchAvailableDocuments = async () => {
    try {
      setLoadingDocList(true);
      const res = await fetch('/api/lecturer/documents');
      const data = await res.json();
      if (data.success && data.documents) {
        setAvailableDocuments(data.documents);
      }
    } catch (e) {
      console.warn("Could not fetch available documents:", e);
    } finally {
      setLoadingDocList(false);
    }
  };

  // Tự động nạp tài liệu hiện có vào giao diện khi mới mở trang
  const autoFillExistingDocument = async () => {
    try {
      const res = await fetch('/api/lecturer/markdown-preview');
      const data = await res.json();
      if (data && data.slides && data.slides.length > 0) {
        setMarkdownData(data);
        const fileName = data.file_name || data.source_file || 'slide-tu-duy-san-pham.pdf';
        setSelectedFile({
          name: fileName,
          size: 66311,
          isPreloaded: true
        });
        setUploadSuccessMsg(`🎉 Đã nạp tài liệu hiện có: ${fileName} (${data.total_slides} slide trích xuất).`);
      }
    } catch (e) {
      console.warn("Could not auto-fill document:", e);
    }
  };

  // Fetch danh sách tất cả các bài thi đã duyệt (Menu 4)
  const fetchQuizzesList = async () => {
    try {
      setLoadingQuizzes(true);
      const res = await fetch('/api/lecturer/quizzes');
      const data = await res.json();
      if (data.success && data.quizzes) {
        setQuizzesList(data.quizzes);
        // Tự động chọn bài đầu tiên nếu chưa chọn bài nào
        if (!selectedQuiz && data.quizzes.length > 0) {
          fetchQuizDetail(data.quizzes[0].id);
        }
      }
    } catch (e) {
      console.warn("Could not fetch quizzes list:", e);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  // Fetch chi tiết một bài thi
  const fetchQuizDetail = async (quizId) => {
    try {
      setLoadingQuizDetail(true);
      const res = await fetch(`/api/lecturer/quizzes/${quizId}`);
      const data = await res.json();
      if (data.success && data.quiz) {
        setSelectedQuiz(data.quiz);
      }
    } catch (e) {
      console.warn("Could not load quiz details:", e);
    } finally {
      setLoadingQuizDetail(false);
    }
  };

  // Fetch bản thảo câu hỏi mới nhất từ DB
  const fetchDraftQuiz = async () => {
    try {
      const res = await fetch('/api/lecturer/current-draft');
      const data = await res.json();
      if (data.success && data.quiz && data.quiz.questions && data.quiz.questions.length > 0) {
        setDraftQuiz(data.quiz);
      }
    } catch (e) {
      console.warn("Could not fetch current draft quiz:", e);
    }
  };

  useEffect(() => {
    fetchMistakeAnalytics();
    fetchAvailableDocuments();
    autoFillExistingDocument();
    fetchQuizzesList();
    fetchDraftQuiz();
  }, []);

  // Chọn 1 tài liệu đã có trong hệ thống để sử dụng
  const handleSelectExistingDocument = async (doc) => {
    SoundEffects.click();
    setIsConverting(true);
    setUploadError(null);
    setUploadSuccessMsg(null);
    // Xóa preview cũ ngay lập tức để người dùng thấy trạng thái loading
    setMarkdownData(null);
    setScopeSummary(null);
    setConstraintApplied(false);

    const chosenName = doc.subject_name || doc.title || doc.file_name.replace('.pdf', '');
    const chosenCode = doc.subject_code || (chosenName.toLowerCase().includes('tmđt') ? 'TMDT-K4' : 'SUB-01');
    setSubjectName(chosenName);
    setSubjectCode(chosenCode);

    try {
      const res = await fetch('/api/lecturer/select-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          file_name: doc.file_name,
          subject_name: chosenName,
          subject_code: chosenCode
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMarkdownData(data);
        setSelectedFile({
          name: data.file_name,
          size: doc.file_size || 66311,
          isPreloaded: true
        });
        setUploadSuccessMsg(`🎉 Đã nạp thành công môn '${chosenName}' (${chosenCode}) - tài liệu: ${data.file_name} (${data.total_slides} slide).`);
        SoundEffects.correct();
        refreshStatus();
        fetchAvailableDocuments();
      } else {
        SoundEffects.wrong();
        setUploadError(data.message || data.detail || "Không thể nạp tài liệu này.");
      }
    } catch (e) {
      SoundEffects.wrong();
      setUploadError("Lỗi kết nối khi nạp tài liệu: " + e.message);
    } finally {
      setIsConverting(false);
    }
  };

  // 1 & 2. Tự động tải lên và trích xuất PDF sang Markdown ngay khi chọn file
  const handleUploadAndConvert = async (fileToUpload = null) => {
    const file = fileToUpload || selectedFile;
    if (!file) {
      alert("Vui lòng chọn file PDF trước khi bấm chuyển đổi!");
      return;
    }
    SoundEffects.click();
    setIsConverting(true);
    setUploadError(null);
    setUploadSuccessMsg(null);
    // Xóa dữ liệu preview cũ ngay để bên phải hiển thị hoạt ảnh loading MarkItDown
    setMarkdownData(null);
    setScopeSummary(null);
    setConstraintApplied(false);

    const cleanName = (file.name || 'TaiLieu').replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
    const autoSubName = subjectName?.trim() && subjectName !== 'Tư duy sản phẩm AI & Bài học thích ứng'
      ? subjectName.trim()
      : (cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    const autoSubCode = subjectCode?.trim() && subjectCode !== 'PROD-K4'
      ? subjectCode.trim()
      : (autoSubName.length > 5 ? autoSubName.slice(0, 4).toUpperCase() + '-K4' : 'SUB-01');

    setSubjectName(autoSubName);
    setSubjectCode(autoSubCode);
    setSelectedFile({
      name: file.name,
      size: file.size || 0,
      isPreloaded: false
    });

    const formData = new FormData();
    formData.append('file', file);
    if (transcriptText.trim()) {
      formData.append('transcript_text', transcriptText.trim());
    }
    formData.append('subject_name', autoSubName);
    formData.append('subject_code', autoSubCode);

    try {
      const res = await fetch('/api/lecturer/upload-pdf', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok && data.success) {
        setMarkdownData(data);
        setSelectedFile({
          name: data.file_name,
          size: file.size || 1048576,
          isPreloaded: false
        });
        if (data.subject_name) setSubjectName(data.subject_name);
        if (data.subject_code) setSubjectCode(data.subject_code);
        setUploadSuccessMsg(`🎉 Chuyển đổi thành công! Đã trích xuất ${data.total_slides} slide môn '${data.subject_name || autoSubName}' sang Markdown có cấu trúc.`);
        SoundEffects.correct();
        refreshStatus();
        fetchAvailableDocuments();
      } else {
        SoundEffects.wrong();
        const msg = data.message || data.detail || "Không thể trích xuất nội dung từ file PDF này.";
        setUploadError(msg);
      }
    } catch (e) {
      SoundEffects.wrong();
      setUploadError("Lỗi kết nối máy chủ khi chuyển đổi: " + e.message);
    } finally {
      setIsConverting(false);
      setIsUploadingFile(false);
    }
  };

  // Chọn file PDF từ máy - Kích hoạt tự động nạp và chuyển đổi tức thì
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleUploadAndConvert(file);
    e.target.value = '';
  };

  // Hủy file đã chọn
  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    setMarkdownData(null);
    setUploadError(null);
    setUploadSuccessMsg(null);
  };

  const handleSubmitConvert = () => handleUploadAndConvert();

  // Nạp tài liệu mẫu 15 trang
  const handleLoadSample = async () => {
    SoundEffects.click();
    setIsConverting(true);
    setUploadError(null);
    setUploadSuccessMsg(null);
    setMarkdownData(null);
    setSubjectName('Tư duy sản phẩm AI & Bài học thích ứng');
    setSubjectCode('PROD-K4');
    try {
      const formData = new FormData();
      if (transcriptText.trim()) {
        formData.append('transcript_text', transcriptText.trim());
      }
      formData.append('subject_name', 'Tư duy sản phẩm AI & Bài học thích ứng');
      formData.append('subject_code', 'PROD-K4');
      const res = await fetch('/api/lecturer/upload-pdf', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedFile({ name: 'slide-tu-duy-san-pham.pdf (Bản mẫu)', size: 1048576, isPreloaded: true });
        setMarkdownData(data);
        setScopeSummary(null);
        setConstraintApplied(false);
        setUploadSuccessMsg("🎉 Đã nạp thành công slide bài giảng mẫu 15 trang.");
        SoundEffects.correct();
        refreshStatus();
        fetchAvailableDocuments();
      } else {
        SoundEffects.wrong();
        setUploadError(data.message || "Lỗi tải bản mẫu");
      }
    } catch (e) {
      SoundEffects.wrong();
      setUploadError("Lỗi tải bản mẫu: " + e.message);
    } finally {
      setIsConverting(false);
    }
  };

  // Apply constraints
  const handleApplyConstraints = async () => {
    SoundEffects.click();
    if (!scopeNote.trim()) {
      alert("Vui lòng nhập nội dung đã học đến đâu ở Ô 1!");
      return;
    }
    const numQ = Math.max(1, Math.min(20, parseInt(maxQuestions, 10) || 10));
    try {
      const activeFileName = markdownData?.file_name || selectedFile?.name;
      const res = await fetch('/api/lecturer/set-constraints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          file_name: activeFileName,
          scope_note: scopeNote.trim(),
          emphasis_note: emphasisNote.trim(),
          max_questions: numQ,
          lecturer_note: `Phạm vi: ${scopeNote.trim()} | Nhấn mạnh: ${emphasisNote.trim()} | Số câu tối đa: ${numQ}`
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setScopeSummary(data);
        setConstraintApplied(true);
        SoundEffects.correct();
        refreshStatus();
        alert(`✅ Đã xác lập 3 chỉ lệnh bài dạy thành công!\n• Phạm vi: Slide ${data.constraints?.min_slide} - ${data.constraints?.max_slide}\n• Quy mô: Tối đa ${numQ} câu hỏi\n👉 ĐIỀU KIỆN TIÊN QUYẾT ĐẠT: Mở khóa AI sinh Quiz!`);
      } else {
        SoundEffects.wrong();
        alert("Lỗi áp dụng ràng buộc: " + (data.message || data.detail || "Thất bại"));
      }
    } catch (e) {
      SoundEffects.wrong();
      alert("Lỗi áp dụng ràng buộc: " + e.message);
    }
  };

  // Generate Quiz - Chỉ sinh đề khi ĐẦY ĐỦ TẤT CẢ các bước tiên quyết
  const handleGenerateQuiz = async () => {
    const hasDoc = !!markdownData && (markdownData.total_slides > 0 || (markdownData.slides && markdownData.slides.length > 0));
    const hasNotes = !!(constraintApplied || scopeSummary);

    if (!hasDoc) {
      SoundEffects.wrong();
      alert("⚠️ ĐIỀU KIỆN 1 CHƯA HOÀN THÀNH: Vui lòng nạp hoặc chọn tài liệu PDF ở Bước 1 trước khi sinh câu hỏi!");
      if (setActiveTab) setActiveTab('upload');
      return;
    }

    if (!hasNotes) {
      SoundEffects.wrong();
      alert("⚠️ ĐIỀU KIỆN 2 CHƯA HOÀN THÀNH: Giảng viên bắt buộc phải nhập 3 ô chỉ lệnh và bấm 'Áp Dụng 3 Chỉ Lệnh & Khóa Ranh Giới' ở Bước 2 trước khi AI sinh đề!");
      if (setActiveTab) setActiveTab('notes');
      return;
    }

    SoundEffects.click();
    setLoading(true);
    try {
      const activeFileName = markdownData?.file_name || selectedFile?.name;
      const res = await fetch('/api/lecturer/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: activeFileName,
          scope_note: scopeNote,
          emphasis_note: emphasisNote,
          max_questions: Number(maxQuestions) || 10,
          subject_name: subjectName,
          subject_code: subjectCode
        })
      });

      let data = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const textBody = await res.text();
        throw new Error(textBody || `Lỗi máy chủ (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.detail || data.message || `Lỗi máy chủ (${res.status})`);
      }
      if (data.success) {
        setDraftQuiz(data.quiz);
        SoundEffects.correct();
        refreshStatus();
        fetchQuizzesList();
      } else {
        throw new Error(data.message || "Không thể sinh câu hỏi từ AI.");
      }
    } catch (e) {
      alert("⚠️ Không thể sinh câu hỏi từ AI: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Xóa câu hỏi bản thảo
  const handleDeleteQuestion = async (qId) => {
    if (!confirm(`Bạn có chắc muốn loại bỏ câu hỏi ${qId} khỏi bản thảo đề thi?`)) return;
    SoundEffects.click();
    try {
      const res = await fetch(`/api/lecturer/questions/${qId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDraftQuiz(prev => ({
          ...prev,
          total_questions: prev.total_questions - 1,
          questions: prev.questions.filter(q => q.id !== qId)
        }));
        SoundEffects.correct();
      }
    } catch (e) {
      alert("Lỗi xóa câu hỏi: " + e.message);
    }
  };

  // Bắt đầu sửa câu hỏi bản thảo
  const handleStartEdit = (q) => {
    SoundEffects.click();
    setEditingQuestion({
      id: q.id,
      question: q.question,
      options: [...q.options],
      correct_index: q.correct_index,
      explanation: q.explanation || ''
    });
  };

  // Lưu sửa đổi câu hỏi bản thảo
  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    SoundEffects.click();
    try {
      const res = await fetch(`/api/lecturer/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: editingQuestion.question,
          options: editingQuestion.options,
          correct_index: editingQuestion.correct_index
        })
      });
      const data = await res.json();
      if (data.success) {
        setDraftQuiz(prev => ({
          ...prev,
          questions: prev.questions.map(q => q.id === editingQuestion.id ? {
            ...q,
            question: editingQuestion.question,
            options: editingQuestion.options,
            correct_index: editingQuestion.correct_index
          } : q)
        }));
        setEditingQuestion(null);
        SoundEffects.correct();
      }
    } catch (e) {
      alert("Lỗi lưu cập nhật: " + e.message);
    }
  };

  // Publish Quiz (Human-in-the-loop)
  const handlePublishQuiz = async () => {
    if (!verifiedHuman) {
      alert("Vui lòng tích chọn xác nhận kiểm tra 100% trích dẫn nguồn và bám sát bài dạy trước khi phát hành!");
      return;
    }
    SoundEffects.click();
    try {
      const res = await fetch('/api/lecturer/publish-quiz', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        SoundEffects.fanfare();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        refreshStatus();
        fetchQuizzesList();
        setPublishSuccessInfo(data.quiz || { status: 'PUBLISHED' });
        if (onQuizPublished) onQuizPublished();
      }
    } catch (e) {
      alert("Lỗi phát hành: " + e.message);
    }
  };

  // =========================================================================
  // CÁC HÀM XỬ LÝ CHO MENU 4: QUẢN LÝ BÀI THI ĐÃ SINH & ĐÃ DUYỆT
  // =========================================================================

  // Bật / Hủy quyền cho sinh viên làm bài
  const handleToggleStudentAccess = async (quiz) => {
    SoundEffects.click();
    try {
      const res = await fetch(`/api/lecturer/quizzes/${quiz.id}/toggle-status`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        SoundEffects.correct();
        alert(data.message);
        fetchQuizzesList();
        if (selectedQuiz && selectedQuiz.id === quiz.id) {
          fetchQuizDetail(quiz.id);
        }
        refreshStatus();
      }
    } catch (e) {
      SoundEffects.wrong();
      alert("Lỗi cập nhật quyền làm bài: " + e.message);
    }
  };

  // Xóa một bộ đề thi
  const handleDeleteQuiz = async (quiz) => {
    if (!confirm(`Bạn có chắc muốn xóa vĩnh viễn bộ đề thi '${quiz.title}' (${quiz.total_questions} câu)?\nHành động này không thể hoàn tác!`)) {
      return;
    }
    SoundEffects.click();
    try {
      const res = await fetch(`/api/lecturer/quizzes/${quiz.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        SoundEffects.correct();
        if (selectedQuiz && selectedQuiz.id === quiz.id) {
          setSelectedQuiz(null);
        }
        fetchQuizzesList();
        refreshStatus();
      }
    } catch (e) {
      SoundEffects.wrong();
      alert("Lỗi xóa bộ đề: " + e.message);
    }
  };

  // Tạo bộ đề thi mới
  const handleCreateQuizSubmit = async () => {
    if (!newQuizTitle.trim()) {
      alert("Vui lòng nhập tiêu đề bộ đề thi!");
      return;
    }
    SoundEffects.click();
    try {
      const res = await fetch('/api/lecturer/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newQuizTitle.trim(),
          status: newQuizStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        SoundEffects.correct();
        setShowCreateQuizModal(false);
        setNewQuizTitle('Đề kiểm tra kiến thức Tư duy sản phẩm AI');
        fetchQuizzesList();
        if (data.quiz_id) {
          fetchQuizDetail(data.quiz_id);
        }
      }
    } catch (e) {
      SoundEffects.wrong();
      alert("Lỗi tạo đề thi: " + e.message);
    }
  };

  // Sửa tiêu đề đề thi
  const handleSaveQuizTitle = async () => {
    if (!editingQuizTitleModal || !editingQuizTitleModal.title.trim()) return;
    SoundEffects.click();
    try {
      const res = await fetch(`/api/lecturer/quizzes/${editingQuizTitleModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingQuizTitleModal.title.trim() })
      });
      const data = await res.json();
      if (data.success) {
        SoundEffects.correct();
        setEditingQuizTitleModal(null);
        fetchQuizzesList();
        if (selectedQuiz && selectedQuiz.id === editingQuizTitleModal.id) {
          fetchQuizDetail(editingQuizTitleModal.id);
        }
      }
    } catch (e) {
      SoundEffects.wrong();
      alert("Lỗi cập nhật tiêu đề: " + e.message);
    }
  };

  // Mở modal thêm câu hỏi mới vào bài thi được chọn
  const handleOpenAddQuestion = () => {
    if (!selectedQuiz) return;
    SoundEffects.click();
    setEditingQuestionModal({
      isNew: true,
      quizId: selectedQuiz.id,
      question: '',
      options: ['', '', '', ''],
      correct_index: 0,
      explanation: '',
      slide_page: 1,
      core_concept: 'Khái niệm trọng tâm'
    });
  };

  // Mở modal sửa câu hỏi trong bài thi được chọn
  const handleOpenEditQuestion = (q) => {
    if (!selectedQuiz) return;
    SoundEffects.click();
    setEditingQuestionModal({
      isNew: false,
      quizId: selectedQuiz.id,
      question_code: q.id,
      question: q.question,
      options: [...q.options],
      correct_index: q.correct_index,
      explanation: q.explanation || '',
      slide_page: q.slide_page || 1,
      core_concept: q.core_concept || 'Khái niệm'
    });
  };

  // Lưu thêm / sửa câu hỏi trong đề thi
  const handleSaveQuestionSubmit = async () => {
    if (!editingQuestionModal) return;
    if (!editingQuestionModal.question.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi!");
      return;
    }
    SoundEffects.click();
    try {
      const url = editingQuestionModal.isNew
        ? `/api/lecturer/quizzes/${editingQuestionModal.quizId}/questions`
        : `/api/lecturer/quizzes/${editingQuestionModal.quizId}/questions/${editingQuestionModal.question_code}`;
      const method = editingQuestionModal.isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: editingQuestionModal.question.trim(),
          options: editingQuestionModal.options,
          correct_index: editingQuestionModal.correct_index,
          explanation: editingQuestionModal.explanation,
          slide_page: editingQuestionModal.slide_page,
          core_concept: editingQuestionModal.core_concept
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        SoundEffects.correct();
        setEditingQuestionModal(null);
        fetchQuizDetail(editingQuestionModal.quizId);
        fetchQuizzesList();
      } else {
        SoundEffects.wrong();
        alert(data.message || data.detail || "Lỗi lưu câu hỏi");
      }
    } catch (e) {
      SoundEffects.wrong();
      alert("Lỗi kết nối: " + e.message);
    }
  };

  // Xóa câu hỏi khỏi bài thi được chọn
  const handleDeleteQuestionFromQuiz = async (qCode) => {
    if (!selectedQuiz) return;
    if (!confirm(`Bạn có chắc muốn xóa câu hỏi ${qCode} khỏi bộ đề này?`)) return;
    SoundEffects.click();
    try {
      const res = await fetch(`/api/lecturer/quizzes/${selectedQuiz.id}/questions/${qCode}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        SoundEffects.correct();
        fetchQuizDetail(selectedQuiz.id);
        fetchQuizzesList();
      }
    } catch (e) {
      SoundEffects.wrong();
      alert("Lỗi xóa câu hỏi: " + e.message);
    }
  };

  const hasDoc = !!markdownData && (markdownData.total_slides > 0 || (markdownData.slides && markdownData.slides.length > 0));
  const hasNotes = !!(constraintApplied || scopeSummary);
  const canGenerateQuiz = hasDoc && hasNotes;

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* ========================================================================= */}
      {/* STEP WIZARD BAR: 3 BƯỚC TUẦN TỰ CHO ĐẾN KHI ĐẦY ĐỦ TẤT CẢ RỒI MỚI SINH ĐỀ */}
      {/* ========================================================================= */}
      <div className="bg-quiz-panel border border-quiz-border rounded-3xl p-4 md:p-5 shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-3 px-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            Quy trình chuẩn bị đề thi: 3 bước tuần tự
          </span>
          <span className="text-xs font-mono font-bold text-purple-400">
            {canGenerateQuiz ? '✓ Đã sẵn sàng sinh đề AI' : hasDoc ? 'Bước 2: Chỉ lệnh bài dạy' : 'Bước 1: Nạp tài liệu'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => {
              SoundEffects.click();
              if (setActiveTab) setActiveTab('upload');
            }}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
              activeTab === 'upload'
                ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-950/50'
                : hasDoc
                ? 'bg-quiz-dark/80 border-emerald-500/40 hover:border-emerald-500/80'
                : 'bg-quiz-dark/50 border-quiz-border hover:border-slate-600'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
              hasDoc 
                ? 'bg-emerald-500 text-white' 
                : activeTab === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {hasDoc ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <span>1. Tài liệu bài giảng PDF</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {hasDoc ? `✓ ${markdownData.total_slides} slides đã trích xuất` : 'Cần tải lên hoặc chọn PDF'}
              </p>
            </div>
          </button>

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => {
              SoundEffects.click();
              if (!hasDoc) {
                alert("Vui lòng hoàn thành Bước 1: Nạp tài liệu bài giảng trước!");
                return;
              }
              if (setActiveTab) setActiveTab('notes');
            }}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
              activeTab === 'notes'
                ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/50'
                : hasNotes
                ? 'bg-quiz-dark/80 border-emerald-500/40 hover:border-emerald-500/80'
                : hasDoc
                ? 'bg-quiz-dark/50 border-amber-500/30 hover:border-amber-500/60'
                : 'bg-quiz-dark/30 border-quiz-border opacity-60 cursor-not-allowed'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
              hasNotes 
                ? 'bg-emerald-500 text-white' 
                : activeTab === 'notes'
                ? 'bg-amber-500 text-slate-950'
                : hasDoc
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-500'
            }`}>
              {hasNotes ? <CheckCircle2 className="w-5 h-5" /> : '2'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <span>2. Ghi chú & 3 chỉ lệnh</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {hasNotes ? '✓ Đã khóa ranh giới 3 ô' : hasDoc ? 'Chờ nhập 3 ô & áp dụng' : 'Khóa (Cần xong Bước 1)'}
              </p>
            </div>
          </button>

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => {
              SoundEffects.click();
              if (!hasDoc) {
                alert("Vui lòng hoàn thành Bước 1 trước!");
                return;
              }
              if (!hasNotes) {
                alert("Vui lòng hoàn thành Bước 2: Nhập 3 ô chỉ lệnh và bấm Áp Dụng trước!");
                return;
              }
              if (setActiveTab) setActiveTab('quiz');
            }}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
              activeTab === 'quiz'
                ? 'bg-purple-950/40 border-purple-500 shadow-md shadow-purple-950/50'
                : draftQuiz
                ? 'bg-quiz-dark/80 border-emerald-500/40 hover:border-emerald-500/80'
                : canGenerateQuiz
                ? 'bg-quiz-dark/50 border-purple-500/30 hover:border-purple-500/60'
                : 'bg-quiz-dark/30 border-quiz-border opacity-60 cursor-not-allowed'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
              draftQuiz 
                ? 'bg-emerald-500 text-white' 
                : activeTab === 'quiz'
                ? 'bg-purple-600 text-white'
                : canGenerateQuiz
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-slate-800 text-slate-500'
            }`}>
              {draftQuiz ? <CheckCircle2 className="w-5 h-5" /> : '3'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <span>3. AI Sinh Đề & Kiểm Duyệt</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {draftQuiz ? `✓ ${draftQuiz.total_questions} câu hỏi đã sinh` : canGenerateQuiz ? '✨ Đủ điều kiện sinh đề' : 'Khóa (Cần xong Bước 1 & 2)'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MENU 1: 1. TÀI LIỆU PDF → NỘI DUNG TRÍCH XUẤT                              */}
      {/* ========================================================================= */}
      {activeTab === 'upload' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Banner Menu 1 */}
          <div className="bg-gradient-to-r from-blue-950/70 via-quiz-panel to-quiz-dark border border-blue-500/30 rounded-3xl p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    MENU 1 TRÊN 4
                  </span>
                  <span className="text-xs text-slate-400">Nạp tài liệu & Trích xuất có căn cứ</span>
                </div>
                <h2 className="text-2xl font-black text-white font-display mt-2">
                  1. Tài liệu PDF → Nội dung trích xuất
                </h2>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Tài liệu PDF bài giảng được hệ thống bóc tách cấu trúc từng slide bằng Microsoft MarkItDown, neo mã trích dẫn nguồn và chuẩn bị dữ liệu cho AI Graph Engine.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleLoadSample}
                  disabled={isConverting}
                  className="btn-quiz-3d px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-purple-500/20"
                >
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Nạp tài liệu mẫu (15 slide)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Grid: Upload & Available Documents | Extracted Markdown Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Card: Available Documents in System + Upload New File */}
            <div className="lg:col-span-6 bg-quiz-panel border border-quiz-border rounded-3xl p-6 shadow-xl space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-quiz-border/60">
                <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Tài liệu bài giảng trong hệ thống</span>
                </h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono border ${
                  markdownData 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : selectedFile 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-quiz-dark text-slate-300 border-quiz-border'
                }`}>
                  {markdownData ? `${markdownData.total_slides} slides đã trích xuất` : selectedFile ? 'Đã nạp file' : 'Chưa nạp'}
                </span>
              </div>

              {/* KHỐI GẮN KẾT THÔNG TIN MÔN HỌC & BÀI TẬP SINH VIÊN */}
              <div className="p-4 rounded-2xl bg-quiz-dark/90 border border-purple-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Môn học gắn kết (Đồng bộ Sinh viên)
                    </span>
                  </div>
                  <span className="text-[10px] text-purple-300 bg-purple-900/40 px-2.5 py-0.5 rounded-full border border-purple-700/50 font-medium">
                    Tự động tạo bài tập
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Tên môn học:</label>
                    <input
                      type="text"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      placeholder="VD: Tư duy sản phẩm AI & Bài học thích ứng"
                      className="w-full px-3 py-2 rounded-xl bg-quiz-panel border border-quiz-border focus:border-purple-500 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Mã môn học:</label>
                    <input
                      type="text"
                      value={subjectCode}
                      onChange={(e) => setSubjectCode(e.target.value)}
                      placeholder="VD: PROD-K4"
                      className="w-full px-3 py-2 rounded-xl bg-quiz-panel border border-quiz-border focus:border-purple-500 text-xs font-mono text-purple-300 placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* KHỐI 1: TÀI LIỆU HIỆN HÀNH ĐANG SỬ DỤNG */}
              {selectedFile && (
                <div className="p-4 rounded-2xl bg-white dark:bg-purple-950/40 border-2 border-purple-400/80 dark:border-purple-500/60 space-y-3 shadow-md animate-fadeIn">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                        {isConverting ? (
                          <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-300 animate-spin" />
                        ) : (
                          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            isConverting
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                          }`}>
                            {isConverting ? 'Đang trích xuất...' : 'Đang sử dụng'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 font-bold">
                            {markdownData ? `${markdownData.total_slides} slides` : isConverting ? 'Đang đọc...' : ''}
                          </span>
                          {subjectCode && (
                            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-md border border-purple-300 dark:border-purple-700/50 truncate max-w-[140px]">
                              {subjectCode}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono font-extrabold text-slate-900 dark:text-white truncate mt-1" title={selectedFile.name}>
                          {selectedFile.name}
                        </div>
                        <div className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold mt-0.5 flex items-center gap-1.5 truncate">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span className="truncate">{subjectName}</span>
                        </div>
                      </div>
                    </div>

                    {!selectedFile.isPreloaded && (
                      <button
                        type="button"
                        onClick={handleRemoveSelectedFile}
                        disabled={isConverting}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition"
                        title="Xóa / Hủy file này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Thanh hiển thị tiến trình trích xuất */}
                  {isConverting && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-600 text-purple-800 dark:text-purple-200 text-xs font-bold animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-300 shrink-0" />
                      <span>Đang dùng MarkItDown bóc tách cấu trúc Slide & nội dung...</span>
                    </div>
                  )}

                  {/* Nút Submit nếu chưa convert */}
                  {!markdownData && !isConverting && (
                    <button
                      type="button"
                      onClick={() => handleUploadAndConvert(selectedFile)}
                      className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/25 hover:scale-[1.01] transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Bấm để trích xuất PDF sang Markdown</span>
                    </button>
                  )}
                </div>
              )}

              {/* KHỐI 2: DANH SÁCH TÀI LIỆU ĐÃ CÓ SẴN TRONG HỆ THỐNG */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-purple-400" />
                    <span>Tài liệu đã có trong hệ thống:</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Bấm để chọn và nạp ngay
                  </span>
                </div>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {availableDocuments && availableDocuments.length > 0 ? (
                    availableDocuments.map((doc) => {
                      const isCurrentActive = selectedFile && (
                        selectedFile.name === doc.file_name || 
                        selectedFile.name?.includes(doc.file_name) ||
                        (markdownData && markdownData.source_file === doc.file_name)
                      );

                      return (
                        <div
                          key={doc.file_name}
                          onClick={() => !isCurrentActive && handleSelectExistingDocument(doc)}
                          className={`p-3.5 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-3 ${
                            isCurrentActive
                              ? 'bg-purple-950/40 border-purple-500/70 shadow-sm cursor-default'
                              : 'bg-quiz-dark/80 hover:bg-quiz-dark border-quiz-border hover:border-purple-500/40 cursor-pointer group'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isCurrentActive 
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30' 
                                : 'bg-quiz-panel text-slate-300 group-hover:text-purple-300 border border-quiz-border'
                            }`}>
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold truncate ${
                                  isCurrentActive ? 'text-white font-extrabold' : 'text-slate-200'
                                }`}>
                                  {doc.title || doc.file_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                <span className="font-mono text-purple-300 font-semibold">{doc.total_slides} slide</span>
                                <span>•</span>
                                <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                                <span>•</span>
                                <span className="truncate max-w-[160px]">{doc.category}</span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isCurrentActive ? (
                              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Đang dùng</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectExistingDocument(doc);
                                }}
                                disabled={isConverting}
                                className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 text-[11px] font-bold transition flex items-center gap-1"
                              >
                                <span>Chọn nạp</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 rounded-xl bg-quiz-dark text-center text-xs text-slate-400">
                      Đang tải danh sách tài liệu...
                    </div>
                  )}
                </div>
              </div>

              {/* KHỐI 3: HOẶC TẢI LÊN FILE PDF MỚI TỪ MÁY */}
              <div className="pt-2 border-t border-quiz-border/60 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Hoặc nạp thêm file PDF mới từ máy tính:
                </span>

                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <input 
                      type="file" 
                      accept=".pdf,application/pdf" 
                      onChange={handleFileSelect} 
                      disabled={isUploadingFile || isConverting}
                      className="hidden" 
                    />
                    <div className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold text-center flex items-center justify-center space-x-2 transition ${
                      isUploadingFile
                        ? 'bg-purple-950/50 border-purple-500 text-purple-300'
                        : 'bg-quiz-dark hover:bg-quiz-card border-quiz-border hover:border-purple-500/50 text-slate-200 shadow-sm'
                    }`}>
                      {isUploadingFile ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                          <span>Đang nạp file...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-purple-400" />
                          <span>Chọn file PDF từ máy...</span>
                        </>
                      )}
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={handleLoadSample}
                    disabled={isUploadingFile || isConverting}
                    className="py-2.5 px-3.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center gap-1.5"
                    title="Nạp lại bộ slide mẫu chuẩn 15 trang"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                    <span>Slide mẫu</span>
                  </button>
                </div>
              </div>

              {/* BÁO LỖI: nếu file PDF là dạng ảnh quét (scanned) không copy được chữ */}
              {uploadError && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border-2 border-rose-500/60 text-xs space-y-2 animate-fadeIn shadow-lg shadow-rose-950/40">
                  <div className="flex items-start gap-2.5 font-black text-rose-300 text-sm">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div>Lỗi: Không thể trích xuất văn bản từ PDF</div>
                      <p className="text-xs font-normal text-rose-200 mt-1 leading-relaxed">
                        {uploadError}
                      </p>
                    </div>
                  </div>
                  <div className="pl-7 pt-1 text-[11px] text-rose-300/80 border-t border-rose-500/30">
                    💡 <strong>Cách xử lý:</strong> Hãy mở file PDF trên máy tính và thử dùng chuột bôi đen để copy một đoạn chữ. Nếu file không thể bôi đen chữ thì đó là file PDF dạng ảnh chụp/quét (scanned). Vui lòng dùng file PDF có chứa văn bản kỹ thuật số (text layer) hoặc nhấn <em>"Slide mẫu"</em> để kiểm thử.
                  </div>
                </div>
              )}

              {/* THÀNH CÔNG */}
              {uploadSuccessMsg && (
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}

              {/* Transcript Lời Giảng (Tùy chọn) */}
              <div className="pt-2 border-t border-quiz-border/60">
                <button
                  type="button"
                  onClick={() => setShowTranscriptInput(!showTranscriptInput)}
                  className="text-xs font-bold text-purple-300 hover:text-purple-200 flex items-center gap-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{showTranscriptInput ? 'Ẩn Transcript lời giảng' : '+ Thêm Transcript lời giảng (tùy chọn)'}</span>
                </button>
                {showTranscriptInput && (
                  <div className="mt-2.5 space-y-1.5">
                    <textarea
                      value={transcriptText}
                      onChange={(e) => setTranscriptText(e.target.value)}
                      rows={3}
                      placeholder="Dán bản ghi âm lời giảng hoặc ghi chú theo slide (VD: Slide 1: Thầy giới thiệu về tư duy người dùng...)"
                      className="w-full bg-quiz-dark border border-quiz-border rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-[10px] text-slate-400">
                      💡 Transcript sẽ được kết hợp đồng bộ vào từng slide Markdown để AI sinh câu hỏi bám sát cả tài liệu lẫn lời giảng trực tiếp.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Card: Extracted Markdown Preview (1B) */}
            <div className="lg:col-span-6 bg-quiz-panel border border-quiz-border rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-quiz-border/60">
                  <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Nội dung Markdown trích xuất (1B)</span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-purple-300 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                    {markdownData ? `${markdownData.total_slides} slides đã trích xuất` : '0 slides'}
                  </span>
                </div>

                <div className="mt-4 h-[420px] overflow-y-auto bg-quiz-dark p-3.5 rounded-2xl border border-quiz-border font-mono text-[11px] text-slate-300 leading-relaxed">
                  {isConverting ? (
                    <div className="h-full flex flex-col items-center justify-center py-16 text-center space-y-4 animate-fadeIn">
                      <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                        <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
                      </div>
                      <div className="space-y-2 max-w-sm">
                        <p className="font-extrabold text-sm text-purple-300">
                          Đang dùng Microsoft MarkItDown trích xuất...
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Hệ thống đang bóc tách nội dung từng slide, nhận diện cấu trúc và gán mã trích dẫn cho tệp tin: <strong className="text-white block mt-1">{selectedFile?.name || "file PDF"}</strong>
                        </p>
                      </div>
                    </div>
                  ) : markdownData && markdownData.slides && markdownData.slides.length > 0 ? (
                    <div>
                      {markdownData.slides.map((s) => (
                        <div key={s.page_number} className="mb-3 pb-3 border-b border-quiz-border/60 last:border-b-0">
                          <div className="flex items-center justify-between font-bold text-purple-300">
                            <span>Slide {s.page_number}: {s.title}</span>
                            <span className={s.is_advanced ? "text-rose-400 text-[10px] px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20" : "text-emerald-400 text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20"}>
                              {s.scope_label}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[10px] mt-1 line-clamp-3">{s.content}</p>
                          {s.transcript && (
                            <p className="text-amber-300/90 text-[10px] mt-1 italic line-clamp-1">
                              🎙️ Transcript: {s.transcript}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 italic py-12 text-center">
                      <FileText className="w-10 h-10 mb-2 opacity-40 text-purple-400 animate-pulse" />
                      <p className="font-medium">Chưa có nội dung trích xuất. Vui lòng nạp file PDF hoặc chọn tài liệu mẫu bên trái.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 1 Completion Navigation Footer */}
              <div className="mt-5 pt-4 border-t border-quiz-border/60 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  {markdownData ? `✓ Đã sẵn sàng: ${markdownData.total_slides} slides bài giảng` : '• Đang nạp tài liệu bài giảng'}
                </div>
                <button
                  onClick={() => {
                    SoundEffects.click();
                    if (setActiveTab) setActiveTab('notes');
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02]"
                >
                  <span>Tiếp tục: Sang Menu 2 (Ghi Chú & Chỉ Lệnh)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU 2: 2. GHI CHÚ & CHỈ LỆNH BÀI DẠY (3 Ô)                               */}
      {/* ========================================================================= */}
      {activeTab === 'notes' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Banner Menu 2 */}
          <div className="bg-gradient-to-r from-amber-950/70 via-quiz-panel to-quiz-dark border border-amber-500/40 rounded-3xl p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    MENU 2 TRÊN 4 · ĐIỀU KIỆN TIÊN QUYẾT
                  </span>
                  <span className="text-xs text-slate-400">Thiết lập ranh giới bài dạy</span>
                </div>
                <h2 className="text-2xl font-black text-white font-display mt-2">
                  2. Ghi Chú & Chỉ Lệnh Bài Dạy (3 Ô)
                </h2>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Giảng viên điền 3 ô chỉ lệnh dưới đây để ra lệnh trực tiếp cho <strong>AI.Graph Engine</strong> bám sát phạm vi, kiến thức trọng tâm và quy mô câu hỏi. Đây là điều kiện tiên quyết bắt buộc trước khi AI sinh đề thi.
                </p>
              </div>

              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                constraintApplied 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              }`}>
                {constraintApplied ? '✓ ĐÃ ĐẠT TIÊN QUYẾT' : '🔒 ĐIỀU KIỆN TIÊN QUYẾT'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left / Main: 3 Input Boxes */}
            <div className="lg:col-span-7 bg-quiz-panel border border-quiz-border rounded-3xl p-6 shadow-xl space-y-5">
              <h3 className="font-extrabold text-white text-base flex items-center space-x-2 pb-3 border-b border-quiz-border/60">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>3 Ô Chỉ Lệnh Bài Dạy Trực Tiếp</span>
              </h3>

              {/* Ô 1: Nội dung đã học đến đâu */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span>📍 Ô 1: Nội dung đã học đến đâu (Phạm vi bài dạy)</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {['Slide 1 - 10', 'Slide 1 - 5', 'Slide 1 - 15'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setScopeNote(chip)}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-quiz-dark hover:bg-purple-950 text-slate-300 hover:text-purple-200 border border-quiz-border transition"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={scopeNote}
                  onChange={(e) => setScopeNote(e.target.value)}
                  placeholder="VD: Mới dạy xong Slide 1 - 10 (hoặc: Chương 1 đến Chương 3)"
                  className="w-full bg-quiz-dark border border-quiz-border rounded-2xl px-4 py-3 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500 transition"
                />
                <p className="text-[10px] text-slate-500">
                  AI sẽ thiết lập ranh giới cứng: Chỉ cho phép các slide trong khoảng này và chặn triệt để mọi slide vượt trang.
                </p>
              </div>

              {/* Ô 2: Cần lưu ý và nhấn mạnh ở đâu */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span>🎯 Ô 2: Cần lưu ý và nhấn mạnh ở đâu (Trọng tâm sư phạm)</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {['Ưu tiên JTBD', 'Tình huống thực tế', 'Không lý thuyết suông'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setEmphasisNote(prev => prev ? `${prev}, ${chip}` : chip)}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-quiz-dark hover:bg-amber-950 text-slate-300 hover:text-amber-200 border border-quiz-border transition"
                      >
                        +{chip}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={emphasisNote}
                  onChange={(e) => setEmphasisNote(e.target.value)}
                  placeholder="VD: Cần lưu ý nhấn mạnh vào phương pháp JTBD (Jobs-to-be-done) và nỗi đau thực tế của khách hàng. Tránh hỏi lý thuyết suông, đổi sang tình huống kinh doanh thuần Việt gần gũi..."
                  className="w-full bg-quiz-dark border border-quiz-border rounded-2xl p-3.5 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-amber-500 transition"
                />
                <p className="text-[10px] text-slate-500">
                  Chỉ lệnh này hướng dẫn AI tập trung câu hỏi vào các khái niệm cốt lõi theo ý đồ của người dạy.
                </p>
              </div>

              {/* Ô 3: Từ đề bài này sinh ra tối đa bao nhiêu câu hỏi */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span>🔢 Ô 3: Sinh ra tối đa bao nhiêu câu hỏi từ đề bài này?</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[5, 10, 15].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setMaxQuestions(num)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border transition ${
                          maxQuestions === num
                            ? 'bg-amber-500 text-slate-900 border-amber-400 font-extrabold'
                            : 'bg-quiz-dark hover:bg-quiz-card text-slate-300 border-quiz-border'
                        }`}
                      >
                        {num} câu
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={maxQuestions}
                    onChange={(e) => setMaxQuestions(Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)))}
                    className="w-28 bg-quiz-dark border border-quiz-border rounded-2xl px-4 py-2.5 text-sm text-white font-bold font-mono focus:outline-none focus:border-amber-500 text-center"
                  />
                  <span className="text-xs text-slate-400 font-medium">
                    câu hỏi trắc nghiệm tình huống đời thường (Tối đa 20 câu)
                  </span>
                </div>
              </div>

              {/* Nút Áp Dụng Ràng Buộc */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApplyConstraints}
                  disabled={!scopeNote.trim()}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01]"
                >
                  <Lock className="w-4 h-4" />
                  <span>Áp Dụng 3 Chỉ Lệnh & Khóa Ranh Giới Bài Dạy</span>
                </button>
              </div>
            </div>

            {/* Right: Ranh giới Summary Card */}
            <div className="lg:col-span-5 bg-quiz-panel border border-quiz-border rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-quiz-border/60">
                  <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                    <span>Tóm tắt ranh giới sư phạm</span>
                  </h3>
                  <span className="text-xs font-mono text-amber-300">
                    {constraintApplied ? 'Đã khóa' : 'Chưa khóa'}
                  </span>
                </div>

                <div className="p-4 bg-quiz-dark rounded-2xl border border-quiz-border text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Phạm vi bài dạy (Ô 1):</span>
                    <span className="font-bold text-emerald-400">
                      {scopeSummary?.constraints?.min_slide != null && scopeSummary?.constraints?.max_slide != null
                        ? `Slide ${scopeSummary.constraints.min_slide}–${scopeSummary.constraints.max_slide}${scopeSummary.in_scope_count != null ? ` · ${scopeSummary.in_scope_count} khái niệm` : ''}`
                        : 'Chưa xác định (Cần nhập Ô 1)'}
                    </span>
                  </div>

                  {scopeSummary?.emphasis_note && (
                    <div className="flex items-start justify-between gap-2 border-t border-quiz-border/60 pt-2">
                      <span className="text-slate-400 shrink-0">Nhấn mạnh (Ô 2):</span>
                      <span className="text-amber-300 font-medium text-right text-[11px] line-clamp-2" title={scopeSummary.emphasis_note}>
                        {scopeSummary.emphasis_note}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-quiz-border/60 pt-2">
                    <span className="text-slate-400">Quy mô câu hỏi (Ô 3):</span>
                    <span className="font-bold text-purple-300">
                      {scopeSummary?.max_questions ? `Tối đa ${scopeSummary.max_questions} câu hỏi` : `Tối đa ${maxQuestions} câu hỏi`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-quiz-border/60 pt-2">
                    <span className="text-slate-400">Nội dung bị chặn (Vượt trang):</span>
                    <span className="font-bold text-rose-400">
                      {scopeSummary?.blocked_count != null
                        ? `${scopeSummary.blocked_count} khái niệm bị chặn`
                        : 'Chờ áp dụng chỉ lệnh'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 pt-2 border-t border-quiz-border font-mono">
                    🛡️ Ràng buộc nội dung: AI đối chiếu và chặn tuyệt đối câu hỏi vượt ngoài phạm vi bài dạy.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200">
                  <div className="font-bold mb-1">💡 Nguyên tắc chốt chặn sư phạm:</div>
                  <div className="text-[11px] text-slate-300 leading-relaxed">
                    Sau khi bấm <strong>"Áp Dụng 3 Chỉ Lệnh"</strong>, ranh giới sẽ được gửi tới Backend FastAPI và khóa cứng bộ lọc. AI ở Menu 3 sẽ chỉ được phép lấy kiến thức trong phạm vi này.
                  </div>
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="pt-4 border-t border-quiz-border/60 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    SoundEffects.click();
                    if (setActiveTab) setActiveTab('upload');
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-quiz-dark hover:bg-quiz-card border border-quiz-border text-slate-300 font-bold text-xs flex items-center gap-2 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại Menu 1</span>
                </button>

                <button
                  onClick={() => {
                    SoundEffects.click();
                    if (!constraintApplied && !scopeSummary) {
                      alert("Vui lòng bấm 'Áp Dụng 3 Chỉ Lệnh & Khóa Ranh Giới Bài Dạy' trước khi tiếp tục sang Menu 3!");
                      return;
                    }
                    if (setActiveTab) setActiveTab('quiz');
                  }}
                  className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all ${
                    (constraintApplied || scopeSummary)
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25 hover:scale-[1.02]'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                  }`}
                >
                  <span>Tiếp tục: Sang Menu 3 (Sinh câu hỏi & Duyệt)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU 3: 3. SINH CÂU HỎI VÀ GIẢNG VIÊN KIỂM DUYỆT                          */}
      {/* ========================================================================= */}
      {activeTab === 'quiz' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Banner Menu 3 */}
          <div className="bg-gradient-to-r from-purple-950 via-quiz-panel to-quiz-dark border border-quiz-border rounded-3xl p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    MENU 3 TRÊN 4 · AI GRAPH & HUMAN-IN-THE-LOOP
                  </span>
                  <span className="text-xs text-slate-400">Kiểm duyệt chất lượng đề thi</span>
                </div>
                <h2 className="text-2xl font-black text-white font-display mt-2">
                  3. Sinh câu hỏi và Giảng viên kiểm duyệt
                </h2>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Chỉ khi đã có đầy đủ tài liệu bài giảng ở <strong>Bước 1</strong> và 3 ô chỉ lệnh bài dạy ở <strong>Bước 2</strong>, hệ thống AI mới được mở khóa để sinh câu hỏi bám sát 100% tài liệu thật.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`text-xs px-3.5 py-1.5 rounded-full font-bold border ${
                  canGenerateQuiz 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                }`}>
                  {canGenerateQuiz ? '✓ ĐÃ ĐỦ ĐIỀU KIỆN SINH ĐỀ' : '🔒 CHỜ HOÀN THÀNH BƯỚC 1 & 2'}
                </span>
              </div>
            </div>
          </div>

          {/* Loading indicator card */}
          {loading && (
            <div className="p-6 rounded-3xl bg-purple-950/60 border-2 border-purple-500/60 flex items-center gap-4 animate-pulse shadow-2xl shadow-purple-950/60">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500 flex items-center justify-center text-purple-300 shrink-0">
                <Sparkles className="w-6 h-6 animate-spin text-amber-300" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Google Gemini LLM Đang Sinh Câu Hỏi Thật...</h4>
                <p className="text-xs text-purple-200 mt-1">
                  Đang đối chiếu tài liệu Slide bài giảng với 3 chỉ lệnh bài dạy (Phạm vi: {scopeNote}, Trọng tâm: {emphasisNote}, Số câu: {maxQuestions}) để sinh câu hỏi tình huống đời thường thuần Việt kèm trích dẫn [DEMO-NNN]. Vui lòng đợi trong giây lát...
                </p>
              </div>
            </div>
          )}

          {/* KIỂM TRA ĐIỀU KIỆN TIÊN QUYẾT: CHƯA ĐẦY ĐỦ -> KHÓA VÀ HIỂN THỊ CHECKLIST */}
          {!canGenerateQuiz ? (
            <div className="p-6 rounded-3xl bg-amber-950/40 border-2 border-amber-500/60 shadow-xl space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    ⚠️ Cần Hoàn Thành Đầy Đủ Từng Bước Trước Khi Sinh Câu Hỏi
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Hệ thống yêu cầu có căn cứ dữ liệu thật từ Slide bài giảng và 3 ô chỉ lệnh bài dạy của Giảng viên trước khi cho phép AI sinh đề:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {/* Điều kiện 1 */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  hasDoc ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-quiz-dark border-amber-500/40'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      hasDoc ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'
                    }`}>
                      {hasDoc ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Bước 1: Tài liệu PDF bài giảng</div>
                      <div className="text-[11px] text-slate-400">
                        {hasDoc ? `✓ Đã nạp (${markdownData.total_slides} slides)` : '❌ Chưa nạp tài liệu'}
                      </div>
                    </div>
                  </div>
                  {!hasDoc && (
                    <button
                      onClick={() => {
                        SoundEffects.click();
                        if (setActiveTab) setActiveTab('upload');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shrink-0"
                    >
                      Sang Bước 1
                    </button>
                  )}
                </div>

                {/* Điều kiện 2 */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  hasNotes ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-quiz-dark border-amber-500/40'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      hasNotes ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'
                    }`}>
                      {hasNotes ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Bước 2: Ghi chú & 3 chỉ lệnh bài dạy</div>
                      <div className="text-[11px] text-slate-400">
                        {hasNotes ? '✓ Đã khóa ranh giới bài dạy' : '❌ Chưa nhập & áp dụng 3 ô'}
                      </div>
                    </div>
                  </div>
                  {!hasNotes && (
                    <button
                      onClick={() => {
                        SoundEffects.click();
                        if (setActiveTab) setActiveTab('notes');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shrink-0"
                    >
                      Sang Bước 2
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* KHI ĐÃ ĐẦY ĐỦ TẤT CẢ CÁC BƯỚC -> HIỂN THỊ BẢNG NGHIỆM THU VÀ NÚT SINH CÂU HỎI */
            <div className="p-6 rounded-3xl bg-emerald-950/30 border-2 border-emerald-500/50 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ✓ ĐÃ ĐẦY ĐỦ TẤT CẢ CÁC BƯỚC
                    </span>
                    <span className="text-xs text-slate-400">Sẵn sàng để Google Gemini sinh câu hỏi</span>
                  </div>
                  <h4 className="text-lg font-extrabold text-white">
                    Thông Tin Chỉ Lệnh Đã Sẵn Sàng Cho AI Gemini
                  </h4>
                </div>

                <button
                  onClick={handleGenerateQuiz}
                  disabled={loading}
                  className={`btn-quiz-3d px-7 py-4 rounded-2xl font-black text-xs sm:text-sm flex items-center space-x-2.5 shadow-2xl transition-all ${
                    loading 
                      ? 'bg-purple-800 text-purple-200 cursor-wait animate-pulse'
                      : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/40 hover:scale-[1.02]'
                  }`}
                >
                  <Sparkles className={`w-5 h-5 text-amber-300 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'AI Gemini đang sinh câu hỏi thật từ Slide...' : '✨ BẮT ĐẦU CHO AI GEMINI SINH BỘ ĐỀ THẬT'}</span>
                </button>
              </div>

              {/* Tóm tắt 4 thành tố đã kiểm duyệt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
                <div className="p-3 bg-quiz-dark/80 rounded-xl border border-quiz-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">📄 Tài liệu bài giảng:</span>
                  <span className="text-white font-bold truncate block mt-0.5">{markdownData?.file_name || selectedFile?.name || 'Tài liệu PDF'}</span>
                  <span className="text-emerald-400 text-[10px]">{markdownData?.total_slides || 0} slides bài giảng</span>
                </div>
                <div className="p-3 bg-quiz-dark/80 rounded-xl border border-quiz-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">📍 Ô 1 - Phạm vi bài dạy:</span>
                  <span className="text-amber-300 font-bold truncate block mt-0.5">{scopeNote || 'Slide 1 - 10'}</span>
                  <span className="text-slate-400 text-[10px]">Đã khóa ranh giới cứng</span>
                </div>
                <div className="p-3 bg-quiz-dark/80 rounded-xl border border-quiz-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">🎯 Ô 2 - Lưu ý & Nhấn mạnh:</span>
                  <span className="text-amber-300 font-medium line-clamp-1 block mt-0.5" title={emphasisNote}>{emphasisNote || 'Tình huống thực tế'}</span>
                  <span className="text-slate-400 text-[10px]">Tập trung tình huống đời thường</span>
                </div>
                <div className="p-3 bg-quiz-dark/80 rounded-xl border border-quiz-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">🔢 Ô 3 - Quy mô câu hỏi:</span>
                  <span className="text-purple-300 font-bold block mt-0.5">Tối đa {maxQuestions} câu hỏi</span>
                  <span className="text-slate-400 text-[10px]">Trắc nghiệm tình huống thuần Việt</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Quiz & Human-in-the-loop Container */}
          <div className="bg-quiz-panel border border-quiz-border rounded-3xl p-6 shadow-xl space-y-6">
            
            {/* Header: Total questions & Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-quiz-border">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Bản thảo câu hỏi kiểm tra (Human-in-the-loop review)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mỗi câu hỏi đều do Google Gemini sinh trực tiếp, gắn trích dẫn DEMO-NNN và Slide Trang X để đảm bảo nguồn sự thật 100%.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-extrabold border border-purple-500/30 text-xs font-mono">
                  {draftQuiz ? `✓ ${draftQuiz.total_questions} Câu Hỏi Thật từ AI Gemini` : 'Chờ sinh đề'}
                </span>
              </div>
            </div>

            {/* Questions Container */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {draftQuiz ? (
                draftQuiz.questions.map((q, idx) => (
                  <div key={q.id} className="bg-quiz-dark border border-quiz-border rounded-2xl p-4 space-y-3 hover:border-purple-500/50 transition">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-purple-400 font-display text-sm">Câu {idx + 1} ({q.id})</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStartEdit(q)}
                          className="p-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 transition text-[11px] flex items-center gap-1 px-2.5 py-1 font-semibold"
                          title="Chỉnh sửa câu hỏi"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Sửa câu này</span>
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition text-[11px] flex items-center gap-1 px-2.5 py-1 font-semibold"
                          title="Xóa câu hỏi này"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Xóa</span>
                        </button>
                        <span className="px-2.5 py-1 rounded-lg bg-quiz-panel text-purple-300 border border-purple-500/30 font-mono text-[10px]">
                          📍 {q.provenance}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs sm:text-sm font-bold text-slate-200 leading-relaxed">{q.question}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = (optIdx === q.correct_index);
                        return (
                          <div 
                            key={optIdx} 
                            className={`p-2.5 rounded-xl border flex items-start space-x-2 ${
                              isCorrect 
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/60 font-semibold' 
                                : 'bg-quiz-panel text-slate-400 border-quiz-border'
                            }`}
                          >
                            <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                            <span className="flex-1">{opt}</span>
                            {isCorrect && <span className="font-bold text-emerald-400">✓ Đúng</span>}
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-[11px] text-slate-400 italic pt-2 border-t border-quiz-border">
                      <strong>Căn cứ trích dẫn:</strong> {q.explanation}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-slate-500">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="text-sm font-bold text-slate-300">Chưa có bản thảo Quiz nào.</p>
                  <p className="text-xs mt-1 text-slate-500">
                    Bấm "AI Sinh Quiz Có Căn Cứ" ở phía trên để tự động tạo đề thi theo đúng 3 chỉ lệnh bài dạy.
                  </p>
                </div>
              )}
            </div>

            {/* Modal chỉnh sửa câu hỏi */}
            {editingQuestion && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                <div className="bg-quiz-panel border border-quiz-border rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-quiz-border pb-3">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-purple-400" />
                      <span>Chỉnh sửa câu hỏi ({editingQuestion.id})</span>
                    </h4>
                    <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Nội dung câu hỏi tình huống:</label>
                      <textarea
                        value={editingQuestion.question}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                        rows={3}
                        className="w-full bg-quiz-dark border border-quiz-border rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">4 Phương án đáp án (Tích chọn đáp án đúng):</label>
                      <div className="space-y-2">
                        {editingQuestion.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="editCorrect"
                              checked={editingQuestion.correct_index === oIdx}
                              onChange={() => setEditingQuestion({ ...editingQuestion, correct_index: oIdx })}
                              className="text-purple-600"
                            />
                            <span className="font-bold text-purple-300 w-4">{String.fromCharCode(65 + oIdx)}.</span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...editingQuestion.options];
                                newOpts[oIdx] = e.target.value;
                                setEditingQuestion({ ...editingQuestion, options: newOpts });
                              }}
                              className="flex-1 bg-quiz-dark border border-quiz-border rounded-lg p-2 text-white text-xs focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-quiz-border">
                    <button
                      onClick={() => setEditingQuestion(null)}
                      className="px-4 py-2 rounded-xl bg-quiz-dark text-slate-300 text-xs font-bold hover:bg-quiz-card"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-extrabold hover:bg-purple-500 flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu thay đổi</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Human-in-the-loop Bar */}
            <div className="mt-5 pt-4 border-t border-quiz-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedHuman}
                  onChange={(e) => setVerifiedHuman(e.target.checked)}
                  className="w-4 h-4 rounded bg-quiz-dark border-quiz-border text-purple-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300">
                  Tôi xác nhận <strong>100% câu hỏi bám sát bài dạy</strong> và <strong>đầy đủ trích dẫn nguồn</strong>.
                </span>
              </label>

              <button
                onClick={handlePublishQuiz}
                className="btn-quiz-3d w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/40"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Duyệt & Phát Hành Quiz Cho Học Viên</span>
              </button>
            </div>

            {/* BANNER THÀNH CÔNG NỔI BẬT: ĐÃ PHÁT HÀNH THÀNH CÔNG */}
            {publishSuccessInfo && (
              <div className="mt-5 p-5 rounded-2xl bg-emerald-950/50 border-2 border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn shadow-xl shadow-emerald-950/50">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>Đề thi đã được duyệt & phát hành thành công cho học viên!</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        PUBLISHED
                      </span>
                    </div>
                    <p className="text-xs text-emerald-300/80 mt-0.5">
                      Đề thi đã sẵn sàng trên Cổng Học viên. Giảng viên có thể mở làm thử hoặc xem danh sách tại Menu 4.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  {setActiveTab && (
                    <button
                      onClick={() => setActiveTab('manage')}
                      className="px-4 py-2.5 rounded-xl bg-quiz-dark hover:bg-quiz-card border border-quiz-border text-slate-300 text-xs font-bold transition"
                    >
                      <span>Quản lý ở Menu 4</span>
                    </button>
                  )}
                  {onNavigateStudentQuiz && (
                    <button
                      onClick={onNavigateStudentQuiz}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition hover:scale-[1.02]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>Làm thử bài thi SV ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* DASHED LINE FEEDBACK: Mistake Analytics to Lecturer */}
          <div className="border-2 border-dashed border-purple-500/40 bg-gradient-to-br from-purple-950/40 via-quiz-panel to-quiz-dark rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ĐƯỜNG NÉT ĐỨT (FEEDBACK LOOP)
                    </span>
                    <span className="text-xs text-slate-400">Kết nối từ Giai đoạn 2 (Nhánh "Có câu làm sai")</span>
                  </div>
                  <h3 className="text-lg font-black text-white font-display mt-1">
                    Báo danh sách các phần bị làm sai nhiều nhất (Xếp từ cao xuống thấp)
                  </h3>
                </div>
              </div>

              <button
                onClick={fetchMistakeAnalytics}
                disabled={loadingAnalytics}
                className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-quiz-card hover:bg-quiz-border border border-quiz-border text-slate-200 text-xs font-bold flex items-center space-x-2 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAnalytics ? 'animate-spin' : ''}`} />
                <span>Làm Mới Số Liệu</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              📡 <strong>Căn cứ theo sơ đồ luồng:</strong> Khi học viên làm bài ở Khối 5 $\rightarrow$ đi vào <em>"Phân loại kết quả bài làm"</em> $\rightarrow$ rơi vào nhánh <em>"CÓ CÂU LÀM SAI"</em>, hệ thống tự động tổng hợp dữ liệu qua khối <em>"Thống kê các câu/concept bị sai nhiều nhất"</em> và truyền theo <strong>đường nét đứt</strong> báo ngược về đây để Giảng viên nắm bắt lỗ hổng kiến thức thực tế của lớp học.
            </p>

            {mistakeAnalytics && mistakeAnalytics.ranked_mistakes && mistakeAnalytics.ranked_mistakes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {mistakeAnalytics.ranked_mistakes.map((item) => (
                  <div
                    key={item.question_code}
                    className="bg-quiz-dark/90 border border-quiz-border rounded-2xl p-3.5 flex items-center justify-between hover:border-purple-500/40 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        item.rank === 1 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                          : item.rank === 2
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        #{item.rank}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs sm:text-sm">{item.concept}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-quiz-panel text-slate-400 border border-quiz-border">
                            {item.question_code}
                          </span>
                        </div>
                        <p className="text-[11px] text-purple-300 font-mono mt-0.5">
                          📍 {item.provenance}
                        </p>
                      </div>
                    </div>

                    <div className="text-right pl-3">
                      <span className={`text-xs font-black ${item.fail_rate > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {item.fail_rate}%
                      </span>
                      <p className="text-[10px] text-slate-500">
                        {item.fail_count} lần sai
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                Chưa có dữ liệu bài làm. Học viên nộp bài sẽ tự động cập nhật báo cáo tại đây.
              </div>
            )}
          </div>

          {/* Navigation Footer for Menu 3 */}
          <div className="pt-4 border-t border-quiz-border/60 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                SoundEffects.click();
                if (setActiveTab) setActiveTab('notes');
              }}
              className="px-4 py-2.5 rounded-2xl bg-quiz-dark hover:bg-quiz-card border border-quiz-border text-slate-300 font-bold text-xs flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Menu 2 (Ghi Chú & Chỉ Lệnh)</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  SoundEffects.click();
                  if (setActiveTab) setActiveTab('manage');
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-500/25 transition hover:scale-[1.02]"
              >
                <span>Sang Menu 4 (Quản lý các bài đã duyệt)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MENU 4: 4. QUẢN LÝ CÁC BÀI ĐÁNH GIÁ ĐÃ DUYỆT                              */}
      {/* ========================================================================= */}
      {activeTab === 'manage' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Banner Menu 4 */}
          <div className="bg-gradient-to-r from-indigo-950 via-quiz-panel to-quiz-dark border border-indigo-500/40 rounded-3xl p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    MENU 4 TRÊN 4 · QUẢN LÝ BÀI ĐÁNH GIÁ ĐÃ DUYỆT
                  </span>
                  <span className="text-xs text-slate-400">Toàn quyền quản trị đề thi</span>
                </div>
                <h2 className="text-2xl font-black text-white font-display mt-2">
                  4. Quản lý các bài đánh giá đã sinh & đã duyệt
                </h2>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Quản lý tập trung toàn bộ các bộ đề thi đã được AI sinh ra và được giảng viên kiểm duyệt. Bạn có thể xem chi tiết, thêm mới, sửa câu hỏi, xóa đề và <strong>Bật / Hủy quyền làm bài của sinh viên</strong>.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    SoundEffects.click();
                    setShowCreateQuizModal(true);
                  }}
                  className="btn-quiz-3d px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-indigo-500/30 transition hover:scale-[1.02]"
                >
                  <PlusCircle className="w-4 h-4 text-indigo-200" />
                  <span>+ Thêm Bộ Đề Thi Mới</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-quiz-panel border border-quiz-border flex items-center gap-3.5 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 font-black text-lg">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Tổng số bộ đề thi</div>
                <div className="text-xl font-black text-white">{quizzesList.length} đề thi</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-quiz-panel border border-emerald-500/30 flex items-center gap-3.5 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 font-black text-lg">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-emerald-300 font-medium">Đang mở cho SV làm bài</div>
                <div className="text-xl font-black text-emerald-400">
                  {quizzesList.filter(q => q.status === 'PUBLISHED').length} đề thi
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-quiz-panel border border-rose-500/30 flex items-center gap-3.5 shadow-md">
              <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 font-black text-lg">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-rose-300 font-medium">Đã khóa / Hủy quyền làm SV</div>
                <div className="text-xl font-black text-rose-400">
                  {quizzesList.filter(q => q.status !== 'PUBLISHED').length} đề thi
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Layout: Quizzes List | Quiz Questions Details & Edit */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Quizzes List (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-quiz-panel border border-quiz-border rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-quiz-border/60">
                  <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span>Danh sách các bài thi trong hệ thống</span>
                  </h3>
                  <button
                    onClick={fetchQuizzesList}
                    disabled={loadingQuizzes}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-quiz-dark transition"
                    title="Làm mới danh sách"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingQuizzes ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="mt-3 space-y-3 max-h-[560px] overflow-y-auto pr-1">
                  {quizzesList && quizzesList.length > 0 ? (
                    quizzesList.map((q) => {
                      const isSelected = selectedQuiz && selectedQuiz.id === q.id;
                      const isPublished = q.status === 'PUBLISHED';

                      return (
                        <div
                          key={q.id}
                          onClick={() => fetchQuizDetail(q.id)}
                          className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer space-y-3 ${
                            isSelected
                              ? 'bg-indigo-950/40 border-indigo-500/70 shadow-md ring-1 ring-indigo-500/40'
                              : 'bg-quiz-dark/80 hover:bg-quiz-dark border-quiz-border hover:border-purple-500/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                                  isPublished
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : q.status === 'DISABLED'
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                }`}>
                                  {isPublished ? '● Đang mở cho SV làm' : q.status === 'DISABLED' ? '■ Đã hủy quyền làm' : '▲ Bản thảo'}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 font-bold">
                                  {q.total_questions} câu
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-white mt-1.5 line-clamp-2 leading-snug">
                                {q.title}
                              </h4>
                              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 font-mono">
                                <span>Tạo: {q.created_at || 'Mới'}</span>
                                {q.published_at && (
                                  <>
                                    <span>•</span>
                                    <span className="text-emerald-400">Duyệt: {q.published_at}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingQuizTitleModal({ id: q.id, title: q.title });
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-quiz-panel transition shrink-0"
                              title="Đổi tên bộ đề thi này"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Action Buttons Row */}
                          <div className="flex items-center justify-between pt-2 border-t border-quiz-border/60 gap-2">
                            {/* Nút Toggle Cho phép / Hủy quyền làm bài của SV */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStudentAccess(q);
                              }}
                              className={`flex-1 py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition border shadow-xs ${
                                isPublished
                                  ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-500/40'
                                  : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40'
                              }`}
                              title={isPublished ? "Hủy quyền: Học viên sẽ không được vào làm bài này" : "Mở quyền: Cho phép học viên vào làm bài"}
                            >
                              {isPublished ? (
                                <>
                                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Hủy quyền làm SV</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Mở cho SV làm</span>
                                </>
                              )}
                            </button>

                            {/* Nút Xem câu hỏi */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchQuizDetail(q.id);
                              }}
                              className={`py-1.5 px-3 rounded-xl text-[11px] font-bold border transition ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-500 font-extrabold'
                                  : 'bg-quiz-panel hover:bg-quiz-card text-slate-300 border-quiz-border'
                              }`}
                            >
                              <span>Xem câu hỏi</span>
                            </button>

                            {/* Nút Làm thử bài thi ở Giao diện Học viên */}
                            {isPublished && onNavigateStudentQuiz && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateStudentQuiz(q.id);
                                }}
                                className="py-1.5 px-2.5 rounded-xl text-[11px] font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1 shadow-xs transition"
                                title="Vào làm bài thi này ở giao diện Học viên"
                              >
                                <Sparkles className="w-3 h-3 text-amber-200" />
                                <span>Làm thi</span>
                              </button>
                            )}

                            {/* Nút Xóa đề */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuiz(q);
                              }}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/20 border border-transparent hover:border-rose-500/30 transition"
                              title="Xóa vĩnh viễn bộ đề thi này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Chưa có bộ đề thi nào. Bấm "+ Thêm Bộ Đề Thi Mới" ở trên để tạo.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Questions of Selected Quiz (lg:col-span-7) */}
            <div className="lg:col-span-7 bg-quiz-panel border border-quiz-border rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                {selectedQuiz ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-quiz-border/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                            selectedQuiz.status === 'PUBLISHED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}>
                            {selectedQuiz.status === 'PUBLISHED' ? 'Đang mở cho SV làm' : 'Đã khóa quyền làm'}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {selectedQuiz.total_questions} câu hỏi
                          </span>
                        </div>
                        <h3 className="font-extrabold text-white text-base mt-1 line-clamp-1">
                          {selectedQuiz.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleOpenAddQuestion}
                          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition hover:scale-[1.02]"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Thêm câu hỏi mới</span>
                        </button>
                      </div>
                    </div>

                    {/* Questions List */}
                    <div className="mt-4 space-y-3.5 max-h-[500px] overflow-y-auto pr-2">
                      {selectedQuiz.questions && selectedQuiz.questions.length > 0 ? (
                        selectedQuiz.questions.map((q, idx) => (
                          <div key={q.id || idx} className="bg-quiz-dark border border-quiz-border rounded-2xl p-4 space-y-2.5 hover:border-purple-500/40 transition">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-black text-purple-400 font-display">
                                Câu {idx + 1} ({q.id})
                              </span>
                              
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleOpenEditQuestion(q)}
                                  className="p-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 transition text-[11px] flex items-center gap-1 px-2.5 py-1 font-semibold"
                                  title="Chỉnh sửa câu hỏi"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Sửa</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteQuestionFromQuiz(q.id)}
                                  className="p-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition text-[11px] flex items-center gap-1 px-2.5 py-1 font-semibold"
                                  title="Xóa câu hỏi này"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Xóa</span>
                                </button>

                                <span className="px-2 py-0.5 rounded-lg bg-quiz-panel text-purple-300 border border-purple-500/30 font-mono text-[10px]">
                                  📍 {q.provenance}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs sm:text-sm font-bold text-slate-200 leading-relaxed">
                              {q.question}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                              {q.options && q.options.map((opt, optIdx) => {
                                const isCorrect = (optIdx === q.correct_index);
                                return (
                                  <div 
                                    key={optIdx} 
                                    className={`p-2.5 rounded-xl border flex items-start space-x-2 ${
                                      isCorrect 
                                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/60 font-semibold' 
                                        : 'bg-quiz-panel text-slate-400 border-quiz-border'
                                    }`}
                                  >
                                    <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                                    <span className="flex-1">{opt}</span>
                                    {isCorrect && <span className="font-bold text-emerald-400">✓ Đúng</span>}
                                  </div>
                                );
                              })}
                            </div>

                            {q.explanation && (
                              <p className="text-[11px] text-slate-400 italic pt-1.5 border-t border-quiz-border">
                                <strong>Căn cứ trích dẫn:</strong> {q.explanation}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-16 text-center text-slate-500 space-y-2">
                          <p className="text-3xl">📝</p>
                          <p className="font-bold text-sm text-slate-300">Bộ đề này chưa có câu hỏi nào.</p>
                          <button
                            onClick={handleOpenAddQuestion}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
                          >
                            + Thêm câu hỏi đầu tiên
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-24 text-center text-slate-500 space-y-3">
                    <Layers className="w-12 h-12 mx-auto opacity-30 text-indigo-400" />
                    <p className="font-bold text-base text-slate-300">Chưa chọn bộ đề thi nào</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Vui lòng nhấp vào một bộ đề thi ở danh sách bên trái để xem và sửa đổi các câu hỏi, hoặc bấm nút "+ Thêm Bộ Đề Thi Mới".
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Footer for Menu 4 */}
              <div className="pt-4 border-t border-quiz-border/60 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    SoundEffects.click();
                    if (setActiveTab) setActiveTab('quiz');
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-quiz-dark hover:bg-quiz-card border border-quiz-border text-slate-300 font-bold text-xs flex items-center gap-2 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại Menu 3 (Sinh câu hỏi & Duyệt)</span>
                </button>

                {(onNavigateStudentQuiz || onNavigateStudent) && (
                  <button
                    onClick={() => {
                      if (onNavigateStudentQuiz) {
                        onNavigateStudentQuiz(selectedQuiz?.id || null);
                      } else if (onNavigateStudent) {
                        onNavigateStudent();
                      }
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition hover:scale-[1.02]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Làm bài thi Giao diện Học viên</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: THÊM BỘ ĐỀ THI MỚI                                              */}
      {/* ========================================================================= */}
      {showCreateQuizModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-quiz-panel border border-quiz-border rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-quiz-border pb-3">
              <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" />
                <span>Thêm bộ đề thi mới</span>
              </h4>
              <button onClick={() => setShowCreateQuizModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Tiêu đề bộ đề thi:
                </label>
                <input
                  type="text"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  placeholder="VD: Đề kiểm tra 15 phút - JTBD và Tư duy sản phẩm AI"
                  className="w-full bg-quiz-dark border border-quiz-border rounded-xl p-3 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Quyền làm bài của học viên:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewQuizStatus('PUBLISHED')}
                    className={`p-3 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                      newQuizStatus === 'PUBLISHED'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                        : 'bg-quiz-dark border-quiz-border text-slate-400'
                    }`}
                  >
                    <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div>Mở cho SV làm ngay</div>
                      <div className="text-[10px] font-normal opacity-80 mt-0.5">Sinh viên được vào làm bài</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewQuizStatus('DISABLED')}
                    className={`p-3 rounded-xl border text-left font-bold transition flex items-center gap-2 ${
                      newQuizStatus === 'DISABLED'
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                        : 'bg-quiz-dark border-quiz-border text-slate-400'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <div>Khóa quyền làm bài</div>
                      <div className="text-[10px] font-normal opacity-80 mt-0.5">Tạm thời không cho SV làm</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-quiz-border">
              <button
                onClick={() => setShowCreateQuizModal(false)}
                className="px-4 py-2.5 rounded-xl bg-quiz-dark text-slate-300 text-xs font-bold hover:bg-quiz-card"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleCreateQuizSubmit}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-extrabold hover:bg-indigo-500 flex items-center gap-1.5 shadow-md shadow-indigo-500/30"
              >
                <Save className="w-4 h-4" />
                <span>Tạo Đề Thi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SỬA TÊN BỘ ĐỀ THI                                               */}
      {/* ========================================================================= */}
      {editingQuizTitleModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-quiz-panel border border-quiz-border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-quiz-border pb-3">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>Đổi tên bộ đề thi</span>
              </h4>
              <button onClick={() => setEditingQuizTitleModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Tiêu đề mới:
                </label>
                <input
                  type="text"
                  value={editingQuizTitleModal.title}
                  onChange={(e) => setEditingQuizTitleModal({ ...editingQuizTitleModal, title: e.target.value })}
                  className="w-full bg-quiz-dark border border-quiz-border rounded-xl p-3 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-quiz-border">
              <button
                onClick={() => setEditingQuizTitleModal(null)}
                className="px-4 py-2 rounded-xl bg-quiz-dark text-slate-300 text-xs font-bold hover:bg-quiz-card"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveQuizTitle}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-extrabold hover:bg-indigo-500 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: THÊM / SỬA CÂU HỎI TRONG ĐỀ THI                                */}
      {/* ========================================================================= */}
      {editingQuestionModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-quiz-panel border border-quiz-border rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-quiz-border pb-3">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-400" />
                <span>
                  {editingQuestionModal.isNew ? 'Thêm câu hỏi mới vào đề' : `Chỉnh sửa câu hỏi (${editingQuestionModal.question_code})`}
                </span>
              </h4>
              <button onClick={() => setEditingQuestionModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Nội dung câu hỏi tình huống đời thường:
                </label>
                <textarea
                  value={editingQuestionModal.question}
                  onChange={(e) => setEditingQuestionModal({ ...editingQuestionModal, question: e.target.value })}
                  rows={3}
                  placeholder="VD: Chị Lan mở quán cà phê muốn tăng khách buổi chiều. Theo phương pháp JTBD, chị Lan nên..."
                  className="w-full bg-quiz-dark border border-quiz-border rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  4 Phương án đáp án (Tích chọn tròn ở đầu dòng để chọn đáp án đúng):
                </label>
                <div className="space-y-2">
                  {editingQuestionModal.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="modalCorrectIndex"
                        checked={editingQuestionModal.correct_index === oIdx}
                        onChange={() => setEditingQuestionModal({ ...editingQuestionModal, correct_index: oIdx })}
                        className="text-purple-600 w-4 h-4 cursor-pointer"
                        title="Đánh dấu phương án này là đáp án đúng"
                      />
                      <span className="font-bold text-purple-300 w-4">{String.fromCharCode(65 + oIdx)}.</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...editingQuestionModal.options];
                          newOpts[oIdx] = e.target.value;
                          setEditingQuestionModal({ ...editingQuestionModal, options: newOpts });
                        }}
                        placeholder={`Nội dung phương án ${String.fromCharCode(65 + oIdx)}...`}
                        className="flex-1 bg-quiz-dark border border-quiz-border rounded-lg p-2 text-white text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Trích dẫn Slide trang số:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editingQuestionModal.slide_page}
                    onChange={(e) => setEditingQuestionModal({ ...editingQuestionModal, slide_page: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-quiz-dark border border-quiz-border rounded-lg p-2 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Khái niệm cốt lõi:
                  </label>
                  <input
                    type="text"
                    value={editingQuestionModal.core_concept}
                    onChange={(e) => setEditingQuestionModal({ ...editingQuestionModal, core_concept: e.target.value })}
                    placeholder="VD: Khung JTBD chuẩn"
                    className="w-full bg-quiz-dark border border-quiz-border rounded-lg p-2 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Căn cứ giải thích tại sao đúng (nguồn sự thật):
                </label>
                <textarea
                  value={editingQuestionModal.explanation}
                  onChange={(e) => setEditingQuestionModal({ ...editingQuestionModal, explanation: e.target.value })}
                  rows={2}
                  placeholder="VD: Căn cứ Slide Trang 2: Khách hàng mua giải pháp vì mục tiêu công việc JTBD thực tế..."
                  className="w-full bg-quiz-dark border border-quiz-border rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-quiz-border">
              <button
                onClick={() => setEditingQuestionModal(null)}
                className="px-4 py-2 rounded-xl bg-quiz-dark text-slate-300 text-xs font-bold hover:bg-quiz-card"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveQuestionSubmit}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-extrabold hover:bg-purple-500 flex items-center gap-1.5 shadow-md shadow-purple-500/25"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editingQuestionModal.isNew ? 'Thêm câu hỏi' : 'Lưu cập nhật'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
