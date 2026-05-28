import { useRef, useEffect, useState } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';

interface WorkflowStep {
  num: string;
  phase: string;
  title: string;
  subtitle: string;
  description: string;
  specs: string[];
  icon: React.ReactNode;
  tc: string;
}

const steps: WorkflowStep[] = [
  {
    num: '01',
    phase: 'planejamento',
    title: 'roteiro & ganchos',
    subtitle: 'a estratégia do primeiro segundo',
    description: 'antes de iniciar as gravações, desenhamos a estratégia do conteúdo. estruturamos roteiros dinâmicos focados nos primeiros 3 segundos (hooks de atenção) e organizamos a grade de ideias para tiktok, reels e youtube shorts.',
    specs: ['roteirização', 'estratégia de gancho', 'análise de concorrência', 'decupagem de roteiro'],
    tc: '00:01:14:08',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-[#ff007f]/40 group-hover:text-[#ff007f] transition-colors duration-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    )
  },
  {
    num: '02',
    phase: 'captação',
    title: 'videomaking dinâmico',
    subtitle: 'imagens que geram engajamento',
    description: 'gravamos com equipamentos ágeis e portáteis de alta performance. focamos na captação de iluminação prática, enquadramentos modernos e transições orgânicas em câmera, garantindo que o material bruto seja dinâmico e otimizado para o consumo em tela vertical.',
    specs: ['luz prática', 'transições em câmera', 'framing vertical (mobile)', 'áudio direcional'],
    tc: '00:02:45:18',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-[#ff007f]/40 group-hover:text-[#ff007f] transition-colors duration-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    )
  },
  {
    num: '03',
    phase: 'lapidação',
    title: 'edição & retenção',
    subtitle: 'o ritmo acelerado que magnetiza',
    description: 'na edição de vídeo, construímos a retenção da audiência. aplicamos cortes precisos no ritmo da música, efeitos sonoros (SFX) comerciais, legendas dinâmicas sincronizadas e um color grading vibrante para destacar a marca nas redes sociais.',
    specs: ['cortes de ritmo', 'legendas dinâmicas', 'sound design comercial', 'color grading ativo'],
    tc: '00:04:12:03',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-[#ff007f]/40 group-hover:text-[#ff007f] transition-colors duration-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
      </svg>
    )
  }
];

const initialTimes = [
  { h: 0, m: 1, s: 14, f: 8 },
  { h: 0, m: 2, s: 45, f: 18 },
  { h: 0, m: 4, s: 12, f: 3 }
];

interface TimecodeTickerProps {
  initialTime: { h: number; m: number; s: number; f: number };
}

function TimecodeTicker({ initialTime }: TimecodeTickerProps) {
  const [timecode, setTimecode] = useState(() => {
    const hStr = String(initialTime.h).padStart(2, '0');
    const mStr = String(initialTime.m).padStart(2, '0');
    const sStr = String(initialTime.s).padStart(2, '0');
    const fStr = String(initialTime.f).padStart(2, '0');
    return `${hStr}:${mStr}:${sStr}:${fStr}`;
  });

  useEffect(() => {
    const t = { ...initialTime };
    const interval = setInterval(() => {
      t.f++;
      if (t.f >= 24) {
        t.f = 0;
        t.s++;
        if (t.s >= 60) {
          t.s = 0;
          t.m++;
          if (t.m >= 60) {
            t.m = 0;
            t.h++;
          }
        }
      }
      const hStr = String(t.h).padStart(2, '0');
      const mStr = String(t.m).padStart(2, '0');
      const sStr = String(t.s).padStart(2, '0');
      const fStr = String(t.f).padStart(2, '0');
      setTimecode(`${hStr}:${mStr}:${sStr}:${fStr}`);
    }, 1000 / 24);

    return () => clearInterval(interval);
  }, [initialTime]);

  return <>{timecode}</>;
}

interface WaveformParadeProps {
  activeIndex: number;
  colorHue: number;
  colorSat: number;
  hookIntensity: number;
}

function WaveformParade({ activeIndex, colorHue, colorSat, hookIntensity }: WaveformParadeProps) {
  const [waveformPaths, setWaveforms] = useState({ r: '', g: '', b: '' });
  const activeIndexRef = useRef(activeIndex);
  const colorHueRef = useRef(colorHue);
  const colorSatRef = useRef(colorSat);
  const hookIntensityRef = useRef(hookIntensity);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    colorHueRef.current = colorHue;
  }, [colorHue]);

  useEffect(() => {
    colorSatRef.current = colorSat;
  }, [colorSat]);

  useEffect(() => {
    hookIntensityRef.current = hookIntensity;
  }, [hookIntensity]);

  useEffect(() => {
    let frameId: number;
    let phase = 0;
    const width = 160;
    const height = 45;
    const numPoints = 25;

    const tick = () => {
      phase += 0.08;
      
      const generateParadePath = (offset: number, colorShift: number) => {
        const points = [];
        const currentActiveIndex = activeIndexRef.current;
        const currentHookIntensity = hookIntensityRef.current;
        const currentColorSat = colorSatRef.current;
        
        for (let i = 0; i <= numPoints; i++) {
          const x = (i / numPoints) * width;
          let y = height / 2;
          
          if (currentActiveIndex === 0) {
            const progressRatio = i / numPoints;
            const base = Math.exp(-progressRatio * (5 - currentHookIntensity * 0.02)) * (height * 0.7);
            y = height - 5 - base + Math.sin(i * 0.6 + phase + offset) * 2;
          } else if (currentActiveIndex === 1) {
            y = height / 2 + Math.sin(i * 0.4 + phase * 1.5 + offset) * 8 + Math.cos(i * 0.8 - phase + offset) * 3;
          } else {
            const hueFactor = 1.0 + (colorShift / 360) * 0.4;
            const satFactor = 0.5 + (currentColorSat / 100) * 0.6;
            y = height / 2 + Math.sin(i * 0.8 + phase * 2.2 + offset) * (14 * satFactor * Math.sin((i * Math.PI) / numPoints)) * hueFactor;
          }
          
          y = Math.max(2, Math.min(height - 2, y));
          points.push(`${x},${y}`);
        }
        return `M ${points.join(' L ')}`;
      };

      setWaveforms({
        r: generateParadePath(0, colorHueRef.current),
        g: generateParadePath(2, colorHueRef.current + 120),
        b: generateParadePath(4, colorHueRef.current + 240)
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <svg className="w-full h-full mix-blend-screen opacity-90" viewBox="0 0 160 45" preserveAspectRatio="none">
      <path d={waveformPaths.r} fill="none" stroke="rgba(255,0,127,0.7)" strokeWidth="1.2" />
      <path d={waveformPaths.g} fill="none" stroke="rgba(34,197,94,0.6)" strokeWidth="1.2" />
      <path d={waveformPaths.b} fill="none" stroke="rgba(59,130,246,0.6)" strokeWidth="1.2" />
    </svg>
  );
}

interface VuMeterProps {
  activeIndex: number;
}

function VuMeter({ activeIndex }: VuMeterProps) {
  const [vuLevels, setVuLevels] = useState({ left: 10, right: 12 });
  const activeIndexRef = useRef(activeIndex);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    let frameId: number;
    let phase = 0;

    const tick = () => {
      phase += 0.08;
      let lVal = 5;
      let rVal = 5;
      const currentActiveIndex = activeIndexRef.current;
      
      if (currentActiveIndex === 2) {
        lVal = Math.floor(40 + Math.sin(phase * 2) * 20 + Math.random() * 30);
        rVal = Math.floor(45 + Math.cos(phase * 1.7) * 18 + Math.random() * 30);
      } else if (currentActiveIndex === 1) {
        lVal = Math.floor(15 + Math.sin(phase * 4) * 8);
        rVal = Math.floor(18 + Math.cos(phase * 4.2) * 7);
      } else {
        lVal = Math.floor(8 + Math.sin(phase) * 3);
        rVal = Math.floor(10 + Math.cos(phase * 0.9) * 3);
      }
      
      setVuLevels({ left: lVal, right: rVal });
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="flex gap-0.5 h-11 items-end bg-neutral-900/50 p-1 rounded border border-white/5">
      {/* Left VU */}
      <div className="w-1 h-full bg-neutral-950 flex flex-col justify-end gap-0.5">
        {Array.from({ length: 7 }).map((_, stepIdx) => {
          const level = (7 - stepIdx) * 14;
          const isActive = vuLevels.left >= level;
          let colorClass = 'bg-neutral-800';
          if (isActive) {
            if (level > 70) colorClass = 'bg-[#ff007f] shadow-[0_0_3px_#ff007f]';
            else if (level > 42) colorClass = 'bg-amber-500 shadow-[0_0_3px_rgba(245,158,11,0.5)]';
            else colorClass = 'bg-[#22c55e] shadow-[0_0_3px_rgba(34,197,94,0.5)]';
          }
          return <div key={stepIdx} className={`w-full h-1 rounded-sm ${colorClass}`} />;
        })}
      </div>
      {/* Right VU */}
      <div className="w-1 h-full bg-neutral-950 flex flex-col justify-end gap-0.5">
        {Array.from({ length: 7 }).map((_, stepIdx) => {
          const level = (7 - stepIdx) * 14;
          const isActive = vuLevels.right >= level;
          let colorClass = 'bg-neutral-800';
          if (isActive) {
            if (level > 70) colorClass = 'bg-[#ff007f] shadow-[0_0_3px_#ff007f]';
            else if (level > 42) colorClass = 'bg-amber-500 shadow-[0_0_3px_rgba(245,158,11,0.5)]';
            else colorClass = 'bg-[#22c55e] shadow-[0_0_3px_rgba(34,197,94,0.5)]';
          }
          return <div key={stepIdx} className={`w-full h-1 rounded-sm ${colorClass}`} />;
        })}
      </div>
    </div>
  );
}

export function WorkflowSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(containerRef);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isStickyDisabled, setIsStickyDisabled] = useState(false);
  const isScrollingToRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Console interactive states
  const [iso, setIso] = useState(400);
  const [apertureIdx, setApertureIdx] = useState(2); // f/1.8
  const [zoom, setZoom] = useState(50); // 50mm
  const [isFocusPeaking, setIsFocusPeaking] = useState(false);
  const [colorHue, setColorHue] = useState(0);
  const [colorSat, setColorSat] = useState(100);
  
  // Script / Planning parameters
  const [hookIntensity, setHookIntensity] = useState(85);

  // Conic-gradient drag handler references
  const colorWheelRef = useRef<HTMLDivElement>(null);
  const [isColorDragging, setIsColorDragging] = useState(false);

  const apertures = ['f/1.2', 'f/1.4', 'f/1.8', 'f/2.8', 'f/4.0', 'f/5.6', 'f/8.0', 'f/11', 'f/16'];

  useEffect(() => {
    const handleResize = () => {
      // Disable sticky on small screens or heights
      setIsStickyDisabled(window.innerHeight < 720 || window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScrollEnd = () => {
      isScrollingToRef.current = false;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
    window.addEventListener('scrollend', handleScrollEnd);
    return () => {
      window.removeEventListener('scrollend', handleScrollEnd);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isScrollingToRef.current) return;
    if (progress >= 0.33 && progress < 0.66) {
      setActiveIndex(1);
    } else if (progress >= 0.66) {
      setActiveIndex(2);
    } else {
      setActiveIndex(0);
    }
  }, [progress]);

  // Handle color wheel mouse/touch dragging
  const handleColorMove = (clientX: number, clientY: number) => {
    const wheel = colorWheelRef.current;
    if (!wheel) return;
    const rect = wheel.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;
    
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    // Saturation proportional to distance from center, capped at 200%
    const dist = Math.min(200, Math.sqrt(x*x + y*y) / (rect.width / 2) * 150);
    
    setColorHue(Math.round(angle));
    setColorSat(Math.round(dist));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeIndex !== 2) return; // Only interactable in Stage 3
    setIsColorDragging(true);
    handleColorMove(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeIndex !== 2) return; // Only interactable in Stage 3
    setIsColorDragging(true);
    if (e.touches.length > 0) {
      handleColorMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsColorDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isColorDragging) {
        handleColorMove(e.clientX, e.clientY);
      }
    };
    const handleTouchEnd = () => setIsColorDragging(false);
    const handleTouchMove = (e: TouchEvent) => {
      if (isColorDragging && e.touches.length > 0) {
        e.preventDefault();
        handleColorMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isColorDragging]);

  const scrollToStep = (idx: number) => {
    if (!containerRef.current) return;
    isScrollingToRef.current = true;
    setActiveIndex(idx);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const containerTop = containerRef.current.offsetTop;
    const elementHeight = containerRef.current.offsetHeight;
    const totalScrollable = elementHeight - window.innerHeight;
    const targets = [0.15, 0.50, 0.85];
    window.scrollTo({
      top: containerTop + targets[idx] * totalScrollable,
      behavior: 'smooth'
    });

    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingToRef.current = false;
    }, 1000);
  };

  // --- MOBILE LAYOUT (Interactive Console & Tabs) ---
  if (isStickyDisabled) {
    const activeStep = steps[activeIndex];
    return (
      <section 
        id="services" 
        className="relative bg-[#070708] text-white py-16 px-4 border-t border-white/5 overflow-hidden"
      >
        {/* Background Subtle Geometrical Lines */}
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:6rem_6rem] pointer-events-none" />

        <div className="container mx-auto flex flex-col gap-8 w-full relative z-10">
          {/* Section Header */}
          <div className="flex flex-col gap-2 select-none text-left">
            <span className="text-neutral-500 text-[10px] tracking-[0.3em] font-display-tech font-semibold">
              processo criativo //
            </span>
            <h2 className="font-serif-editorial italic text-3xl leading-tight text-neutral-300 lowercase">
              como criamos{' '}
              <span className="font-bold text-white font-serif-editorial not-italic">
                valor.
              </span>
            </h2>
            <p className="text-xs text-neutral-400 max-w-md lowercase font-sans leading-relaxed mt-1">
              nosso processo é otimizado para transformar ideias brutas em vídeos de alta retenção e impacto visual.
            </p>
          </div>

          {/* Interactive Modern Tabs */}
          <div className="flex flex-row justify-between border border-white/5 bg-white/[0.02] p-1 rounded-xl w-full select-none gap-1">
            {steps.map((step, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={step.num}
                  onClick={() => setActiveIndex(idx)}
                  className={`flex-1 py-2.5 px-1 rounded-lg text-center font-display-tech transition-all duration-300 flex flex-col items-center justify-center gap-0.5 ${
                    isActive
                      ? 'bg-[#ff007f]/10 border border-[#ff007f]/30 text-white shadow-[0_0_15px_rgba(255,0,127,0.15)]'
                      : 'border border-transparent text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <span className={`text-[7px] uppercase tracking-widest ${isActive ? 'text-[#ff007f]' : 'text-neutral-600'}`}>
                    {step.num}
                  </span>
                  <span className="text-[8px] font-bold tracking-tight uppercase">
                    {step.phase}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Step Content Card */}
          <div className="w-full p-5 rounded-2xl border border-[#ff007f]/20 bg-[#0a0a0c]/90 relative overflow-hidden text-left shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {/* Viewfinder corner crop marks */}
            <div className="absolute top-3 left-3 border-t border-l border-[#ff007f]/30 w-2 h-2 pointer-events-none" />
            <div className="absolute top-3 right-3 border-t border-r border-[#ff007f]/30 w-2 h-2 pointer-events-none" />
            <div className="absolute bottom-3 left-3 border-b border-l border-[#ff007f]/30 w-2 h-2 pointer-events-none" />
            <div className="absolute bottom-3 right-3 border-b border-r border-[#ff007f]/30 w-2 h-2 pointer-events-none" />
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-[8px] font-display-tech text-[#ff007f] tracking-widest">
                [ STAGE_{activeStep.num} // ACTIVE ]
              </span>
              <span className="text-[8px] font-display-tech text-white/40 tracking-wider">
                TC <TimecodeTicker initialTime={initialTimes[activeIndex]} />
              </span>
            </div>

            <h3 className="font-display-tech text-white text-lg font-bold tracking-tight leading-snug lowercase mb-2">
              {activeStep.title}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed lowercase mb-4">
              {activeStep.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {activeStep.specs.map((spec) => (
                <span 
                  key={spec} 
                  className="text-[8px] font-display-tech uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-neutral-300"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Mobile Interactive Director's Console */}
          <div className="w-full max-w-[480px] mx-auto bg-neutral-900 border-4 border-neutral-950 rounded-2xl shadow-2xl relative flex flex-col overflow-hidden">
            {/* Bezel Decals & Technical HUD (Top Bezel Bar) */}
            <div className="flex justify-between items-center px-3 py-1.5 bg-neutral-950/70 border-b border-white/5 select-none text-neutral-500 text-[8px] font-display-tech uppercase">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 border border-neutral-700" />
                <span>maria films // hd_oled_console</span>
              </div>
              <div className="flex items-center gap-3">
                {activeIndex === 1 ? (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
                    <span className="text-red-500 font-bold">REC</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-amber-500">STDBY</span>
                  </div>
                )}
                <span>98% [4.2v]</span>
              </div>
            </div>

            {/* Viewport Screen */}
            <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden flex items-center justify-center border-b border-white/5">
              {/* Visual content of viewfinder */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img
                  src={activeIndex === 0 ? '/portfolio_3.webp' : activeIndex === 1 ? '/portfolio_1.webp' : '/portfolio_2.webp'}
                  alt="Monitor Preview"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out"
                  style={{
                    transform: `scale(${1.0 + ((zoom - 24) / 76) * 0.25})`,
                    filter: `brightness(${0.4 + (iso / 1600) * 0.6}) blur(${Math.max(0, 5 - apertureIdx * 0.7)}px) hue-rotate(${colorHue}deg) saturate(${colorSat}%)`,
                  }}
                />
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] z-10 opacity-30" />
                <div className="absolute inset-0 bg-[radial-gradient(transparent_50%,rgba(0,0,0,0.6)_100%)] pointer-events-none z-10" />
              </div>

              {/* Composition Viewfinder HUD */}
              <div className="absolute inset-0 z-20 pointer-events-none opacity-40 select-none text-[8px] font-display-tech">
                <div className="absolute left-1/3 top-0 bottom-0 border-l border-dashed border-white/15" />
                <div className="absolute left-2/3 top-0 bottom-0 border-l border-dashed border-white/15" />
                <div className="absolute top-1/3 left-0 right-0 border-t border-dashed border-white/15" />
                <div className="absolute top-2/3 left-0 right-0 border-t border-dashed border-white/15" />
                
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <div className="w-4 h-[1px] bg-white/40" />
                  <div className="h-4 w-[1px] bg-white/40 absolute" />
                  <div className="w-1 h-1 rounded-full bg-[#ff007f]/60 absolute" />
                </div>

                <div className="absolute top-4 left-4 border-t border-l border-white/40 w-4 h-4" />
                <div className="absolute top-4 right-4 border-t border-r border-white/40 w-4 h-4" />
                <div className="absolute bottom-4 left-4 border-b border-l border-white/40 w-4 h-4" />
                <div className="absolute bottom-4 right-4 border-b border-r border-white/40 w-4 h-4" />

                <span className="absolute top-4 left-6 text-white/50 text-[7px]">PRORES_RAW</span>
                <span className="absolute top-4 right-6 text-white/50 text-[7px]">24.00 FPS</span>
                <span className="absolute bottom-4 left-6 text-white/50 text-[7px]">STAGE {activeIndex + 1}</span>
                <span className="absolute bottom-4 right-6 text-white/50 text-[7px]">TC <TimecodeTicker key={activeIndex} initialTime={initialTimes[activeIndex]} /></span>
              </div>

              {/* Focus Peaking SVG highlight Layer */}
              {isFocusPeaking && (
                <div className="absolute inset-0 z-20 pointer-events-none mix-blend-screen opacity-65">
                  <svg className="w-full h-full text-[#22c55e]" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M10,25 L12,28 M20,45 L23,43 M80,20 L78,22 M85,70 L87,73 M50,50 L53,48 M45,75 L46,73 M33,20 L35,22 M62,80 L64,79" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1.5 2.5" />
                    <path d="M28,30 C34,31 38,27 42,32" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1 2" />
                    <path d="M72,55 C67,59 62,54 58,57" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1 2" />
                  </svg>
                </div>
              )}
            </div>

            {/* Lower Technical Control Board */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-neutral-950 border-t border-white/5 text-left text-[9px] font-display-tech text-neutral-400">
              {/* Block 1: Oscilloscope / Waveform Parade */}
              <div className="flex flex-col gap-1 pr-1 border-r border-white/5 select-none">
                <div className="flex justify-between items-center text-[7px] tracking-wider text-neutral-500 uppercase">
                  <span>[ parade ]</span>
                  <span className="text-[#ff007f]">RGB</span>
                </div>
                <div className="w-full h-[45px] bg-neutral-900/50 rounded border border-white/5 relative flex items-center justify-center p-1 overflow-hidden">
                  <WaveformParade activeIndex={activeIndex} colorHue={colorHue} colorSat={colorSat} hookIntensity={hookIntensity} />
                </div>
                <span className="text-[7px] leading-tight text-neutral-500 uppercase">
                  {activeIndex === 0 && 'retenção estim.'}
                  {activeIndex === 1 && 'frequência capt.'}
                  {activeIndex === 2 && 'color/luma tune'}
                </span>
              </div>

              {/* Block 2: Interactive Camera Controls */}
              <div className="flex flex-col gap-1 border-r border-white/5 px-1">
                <span className="text-[7px] tracking-wider text-neutral-500 uppercase">[ console ]</span>
                
                {activeIndex === 0 ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[7px]">
                      <span>gancho</span>
                      <span className="text-[#ff007f]">{hookIntensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={hookIntensity}
                      onChange={(e) => setHookIntensity(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded accent-[#ff007f] cursor-pointer appearance-none"
                    />
                  </div>
                ) : activeIndex === 1 ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[7px] leading-none">
                      <span>ISO <span className="text-[#ff007f]">{iso}</span></span>
                      <span>ZM <span className="text-[#ff007f]">{zoom}</span></span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <input
                        type="range"
                        min="100"
                        max="1600"
                        step="100"
                        value={iso}
                        onChange={(e) => setIso(parseInt(e.target.value))}
                        className="w-1/2 h-0.5 bg-white/10 rounded accent-[#ff007f] cursor-pointer appearance-none"
                      />
                      <input
                        type="range"
                        min="24"
                        max="100"
                        value={zoom}
                        onChange={(e) => setZoom(parseInt(e.target.value))}
                        className="w-1/2 h-0.5 bg-white/10 rounded accent-[#ff007f] cursor-pointer appearance-none"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-[7px]">{apertures[apertureIdx]}</span>
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => setApertureIdx((apertureIdx + 1) % apertures.length)}
                          className="px-1 py-0.2 bg-white/5 border border-white/10 rounded text-[6px] text-white"
                        >
                          INC
                        </button>
                        <button
                          onClick={() => setIsFocusPeaking(!isFocusPeaking)}
                          className={`px-1 py-0.2 text-[6px] rounded border transition-all ${
                            isFocusPeaking
                              ? 'border-[#22c55e] bg-[#22c55e]/15 text-[#22c55e]'
                              : 'border-white/10 text-neutral-400'
                          }`}
                        >
                          PEAK
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[7px] leading-none">
                      <span>hue <span className="text-[#ff007f]">{colorHue}°</span></span>
                      <span>sat <span className="text-[#ff007f]">{colorSat}%</span></span>
                    </div>
                    <button
                      onClick={() => { setColorHue(0); setColorSat(100); }}
                      className="w-full py-0.5 bg-white/5 border border-white/10 hover:border-white/20 rounded text-[6px] text-white uppercase text-center"
                    >
                      reset
                    </button>
                  </div>
                )}
              </div>

              {/* Block 3: Color Grading Wheel or VU */}
              <div className="flex justify-between items-center pl-1 select-none relative">
                {activeIndex === 2 ? (
                  <div className="flex items-center justify-between w-full h-full gap-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[7px] tracking-wider text-neutral-500 uppercase">[ wheels ]</span>
                      <div
                        ref={colorWheelRef}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        className="w-8 h-8 rounded-full border border-white/10 relative cursor-crosshair overflow-hidden"
                        style={{
                          background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)'
                        }}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,1)_0%,rgba(255,255,255,0)_100%)] opacity-60 pointer-events-none" />
                        <div
                          className="absolute w-1.5 h-1.5 rounded-full border border-white bg-black/60 shadow-[0_0_2px_black] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                          style={{
                            left: `${50 + Math.cos((colorHue * Math.PI) / 180) * (colorSat / 200) * 50}%`,
                            top: `${50 + Math.sin((colorHue * Math.PI) / 180) * (colorSat / 200) * 50}%`
                          }}
                        />
                      </div>
                    </div>
                    <VuMeter activeIndex={activeIndex} />
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full h-full">
                    <div className="flex flex-col gap-0.5 text-left leading-tight">
                      <span className="text-[7px] tracking-wider text-neutral-500 uppercase">[ audio ]</span>
                      <span className="text-[#22c55e] font-bold text-[7px] animate-pulse">L-R ON</span>
                    </div>
                    <VuMeter activeIndex={activeIndex} />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>
    );
  }

  // --- DESKTOP STICKY SPLIT-SCREEN LAYOUT ---
  return (
    <section 
      ref={containerRef} 
      id="services" 
      className="relative bg-[#070708] text-white z-20 border-t border-white/5 h-[250vh]"
    >
      {/* Background Subtle Geometrical Lines */}
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:6rem_6rem] pointer-events-none" />

      <div className="relative w-full md:sticky md:top-0 md:h-screen md:overflow-hidden flex flex-col justify-center px-6 lg:px-16 max-w-7xl mx-auto py-12 md:py-0">
        
        {/* Header Row (full width) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 select-none w-full relative z-10 text-left">
          <div className="flex flex-col gap-1">
            <span className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] font-display-tech font-semibold">
              processo criativo //
            </span>
            <h2 className="font-serif-editorial italic text-2xl md:text-4xl leading-none text-neutral-300 lowercase">
              como criamos{' '}
              <span className="font-bold text-white font-serif-editorial not-italic">
                valor.
              </span>
            </h2>
          </div>
          <p className="text-xs text-neutral-400 max-w-md lowercase font-sans leading-relaxed">
            nosso processo é otimizado para transformar ideias brutas em vídeos de alta retenção e impacto visual. esculpimos cada etapa com engenharia e sensibilidade artística.
          </p>
        </div>

        {/* Outer Split Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full relative z-10">
          
          {/* Left Column: Accordion list (cols 5) */}
          <div className="lg:col-span-5 flex flex-col gap-4 text-left">
            {steps.map((step, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={step.num}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-500 flex flex-col justify-between overflow-hidden relative ${
                    isActive
                       ? 'border-[#ff007f]/50 bg-[#0a0a0c] shadow-[0_15px_40px_rgba(255,0,127,0.1)] ring-1 ring-[#ff007f]/10 opacity-100 translate-x-2'
                      : 'border-white/5 bg-[#0d0d0f]/20 opacity-30 hover:opacity-60 hover:border-white/10 hover:translate-x-1'
                  }`}
                  onClick={() => scrollToStep(idx)}
                >
                  {/* Viewfinder corner crop marks on active step */}
                  {isActive && (
                    <>
                      <div className="absolute top-3 left-3 border-t border-l border-[#ff007f]/30 w-2 h-2 pointer-events-none" />
                      <div className="absolute top-3 right-3 border-t border-r border-[#ff007f]/30 w-2 h-2 pointer-events-none" />
                      <div className="absolute bottom-3 left-3 border-b border-l border-[#ff007f]/30 w-2 h-2 pointer-events-none" />
                      <div className="absolute bottom-3 right-3 border-b border-r border-[#ff007f]/30 w-2 h-2 pointer-events-none" />
                    </>
                  )}

                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[8.5px] font-display-tech uppercase tracking-wider transition-colors duration-500 ${
                      isActive ? 'text-[#ff007f]' : 'text-neutral-500'
                    }`}>
                      {step.phase} // {step.num}
                    </span>
                    <span className="text-[8px] font-display-tech text-white/40 tracking-wider">
                      TC <TimecodeTicker initialTime={initialTimes[idx]} />
                    </span>
                  </div>

                  <h3 className="font-display-tech text-white text-base font-semibold tracking-tight leading-snug lowercase">
                    {step.title}
                  </h3>

                  {/* Expandable Content for active step */}
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isActive ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}>
                    <p className="text-[11px] text-neutral-400 leading-relaxed lowercase mb-3">
                      {step.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {step.specs.map((spec) => (
                        <span
                          key={spec}
                          className="text-[7.5px] font-display-tech uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/5 bg-white/[0.01] text-neutral-500 lowercase"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Director's Console (cols 7) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            {/* Monitor Outer Frame */}
            <div className="w-full max-w-[580px] bg-neutral-900 border-[10px] border-neutral-950 rounded-2xl shadow-2xl relative flex flex-col overflow-hidden">
              
              {/* Bezel Decals & Technical HUD (Top Bezel Bar) */}
              <div className="flex justify-between items-center px-4 py-1.5 bg-neutral-950/70 border-b border-white/5 select-none text-neutral-500 text-[8px] font-display-tech uppercase">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-800 border border-neutral-700" />
                  <span>maria films // hd_oled_console</span>
                </div>
                <div className="flex items-center gap-3">
                  {activeIndex === 1 ? (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
                      <span className="text-red-500 font-bold">REC</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="text-amber-500">STDBY</span>
                    </div>
                  )}
                  <span>98% [4.2v]</span>
                </div>
              </div>

              {/* Viewport Screen */}
              <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden flex items-center justify-center border-b border-white/5 group/viewport">
                
                {/* Visual content of viewfinder */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <img
                    src={activeIndex === 0 ? '/portfolio_3.webp' : activeIndex === 1 ? '/portfolio_1.webp' : '/portfolio_2.webp'}
                    alt="Monitor Preview"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out"
                    style={{
                      transform: `scale(${1.0 + ((zoom - 24) / 76) * 0.25})`,
                      filter: `brightness(${0.4 + (iso / 1600) * 0.6}) blur(${Math.max(0, 5 - apertureIdx * 0.7)}px) hue-rotate(${colorHue}deg) saturate(${colorSat}%)`,
                    }}
                  />
                  {/* Subtle Scanlines overlay for crt/monitor authenticity */}
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] z-10 opacity-30" />
                  {/* Vignette overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(transparent_50%,rgba(0,0,0,0.6)_100%)] pointer-events-none z-10" />
                </div>

                {/* Composition Viewfinder HUD (Rule of Thirds + Crosshair) */}
                <div className="absolute inset-0 z-20 pointer-events-none opacity-40 select-none text-[8px] font-display-tech">
                  {/* Dotted lines */}
                  <div className="absolute left-1/3 top-0 bottom-0 border-l border-dashed border-white/15" />
                  <div className="absolute left-2/3 top-0 bottom-0 border-l border-dashed border-white/15" />
                  <div className="absolute top-1/3 left-0 right-0 border-t border-dashed border-white/15" />
                  <div className="absolute top-2/3 left-0 right-0 border-t border-dashed border-white/15" />
                  
                  {/* Center crosshair */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <div className="w-4 h-[1px] bg-white/40" />
                    <div className="h-4 w-[1px] bg-white/40 absolute" />
                    <div className="w-1 h-1 rounded-full bg-[#ff007f]/60 absolute" />
                  </div>

                  {/* Corner brackets */}
                  <div className="absolute top-4 left-4 border-t border-l border-white/40 w-4 h-4" />
                  <div className="absolute top-4 right-4 border-t border-r border-white/40 w-4 h-4" />
                  <div className="absolute bottom-4 left-4 border-b border-l border-white/40 w-4 h-4" />
                  <div className="absolute bottom-4 right-4 border-b border-r border-white/40 w-4 h-4" />

                  {/* Text Decals on HUD Overlay */}
                  <span className="absolute top-4 left-10 text-white/50">PRORES_RAW // 10-BIT</span>
                  <span className="absolute top-4 right-10 text-white/50">24.00 FPS</span>
                  <span className="absolute bottom-4 left-10 text-white/50">STAGE {activeIndex + 1} // ACTIVE</span>
                  <span className="absolute bottom-4 right-10 text-white/50">TC <TimecodeTicker key={activeIndex} initialTime={initialTimes[activeIndex]} /></span>
                </div>

                {/* Focus Peaking SVG highlight Layer */}
                {isFocusPeaking && (
                  <div className="absolute inset-0 z-20 pointer-events-none mix-blend-screen opacity-65">
                    <svg className="w-full h-full text-[#22c55e]" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M10,25 L12,28 M20,45 L23,43 M80,20 L78,22 M85,70 L87,73 M50,50 L53,48 M45,75 L46,73 M33,20 L35,22 M62,80 L64,79" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1.5 2.5" />
                      <path d="M28,30 C34,31 38,27 42,32" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1 2" />
                      <path d="M72,55 C67,59 62,54 58,57" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1 2" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Lower Technical Control Board */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-950 border-t border-white/5 text-left text-[9px] font-display-tech text-neutral-400">
                
                {/* Block 1: Oscilloscope / Waveform Parade */}
                <div className="flex flex-col gap-1.5 border-r border-white/5 pr-3 select-none">
                  <div className="flex justify-between items-center text-[8px] tracking-wider text-neutral-500 uppercase">
                    <span>[ parade monitor ]</span>
                    <span className="text-[#ff007f]">RGB</span>
                  </div>
                  <div className="w-full h-[45px] bg-neutral-900/50 rounded border border-white/5 relative flex items-center justify-center p-1 overflow-hidden">
                    <WaveformParade activeIndex={activeIndex} colorHue={colorHue} colorSat={colorSat} hookIntensity={hookIntensity} />
                    <span className="absolute bottom-0.5 right-1 text-[7px] text-neutral-600">PARADE 4K</span>
                  </div>
                  <span className="text-[7.5px] leading-tight text-neutral-500 uppercase">
                    {activeIndex === 0 && 'decaimento de retenção estimado'}
                    {activeIndex === 1 && 'frequência de captação digital'}
                    {activeIndex === 2 && 'ajuste dinâmico de color/luma'}
                  </span>
                </div>

                {/* Block 2: Interactive Camera Controls */}
                <div className="flex flex-col gap-2 border-r border-white/5 px-2">
                  <span className="text-[8px] tracking-wider text-neutral-500 uppercase">[ camera console ]</span>
                  
                  {activeIndex === 0 ? (
                    // Stage 1 controls: attention hook slider
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <span>gancho de atração</span>
                        <span className="text-[#ff007f]">{hookIntensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={hookIntensity}
                        onChange={(e) => setHookIntensity(parseInt(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded accent-[#ff007f] cursor-pointer appearance-none"
                      />
                      <span className="text-[7.5px] text-neutral-600 uppercase">ajusta o gancho de retenção</span>
                    </div>
                  ) : activeIndex === 1 ? (
                    // Stage 2 controls: ISO, Aperture, Focus Peaking
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[8px]">
                        <span>ISO: <span className="text-[#ff007f]">{iso}</span></span>
                        <span>ZOOM: <span className="text-[#ff007f]">{zoom}mm</span></span>
                      </div>
                      
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="range"
                          min="100"
                          max="1600"
                          step="100"
                          value={iso}
                          onChange={(e) => setIso(parseInt(e.target.value))}
                          className="w-1/2 h-0.5 bg-white/10 rounded accent-[#ff007f] cursor-pointer appearance-none"
                        />
                        <input
                          type="range"
                          min="24"
                          max="100"
                          value={zoom}
                          onChange={(e) => setZoom(parseInt(e.target.value))}
                          className="w-1/2 h-0.5 bg-white/10 rounded accent-[#ff007f] cursor-pointer appearance-none"
                        />
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[8px]">AP: <span className="text-white">{apertures[apertureIdx]}</span></span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setApertureIdx((apertureIdx + 1) % apertures.length)}
                            className="px-1 py-0.5 bg-white/5 border border-white/10 hover:border-white/20 rounded text-[7px] text-white"
                          >
                            INC
                          </button>
                          <button
                            onClick={() => setIsFocusPeaking(!isFocusPeaking)}
                            className={`px-1.5 py-0.5 text-[7px] rounded border transition-all ${
                              isFocusPeaking
                                ? 'border-[#22c55e] bg-[#22c55e]/15 text-[#22c55e]'
                                : 'border-white/10 text-neutral-400'
                            }`}
                          >
                            PEAK
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Stage 3 controls: Color info & VU toggle
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <span>matiz de grade</span>
                        <span className="text-[#ff007f]">{colorHue}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span>saturação</span>
                        <span className="text-[#ff007f]">{colorSat}%</span>
                      </div>
                      <div className="flex gap-1 mt-0.5">
                        <button
                          onClick={() => { setColorHue(0); setColorSat(100); }}
                          className="w-full py-0.5 bg-white/5 border border-white/10 hover:border-white/20 rounded text-[7px] text-white uppercase text-center"
                        >
                          reseta grade
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Block 3: Color Grading Wheel (Stage 3 active) or Audio VU levels */}
                <div className="flex justify-between items-center pl-2 select-none relative">
                  
                  {activeIndex === 2 ? (
                    // Stage 3 interactive color wheel + VU meter
                    <div className="flex items-center justify-between w-full h-full gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] tracking-wider text-neutral-500 uppercase">[ color suite ]</span>
                        
                        {/* Conic Gradient Color Wheel */}
                        <div
                          ref={colorWheelRef}
                          onMouseDown={handleMouseDown}
                          onTouchStart={handleTouchStart}
                          className="w-11 h-11 rounded-full border border-white/10 relative cursor-crosshair overflow-hidden"
                          style={{
                            background: 'conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)'
                          }}
                        >
                          {/* Inner soft overlay for saturation representation */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,1)_0%,rgba(255,255,255,0)_100%)] opacity-60 pointer-events-none" />
                          
                          {/* Wheel center picker dot */}
                          <div
                            className="absolute w-2 h-2 rounded-full border-2 border-white bg-black/60 shadow-[0_0_4px_black] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{
                              left: `${50 + Math.cos((colorHue * Math.PI) / 180) * (colorSat / 200) * 50}%`,
                              top: `${50 + Math.sin((colorHue * Math.PI) / 180) * (colorSat / 200) * 50}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* VU Meter Column */}
                      <VuMeter activeIndex={activeIndex} />
                    </div>
                  ) : (
                    // Stages 1 & 2 display VU indicators always to look alive
                    <div className="flex items-center justify-between w-full h-full">
                      <div className="flex flex-col gap-1 text-left">
                        <span className="text-[8px] tracking-wider text-neutral-500 uppercase">[ audio master ]</span>
                        <span className="text-[7.5px] text-neutral-500 uppercase leading-none">limiar de pico ok</span>
                        <span className="text-[#22c55e] font-bold text-[8px] animate-pulse mt-1 select-none">L-R MASTER ACTIVE</span>
                      </div>
                      
                      {/* VU Meter Column */}
                      <VuMeter activeIndex={activeIndex} />
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Technical HUD Watermark Details (Bottom Borders) */}
      <div className="absolute bottom-6 left-6 md:left-10 z-10 text-[9px] font-display-tech tracking-[0.2em] text-neutral-600 uppercase select-none pointer-events-none">
        workflow // process_flow
      </div>
      <div className="absolute bottom-6 right-6 md:right-10 z-10 text-[9px] font-display-tech tracking-[0.2em] text-neutral-600 uppercase select-none pointer-events-none">
        hud // active_console
      </div>
    </section>
  );
}
