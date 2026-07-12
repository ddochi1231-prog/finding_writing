import { useState, useEffect } from 'react';
import { SchoolClass, Student, Observation, Badge, Category } from '../types';
import { Users, BookOpen, ToggleLeft, ToggleRight, Search, Filter, ShieldCheck, Download, Trash2, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface TeacherDashboardProps {
  teacherName: string;
  onLogout: () => void;
}

export default function TeacherDashboard({ teacherName, onLogout }: TeacherDashboardProps) {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  
  const [selectedClassId, setSelectedClassId] = useState('class-1');
  const [selectedStudentNo, setSelectedStudentNo] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeTab, setActiveTab] = useState<'students' | 'observations' | 'badges'>('students');

  // Badge list template for activation management
  const [badges, setBadges] = useState<Badge[]>([
    { id: 'badge-1', title: '초록 첫걸음 🌱', description: '생물 일지를 1개 작성하면 활성화됩니다.', iconName: 'Sprout', achieved: false, requirement: '1', progress: 0, targetCount: 1, currentCount: 0 },
    { id: 'badge-2', title: '미술 천재 🎨', description: '관찰 일지에 그림을 직접 그리면 활성화됩니다.', iconName: 'Palette', achieved: false, requirement: '1', progress: 0, targetCount: 1, currentCount: 0 },
    { id: 'badge-3', title: '관찰 대장 🌻', description: '관찰 일지를 누적 3개 쓰면 활성화됩니다.', iconName: 'Award', achieved: false, requirement: '3', progress: 0, targetCount: 3, currentCount: 0 },
    { id: 'badge-4', title: '생태 보디가드 🐞', description: '곤충 카테고리를 2개 쓰면 활성화됩니다.', iconName: 'Heart', achieved: false, requirement: '2', progress: 0, targetCount: 2, currentCount: 0 },
    { id: 'badge-5', title: '기상 캐스터 🌧️', description: '날씨 일지를 2개 쓰면 활성화됩니다.', iconName: 'CloudRain', achieved: false, requirement: '2', progress: 0, targetCount: 2, currentCount: 0 },
    { id: 'badge-6', title: 'AI 질문왕 💬', description: 'AI 박사님께 궁금한 점을 질문하면 활성화됩니다.', iconName: 'MessageSquare', achieved: false, requirement: '1', progress: 0, targetCount: 1, currentCount: 0 },
  ]);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/teacher/dashboard');
      const data = await response.json();
      setClasses(data.classes || []);
      setStudents(data.students || []);
      setObservations(data.observations || []);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter students based on chosen class
  const classStudents = students.filter(s => s.classId === selectedClassId);

  // Filter observations based on class, student, category, search
  const filteredObservations = observations.filter((obs) => {
    const matchClass = obs.classId === selectedClassId;
    const matchStudent = selectedStudentNo === 'all' || obs.studentNo === selectedStudentNo;
    const matchCategory = selectedCategory === 'all' || obs.category === selectedCategory;
    const matchSearch = obs.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        obs.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (obs.studentName && obs.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchClass && matchStudent && matchCategory && matchSearch;
  });

  // Handle toggle class badge activation
  const handleToggleBadge = async (badgeId: string) => {
    try {
      const response = await fetch('/api/teacher/badges/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: selectedClassId, badgeId })
      });
      const data = await response.json();
      if (data.success) {
        setClasses(prev => prev.map(c => c.id === selectedClassId ? { ...c, activeBadges: data.activeBadges } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getActiveBadgesForClass = () => {
    const currentClass = classes.find(c => c.id === selectedClassId);
    return currentClass ? currentClass.activeBadges : [];
  };

  const handleDeleteObservation = async (id: string) => {
    if (!confirm('어린이의 관찰 일지를 삭제하시겠습니까? 😢')) return;

    try {
      const response = await fetch(`/api/student/observation/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setObservations(prev => prev.filter(o => o.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 bg-[#f8faf9] p-6 h-screen overflow-y-auto w-full">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-100 pb-5 mb-6">
        <div>
          <span className="text-xs font-bold text-[#39a060] bg-[#e8f5ed] px-2.5 py-1 rounded-full border border-[#87d3a1]">
            교사 모니터링 포털 🏫
          </span>
          <h2 className="text-2xl font-extrabold text-slate-800 mt-2 flex items-center gap-1.5">
            {teacherName} 선생님, 환영합니다! 🍎
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">우리 반 학생들의 성장을 실시간으로 관찰하고 피드백을 전달해보세요.</p>
        </div>

        <button
          onClick={onLogout}
          className="bg-white border-2 border-gray-200 hover:border-rose-200 hover:bg-rose-50 text-gray-600 hover:text-rose-600 font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
          style={{ minHeight: '38px' }}
        >
          학급 관리 로그아웃
        </button>
      </div>

      {/* Control panel for Class and Filter selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Class Selection */}
        <div className="bg-white p-4 rounded-2xl border-2 border-[#eefaf1] shadow-sm">
          <label className="block text-xs font-bold text-gray-400 mb-2">담당 학급 선택 🏫</label>
          <div className="flex gap-2">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => {
                  setSelectedClassId(cls.id);
                  setSelectedStudentNo('all');
                }}
                className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  selectedClassId === cls.id
                    ? 'bg-[#39a060] text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                style={{ minHeight: '38px' }}
              >
                {cls.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Class Status statistics */}
        <div className="bg-white p-4 rounded-2xl border-2 border-[#eefaf1] shadow-sm flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-gray-400 block">학급 총 관찰 건수 📝</span>
            <span className="text-2xl font-extrabold text-[#39a060] mt-1 block">
              {observations.filter(o => o.classId === selectedClassId).length}건
            </span>
          </div>
          <div className="w-10 h-10 bg-[#e8f5ed] border border-[#87d3a1] rounded-xl flex items-center justify-center text-[#39a060]">
            <BookOpen size={20} />
          </div>
        </div>

        {/* Dynamic Badge Activation count */}
        <div className="bg-white p-4 rounded-2xl border-2 border-[#eefaf1] shadow-sm flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-gray-400 block">진행 중인 활성 배지 🎖️</span>
            <span className="text-2xl font-extrabold text-blue-600 mt-1 block">
              {getActiveBadgesForClass().length}개 / 6개
            </span>
          </div>
          <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-blue-500">
            <Users size={20} />
          </div>
        </div>
      </div>

      {/* Main Tabs switching container */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Navigation Head */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'students' ? 'bg-[#39a060] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              style={{ minHeight: '36px' }}
            >
              학생 명부 및 현황 ({classStudents.length}명)
            </button>
            <button
              onClick={() => setActiveTab('observations')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'observations' ? 'bg-[#39a060] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              style={{ minHeight: '36px' }}
            >
              관찰 일지 전체 모아보기 ({filteredObservations.length}개)
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'badges' ? 'bg-[#39a060] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
              style={{ minHeight: '36px' }}
            >
              학급 도전 배지 제어 🎖️
            </button>
          </div>
        </div>

        {/* Tab Body Contents */}
        <div className="p-6">
          {/* TAB 1: Students Dashboard */}
          {activeTab === 'students' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classStudents.map((std) => {
                const stdObservations = observations.filter(
                  o => o.classId === selectedClassId && o.studentNo === std.studentNo
                );
                return (
                  <div
                    key={std.studentNo}
                    className="p-5 border-2 border-slate-100 rounded-2xl flex items-center justify-between hover:border-[#87d3a1] transition-all bg-slate-50/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded-md">
                          {std.studentNo}번
                        </span>
                        <h4 className="font-extrabold text-slate-700 text-sm">{std.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 font-bold">
                        총 관찰: <span className="text-[#39a060]">{stdObservations.length}회</span>
                      </p>
                      
                      {/* Short list of observed items */}
                      <div className="flex gap-1 mt-2.5 overflow-x-auto py-1">
                        {stdObservations.slice(0, 3).map((obs) => (
                          <span
                            key={obs.id}
                            title={obs.title}
                            className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-slate-100 text-sm cursor-help"
                          >
                            {obs.emoji || '📝'}
                          </span>
                        ))}
                        {stdObservations.length > 3 && (
                          <span className="text-[10px] bg-slate-200 text-slate-500 font-bold px-1.5 rounded-lg flex items-center">
                            +{stdObservations.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedStudentNo(std.studentNo);
                        setActiveTab('observations');
                      }}
                      className="bg-white border border-slate-200 text-slate-500 font-bold text-[10px] px-3 py-1.5 rounded-lg hover:text-[#39a060] hover:border-[#39a060] transition-colors cursor-pointer"
                      style={{ minHeight: '28px' }}
                    >
                      기록 보기
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: Observations View & Filtering */}
          {activeTab === 'observations' && (
            <div className="space-y-4">
              {/* Filter inputs header */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {/* Student specific filter select */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">학생:</span>
                  <select
                    value={selectedStudentNo}
                    onChange={(e) => setSelectedStudentNo(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-600 font-bold"
                    style={{ minHeight: '32px' }}
                  >
                    <option value="all">전체 학생</option>
                    {classStudents.map(s => (
                      <option key={s.studentNo} value={s.studentNo}>
                        {s.studentNo}번 - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category filter select */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">카테고리:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
                    className="bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-600 font-bold"
                    style={{ minHeight: '32px' }}
                  >
                    <option value="all">전체 생물</option>
                    <option value="plant">🌱 식물 관찰</option>
                    <option value="insect">🦋 곤충 관찰</option>
                    <option value="weather">☁️ 기상 변화</option>
                    <option value="free">📝 자유 일지</option>
                  </select>
                </div>

                {/* Search Term input */}
                <div className="flex-1 min-w-[200px] relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="어린이 이름, 식물 이름 검색..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none focus:border-[#39a060]"
                    style={{ minHeight: '32px' }}
                  />
                </div>
              </div>

              {/* Submitting items count and logs list */}
              {filteredObservations.length > 0 ? (
                <div className="space-y-4">
                  {filteredObservations.map((obs) => (
                    <div
                      key={obs.id}
                      className="p-5 border-2 border-slate-100 rounded-3xl bg-white shadow-sm hover:border-[#87d3a1] transition-all relative flex flex-col md:flex-row gap-5"
                    >
                      {/* Left Drawing Preview (If available) */}
                      {obs.drawingDataUrl && (
                        <div className="w-28 h-28 bg-[#fbfdfc] border border-gray-100 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={obs.drawingDataUrl}
                            alt="drawing"
                            className="object-contain w-full h-full"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Content Right */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-[#e8f5ed] border border-[#87d3a1] text-[#39a060] px-2 py-0.5 rounded-full font-bold">
                              {obs.studentName || '김지우'} 학생 ({obs.studentNo}번)
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-0.5">
                              <Calendar size={12} />
                              {obs.date}
                            </span>
                          </div>

                          <button
                            onClick={() => handleDeleteObservation(obs.id)}
                            className="text-gray-400 hover:text-rose-500 p-1"
                            title="삭제"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                          <span className="text-lg">{obs.emoji || '📝'}</span>
                          {obs.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                          {obs.description}
                        </p>

                        {/* AI Doc Feedback block */}
                        {obs.aiFeedback && (
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 font-bold leading-relaxed mt-2">
                            <span className="text-[#39a060] font-extrabold">🌱 AI 생물 박사의 피드백:</span>{' '}
                            {obs.aiFeedback}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 font-bold">
                  조건에 일치하는 학생들의 관찰 기록이 아직 존재하지 않습니다.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Badge Control Settings */}
          {activeTab === 'badges' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-800 font-medium leading-relaxed">
                📢 <strong>수업 활용 팁:</strong> 특정 배지 도전을 한시적으로 켜고 끄며 수업 진도를 자유롭게 조율할 수 있습니다. 
                비활성화된 배지는 어린이 배지 캐비닛에서 임시 잠금 처리됩니다.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {badges.map((badge) => {
                  const isEnabled = getActiveBadgesForClass().includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`p-4 border-2 rounded-2xl flex items-center justify-between transition-all ${
                        isEnabled ? 'border-[#87d3a1] bg-[#f0f9f4]/30' : 'border-slate-200 bg-slate-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 ${
                          isEnabled ? 'bg-white border-[#87d3a1] text-[#39a060]' : 'bg-slate-100 border-slate-300 text-slate-400'
                        }`}>
                          🏅
                        </div>
                        <div>
                          <h4 className={`font-bold text-xs ${isEnabled ? 'text-slate-800' : 'text-slate-400'}`}>
                            {badge.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {badge.description}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleBadge(badge.id)}
                        className={`transition-colors p-1 rounded-lg cursor-pointer`}
                        style={{ minHeight: '36px' }}
                      >
                        {isEnabled ? (
                          <span className="flex items-center gap-1.5 text-[#39a060] font-extrabold text-xs">
                            사용 중
                            <ToggleRight size={28} />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-slate-400 font-extrabold text-xs">
                            안함
                            <ToggleLeft size={28} />
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
