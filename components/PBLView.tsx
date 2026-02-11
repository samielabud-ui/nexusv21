
import React, { useState, useEffect, useMemo } from 'react';
import { UserStats, ActivityItem } from '../types';

interface SummaryProblem {
  numero: string;
  titulo: string;
  conteudo: Record<string, any>;
  pdfUrl?: string; 
}

interface ModuleSummaryItem {
  id: string;
  title: string;
  url: string;
}

const GLOBAL_SUMMARIES: Record<number, SummaryProblem[]> = {
  1: [
    {
      numero: "1", 
      titulo: "Com os sentimentos à flor da pele!",
      conteudo: {
        "Sistema Único de Saúde (SUS)": {
          "Fundamentos e Doutrina": "O Sistema Único de Saúde é regido por princípios doutrinários que garantem a justiça social. A universalidade estabelece que a saúde é um direito de todos e dever do State, sem qualquer tipo de discriminação. A equidade busca diminuir as desigualdades sociais ao tratar de forma diferenciada aqueles que possuem necessidades distintas, garantindo que o atendimento seja proporcional à carência do paciente. Já a integralidade foca no indivíduo como um todo, unindo ações de prevenção, cura e reabilitação, além de considerar a variável humana e o contexto social no processo de cuidado.",
          "Organização e Diretrizes": "A estrutura do SUS baseia-se na descentralização, que redistribui o poder e os recursos entre as esferas federal, estadual e municipal para aproximar a gestão da realidade local. A regionalização e a hierarquização organizam os serviços em níveis de complexidade crescente, permitindo um fluxo eficiente de pacientes. Além disso, a participação popular é garantida por lei através dos Conselhos de Saúde, órgãos colegiados que contam com 50% de representantes dos usuários para fiscalizar e planejar as políticas públicas de saúde em cada nível de governo.",
          "Níveis de Atenção": "A rede de assistência é dividida em três níveis fundamentais. A Atenção Primária é a porta de entrada preferencial, representada pelas Unidades Básicas de Saúde e pela Estratégia Saúde da Família, sendo capaz de resolver cerca de 80% dos problemas de saúde. A Atenção Secundária lida com casos de média complexidade, como os atendimentos realizados em UPAs e ambulatórios especializados. Por fim, a Atenção Terciária concentra os serviços de alta densidade tecnológica, como cirurgias complexas, tratamentos oncológicos e hemodiálise em ambientes hospitalares de grande porte."
        },
        "Ética e Formação Médica": {
          "Conduta Profissional": "O Código de Ética Médica orienta a relação entre o médico, o paciente e a sociedade, estabelecendo que o sigilo profissional é um dever fundamental, salvo em situações de risco à coletividade ou por ordem legal. A autonomia do paciente deve ser sempre respeitada, permitindo que ele decida sobre seus tratamentos após receber todas as informações necessárias. O profissional também é proibido de causar dano por imperícia, imprudência ou negligência, devendo sempre buscar o benefício do paciente e a manutenção de sua dignidade acima de interesses comerciais ou políticos.",
          "Humanização": "O atendimento dialógico e humanizado coloca a comunicação efetiva e a empatia como pilares centrais da prática médica. Essa abordagem visa construir uma relação de confiança entre o profissional e o paciente, o que contribui diretamente para a satisfação, o bem-estar emocional e a eficácia do tratamento proposto, promovendo uma medicina mais compassiva e centrada na pessoa."
        }
      }
    }
  ],
  2: [{ numero: "1", titulo: "Células em Foco", conteudo: { "Diferenciação Celular": "Conteúdo integral restaurado sobre proliferação celular e mecanismos de controle do ciclo." } }],
  3: [{ numero: "1", titulo: "Homeostase", conteudo: { "Fisiologia Humana": "Resumo completo sobre os sistemas de feedback e regulação interna." } }],
  4: [{ numero: "1", titulo: "Equilíbrio", conteudo: { "Sistemas Orgânicos": "Conteúdo detalhado sobre Funções Biológicas 2." } }],
  5: [{ numero: "1", titulo: "Energia Vital", conteudo: { "Bioquímica": "Metabolismo de carboidratos, lipídeos e proteínas em detalhes." } }],
  6: [{ numero: "1", titulo: "Imunidade", conteudo: { "Resposta Imune": "Mecanismos de agressão e defesa, imunidade inata e adaptativa." } }],
  7: [
    {
      numero: "1", 
      titulo: "Navegando pelas Escolhas",
      pdfUrl: "https://drive.google.com/file/d/13gWSzX01L-E4lxGewvFKci9f-GwJz_S2/preview", 
      conteudo: {
        "Controle Hormonal": "O ciclo menstrual feminino é regulado pelo eixo hipotálamo-hipófise-ovariano. O hipotálamo secreta o GnRH de forma pulsátil, estimulando a hipófise anterior a liberar FSH e LH. A fase folicular (1º-14º dia) é marcada pelo FSH promovendo crescimento folicular e estrogênio preparando o útero. O pico de LH causa a ovulação no 14º dia. A fase lútea (14º-28º dia) é estável devido à progesterona do corpo lúteo.",
        "Planejamento Familiar": "Garantido pela Lei nº 9.263/96, baseia-se na autonomia reprodutiva e acesso à informação. Na Atenção Primária, envolve aconselhamento individualizado e oferta de múltiplos métodos contraceptivos, avaliando história clínica e preferências pessoais."
      }
    },
    {
      numero: "2", 
      titulo: "Superando uma Perda",
      pdfUrl: "https://drive.google.com/file/d/1N1UKZe7oLi9OdjRK_Vee_UNHmVNzfviO/preview",
      conteudo: {
        "Fertilização e Perda": "Envolve capacititação espermática no trato feminino, reação acrossômica para penetrar a zona pelúcida e fusão de gametas. Discussão sobre abortamento e luto gestacional sob a ótica médica e ética."
      }
    },
    { 
      numero: "3", 
      titulo: "Preparando para Gerar uma Nova Vida", 
      pdfUrl: "https://drive.google.com/file/d/1jCN5GJX7NUd2Tp8RA1J36142K568yXav/preview",
      conteudo: { "Pré-natal": "Protocolos de acompanhamento da gestante, exames de rotina e suplementação." } 
    },
    { 
      numero: "4", 
      titulo: "Chegando ao Mundo na Correria", 
      pdfUrl: "https://drive.google.com/file/d/1n35uzpb_bWcAsOR73299bhVKHCY-ABZf/preview",
      conteudo: { "Parto e Emergências": "Fisiologia do trabalho de parto, estágios e assistência imediata." } 
    },
    { 
      numero: "5", 
      titulo: "Hora da Prova", 
      pdfUrl: "https://drive.google.com/file/d/1q4JsEo6C5FoaO3wQ48jau_gwC2gJyUSu/preview",
      conteudo: { "Avaliação Fetal": "Métodos diagnósticos, cardiotocografia e vitalidade fetal." } 
    }
  ],
  8: [
    {
      numero: "1", 
      titulo: "Problema 1",
      pdfUrl: "https://drive.google.com/file/d/1Vay17dhyeGHfcVXu1TPog6N-pgiTxsHf/preview",
      conteudo: { "PBL": "Consulte a apostila em PDF para o conteúdo integral deste problema." }
    },
    {
      numero: "2", 
      titulo: "Problema 2",
      pdfUrl: "https://drive.google.com/file/d/1KK6qtpEI2Nr_tW65-fPArGMHO2-8DDwN/preview",
      conteudo: { "PBL": "Consulte a apostila em PDF para o conteúdo integral deste problema." }
    },
    {
      numero: "3", 
      titulo: "Problema 3",
      pdfUrl: "https://drive.google.com/file/d/1ZUthP5xGDxR_iz5TCofRQNrVuSPFPGtn/preview",
      conteudo: { "PBL": "Consulte a apostila em PDF para o conteúdo integral deste problema." }
    },
    {
      numero: "4", 
      titulo: "Problema 4",
      pdfUrl: "https://drive.google.com/file/d/1o7jNXrJ7TjtbXs6Wm7qOA1z2TgEfo2I4/preview",
      conteudo: { "PBL": "Consulte a apostila em PDF para o conteúdo integral deste problema." }
    },
    {
      numero: "5", 
      titulo: "Problema 5",
      pdfUrl: "https://drive.google.com/file/d/1pNq1rlW1edeV7MdW6eM6ZULHH137VMOD/preview",
      conteudo: { "PBL": "Consulte a apostila em PDF para o conteúdo integral deste problema." }
    },
    {
      numero: "6", 
      titulo: "Problema 6",
      pdfUrl: "https://drive.google.com/file/d/1DOOIdDNygPshPIRjrLmKLuVPbPzfLZ1D/preview",
      conteudo: { "PBL": "Consulte a apostila em PDF para o conteúdo integral deste problema." }
    }
  ],
};

