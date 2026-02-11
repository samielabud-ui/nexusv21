
import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const AuthView: React.FC = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const getFriendlyErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/wrong-password': return 'Credenciais incorretas. Verifique seu email e senha.';
      case 'auth/user-not-found': return 'Nenhum prontuário encontrado com este email.';
      case 'auth/invalid-email': return 'Formato de email inválido.';
      case 'auth/weak-password': return 'Sua senha deve ter no mínimo 6 caracteres por segurança.';
      case 'auth/email-already-in-use': return 'Este email já está vinculado a um prontuário ativo.';
      default: return 'Ocorreu um erro no sistema. Tente novamente em instantes.';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha email e senha para acessar.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignUpMode) {
      setIsSignUpMode(true);
      setError('');
      return;
    }

    if (!email || !password || !name || !confirmPassword) {
      setError('Todos os campos são obrigatórios para o cadastro.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName: name.trim(),
        email: email.trim(),
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.trim()}`,
        setupComplete: false,
        isPremium: false,
        plan: 'basic',
        totalAnswered: 0,
        totalCorrect: 0,
        totalErrors: 0,
        points: 0,
        streak: 0,
        themePreference: 'dark'
      });
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Digite seu email no campo acima para recuperar o acesso.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (err) {
      setError("Não foi possível enviar o email de recuperação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-nexus-bg text-nexus-text-main font-sans selection:bg-sky-500/30">
      
      {/* LADO ESQUERDO: IDENTIDADE INSTITUCIONAL (Visível apenas em Desktop) */}
      <div className="hidden lg:flex flex-1 relative bg-nexus-surface items-center justify-center p-12 overflow-hidden border-r border-nexus-border">
        {/* Fundo com Gradiente Médico */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-900/10 via-nexus-surface to-nexus-surface"></div>
        
        {/* Ilustração Abstrata/Tecnológica de Fundo */}
        <svg className="absolute w-[600px] h-[600px] text-sky-500/5 -bottom-20 -left-20 transform -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-sky-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-sky-600/20">N</div>
            <span className="text-3xl font-black tracking-tighter text-nexus-text-title italic">NexusBQ</span>
          </div>
          <h1 className="text-4xl font-black text-nexus-text-title tracking-tight leading-[1.15] mb-6">
            Estude medicina com método, foco e constância.
          </h1>
          <p className="text-lg text-nexus-text-sec font-light leading-relaxed">
            O seu ambiente digital de estudos clínicos. Acesse questões, casos PBL e materiais organizados para a sua evolução acadêmica.
          </p>
          <div className="mt-10 flex gap-3">
            <span className="px-4 py-2 bg-nexus-card border border-nexus-border rounded-full text-[10px] font-black uppercase tracking-widest text-nexus-text-sec shadow-sm">Método PBL</span>
            <span className="px-4 py-2 bg-nexus-card border border-nexus-border rounded-full text-[10px] font-black uppercase tracking-widest text-nexus-text-sec shadow-sm">Raciocínio Clínico</span>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: FORMULÁRIO DE LOGIN */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative w-full">
        
        {/* Logo Mobile (Visível apenas em telas menores) */}
        <div className="absolute top-8 left-6 lg:hidden flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-md shadow-sky-600/20">N</div>
          <span className="text-xl font-black tracking-tighter text-nexus-text-title italic">NexusBQ</span>
        </div>

        <div className="w-full max-w-[420px] bg-nexus-card border border-nexus-border rounded-[2rem] p-8 md:p-10 shadow-xl relative z-10 mt-16 lg:mt-0">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-2xl font-black text-nexus-text-title tracking-tight mb-2">
              {isSignUpMode ? "Abrir prontuário" : "Acesso ao sistema"}
            </h2>
            <p className="text-sm text-nexus-text-sec font-medium">
              {isSignUpMode ? "Preencha os dados acadêmicos iniciais." : "Insira suas credenciais médicas."}
            </p>
          </div>

          <form className="space-y-5" onSubmit={isSignUpMode ? handleSignUp : handleLogin}>
            
            {/* Campo Nome (Apenas Cadastro) */}
            {isSignUpMode && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                <label className="text-[11px] font-bold text-nexus-text-sec uppercase tracking-widest pl-1">Nome Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-nexus-text-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Ex: Dr. Marcelo Silva"
                    className="w-full bg-nexus-surface border border-nexus-border text-nexus-text-main text-sm rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Campo Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-nexus-text-sec uppercase tracking-widest pl-1">Email Institucional ou Pessoal</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-nexus-text-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <input 
                  type="email" 
                  placeholder="dr.exemplo@med.com"
                  className="w-full bg-nexus-surface border border-nexus-border text-nexus-text-main text-sm rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center pl-1 pr-1">
                <label className="text-[11px] font-bold text-nexus-text-sec uppercase tracking-widest">Senha</label>
                {!isSignUpMode && (
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="text-[10px] font-bold text-sky-500 hover:text-sky-400 transition-colors"
                  >
                    Esqueceu?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-nexus-text-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-nexus-surface border border-nexus-border text-nexus-text-main text-sm rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Campo Confirmar Senha (Apenas Cadastro) */}
            {isSignUpMode && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                <label className="text-[11px] font-bold text-nexus-text-sec uppercase tracking-widest pl-1">Confirme a Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-nexus-text-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-nexus-surface border border-nexus-border text-nexus-text-main text-sm rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Mensagens de Feedback */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-3 animate-in fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400 shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-rose-400 text-[11px] font-medium leading-relaxed">{error}</p>
              </div>
            )}
            
            {resetSent && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-3 animate-in fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0 mt-0.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <p className="text-emerald-500 text-[11px] font-medium leading-relaxed">Instruções enviadas! Verifique sua caixa de entrada.</p>
              </div>
            )}

            {/* Botão Principal */}
            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Acessando...
                  </>
                ) : (
                  isSignUpMode ? "Confirmar Cadastro" : "Entrar"
                )}
              </button>
            </div>
          </form>

          {/* Alternância de Modo */}
          <div className="mt-8 text-center">
            <p className="text-xs text-nexus-text-sec">
              {isSignUpMode ? "Já tem um prontuário ativo? " : "Primeira vez no sistema? "}
              <button 
                type="button"
                onClick={() => {
                  setIsSignUpMode(!isSignUpMode);
                  setError('');
                  setResetSent(false);
                }}
                className="text-nexus-text-main font-bold hover:text-sky-500 transition-colors"
              >
                {isSignUpMode ? "Fazer login" : "Criar conta acadêmica"}
              </button>
            </p>
          </div>
        </div>
        
        {/* Footer Minimalista (Mobile/Desktop) */}
        <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none">
          <p className="text-[9px] font-bold text-nexus-text-label uppercase tracking-widest">NexusBQ &copy; {new Date().getFullYear()} • Ambiente Seguro</p>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
