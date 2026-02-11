
import React, { useState, useRef } from 'react';
import { UserStats } from '../types';
import { auth, db } from '../lib/firebase';
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

interface UserProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  onNavigateAdmin?: () => void;
}

const PREMIUM_EMOJIS = [
  '🜂', '🜁', '🧠✨', '🧬', '📚🔥', '🧿', '🜃', '🧠⚡', 
  '🕯️', '🧩', '🪐', '🗝️', '🧠📈', '🪄', '🏛️', '🧠🜄', 
  '📖🪶', '🧠🧭', '🧬🔬', '🌌'
];

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ isOpen, onClose, userStats, onNavigateAdmin }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(userStats.displayName);
  const [selectedAvatar, setSelectedAvatar] = useState(userStats.photoURL || '');
  const [selectedEmoji, setSelectedEmoji] = useState(userStats.premiumEmoji || PREMIUM_EMOJIS[0]);
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>(userStats.themePreference || 'dark');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLogout = () => signOut(auth);

  const compressAndSetAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 128; // Tamanho compacto para o Firestore
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para JPEG com qualidade 0.7 para economizar espaço no banco
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setSelectedAvatar(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!auth.currentUser || loading) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { 
        displayName: newName, 
        photoURL: selectedAvatar,
        themePreference: selectedTheme,
        premiumEmoji: userStats.isPremium ? selectedEmoji : null
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f0f0f] border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-900/30">
          <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Sua Identidade Nexus</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-8 max-h-[75vh] overflow-y-auto no-scrollbar">
          {!isEditing ? (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center gap-8 bg-neutral-50 dark:bg-neutral-950/50 p-8 rounded-[2rem] border border-neutral-100 dark:border-neutral-800 relative">
                <div className="relative group cursor-pointer" onClick={() => setIsEditing(true)}>
                  <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-blue-600/30 bg-neutral-900 shadow-2xl relative">
                    <img src={userStats.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats.displayName}`} alt="P" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                    </div>
                  </div>
                  {userStats.isPremium && (
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white w-8 h-8 rounded-xl flex items-center justify-center text-xs shadow-xl border-2 border-[#0f0f0f]">
                      {userStats.premiumEmoji || '✨'}
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-2 tracking-tight">{userStats.displayName}</h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <span className="px-3 py-1 bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-600/20">{userStats.medCourse}</span>
                    <span className="px-3 py-1 bg-neutral-800 text-neutral-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-neutral-700">{userStats.semester}º Semestre</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {userStats.adm && (
                  <button onClick={() => { onNavigateAdmin?.(); onClose(); }} className="w-full flex items-center justify-between p-5 bg-blue-600 text-white hover:bg-blue-500 rounded-2xl transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">
                    Área de Administração <span className="text-lg">⚙️</span>
                  </button>
                )}
                <button onClick={() => setIsEditing(true)} className="w-full flex items-center justify-between p-5 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-800 transition-all text-[10px] font-bold uppercase tracking-widest">
                  Personalizar Perfil <span className="text-lg">🎨</span>
                </button>
                <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 bg-rose-50/50 dark:bg-red-500/5 hover:bg-rose-100 dark:hover:bg-red-500/10 rounded-2xl border border-rose-100 dark:border-red-500/10 transition-all text-rose-600 dark:text-red-500 text-[10px] font-bold uppercase tracking-widest">
                  Encerrar Sessão Nexus <span className="text-lg">⎋</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col items-center">
                <div className="relative group mb-6">
                  <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-blue-600/30 bg-neutral-900 shadow-2xl relative">
                    <img src={selectedAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newName}`} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><line x1="16" y1="5" x2="22" y2="5"/><line x1="19" y1="2" x2="19" y2="8"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      <span className="text-[8px] font-black text-white uppercase mt-2">Trocar Foto</span>
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={compressAndSetAvatar} />
                </div>
                <div className="w-full max-w-md space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Nome Acadêmico</label>
                    <input 
                      type="text" 
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-4 px-6 text-white text-sm focus:border-blue-600 outline-none transition-all" 
                      value={newName} 
                      onChange={e => setNewName(e.target.value)} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleSave} disabled={loading} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50">
                      {loading ? "Processando..." : "Salvar Alterações"}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="w-full bg-neutral-800 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-700 transition-all">
                      Voltar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileMenu;
