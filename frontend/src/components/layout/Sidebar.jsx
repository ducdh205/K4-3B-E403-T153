import React from 'react';
import { LayoutGrid, BookOpen, User, Settings, Sun, Moon, Sparkles } from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, theme, setTheme, onNavigateHome }) {
  const menuItems = [
    { id: 'stats', label: 'Thống kê', icon: LayoutGrid },
    { id: 'review', label: 'Ôn tập', icon: BookOpen },
    { id: 'account', label: 'Tài khoản', icon: User },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <aside className={`w-64 min-h-screen p-5 flex flex-col justify-between transition-colors duration-200 ${
      theme === 'dark' ? 'bg-[#181824] border-r border-gray-800 text-gray-200' : 'bg-[#f4f5fa] border-r border-gray-200/80 text-gray-700'
    }`}>
      {/* Top section */}
      <div>
        {/* Logo */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-3 px-2 py-3 mb-8 cursor-pointer group"
          title="Về trang chủ"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#4338ca] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            U
          </div>
          <div>
            <span className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#1e1b4b]'}`}>
              UTTQ
            </span>
            <span className="block text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">
              Smart Study AI
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#ede9fe] text-[#6366f1] shadow-sm font-bold'
                    : theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-white text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#6366f1]' : 'text-gray-400'}`} />
                <span>{item.label}</span>
                {item.id === 'review' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-indigo-500"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: Theme pill switch */}
      <div className="pt-4 border-t border-gray-200/60 dark:border-gray-800">
        <div className={`p-1 rounded-full flex items-center gap-1 ${
          theme === 'dark' ? 'bg-gray-900 border border-gray-800' : 'bg-gray-200/80'
        }`}>
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-semibold transition-all ${
              theme === 'light'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Sáng</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-semibold transition-all ${
              theme === 'dark'
                ? 'bg-gray-800 text-indigo-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Tối</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

