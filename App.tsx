
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Activity,
  Command,
  Heart,
  Zap,
  Clock,
  AlertCircle,
  ShieldAlert,
  TrendingUp,
  ChevronDown,
  Loader2,
  Radio,
  MoreHorizontal,
  LayoutGrid,
  Scale,
  BookOpen,
  Map as MapIcon,
  Filter,
  ArrowUpRight,
  Fingerprint
} from 'lucide-react';

import MeshBackground from './components/MeshBackground';
import SearchOverlay from './components/SearchOverlay';
import WardDetail from './components/WardDetail';
import RankingsView from './components/RankingsView';
import AnalyticsView from './components/AnalyticsView';
import HealthImpactView from './components/HealthImpactView';
import MethodologyView from './components/MethodologyView';
import AtmosScan from './components/AtmosScan';
import GovSections from './components/GovSections';
import CitizenAction from './components/CitizenAction';
import IndustrialLedger from './components/IndustrialLedger';
import WardMap from './components/WardMap';
import GeminiAssistant from './components/GeminiAssistant';
import CivicPulse from './components/CivicPulse';
import ForecastView from './components/ForecastView';

import { loadDelhiWards } from './data';
import { Ward, DashboardTheme, AppView, RegionSummary, RiskLevel } from './types';

const appleEase = [0.25, 1, 0.5, 1];

const IntelligenceBulletin: React.FC = () => (
  <div className="w-full bg-rose-500/10 border-y border-rose-500/20 py-2.5 overflow-hidden whitespace-nowrap z-[60] backdrop-blur-md alert-ticker-container">
    <motion.div 
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      className="flex items-center gap-16 px-8"
    >
      {[1, 2].map((_, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-rose-500">
            <AlertCircle size={10} /> Validated Hotspot: Illegal Burning in Okhla Node 03 (92% Confidence)
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-amber-500">
            <ShieldAlert size={10} /> GRAP Stage IV Active: Truck entry restrictions in effect
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">
            <Activity size={10} /> Thermal Inversion Probability: 84% for next 06 hours
          </div>
        </React.Fragment>
      ))}
    </motion.div>
  </div>
);

const PredictionWidget: React.FC<{ aqi: number, onNavigate: (v: AppView) => void }> = ({ aqi, onNavigate }) => (
  <motion.div 
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 1.2, duration: 1, ease: appleEase }}
    className="glass p-8 rounded-[40px] border-white/10 w-full md:w-80 text-left space-y-6 shadow-2xl backdrop-blur-3xl hover:bg-white/[0.05] transition-all cursor-default"
  >
    <div className="flex items-center gap-3">
      <Clock size={16} className="text-indigo-400" />
      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Temporal Intelligence</span>
    </div>
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <span className="text-[9px] font-black uppercase opacity-30 tracking-widest">Projection (+24H)</span>
        <span className="text-2xl font-black tabular-nums">{Math.round(aqi * 1.12)}</span>
      </div>
      <p className="text-[11px] opacity-40 leading-relaxed font-medium">
        Predictive clustering indicates thermal inversion layering across the Yamuna corridor.
      </p>
    </div>
    <button 
      onClick={() => onNavigate('forecast')}
      className="w-full py-3 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
    >
      Full Model Vision <ArrowUpRight size={12} />
    </button>
  </motion.div>
);

