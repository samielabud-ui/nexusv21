
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import StatsDashboard from './components/StatsDashboard';
import QuestionsView from './components/QuestionsView';
import PBLView from './components/PBLView';
import MorfoView from './components/MorfoView';
import HPView from './components/HPView';
import StudyView from './components/StudyView';
import ManualsView from './components/ManualsView';
import PremiumView from './components/PremiumView';
import AuthView from './components/AuthView';
import AdminView from './components/AdminView';
import ChatSidebar from './components/ChatSidebar';
import MandatoryUpdate from './components/MandatoryUpdate';
import CycleSelection from './components/CycleSelection';
import UserProfileMenu from './components/UserProfileMenu';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, updateDoc, onSnapshot, collection, query, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { UserStats, ActivityItem } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'inicio' | 'questoes' | 'pbl' | 'premium' | 'morfo' | 'hp' | 'foco' | 'manuais' | 'admin'>('inicio');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [needsProfileUpdate, setNeedsProfileUpdate] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const [userStats, setUserStats] = useState<UserStats>({
    displayName: '',
    totalAnswered: 0,
    totalCorrect: 0,
    totalErrors: 0,
    streak: 0,
    points: 0,
    ciclo: '',
    isPremium: false,
    plan: 'basic',
    dailyUsage: 0,
    openedContentIds: [],
    dailyPointedContent: [],
    studyActive: false,
    dailyStudyTime: 0,
    totalStudyTime: 0,
    themePreference: 'dark',
    setupComplete: false
  });

  const [allUsersRanking, setAllUsersRanking] = useState<any[]>([]);
  const [activeStudyTime, setActiveStudyTime] = useState(0);
  const [isTabActive, setIsTabActive] = useState(true);
  const studyIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    let unsubStats: (() => void) | undefined;
    let unsubRanking: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.isBanned) {
               alert("Sua conta foi banida por violação das regras NexusBQ.");
               auth.signOut();
               return;
            }
            if (!data.setupComplete) setNeedsSetup(true);
            else if (!data.medCourse) setNeedsProfileUpdate(true);
            else {
               setNeedsSetup(false);
               setNeedsProfileUpdate(false);
            }

            unsubStats = onSnapshot(userDocRef, (docSnap) => {
              if (docSnap.exists()) {
                const statsData = docSnap.data();
                setUserStats({ uid: currentUser.uid, ...statsData } as any);
                if (statsData.themePreference) setTheme(statsData.themePreference);
              }
            });

            unsubRanking = onSnapshot(query(collection(db, "users")), (snapshot) => {
              setAllUsersRanking(snapshot.docs.map(doc => ({ id: doc.id, uid: doc.id, ...doc.data() })));
            });
          } else {
            setNeedsSetup(true);
          }
          setUser(currentUser);
        } else {
          setUser(null);
          setNeedsSetup(false);
          setNeedsProfileUpdate(false);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    });

    return () => { unsubscribeAuth(); if (unsubStats) unsubStats(); if (unsubRanking) unsubRanking(); };
  }, []);

  const startStudySession = async () => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), { studyActive: true, studyStartTime: Date.now() });
  };

  const stopStudySession = async () => {
    if (!user || !userStats.studyStartTime) return;
    const elapsed = Math.floor((Date.now() - userStats.studyStartTime) / 1000);
    const earnedPoints = Math.floor(Math.pow(elapsed / 1200, 1.8) * 8);
    await updateDoc(doc(db, "users", user.uid), {
      studyActive: false,
      studyStartTime: null,
      dailyStudyTime: increment(elapsed),
      points: increment(earnedPoints)
    });
  };

  const handleIncentive = async (targetId: string) => {
    if (!user) return;
    await updateDoc(doc(db, "users", targetId), {
      recentIncentive: { fromName: userStats.displayName, fromId: user.uid, timestamp: Date.now() }
    });
  };

  const addActivity = async (item: Omit<ActivityItem, 'timestamp'>) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const updated = [{ ...item, timestamp: new Date() }, ...(userStats.recentActivity || [])].slice(0, 6);
    await updateDoc(userRef, { recentActivity: updated });
  };

  if (loading) return null;
  if (!user) return <AuthView />;
  if (needsSetup) return <CycleSelection onComplete={() => setNeedsSetup(false)} />;
  if (needsProfileUpdate) return <MandatoryUpdate userId={user.uid} onComplete={() => setNeedsProfileUpdate(false)} />;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-nexus-bg text-neutral-900 dark:text-nexus-text-main flex flex-col relative transition-colors duration-300">
      <Header 
        currentView={view} 
        onNavigate={setView} 
        userStats={userStats} 
        onOpenProfile={() => setProfileMenuOpen(true)}
        onToggleChat={() => setChatOpen(!chatOpen)}
        activeStudyTime={activeStudyTime}
      />
      
      <UserProfileMenu 
        isOpen={profileMenuOpen} 
        onClose={() => setProfileMenuOpen(false)} 
        userStats={userStats} 
        onNavigateAdmin={() => setView('admin')}
      />

      <ChatSidebar isOpen={chatOpen} onClose={() => setChatOpen(false)} userStats={userStats} />
      
      <main className="max-w-[1400px] mx-auto pb-20 px-4 md:px-8 w-full flex-grow">
        {view === 'inicio' ? <StatsDashboard stats={userStats} allUsers={allUsersRanking} onNavigate={setView} /> : (
          <div className="pt-8">
            {view === 'questoes' && <QuestionsView userStats={userStats} onAddActivity={addActivity} />}
            {view === 'pbl' && <PBLView userStats={userStats} onAddActivity={addActivity} />}
            {view === 'morfo' && <MorfoView userStats={userStats} onAddActivity={addActivity} />}
            {view === 'hp' && <HPView isPremium={userStats.isPremium} onAddActivity={addActivity} userStats={userStats} />}
            {view === 'premium' && <PremiumView userStats={userStats} onAddActivity={addActivity} />}
            {view === 'manuais' && <ManualsView userStats={userStats} onAddActivity={addActivity} />}
            {view === 'admin' && <AdminView />}
            {view === 'foco' && (
              <StudyView 
                userStats={userStats} 
                onStart={startStudySession} 
                onStop={stopStudySession} 
                allUsers={allUsersRanking}
                currentElapsed={activeStudyTime}
                isTabActive={isTabActive}
                onIncentive={handleIncentive}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
