const fs = require('fs');

const outPath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\src\\components\\ShowreelSection.tsx';

const code = `import { useRef, useState, useEffect } from 'react';

export function ShowreelSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    isHovered: false,
    opacity: 0,
    scale: 0.5
  });

  // Check if touch device
  useEffect(() => {
    setIsTouchDevice(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  }, []);

  // Custom cursor LERP animation loop
  useEffect(() => {
    if (isTouchDevice) return;
    let animationFrameId: number;

    const tick = () => {
      if (cursorRef.current) {
        const ease = 0.12;
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * ease;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * ease;
        
        const targetOpacity = mouseRef.current.isHovered ? 1 : 0;
        mouseRef.current.opacity += (targetOpacity - mouseRef.current.opacity) * ease;
        
        const targetScale = mouseRef.current.isHovered ? 1 : 0.5;
        mouseRef.current.scale += (targetScale - mouseRef.current.scale) * ease;

        cursorRef.current.style.transform = \`translate3d(\${mouseRef.current.x - 45}px, \${mouseRef.current.y - 45}px, 0) scale(\${mouseRef.current.scale})\`;
        cursorRef.current.style.opacity = mouseRef.current.opacity.toString();
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isTouchDevice]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTouchDevice) return;
    mouseRef.current.targetX = e.clientX;
    mouseRef.current.targetY = e.clientY;
  };

  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    mouseRef.current.isHovered = true;
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    mouseRef.current.isHovered = false;
  };

  // Play/pause background video based on lightbox state
  useEffect(() => {
    if (bgVideoRef.current) {
      if (isOpen) {
        bgVideoRef.current.pause();
      } else {
        bgVideoRef.current.play().catch(() => {});
      }
    }
  }, [isOpen]);

  // Sync volume and mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, isOpen]);

  // ESC key closes video
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsPlaying(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }, 100);
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handlePlayPause = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return \`\${String(mins).padStart(2, '0')}:\${String(secs).padStart(2, '0')}\`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && progressFillRef.current && timeTextRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 0;
      const pct = dur > 0 ? (cur / dur) * 100 : 0;
      progressFillRef.current.style.width = \`\${pct}%\`;
      timeTextRef.current.innerHTML = \`\${formatTime(cur)} <span class="mx-1 text-white/20">/</span> \${formatTime(dur)}\`;
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && timeTextRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 0;
      timeTextRef.current.innerHTML = \`\${formatTime(cur)} <span class="mx-1 text-white/20">/</span> \${formatTime(dur)}\`;
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressContainerRef.current || !videoRef.current) return;
    const dur = videoRef.current.duration;
    if (!dur || isNaN(dur)) return;
    
    const rect = progressContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const pct = Math.max(0, Math.min(1, clickX / width));
    const targetTime = pct * dur;
    
    videoRef.current.currentTime = targetTime;
    if (progressFillRef.current && timeTextRef.current) {
      progressFillRef.current.style.width = \`\${pct * 100}%\`;
      timeTextRef.current.innerHTML = \`\${formatTime(targetTime)} <span class="mx-1 text-white/20">/</span> \${formatTime(dur)}\`;
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) setIsMuted(false);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).msRequestFullscreen) {
        (videoRef.current as any).msRequestFullscreen();
      }
    }
  };

  return (
    <>
      <section
        ref={containerRef}
        className={\`relative h-screen w-full bg-black overflow-hidden flex items-center justify-center snap-start snap-always z-20 \${
          isTouchDevice ? '' : 'cursor-none'
        }\`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleOpen}
      >
        {/* Background video */}
        <div className="absolute inset-0 w-full h-full opacity-40 transition-all duration-700 ease-in-out filter grayscale hover:grayscale-0 hover:scale-[1.02] hover:opacity-55">
          <video
            ref={bgVideoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/Efeit Festa.webm" type="video/webm" />
            <source src="/Efeit Festa.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />
        </div>

        {/* HUD borders/headers */}
        <div className="absolute top-6 left-6 md:left-10 z-10 text-[9px] font-display-tech tracking-[0.2em] text-neutral-500 uppercase select-none pointer-events-none">
          system // play_portfolio
        </div>
        <div className="absolute top-6 right-6 md:right-10 z-10 text-[9px] font-display-tech tracking-[0.2em] text-neutral-500 uppercase select-none pointer-events-none">
          aspect // 2.39:1
        </div>
        <div className="absolute bottom-6 left-6 md:left-10 z-10 text-[9px] font-display-tech tracking-[0.2em] text-neutral-500 uppercase select-none pointer-events-none">
          maria films // portfólio 2026
        </div>

        {/* Center Title */}
        <div className="relative z-10 text-center flex flex-col items-center gap-6 px-6 pointer-events-none select-none">
          <span className="text-[10px] tracking-[0.4em] text-neutral-400 font-display-tech uppercase font-semibold">
            [ apresentar // portfólio compilado ]
          </span>
          <div className="flex flex-col gap-1 leading-none">
            <span className="font-serif-editorial italic text-[8vw] md:text-[4.5vw] font-light text-neutral-400 lowercase leading-[0.9]">
              assista ao
            </span>
            <span className="font-display-tech font-extrabold text-[10vw] md:text-[6.5vw] uppercase tracking-tighter text-white">
              showreel.
            </span>
          </div>
          {isTouchDevice && (
            <div className="mt-4 flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-md px-6 py-3 rounded-full text-white text-xs uppercase tracking-widest font-display-tech font-medium pointer-events-auto">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-[#ff007f]"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>toque para assistir</span>
            </div>
          )}
        </div>

        {/* LERP Cursor Follower */}
        {!isTouchDevice && (
          <div
            ref={cursorRef}
            className="fixed top-0 left-0 w-[90px] h-[90px] rounded-full bg-[#ff007f]/20 border border-[#ff007f] flex items-center justify-center pointer-events-none z-50 transition-opacity duration-300 ease-out flex-col"
            style={{
              opacity: 0,
              transform: 'scale(0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              boxShadow: '0 0 20px rgba(255, 0, 127, 0.4)',
            }}
          >
            <span className="text-[10px] font-bold text-white font-display-tech tracking-wider uppercase">
              play
            </span>
          </div>
        )}
      </section>

      {/* Lightbox Video Player */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 transition-all duration-500 ease-in-out pointer-events-auto"
          onClick={() => handleClose()}
        >
          {/* Close button */}
          <button
            className="absolute top-6 right-6 md:top-10 md:right-10 z-50 p-3 rounded-full bg-white/5 border border-white/10 hover:border-[#ff007f] hover:bg-[#ff007f] hover:text-white transition-all duration-300 hover:rotate-90 text-neutral-400 group"
            onClick={() => handleClose()}
            aria-label="Fechar vídeo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Player container */}
          <div
            className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.8)] flex flex-col group/player pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              src="/camera_360.mp4"
              className="w-full h-full object-contain flex-grow cursor-pointer"
              onClick={() => handlePlayPause()}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              playsInline
            />

            {/* Custom controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col gap-4 transition-all duration-300 transform translate-y-0 opacity-100 md:opacity-0 md:translate-y-2 md:group-hover/player:opacity-100 md:group-hover/player:translate-y-0 z-20">
              
              {/* Progress Timeline */}
              <div
                ref={progressContainerRef}
                className="w-full h-1.5 md:h-2 bg-white/15 rounded-full cursor-pointer relative overflow-hidden group/timeline"
                onClick={handleTimelineClick}
              >
                <div
                  ref={progressFillRef}
                  className="absolute left-0 top-0 h-full bg-[#ff007f] rounded-full transition-all duration-75"
                  style={{ width: '0%' }}
                />
              </div>

              {/* Lower controls bar */}
              <div className="flex items-center justify-between text-white">
                
                {/* Left Side: Play & Time */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePlayPause()}
                    className="p-2 rounded-full hover:bg-white/10 hover:text-[#ff007f] transition-colors"
                    aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
                  >
                    {isPlaying ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                  <span
                    ref={timeTextRef}
                    className="text-xs md:text-sm font-display-tech text-neutral-300 flex items-center"
                  >
                    00:00 <span className="mx-1 text-white/20">/</span> 00:00
                  </span>
                </div>

                {/* Right Side: Volume & Fullscreen */}
                <div className="flex items-center gap-4">
                  {/* Volume control */}
                  <div className="flex items-center gap-2 group/volume">
                    <button
                      onClick={handleMuteToggle}
                      className="p-2 rounded-full hover:bg-white/10 hover:text-[#ff007f] transition-colors"
                      aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
                    >
                      {isMuted || volume === 0 ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
                          />
                        </svg>
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ff007f] transition-all md:w-0 md:opacity-0 md:group-hover/volume:w-16 md:group-hover/volume:opacity-100"
                    />
                  </div>

                  {/* Fullscreen */}
                  <button
                    onClick={handleFullscreen}
                    className="p-2 rounded-full hover:bg-white/10 hover:text-[#ff007f] transition-colors"
                    aria-label="Modo tela cheia"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                      />
                    </svg>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
`;

fs.writeFileSync(outPath, code, 'utf8');
console.log(`ShowreelSection.tsx written successfully to ${outPath}`);
