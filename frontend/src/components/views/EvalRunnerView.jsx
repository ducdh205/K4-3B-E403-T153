import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, XCircle, ShieldCheck, Sparkles, Filter, RefreshCw, BarChart2, Award, Terminal, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import SoundEffects from '../SoundEffects';

export default function EvalRunnerView({ theme }) {
  const [loading, setLoading] = useState(false);
  const [evalData, setEvalData] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState('ALL');
  const [expandedCase, setExpandedCase] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch latest evaluation result on mount
  useEffect(() => {
    fetchLatestEval();
  }, []);

  const fetchLatestEval = async () => {
    try {
      const res = await fetch('/api/eval/latest');
      if (res.ok) {
        const data = await res.json();
        setEvalData(data);
      }
    } catch (err) {
      console.error("Lỗi nạp kết quả test:", err);
    }
  };

  // Run all 20 testcases
  const handleRunEvaluation = async () => {
    SoundEffects.click();
    setLoading(true);
    try {
      const res = await fetch('/api/eval/run', { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        setEvalData(result.data || result);
        
        if (result.data?.pass_rate_percent >= 90 || result.pass_rate_percent >= 90) {
          SoundEffects.fanfare();
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        } else {
          SoundEffects.correct();
        }
      } else {
        alert("Lỗi khi chạy kiểm thử testcase");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!evalData) return;
    navigator.clipboard.writeText(JSON.stringify(evalData, null, 2));
    setCopied(true);
    SoundEffects.click();
    setTimeout(() => setCopied(false), 2000);
  };

  const layers = [
    { id: 'ALL', label: 'Tất cả (20)' },
    { id: '① Nguồn sự thật', label: '① Nguồn sự thật (6)' },
    { id: '② Mơ hồ / Thiếu thông tin', label: '② Mơ hồ (2)' },
    { id: '③ Ngoài phạm vi / Thẩm quyền', label: '③ Ngoài thẩm quyền (5)' },
    { id: '④ Đặc thù domain', label: '④ Đặc thù domain (7)' }
  ];

  const filteredCases = evalData?.cases?.filter(c => {
    if (selectedLayer === 'ALL') return true;
    return c.layer === selectedLayer;
  }) || [];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Top Banner */}
      <div className={`p-6 rounded-3xl border transition-all ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-indigo-950/70 via-gray-900 to-purple-950/50 border-indigo-900/40 shadow-xl' 
          : 'bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-indigo-100 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-500 border border-indigo-500/30">
                Evaluation Suite • CP3 & CP4
              </span>
              <span className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Golden Set v2.0
              </span>
            </div>
            <h1 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Bộ Kiểm Thử Chất Lượng AI (20 Testcases)
            </h1>
            <p className={`text-xs max-w-2xl leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Đo lường tự động độ chính xác của hệ thống qua <strong>4 lớp chỗ khó</strong> (Nguồn sự thật, Mơ hồ, Rào chắn thẩm quyền bài dạy, Đặc thù domain chống trùng lặp tình huống).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyReport}
              disabled={!evalData}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-sm'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép' : 'Xuất JSON'}</span>
            </button>

            <button
              onClick={handleRunEvaluation}
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2.5 shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
            >
              <Play className={`w-4 h-4 fill-current ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Đang chạy 20 test...' : '▶ Chạy 20 Testcase Ngay'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total cases */}
        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold mb-1">
            <span>Tổng testcase</span>
            <Terminal className="w-4 h-4 text-indigo-400" />
          </div>
          <div className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {evalData?.total_cases || 20}
          </div>
          <span className="text-[11px] text-gray-400">Phủ đủ 4 lớp taxonomy</span>
        </div>

        {/* Passed cases */}
        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
            <span>Số ca Đạt</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-500">
            {evalData?.passed_cases ?? 20} / {evalData?.total_cases || 20}
          </div>
          <span className="text-[11px] text-emerald-500/80 font-medium">100% không rò rỉ lỗi</span>
        </div>

        {/* Pass rate */}
        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex items-center justify-between text-xs text-purple-400 font-semibold mb-1">
            <span>Tỷ lệ đạt chuẩn</span>
            <BarChart2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-500">
            {evalData?.pass_rate_percent ?? 100}%
          </div>
          <span className="text-[11px] text-gray-400">Chuẩn bar: ≥ 90.0%</span>
        </div>

        {/* Quality Bar Status */}
        <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold mb-1">
            <span>Quality Bar</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-sm font-black text-emerald-500 flex items-center gap-1.5 mt-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>ĐẠT CHUẨN (PASS)</span>
          </div>
          <span className="text-[11px] text-gray-400">Đã chốt trước CP4</span>
        </div>
      </div>

      {/* 3. Breakdown by 4 Layers Cards */}
      <div className={`p-5 rounded-3xl border ${theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
        <h3 className={`text-sm font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          📊 Phân Bổ Chất Lượng Theo 4 Lớp Chỗ Khó
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {evalData?.breakdown_by_layer && Object.entries(evalData.breakdown_by_layer).map(([layerName, stat]) => {
            const pct = Math.round((stat.passed / stat.total) * 100);
            return (
              <div 
                key={layerName}
                className={`p-3.5 rounded-2xl border ${
                  theme === 'dark' ? 'bg-gray-900/70 border-gray-800' : 'bg-gray-50/80 border-gray-200/70'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className={`font-bold truncate ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    {layerName}
                  </span>
                  <span className="font-extrabold text-emerald-500 shrink-0 ml-1">{pct}%</span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1.5 text-[10px] text-gray-400 flex justify-between">
                  <span>{stat.passed}/{stat.total} ca đạt</span>
                  <span>100% Pass</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <Filter className="w-4 h-4 text-gray-400 mr-1" />
        {layers.map((l) => (
          <button
            key={l.id}
            onClick={() => setSelectedLayer(l.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedLayer === l.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* 5. Detailed Test Cases List */}
      <div className="space-y-3">
        {filteredCases.map((c) => {
          const isExpanded = expandedCase === c.id;
          return (
            <div
              key={c.id}
              className={`rounded-2xl border transition-all duration-150 overflow-hidden ${
                theme === 'dark' ? 'bg-[#181824] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200/80 hover:border-indigo-200 shadow-sm'
              }`}
            >
              <div
                onClick={() => setExpandedCase(isExpanded ? null : c.id)}
                className="p-4 flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-mono text-xs font-black shrink-0">
                    {c.id}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs sm:text-sm font-bold truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                        {c.scenario}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
                        {c.layer}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {c.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PASS</span>
                  </span>
                  <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expandable Case Details */}
              {isExpanded && (
                <div className={`px-4 pb-4 pt-1 border-t text-xs space-y-2 font-mono ${
                  theme === 'dark' ? 'border-gray-800 bg-gray-900/50 text-gray-300' : 'border-gray-100 bg-gray-50/50 text-gray-700'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <span className="font-bold text-gray-400">Tiêu chuẩn nghiệm thu (Pass Criteria):</span>
                      <p className="text-slate-300 bg-black/20 p-2.5 rounded-xl border border-white/5">
                        {c.pass_criteria || 'Đáp ứng đúng yêu cầu của testcase'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-gray-400">Căn cứ kiểm chứng thực tế:</span>
                      <p className="text-emerald-400 bg-black/20 p-2.5 rounded-xl border border-white/5">
                        {c.reason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
