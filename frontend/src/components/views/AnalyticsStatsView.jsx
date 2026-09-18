import React, { useState } from 'react';
import { 
  BarChart3, PieChart, Clock, Calendar, ChevronDown, 
  TrendingUp, Award, BookOpen 
} from 'lucide-react';

export default function AnalyticsStatsView({ theme }) {
  const [timeFilter, setTimeFilter] = useState('week'); // 'week' or 'month'

  const scoreData = [
    { subject: 'Toán cao cấp', score: 58 },
    { subject: 'Xác suất TK', score: 52 },
    { subject: 'Tư duy AI', score: 43 },
    { subject: 'Lập trình Web', score: 36 },
    { subject: 'Toán rời rạc', score: 30 },
    { subject: 'Triết học', score: 24 },
  ];

  const hourlyData = [
    { hour: 1, mins: 20 },
    { hour: 2, mins: 5 },
    { hour: 3, mins: 10 },
    { hour: 4, mins: 18 },
    { hour: 5, mins: 0 },
    { hour: 6, mins: 0 },
    { hour: 7, mins: 4 },
    { hour: 8, mins: 30 },
    { hour: 9, mins: 38 },
    { hour: 10, mins: 52 },
    { hour: 11, mins: 60 },
    { hour: 12, mins: 50 },
  ];

  const subjectProgress = [
    { name: 'Toán cao cấp', percent: 78, time: '5h30m', color: 'bg-indigo-500' },
    { name: 'Vật lý đại cương', percent: 64, time: '3h45m', color: 'bg-emerald-500' },
    { name: 'Tiếng Anh chuyên ngành', percent: 50, time: '4h10m', color: 'bg-pink-500' },
    { name: 'Tư duy sản phẩm AI', percent: 85, time: '6h20m', color: 'bg-sky-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200/80 dark:border-gray-800">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Thống kê học tập
          </h2>
          <p className="text-xs text-gray-400 font-medium">Báo cáo chi tiết hiệu suất và thời gian ôn luyện</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">Khoảng thời gian:</span>
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className={`text-xs font-bold px-3 py-1.5 pr-7 rounded-xl border outline-none cursor-pointer appearance-none ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="all">Tất cả</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4 Cards Grid matching Figma frame 448:19192 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Thống kê kết quả ôn tập (Bar Chart) */}
        <div className={`lg:col-span-6 p-6 rounded-3xl border transition-colors ${
          theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Thống kê kết quả ôn tập
            </h3>
            <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
              Tuần này
            </span>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-gray-100 dark:border-gray-800 pb-3">
            {scoreData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.score}%
                </span>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-t-xl overflow-hidden h-40 flex items-end">
                  <div
                    className="w-full bg-indigo-500 rounded-t-xl group-hover:bg-indigo-600 transition-all duration-500"
                    style={{ height: `${item.score}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-medium text-gray-400 truncate max-w-[50px]">
                  {item.subject}
                </span>
              </div>
            ))}
          </div>
          <div className="text-right text-[10px] text-gray-400 pt-2 font-medium">
            Tên môn học
          </div>
        </div>

        {/* Card 2: Thống kê môn học đã ôn tập (Donut Chart) */}
        <div className={`lg:col-span-6 p-6 rounded-3xl border transition-colors ${
          theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Thống kê môn học đã ôn tập
            </h3>
            <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
              Tuần này
            </span>
          </div>

          {/* Donut graphic */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-2">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" stroke="#6366f1" strokeWidth="12" strokeDasharray="90 200" fill="transparent" />
                <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="12" strokeDasharray="60 200" strokeDashoffset="-90" fill="transparent" />
                <circle cx="50" cy="50" r="38" stroke="#ec4899" strokeWidth="12" strokeDasharray="50 200" strokeDashoffset="-150" fill="transparent" />
                <circle cx="50" cy="50" r="38" stroke="#0ea5e9" strokeWidth="12" strokeDasharray="40 200" strokeDashoffset="-200" fill="transparent" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-gray-400 font-medium">Tổng thời gian</span>
                <span className="text-xl font-black text-gray-900 dark:text-white">12h</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">Toán cao cấp (4.5h)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">Vật lý (3h)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">Tiếng Anh (2.5h)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-500"></span>
                <span className="text-gray-600 dark:text-gray-300 font-medium">Hóa học (2h)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Thống kê thời gian ôn tập (Hourly Bar Chart) */}
        <div className={`lg:col-span-6 p-6 rounded-3xl border transition-colors ${
          theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Thống kê thời gian ôn tập
            </h3>
            <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
              Ngày
            </span>
          </div>
          <div className="text-[10px] text-gray-400 mb-2">Phút / 1 giờ</div>

          {/* Slim Bar Chart matching Figma */}
          <div className="h-44 flex items-end justify-between gap-1.5 pt-4 border-b border-gray-100 dark:border-gray-800 pb-2">
            {hourlyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-32 flex items-end">
                  <div
                    className="w-full bg-indigo-400/80 hover:bg-indigo-600 rounded-full transition-all"
                    style={{ height: `${(d.mins / 60) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[9px] font-mono text-gray-400">{d.hour}</span>
              </div>
            ))}
          </div>
          <div className="text-right text-[10px] text-gray-400 pt-2 font-medium">
            Giờ / 1 ngày
          </div>
        </div>

        {/* Card 4: Chi tiết từng môn học (Progress bars) */}
        <div className={`lg:col-span-6 p-6 rounded-3xl border transition-colors ${
          theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
        }`}>
          <h3 className={`text-sm font-bold mb-5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Chi tiết từng môn học
          </h3>

          <div className="space-y-4">
            {subjectProgress.map((sub, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-gray-50/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/60">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{sub.name}</span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {sub.time}
                    </span>
                  </div>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{sub.percent}%</span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${sub.color}`}
                    style={{ width: `${sub.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

