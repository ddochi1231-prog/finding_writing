import React, { useState } from 'react';
import { Sprout, User, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (role: 'student' | 'teacher', data: { classId: string; studentNo?: string; name: string }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [classId, setClassId] = useState('class-2');
  const [studentNo, setStudentNo] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState(''); // Added password state

  // Demode login values for quick grading & testing
  const classes = [
    { id: 'class-2', name: '3학년 2반' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'student') {
      if (!studentNo.trim()) {
        alert('출석 번호를 적어주세요! 😊');
        return;
      }
      if (!name.trim()) {
        alert('이름을 적어주세요! 😊');
        return;
      }
      onLogin('student', { classId, studentNo: studentNo.trim(), name: name.trim() });
    } else {
      if (!name.trim()) {
        alert('선생님 성함을 적어주세요! 🍎');
        return;
      }
      if (password !== '3267') { // Simple password check
        alert('비밀번호가 올바르지 않습니다.');
        return;
      }
      onLogin('teacher', { classId, name: name.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-[#f4fbf7] flex flex-col items-center justify-center p-4">
      {/* Upper Logo Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-white rounded-3xl bubbly-shadow border-4 border-[#87d3a1] flex items-center justify-center mx-auto mb-4">
          <Sprout size={48} className="text-[#39a060] animate-bounce" />
        </div>
        <h1 className="font-display text-4xl text-[#2a6d45] tracking-wide">쑥쑥 관찰일지 서랍장</h1>
        <p className="text-sm text-[#528d69] font-medium mt-2">초록초록 자연과 곤충 친구들을 관찰해 보아요! 🌱</p>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md border-4 border-[#c2ebd1] bubbly-shadow relative overflow-hidden"
      >
        {/* Role Select tabs */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-[#eefaf1] rounded-2xl border-2 border-[#c2ebd1]">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              role === 'student'
                ? 'bg-white text-[#2a6d45] shadow-sm border border-[#87d3a1]'
                : 'text-gray-400 hover:text-[#2a6d45]'
            }`}
            style={{ minHeight: '44px' }}
          >
            <User size={16} />
            <span>어린이 로그인</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              role === 'teacher'
                ? 'bg-white text-[#2a6d45] shadow-sm border border-[#87d3a1]'
                : 'text-gray-400 hover:text-[#2a6d45]'
            }`}
            style={{ minHeight: '44px' }}
          >
            <GraduationCap size={16} />
            <span>선생님 로그인</span>
          </button>
        </div>

        {/* Dynamic form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-[#528d69] mb-1.5">우리 반 고르기 🏫</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full bg-[#fcfdfd] border-2 border-[#c2ebd1] rounded-2xl px-4 py-3 text-sm text-[#2a4735] outline-none focus:border-[#39a060] font-bold cursor-pointer"
              style={{ minHeight: '48px' }}
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {role === 'student' ? (
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-extrabold text-[#528d69] mb-1.5">출석 번호 🔢</label>
                <input
                  type="number"
                  placeholder="예) 5"
                  value={studentNo}
                  onChange={(e) => setStudentNo(e.target.value)}
                  className="w-full bg-[#fcfdfd] border-2 border-[#c2ebd1] rounded-2xl px-4 py-3 text-sm text-[#2a4735] outline-none focus:border-[#39a060] text-center font-bold"
                  style={{ minHeight: '48px' }}
                  min="1"
                  max="50"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-extrabold text-[#528d69] mb-1.5">이름 ✍️</label>
                <input
                  type="text"
                  placeholder="예) 김지우"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#fcfdfd] border-2 border-[#c2ebd1] rounded-2xl px-4 py-3 text-sm text-[#2a4735] outline-none focus:border-[#39a060] font-bold"
                  style={{ minHeight: '48px' }}
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-extrabold text-[#528d69] mb-1.5">선생님 이름 ✍️</label>
              <input
                type="text"
                placeholder="예) 박은지 선생님"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#fcfdfd] border-2 border-[#c2ebd1] rounded-2xl px-4 py-3 text-sm text-[#2a4735] outline-none focus:border-[#39a060] font-bold"
                style={{ minHeight: '48px' }}
              />
              
              <label className="block text-xs font-extrabold text-[#528d69] mt-3 mb-1.5">비밀번호 🔒</label>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#fcfdfd] border-2 border-[#c2ebd1] rounded-2xl px-4 py-3 text-sm text-[#2a4735] outline-none focus:border-[#39a060] font-bold"
                style={{ minHeight: '48px' }}
              />
            </div>
          )}

          {/* Button submission */}
          <button
            type="submit"
            className="w-full mt-6 bg-[#39a060] hover:bg-[#2e834e] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 bubbly-shadow transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            style={{ minHeight: '48px' }}
          >
            <span>{role === 'student' ? '내 일지 서랍 열기' : '학급 관리 포털 들어가기'}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </motion.div>

      {/* Simple Instruction Card below login */}
      <div className="text-center mt-6 text-xs text-slate-400 font-bold max-w-xs leading-relaxed">
        ※ 학생은 학급 정보와 이름만으로 간편하게 시작할 수 있으며, 선생님은 학급 대시보드와 배지 관리를 이용할 수 있습니다.
      </div>
    </div>
  );
}
