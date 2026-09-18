import React, { useState } from 'react';
import { X, Plus, FileText, Upload } from 'lucide-react';

export default function AddExerciseModal({ isOpen, onClose, onAddExercise, theme }) {
  const [title, setTitle] = useState('');
  const [slideRange, setSlideRange] = useState('Slide 1 - 10');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddExercise({
      id: Date.now(),
      title: title.trim(),
      time: 'Vừa xong',
      progress: 0,
      color: 'indigo'
    });
    setTitle('');
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
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold">Thêm bài tập ôn luyện</h3>
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
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Tên bài tập *</label>
            <input
              type="text"
              required
              placeholder="VD: Bài tập 6: Phân tích độ nhạy & Thử nghiệm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-2xl text-xs outline-none border transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 focus:border-indigo-500'
                  : 'bg-gray-50 border-gray-200 focus:bg-white focus:border-indigo-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Phạm vi Slide</label>
            <input
              type="text"
              placeholder="VD: Slide 1 - 10"
              value={slideRange}
              onChange={(e) => setSlideRange(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-2xl text-xs outline-none border transition-all ${
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
              Tạo bài tập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

