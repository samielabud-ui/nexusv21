
import React, { useState, useMemo, useRef } from 'react';
import { UserStats, VideoLesson, LastWatched, ActivityItem } from '../types';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

interface PremiumViewProps {
  userStats: UserStats;
  onAddActivity: (item: any) => void;
  onAwardPoints?: (id: string, value?: number) => void;
  onIncrementUsage?: (contentId: string) => void;
}

const BRAND_COLOR = "#00BFA6"; // Verde Médico Sanarflix
const VEST_COLOR = "#F43F5E";  // Rose para De Volta ao Vest
const MEDCOF_COLOR = "#991B1B"; // Vermelho Bordô MedCof
const MEDCURSO_COLOR = "#38BDF8"; // Azul Medcurso

// Lições existentes
const EMBRIOLOGIA_LESSONS: (VideoLesson & { duration: string })[] = [
  { id: 'O9YsUhCQv64', title: 'Fecundação', duration: '12:45' },
  { id: 'tMXgjHq61wQ', title: 'Gametogênese', duration: '15:20' },
  { id: '-iuWA5CQCMI', title: 'Zigoto e Blastocisto', duration: '10:15' },
  { id: 'i29YGecX9UQ', title: 'Âmnio e Celoma', duration: '14:30' },
  { id: 'HbQ8Zpex0AA', title: 'Córion', duration: '08:50' },
  { id: 'HVVclowB9qI', title: 'Gastrulação', duration: '18:10' },
  { id: 'XUD3IUNK7Vk', title: 'Notocorda e Tubo Neural', duration: '11:25' },
  { id: '7rYQMJzQoYg', title: 'Somitos, Celoma Intra e Sistema Cardiovascular', duration: '22:05' },
  { id: 'iu5VjWLLoKU', title: 'Organogênese e Dobramento do Embrião', duration: '16:40' },
  { id: 'tSqOhvdTDnc', title: 'Embriologia da 4ª à 8ª Semana', duration: '13:15' },
  { id: 'aFEVmlbJ708', title: 'Embriologia da 9ª Semana ao Nascimento', duration: '09:55' },
  { id: 'L2IZEut6Yok', title: 'Cavidades do Corpo Embrionário', duration: '11:45' },
  { id: 'CeDWt2Qg3UE', title: 'Desenvolvimento do Diafragma', duration: '07:30' },
  { id: 'WEzfPk3OJ9o', title: 'Aparelho Faríngeo (Arcos e Derivados)', duration: '19:20' },
  { id: 'Wxo8xMksxiU', title: 'Aparelho Faríngeo (Bolsas, Sulcos e Membranas)', duration: '15:50' },
  { id: 'axyh2MK-XDU', title: 'Embriologia do Pescoço', duration: '12:10' },
  { id: 'fnJnYip6qWA', title: 'Primórdio Respiratório e Faringe', duration: '14:05' },
  { id: 'iExD4xImT24', title: 'Embriologia da Face', duration: '17:35' },
  { id: 'xQO9_OJmuCI', title: 'Embriologia do Palato', duration: '10:40' },
  { id: '7ydEZDWXWmg', title: 'Maturação Pulmonar', duration: '08:25' },
  { id: 'a3zj8iowhJ8', title: 'Membranas Fetais', duration: '13:50' },
  { id: 'f2k4ng4kLzQ', title: 'Traqueia, Brônquios e Pulmões', duration: '11:15' },
  { id: 'IqL5Icry-ZQ', title: 'Intestino Anterior (Bolsa Omental e Duodeno)', duration: '14:25' },
  { id: 'V3gyiEpoEXA', title: 'Intestino Anterior (Fígado e Sistema Biliar)', duration: '16:05' },
  { id: 'D4GpR1-IJ5M', title: 'Intestino Anterior (Pâncreas e Baço)', duration: '12:50' },
  { id: 'BbYOX4kR3vc', title: 'Placenta', duration: '15:15' },
  { id: 'kDNHoeo5Yio', title: 'Intestino Anterior (Esôfago e Estômago)', duration: '13:30' },
  { id: 'MvR0FbqGD_Y', title: 'Intestino Médio (Herniação e Rotação)', duration: '18:45' },
  { id: 'XU-voGzqC_c', title: 'Intestino Médio (Ceco e Apêndice)', duration: '10:10' },
  { id: 'kCVHiNzogbI', title: 'Intestino Posterior e Cloaca', duration: '12:20' },
  { id: 'Tow8vrGpf6A', title: 'Sistema Urinário (Bexiga e Defeitos)', duration: '16:55' },
  { id: 'Sb62GtZf0LY', title: 'Sistema Genital (Gônadas Indiferenciadas)', duration: '20:10' },
  { id: '8ivU4plbcUw', title: 'Desenvolvimento do Coração e Vasos', duration: '25:30' },
];