const MODULE_SUMMARIES_GALLERY: Record<number, ModuleSummaryItem[]> = {
  7: [
    { id: 'resumo_m7_full', title: 'Resumo Completo do Módulo 7', url: "https://drive.google.com/file/d/18Wp79G450E0Q0c5xa6Wz8Bw87f9yyNKY/preview" }
  ],
  8: [
    { id: 'resumo_m8_pbl', title: 'Resumo — Módulo 8 (PBL)', url: "https://drive.google.com/file/d/1TLri-mokJ4RECshSPC3V-tW56DivSA_X/preview" }
  ]
};

interface PBLViewProps {
  userDisplayName?: string;
  userStats: UserStats;
  onNavigateToPremium: () => void;
  onIncrementUsage: (contentId: string) => void;
  onAddActivity: (item: any) => void;
  onAwardPoints?: (id: string, value?: number) => void;
}

const PBLView: React.FC<PBLViewProps> = ({ userDisplayName, userStats, onNavigateToPremium, onIncrementUsage, onAddActivity, onAwardPoints }) => {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'problemas' | 'resumos'>('info');
  const [selectedProblemNum, setSelectedProblemNum] = useState<string | null>(null);
  const [activeModuleSummary, setActiveModuleSummary] = useState<ModuleSummaryItem | null>(null);
  const [viewMode, setViewMode] = useState<'text' | 'pdf'>('text');
  const [isDownloading, setIsDownloading] = useState(false);

  const isPremiumUser = userStats.isPremium || userStats.plan === 'premium';
  
  const isOverLimit = (id: string) => {
    if (isPremiumUser) return false;
    if (userStats.openedContentIds?.includes(id)) return false;
    return (userStats.openedContentIds?.length || 0) >= 10;
  };

  const pblHistory = useMemo(() => 
    (userStats.recentActivity || []).filter(a => a.type === 'apostila').slice(0, 3),
  [userStats.recentActivity]);

  const handleResumeActivity = (act: any) => {
    if (act.metadata) {
      setSelectedModule(act.metadata.moduleId);
      if (act.metadata.isModuleSummary) {
          setActiveTab('resumos');
          setActiveModuleSummary({ id: act.id, title: act.title, url: act.metadata.url });
      } else {
          setSelectedProblemNum(act.metadata.problemNum);
          setActiveTab('problemas');
      }
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedProblemNum, selectedModule, activeTab, activeModuleSummary]);

  useEffect(() => {
    setViewMode('text');
  }, [selectedProblemNum]);

  const modulesBasico = [
    { id: 1, title: 'ASE 1 — Introdução ao Estudo da Medicina' },
    { id: 2, title: 'ASE 2 — Proliferação, Alteração do Crescimento e Diferenciação Celular' },
    { id: 3, title: 'ASE 3 — Funções Biológicas 1' },
    { id: 4, title: 'ASE 4 — Funções Biológicas 2' },
    { id: 5, title: 'ASE 5 — Metabolismo e Nutrição' },
    { id: 6, title: 'ASE 6 — Mecanismo de Agressão e Defesa' },
    { id: 7, title: 'ASE 7 — Concepção, Formação do Ser Humano e Gestação' },
    { id: 8, title: 'ASE 8 — Nascimento, Crescimento e Desenvolvimento da Criança e do Adolescente' },
    { id: 9, title: 'ASE 9 — Vida Adulta e Processo de Envelhecimento' },
    { id: 10, title: 'ASE 10 — Percepção, Consciência e Emoções' },
    { id: 11, title: 'ASE 11 — Febre, Inflamação e Infecção' },
    { id: 12, title: 'ASE 12 — Fadiga, Perda de Peso e Anemias' },
  ];

  const modulesClinico = [
    { id: 13, title: 'ASE 13 — Disúria, Edema e Proteinúria' },
    { id: 14, title: 'ASE 14 — Perda de Sangue' },
    { id: 15, title: 'ASE 15 — Mente e Comportamento' },
  ];

  const handleSelectProblem = (num: string) => {
    const contentId = `pbl_${selectedModule}_${num}`;
    if (isOverLimit(contentId)) return;
    
    setSelectedProblemNum(num);
    
    const summaries = GLOBAL_SUMMARIES[selectedModule!] || [];
    const prob = summaries.find(s => s.numero === num);
    if (prob) {
      onAddActivity({
        id: `pbl_${selectedModule}_${num}`,
        type: 'apostila',
        title: prob.titulo,
        subtitle: `ASE ${selectedModule} • Prob. ${num}`,
        metadata: { moduleId: selectedModule, problemNum: num }
      });
      onIncrementUsage(contentId);
      onAwardPoints?.(`pbl_${selectedModule}_${num}`, 5);
    }
  };

  const handleOpenModuleSummary = (item: ModuleSummaryItem) => {
    if (isOverLimit(item.id)) return;
    
    setActiveModuleSummary(item);
    onAddActivity({
        id: item.id,
        type: 'apostila',
        title: item.title,
        subtitle: `ASE ${selectedModule} • Resumo`,
        metadata: { moduleId: selectedModule, isModuleSummary: true, url: item.url }
    });
    onIncrementUsage(item.id);
    onAwardPoints?.(item.id, 5);
  };

  const handleTabChange = (tab: 'info' | 'problemas' | 'resumos') => {
    setActiveTab(tab);
    if (tab !== 'resumos') setActiveModuleSummary(null);
  };

  const handleModuleClick = (id: number) => {
    setSelectedModule(id);
    setActiveTab('info');
    setSelectedProblemNum(null);
    setActiveModuleSummary(null);
  };

  const handleDownloadApostila = async (pdfUrl: string, titulo: string) => {
    const downloadId = `download_${selectedModule}_${selectedProblemNum}`;
    if (isOverLimit(downloadId)) return;
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const { PDFDocument, rgb, degrees, StandardFonts } = (window as any).PDFLib;
      const currentModuleObj = [...modulesBasico, ...modulesClinico].find(m => m.id === selectedModule);
      const moduleName = currentModuleObj?.title || "NexusBQ";
      const userName = userDisplayName || "Estudante NexusBQ";
      
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const watermarkText = `NEXUSBQ - ${userName.toUpperCase()} - ${moduleName}`;
      
      page.drawText(watermarkText, {
        x: 50, y: 100, size: 30, font: font, color: rgb(0.5, 0.5, 0.5), opacity: 0.1, rotate: degrees(45),
      });

      page.drawText(titulo, {
        x: 50, y: 750, size: 20, font: font, color: rgb(0, 0, 0),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NexusBQ_${titulo.replace(/\s+/g, '_')}.pdf`;
      link.click();
      onIncrementUsage(downloadId);
      onAwardPoints?.(downloadId, 5);
    } catch (err) {
      console.error("Erro no download:", err);
      alert("Erro ao processar download.");
    } finally {
      setIsDownloading(false);
    }
  };

  const renderRecursiveContent = (content: any): React.ReactNode => {
    if (typeof content === 'string') {
      return <p className="text-neutral-700 dark:text-nexus-text-main text-sm leading-[1.8] font-light text-justify mb-6">{content}</p>;
    }
    if (content && typeof content === 'object') {
      return (
        <div className="space-y-6 md:space-y-8">
          {Object.entries(content).map(([label, sub]: [string, any], i) => (
            <div key={i} className="space-y-2 md:space-y-3">
              <h5 className="text-[9px] md:text-[11px] font-black text-nexus-purple uppercase tracking-[0.2em] flex items-center gap-2 md:gap-3">
                 <div className="w-1.5 h-1.5 bg-nexus-purple rounded-full shrink-0"></div> {label}
              </h5>
              <div className="pl-4 md:pl-6 border-l border-neutral-200 dark:border-nexus-border">{renderRecursiveContent(sub)}</div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (selectedModule) {
    const allModules = [...modulesBasico, ...modulesClinico];
    const currentModule = allModules.find(m => m.id === selectedModule);
    const summaries = GLOBAL_SUMMARIES[selectedModule] || [];
    const moduleSummaryGallery = MODULE_SUMMARIES_GALLERY[selectedModule] || [];

    const currentProblemId = `pbl_${selectedModule}_${selectedProblemNum}`;
    const showOverLimitBanner = (isOverLimit(currentProblemId) && activeTab === 'problemas' && selectedProblemNum) || 
                               (activeModuleSummary && isOverLimit(activeModuleSummary.id) && activeTab === 'resumos');

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-[1800px] mx-auto px-0 md:px-4 relative">
        {showOverLimitBanner && (
          <div className="absolute inset-0 z-40 bg-neutral-900/90 dark:bg-nexus-bg/90 backdrop-blur-md flex items-center justify-center p-6 text-center rounded-[2rem]">
            <div className="max-w-md">
              <div className="w-16 h-16 bg-sky-600/20 rounded-full flex items-center justify-center text-sky-600 dark:text-nexus-blue mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h3 className="text-2xl font-black text-neutral-900 dark:text-nexus-text-title mb-4">Limite Atingido</h3>
              <p className="text-neutral-500 dark:text-nexus-text-main mb-8 text-sm leading-relaxed">
                Você atingiu o limite de <span className="font-bold">10 conteúdos</span> do plano básico. Este limite não renova.
              </p>
              <button onClick={onNavigateToPremium} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-sky-600/20 uppercase tracking-widest text-xs">Conhecer Plano Premium</button>
            </div>
          </div>
        )}

        <button onClick={() => { setSelectedModule(null); setSelectedProblemNum(null); setActiveModuleSummary(null); }} className="mb-6 md:mb-8 flex items-center gap-2 text-neutral-500 dark:text-nexus-text-sec hover:text-neutral-900 dark:hover:text-white transition-colors px-4 group">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
          <span className="text-xs font-medium uppercase tracking-widest">Voltar para Grade</span>
        </button>

        <header className="mb-8 md:mb-10 flex items-center gap-3 md:gap-4 px-4">
          <span className={`bg-nexus-purple text-white text-[9px] md:text-[11px] font-black px-2 md:px-3 py-1.5 rounded-lg shadow-sm shrink-0`}>ASE {currentModule?.id}</span>
          <h1 className="text-xl md:text-3xl font-black text-neutral-900 dark:text-nexus-text-title tracking-tighter">{currentModule?.title}</h1>
        </header>

        <div className="flex gap-1 md:gap-2 bg-white dark:bg-nexus-surface p-1 rounded-2xl mb-8 md:mb-12 w-fit border border-neutral-200 dark:border-nexus-border mx-4 overflow-x-auto no-scrollbar">
          <button onClick={() => handleTabChange('info')} className={`px-4 md:px-8 py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'info' ? 'bg-neutral-100 dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border text-neutral-900 dark:text-nexus-text-title shadow-sm' : 'text-neutral-500 dark:text-nexus-text-sec hover:text-neutral-900 dark:hover:text-white'}`}>Sobre</button>
          <button onClick={() => handleTabChange('problemas')} className={`px-4 md:px-8 py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'problemas' ? `bg-nexus-purple text-white shadow-md` : 'text-neutral-500 dark:text-nexus-text-sec hover:text-neutral-900 dark:hover:text-white'}`}>Problemas</button>
          <button onClick={() => handleTabChange('resumos')} className={`px-4 md:px-8 py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'resumos' ? 'bg-sky-600 dark:bg-white text-white dark:text-black shadow-md' : 'text-neutral-500 dark:text-nexus-text-sec hover:text-neutral-900 dark:hover:text-white'}`}>
            Resumos
            {!isPremiumUser && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="bg-white dark:bg-nexus-surface border border-neutral-200 dark:border-nexus-border p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] mx-4 shadow-sm">
            <h3 className="text-xl md:text-2xl font-black text-neutral-900 dark:text-nexus-text-title mb-6 italic">Visão do Módulo</h3>
            <p className="text-neutral-600 dark:text-nexus-text-main text-base md:text-lg font-light leading-relaxed mb-8">
              Módulo integrante da grade curricular do curso de Medicina no método PBL. Focado na integração de competências clínicas e científicas.
            </p>
          </div>
        )}

        {activeTab === 'resumos' && (
          <div className="animate-in fade-in duration-500 px-4">
            {!isPremiumUser ? (
              <div className="bg-white dark:bg-nexus-surface border border-sky-600/20 dark:border-nexus-blue/20 p-12 md:p-20 rounded-[2.5rem] md:rounded-[3.5rem] text-center border-dashed shadow-sm">
                 <div className="w-16 h-16 md:w-20 md:h-20 bg-sky-600/10 dark:bg-nexus-blue/10 rounded-full flex items-center justify-center text-sky-600 dark:text-nexus-blue mx-auto mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                 </div>
                 <h4 className="text-2xl md:text-3xl font-black text-neutral-900 dark:text-nexus-text-title mb-4 tracking-tight">Resumos Exclusivos Premium</h4>
                 <p className="text-neutral-500 dark:text-nexus-text-main text-sm md:text-base max-w-md mx-auto leading-relaxed mb-10">
                   Acesse resumos completos indexados, revisados e formatados para iPad/Desktop. Este recurso é exclusivo para assinantes Premium.
                 </p>
                 <button onClick={onNavigateToPremium} className="bg-sky-600 hover:bg-sky-500 text-white font-black px-10 py-4 rounded-2xl text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-md transition-all active:scale-95">
                   Quero ser Premium
                 </button>
              </div>
            ) : (
              activeModuleSummary ? (
                <div className="flex flex-col gap-4 md:gap-6 animate-in zoom-in duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-nexus-surface p-5 md:p-6 rounded-2xl md:rounded-3xl border border-neutral-200 dark:border-nexus-border gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setActiveModuleSummary(null)} className="w-10 h-10 bg-neutral-100 dark:bg-nexus-card hover:bg-neutral-200 dark:hover:bg-nexus-hover border border-neutral-200 dark:border-nexus-border rounded-xl flex items-center justify-center text-neutral-600 dark:text-nexus-text-sec transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                      </button>
                      <div>
                        <h4 className="text-sm md:text-base text-neutral-900 dark:text-nexus-text-title font-bold">{activeModuleSummary.title}</h4>
                        <p className="text-neutral-500 dark:text-nexus-text-label text-[10px] uppercase tracking-widest">Visualizador Interno NexusBQ</p>
                      </div>
                    </div>
                    <a 
                      href={activeModuleSummary.url.replace('/preview', '/view')} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto bg-neutral-900 dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      Abrir Externo
                    </a>
                  </div>
                  <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-md relative h-[600px] md:h-[900px] border border-neutral-200 dark:border-nexus-border">
                    <iframe src={activeModuleSummary.url} className="w-full h-full border-none" title={activeModuleSummary.title}></iframe>
                  </div>
                </div>
              ) : (
                moduleSummaryGallery.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {moduleSummaryGallery.map((item) => (
                      <div key={item.id} className="bg-white dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border p-8 rounded-[2rem] hover:border-nexus-purple/50 transition-all group flex flex-col justify-between h-64 shadow-sm hover:-translate-y-1">
                        <div className="flex justify-between items-start">
                          <div className="w-12 h-12 bg-nexus-purple/10 rounded-2xl flex items-center justify-center text-nexus-purple group-hover:bg-nexus-purple group-hover:text-white transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                          </div>
                          <span className="text-[9px] font-black text-neutral-500 dark:text-nexus-text-label uppercase tracking-widest bg-neutral-50 dark:bg-nexus-surface px-2 py-1 rounded">Módulo {selectedModule}</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-neutral-900 dark:text-nexus-text-title mb-6 tracking-tight leading-tight">{item.title}</h4>
                          <button 
                            onClick={() => handleOpenModuleSummary(item)}
                            className="w-full bg-neutral-100 dark:bg-white text-neutral-900 dark:text-black py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-nexus-purple hover:text-white transition-all shadow-sm"
                          >
                            Visualizar Resumo
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 md:py-40 text-center border-2 border-dashed border-neutral-200 dark:border-nexus-border rounded-[2rem] md:rounded-[3rem] text-neutral-500 dark:text-nexus-text-sec bg-white dark:bg-nexus-surface shadow-sm">
                    <h4 className="text-neutral-900 dark:text-nexus-text-main font-bold mb-1">Nenhum resumo disponível</h4>
                    <p className="text-xs">Os resumos para este módulo estão sendo organizados.</p>
                  </div>
                )
              )
            )}
          </div>
        )}

        {activeTab === 'problemas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 px-4 pb-12">
            <aside className="lg:col-span-3 space-y-3 h-fit lg:sticky lg:top-24">
              <h3 className="text-[10px] font-black text-neutral-500 dark:text-nexus-text-label uppercase tracking-widest px-3 mb-4">Problemas</h3>
              <div className="flex lg:flex-col gap-3 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                {summaries.map((p, idx) => (
                  <button key={idx} onClick={() => handleSelectProblem(p.numero)} className={`min-w-[160px] lg:w-full text-left p-4 rounded-xl md:rounded-2xl border transition-all shrink-0 ${selectedProblemNum === p.numero ? `border-nexus-purple bg-white dark:bg-nexus-card text-neutral-900 dark:text-white shadow-md` : 'bg-neutral-50 dark:bg-nexus-surface border-neutral-200 dark:border-nexus-border text-neutral-500 dark:text-nexus-text-sec hover:bg-neutral-100 dark:hover:bg-nexus-hover'}`}>
                    <span className={`text-[8px] md:text-[9px] font-bold block uppercase mb-1 ${selectedProblemNum === p.numero ? 'text-nexus-purple' : 'opacity-50'}`}>{`Prob. ${p.numero}`}</span>
                    <span className="text-xs md:text-sm font-bold line-clamp-2">{p.titulo}</span>
                  </button>
                ))}
              </div>
            </aside>

            <main className="lg:col-span-9">
              {selectedProblemNum ? (
                (() => {
                  const prob = summaries.find(s => s.numero === selectedProblemNum);
                  if (!prob) return null;
                  return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="bg-white dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] mb-6 md:mb-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="w-full text-center md:text-left">
                          <span className={`text-[9px] md:text-[10px] font-black uppercase text-nexus-purple tracking-widest`}>Conteúdo do Problema</span>
                          <h2 className="text-2xl md:text-4xl font-black text-neutral-900 dark:text-nexus-text-title tracking-tighter">{prob.numero}. {prob.titulo}</h2>
                        </div>
                        {prob.pdfUrl && (
                          <div className="flex flex-col sm:flex-row items-center gap-3 bg-neutral-50 dark:bg-nexus-surface p-1.5 rounded-2xl border border-neutral-200 dark:border-nexus-border w-full md:w-auto">
                            <div className="flex bg-white dark:bg-nexus-card p-1 rounded-xl w-full sm:w-auto border border-neutral-100 dark:border-nexus-border shadow-sm">
                              <button onClick={() => setViewMode('text')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${viewMode === 'text' ? 'bg-neutral-100 dark:bg-nexus-surface text-neutral-900 dark:text-white border border-neutral-200 dark:border-nexus-border' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}>Texto</button>
                              <button onClick={() => setViewMode('pdf')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${viewMode === 'pdf' ? 'bg-nexus-purple text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                PDF
                              </button>
                            </div>
                            
                            <button 
                              onClick={() => prob.pdfUrl && handleDownloadApostila(prob.pdfUrl, prob.titulo)}
                              disabled={isDownloading}
                              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all bg-nexus-green hover:opacity-90 text-white shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {isDownloading ? "..." : "Baixar"}
                            </button>
                          </div>
                        )}
                      </div>

                      {viewMode === 'text' ? (
                        <div className="bg-white dark:bg-nexus-surface p-6 md:p-10 rounded-[1.5rem] md:rounded-[3rem] border border-neutral-200 dark:border-nexus-border text-neutral-700 dark:text-nexus-text-main shadow-sm">
                          {renderRecursiveContent(prob.conteudo)}
                        </div>
                      ) : (
                        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-md relative h-[600px] md:h-[900px] border border-neutral-200 dark:border-nexus-border">
                           <iframe src={prob.pdfUrl} className="w-full h-full border-none" title="PDF Viewer"></iframe>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="py-20 md:py-32 text-center border-2 border-dashed border-neutral-200 dark:border-nexus-border rounded-[1.5rem] md:rounded-[3rem] text-neutral-500 dark:text-nexus-text-sec bg-white dark:bg-nexus-surface shadow-sm">
                   <h4 className="text-neutral-900 dark:text-nexus-text-main font-bold mb-1">Selecione um Problema</h4>
                   <p className="text-xs">Escolha na lista lateral para ler o conteúdo.</p>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto px-0 md:px-4 pb-32">
      {/* Bloco Continuar Estudando - PBL */}
      {pblHistory.length > 0 && (
        <section className="max-w-[1800px] mx-auto px-4 md:px-8 mb-12 animate-in slide-in-from-top-4 duration-500">
          <h3 className="text-[10px] font-black text-neutral-500 dark:text-nexus-text-sec uppercase tracking-[0.4em] mb-4 flex items-center gap-4">
            Continuar Estudando – PBL <div className="h-px flex-grow bg-neutral-200 dark:bg-nexus-border"></div>
          </h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-2 px-2">
            {pblHistory.map((act) => (
              <div 
                key={act.id} 
                onClick={() => handleResumeActivity(act)}
                className="bg-white dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border p-4 rounded-2xl cursor-pointer hover:border-nexus-purple transition-all flex items-center gap-4 group min-w-[280px] shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-nexus-surface flex items-center justify-center text-sm group-hover:bg-nexus-purple/10 group-hover:text-nexus-purple transition-all shrink-0 text-nexus-purple border border-neutral-200 dark:border-nexus-border">
                  📄
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

      <header className="mb-10 md:mb-16 px-4">
        <h2 className="text-4xl md:text-6xl font-black text-neutral-900 dark:text-nexus-text-title mb-4 md:mb-6 tracking-tighter italic">Grade PBL</h2>
        <p className="text-neutral-500 dark:text-nexus-text-main text-lg md:text-2xl font-light max-w-4xl leading-relaxed">Estrutura curricular integral com problemas, resumos detalhados e apostilas integradas.</p>
      </header>

      <div className="space-y-12 md:space-y-16 px-4">
        <section>
          <h3 className="text-[10px] font-black text-nexus-purple uppercase tracking-[0.4em] mb-6 md:mb-8 flex items-center gap-4">
             Ciclo Básico <div className="h-px flex-grow bg-nexus-purple/20"></div>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
            {modulesBasico.map((m) => (
              <div key={m.id} onClick={() => handleModuleClick(m.id)} className={`bg-white dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border border-l-4 border-l-nexus-purple p-6 md:p-8 rounded-2xl md:rounded-3xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-nexus-hover hover:-translate-y-1 transition-all flex flex-col justify-between h-44 md:h-52 group shadow-sm`}>
                <span className="text-[9px] md:text-[10px] font-black text-nexus-purple uppercase tracking-widest">ASE {m.id}</span>
                <h4 className="text-base md:text-lg font-bold text-neutral-900 dark:text-nexus-text-main leading-tight group-hover:text-nexus-purple transition-colors">{m.title}</h4>
                <span className="text-[9px] md:text-[10px] font-bold uppercase text-neutral-400 dark:text-nexus-text-sec group-hover:text-nexus-purple transition-colors">Ver Conteúdo →</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-6 md:mb-8 flex items-center gap-4">
             Ciclo Clínico <div className="h-px flex-grow bg-indigo-500/20"></div>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
            {modulesClinico.map((m) => (
              <div key={m.id} onClick={() => handleModuleClick(m.id)} className={`bg-white dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border border-l-4 border-l-indigo-500 p-6 md:p-8 rounded-2xl md:rounded-3xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-nexus-hover hover:-translate-y-1 transition-all flex flex-col justify-between h-44 md:h-52 group shadow-sm`}>
                <span className="text-[9px] md:text-[10px] font-black text-indigo-500 uppercase tracking-widest">ASE {m.id}</span>
                <h4 className="text-base md:text-lg font-bold text-neutral-900 dark:text-nexus-text-main leading-tight group-hover:text-indigo-500 transition-colors">{m.title}</h4>
                <span className="text-[9px] md:text-[10px] font-bold uppercase text-neutral-400 dark:text-nexus-text-sec group-hover:text-indigo-500 transition-colors">Acessar Casos →</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PBLView;
