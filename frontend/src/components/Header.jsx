import React from 'react';
import { Volume2, VolumeX, Sparkles, GraduationCap, Gamepad2, Database } from 'lucide-react';
import { SoundEffects } from './SoundEffects';

export default function Header({ view, setView, audioEnabled, setAudioEnabled, systemStatus }) {
  const toggleAudio = () => {
    const next = !audioEnabled;
    SoundEffects.enabled = next;
    setAudioEnabled(next);
    if (next) SoundEffects.click();
  };

  return (
    <header className="border-b border-quiz-border bg-quiz-panel/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo styled like Quiz.com */}
        <div 
          onClick={() => { SoundEffects.click(); setView('lecturer'); }}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/40 group-hover:scale-105 transition transform">
            <span className="text-xl font-black text-white font-display">Q</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-tight text-white font-display">QuizAI</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-extrabold border border-purple-500/30 uppercase tracking-wide">
                Quiz.com Style
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              MarkItDown • Ràng Buộc Slide • Vòng Lặp Thích Ứng • MySQL
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-quiz-dark p-1 rounded-2xl border border-quiz-border shadow-inner">
          <button
            onClick={() => { SoundEffects.click(); setView('lecturer'); }}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
              view === 'lecturer'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Studio Giảng Viên</span>
          </button>

          <button
            onClick={() => { SoundEffects.click(); setView('student'); }}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-2 ${
              view === 'student'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Phòng Chơi Học Viên</span>
            {systemStatus?.quiz_status === 'PUBLISHED' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
            )}
          </button>
        </div>

        {/* Right Tools & DB indicator */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-quiz-dark border border-quiz-border text-[11px] font-mono text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>{systemStatus?.database_type || "MySQL"}</span>
          </div>

          <button
            onClick={toggleAudio}
            className="p-2 rounded-xl bg-quiz-dark hover:bg-quiz-card text-slate-300 border border-quiz-border transition"
            title="Bật/Tắt âm thanh arcade"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

      </div>
    </header>
  );
}