const REPRODUCAO_HUMANA_LESSONS: (VideoLesson & { duration: string })[] = [
  { id: 'x3PuKN0TK7Q', title: 'Gametogênese – Espermatogênese', duration: '15:40' },
  { id: '02qzFxym5wg', title: 'Gametogênese – Ovogênese', duration: '14:20' },
  { id: 'TmUPeZcs_Fo', title: 'Gametogênese – Diferenças entre Espermatogênese e Ovogênese', duration: '08:15' },
  { id: 'e_vuOHUhpYU', title: 'Gametogênese – Partenogênese', duration: '10:50' },
  { id: 'gRWG7Whisvo', title: 'Gametogênese – Tipos de Partenogênese', duration: '12:10' },
  { id: 'eidGIV69EbA', title: 'Gametogênese – Pedogênese e Neotenia', duration: '11:05' },
];

// NOVAS LIÇÕES PEDIATRIA 1 (MEDCURSO)
const PEDIATRIA_1_LESSONS: (VideoLesson & { duration: string; block: string; isBonus?: boolean })[] = [
  // 1. NEONATOLOGIA – BASE
  { id: '9Gvq0WceuPk', title: 'Introdução Neonatal', duration: '25:00', block: '1️⃣ NEONATOLOGIA – BASE' },
  { id: 'A4_sGTxXLjw', title: 'Reanimação Neonatal', duration: '30:00', block: '1️⃣ NEONATOLOGIA – BASE' },
  { id: 'sTxiSLpDjkU', title: 'Icterícia Neonatal', duration: '28:00', block: '1️⃣ NEONATOLOGIA – BASE' },
  // 2. INFECÇÕES CONGÊNITAS
  { id: 'e3xEPYIujN0', title: 'Infecções Congênitas – Exposição', duration: '22:00', block: '2️⃣ INFECÇÕES CONGÊNITAS' },
  { id: 'CMXnFxqEcx8', title: 'Infecções Congênitas – Sífilis', duration: '24:00', block: '2️⃣ INFECÇÕES CONGÊNITAS' },
  { id: 'PRB9jAbbikQ', title: 'Infecções Congênitas – Outras', duration: '20:00', block: '2️⃣ INFECÇÕES CONGÊNITAS' },
  { id: '0wQ0uK3bDF4', title: 'Infecções Congênitas – Outras 2', duration: '18:00', block: '2️⃣ INFECÇÕES CONGÊNITAS' },
  // 3. DISTÚRBIOS RESPIRATÓRIOS NEONATAIS
  { id: 'Z6IZ3pX43wE', title: 'Distúrbio Respiratório – Parte 1', duration: '15:00', block: '3️⃣ DISTÚRBIOS RESPIRATÓRIOS NEONATAIS' },
  { id: 'XGXe2_qYwP8', title: 'Distúrbio Respiratório – Parte 2', duration: '16:00', block: '3️⃣ DISTÚRBIOS RESPIRATÓRIOS NEONATAIS' },
  { id: 'HMB2JHyyH4s', title: 'Distúrbio Respiratório – Parte 3', duration: '14:00', block: '3️⃣ DISTÚRBIOS RESPIRATÓRIOS NEONATAIS' },
  // 4. DOENÇAS EXANTEMÁTICAS
  { id: 'xXjKSU36Um4', title: 'Doenças Exantemáticas – Introdução', duration: '12:00', block: '4️⃣ DOENÇAS EXANTEMÁTICAS' },
  { id: '8pRZJsazvCs', title: 'Caso Clínico 01', duration: '10:00', block: '4️⃣ DOENÇAS EXANTEMÁTICAS' },
  { id: 'kPI3lzbKkoo', title: 'Caso Clínico 02', duration: '11:00', block: '4️⃣ DOENÇAS EXANTEMÁTICAS' },
  { id: '6du-1JJd8rQ', title: 'Caso Clínico 03', duration: '09:00', block: '4️⃣ DOENÇAS EXANTEMÁTICAS' },
  { id: 'yWSWkqAAG1M', title: 'Caso Clínico 04', duration: '12:00', block: '4️⃣ DOENÇAS EXANTEMÁTICAS' },
  // 5. BÔNUS PED1
  { id: 'i7SEn1c5pxE', title: 'Triagem Neonatal', duration: '42:00', block: '5️⃣ BÔNUS PED1', isBonus: true },
  { id: 'IDy-T2pE2Zg', title: 'O Exame Físico Neonatal', duration: '47:00', block: '5️⃣ BÔNUS PED1', isBonus: true },
  { id: 'jFq-l20Truw', title: 'Doenças do Trato Gastrointestinal', duration: '26:00', block: '5️⃣ BÔNUS PED1', isBonus: true },
  { id: 'Mv7SJ0_IoZQ', title: 'Miscelânea', duration: '52:00', block: '5️⃣ BÔNUS PED1', isBonus: true },
];

