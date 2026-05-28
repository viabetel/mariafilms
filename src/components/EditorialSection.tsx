import { useEffect, useState } from 'react';

export function EditorialSection() {
  const [timecode, setTimecode] = useState('00:04:28:12');

  // Dynamic 24fps camera timecode ticker
  useEffect(() => {
    let frame = 12;
    let sec = 28;
    let min = 4;
    let hour = 0;

    const interval = setInterval(() => {
      frame++;
      if (frame >= 24) {
        frame = 0;
        sec++;
        if (sec >= 60) {
          sec = 0;
          min++;
          if (min >= 60) {
            min = 0;
            hour++;
          }
        }
      }
      const hStr = String(hour).padStart(2, '0');
      const mStr = String(min).padStart(2, '0');
      const sStr = String(sec).padStart(2, '0');
      const fStr = String(frame).padStart(2, '0');
      setTimecode(`${hStr}:${mStr}:${sStr}:${fStr}`);
    }, 1000 / 24);

    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      id="about" 
      className="relative min-h-screen md:h-screen w-full bg-[#070708] text-white overflow-hidden flex items-center py-16 md:py-0 px-6 md:px-16 z-20 border-t border-white/5"
    >
      {/* Background Subtle Geometrical Lines */}
      <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:6rem_6rem] pointer-events-none" />

      {/* Main Content Grid */}
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16 w-full max-w-6xl relative z-10">
        
        {/* Left Column: Black & White Grayscale Portrait styled as a Camera Viewfinder Monitor */}
        <div className="w-full md:w-[45%] flex justify-center">
          <div className="border border-white/10 p-3 md:p-4 bg-[#0a0a0c] shadow-[0_30px_70px_rgba(0,0,0,0.85)] rounded-[2rem] hover:scale-[1.01] transition-all duration-500 ease-in-out group relative overflow-hidden">
            
            {/* Monitor Outer Frame HUD Overlays */}
            {/* Corner Crop Marks */}
            <div className="absolute top-6 left-6 border-t-2 border-l-2 border-white/20 w-3 h-3 pointer-events-none" />
            <div className="absolute top-6 right-6 border-t-2 border-r-2 border-white/20 w-3 h-3 pointer-events-none" />
            <div className="absolute bottom-6 left-6 border-b-2 border-l-2 border-white/20 w-3 h-3 pointer-events-none" />
            <div className="absolute bottom-6 right-6 border-b-2 border-r-2 border-white/20 w-3 h-3 pointer-events-none" />

            {/* Top HUD Data */}
            <div className="absolute top-6 left-12 flex items-center gap-1.5 text-[8px] font-display-tech uppercase tracking-wider text-red-500 font-bold select-none pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" />
              REC
            </div>
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[8px] font-display-tech text-white/40 tracking-widest select-none pointer-events-none">
              PLAY // 24FPS
            </div>
            <div className="absolute top-6 right-12 text-[8px] font-display-tech text-white/80 tracking-widest select-none pointer-events-none">
              TC {timecode}
            </div>

            {/* Viewfinder Center Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none opacity-20 border border-white rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>

            {/* Bottom HUD Data */}
            <div className="absolute bottom-6 left-12 flex items-center gap-3 text-[8px] font-display-tech text-white/40 tracking-wider select-none pointer-events-none">
              <span>SHUTTER 180°</span>
              <span className="h-2 w-px bg-white/10" />
              <span>ND 0.9</span>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-display-tech text-[#ff007f] font-bold tracking-widest select-none pointer-events-none">
              LENS // 50mm
            </div>
            <div className="absolute bottom-6 right-12 text-[8px] font-display-tech text-green-400 font-bold tracking-wider select-none pointer-events-none">
              RAW 4K
            </div>

            {/* Main Portrait Canvas Frame */}
            <div className="overflow-hidden rounded-2xl h-[38vh] md:h-[52vh] w-[75vw] md:w-[350px] max-w-full relative">
              <img
                src="https://lh3.googleusercontent.com/d/13Fy1QYAYSojvlBgf8TqtYvIAcyaQSliS"
                alt="Maria Eduarda portrait"
                className="w-full h-full object-cover object-[center_20%] grayscale contrast-[1.12] brightness-[0.88] transition-transform duration-700 ease-out group-hover:scale-102"
              />
              {/* Cinematic Monitor Scanlines/Filter */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/25 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Profile & Biography */}
        <div className="w-full md:w-[55%] flex flex-col gap-6 text-left">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] tracking-[0.3em] font-display-tech text-neutral-500 uppercase font-semibold">
              [ perfil editorial // maria eduarda ]
            </span>
            <div className="w-8 h-[1px] bg-[#ff007f] shadow-[0_0_6px_#ff007f]" />
          </div>

          <h2 className="font-serif-editorial italic text-3xl md:text-[45px] leading-tight text-neutral-200 lowercase">
            o cinema não é sobre registrar o real, é sobre{' '}
            <span className="font-bold text-white font-serif-editorial not-italic">
              capturar a alma da luz
            </span>{' '}
            e esculpir o silêncio do tempo.
          </h2>

          <p className="text-xs md:text-[13px] text-neutral-400 leading-relaxed font-sans lowercase max-w-xl">
            diretora de cena e filmmaker independente. maria eduarda atua de forma autónoma, conduzindo cada projeto com uma visão singular e controle pessoal de cada etapa – desde a concepção visual e captação até a montagem final. sua abordagem foca na intimidade da cena, na textura da luz natural e na entrega de narrativas com assinatura autoral marcante.
          </p>

          {/* Elegant signature block */}
          <div className="font-serif-editorial italic text-2xl text-white select-none pl-3 border-l border-[#ff007f]/50 py-0.5">
            maria eduarda.
          </div>

          {/* Technical Metadata specs box styled as a Tech Camera HUD */}
          <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6 mt-2 text-[10px] font-display-tech uppercase text-neutral-500 tracking-wider">
            <div className="flex flex-col gap-2">
              <span className="text-white font-bold tracking-widest text-[11px] font-display-tech flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff007f] shadow-[0_0_6px_#ff007f]" />
                frentes //
              </span>
              <span className="text-neutral-400">captação & videomaking</span>
              <span className="text-neutral-400">edição de vídeo (social)</span>
              <span className="text-neutral-400">roteiro & estratégia</span>
            </div>
            <div className="flex flex-col gap-2 border-l border-white/10 pl-6">
              <span className="text-white font-bold tracking-widest text-[11px] font-display-tech flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                estética //
              </span>
              <span className="text-neutral-400">luz prática & dinâmica</span>
              <span className="text-neutral-400">ritmo ágil & ganchos</span>
              <span className="text-neutral-400">sound design moderno</span>
            </div>
          </div>
        </div>

      </div>

      {/* Technical HUD Watermark Details (Bottom Borders) */}
      <div className="absolute bottom-6 left-6 md:left-10 z-10 text-[9px] font-display-tech tracking-[0.2em] text-neutral-600 uppercase select-none pointer-events-none">
        about // autonomous_filmmaker
      </div>
      <div className="absolute bottom-6 right-6 md:right-10 z-10 text-[9px] font-display-tech tracking-[0.2em] text-neutral-600 uppercase select-none pointer-events-none">
        loc // independence_focus
      </div>
    </section>
  );
}
