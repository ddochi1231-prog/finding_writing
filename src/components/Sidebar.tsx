import { SidebarTab } from '../types';
import { Sprout, BookOpen, PenTool, Image, Award, Star, LogOut, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  role: 'student' | 'teacher';
  userName: string;
  studentNo?: string;
  classId: string;
  currentTab: SidebarTab;
  onChangeTab: (tab: SidebarTab) => void;
  observationCount: number;
  onLogout: () => void;
}

export default function Sidebar({
  role,
  userName,
  studentNo,
  classId,
  currentTab,
  onChangeTab,
  observationCount,
  onLogout
}: SidebarProps) {
  
  // Tabs config based on role
  const menuItems = role === 'student' ? [
    { id: 'dashboard' as SidebarTab, name: '내 일지 모아보기 🌱', icon: BookOpen },
    { id: 'write' as SidebarTab, name: '새 관찰일지 쓰기 ✍️', icon: PenTool },
    { id: 'encyclopedia' as SidebarTab, name: '쑥쑥 생물 도감 📖', icon: Image },
    { id: 'badges' as SidebarTab, name: '나의 관찰 배지 🏅', icon: Award, badge: 'New' },
  ] : [
    { id: 'teacher_dashboard' as SidebarTab, name: '학급 모니터링 🏫', icon: GraduationCap }
  ];

  const getLevelName = (count: number) => {
    if (count >= 10) return '척척 생물 학자 🎓 (Lv.4)';
    if (count >= 5) return '열정 탐험 대장 🌻 (Lv.3)';
    if (count >= 2) return '쑥쑥 관찰 대장 🌱 (Lv.2)';
    return '아기 새싹 관찰자 🌿 (Lv.1)';
  };

  const getStarsCount = (count: number) => {
    if (count >= 10) return 3;
    if (count >= 5) return 2;
    if (count >= 2) return 1;
    return 0;
  };

  return (
    <aside className="w-full md:w-64 bg-[#e8f5ed] flex flex-col justify-between p-6 h-screen border-r-4 border-[#c2ebd1] shrink-0">
      {/* Upper Logo Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 p-2 bg-white rounded-2xl bubbly-shadow border-2 border-[#87d3a1]">
          <div className="p-2 bg-[#d1eedb] rounded-xl text-[#39a060]">
            <Sprout size={28} className="animate-bounce" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-[#2a6d45] tracking-wide leading-none">쑥쑥 일지</h1>
            <p className="text-[10px] text-[#528d69] font-medium mt-1">나만의 작은 관찰 기록</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-3" id="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left transition-all duration-300 font-bold text-xs ${
                  isActive
                    ? 'bg-white text-[#2a6d45] bubbly-shadow border-2 border-[#87d3a1] translate-x-1'
                    : 'text-[#5a7d65] hover:bg-[#dbede2] hover:text-[#2a6d45]'
                }`}
                style={{ minHeight: '44px' }}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={18} className={isActive ? 'text-[#39a060]' : 'text-[#7da78c]'} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-[#ffa45b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Card & Logout Button */}
      <div className="mt-auto space-y-4">
        <div className="bg-white rounded-2xl p-4 border-2 border-[#c2ebd1] bubbly-shadow relative overflow-hidden">
          {/* Decorative Sparkle Background */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#eefaf1] rounded-full -mr-8 -mt-8 -z-10" />
          
          <div className="flex flex-col items-center text-center">
            {/* Cute Avatar Container */}
            <div className="w-16 h-16 bg-[#d1eedb] rounded-full flex items-center justify-center border-2 border-[#87d3a1] relative mb-2">
              {role === 'student' ? (
                <Sprout size={32} className="text-[#39a060]" />
              ) : (
                <GraduationCap size={32} className="text-[#1d4ed8]" />
              )}
              <div className="absolute -bottom-1 -right-1 bg-[#ffa45b] text-white rounded-full p-1 border border-white">
                <Star size={12} fill="white" />
              </div>
            </div>

            {/* Stars display */}
            <div className="flex gap-1 mb-1">
              {Array.from({ length: 3 }).map((_, i) => {
                const isLit = role === 'student' ? getStarsCount(observationCount) > i : true;
                return (
                  <Star
                    key={i}
                    size={14}
                    fill={isLit ? "#fbc089" : "#e2e8f0"}
                    stroke={isLit ? "#fbc089" : "#cbd5e1"}
                  />
                );
              })}
            </div>

            <h3 className="font-extrabold text-[#2a6d45] text-base">
              {role === 'student' ? `${userName} 어린이` : `${userName} 선생님`}
            </h3>
            <p className="text-[10px] text-[#528d69] font-bold mt-0.5">
              {role === 'student' ? `3학년 2반 ${studentNo}번` : '선생님 포털 포트폴리오'}
            </p>
            <p className="text-[10px] text-amber-600 font-extrabold mt-1">
              {role === 'student' ? getLevelName(observationCount) : '지도 교사'}
            </p>
            
            {role === 'student' && (
              <>
                <div className="w-full bg-[#eefaf1] rounded-full h-2 mt-3 overflow-hidden">
                  <motion.div 
                    className="bg-[#39a060] h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (observationCount / 10) * 100)}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <div className="flex justify-between w-full text-[9px] text-[#7da78c] font-bold mt-1">
                  <span>일지 {observationCount}개</span>
                  <span>다음 등급까지 {Math.max(0, 10 - observationCount)}개</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Logout Trigger button */}
        <button
          onClick={onLogout}
          className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 text-gray-400 hover:text-rose-500 hover:border-rose-300 hover:bg-rose-50/50 flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
          style={{ minHeight: '38px' }}
        >
          <LogOut size={14} />
          <span>다시 로그인하기</span>
        </button>
      </div>
    </aside>
  );
}

