import { Badge } from '../types';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';

interface BadgeCabinetProps {
  badges: Badge[];
}

export default function BadgeCabinet({ badges }: BadgeCabinetProps) {
  // Dinamically render lucide icons
  const renderBadgeIcon = (iconName: string, isAchieved: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = (Icons as any)[iconName];
    if (!IconComponent) return <Icons.Award size={36} />;

    return (
      <IconComponent
        size={36}
        className={`transition-all duration-500 ${
          isAchieved
            ? 'text-[#39a060] drop-shadow-[0_4px_6px_rgba(57,160,96,0.3)] animate-pulse'
            : 'text-gray-300'
        }`}
      />
    );
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto h-screen">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-[#2a4735] flex items-center gap-2">
          관찰 뱃지 보관함 🏆
          <span className="bg-[#39a060] text-white text-xs px-2.5 py-1 rounded-full font-bold">
            달성 {badges.filter((b) => b.achieved).length} / {badges.length}개
          </span>
        </h2>
        <p className="text-sm text-[#7da78c] mt-1.5 font-medium">
          열심히 관찰일지를 쓰면 귀엽고 멋진 탐험가 뱃지를 모을 수 있어요!
        </p>
      </header>

      {/* Grid Layout for Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`rounded-3xl p-6 border-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
              badge.achieved
                ? 'bg-gradient-to-br from-[#f0f9f4] to-white border-[#a3e2bb] bubbly-shadow'
                : 'bg-gray-50/70 border-gray-200/80 grayscale-[30%] opacity-80'
            }`}
          >
            {/* Achieved Badge Glow effect */}
            {badge.achieved && (
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#d1eedb] rounded-full filter blur-2xl opacity-70 -z-10" />
            )}

            {/* Upper Badge Info */}
            <div className="flex items-start gap-4">
              <div
                className={`p-4 rounded-2xl border-2 shrink-0 transition-transform duration-300 ${
                  badge.achieved
                    ? 'bg-white border-[#87d3a1] bubbly-shadow-sm scale-105'
                    : 'bg-white border-gray-200'
                }`}
              >
                {renderBadgeIcon(badge.iconName, badge.achieved)}
              </div>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3
                    className={`font-bold text-base leading-snug ${
                      badge.achieved ? 'text-[#2a6d45]' : 'text-gray-500'
                    }`}
                  >
                    {badge.title}
                  </h3>
                  {badge.achieved ? (
                    <span className="bg-[#39a060] text-white text-[9px] px-1.5 py-0.5 rounded-md font-extrabold shrink-0">
                      획득!
                    </span>
                  ) : (
                    <span className="bg-gray-200 text-gray-500 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold shrink-0">
                      도전중
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </div>

            {/* Lower Progress & Requirement */}
            <div className="mt-6 pt-4 border-t border-dashed border-gray-100">
              <div className="flex justify-between items-center text-[11px] text-gray-400 font-bold mb-1.5">
                <span>미션: {badge.requirement}</span>
                <span className={badge.achieved ? 'text-[#39a060]' : 'text-gray-400'}>
                  {badge.currentCount} / {badge.targetCount} ({badge.progress}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${badge.achieved ? 'bg-[#39a060]' : 'bg-[#a3e2bb]'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${badge.progress}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Motivational message board */}
      <div className="mt-12 p-6 bg-gradient-to-r from-[#eefaf1] to-[#e8f5ed] border-4 border-dashed border-[#c2ebd1] rounded-3xl flex items-center gap-4 max-w-3xl">
        <span className="text-4xl filter drop-shadow-sm">🎒</span>
        <div>
          <h4 className="font-bold text-[#2a6d45] text-base">관찰왕이 되어 보아요!</h4>
          <p className="text-xs text-[#528d69] leading-relaxed mt-1">
            강낭콩이 쑥쑥 자라듯 우리의 관찰력도 하루하루 무럭무럭 자라나고 있어요.<br />
            더 많은 사물을 호기심 어린 눈으로 지켜보고, 예쁜 일지로 기록해보세요! 화이팅! 🌱
          </p>
        </div>
      </div>
    </div>
  );
}
