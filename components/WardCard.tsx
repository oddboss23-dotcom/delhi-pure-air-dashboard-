
import React from 'react';
import { motion } from 'framer-motion';
import { Ward, AQILevel, DashboardTheme } from '../types';
import { Activity, ArrowUpRight } from 'lucide-react';
import TrendSparkline from './TrendSparkline';

interface WardCardProps {
  ward: Ward;
  onClick: (ward: Ward) => void;
  index: number;
  theme: DashboardTheme;
}

const appleBezier = [0.25, 1, 0.5, 1];

const WardCard: React.FC<WardCardProps> = ({ ward, onClick, index, theme }) => {
  const getStatusColor = (status: AQILevel) => {
    switch (status) {
      case AQILevel.HAZARDOUS: return '#af0000';
      case AQILevel.SEVERE: return '#ff3b30';
      case AQILevel.POOR: return '#ff9500';
      case AQILevel.MODERATE: return '#ffcc00';
      case AQILevel.GOOD: return '#34c759';
      default: return '#8e8e93';
    }
  };

  const statusColor = getStatusColor(ward.status);
  const isDark = theme === 'dark';

  return (
    <motion.div
      layoutId={`ward-${ward.id}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.7, 
        delay: index * 0.04, 
        ease: appleBezier 
      }}
      whileHover={{ 
        y: -12, 
        scale: 1.01,
        boxShadow: isDark ? "0 60px 120px -30px rgba(0,0,0,0.6)" : "0 30px 60px rgba(0,0,0,0.05)",
        transition: { duration: 0.4, ease: appleBezier } 
      }}
      onClick={() => onClick(ward)}
      className="glass-card group relative p-14 rounded-[64px] cursor-pointer flex flex-col justify-between h-[540px] overflow-hidden"
    >
      <div className="absolute top-14 right-14 opacity-0 group-hover:opacity-40 transition-all duration-600">
        <ArrowUpRight size={26} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-5 mb-12 opacity-30 group-hover:opacity-100 transition-opacity">
          <span className="font-humanist text-[10px] italic">Sector Registry Node</span>
          <div className={`h-[1px] flex-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
        </div>
        
        {/* L SCALE: Ward Card Title */}
        <motion.h3 
          layoutId={`ward-title-${ward.id}`}
          className={`text-4xl font-black tracking-tight mb-5 leading-none transition-colors ${isDark ? 'text-white/90 group-hover:text-white' : 'text-black/90 group-hover:text-black'}`}
        >
          {ward.name}
        </motion.h3>
        
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 group-hover:opacity-80 transition-opacity" style={{ color: statusColor }}>
            {ward.status} Status
          </span>
        </div>
      </div>

      <div className="relative z-10 my-12 opacity-30 group-hover:opacity-100 transition-all duration-1000">
        <TrendSparkline color={statusColor} />
      </div>

      <div className={`relative z-10 flex items-end justify-between pt-12 border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}>
        <div className="flex flex-col">
          {/* Numeric Scale Reduced for Card Context */}
          <motion.div 
            layoutId={`ward-aqi-${ward.id}`}
            className="text-[80px] font-black tracking-tighter leading-none text-cutout tabular-nums"
          >
            {ward.aqi}
          </motion.div>
          <span className="font-humanist text-[10px] italic opacity-20 mt-5 group-hover:opacity-50 transition-opacity">Metropolitan Intel Hub</span>
        </div>
        
        <div className="text-right flex flex-col items-end gap-4 opacity-30 group-hover:opacity-100 transition-opacity">
          <div className={`flex items-center gap-4 px-5 py-2.5 rounded-full border ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
            <Activity size={12} className="opacity-50" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Operational</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">{ward.primarySource}</p>
        </div>
      </div>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-1200 pointer-events-none overflow-hidden">
        <div 
          className="absolute -inset-40 bg-gradient-to-br from-transparent via-white/30 to-transparent animate-subtle-drift" 
          style={{ filter: 'blur(130px)' }}
        />
      </div>
    </motion.div>
  );
};

export default WardCard;
