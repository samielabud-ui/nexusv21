
import React, { useState, useMemo } from 'react';
import { UserStats } from '../types';

interface Lesson {
  title: string;
  url: string;
}

interface MorfoViewProps {
  userStats: UserStats;
  onNavigateToPremium?: () => void;
  onIncrementUsage?: (contentId: string) => void;
  onAddActivity: (item: any) => void;
  onAwardPoints?: (id: string, value?: number) => void;
}

const HISTOLOGIA_MED1_M1: Lesson[] = [
  { 
    title: "Microscopia", 
    url: "https://drive.google.com/file/d/1nVXbyb0o-QHPTmvxMiqekYyqN0sNkisL/preview" 
  },
  { 
    title: "Tecido Epitelial – Parte 1", 
    url: "https://drive.google.com/file/d/1E28iREzZdPdHbTMIbb94B0_SzNIJFiYe/preview" 
  },
  { 
    title: "Tecido Epitelial – Parte 2", 
    url: "https://drive.google.com/file/d/1Q0CrOd2vzngCgyUq1DsWkCG8IlxvvdcE/preview" 
  },
  { 
    title: "Tecido Conjuntivo", 
    url: "https://drive.google.com/file/d/1ohwE0qb0HEjYDGHR3lsa7cJ1PLmXW7qc/preview" 
  }
];

const ANATOMIA_MED1_M1: Lesson[] = [
  {
    title: "Planos e Terminologias Anatômicas",
    url: "https://drive.google.com/file/d/1tpciAGHGcvYE6M0i8IupSp7SKMVT7J-j/preview"
  },
  {
    title: "Pele e Tecido Adiposo",
    url: "https://drive.google.com/file/d/1LKrpLvO4mOhu7ocEtk6PcXxqSj4tEBD3/preview"
  },
  {
    title: "Parede Abdominal",
    url: "https://drive.google.com/file/d/1Wz5mMbURVOqBkvYyCpNl9Yc3bN4RKFF5/preview"
  }
];

const ANATOMIA_MED1_M2: Lesson[] = [
  {
    title: "Genética Molecular – Genótipo, Fenótipo e Expressão Gênica",
    url: "https://drive.google.com/file/d/1GBpy53N1epSYjdJlzbtXYBuoVbLQ_y5p/preview"
  },
  {
    title: "Genética Mendeliana",
    url: "https://drive.google.com/file/d/1xNC5q6QDwNzr6OpyMLd_93WKAZMU9FgM/preview"
  }
];

const HISTOLOGIA_MED3_M7: Lesson[] = [
  { 
    title: "Roteiro – Aparelho Reprodutor Feminino", 
    url: "https://drive.google.com/file/d/1dmGXSz1fc8F8JsHIFOibXU4mNXxuIDJE/preview" 
  },
  { 
    title: "Roteiro – Aparelho Reprodutor Masculino", 
    url: "https://drive.google.com/file/d/1YewexKH_be-FHPIirnN9D115VTUE37aV/preview" 
  }
];

const HISTOLOGIA_MED3_M8: Lesson[] = [
  { 
    title: "Roteiro – Mamas", 
    url: "https://drive.google.com/file/d/1FBj9DgY-og7PdBGW-dSbiS1837WTzk6B/preview" 
  }
];

const ANATOMIA_MED3_GERAL: Lesson[] = [
  { 
    title: "Fisiologia do Parto", 
    url: "https://drive.google.com/file/d/1YiH8qYyHjdMTCCMtlKjnb6YOSFyijLFU/preview" 
  },
  { 
    title: "Puerpério", 
    url: "https://drive.google.com/file/d/1Z1xXJXcN3iD7KiO_z8UpfD-mEZK2ctR9/preview" 
  }
];

