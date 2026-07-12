import { useState, useEffect } from 'react';
import { Observation, Badge, SidebarTab } from './types';
import { INITIAL_OBSERVATIONS, INITIAL_BADGES } from './data';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import WriteForm from './components/WriteForm';
import PhotoAlbum from './components/PhotoAlbum';
import BadgeCabinet from './components/BadgeCabinet';
import DiaryDetailModal from './components/DiaryDetailModal';
import Login from './components/Login';
import Encyclopedia from './components/Encyclopedia';
import TeacherDashboard from './components/TeacherDashboard';
import ChatBot from './components/ChatBot';
import { Sparkles, Sprout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [userName, setUserName] = useState('');
  const [studentNo, setStudentNo] = useState<string | undefined>(undefined);
  const [classId, setClassId] = useState('class-2');

  const [currentTab, setCurrentTab] = useState<SidebarTab>('dashboard');
  const [observations, setObservations] = useState<Observation[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);
  const [showBadgeCelebration, setShowBadgeCelebration] = useState<string | null>(null);

  // 1. Session restore logic & data loader from API or local fallback
  useEffect(() => {
    const restoreSession = async () => {
      const storedRole = sessionStorage.getItem('ss_role');
      const storedName = sessionStorage.getItem('ss_userName');
      const storedNo = sessionStorage.getItem('ss_studentNo');
      const storedClass = sessionStorage.getItem('ss_classId');

      if (storedRole && storedName) {
        setRole(storedRole as 'student' | 'teacher');
        setUserName(storedName);
        setStudentNo(storedNo || undefined);
        setClassId(storedClass || 'class-1');
        setIsLoggedIn(true);

        if (storedRole === 'student') {
          setCurrentTab('dashboard');
          // Fetch student's custom logs from api
          try {
            const response = await fetch('/api/student/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ classId: storedClass, studentNo: storedNo, name: storedName })
            });
            const data = await response.json();
            if (data.success) {
              setObservations(data.observations || []);
              updateBadgesProgress(data.observations || []);
            }
          } catch (err) {
            console.error('Session API login error, falling back to localState', err);
            const storedObs = localStorage.getItem('ss_observations');
            if (storedObs) {
              setObservations(JSON.parse(storedObs));
              updateBadgesProgress(JSON.parse(storedObs));
            } else {
              setObservations(INITIAL_OBSERVATIONS);
              updateBadgesProgress(INITIAL_OBSERVATIONS);
            }
          }
        } else {
          setCurrentTab('teacher_dashboard');
        }
      }
    };

    restoreSession();
  }, []);

  // Sync badges based on observation history
  const updateBadgesProgress = (updatedObservations: Observation[]) => {
    const plantCount = updatedObservations.filter((o) => o.category === 'plant').length;
    const insectCount = updatedObservations.filter((o) => o.category === 'insect').length;
    const weatherCount = updatedObservations.filter((o) => o.category === 'weather').length;
    const drawingCount = updatedObservations.filter((o) => !!o.drawingDataUrl).length;
    const totalCount = updatedObservations.length;

    let newlyAchievedBadgeTitle: string | null = null;

    const nextBadges = INITIAL_BADGES.map((badge) => {
      let currentCount = 0;
      switch (badge.id) {
        case 'badge-1': // Sprout (plant >= 1)
          currentCount = plantCount;
          break;
        case 'badge-2': // Flower (plant >= 3)
          currentCount = plantCount;
          break;
        case 'badge-3': // Bug (insect >= 1)
          currentCount = insectCount;
          break;
        case 'badge-4': // CloudSun (weather >= 1)
          currentCount = weatherCount;
          break;
        case 'badge-5': // Award (total >= 5)
          currentCount = totalCount;
          break;
        case 'badge-6': // Palette (drawings >= 1)
          currentCount = drawingCount;
          break;
        default:
          break;
      }

      const progress = Math.min(100, Math.floor((currentCount / badge.targetCount) * 100));
      const achieved = currentCount >= badge.targetCount;

      // Find if this badge was newly unlocked
      const previouslyAchieved = badges.find((b) => b.id === badge.id)?.achieved;
      if (achieved && previouslyAchieved === false) {
        newlyAchievedBadgeTitle = badge.title;
      }

      return {
        ...badge,
        currentCount,
        progress,
        achieved,
      };
    });

    setBadges(nextBadges);
    localStorage.setItem('ss_badges', JSON.stringify(nextBadges));

    if (newlyAchievedBadgeTitle) {
      setShowBadgeCelebration(newlyAchievedBadgeTitle);
      setTimeout(() => setShowBadgeCelebration(null), 4000);
    }
  };

  // 2. Handle Login
  const handleLogin = async (
    loginRole: 'student' | 'teacher',
    data: { classId: string; studentNo?: string; name: string }
  ) => {
    setRole(loginRole);
    setUserName(data.name);
    setStudentNo(data.studentNo);
    setClassId(data.classId);

    // Save login profile to session
    sessionStorage.setItem('ss_role', loginRole);
    sessionStorage.setItem('ss_userName', data.name);
    sessionStorage.setItem('ss_studentNo', data.studentNo || '');
    sessionStorage.setItem('ss_classId', data.classId);

    setIsLoggedIn(true);

    if (loginRole === 'student') {
      setCurrentTab('dashboard');
      // Call student login API
      try {
        const response = await fetch('/api/student/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ classId: data.classId, studentNo: data.studentNo, name: data.name })
        });
        const loginData = await response.json();
        if (loginData.success) {
          setObservations(loginData.observations || []);
          updateBadgesProgress(loginData.observations || []);
        }
      } catch (err) {
        console.error('API Student Login failed, falling back to localState', err);
        const storedObs = localStorage.getItem('ss_observations');
        if (storedObs) {
          setObservations(JSON.parse(storedObs));
          updateBadgesProgress(JSON.parse(storedObs));
        } else {
          setObservations(INITIAL_OBSERVATIONS);
          updateBadgesProgress(INITIAL_OBSERVATIONS);
        }
      }
    } else {
      setCurrentTab('teacher_dashboard');
    }
  };

  // 3. Save a new observation through server API
  const handleSaveObservation = async (newObsData: Omit<Observation, 'id'>) => {
    try {
      const response = await fetch('/api/student/observation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          studentNo,
          studentName: userName,
          ...newObsData
        })
      });
      const data = await response.json();
      
      if (data.success && data.observation) {
        const savedObservation: Observation = data.observation;
        const nextObservations = [savedObservation, ...observations];
        setObservations(nextObservations);
        localStorage.setItem('ss_observations', JSON.stringify(nextObservations));
        updateBadgesProgress(nextObservations);
      }
    } catch (err) {
      console.error('Failed to sync to API server, saving to local draft storage', err);
      const fallbackObservation: Observation = {
        ...newObsData,
        id: `obs-${Date.now()}`,
        studentNo,
        studentName: userName,
        classId
      };
      const nextObservations = [fallbackObservation, ...observations];
      setObservations(nextObservations);
      localStorage.setItem('ss_observations', JSON.stringify(nextObservations));
      updateBadgesProgress(nextObservations);
    }

    setCurrentTab('dashboard');
  };

  // 4. Delete an observation from server & local state
  const handleDeleteObservation = async (id: string) => {
    try {
      const response = await fetch(`/api/student/observation/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        const nextObservations = observations.filter((obs) => obs.id !== id);
        setObservations(nextObservations);
        localStorage.setItem('ss_observations', JSON.stringify(nextObservations));
        updateBadgesProgress(nextObservations);
      }
    } catch (err) {
      console.error('API deletion failed, deleting from local State only', err);
      const nextObservations = observations.filter((obs) => obs.id !== id);
      setObservations(nextObservations);
      localStorage.setItem('ss_observations', JSON.stringify(nextObservations));
      updateBadgesProgress(nextObservations);
    }
  };

  // 5. Handle Logout
  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    setObservations([]);
    setUserName('');
    setStudentNo(undefined);
  };

  // Render tab content
  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            observations={observations}
            onSelectObservation={setSelectedObservation}
            onClickNewDiary={() => setCurrentTab('write')}
            onDeleteObservation={handleDeleteObservation}
          />
        );
      case 'write':
        return (
          <WriteForm
            onSave={handleSaveObservation}
            onCancel={() => setCurrentTab('dashboard')}
          />
        );
      case 'encyclopedia':
        return <Encyclopedia observations={observations} />;
      case 'badges':
        return <BadgeCabinet badges={badges} />;
      case 'teacher_dashboard':
        return <TeacherDashboard teacherName={userName} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  // Show Login screen if not logged in
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#f4fbf7] overflow-hidden antialiased">
      {/* Sidebar navigation */}
      <Sidebar
        role={role}
        userName={userName}
        studentNo={studentNo}
        classId={classId}
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        observationCount={observations.length}
        onLogout={handleLogout}
      />

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col relative min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating AI ChatBot Bubble - available across all screens */}
      <ChatBot />

      {/* Diary detail view Modal */}
      <AnimatePresence>
        {selectedObservation && (
          <DiaryDetailModal
            observation={selectedObservation}
            onClose={() => setSelectedObservation(null)}
          />
        )}
      </AnimatePresence>

      {/* Badge Achievement Celebration Overlay */}
      <AnimatePresence>
        {showBadgeCelebration && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-[#39a060] text-white p-5 rounded-3xl border-4 border-white bubbly-shadow z-50 flex items-center gap-4 max-w-sm"
          >
            <div className="p-3 bg-white/20 rounded-2xl animate-bounce">
              <Sparkles size={28} className="text-amber-200 fill-amber-100" />
            </div>
            <div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">참 잘했어요! 👏</span>
              <h4 className="font-bold text-base mt-1">새로운 뱃지 획득!</h4>
              <p className="text-xs text-green-100 mt-0.5 font-medium">
                [{showBadgeCelebration}] 뱃지를 가방에 쏙 넣었어요.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
