import { Observation } from '../types';
import { X, Calendar, Sun, Cloud, CloudRain, Snowflake, Heart, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface DiaryDetailModalProps {
  observation: Observation | null;
  onClose: () => void;
}

export default function DiaryDetailModal({ observation, onClose }: DiaryDetailModalProps) {
  const [isLiked, setIsLiked] = useState(false);

  if (!observation) return null;

  // Weather icon helper
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

  // Category Style helper
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'plant':
        return { label: '🌱 식물 관찰', bg: 'bg-[#d1eedb] text-[#2a6d45]', border: 'border-[#a3e2bb]' };
      case 'insect':
        return { label: '🦋 곤충 관찰', bg: 'bg-[#d0e3fc] text-[#1d4ed8]', border: 'border-[#b8d4fc]' };
      case 'weather':
        return { label: '🌤️ 날씨 관찰', bg: 'bg-[#fce9d0] text-[#b45309]', border: 'border-[#fbdcb8]' };
      case 'free':
        return { label: '🎨 자유 관찰', bg: 'bg-[#f1e1fc] text-[#6d28d9]', border: 'border-[#ebd6fc]' };
      default:
        return { label: '📝 기록 일지', bg: 'bg-gray-100 text-gray-700', border: 'border-gray-200' };
    }
  };

  const theme = getCategoryTheme(observation.category);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Background overlay click */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden border-4 border-[#c2ebd1] bubbly-shadow relative z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header decoration band */}
        <div className="h-3 bg-gradient-to-r from-[#87d3a1] via-[#fbc089] to-[#97c2fc]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full border border-gray-100 transition-colors cursor-pointer"
          style={{ minHeight: '40px', minWidth: '40px' }}
        >
          <X size={18} />
        </button>

        <div className="p-6 md:p-8 overflow-y-auto">
          {/* Top metadata tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${theme.bg} ${theme.border}`}>
              {theme.label}
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold ml-1">
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {observation.date}
              </span>
              <span className="flex items-center gap-1">
                {getWeatherIcon(observation.weather)}
                {getWeatherName(observation.weather)}
              </span>
            </div>
          </div>

          {/* Hand drawing canvas representation */}
          <div className="w-full aspect-[4/3] bg-[#f8fbf9] rounded-2xl border-2 border-dashed border-[#c2ebd1] overflow-hidden flex items-center justify-center p-4 mb-6 shadow-inner relative">
            {observation.drawingDataUrl ? (
              <img
                src={observation.drawingDataUrl}
                alt={observation.title}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-center flex flex-col items-center">
                <span className="text-7xl mb-2 filter drop-shadow-md">{observation.emoji}</span>
                <span className="text-xs text-gray-400 font-extrabold">그림 없이 소중한 글로 기록했어요!</span>
              </div>
            )}
            
            {/* Cute Sparkle effect decoration */}
            <div className="absolute bottom-3 left-3 text-[#ffa45b] animate-pulse">
              <Sparkles size={20} />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 leading-snug">
            {observation.title}
          </h3>

          {/* Content Body */}
          <div className="bg-[#fcfdfd] border-2 border-dashed border-gray-100 rounded-2xl p-5 mb-6">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
              {observation.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            {observation.tags?.map((tag) => (
              <span
                key={tag}
                className="bg-[#eefaf1] border border-[#a3e2bb] text-[#2a6d45] font-extrabold text-xs px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-gray-50/50 p-4 border-t border-dashed border-gray-100 flex items-center justify-between">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`px-4 py-2.5 rounded-xl border-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isLiked 
                ? 'bg-rose-50 text-rose-600 border-rose-300 shadow-sm scale-105' 
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
            style={{ minHeight: '40px' }}
          >
            <Heart size={16} fill={isLiked ? '#e11d48' : 'none'} className={isLiked ? 'text-rose-600' : 'text-gray-400'} />
            <span>{isLiked ? '좋아요 취소' : '참 잘했어요! ❤️'}</span>
          </button>

          <button
            onClick={onClose}
            className="bg-[#39a060] hover:bg-[#2e834e] text-white font-bold px-6 py-2.5 rounded-xl text-xs bubbly-shadow-sm transition-all cursor-pointer"
            style={{ minHeight: '40px' }}
          >
            서랍 닫기
          </button>
        </div>
      </motion.div>
    </div>
  );
}