const MorfoView: React.FC<MorfoViewProps> = ({ userStats, onNavigateToPremium, onIncrementUsage, onAddActivity, onAwardPoints }) => {
  const [selectedMed, setSelectedMed] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'Anatomia' | 'Histologia' | null>(null);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [activePdf, setActivePdf] = useState<Lesson | null>(null);

  const meds = Array.from({ length: 8 }, (_, i) => i + 1);

  const isOverLimit = (id: string) => {
    if (userStats?.plan === 'premium') return false;
    if (userStats?.openedContentIds?.includes(id)) return false;
    return (userStats?.openedContentIds?.length || 0) >= 10;
  };

  // Histórico Morfo
  const morfoHistory = useMemo(() => 
    (userStats.recentActivity || []).filter(a => a.id.startsWith('morfo_')).slice(0, 3),
  [userStats.recentActivity]);

  const handleOpenPdf = (lesson: Lesson) => {
    const contentId = `morfo_${selectedMed}_${selectedCategory}_${selectedModule}_${lesson.title}`;
    if (isOverLimit(contentId)) {
        setActivePdf(lesson); 
        return;
    }
    setActivePdf(lesson);
    onIncrementUsage?.(contentId);

    onAddActivity({
      id: contentId,
      type: 'aula',
      title: lesson.title,
      subtitle: `Med {selectedMed} • ${selectedCategory} ${selectedModule === 0 ? '' : '• Módulo ' + selectedModule}`,
      metadata: { med: selectedMed, category: selectedCategory, moduleId: selectedModule, lessonTitle: lesson.title, url: lesson.url }
    });

    onAwardPoints?.(contentId, 5);
  };

  const handleResumeActivity = (act: any) => {
    if (act.metadata) {
      setSelectedMed(act.metadata.med);
      setSelectedCategory(act.metadata.category);
      setSelectedModule(act.metadata.moduleId);
      setActivePdf({ title: act.metadata.lessonTitle, url: act.metadata.url });
    }
  };

  const getModulesForMed = (med: number) => {
    const start = (med - 1) * 3 + 1;
    return [start, start + 1, start + 2];
  };

  const getLessons = () => {
    if (selectedMed === 1) {
      if (selectedModule === 1) {
        return selectedCategory === 'Histologia' ? HISTOLOGIA_MED1_M1 : ANATOMIA_MED1_M1;
      }
      if (selectedModule === 2) {
        if (selectedCategory === 'Anatomia') return ANATOMIA_MED1_M2;
      }
    }
    if (selectedMed === 3) {
      if (selectedCategory === 'Histologia') {
        if (selectedModule === 7) return HISTOLOGIA_MED3_M7;
        if (selectedModule === 8) return HISTOLOGIA_MED3_M8;
      }
      if (selectedCategory === 'Anatomia') {
        return ANATOMIA_MED3_GERAL;
      }
    }
    return null;
  };

  const resetToMeds = () => {
    setSelectedMed(null);
    setSelectedCategory(null);
    setSelectedModule(null);
    setActivePdf(null);
  };

  const resetToCategories = () => {
    setSelectedCategory(null);
    setSelectedModule(null);
    setActivePdf(null);
  };

  const resetToModules = () => {
    setSelectedModule(null);
    setActivePdf(null);
  };

  const closePdf = () => {
    setActivePdf(null);
  };

  const lessons = getLessons();

  if (selectedMed === null) {
    return (
      <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 px-4">
        {/* Bloco Continuar Estudando - Morfo */}
        {morfoHistory.length > 0 && (
          <section className="mb-12 animate-in slide-in-from-top-4 duration-500">
            <h3 className="text-[10px] font-black text-neutral-500 dark:text-nexus-text-sec uppercase tracking-[0.4em] mb-4 flex items-center gap-4">
              Continuar Estudando – Morfo <div className="h-px flex-grow bg-neutral-200 dark:bg-nexus-border"></div>
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-2 px-2">
              {morfoHistory.map((act) => (
                <div 
                  key={act.id} 
                  onClick={() => handleResumeActivity(act)}
                  className="bg-white dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border p-4 rounded-2xl cursor-pointer hover:border-teal-400 transition-all flex items-center gap-4 group min-w-[280px] shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-nexus-surface flex items-center justify-center text-sm group-hover:bg-teal-400/10 group-hover:text-teal-400 transition-all shrink-0 text-teal-500 dark:text-teal-400 border border-neutral-200 dark:border-nexus-border">
                    🧠
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-neutral-900 dark:text-nexus-text-main truncate">{act.title}</h5>
                    <span className="text-[9px] text-neutral-500 dark:text-nexus-text-sec uppercase tracking-widest font-black">{act.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <header className="mb-10 md:mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-nexus-text-title mb-4 tracking-tighter italic">Morfo</h2>
          <p className="text-neutral-500 dark:text-nexus-text-main text-lg md:text-xl font-light max-w-2xl leading-relaxed">
            Área dedicada ao estudo morfofuncional. Selecione seu período para começar.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {meds.map((m) => (
            <div 
              key={m} 
              onClick={() => setSelectedMed(m)}
              className="bg-white dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border border-l-4 border-l-teal-400 p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] cursor-pointer hover:bg-neutral-50 dark:hover:bg-nexus-hover hover:border-teal-400 hover:-translate-y-1 transition-all group flex flex-col justify-between h-48 md:h-64 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <span className="text-[9px] md:text-[10px] font-black text-teal-500 dark:text-teal-400 uppercase tracking-[0.4em]">Período</span>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-teal-400/10 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </div>
              </div>
              <div>
                <h4 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-nexus-text-title tracking-tight">Med {m}</h4>
                <p className="text-neutral-500 dark:text-nexus-text-sec text-[10px] mt-2 uppercase tracking-widest font-bold group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors italic">Ver Módulos →</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedCategory === null) {
    return (
      <div className="max-w-[1200px] mx-auto animate-in slide-in-from-right-4 duration-500 px-4">
        <button onClick={resetToMeds} className="mb-8 flex items-center gap-2 text-neutral-500 dark:text-nexus-text-sec hover:text-neutral-900 dark:hover:text-white transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
          <span className="text-xs font-medium uppercase tracking-widest">Escolher outro Med</span>
        </button>

        <header className="mb-10 md:mb-12">
          <span className="text-[10px] font-black text-teal-500 dark:text-teal-400 uppercase tracking-[0.4em] mb-2 block">Med {selectedMed}</span>
          <h2 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-nexus-text-title tracking-tight">O que você vai estudar hoje?</h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div 
            onClick={() => {
              setSelectedCategory('Anatomia');
              if (selectedMed === 3) setSelectedModule(0);
            }}
            className="bg-white dark:bg-nexus-surface border border-neutral-200 dark:border-nexus-border p-10 md:p-12 rounded-[2rem] md:rounded-[3rem] cursor-pointer hover:bg-neutral-50 dark:hover:bg-nexus-card hover:border-indigo-500 transition-all group h-[300px] md:h-[400px] flex flex-col justify-center items-center text-center shadow-sm"
          >
            <div className="w-16 h-16 md:w-24 md:h-24 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 mb-6 md:mb-8 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20"/><path d="M2 12h20"/><path d="M12 2a14.5 14.5 0 0 0 0 20"/><path d="M2 12h20"/></svg>
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-neutral-900 dark:text-nexus-text-title mb-2 md:mb-4 tracking-tight">Anatomia</h3>
            <p className="text-neutral-500 dark:text-nexus-text-sec text-[10px] md:text-sm max-w-[200px] md:max-w-xs leading-relaxed">Atlas integrados, resumos e questões.</p>
          </div>

          <div 
            onClick={() => setSelectedCategory('Histologia')}
            className="bg-white dark:bg-nexus-surface border border-neutral-200 dark:border-nexus-border p-10 md:p-12 rounded-[2rem] md:rounded-[3rem] cursor-pointer hover:bg-neutral-50 dark:hover:bg-nexus-card hover:border-teal-500 transition-all group h-[300px] md:h-[400px] flex flex-col justify-center items-center text-center shadow-sm"
          >
            <div className="w-16 h-16 md:w-24 md:h-24 bg-teal-500/10 rounded-full flex items-center justify-center text-teal-500 mb-6 md:mb-8 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20"/><path d="M2 12h20"/><path d="M12 2a14.5 14.5 0 0 0 0 20"/><path d="M2 12h20"/></svg>
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-neutral-900 dark:text-nexus-text-title mb-2 md:mb-4 tracking-tight">Histologia</h3>
            <p className="text-neutral-500 dark:text-nexus-text-sec text-[10px] md:text-sm max-w-[200px] md:max-w-xs leading-relaxed">Lâminas digitais e tecidos integrados.</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedModule === null) {
    const modules = getModulesForMed(selectedMed);
    return (
      <div className="max-w-[1200px] mx-auto animate-in slide-in-from-right-4 duration-500 px-4">
        <button onClick={resetToCategories} className="mb-8 flex items-center gap-2 text-neutral-500 dark:text-nexus-text-sec hover:text-neutral-900 dark:hover:text-white transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
          <span className="text-xs font-medium uppercase tracking-widest">Mudar Disciplina</span>
        </button>

        <header className="mb-10 md:mb-12">
          <div className="flex items-center flex-wrap gap-2 md:gap-4 mb-2">
            <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.4em]">Med {selectedMed}</span>
            <span className="text-neutral-400 dark:text-nexus-text-label">/</span>
            <span className="text-[10px] font-black text-neutral-500 dark:text-nexus-text-sec uppercase tracking-[0.4em]">{selectedCategory}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-nexus-text-title tracking-tight">Escolha o Módulo</h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {modules.map((mod) => (
            <div 
              key={mod} 
              onClick={() => setSelectedModule(mod)}
              className="bg-white dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border border-l-4 border-l-teal-400 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] cursor-pointer hover:bg-neutral-50 dark:hover:bg-nexus-hover transition-all flex flex-col justify-between h-40 md:h-48 group shadow-sm"
            >
              <div>
                <span className="text-[9px] md:text-[10px] font-black text-neutral-500 dark:text-nexus-text-sec uppercase tracking-widest block mb-1">Morfofuncional</span>
                <h4 className="text-xl md:text-2xl font-black text-neutral-900 dark:text-nexus-text-title tracking-tight">Módulo {mod}</h4>
              </div>
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest group-hover:underline italic">Acessar Conteúdo →</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Conteúdo específico
  if (lessons) {
    const accentColorClass = selectedCategory === 'Histologia' ? 'teal' : 'indigo';
    const activeLessonId = activePdf ? `morfo_${selectedMed}_${selectedCategory}_${selectedModule}_${activePdf.title}` : '';
    const showOverLimitBanner = isOverLimit(activeLessonId) && activePdf;

    if (activePdf) {
      return (
        <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 px-4 relative">
          {showOverLimitBanner && (
            <div className="absolute inset-0 z-40 bg-neutral-900/90 dark:bg-nexus-bg/90 backdrop-blur-md flex items-center justify-center p-6 text-center rounded-[2rem]">
              <div className="max-w-md">
                <div className="w-16 h-16 bg-sky-600/20 rounded-full flex items-center justify-center text-sky-600 dark:text-nexus-blue mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <h3 className="text-2xl font-black text-white mb-4">Limite Atingido</h3>
                <p className="text-neutral-400 mb-8 text-sm leading-relaxed">
                  Você atingiu o limite de <span className="font-bold">10 conteúdos</span> do plano básico. Este limite não renova.
                </p>
                <button onClick={onNavigateToPremium} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-sky-600/20 uppercase tracking-widest text-xs">Conhecer Plano Premium</button>
              </div>
            </div>
          )}

          <button onClick={closePdf} className="mb-6 flex items-center gap-2 text-neutral-500 dark:text-nexus-text-sec hover:text-neutral-900 dark:hover:text-white transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
            <span className="text-xs font-medium uppercase tracking-widest">Voltar para Lista</span>
          </button>

          <header className="mb-6">
             <h2 className="text-2xl font-black text-neutral-900 dark:text-nexus-text-title tracking-tight">{activePdf.title}</h2>
             <p className="text-neutral-500 dark:text-nexus-text-sec text-[10px] uppercase tracking-widest mt-1">Leitor Interno NexusBQ</p>
          </header>

          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm relative h-[70vh] md:h-[85vh] border border-neutral-200 dark:border-nexus-border">
            <iframe 
              src={activePdf.url} 
              className="w-full h-full border-none" 
              title={activePdf.title}
              allow="autoplay"
            ></iframe>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 px-4 relative">
        <button 
          onClick={() => {
            if (selectedMed === 3 && selectedCategory === 'Anatomia') {
              resetToCategories();
            } else {
              resetToModules();
            }
          }} 
          className="mb-8 flex items-center gap-2 text-neutral-500 dark:text-nexus-text-sec hover:text-neutral-900 dark:hover:text-white transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
          <span className="text-xs font-medium uppercase tracking-widest">Voltar para {selectedMed === 3 && selectedCategory === 'Anatomia' ? 'Disciplinas' : 'Módulos'}</span>
        </button>

        <header className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <span className={`text-[10px] font-black text-${accentColorClass}-600 dark:text-${accentColorClass}-400 uppercase tracking-[0.4em]`}>{selectedCategory}</span>
            <span className="text-neutral-400 dark:text-nexus-text-label">/</span>
            <span className="text-[10px] font-black text-neutral-500 dark:text-nexus-text-sec uppercase tracking-[0.4em]">{selectedModule === 0 ? 'Conteúdo Geral' : 'Módulo ' + selectedModule}</span>
          </div>
          <h2 className="text-3xl font-black text-neutral-900 dark:text-nexus-text-title tracking-tight">{selectedModule === 0 ? 'Tópicos de ' + selectedCategory : 'Aulas do Módulo ' + selectedModule}</h2>
        </header>

        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <div 
              key={index} 
              className={`bg-white dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-${accentColorClass}-400/50 transition-all group shadow-sm`}
            >
              <div className="flex items-center gap-4 w-full">
                <div className={`w-10 h-10 rounded-xl bg-${accentColorClass}-500/10 flex items-center justify-center text-${accentColorClass}-600 dark:text-${accentColorClass}-400 shrink-0 group-hover:bg-${accentColorClass}-500 group-hover:text-white transition-all`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <h3 className="text-neutral-900 dark:text-nexus-text-title font-bold text-lg">{lesson.title}</h3>
              </div>
              <button 
                onClick={() => handleOpenPdf(lesson)}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl bg-neutral-100 dark:bg-nexus-surface text-neutral-900 dark:text-nexus-text-main border border-neutral-200 dark:border-nexus-border text-[10px] font-black uppercase tracking-widest hover:bg-${accentColorClass}-500 hover:text-white hover:border-transparent transition-all text-center`}
              >
                Abrir Material
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="max-w-[1000px] mx-auto animate-in fade-in duration-500 px-4">
      <button onClick={resetToModules} className="mb-8 flex items-center gap-2 text-neutral-500 dark:text-nexus-text-sec hover:text-neutral-900 dark:hover:text-white transition-colors group">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
        <span className="text-xs font-medium uppercase tracking-widest">Voltar para Módulos</span>
      </button>

      <div className="bg-white dark:bg-nexus-surface border border-neutral-200 dark:border-nexus-border p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] text-center border-dashed shadow-sm">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-100 dark:bg-nexus-card rounded-full flex items-center justify-center text-neutral-400 dark:text-nexus-text-label mx-auto mb-6 md:mb-8 border border-neutral-200 dark:border-nexus-border">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <h3 className="text-xl md:text-2xl font-black text-neutral-900 dark:text-nexus-text-title mb-4 tracking-tight">Conteúdo em Processamento</h3>
        <p className="text-neutral-500 dark:text-nexus-text-main text-sm md:text-base max-w-md mx-auto leading-relaxed">
          Estamos organizando os resumos, PDFs e lâminas digitais para o <span className="font-bold">Módulo {selectedModule}</span> de <span className="font-bold">{selectedCategory}</span>.
        </p>
      </div>
    </div>
  );
};

export default MorfoView;
