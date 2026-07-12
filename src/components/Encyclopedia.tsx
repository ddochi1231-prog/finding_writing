import { useState, useEffect } from 'react';
import { Observation, Category, EncyclopediaEntry } from '../types';
import { BookOpen, Sparkles, Loader2, Award, ShieldCheck, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EncyclopediaProps {
  observations: Observation[];
}

export default function Encyclopedia({ observations }: EncyclopediaProps) {
  const [entries, setEntries] = useState<EncyclopediaEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<EncyclopediaEntry | null>(null);
  const [loadingEntryId, setLoadingEntryId] = useState<string | null>(null);

  // Parse observations to generate the list of observed living organisms
  useEffect(() => {
    // Collect distinct plant and insect subjects mentioned in observation titles/tags
    const distinctSubjects: { name: string; category: Category; emoji: string; date: string }[] = [];
    const seen = new Set<string>();

    observations.forEach((obs) => {
      if (obs.category === 'plant' || obs.category === 'insect') {
        // Try to find biological subject from tags first, otherwise split title
        let candidateName = '';
        if (obs.tags && obs.tags.length > 0) {
          candidateName = obs.tags[0]; // e.g., '강낭콩', '노랑나비'
        } else {
          // Clean title
          candidateName = obs.title.replace(/[🌱🦋🌻🐞🌼🌳🕸️🦗]/g, '').trim().split(' ')[0];
        }

        if (candidateName && candidateName.length > 1 && !seen.has(candidateName)) {
          seen.add(candidateName);
          distinctSubjects.push({
            name: candidateName,
            category: obs.category,
            emoji: obs.emoji || (obs.category === 'plant' ? '🌱' : '🦋'),
            date: obs.date
          });
        }
      }
    });

    // Merge into our entries state
    const currentEntries: EncyclopediaEntry[] = distinctSubjects.map((sub, idx) => ({
      id: `entry-${idx}`,
      name: sub.name,
      emoji: sub.emoji,
      category: sub.category,
      description: '', // Loaded lazily via Gemini or local fallback
      funFact: '',
      ecology: '',
      observedDate: sub.date
    }));

    setEntries(currentEntries);
  }, [observations]);

  const handleSelectEntry = async (entry: EncyclopediaEntry) => {
    // If details are already loaded, just open
    if (entry.description) {
      setSelectedEntry(entry);
      return;
    }

    setLoadingEntryId(entry.id);

    try {
      const response = await fetch('/api/gemini/encyclopedia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: entry.name })
      });
      const data = await response.json();

      const enrichedEntry = {
        ...entry,
        description: data.description || '이 친구는 신비한 대자연 속에서 살아가는 친구입니다.',
        funFact: data.funFact || '더 깊이 관찰하다 보면 숨겨진 비밀을 밝혀낼 수 있을 거예요!',
        ecology: data.ecology || '우리나라 들이나 산, 학교 화단 주위에서 자주 어울려 지냅니다.'
      };

      // Cache back to state
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? enrichedEntry : e)));
      setSelectedEntry(enrichedEntry);
    } catch (err) {
      console.error(err);
      // Fallback
      const fallbackEntry = {
        ...entry,
        description: `우리가 열심히 들여다본 아기자기한 '${entry.name}' 친구예요! 식물과 곤충 친구들은 햇빛과 흙, 바람을 타고 무럭무럭 자라난답니다.`,
        funFact: '자연에서 만난 소중한 친구들은 모두 지구의 생태계를 건강하게 지켜주는 수호천사예요!',
        ecology: '학교 정원이나 가까운 공원, 길가의 돌 틈 등 우리 곁에서 쉽게 찾을 수 있어요.'
      };
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? fallbackEntry : e)));
      setSelectedEntry(fallbackEntry);
    } finally {
      setLoadingEntryId(null);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto h-screen w-full">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-[#2a4735] flex items-center gap-2">
          쑥쑥 생물 도감 📖
          <span className="bg-[#1d4ed8] text-white text-xs px-2.5 py-1 rounded-full font-bold">
            수집 완료 {entries.length}종
          </span>
        </h2>
        <p className="text-sm text-[#7da78c] mt-1.5 font-medium">
          일지를 쓰면 내가 만난 곤충과 식물 친구들이 도감에 자동으로 등록돼요! 척척박사가 되어 보아요.
        </p>
      </header>

      {entries.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectEntry(entry)}
              className={`p-5 rounded-3xl border-4 bg-white cursor-pointer relative overflow-hidden transition-all bubbly-shadow-sm flex flex-col justify-between h-44 ${
                entry.category === 'plant' ? 'border-[#a3e2bb] hover:bg-[#f0f9f4]' : 'border-[#b8d4fc] hover:bg-[#f4f7fc]'
              }`}
            >
              <div>
                <span className="text-4xl filter drop-shadow-sm leading-none block mb-2">{entry.emoji}</span>
                <h3 className="font-bold text-base text-slate-800 line-clamp-1">{entry.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                  entry.category === 'plant' ? 'bg-[#d1eedb] text-[#2a6d45]' : 'bg-[#d0e3fc] text-[#1d4ed8]'
                }`}>
                  {entry.category === 'plant' ? '식물 도감' : '곤충 도감'}
                </span>
              </div>

              <div className="border-t border-dashed border-gray-100 pt-2 flex items-center justify-between mt-2">
                <span className="text-[9px] text-gray-400 font-bold">첫 관찰: {entry.observedDate}</span>
                {loadingEntryId === entry.id ? (
                  <Loader2 size={14} className="animate-spin text-[#39a060]" />
                ) : (
                  <span className="text-[10px] text-[#39a060] font-extrabold flex items-center gap-0.5">
                    자세히 ➜
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border-4 border-dashed border-[#c2ebd1] p-8 max-w-lg mx-auto mt-12 bubbly-shadow-sm">
          <p className="text-5xl mb-4">🌱</p>
          <h3 className="text-xl font-bold text-[#2a6d45]">아직 도감이 비어있어요</h3>
          <p className="text-sm text-[#7da78c] mt-2 leading-relaxed">
            식물(🌱)이나 곤충(🦋) 일지를 1개 이상 작성해 보세요!<br />
            그러면 도감 카드가 쏙 생겨나며 박사님의 설명이 가득 채워져요.
          </p>
        </div>
      )}

      {/* Encyclopedia Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setSelectedEntry(null)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden border-4 border-[#c2ebd1] bubbly-shadow relative z-10"
            >
              {/* Header colored bar */}
              <div className={`h-3 ${selectedEntry.category === 'plant' ? 'bg-[#39a060]' : 'bg-[#1d4ed8]'}`} />

              <div className="p-6 md:p-8 space-y-5">
                {/* Visual Header */}
                <div className="flex items-center gap-4 border-b-2 border-dashed border-gray-100 pb-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${
                    selectedEntry.category === 'plant' ? 'bg-[#f0f9f4] border-[#a3e2bb]' : 'bg-[#f4f7fc] border-[#b8d4fc]'
                  }`}>
                    <span className="text-4xl filter drop-shadow-sm">{selectedEntry.emoji}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-800">{selectedEntry.name} 도감</h3>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-block mt-1 ${
                      selectedEntry.category === 'plant' ? 'bg-[#d1eedb] text-[#2a6d45]' : 'bg-[#d0e3fc] text-[#1d4ed8]'
                    }`}>
                      {selectedEntry.category === 'plant' ? '우리 곁에 사는 초록 식물' : '신비한 매력의 곤충 친구'}
                    </span>
                  </div>
                </div>

                {/* Description block */}
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-extrabold text-gray-400 block mb-1">생물 설명 📝</span>
                    <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                      {selectedEntry.description}
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <span className="text-xs font-extrabold text-[#b45309] flex items-center gap-1 mb-1">
                      <Sparkles size={14} className="animate-spin" />
                      생물 박사 특급 비하인드 사실! 💡
                    </span>
                    <p className="text-xs text-amber-900 leading-relaxed font-bold">
                      {selectedEntry.funFact}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-extrabold text-gray-400 block mb-1">어떻게 살아갈까요? 🌳</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {selectedEntry.ecology}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-dashed border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold">도감 수집일: {selectedEntry.observedDate}</span>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="bg-[#39a060] hover:bg-[#2e834e] text-white font-bold px-6 py-2 rounded-xl text-xs bubbly-shadow-sm cursor-pointer"
                    style={{ minHeight: '38px' }}
                  >
                    도감 서랍 닫기
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
