import React from 'react';
import { Search, Bell, Sparkles } from 'lucide-react';

export default function Topbar({ theme, searchQuery, setSearchQuery, onNotificationClick }) {
  return (
    <header className={`h-20 px-8 flex items-center justify-between border-b transition-colors ${
      theme === 'dark' ? 'bg-[#181824] border-gray-800' : 'bg-white border-gray-100'
    }`}>
      {/* Greeting */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className={`text-lg font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Xin chào T153
          </h2>
          <span className="text-lg">👋</span>
        </div>
        <p className="text-xs text-gray-400 font-medium">Chào buổi sáng, chúc bạn học tập hiệu quả!</p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm môn học, bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-64 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-medium outline-none transition-all ${
              theme === 'dark'
                ? 'bg-gray-800/80 text-gray-100 placeholder-gray-500 focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500/40'
                : 'bg-gray-100/90 text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/30'
            }`}
          />
        </div>

        {/* Bell notification */}
        <button
          onClick={onNotificationClick}
          className={`relative p-2.5 rounded-2xl transition-colors ${
            theme === 'dark' ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="Thông báo"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2.5 pl-1 cursor-pointer group">
          <div className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-indigo-500/20 group-hover:ring-indigo-500 transition-all shadow-sm bg-gradient-to-tr from-amber-200 to-amber-400 flex items-center justify-center">
            <span className="text-base select-none">👑</span>
          </div>
        </div>
      </div>
    </header>
  );
}

