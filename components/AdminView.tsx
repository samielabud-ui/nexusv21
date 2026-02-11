
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { Group, UserStats } from '../types';

const AdminView: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<UserStats[]>([]);
  const [activeTab, setActiveTab] = useState<'grupos' | 'usuarios'>('grupos');

  useEffect(() => {
    const unsubGroups = onSnapshot(collection(db, "groups"), (snap) => {
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() } as Group)));
    });
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserStats)));
    });
    return () => { unsubGroups(); unsubUsers(); };
  }, []);

  const handleDeleteGroup = async (id: string) => {
    if (confirm("Apagar este grupo permanentemente? Todas as mensagens serão perdidas.")) {
      await deleteDoc(doc(db, "groups", id));
    }
  };

  const handleBanUser = async (uid: string, currentBan: boolean) => {
    if (confirm(currentBan ? "Desbanir este usuário?" : "BANIR este usuário do site?")) {
      await updateDoc(doc(db, "users", uid), { isBanned: !currentBan });
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 py-10 px-4">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-neutral-800 pb-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Admin Nexus</h2>
          <p className="text-neutral-500 text-sm mt-1">Moderação global de conteúdos e usuários.</p>
        </div>
        <div className="flex bg-neutral-900 p-1 rounded-2xl border border-neutral-800">
           <button onClick={() => setActiveTab('grupos')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'grupos' ? 'bg-blue-600 text-white' : 'text-neutral-500'}`}>Grupos</button>
           <button onClick={() => setActiveTab('usuarios')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'usuarios' ? 'bg-blue-600 text-white' : 'text-neutral-500'}`}>Usuários</button>
        </div>
      </header>

      {activeTab === 'grupos' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(g => (
            <div key={g.id} className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-[2rem] flex flex-col justify-between h-48">
              <div>
                <h3 className="text-lg font-black text-white">{g.name}</h3>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">{g.members.length} Membros</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDeleteGroup(g.id)} className="flex-grow bg-rose-600/10 text-rose-500 text-[9px] font-black py-3 rounded-xl uppercase hover:bg-rose-600 hover:text-white transition-all">Excluir Grupo</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-neutral-900/30 border border-neutral-800 rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-800 text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                <th className="p-6">Estudante</th>
                <th className="p-6">Curso</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.uid} className="border-b border-neutral-800/50 hover:bg-white/5 transition-colors">
                  <td className="p-6 flex items-center gap-3">
                    <img src={u.photoURL} className="w-8 h-8 rounded-lg" alt="" />
                    <span className="text-sm font-bold text-white">{u.displayName}</span>
                  </td>
                  <td className="p-6 text-xs text-neutral-400">{u.medCourse} - {u.semester}º sem</td>
                  <td className="p-6">
                    {u.isBanned ? (
                      <span className="text-[9px] font-black bg-rose-600/20 text-rose-500 px-2 py-1 rounded uppercase">Banido</span>
                    ) : (
                      <span className="text-[9px] font-black bg-emerald-600/20 text-emerald-500 px-2 py-1 rounded uppercase">Ativo</span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <button onClick={() => u.uid && handleBanUser(u.uid, !!u.isBanned)} className={`text-[9px] font-black uppercase px-4 py-2 rounded-lg transition-all ${u.isBanned ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                      {u.isBanned ? 'Desbanir' : 'Banir'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminView;
