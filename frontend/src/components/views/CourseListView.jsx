import React, { useState } from 'react';
import { 
  FileText, Briefcase, Plus, ArrowUpDown, Edit3, Trash2, 
  ChevronRight, ChevronLeft, BookOpen, Clock, CheckCircle2 
} from 'lucide-react';

export default function CourseListView({ 
  theme, 
  courses, 
  recentCourses, 
  onSelectCourse, 
  onAddCourseModal, 
  onDeleteCourse 
}) {
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' or 'recent'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'name'

  const currentList = activeSubTab === 'all' ? courses : recentCourses;

  const sortedList = [...currentList].sort((a, b) => {
    if (sortOrder === 'name') {
      return a.name.localeCompare(b.name);
    }
    return b.id - a.id;
  });

  return (
    <div className="space-y-6">
      {/* 1. Sub Tabs matching Figma */}
      <div className="flex items-center gap-8 border-b border-gray-200/80 dark:border-gray-800 pb-2">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`flex items-center gap-2 pb-2 text-sm font-bold transition-all relative ${
            activeSubTab === 'all'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Danh sách môn học</span>
          {activeSubTab === 'all' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('recent')}
          className={`flex items-center gap-2 pb-2 text-sm font-bold transition-all relative ${
            activeSubTab === 'recent'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Đã ôn tập gần đây</span>
          {activeSubTab === 'recent' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
          )}
        </button>
      </div>

      {/* 2. Controls Row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {sortedList.length} môn học
          </h3>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort button */}
          <button 
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'name' : 'newest')}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <span>{sortOrder === 'newest' ? 'Mới nhất' : 'Theo tên A-Z'}</span>
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Table / Card List matching Figma */}
      <div className={`rounded-3xl border overflow-hidden transition-colors ${
        theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-xs font-semibold uppercase tracking-wider border-b ${
              theme === 'dark' ? 'text-gray-400 border-gray-800 bg-gray-900/40' : 'text-gray-400 border-gray-100 bg-gray-50/50'
            }`}>
              <th className="py-4 px-6">Tên môn học</th>
              <th className="py-4 px-6">Tài liệu bài giảng</th>
              <th className="py-4 px-6">Số bài tập đã tạo</th>
              <th className="py-4 px-6 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {sortedList.map((course) => {
              const exCount = course.exercises ? course.exercises.length : 1;
              return (
                <tr
                  key={course.id}
                  onClick={() => onSelectCourse(course)}
                  className={`group cursor-pointer transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-800/60 text-gray-200'
                      : 'hover:bg-indigo-50/40 text-gray-700'
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold block text-sm group-hover:text-indigo-600 transition-colors">
                          {course.name}
                        </span>
                        {course.code && (
                          <span className="text-[11px] text-gray-400 font-medium">
                            Mã: {course.code}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 font-medium">
                      {course.docsCount || 1} tài liệu {course.total_slides ? `(${course.total_slides} trang)` : ''}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-xs">
                    <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{exCount} bài tập sẵn sàng</span>
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => onSelectCourse(course)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                      >
                        <span>Vào ôn tập</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 4. Pagination matching Figma */}
        <div className={`py-4 px-6 flex items-center justify-between border-t text-xs text-gray-400 ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select className={`px-2 py-1 rounded-lg border outline-none text-xs font-semibold ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          <div>
            Hiển thị 1 to {sortedList.length} trong tổng số {sortedList.length} môn học
          </div>

          <div className="flex items-center gap-1.5">
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </button>
            <button className="w-6 h-6 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 font-semibold text-xs flex items-center justify-center">
              2
            </button>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