const ActiveView: React.FC<{ 
  view: AppView; 
  theme: DashboardTheme; 
  wards: Ward[];
  selectedWard: Ward | null;
  cityAverage: number;
  simulationHour: number;
  setSimulationHour: (h: number) => void;
  onSelect: (w: Ward) => void;
  onNavigate: (v: AppView) => void;
  setTheme: (t: DashboardTheme) => void;
}> = ({ view, theme, wards, selectedWard, cityAverage, simulationHour, setSimulationHour, onSelect, onNavigate, setTheme }) => {
  const regions: RegionSummary[] = useMemo(() => {
    const macroRegions = ['North', 'South', 'East', 'West', 'Central'] as const;
    return macroRegions.map(name => {
      const wardsInRegion = wards.filter(w => w.region === name);
      const avg = wardsInRegion.length > 0 
        ? Math.round(wardsInRegion.reduce((a, b) => a + b.aqi, 0) / wardsInRegion.length)
        : 0;
      
      let risk: RiskLevel = 'Low';
      if (avg > 300) risk = 'Extreme';
      else if (avg > 200) risk = 'High';
      else if (avg > 100) risk = 'Medium';

      return {
        name: `${name} Delhi`,
        avgAqi: avg,
        risk: risk,
        cause: wardsInRegion[0]?.primarySource || "Transport",
        nodeCount: wardsInRegion.length
      };
    });
  }, [wards]);

  const getRiskLabel = (aqi: number) => {
    if (aqi > 300) return { label: "Hazardous", color: "text-rose-500", border: "border-rose-500/20", bg: "bg-rose-500/5", desc: "Mandatory N95 protocol for all public personnel." };
    if (aqi > 200) return { label: "Very Poor", color: "text-orange-500", border: "border-orange-500/20", bg: "bg-orange-500/5", desc: "Critical respiratory exposure. Industrial suspensions active." };
    return { label: "Moderate", color: "text-emerald-500", border: "border-emerald-500/20", bg: "bg-emerald-500/5", desc: "Ambient conditions stable. Baseline monitoring active." };
  };

  const risk = getRiskLabel(cityAverage);

  switch (view) {
    case 'rankings': return <RankingsView theme={theme} onSelect={onSelect} wards={wards} />;
    case 'analytics': return <AnalyticsView theme={theme} />;
    case 'health': return <HealthImpactView theme={theme} pm25={Number(selectedWard?.pollutants?.pm25 || 250)} />;
    case 'methodology': return <MethodologyView theme={theme} />;
    case 'scan': return <AtmosScan theme={theme} />;
    case 'zone': return <GovSections theme={theme} />;
    case 'enforcement': return <IndustrialLedger theme={theme} />;
    case 'forecast': return <ForecastView currentAqi={cityAverage} theme={theme} />;
    case 'pulse': return <CivicPulse theme={theme} wards={wards} onNavigate={onNavigate} setTheme={setTheme} />;
    default:
      return (
        <motion.div 
          key="home-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: appleEase }}
          className="flex flex-col"
        >
          {/* CINEMATIC HERO */}
          <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2, ease: appleEase }}
              className="z-20 space-y-12"
            >
              <div className="space-y-4">
                <motion.h4 
                  initial={{ opacity: 0, tracking: '1em' }}
                  animate={{ opacity: 0.4, tracking: '0.6em' }}
                  transition={{ duration: 2, ease: appleEase }}
                  className="text-[10px] font-black uppercase"
                >
                  NCT Spatial Intelligence Unit
                </motion.h4>
                <h1 className="hero-headline premium-text text-white">
                  Pure Intelligence.<br/>
                  <span className="opacity-20">for the nct breath.</span>
                </h1>
              </div>
              
              <div className="relative flex flex-col items-center gap-8">
                <div className="relative flex flex-col items-center">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 2, ease: appleEase }}
                    className="text-[180px] md:text-[280px] font-black tracking-tighter leading-none text-cutout tabular-nums block"
                  >
                    {cityAverage}
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="flex flex-col items-center gap-4 -mt-4"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Live AQI – Delhi (CPCB)</span>
                      <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${risk.border} ${risk.bg} ${risk.color}`}>
                        {risk.label}
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 1.5, duration: 1 }}
                  className="text-lg font-medium italic max-w-lg leading-relaxed"
                >
                  {risk.desc}
                </motion.p>
              </div>
            </motion.div>

            {/* Prediction Widget - Anchored */}
            <div className="absolute right-12 bottom-12 z-30 hidden xl:block">
              <PredictionWidget aqi={cityAverage} onNavigate={onNavigate} />
            </div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20"
            >
              <ChevronDown size={24} />
            </motion.div>
          </section>

          {/* SPATIAL CORE SECTION */}
          <section className="py-40 bg-black relative z-20">
            <div className="max-w-7xl mx-auto px-10">
              <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Radio size={16} className="text-emerald-500 animate-pulse" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Active Sensing Layer</h4>
                  </div>
                  <h2 className="text-5xl font-black tracking-tighter uppercase text-white">NCT Intelligence Grid</h2>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => onNavigate('rankings')} className="px-8 py-3 rounded-full glass border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Registry Layer</button>
                  <button onClick={() => onNavigate('scan')} className="px-8 py-3 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">Initiate AtmosScan</button>
                </div>
              </div>
              <WardMap wards={wards} simulationHour={simulationHour} onSelect={onSelect} theme={theme} onNavigate={onNavigate} />
            </div>

            {/* REGIONAL INTELLIGENCE CARDS */}
            <div className="max-w-7xl mx-auto px-10 mt-40">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {regions.map((region, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.8, ease: appleEase }}
                    className="glass p-10 rounded-[48px] border-white/5 flex flex-col items-center text-center group hover:bg-white/5 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity">
                      <Fingerprint size={80} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-20 mb-8 group-hover:opacity-40">{region.name}</span>
                    <div className="text-5xl font-black tabular-nums mb-3 tracking-tighter text-white">{region.avgAqi}</div>
                    <div className="flex flex-col gap-1 items-center">
                       <span className={`text-[9px] font-black uppercase tracking-widest ${
                         region.risk === 'Extreme' || region.risk === 'High' ? 'text-rose-500' : region.risk === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                       }`}>{region.risk} Risk</span>
                       <span className="text-[7px] font-bold opacity-20 uppercase tracking-tighter">Live Sector Nodes: {region.nodeCount}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-10 mt-40">
               <CitizenAction theme={theme} />
            </div>
          </section>
        </motion.div>
      );
  }
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<DashboardTheme>('dark');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isInitializing, setIsInitializing] = useState(true);
  const [simulationHour, setSimulationHour] = useState(0);
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    const init = async () => {
      const data = await loadDelhiWards();
      setWards(data);
      setIsInitializing(false);
    };
    init();
  }, []);

  const cityAverage = useMemo(() => {
    if (!wards || wards.length === 0) return 338; // Defaulting to recent Delhi live value
    const total = wards.reduce((acc, w) => acc + (Number(w.aqi) || 0), 0);
    return Math.round(total / wards.length);
  }, [wards]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-10">
         <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="relative">
           <ShieldCheck className="text-white opacity-20" size={64} />
           <div className="absolute -inset-6 border-t border-emerald-500/40 rounded-full" />
         </motion.div>
         <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20 ml-2 text-center">PureAir Intelligence Node<br/>Establishing Link</span>
         </div>
      </div>
    );
  }

  const isPulseView = currentView === 'pulse';

  const secondaryNav = [
    { id: 'forecast', label: 'Predictions', icon: Clock },
    { id: 'zone', label: 'Protocols', icon: ShieldCheck },
    { id: 'health', label: 'Biometric Risk', icon: Heart },
    { id: 'methodology', label: 'Methodology', icon: BookOpen },
    { id: 'analytics', label: 'Deep Analytics', icon: LayoutGrid },
  ];

  return (
    <div className={`relative min-h-screen overflow-x-hidden flex flex-col text-white bg-black`}>
      <MeshBackground theme={theme} aqi={cityAverage} />
      
      {!isPulseView && (
        <header className="fixed top-0 w-full z-50 flex flex-col">
          <div className="px-10 py-5 flex items-center justify-between backdrop-blur-3xl bg-black/20 border-b border-white/5">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setCurrentView('home')}>
              <div className="w-10 h-10 rounded-xl glass flex items-center justify-center border-white/10">
                <ShieldCheck size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight uppercase leading-none">PureAir</h1>
                <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest animate-pulse">Intelligence Unit</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <nav className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] opacity-40">
                <button onClick={() => setCurrentView('home')} className={`flex items-center gap-2 transition-all ${currentView === 'home' ? 'opacity-100 text-white' : 'hover:opacity-100'}`}>
                  System
                </button>
                <button onClick={() => setCurrentView('rankings')} className={`flex items-center gap-2 transition-all ${currentView === 'rankings' ? 'opacity-100 text-white' : 'hover:opacity-100'}`}>
                  Registry
                </button>
                <button onClick={() => setCurrentView('pulse')} className={`flex items-center gap-2 transition-all ${currentView === 'pulse' ? 'opacity-100' : 'hover:opacity-100'}`}>
                  Pulse
                </button>
                <button onClick={() => setCurrentView('enforcement')} className={`flex items-center gap-2 transition-all ${currentView === 'enforcement' ? 'opacity-100 text-rose-500' : 'hover:opacity-100'}`}>
                  Enforcement
                </button>
              </nav>
              
              <div className="h-4 w-[1px] bg-white/10 mx-2" />

              <div className="relative">
                <button 
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`p-2.5 rounded-full glass border-white/10 hover:bg-white/5 transition-all ${menuOpen ? 'bg-white/10 text-emerald-400' : ''}`}
                >
                  <MoreHorizontal size={18} />
                </button>
                
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-60 glass rounded-[32px] p-4 border-white/10 shadow-2xl z-[100] backdrop-blur-3xl bg-black/60"
                    >
                      <div className="px-4 py-2 mb-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-20">Intelligence Nodes</span>
                      </div>
                      {secondaryNav.map((item) => (
                        <button 
                          key={item.id}
                          onClick={() => { setCurrentView(item.id as AppView); setMenuOpen(false); }}
                          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 text-[11px] font-black uppercase tracking-widest transition-all"
                        >
                          <item.icon size={16} className="opacity-40" />
                          {item.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-full glass border-white/10 hover:bg-white/5 transition-all"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
          <IntelligenceBulletin />
        </header>
      )}

      <main className={`flex-1 overflow-y-auto ${isPulseView ? 'pt-0' : 'pt-32'} no-scrollbar relative z-10`}>
        <AnimatePresence mode="wait">
          <ActiveView 
            view={currentView} 
            theme={theme} 
            wards={wards}
            selectedWard={selectedWard} 
            cityAverage={cityAverage}
            simulationHour={simulationHour}
            setSimulationHour={setSimulationHour}
            onSelect={setSelectedWard}
            onNavigate={setCurrentView}
            setTheme={setTheme}
          />
        </AnimatePresence>
      </main>

      <GeminiAssistant currentAqi={cityAverage} theme={theme} />

      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay 
            onClose={() => setSearchOpen(false)} 
            wards={wards}
            onSelect={(w) => {
              setSelectedWard(w);
              setSearchOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedWard && (
          <WardDetail 
            ward={selectedWard} 
            theme={theme} 
            wardsInRegion={wards.filter(w => w.region === selectedWard.region)}
            onClose={() => setSelectedWard(null)} 
          />
        )}
      </AnimatePresence>

      {!isPulseView && (
        <footer className="w-full px-10 py-12 flex flex-col md:flex-row items-center justify-between opacity-20 gap-4 mt-auto">
          <span className="text-[9px] font-black uppercase tracking-widest">© 2025 PureAir NCT Unit • Spatial Intelligence v5.0</span>
          <span className="text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2">
            <Filter size={10} /> Validated Atmospheric Registry
          </span>
        </footer>
      )}
    </div>
  );
};

export default App;
