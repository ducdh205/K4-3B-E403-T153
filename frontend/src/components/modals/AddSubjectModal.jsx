import React, { useState } from 'react';
import { X, BookOpen, FileCode, FileText } from 'lucide-react';

export default function AddSubjectModal({ isOpen, onClose, onAddSubject, theme }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddSubject({
      id: Date.now(),
      name: name.trim(),
      code: code.trim().toUpperCase() || 'SUB-01',
      description: description.trim() || 'Môn học mới được thêm vào hệ thống ôn tập.',
      docsCount: 1,
      exercises: [
        {
          id: 1,
          title: `Bài tập 1: Cơ bản về ${name.trim()}`,
          time: 'Vừa xong',
          progress: 0,
          color: 'indigo'
        }
      ]
    });
    setName('');
    setCode('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl transition-all border ${
        theme === 'dark' ? 'bg-[#181824] border-gray-800 text-gray-100' : 'bg-white border-gray-100 text-gray-800'
      }`}>
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-gray-800 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold">Thêm môn học mới</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Tên môn học *</label>
            <input
              type="text"
              required
              placeholder="VD: Xác suất thống kê, Tư duy AI..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-2xl text-xs outline-none border transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 focus:border-indigo-500'
                  : 'bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Mã môn học</label>
            <input
              type="text"
              placeholder="VD: MTA02, CS101..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-2xl text-xs outline-none border transition-all uppercase font-mono ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 focus:border-indigo-500'
                  : 'bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Mô tả tóm tắt</label>
            <textarea
              rows="3"
              placeholder="Mô tả nội dung trọng tâm môn học..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-2xl text-xs outline-none border transition-all resize-none ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 focus:border-indigo-500'
                  : 'bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500'
              }`}
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
            >
              Lưu môn học
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

