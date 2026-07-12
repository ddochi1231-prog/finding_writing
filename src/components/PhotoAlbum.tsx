import { Observation } from '../types';
import { Camera, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PhotoAlbumProps {
  observations: Observation[];
  onSelectObservation: (obs: Observation) => void;
  onClickNewDiary: () => void;
}

export default function PhotoAlbum({ observations, onSelectObservation, onClickNewDiary }: PhotoAlbumProps) {
  // Filter only observations that have hand drawings
  const photoDiaries = observations.filter((obs) => !!obs.drawingDataUrl);

  return (
    <div className="flex-1 p-6 overflow-y-auto h-screen">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-[#2a4735] flex items-center gap-2">
          쑥쑥 사진첩 📸
          <span className="bg-[#ffa45b] text-white text-xs px-2.5 py-1 rounded-full font-bold">
            그림 일지 {photoDiaries.length}장
          </span>
        </h2>
        <p className="text-sm text-[#7da78c] mt-1.5 font-medium">
          내가 열심히 그린 세상에 하나뿐인 관찰 그림들이에요!
        </p>
      </header>

      {photoDiaries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {photoDiaries.map((obs, index) => (
            <motion.div
              key={obs.id}
              initial={{ opacity: 0, scale: 0.9, rotate: index % 2 === 0 ? -2 : 2 }}
              animate={{ opacity: 1, scale: 1, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
              whileHover={{ scale: 1.04, rotate: 0, zIndex: 10 }}
              transition={{ duration: 0.3 }}
              onClick={() => onSelectObservation(obs)}
              className="bg-[#fcfdfd] p-4 pb-6 rounded-xl border-2 border-gray-100 bubbly-shadow-orange cursor-pointer hover:border-[#ffa45b]"
            >
              {/* Photo Canvas Image frame */}
              <div className="aspect-[4/3] bg-white rounded-lg border border-gray-100 overflow-hidden relative flex items-center justify-center p-1.5 shadow-inner">
                <img
                  src={obs.drawingDataUrl}
                  alt={obs.title}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2 right-2 text-xs bg-white/90 border border-gray-100 px-2 py-0.5 rounded-full font-bold shadow-sm">
                  {obs.emoji}
                </span>
              </div>

              {/* Polaroid Handwritten Label */}
              <div className="mt-4 space-y-1 text-center">
                <span className="font-display text-[#b45309] text-base leading-none block">
                  {obs.title}
                </span>
                <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 font-bold">
                  <Calendar size={11} />
                  <span>{obs.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border-4 border-dashed border-[#fbc089] p-8 max-w-lg mx-auto mt-12 bubbly-shadow-orange">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-[#ffa45b] mx-auto mb-4 border-2 border-[#fbc089]">
            <Camera size={28} />
          </div>
          <h3 className="text-xl font-bold text-[#b45309]">그린 그림이 아직 없어요!</h3>
          <p className="text-sm text-[#b45309]/70 mt-2 leading-relaxed">
            관찰일지를 쓸 때 <strong>그림 그리기판</strong>에서 손그림을 그리면<br />멋진 폴라로이드 사진첩이 완성돼요!
          </p>
          <button
            onClick={onClickNewDiary}
            className="mt-6 bg-[#ffa45b] hover:bg-[#e08943] text-white font-bold px-6 py-2.5 rounded-2xl text-sm bubbly-shadow-orange transition-all cursor-pointer"
            style={{ minHeight: '44px' }}
          >
            첫 그림 일기 쓰러 가기 🎨
          </button>
        </div>
      )}
    </div>
  );
}
