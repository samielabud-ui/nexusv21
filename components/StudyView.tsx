
import React, { useMemo, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  getDocs, 
  where 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { UserStats, Group } from '../types';

interface StudyViewProps {
  userStats: UserStats;
  onStart: () => void;
  onStop: () => void;
  allUsers: any[];
  currentElapsed: number;
  isTabActive: boolean;
  onIncentive: (id: string) => void;
}

const StudyView: React.FC<StudyViewProps> = ({ userStats, onStart, onStop, allUsers, currentElapsed, isTabActive, onIncentive }) => {
  const [focoType, setFocoType] = useState<'global' | 'grupo'>(userStats.groupId ? 'grupo' : 'global');
  const [showIncentiveNotification, setShowIncentiveNotification] = useState<any>(null);
  
  const [groupName, setGroupName] = useState('');
  const [groupPass, setGroupPass] = useState('');
  const [loading, setLoading] = useState(false);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  };

  const handleCreateGroup = async () => {
    if (!groupName || !groupPass || !userStats.uid) return;
    setLoading(true);
    try {
      const groupRef = await addDoc(collection(db, "groups"), {
        name: groupName,
        password: groupPass,
        creatorId: userStats.uid,
        members: [userStats.uid],
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, "users", userStats.uid), { groupId: groupRef.id });
      setGroupName(''); setGroupPass('');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleJoinGroup = async () => {
    if (!groupName || !groupPass || !userStats.uid) return;
    setLoading(true);
    try {
      const q = query(collection(db, "groups"), where("name", "==", groupName), where("password", "==", groupPass));
      const snap = await getDocs(q);
      if (snap.empty) {
        alert("Grupo não encontrado ou senha incorreta.");
      } else {
        const groupDoc = snap.docs[0];
        const groupData = groupDoc.data();
        if (!groupData.members.includes(userStats.uid)) {
          await updateDoc(doc(db, "groups", groupDoc.id), {
            members: [...groupData.members, userStats.uid]
          });
        }
        await updateDoc(doc(db, "users", userStats.uid), { groupId: groupDoc.id });
        setFocoType('grupo');
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleLeaveGroup = async () => {
    if (!userStats.groupId || !userStats.uid) return;
    if (confirm("Deseja sair do grupo?")) {
      await updateDoc(doc(db, "users", userStats.uid), { groupId: null });
      setFocoType('global');
    }
  };

  const displayUsers = useMemo(() => {
    if (focoType === 'grupo' && userStats.groupId) {
      return allUsers.filter(u => u.groupId === userStats.groupId);
    }
    return allUsers.filter(u => u.ciclo === userStats.ciclo);
  }, [allUsers, focoType, userStats.groupId, userStats.ciclo]);

  const currentlyStudying = useMemo(() => {
    return displayUsers
      .filter(u => u.studyActive && u.studyStartTime)
      .map(u => ({ ...u, elapsed: Math.floor((Date.now() - (u.studyStartTime || 0)) / 1000) }))
      .sort((a, b) => b.elapsed - a.elapsed);
  }, [displayUsers]);

  const dailyRanking = useMemo(() => {
    return displayUsers
      .filter(u => (u.dailyStudyTime || 0) > 0)
      .sort((a, b) => (b.dailyStudyTime || 0) - (a.dailyStudyTime || 0))
      .slice(0, 10);
  }, [displayUsers]);

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-700 py-6 space-y-12 px-4 relative">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-neutral-200 dark:border-nexus-border pb-8">
        <div>
          <h2 className="text-4xl md:text-6xl font-black text-neutral-900 dark:text-nexus-text-title tracking-tighter italic">Nexus Foco</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-neutral-500 dark:text-nexus-text-sec text-lg font-light">Modo:</span>
            <div className="flex bg-neutral-100 dark:bg-nexus-surface p-1 rounded-xl border border-neutral-200 dark:border-nexus-border">
               <button onClick={() => setFocoType('global')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${focoType === 'global' ? 'bg-sky-600 dark:bg-nexus-blue text-white dark:text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}>
                 🌍 Global
               </button>
               <button 
                onClick={() => userStats.groupId ? setFocoType('grupo') : alert('Entre em um grupo primeiro!')} 
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${focoType === 'grupo' ? 'bg-sky-600 dark:bg-nexus-blue text-white dark:text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
               >
                 👥 Grupo {focoType === 'grupo' && '🔒'}
               </button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LADO ESQUERDO: CRONÔMETRO */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`relative bg-white dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border border-l-4 border-l-nexus-orange p-12 rounded-[3.5rem] shadow-sm flex flex-col items-center justify-center text-center ${!isTabActive && userStats.studyActive ? 'opacity-50 grayscale' : ''}`}>
             <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 border-4 ${userStats.studyActive ? 'border-nexus-orange text-nexus-orange animate-pulse' : 'border-neutral-200 dark:border-nexus-border text-neutral-400 dark:text-nexus-text-sec'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
             </div>
             <p className={`text-7xl md:text-9xl font-black font-mono tracking-tighter ${userStats.studyActive ? 'text-nexus-orange' : 'text-neutral-900 dark:text-nexus-text-title'}`}>
               {formatTime(currentElapsed)}
             </p>
             <div className="mt-10 flex gap-4 w-full max-w-md">
               {!userStats.studyActive ? (
                 <button onClick={onStart} className="flex-grow bg-nexus-orange text-white font-black py-5 rounded-[2rem] shadow-sm uppercase tracking-widest hover:opacity-90">Iniciar Foco</button>
               ) : (
                 <button onClick={onStop} className="flex-grow bg-rose-500 text-white font-black py-5 rounded-[2rem] shadow-sm uppercase tracking-widest hover:opacity-90">Parar e Pontuar</button>
               )}
             </div>
          </div>

          {/* ÁREA DE GRUPOS */}
          <div className="bg-white dark:bg-nexus-surface border border-neutral-200 dark:border-nexus-border p-8 rounded-[2.5rem] shadow-sm">
             <h3 className="text-sm font-black text-neutral-900 dark:text-nexus-text-title uppercase tracking-widest mb-6 italic">Configurações de Grupo</h3>
             {userStats.groupId ? (
               <div className="flex items-center justify-between p-6 bg-neutral-50 dark:bg-nexus-card rounded-2xl border border-neutral-200 dark:border-nexus-border">
                  <div>
                    <p className="text-[10px] font-black text-sky-600 dark:text-nexus-blue uppercase">Membro do Grupo</p>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white uppercase italic">Nexus Academics</p>
                  </div>
                  <button onClick={handleLeaveGroup} className="bg-rose-500/10 text-rose-500 text-[10px] font-black px-6 py-2 rounded-xl uppercase hover:bg-rose-500 hover:text-white transition-all">Sair do Grupo</button>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <input type="text" placeholder="Nome do Grupo" className="w-full bg-neutral-50 dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border rounded-xl p-4 text-xs text-neutral-900 dark:text-white outline-none focus:border-sky-600 dark:focus:border-nexus-blue" value={groupName} onChange={e => setGroupName(e.target.value)} />
                    <input type="password" placeholder="Senha" className="w-full bg-neutral-50 dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border rounded-xl p-4 text-xs text-neutral-900 dark:text-white outline-none focus:border-sky-600 dark:focus:border-nexus-blue" value={groupPass} onChange={e => setGroupPass(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={handleJoinGroup} disabled={loading} className="flex-grow bg-sky-600 dark:bg-nexus-blue text-white dark:text-black font-black text-[10px] uppercase rounded-xl hover:opacity-90 transition-all">Entrar em Grupo</button>
                    <button onClick={handleCreateGroup} disabled={loading} className="flex-grow bg-neutral-100 dark:bg-nexus-surface text-neutral-900 dark:text-white font-black text-[10px] uppercase rounded-xl border border-neutral-200 dark:border-nexus-border hover:bg-neutral-200 dark:hover:bg-nexus-hover transition-all">Criar Novo Grupo</button>
                  </div>
               </div>
             )}
          </div>
        </div>

        {/* LADO DIREITO: RANKING */}
        <div className="lg:col-span-5 space-y-8">
           <div className="bg-white dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="p-6 border-b border-neutral-200 dark:border-nexus-border flex justify-between items-center bg-neutral-50 dark:bg-nexus-surface/50">
                 <h3 className="font-black text-neutral-900 dark:text-nexus-text-title text-xs uppercase tracking-widest italic">Nexus Ao Vivo</h3>
                 <span className="text-[10px] font-black text-nexus-orange bg-nexus-orange/10 px-3 py-1 rounded-full uppercase">{currentlyStudying.length}</span>
              </div>
              <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
                 {currentlyStudying.map(u => (
                    <div key={u.uid} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-nexus-surface border border-neutral-200 dark:border-nexus-border">
                       <div className="flex items-center gap-3">
                          <img src={u.photoURL} className="w-10 h-10 rounded-xl" alt="" />
                          <div>
                            <p className="text-xs font-bold text-neutral-900 dark:text-white">{u.displayName}</p>
                            <p className="text-[10px] font-mono text-neutral-500 dark:text-nexus-text-sec">{formatTime(u.elapsed)}</p>
                          </div>
                       </div>
                       {u.uid !== userStats.uid && (
                         <button onClick={() => u.uid && onIncentive(u.uid)} className="p-2.5 bg-white dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border rounded-xl hover:text-nexus-orange hover:border-nexus-orange transition-all">💪</button>
                       )}
                    </div>
                 ))}
                 {currentlyStudying.length === 0 && (
                   <div className="text-center text-neutral-400 dark:text-nexus-text-sec text-xs font-bold py-10">Nenhum estudante focado no momento.</div>
                 )}
              </div>
           </div>

           <div className="bg-white dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="p-6 border-b border-neutral-200 dark:border-nexus-border flex justify-between items-center bg-neutral-50 dark:bg-nexus-surface/50">
                 <h3 className="font-black text-neutral-900 dark:text-nexus-text-title text-xs uppercase tracking-widest italic">Top Hoje: {focoType}</h3>
              </div>
              <div className="p-6 space-y-4">
                 {dailyRanking.map((u, i) => (
                    <div key={u.uid} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-neutral-400 dark:text-nexus-text-label">#{i+1}</span>
                          <img src={u.photoURL} className="w-8 h-8 rounded-lg" alt="" />
                          <span className="text-xs font-bold text-neutral-700 dark:text-nexus-text-main">{u.displayName}</span>
                       </div>
                       <p className="text-[10px] font-mono font-black text-neutral-900 dark:text-white">{formatTime(u.dailyStudyTime)}</p>
                    </div>
                 ))}
                 {dailyRanking.length === 0 && (
                   <div className="text-center text-neutral-400 dark:text-nexus-text-sec text-xs font-bold py-10">Sem registros hoje.</div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudyView;