const SANARFLIX_COURSES = [
  "Anatomia do Sistema Locomotor", "Anatomia dos Órgãos e Sistemas", "Antibioticoterapia",
  "Atendimento Pré-Hospitalar", "Biofísica", "Biologia Molecular e Celular",
  "Bioquímica", "Eletrocardiograma (ECG)", "Embriologia", "Exames Laboratoriais",
  "Farmacologia", "Fisiologia", "Genética", "Histologia", "Microbiologia",
  "Neuroanatomia", "Parasitologia", "Patologia", "Primeiros Socorros",
  "Radiologia", "Semiologia", "Sistema Circulatório", "Sistema Digestório",
  "Sistema Endócrino", "Sistema Hematopoiético", "Sistema Imune", "Sistema Nervoso",
  "Sistema Reprodutor", "Sistema Respiratório", "Sistema Urinário e Renal", "Trauma"
];

const VEST_COURSES = [
  "Reprodução Humana", "Embriologia Animal"
];

const MEDCOF_COURSES = [
  "Extensivo", "Curso de Ultrassom – POCUS", "Desafios de Imagem", 
  "Estações Multimídia", "Hands On – OSCE", "Medical Life Hacks", "RX"
];

const MEDCURSO_COURSES = [
  "Pediatria 1", "Ginecologia e Obstetrícia", "Cirurgia", "Clínica Médica", "Preventiva"
];

