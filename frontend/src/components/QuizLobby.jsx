import React, { useState } from 'react';
import { Gamepad2, Sparkles, User, Play, Trophy } from 'lucide-react';
import { SoundEffects } from './SoundEffects';

const AVATARS = [
  { id: 'cat', emoji: '🐱', name: 'Mèo Thông Thái' },
  { id: 'owl', emoji: '🦉', name: 'Cú Trí Tuệ' },
  { id: 'fox', emoji: '🦊', name: 'Cáo Nhanh Trí' },
  { id: 'robot', emoji: '🤖', name: 'Robo-Turing' },
  { id: 'lion', emoji: '🦁', name: 'Sư Tử Dũng Cảm' },
  { id: 'astro', emoji: '🚀', name: 'Phi Hành Gia' }
];

export default function QuizLobby({ quizTitle, isPublished, onStartGame }) {
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [playerName, setPlayerName] = useState("Học viên Thực Chiến");

  const handleStart = () => {
    if (!isPublished) {
      alert("Giảng viên chưa duyệt phát hành Quiz. Vui lòng chuyển sang tab 'Studio Giảng Viên' để bấm Duyệt trước!");
      return;
    }
    SoundEffects.click();
    onStartGame({
      name: playerName.trim() || "Học viên",
      avatar: selectedAvatar
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto my-auto py-8">
      <div className="bg-quiz-panel border-2 border-quiz-border rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Play & Create Quiz • Quiz.com Style</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight leading-tight">
            {quizTitle || "Đánh Giá Tư Duy Sản Phẩm AI"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            10 câu hỏi tình huống thực tế đời thường • Ràng buộc bám sát Slide 1 - 10
          </p>
        </div>

        {/* Avatar Carousel Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Chọn Avatar Của Bạn:
          </label>
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                onClick={() => { SoundEffects.click(); setSelectedAvatar(av); }}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition transform ${
                  selectedAvatar.id === av.id
                    ? 'bg-purple-600 scale-110 shadow-lg shadow-purple-600/50 border-2 border-white ring-4 ring-purple-500/30'
                    : 'bg-quiz-dark hover:bg-quiz-card border border-quiz-border opacity-70 hover:opacity-100'
                }`}
                title={av.name}
              >
                {av.emoji}
              </button>
            ))}
          </div>
          <p className="text-xs font-bold text-purple-400 font-mono mt-1">
            {selectedAvatar.name}
          </p>
        </div>

        {/* Player Name Input */}
        <div className="space-y-2 max-w-sm mx-auto text-left">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Tên người chơi / Nickname:
          </label>
          <div className="relative">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nhập tên của bạn..."
              className="w-full bg-quiz-dark border-2 border-quiz-border rounded-2xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-purple-500 shadow-inner"
            />
            <span className="absolute right-3.5 top-3 text-lg">⚡</span>
          </div>
        </div>

        {/* Start Game Button */}
        <div className="pt-2 max-w-sm mx-auto">
          <button
            onClick={handleStart}
            className="btn-quiz-3d w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base sm:text-lg flex items-center justify-center space-x-2 shadow-xl shadow-emerald-900/50"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>BẮT ĐẦU LÀM BÀI NGAY!</span>
          </button>
        </div>

        {/* Status notice */}
        <div className="text-[11px] text-slate-500 font-mono pt-2">
          {isPublished ? (
            <span className="text-emerald-400 font-bold">● Đề thi đã được Giảng viên phê duyệt</span>
          ) : (
            <span className="text-amber-400 font-bold">● Đề thi đang ở trạng thái bản thảo (Cần duyệt ở Studio)</span>
          )}
        </div>

      </div>
    </div>
  );
}

