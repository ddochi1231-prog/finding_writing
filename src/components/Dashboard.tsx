import { useState, useMemo } from 'react';
import { Observation, Category } from '../types';
import { Search, Plus, Sun, Cloud, CloudRain, Snowflake, ArrowRight, Calendar, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  observations: Observation[];
  onSelectObservation: (obs: Observation) => void;
  onClickNewDiary: () => void;
  onDeleteObservation: (id: string) => void;
}

export default function Dashboard({
  observations,
  onSelectObservation,
  onClickNewDiary,
  onDeleteObservation,
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');

  // Filter & Search Logic
  const filteredObservations = useMemo(() => {
    return observations.filter((obs) => {
      const matchesSearch =
        obs.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obs.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obs.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = activeCategory === 'all' || obs.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [observations, searchTerm, activeCategory]);

  // Weather Icon Helper
  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny':
        return <Sun className="text-amber-500 fill-amber-100" size={18} />;
      case 'cloudy':
        return <Cloud className="text-slate-400 fill-slate-100" size={18} />;
      case 'rainy':
        return <CloudRain className="text-blue-400 fill-blue-100" size={18} />;
      case 'snowy':
        return <Snowflake className="text-sky-300" size={18} />;
      default:
        return <Sun className="text-amber-500" size={18} />;
    }
  };

  const getWeatherName = (weather: string) => {
    switch (weather) {
      case 'sunny':
        return '맑음';
      case 'cloudy':
        return '흐림';
      case 'rainy':
        return '비옴';
      case 'snowy':
        return '눈옴';
      default:
        return '맑음';
    }
  };

  // Category Theme Helper
  const getCategoryTheme = (category: Category) => {
    switch (category) {
      case 'plant':
        return {
          bg: 'bg-[#f0f9f4]',
          border: 'border-[#a3e2bb]',
          shadow: 'bubbly-shadow',
          label: '식물',
          badgeBg: 'bg-[#d1eedb]',
          text: 'text-[#2a6d45]',
        };
      case 'insect':
        return {
          bg: 'bg-[#f4f7fc]',
          border: 'border-[#b8d4fc]',
          shadow: 'bubbly-shadow-blue',
          label: '곤충',
          badgeBg: 'bg-[#d0e3fc]',
          text: 'text-[#1d4ed8]',
        };
      case 'weather':
        return {
          bg: 'bg-[#fffbf4]',
          border: 'border-[#fbdcb8]',
          shadow: 'bubbly-shadow-orange',
          label: '날씨',
          badgeBg: 'bg-[#fce9d0]',
          text: 'text-[#b45309]',
        };
      case 'free':
        return {
          bg: 'bg-[#faf5ff]',
          border: 'border-[#ebd6fc]',
          shadow: 'bubbly-shadow-purple',
          label: '자유',
          badgeBg: 'bg-[#f1e1fc]',
          text: 'text-[#6d28d9]',
        };
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto h-screen">
      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-[#2a4735] flex items-center gap-2">
            내 관찰일지 서랍
            <span className="bg-[#c2ebd1] text-[#2a6d45] text-sm px-3 py-1 rounded-full font-bold">
              총 {observations.length}개
            </span>
          </h2>
        </div>

        {/* Search and Write Button */}
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64 bg-white rounded-2xl border-2 border-[#c2ebd1] focus-within:border-[#87d3a1] transition-colors p-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-[#7da78c]">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="무엇을 관찰했나요?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-transparent outline-none text-[#2a4735]"
              style={{ minHeight: '38px' }}
            />
          </div>

          <button
            onClick={onClickNewDiary}
            className="bg-[#39a060] hover:bg-[#2e834e] text-white font-bold px-5 py-3 rounded-2xl flex items-center gap-2 bubbly-shadow transition-all duration-300 scale-100 hover:scale-[1.03] active:scale-[0.98] shrink-0"
            style={{ minHeight: '44px' }}
          >
            <Plus size={20} />
            <span>새 일지 쓰기</span>
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all bubbly-shadow-sm border-2 ${
            activeCategory === 'all'
              ? 'bg-[#39a060] text-white border-[#39a060]'
              : 'bg-white text-[#5a7d65] border-[#c2ebd1] hover:bg-[#eefaf1]'
          }`}
          style={{ minHeight: '44px' }}
        >
          전체보기
        </button>
        <button
          onClick={() => setActiveCategory('plant')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all bubbly-shadow-sm border-2 ${
            activeCategory === 'plant'
              ? 'bg-[#39a060] text-white border-[#39a060]'
              : 'bg-white text-[#5a7d65] border-[#c2ebd1] hover:bg-[#eefaf1]'
          }`}
          style={{ minHeight: '44px' }}
        >
          🌱 식물
        </button>
        <button
          onClick={() => setActiveCategory('insect')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all bubbly-shadow-sm border-2 ${
            activeCategory === 'insect'
              ? 'bg-[#1d4ed8] text-white border-[#1d4ed8]'
              : 'bg-white text-[#5a7d65] border-[#c2ebd1] hover:bg-[#eefaf1]'
          }`}
          style={{ minHeight: '44px' }}
        >
          🦋 곤충
        </button>
        <button
          onClick={() => setActiveCategory('weather')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all bubbly-shadow-sm border-2 ${
            activeCategory === 'weather'
              ? 'bg-[#b45309] text-white border-[#b45309]'
              : 'bg-white text-[#5a7d65] border-[#c2ebd1] hover:bg-[#eefaf1]'
          }`}
          style={{ minHeight: '44px' }}
        >
          🌤️ 날씨
        </button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* New Post Card Placeholder */}
        <div
          onClick={onClickNewDiary}
          className="border-4 border-dashed border-[#c2ebd1] hover:border-[#87d3a1] bg-white rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[320px] group transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="w-16 h-16 bg-[#eefaf1] rounded-full flex items-center justify-center text-[#39a060] group-hover:scale-110 transition-transform mb-4 border-2 border-[#c2ebd1]">
            <Plus size={32} />
          </div>
          <h3 className="font-bold text-lg text-[#2a6d45]">새로운 관찰일지</h3>
          <p className="text-sm text-[#7da78c] mt-2 leading-relaxed">
            오늘 발견한 신기하고 재미있는 것을<br />일지로 남겨봐요!
          </p>
        </div>

        {/* Observation Cards list */}
        <AnimatePresence mode="popLayout">
          {filteredObservations.map((obs) => {
            const theme = getCategoryTheme(obs.category);
            return (
              <motion.div
                layout
                key={obs.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`${theme.bg} rounded-3xl p-6 border-4 ${theme.border} ${theme.shadow} flex flex-col justify-between relative overflow-hidden h-full min-h-[320px] group`}
              >
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('이 관찰일지를 삭제할까요?')) {
                      onDeleteObservation(obs.id);
                    }
                  }}
                  className="absolute top-4 right-4 p-1.5 bg-white/80 hover:bg-red-50 text-[#7da78c] hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  style={{ minWidth: '32px', minHeight: '32px' }}
                >
                  <Trash2 size={16} />
                </button>

                <div className="cursor-pointer" onClick={() => onSelectObservation(obs)}>
                  {/* Drawing / Drawing Placeholder Area */}
                  <div className="w-full h-32 bg-white rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center mb-4 relative">
                    {obs.drawingDataUrl ? (
                      <img
                        src={obs.drawingDataUrl}
                        alt={obs.title}
                        className="w-full h-full object-contain p-2"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center flex flex-col items-center">
                        <span className="text-5xl mb-1 filter drop-shadow-sm">{obs.emoji}</span>
                        <span className="text-[10px] text-gray-400 font-bold">손그림이 없어요</span>
                      </div>
                    )}
                    {/* Category Stamp Badge */}
                    <span className={`absolute top-2 right-2 text-xs font-bold px-2.5 py-1 rounded-full ${theme.badgeBg} ${theme.text}`}>
                      {obs.emoji} {theme.label}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {obs.date}
                    </span>
                    <span className="flex items-center gap-1">
                      {getWeatherIcon(obs.weather)}
                      {getWeatherName(obs.weather)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-1 group-hover:text-[#2a6d45] transition-colors mb-2">
                    {obs.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {obs.description}
                  </p>
                </div>

                {/* Footer area inside card */}
                <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-3 mt-auto">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 max-w-[70%]">
                    {obs.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-white border border-gray-200 text-[#5a7d65] px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Detail view arrow button */}
                  <button
                    onClick={() => onSelectObservation(obs)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white border-2 border-gray-100 hover:border-[#39a060] transition-colors`}
                    style={{ minHeight: '36px', minWidth: '36px' }}
                  >
                    <ArrowRight size={16} className="text-[#39a060]" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredObservations.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border-4 border-dashed border-[#c2ebd1] p-8 max-w-lg mx-auto mt-12 bubbly-shadow-sm">
          <p className="text-5xl mb-4">🔍</p>
          <h3 className="text-xl font-bold text-[#2a6d45]">일지를 찾지 못했어요</h3>
          <p className="text-sm text-[#7da78c] mt-2">
            다른 단어로 검색해보거나 새로운 일지를 써보세요!
          </p>
        </div>
      )}
    </div>
  );
}
