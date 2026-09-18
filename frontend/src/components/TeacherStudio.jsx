import React, { useState } from 'react';
import { Upload, Sparkles, ShieldCheck, CheckCircle2, FileText, AlertTriangle, ArrowRight, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundEffects } from './SoundEffects';

export default function TeacherStudio({ systemStatus, refreshStatus, onQuizPublished }) {
  const [loading, setLoading] = useState(false);
  const [markdownData, setMarkdownData] = useState(null);
  const [lecturerNote, setLecturerNote] = useState("Mới dạy xong Slide 1 - 10");
  const [scopeSummary, setScopeSummary] = useState(null);
  const [draftQuiz, setDraftQuiz] = useState(null);
  const [verifiedHuman, setVerifiedHuman] = useState(false);

  // Load sample PDF
  const handleLoadSample = async () => {
    SoundEffects.click();
    setLoading(true);
    try {
      const res = await fetch('/api/lecturer/upload-pdf', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMarkdownData(data);
        SoundEffects.correct();
        refreshStatus();
      }
    } catch (e) {
      alert("Lỗi tải bản mẫu: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Upload user PDF
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    SoundEffects.click();
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/lecturer/upload-pdf', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setMarkdownData(data);
        SoundEffects.correct();
        refreshStatus();
      }
    } catch (e) {
      alert("Lỗi tải file: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply constraints
  const handleApplyConstraints = async () => {
    SoundEffects.click();
    try {
      const res = await fetch('/api/lecturer/set-constraints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lecturer_note: lecturerNote })
      });
      const data = await res.json();
      if (data.success) {
        setScopeSummary(data);
        SoundEffects.correct();
        refreshStatus();
      }
    } catch (e) {
      alert("Lỗi áp dụng ràng buộc: " + e.message);
    }
  };

  // Generate Quiz
  const handleGenerateQuiz = async () => {
    SoundEffects.click();
    setLoading(true);
    try {
      const res = await fetch('/api/lecturer/generate-quiz', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDraftQuiz(data.quiz);
        SoundEffects.correct();
        refreshStatus();
      }
    } catch (e) {
      alert("Lỗi sinh đề thi: " + e.message);
    } finally {
      setLoading(false);
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
        if (onQuizPublished) onQuizPublished();
        alert("🎉 " + data.message);
      }
    } catch (e) {
      alert("Lỗi phát hành: " + e.message);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner Stage 1 */}
      <div className="bg-gradient-to-r from-purple-950 via-quiz-panel to-quiz-dark border border-quiz-border rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                GIAI ĐOẠN 1
              </span>
              <span className="text-xs text-slate-400 font-mono">Backend: MySQL Active</span>
            </div>
            <h2 className="text-2xl font-black text-white font-display mt-2">
              Tài Liệu + Ghi Chú Giảng Viên $\rightarrow$ AI Sinh Quiz Có Căn Cứ
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Trích xuất tài liệu chuẩn bằng <strong>Microsoft MarkItDown</strong>, áp đặt ranh giới cứng theo ghi chú bài dạy (chặn slide vượt trang) và kiểm duyệt trước khi phát hành.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleLoadSample}
              disabled={loading}
              className="btn-quiz-3d px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Nạp Slide Mẫu 15 Trang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Left Column (Steps 1 & 2) | Right Column (Steps 3 & 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* STEP 1: PDF to Markdown (MarkItDown) */}
          <div className="bg-quiz-panel border border-quiz-border rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span>1A. Slide PDF $\rightarrow$ 1B. File Markdown</span>
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-quiz-dark text-slate-300 border border-quiz-border font-mono">
                {markdownData ? `${markdownData.total_slides} slides` : 'Chưa nạp'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Dùng repo <strong>MarkItDown</strong> để chuyển đổi Slide PDF sang định dạng Markdown chuẩn, bảo toàn cấu trúc mục và mã trích dẫn <code className="text-purple-300">[DEMO-NNN]</code>.
            </p>

            <div className="flex items-center space-x-3">
              <label className="flex-1 cursor-pointer">
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                <div className="w-full py-2.5 px-4 rounded-2xl bg-quiz-dark hover:bg-quiz-card border border-quiz-border text-xs font-bold text-slate-200 text-center flex items-center justify-center space-x-2 transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Chọn file PDF từ máy</span>
                </div>
              </label>

              <button
                onClick={handleLoadSample}
                className="py-2.5 px-4 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition"
              >
                Nạp Sample
              </button>
            </div>

            {/* Markdown Preview */}
            <div className="pt-2 border-t border-quiz-border">
              <span className="text-xs font-bold text-slate-400">Xem trước văn bản Markdown trích xuất:</span>
              <div className="mt-2 h-44 overflow-y-auto bg-quiz-dark p-3 rounded-2xl border border-quiz-border font-mono text-[11px] text-slate-300 leading-relaxed">
                {markdownData ? (
                  <div>
                    {markdownData.slides.map((s) => (
                      <div key={s.page_number} className="mb-2 pb-2 border-b border-quiz-border/60">
                        <div className="flex items-center justify-between font-bold text-purple-300">
                          <span>Slide {s.page_number}: {s.title}</span>
                          <span className={s.is_advanced ? "text-rose-400 text-[10px]" : "text-emerald-400 text-[10px]"}>
                            {s.scope_label}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[10px] mt-0.5 line-clamp-2">{s.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic py-6 text-center">Bấm "Nạp Slide Mẫu" để chạy trích xuất MarkItDown...</p>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2: Ghi Chú Bài Dạy Giảng Viên (Điều kiện tiên quyết) */}
          <div className="bg-quiz-panel border border-quiz-border rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>2. Ghi Chú Bài Dạy Của Giảng Viên</span>
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                Tiên quyết
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Chỉ định rõ kiến thức <strong>THỰC TẾ ĐÃ DẠY</strong> trên lớp (Ví dụ: <em>Mới dạy xong Slide 1 - 10</em>). AI bắt buộc chặn toàn bộ câu hỏi ngoài phạm vi này.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={lecturerNote}
                onChange={(e) => setLecturerNote(e.target.value)}
                placeholder="Ví dụ: Mới dạy xong Slide 1 - 10"
                className="w-full bg-quiz-dark border border-quiz-border rounded-2xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-purple-500"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-500">Mẫu:</span>
                  <button onClick={() => setLecturerNote("Mới dạy xong Slide 1 - 10")} className="text-purple-400 hover:underline">Slide 1-10</button>
                  <span className="text-slate-600">•</span>
                  <button onClick={() => setLecturerNote("Chỉ dạy Slide 1 đến 5")} className="text-purple-400 hover:underline">Slide 1-5</button>
                </div>

                <button
                  onClick={handleApplyConstraints}
                  className="btn-quiz-3d px-4 py-2 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Áp Dụng Ràng Buộc</span>
                </button>
              </div>

              {/* Ranh giới summary */}
              <div className="p-3.5 bg-quiz-dark rounded-2xl border border-quiz-border text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Kiến thức cho phép (In-scope):</span>
                  <span className="font-bold text-emerald-400">
                    {scopeSummary ? `Slide 1 - ${scopeSummary.constraints.max_slide} (${scopeSummary.in_scope_count} Concepts)` : 'Slide 1 - 10 (10 Concepts)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Rào chắn chặn cứng (Blocked):</span>
                  <span className="font-bold text-rose-400">
                    {scopeSummary ? `Slide ${scopeSummary.constraints.max_slide + 1}+ (${scopeSummary.blocked_count} Chặn)` : 'Slide 11 - 15 (5 Chặn)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-1 border-t border-quiz-border font-mono">
                  🛡️ Ràng buộc nội dung: AI đối chiếu và chặn câu hỏi vượt trang quy định.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-quiz-panel border border-quiz-border rounded-3xl p-6 shadow-xl flex flex-col h-full">
            
            {/* Header Steps 3 & 4 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-quiz-border">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>3. AI.Graph Engine $\rightarrow$ 4. Giảng Viên Kiểm Duyệt</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đổi sang ví dụ đời thường, gắn trích dẫn DEMO-NNN và Slide Trang X.
                </p>
              </div>

              <button
                onClick={handleGenerateQuiz}
                disabled={loading}
                className="btn-quiz-3d px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI Sinh Quiz Có Căn Cứ</span>
              </button>
            </div>

            {/* Questions Container */}
            <div className="mt-4 flex-1">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-slate-400 font-bold">Bản thảo câu hỏi kiểm tra (Draft Assessment):</span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-extrabold border border-purple-500/30">
                  {draftQuiz ? `${draftQuiz.total_questions} Câu Hỏi` : 'Chờ sinh đề'}
                </span>
              </div>

              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
                {draftQuiz ? (
                  draftQuiz.questions.map((q, idx) => (
                    <div key={q.id} className="bg-quiz-dark border border-quiz-border rounded-2xl p-4 space-y-2 hover:border-purple-500/50 transition">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-purple-400 font-display">Câu {idx + 1} ({q.id})</span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-quiz-panel text-purple-300 border border-purple-500/30 font-mono text-[10px]">
                          📍 {q.provenance}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-200 leading-relaxed">{q.question}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
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
                              {isCorrect && <span>✓</span>}
                            </div>
                          );
                        })}
                      </div>

                      <p className="text-[11px] text-slate-400 italic pt-1 border-t border-quiz-border">
                        <strong>Căn cứ trích dẫn:</strong> {q.explanation}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-slate-500">
                    <p className="text-4xl mb-3">📋</p>
                    <p className="text-sm font-bold">Chưa có bản thảo Quiz nào.</p>
                    <p className="text-xs mt-1 text-slate-600">Bấm nút "AI Sinh Quiz Có Căn Cứ" ở góc trên để tạo đề.</p>
                  </div>
                )}
              </div>
            </div>

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

          </div>

        </div>

      </div>

    </div>
  );
}