const PREMIUM_PLATFORMS = [
  { id: 'sanarflix', title: 'Sanarflix', category: 'official', description: 'Plataforma oficial Sanarflix.', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600' },
  { id: 'medcurso', title: 'Medcurso', category: 'official', description: 'Preparatório para Residência Médica.', image: 'https://images.unsplash.com/photo-1581594632702-52c1138395c5?auto=format&fit=crop&q=80&w=600' },
  { id: 'medcof', title: 'MedCof', category: 'official', description: 'Elite em aprovação na residência médica.', image: 'https://www.grupomedcof.com.br/blog/wp-content/uploads/2024/10/Modelo-instituicoes-16.png' },
  { id: 'devoltavest', title: 'De Volta ao Vest', category: 'foundation', description: 'Fundamentos do vestibular como base sólida para a medicina.', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600' },
  { id: 'eumedico', title: 'Eu Médico Residente', category: 'specialized', description: 'Especialização e Prática Clínica.', image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=600' },
  { id: 'estrategiamed', title: 'EstratégiaMED', category: 'official', description: 'Foco total em aprovação e revisões.', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600' }
];

const getCourseCategory = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('reprodução') || n.includes('embriologia')) return { label: 'Fundamentos', color: '#F43F5E', text: 'text-rose-500', border: 'border-rose-500/30' };
  if (n.includes('anatomia') || n.includes('neuro')) return { label: 'Anatomia', color: '#38BDF8', text: 'text-nexus-blue', border: 'border-nexus-blue/30' };
  if (n.includes('bioquímica') || n.includes('genética') || n.includes('biologia')) return { label: 'Bioquímica', color: '#4ADE80', text: 'text-nexus-green', border: 'border-nexus-green/30' };
  if (n.includes('trauma') || n.includes('primeiros') || n.includes('atendimento') || n.includes('pocus') || n.includes('osce')) return { label: 'Prática', color: '#FBBF24', text: 'text-nexus-orange', border: 'border-nexus-orange/30' };
  if (n.includes('rx') || n.includes('imagem')) return { label: 'Radiologia', color: '#38BDF8', text: 'text-nexus-blue', border: 'border-nexus-blue/30' };
  if (n.includes('pediatria')) return { label: 'Pediatria', color: '#FBBF24', text: 'text-amber-500', border: 'border-amber-500/30' };
  return { label: 'Clínica', color: '#A78BFA', text: 'text-nexus-purple', border: 'border-nexus-purple/30' };
};

const PremiumView: React.FC<PremiumViewProps> = ({ userStats, onAddActivity, onAwardPoints, onIncrementUsage }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoLesson | null>(null);
  const [search, setSearch] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  
  const videoRef = useRef<HTMLIFrameElement>(null);

  const watchedVideos = userStats.watchedLessons || [];
  
  const accentColor = useMemo(() => {
    if (selectedPlatform === 'devoltavest') return VEST_COLOR;
    if (selectedPlatform === 'medcof') return MEDCOF_COLOR;
    if (selectedPlatform === 'medcurso') return MEDCURSO_COLOR;
    return BRAND_COLOR;
  }, [selectedPlatform]);

  // Filtro de histórico
  const premiumHistory = useMemo(() => 
    (userStats.recentActivity || [])
      .filter(a => a.type === 'aula' && a.metadata && a.metadata.platformId)
      .slice(0, 8),
  [userStats.recentActivity]);

  const markAsWatched = async (id: string, forceState?: boolean) => {
    if (!userStats.isPremium || !auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const isCurrentlyWatched = watchedVideos.includes(id);
    const targetState = forceState !== undefined ? forceState : !isCurrentlyWatched;

    if (targetState === isCurrentlyWatched) return;

    try {
      await updateDoc(userRef, {
        watchedLessons: targetState ? arrayUnion(id) : arrayRemove(id)
      });
    } catch (err) {
      console.error("Erro ao salvar progresso no Firebase:", err);
    }
  };

  const isOverLimit = (id: string) => {
    if (userStats.plan === 'premium') return false;
    if (userStats.openedContentIds?.includes(id)) return false;
    return (userStats.openedContentIds?.length || 0) >= 10;
  };

  const handleLessonSelect = async (lesson: VideoLesson) => {
    const contentId = `aula_${lesson.id}`;
    if (isOverLimit(contentId)) {
        setActiveVideo(lesson);
        return;
    }

    setActiveVideo(lesson);
    if (!userStats.isPremium || !auth.currentUser) {
        onIncrementUsage?.(contentId);
        return;
    }

    const platformTitle = PREMIUM_PLATFORMS.find(p => p.id === selectedPlatform)?.title || 'Nexus';

    // Rastrear atividade
    onAddActivity({
      id: contentId,
      type: 'aula',
      title: lesson.title,
      subtitle: `${selectedCourse} (${platformTitle})`,
      metadata: { 
        platformId: selectedPlatform, 
        courseName: selectedCourse, 
        lessonId: lesson.id 
      }
    });

    onAwardPoints?.(contentId, 5);

    const userRef = doc(db, "users", auth.currentUser.uid);
    const lastData: LastWatched = {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      courseName: selectedCourse || 'Embriologia',
      platformId: selectedPlatform || 'sanarflix'
    };

    try {
      await updateDoc(userRef, { lastWatched: lastData });
    } catch (err) {
      console.error("Erro ao salvar última aula no Firebase:", err);
    }
  };

  const handleResumeActivity = (act: ActivityItem) => {
    if (act.metadata && act.metadata.platformId) {
      setSelectedPlatform(act.metadata.platformId);
      setSelectedCourse(act.metadata.courseName);
      setActiveVideo({ id: act.metadata.lessonId, title: act.title });
    }
  };

  const categories = [
    { id: 'official', title: 'Plataformas Parceiras', items: PREMIUM_PLATFORMS.filter(p => p.category === 'official') },
    { id: 'specialized', title: 'Preparatórios Residência', items: PREMIUM_PLATFORMS.filter(p => p.category === 'specialized') },
    { id: 'foundation', title: 'Cursos Base (Vestibular)', items: PREMIUM_PLATFORMS.filter(p => p.category === 'foundation') }
  ];

  const currentCourses = useMemo(() => {
    if (selectedPlatform === 'sanarflix') return SANARFLIX_COURSES;
    if (selectedPlatform === 'devoltavest') return VEST_COURSES;
    if (selectedPlatform === 'medcof') return MEDCOF_COURSES;
    if (selectedPlatform === 'medcurso') return MEDCURSO_COURSES;
    return [];
  }, [selectedPlatform]);

  const filteredCourses = useMemo(() => {
    return currentCourses.filter(course => 
      course.toLowerCase().includes(search.toLowerCase())
    );
  }, [currentCourses, search]);

  const filteredLessons = useMemo(() => {
    if (selectedCourse === 'Embriologia') return EMBRIOLOGIA_LESSONS.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));
    if (selectedCourse === 'Reprodução Humana') return REPRODUCAO_HUMANA_LESSONS.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));
    if (selectedCourse === 'Pediatria 1') return PEDIATRIA_1_LESSONS.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));
    return [];
  }, [selectedCourse, search]);

  if (!userStats.isPremium) {
    return (
      <div className="max-w-[1200px] mx-auto pt-10 pb-32 px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center mb-16 bg-white dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border rounded-3xl p-12 md:p-20 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-50 dark:bg-nexus-blue/10 rounded-full mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600 dark:text-nexus-blue"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold text-neutral-900 dark:text-nexus-text-title mb-4 tracking-tight">
            Acervo Médico Exclusivo
          </h1>
          <p className="text-neutral-500 dark:text-nexus-text-sec text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto mb-8">
            Para acessar bibliotecas, videoaulas e materiais preparatórios, assine o plano Premium e estude com curadoria especializada.
          </p>
          <button className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-10 py-4 rounded-xl text-sm transition-all shadow-sm active:scale-[0.98]">
            Ver Planos Premium
          </button>
        </div>
      </div>
    );
  }

  // --- NOVA VIEW DE AULA ESTILO HOTMART/STREAMING ---
  if (activeVideo) {
    const isCompleted = watchedVideos.includes(activeVideo.id);
    
    // Agrupamento de aulas se disponível (usado em Pediatria 1)
    const groupedLessons = filteredLessons.reduce((acc: any, lesson: any) => {
      const block = lesson.block || 'Aulas';
      if (!acc[block]) acc[block] = [];
      acc[block].push(lesson);
      return acc;
    }, {});

    return (
      <div className="fixed inset-0 z-[60] bg-nexus-bg flex flex-col md:flex-row animate-in fade-in duration-300">
        
        {/* LADO ESQUERDO: PLAYER E CONTEÚDO (70%) */}
        <div className="flex-grow flex flex-col overflow-y-auto no-scrollbar">
          
          {/* Top Bar Interna da Aula */}
          <header className="h-16 shrink-0 bg-nexus-surface border-b border-nexus-border flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveVideo(null)} 
                className="w-10 h-10 rounded-full hover:bg-nexus-hover flex items-center justify-center text-nexus-text-sec transition-colors"
                title="Sair da aula"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1" style={{ color: accentColor }}>{selectedCourse}</p>
                <h2 className="text-sm md:text-base font-bold text-nexus-text-title truncate">{activeVideo.title}</h2>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-nexus-bg border border-nexus-border rounded-lg">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }}></span>
                <span className="text-[10px] font-bold text-nexus-text-sec uppercase tracking-widest">Modo Estudo</span>
              </div>
            </div>
          </header>

          {/* Área do Player */}
          <div className="bg-black relative aspect-video w-full flex items-center justify-center group">
            <div className="absolute inset-0 bg-nexus-bg/20 animate-pulse pointer-events-none"></div>
            
            <iframe 
              ref={videoRef}
              src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&color=white`} 
              className="w-full h-full border-none z-10" 
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title={activeVideo.title}
            ></iframe>
            
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          {/* Área de Informações abaixo do Vídeo */}
          <div className="p-6 md:p-10 max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-nexus-text-title tracking-tight mb-2">{activeVideo.title}</h1>
                <div className="flex items-center gap-4 text-sm font-medium text-nexus-text-sec">
                  <span className="flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> {(activeVideo as any).duration || '12 min'}</span>
                  <span className="w-1 h-1 rounded-full bg-nexus-border"></span>
                  <span style={{ color: accentColor }}>{selectedPlatform} Academy</span>
                </div>
              </div>

              <button 
                onClick={() => markAsWatched(activeVideo.id)}
                className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                  isCompleted 
                    ? 'bg-nexus-green/10 text-nexus-green border border-nexus-green/20' 
                    : 'bg-white text-black hover:bg-neutral-200'
                }`}
              >
                {isCompleted ? (
                  <><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Aula Concluída</>
                ) : (
                  'Marcar como concluída'
                )}
              </button>
            </div>

            <div className="bg-nexus-surface border border-nexus-border rounded-3xl p-8">
               <h3 className="text-sm font-bold text-nexus-text-title uppercase tracking-widest mb-4">Sobre esta aula</h3>
               <p className="text-nexus-text-main leading-relaxed font-light mb-6">
                 Conteúdo técnico aprofundado sobre <span className="font-bold">{activeVideo.title}</span>. Explore os conceitos fundamentais para o domínio clínico do tema. Este material faz parte do currículo avançado NexusBQ.
               </p>
               <div className="flex gap-4">
                  <button className="flex items-center gap-2 text-[10px] font-bold text-nexus-text-sec hover:opacity-80 uppercase tracking-widest transition-colors" style={{ color: accentColor }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Baixar Material Auxiliar
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: SIDEBAR DE NAVEGAÇÃO (30%) */}
        <div className="w-full md:w-[380px] bg-nexus-surface border-l border-nexus-border flex flex-col shrink-0">
          <div className="p-6 border-b border-nexus-border bg-nexus-surface/50 backdrop-blur-sm sticky top-0 z-20">
            <h3 className="text-xs font-black text-nexus-text-title uppercase tracking-widest mb-1">Conteúdo do Módulo</h3>
            <p className="text-[10px] font-bold text-nexus-text-sec uppercase tracking-widest">{filteredLessons.length} aulas • 14h 20min de conteúdo</p>
            
            {/* Barra de Progresso do Curso */}
            <div className="mt-4">
              <div className="flex justify-between items-center text-[9px] font-bold text-nexus-text-label uppercase tracking-widest mb-1.5">
                <span>Seu Progresso</span>
                <span>{filteredLessons.length > 0 ? Math.round((watchedVideos.length / filteredLessons.length) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 w-full bg-nexus-bg rounded-full overflow-hidden border border-nexus-border/50">
                <div 
                  className="h-full transition-all duration-1000" 
                  style={{ width: `${filteredLessons.length > 0 ? (watchedVideos.length / filteredLessons.length) * 100 : 0}%`, backgroundColor: accentColor }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto no-scrollbar">
            <div className="p-2 space-y-1">
              {Object.keys(groupedLessons).map((blockName) => (
                <div key={blockName} className="mb-4">
                   <div className="px-4 py-2 flex items-center gap-2">
                     <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em]">{blockName}</span>
                     <div className="h-px flex-grow bg-nexus-border"></div>
                   </div>
                   {groupedLessons[blockName].map((lesson: any, idx: number) => {
                     const isActive = activeVideo.id === lesson.id;
                     const isWatched = watchedVideos.includes(lesson.id);
                     
                     return (
                       <button
                         key={lesson.id}
                         onClick={() => handleLessonSelect(lesson)}
                         className={`w-full text-left p-4 rounded-2xl flex items-start gap-4 transition-all group ${
                           isActive 
                             ? 'bg-nexus-surface/50 border border-nexus-border' 
                             : 'hover:bg-nexus-hover border border-transparent'
                         }`}
                       >
                         <div className="shrink-0 mt-0.5">
                           {isWatched ? (
                             <div className="w-5 h-5 rounded-full bg-nexus-green text-black flex items-center justify-center">
                               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                             </div>
                           ) : (
                             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                               isActive ? 'text-white' : 'border-nexus-border text-nexus-text-label'
                             }`} style={isActive ? { borderColor: accentColor, backgroundColor: accentColor } : {}}>
                               {idx + 1}
                             </div>
                           )}
                         </div>
                         
                         <div className="min-w-0 flex-grow">
                           <p className={`text-xs font-bold leading-snug mb-1 ${
                             isActive ? 'text-nexus-text-title' : 'text-nexus-text-main group-hover:text-nexus-text-title'
                           }`} style={isActive ? { color: accentColor } : {}}>
                             {lesson.title}
                             {lesson.isBonus && (
                               <span className="ml-2 bg-nexus-blue/20 text-nexus-blue text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest border border-nexus-blue/20">BÔNUS</span>
                             )}
                           </p>
                           <div className="flex items-center gap-2 text-[9px] font-bold text-nexus-text-label uppercase tracking-widest">
                             <span>Videoaula</span>
                             <span className="w-1 h-1 rounded-full bg-nexus-border"></span>
                             <span>{lesson.duration || '15:00'}</span>
                           </div>
                         </div>

                         {isActive && (
                           <div className="w-1.5 h-1.5 rounded-full animate-pulse mt-2" style={{ backgroundColor: accentColor }}></div>
                         )}
                       </button>
                     );
                   })}
                </div>
              ))}
              {filteredLessons.length === 0 && (
                <div className="p-10 text-center text-nexus-text-label text-[10px] font-bold uppercase tracking-widest">
                  Nenhuma aula disponível neste módulo.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 px-4">
        <button 
          onClick={() => setSelectedCourse(null)} 
          className="mb-6 flex items-center gap-2 text-neutral-500 dark:text-nexus-text-sec hover:text-neutral-900 dark:hover:text-nexus-text-main transition-colors group text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
          Voltar para Catálogo
        </button>

        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-200 dark:border-nexus-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: accentColor }}>{selectedPlatform}</span>
              <span className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
              <span className="text-[10px] font-semibold text-neutral-500 dark:text-nexus-text-sec tracking-wider uppercase">{selectedCourse}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-nexus-text-title tracking-tight">{selectedCourse}</h2>
          </div>
          <div className="relative w-full md:w-72 shrink-0">
            <input 
              type="text" 
              placeholder="Buscar aula..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-nexus-surface border border-neutral-200 dark:border-nexus-border rounded-xl py-2.5 px-4 pl-10 text-sm text-neutral-900 dark:text-nexus-text-main outline-none focus:border-sky-500 dark:focus:border-nexus-blue transition-colors shadow-sm"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-nexus-text-label"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filteredLessons.map((lesson, idx) => {
            const isWatched = watchedVideos.includes(lesson.id);
            return (
              <div 
                key={lesson.id} 
                onClick={() => handleLessonSelect(lesson)}
                className={`bg-white dark:bg-nexus-card border ${isWatched ? 'border-emerald-500/50 dark:border-nexus-green/40' : 'border-neutral-200 dark:border-nexus-border hover:border-neutral-300 dark:hover:border-nexus-hover'} p-5 rounded-xl transition-all duration-200 group hover:shadow-sm cursor-pointer flex flex-col justify-between h-40`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-semibold text-neutral-500 dark:text-nexus-text-sec tracking-wide bg-neutral-50 dark:bg-nexus-surface px-2 py-1 rounded-md border border-neutral-100 dark:border-nexus-border/50">Aula {idx + 1}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isWatched ? 'bg-emerald-50 text-emerald-600 dark:bg-nexus-green/10 dark:text-nexus-green' : 'bg-transparent text-neutral-300 dark:text-nexus-text-label'}`}>
                    {isWatched && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-nexus-text-title mb-2 tracking-tight leading-snug line-clamp-2 hover:opacity-80 transition-opacity" style={{ color: accentColor }}>{lesson.title}</h3>
                  <div className="flex items-center text-[11px] font-medium text-neutral-400 dark:text-nexus-text-sec hover:opacity-100 transition-opacity">
                    Assistir Agora <span className="transform group-hover:translate-x-1 transition-transform ml-1">→</span>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredLessons.length === 0 && (
              <div className="col-span-full py-16 text-center text-sm font-medium text-neutral-500 dark:text-nexus-text-sec">
                Estamos integrando as aulas para o curso de <span className="font-medium text-neutral-700 dark:text-nexus-text-main">{selectedCourse}</span>.
              </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedPlatform) {
    return (
      <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500 px-4">
        <button 
          onClick={() => setSelectedPlatform(null)} 
          className="mb-6 flex items-center gap-2 text-neutral-500 dark:text-nexus-text-sec hover:text-neutral-900 dark:hover:text-white transition-colors group text-sm font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
          Voltar para Catálogo Premium
        </button>

        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200 dark:border-nexus-border pb-6">
          <div>
            <span className="text-[10px] font-semibold tracking-wider uppercase mb-1 block" style={{ color: accentColor }}>Explorar Plataforma</span>
            <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-nexus-text-title tracking-tight">{selectedPlatform}</h2>
          </div>
          <div className="relative w-full md:w-72 shrink-0">
            <input 
              type="text" 
              placeholder="Buscar curso..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-nexus-surface border border-neutral-200 dark:border-nexus-border rounded-xl py-2.5 px-4 pl-10 text-sm text-neutral-900 dark:text-nexus-text-main outline-none focus:border-sky-500 dark:focus:border-nexus-blue transition-colors shadow-sm"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-nexus-text-label"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {filteredCourses.map((course, idx) => {
            const cat = getCourseCategory(course);
            return (
              <div 
                key={idx} 
                onClick={() => setSelectedCourse(course)}
                className="bg-white dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border border-l-2 p-5 rounded-xl cursor-pointer hover:shadow-md hover:border-neutral-300 dark:hover:border-nexus-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-36 group"
                style={{ borderLeftColor: cat.color }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-semibold tracking-wide uppercase" style={{ color: cat.color }}>{cat.label}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-nexus-text-title tracking-tight leading-snug group-hover:opacity-80 transition-opacity line-clamp-2">{course}</h3>
                  <span className="text-[10px] font-medium text-neutral-400 dark:text-nexus-text-sec mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Ver Acervo <span className="transform group-hover:translate-x-1 transition-transform">→</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-700 pb-20">
      
      <header className="px-4 mb-10 md:mb-14">
        <h2 className="text-3xl md:text-5xl font-semibold text-neutral-900 dark:text-nexus-text-title tracking-tighter mb-4 italic">Acervo Premium</h2>
        <p className="text-neutral-500 dark:text-nexus-text-sec text-sm md:text-base font-medium max-w-2xl leading-relaxed">
          Sua biblioteca médica digital integrada. Curadoria exclusiva das melhores plataformas acadêmicas em um ambiente de estudo imersivo.
        </p>
      </header>

      <div className="space-y-12 md:space-y-16">
        
        {/* 1. Continuar Assistindo - NO TOPO */}
        {premiumHistory.length > 0 && (
          <section className="animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="px-4 mb-5 flex items-center gap-3">
              <h3 className="text-base md:text-lg font-semibold text-neutral-900 dark:text-nexus-text-title tracking-tight">Continuar assistindo</h3>
              <div className="h-1.5 w-1.5 rounded-full bg-nexus-blue animate-pulse"></div>
            </div>
            
            <div className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar px-4 pb-6">
              {premiumHistory.map((act) => (
                <div 
                  key={act.id} 
                  onClick={() => handleResumeActivity(act)}
                  className="group flex-none w-[220px] md:w-[280px] bg-white dark:bg-nexus-card border border-neutral-200 dark:border-nexus-border rounded-xl p-3.5 md:p-4 cursor-pointer hover:border-nexus-blue/50 hover:scale-[1.02] transition-all duration-200 shadow-sm"
                >
                  <div className="aspect-video w-full rounded-lg bg-neutral-100 dark:bg-nexus-surface border border-neutral-200/50 dark:border-nexus-border mb-3.5 relative overflow-hidden flex items-center justify-center text-sky-600/40 dark:text-nexus-blue/20">
                     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                     <div className="absolute bottom-0 left-0 w-full h-1 bg-neutral-800">
                        <div className="h-full bg-nexus-blue w-[65%]"></div>
                     </div>
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs md:text-sm font-semibold text-neutral-900 dark:text-nexus-text-title truncate group-hover:text-nexus-blue transition-colors">{act.title}</h5>
                    <span className="text-[10px] text-neutral-500 dark:text-nexus-text-sec font-medium truncate block mt-0.5">{act.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. Categorias das Plataformas */}
        {categories.map((cat) => (
          <section key={cat.id} className="animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="px-4 mb-5 flex items-center justify-between">
              <h3 className="text-base md:text-lg font-semibold text-neutral-900 dark:text-nexus-text-title tracking-tight">{cat.title}</h3>
              <span className="text-[10px] font-bold text-nexus-blue uppercase tracking-widest cursor-pointer hover:underline">Ver tudo</span>
            </div>
            
            <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar px-4 pb-4">
              {cat.items.map((platform) => {
                const isMedCof = platform.id === 'medcof';
                const platformAccent = isMedCof ? MEDCOF_COLOR : (platform.id === 'devoltavest' ? VEST_COLOR : (platform.id === 'medcurso' ? MEDCURSO_COLOR : BRAND_COLOR));
                
                return (
                  <div 
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`group relative flex-none w-[260px] md:w-[320px] aspect-video rounded-2xl bg-nexus-card border border-neutral-200/50 dark:border-nexus-border/50 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:z-10 ${isMedCof ? 'hover:border-red-900/40' : ''}`}
                  >
                    <img 
                      src={platform.image} 
                      alt={platform.title} 
                      className="w-full h-full object-cover opacity-80 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    
                    {/* Overlay Sutil - Vermelho discreto para MedCof */}
                    <div className={`absolute inset-0 flex flex-col justify-end p-5 md:p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ${isMedCof ? 'bg-gradient-to-t from-red-950/90 via-black/30 to-transparent' : 'bg-gradient-to-t from-black/90 via-black/30 to-transparent'}`}>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: platformAccent }}>Acesse Agora</span>
                      <h4 className="text-lg md:text-xl font-bold text-white tracking-tight">{platform.title}</h4>
                      <p className="text-[10px] md:text-xs text-neutral-300 font-medium line-clamp-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        {platform.description}
                      </p>
                      
                      {/* Badge de Parceiro */}
                      <div className="absolute top-4 left-4">
                         <span className="bg-white/10 backdrop-blur-md border text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm" style={{ borderColor: `${platformAccent}30`, color: platformAccent }}>
                           Parceiro Premium
                         </span>
                      </div>

                      {/* Detalhe de borda ativa para MedCof */}
                      {isMedCof && (
                        <div className="absolute bottom-0 left-0 w-1 h-0 group-hover:h-full transition-all duration-500" style={{ backgroundColor: MEDCOF_COLOR }}></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

      </div>

      <footer className="mt-20 px-4 pt-10 border-t border-neutral-100 dark:border-nexus-border flex flex-col items-center text-center">
         <p className="text-neutral-400 dark:text-nexus-text-label text-xs font-medium max-w-lg leading-relaxed">
            Todas as plataformas integradas são protegidas por parcerias educacionais NexusBQ. Novos conteúdos e aulas são sincronizados diariamente para assinantes Premium.
         </p>
      </footer>

    </div>
  );
};

export default PremiumView;
