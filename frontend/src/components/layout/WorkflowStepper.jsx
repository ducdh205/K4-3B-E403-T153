import React from 'react';
import { ArrowRight, CheckCircle2, FileText, Lock, Sparkles, UserCheck, PlayCircle, Trophy, HelpCircle } from 'lucide-react';

export default function WorkflowStepper({ activeStep, onStepClick, theme }) {
  const steps = [
    { id: 'step_pdf', label: '1. Nạp Slide PDF', sub: 'Tải tài liệu bài giảng', stage: 1 },
    { id: 'step_note', label: '2. Ghi chú Giảng viên', sub: 'Xác định nội dung đã dạy', stage: 1 },
    { id: 'step_graph', label: '3. AI.Graph Engine', sub: 'Sinh câu hỏi theo phạm vi', stage: 1 },
    { id: 'step_review', label: '4. Giảng viên Duyệt', sub: 'Human-in-the-loop', stage: 1 },
    { id: 'step_quiz', label: '5. Học viên làm Quiz', sub: 'Làm bài đã được duyệt', stage: 2 },
    { id: 'step_remediation', label: '6. Vòng lặp thích ứng', sub: 'Giải thích & Quiz mới', stage: 2 },
    { id: 'step_mastery', label: '7. Đạt chuẩn Mastery', sub: 'Mở 2 lựa chọn đi tiếp', stage: 2 },
  ];

  return (
    <div className={`p-4 rounded-3xl border mb-6 transition-all ${
      theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-indigo-100 shadow-sm'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-4 h-4" />
          <span>SƠ ĐỒ LUỒNG: ĐÁNH GIÁ THÍCH ỨNG & VÒNG LẶP ÔN TẬP KHÉP KÍN</span>
        </div>
      </div>

      {/* Stepper items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {steps.map((s, idx) => {
          const isActive = activeStep === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onStepClick(s.id)}
              className={`p-2.5 rounded-2xl text-left transition-all relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-[1.03]'
                  : theme === 'dark'
                  ? 'bg-gray-800/60 hover:bg-gray-800 text-gray-300'
                  : 'bg-gray-50 hover:bg-indigo-50/60 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] opacity-70 mb-0.5">
                <span>GĐ {s.stage}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>}
              </div>
              <div className="text-[11px] font-bold truncate">{s.label}</div>
              <div className={`text-[9px] truncate ${isActive ? 'text-indigo-100' : 'text-gray-400'}`}>
                {s.sub}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

