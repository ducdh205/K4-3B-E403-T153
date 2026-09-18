import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TeacherStudio from './components/TeacherStudio';
import QuizLobby from './components/QuizLobby';
import QuizPlayer from './components/QuizPlayer';
import AdaptiveRemediation from './components/AdaptiveRemediation';
import { SoundEffects } from './components/SoundEffects';

export default function App() {
  const [view, setView] = useState('student'); // 'lecturer' | 'student'
  const [studentStep, setStudentStep] = useState('lobby'); // 'lobby' | 'playing' | 'result'
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [systemStatus, setSystemStatus] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [playerProfile, setPlayerProfile] = useState(null);
  const [resultData, setResultData] = useState(null);

  const refreshStatus = async () => {
    try {
      const res = await fetch('/api/system/status');
      const data = await res.json();
      setSystemStatus(data);
    } catch (e) {
      console.warn("Status check error", e);
    }
  };

  const fetchStudentQuiz = async () => {
    try {
      const res = await fetch('/api/student/current-quiz');
      const data = await res.json();
      setQuizData(data);
    } catch (e) {
      console.warn("Fetch quiz error", e);
    }
  };

  useEffect(() => {
    refreshStatus();
    fetchStudentQuiz();
  }, [view]);

  // Handle Start Game from Lobby
  const handleStartGame = (profile) => {
    setPlayerProfile(profile);
    setStudentStep('playing');
  };

  // Handle Submit Quiz
  const handleSubmitQuiz = async (answers) => {
    try {
      const res = await fetch('/api/student/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: playerProfile?.name || "Học viên",
          answers: answers
        })
      });
      const data = await res.json();
      setResultData(data);
      setStudentStep('result');
      refreshStatus();
    } catch (e) {
      alert("Lỗi nộp bài: " + e.message);
    }
  };

  const handleResetGame = () => {
    SoundEffects.click();
    setStudentStep('lobby');
    fetchStudentQuiz();
  };

  return (
    <div className="min-h-screen bg-quiz-dark flex flex-col antialiased selection:bg-purple-600 selection:text-white">
      <Header
        view={view}
        setView={(v) => {
          setView(v);
          if (v === 'student') setStudentStep('lobby');
        }}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
        systemStatus={systemStatus}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {view === 'lecturer' ? (
          <TeacherStudio
            systemStatus={systemStatus}
            refreshStatus={refreshStatus}
            onQuizPublished={() => {
              fetchStudentQuiz();
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col">
            {studentStep === 'lobby' && (
              <QuizLobby
                quizTitle={quizData?.quiz_title}
                isPublished={quizData?.is_published}
                onStartGame={handleStartGame}
              />
            )}

            {studentStep === 'playing' && quizData?.questions && (
              <QuizPlayer
                questions={quizData.questions}
                playerProfile={playerProfile}
                onSubmitQuiz={handleSubmitQuiz}
              />
            )}

            {studentStep === 'result' && (
              <AdaptiveRemediation
                resultData={resultData}
                onResetGame={handleResetGame}
              />
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-quiz-border bg-quiz-panel/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-slate-400">
            K4 AI Thực Chiến • Hệ Thống Sinh Quiz Có Căn Cứ & Vòng Lặp Thích Ứng (Quiz.com Style)
          </p>
          <p className="font-mono text-[11px] text-slate-500">
            React 19 • Tailwind CSS • Microsoft MarkItDown • MySQL Database
          </p>
        </div>
      </footer>
    </div>
  );
}
