import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function VirtualTree() {
  const { user } = useAuth();
  const [particles, setParticles] = useState([]);
  
  const level = user?.level || 1;
  const xp = user?.xp || 0;
  
  // Every 100 XP is a level. XP progress towards next level:
  const xpProgress = xp % 100;
  const progressPercent = Math.max(5, xpProgress); 

  // Tree scaling maxes out at level 10
  const scale = Math.min(0.6 + (level * 0.15) + (xpProgress / 400), 1.6);
  
  const isSprout = level === 1;
  const isSmallTree = level === 2;
  const isFullTree = level >= 3;
  const isMagicTree = level >= 5;
  const isGoldenTree = level >= 10;

  // Generate floating energy particles
  useEffect(() => {
    const p = Array.from({ length: Math.min(level * 3, 20) }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${2 + Math.random() * 3}s`,
      animationDelay: `${Math.random() * 2}s`,
      size: `${4 + Math.random() * 6}px`,
    }));
    setParticles(p);
  }, [level]);

  return (
    <div className="glass-card p-8 rounded-[2rem] border border-white/40 shadow-[0_8px_32px_rgba(34,197,94,0.15)] relative overflow-hidden flex flex-col items-center justify-center min-h-[360px] group">
      
      {/* Dynamic Magical Background Glow */}
      <div className={`absolute inset-0 bg-gradient-to-b ${isGoldenTree ? 'from-amber-200/40 to-transparent' : isMagicTree ? 'from-emerald-300/30 to-transparent' : 'from-green-100/30 to-transparent'} pointer-events-none transition-colors duration-1000`}></div>
      
      {/* Animated Glowing Orb behind tree */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[60px] opacity-40 transition-all duration-[2000ms] ${isGoldenTree ? 'bg-amber-400' : isMagicTree ? 'bg-emerald-400' : 'bg-green-300'} ${isFullTree ? 'animate-pulse' : ''}`}></div>

      <div className="relative z-30 flex flex-col items-center w-full">
        <div className="flex items-center gap-2 mb-1 drop-shadow-sm">
          <span className="material-symbols-outlined text-primary text-[28px]">eco</span>
          <h2 className="text-2xl font-display font-bold text-on-surface">Tree of Focus</h2>
        </div>
        <p className="text-sm font-medium text-on-surface-variant mb-4 text-center max-w-[200px] drop-shadow-sm bg-white/30 px-3 py-1 rounded-full backdrop-blur-sm">
          {isGoldenTree ? "A legendary golden tree!" : isMagicTree ? "Bursting with magical energy!" : isFullTree ? "Growing stronger every day!" : "A tiny sprout of potential."}
        </p>

        {/* The Tree Container */}
        <div className="relative w-56 h-64 flex items-end justify-center mb-10 mt-6">
          
          {/* Floating Energy Particles */}
          {particles.map(p => (
            <div 
              key={p.id}
              className={`absolute bottom-0 rounded-full ${isGoldenTree ? 'bg-amber-300' : 'bg-emerald-400'} animate-fade-in-up`}
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                animationDuration: p.animationDuration,
                animationDelay: p.animationDelay,
                animationIterationCount: 'infinite',
                opacity: 0.6,
              }}
            />
          ))}

          {/* Dirt / Magical Base */}
          <div className="absolute bottom-4 w-40 h-6 bg-black/10 rounded-[100%] blur-[4px]"></div>
          
          {/* Animated Tree Object */}
          <div 
            className="relative transform-gpu transition-transform duration-[1500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom z-10"
            style={{ transform: `scale(${scale}) translateY(-10px)` }}
          >
            <svg width="140" height="180" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl overflow-visible">
              {/* Trunk */}
              <path 
                d="M50 150 C 50 110, 55 90, 60 60 C 65 90, 70 110, 70 150 Z" 
                fill={isGoldenTree ? "#B45309" : "#78350F"} 
                className="transition-colors duration-1000"
              />
              
              {/* Branches (appear level 2+) */}
              {level >= 2 && (
                <g stroke={isGoldenTree ? "#B45309" : "#78350F"} strokeWidth="5" strokeLinecap="round" className="transition-colors duration-1000">
                  <path d="M60 100 Q 35 80 25 55" />
                  <path d="M60 85 Q 85 65 95 45" />
                  {level >= 4 && <path d="M60 70 Q 45 40 40 20" strokeWidth="4" />}
                </g>
              )}

              {/* Sprout Leaves (Level 1) */}
              {isSprout && (
                <g className="animate-[wiggle_3s_ease-in-out_infinite] origin-bottom">
                  <path d="M60 65 Q 35 40 60 20 Q 85 40 60 65" fill="#4ADE80" />
                </g>
              )}

              {/* Small Tree Canopy (Level 2) */}
              {isSmallTree && (
                <g className="animate-[wiggle_4s_ease-in-out_infinite] origin-bottom">
                  <circle cx="60" cy="35" r="35" fill="url(#leaf-grad-1)" />
                  <circle cx="30" cy="55" r="25" fill="url(#leaf-grad-2)" />
                  <circle cx="90" cy="45" r="28" fill="url(#leaf-grad-3)" />
                </g>
              )}

              {/* Full Tree Canopy (Level 3+) */}
              {isFullTree && (
                <g className="animate-[wiggle_5s_ease-in-out_infinite] origin-bottom">
                  <circle cx="60" cy="25" r="45" fill="url(#leaf-grad-1)" className="transition-colors duration-1000" />
                  <circle cx="20" cy="60" r="35" fill="url(#leaf-grad-2)" className="transition-colors duration-1000" />
                  <circle cx="100" cy="50" r="40" fill="url(#leaf-grad-3)" className="transition-colors duration-1000" />
                  <circle cx="45" cy="15" r="30" fill="url(#leaf-grad-2)" className="transition-colors duration-1000" />
                  <circle cx="75" cy="20" r="30" fill="url(#leaf-grad-3)" className="transition-colors duration-1000" />
                  <circle cx="60" cy="65" r="35" fill="url(#leaf-grad-1)" className="transition-colors duration-1000" />
                  
                  {/* Magic Apples / Fruits (Level 5+) */}
                  {isMagicTree && (
                    <g>
                      <circle cx="50" cy="10" r="8" fill={isGoldenTree ? "#FDE047" : "#F43F5E"} className="animate-bounce drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" style={{animationDelay: '0s', animationDuration: '2s'}} />
                      <circle cx="20" cy="45" r="7" fill={isGoldenTree ? "#FDE047" : "#F43F5E"} className="animate-bounce drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" style={{animationDelay: '0.4s', animationDuration: '2.5s'}} />
                      <circle cx="90" cy="35" r="9" fill={isGoldenTree ? "#FDE047" : "#F43F5E"} className="animate-bounce drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" style={{animationDelay: '0.8s', animationDuration: '2.2s'}} />
                      <circle cx="70" cy="65" r="6" fill={isGoldenTree ? "#FDE047" : "#F43F5E"} className="animate-bounce drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" style={{animationDelay: '1.2s', animationDuration: '2.8s'}} />
                    </g>
                  )}
                </g>
              )}

              {/* Gradients */}
              <defs>
                <radialGradient id="leaf-grad-1" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor={isGoldenTree ? "#FEF08A" : "#86EFAC"} />
                  <stop offset="100%" stopColor={isGoldenTree ? "#EAB308" : "#16A34A"} />
                </radialGradient>
                <radialGradient id="leaf-grad-2" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor={isGoldenTree ? "#FDE047" : "#4ADE80"} />
                  <stop offset="100%" stopColor={isGoldenTree ? "#CA8A04" : "#15803D"} />
                </radialGradient>
                <radialGradient id="leaf-grad-3" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor={isGoldenTree ? "#FEF9C3" : "#22C55E"} />
                  <stop offset="100%" stopColor={isGoldenTree ? "#A16207" : "#14532D"} />
                </radialGradient>
              </defs>
            </svg>
          </div>
          
          {/* Next-Level Gaming Crest & Circular Progress Ring */}
          <div className="absolute -bottom-6 -right-6 z-20 flex flex-col items-center">
            <div className="relative flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              
              {/* Circular Progress Ring */}
              <svg className="absolute w-[88px] h-[88px] -rotate-90 drop-shadow-[0_0_12px_rgba(79,70,229,0.6)]" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="8" fill="none" className="text-white/30" />
                {/* Animated XP Fill */}
                <circle 
                  cx="50" cy="50" r="44" 
                  stroke="currentColor" strokeWidth="8" fill="none" 
                  strokeDasharray="276" strokeDashoffset={276 - (276 * progressPercent) / 100} 
                  strokeLinecap="round"
                  className="text-primary transition-all duration-[2000ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
                />
              </svg>
              
              {/* Hexagon Core / Level Badge */}
              <div className="w-16 h-16 bg-gradient-to-br from-primary-light via-primary to-primary-dark rounded-[18px] rotate-45 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] border-4 border-white relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] -translate-x-full w-[150%]"></div>
                 <span className="-rotate-45 text-white font-black text-3xl drop-shadow-md tracking-tighter">{level}</span>
              </div>
              
              {/* Glowing Aura behind crest */}
              <div className="absolute inset-0 bg-primary/20 blur-[15px] rounded-full -z-10"></div>
            </div>
          </div>
        </div>

        {/* Next-Level Text Status */}
        <div className="w-full mt-6 flex flex-col items-center relative z-10 bg-white/40 backdrop-blur-md py-2 px-6 rounded-full border border-white/60 shadow-sm">
          <p className="text-sm font-black text-on-surface-variant flex items-center gap-2">
            <span className="text-primary tracking-widest uppercase text-xs">Rank {level}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
            <span>{xpProgress} / 100 XP</span>
          </p>
          <p className="text-[10px] text-on-surface-variant/80 font-bold uppercase tracking-widest mt-0.5">
            {100 - xpProgress} XP to Rank {level + 1}
          </p>
        </div>

      </div>
    </div>
  );
}
