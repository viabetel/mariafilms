import { useRef, useState, useEffect } from 'react';

// More dramatic jagged tear with deeper amplitude for realism
const topClip = 'polygon(0 0, 100% 0, 100% 48%, 96% 52%, 92% 47%, 88% 54%, 84% 46%, 80% 53%, 76% 48%, 72% 55%, 68% 45%, 64% 52%, 60% 47%, 56% 54%, 52% 46%, 48% 53%, 44% 48%, 40% 55%, 36% 45%, 32% 52%, 28% 47%, 24% 54%, 20% 46%, 16% 53%, 12% 48%, 8% 55%, 4% 47%, 0 51%)';
const bottomClip = 'polygon(0 51%, 4% 47%, 8% 55%, 12% 48%, 16% 53%, 20% 46%, 24% 54%, 28% 47%, 32% 52%, 36% 45%, 40% 55%, 44% 48%, 48% 53%, 52% 46%, 56% 54%, 60% 47%, 64% 52%, 68% 45%, 72% 55%, 76% 48%, 80% 53%, 84% 46%, 88% 54%, 92% 47%, 96% 52%, 100% 48%, 100% 100%, 0 100%)';

export function ShowreelSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef1 = useRef<HTMLVideoElement>(null);
  const bgVideoRef2 = useRef<HTMLVideoElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Direct DOM Refs for high-performance scroll interpolation
  const topHalfRef = useRef<HTMLDivElement>(null);
  const topHalfContentRef = useRef<HTMLDivElement>(null);
  const topGlowRef = useRef<HTMLDivElement>(null);
  const bottomHalfRef = useRef<HTMLDivElement>(null);
  const bottomHalfContentRef = useRef<HTMLDivElement>(null);
  const bottomGlowRef = useRef<HTMLDivElement>(null);
  const hudRef1 = useRef<HTMLDivElement>(null);
  const hudRef2 = useRef<HTMLDivElement>(null);
  const hudRef3 = useRef<HTMLDivElement>(null);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const isOpenRef = useRef(isOpen);

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

  const lockRef = useRef(false);

  // Gentle entry snap — only locks section to viewport top when entering
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (isOpen) return;
      if (lockRef.current) {
        e.preventDefault();
        return;
      }

      const rect = container.getBoundingClientRect();
      const delta = e.deltaY;

      // Snap to top when section is entering viewport from below
      if (delta > 0 && rect.top > 2 && rect.top < window.innerHeight * 0.45) {
        e.preventDefault();
        lockRef.current = true;
        window.scrollTo({
          top: window.scrollY + rect.top,
          behavior: 'smooth'
        });
        setTimeout(() => { lockRef.current = false; }, 600);
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isOpen) return;
      if (lockRef.current) {
        e.preventDefault();
        return;
      }

      const rect = container.getBoundingClientRect();
      const deltaY = touchStartY - e.touches[0].clientY;
      if (Math.abs(deltaY) < 20) return;

      // Snap to top when section is entering viewport
      if (deltaY > 0 && rect.top > 2 && rect.top < window.innerHeight * 0.45) {
        e.preventDefault();
        lockRef.current = true;
        window.scrollTo({
          top: window.scrollY + rect.top,
          behavior: 'smooth'
        });
        setTimeout(() => { lockRef.current = false; }, 600);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isOpen]);

  const isAnimatingRef = useRef(false);

  const startCursorAnimation = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const tick = () => {
      if (!cursorRef.current) {
        isAnimatingRef.current = false;
        return;
      }

      const ease = 0.12;
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * ease;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * ease;
      
      const targetOpacity = mouseRef.current.isHovered ? 1 : 0;
      mouseRef.current.opacity += (targetOpacity - mouseRef.current.opacity) * ease;
      
      const targetScale = mouseRef.current.isHovered ? 1 : 0.5;
      mouseRef.current.scale += (targetScale - mouseRef.current.scale) * ease;

      cursorRef.current.style.transform = `translate3d(${mouseRef.current.x - 45}px, ${mouseRef.current.y - 45}px, 0) scale(${mouseRef.current.scale})`;
      cursorRef.current.style.opacity = mouseRef.current.opacity.toString();

      const isResting = !mouseRef.current.isHovered && mouseRef.current.opacity < 0.01;

      if (!isResting) {
        requestAnimationFrame(tick);
      } else {
        isAnimatingRef.current = false;
      }
    };

    requestAnimationFrame(tick);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTouchDevice) return;
    mouseRef.current.targetX = e.clientX;
    mouseRef.current.targetY = e.clientY;
    startCursorAnimation();
  };

  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    mouseRef.current.isHovered = true;
    startCursorAnimation();
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    mouseRef.current.isHovered = false;
  };

  // Passive high-performance scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const elementHeight = rect.height;
      const viewportHeight = window.innerHeight;
      const totalScrollable = elementHeight - viewportHeight;
      if (totalScrollable <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
      const splitProgress = Math.min(1, Math.max(0, (progress - 0.05) / 0.90));
      
      // Eased progress (ease-in-out cubic)
      const easedSplit = splitProgress < 0.5
        ? 4 * splitProgress * splitProgress * splitProgress
        : 1 - Math.pow(-2 * splitProgress + 2, 3) / 2;

      // 1. Update container style
      container.style.backgroundColor = splitProgress > 0.01 ? 'transparent' : '#000';
      container.style.pointerEvents = splitProgress >= 0.95 ? 'none' : 'auto';

      // 2. Update Top Half
      if (topHalfRef.current) {
        topHalfRef.current.style.transform = `translate3d(0, -${easedSplit * 115}%, 0) scale(${1 + easedSplit * 0.02})`;
      }
      if (topHalfContentRef.current) {
        topHalfContentRef.current.style.transform = `translate3d(0, ${easedSplit * 115}%, 0) scale(${1 / (1 + easedSplit * 0.02)})`;
      }

      // 3. Update Top Glow
      if (topGlowRef.current) {
        topGlowRef.current.style.transform = `translate3d(0, -${easedSplit * 115}vh, 0)`;
        topGlowRef.current.style.opacity = Math.min(1, easedSplit * 5).toString();
        if (easedSplit > 0.02) {
          topGlowRef.current.style.background = `linear-gradient(90deg, transparent, rgba(255,255,255,${0.06 + easedSplit * 0.08}), transparent)`;
          topGlowRef.current.style.boxShadow = `0 0 ${15 + easedSplit * 25}px rgba(255,255,255,${easedSplit * 0.15}), 0 0 ${40 + easedSplit * 40}px rgba(0,0,0,0.9)`;
        } else {
          topGlowRef.current.style.background = 'none';
          topGlowRef.current.style.boxShadow = 'none';
        }
      }

      // 4. Update Bottom Half
      if (bottomHalfRef.current) {
        bottomHalfRef.current.style.transform = `translate3d(0, ${easedSplit * 115}%, 0) scale(${1 + easedSplit * 0.02})`;
      }
      if (bottomHalfContentRef.current) {
        bottomHalfContentRef.current.style.transform = `translate3d(0, -${easedSplit * 115}%, 0) scale(${1 / (1 + easedSplit * 0.02)})`;
      }

      // 5. Update Bottom Glow
      if (bottomGlowRef.current) {
        bottomGlowRef.current.style.transform = `translate3d(0, ${easedSplit * 115}vh, 0)`;
        bottomGlowRef.current.style.opacity = Math.min(1, easedSplit * 5).toString();
        if (easedSplit > 0.02) {
          bottomGlowRef.current.style.background = `linear-gradient(90deg, transparent, rgba(255,255,255,${0.06 + easedSplit * 0.08}), transparent)`;
          bottomGlowRef.current.style.boxShadow = `0 0 ${15 + easedSplit * 25}px rgba(255,255,255,${easedSplit * 0.15}), 0 0 ${40 + easedSplit * 40}px rgba(0,0,0,0.9)`;
        } else {
          bottomGlowRef.current.style.background = 'none';
          bottomGlowRef.current.style.boxShadow = 'none';
        }
      }

      // 6. Update HUD Elements
      const hudOpacity = Math.max(0, 1 - easedSplit * 4).toString();
      if (hudRef1.current) hudRef1.current.style.opacity = hudOpacity;
      if (hudRef2.current) hudRef2.current.style.opacity = hudOpacity;
      if (hudRef3.current) hudRef3.current.style.opacity = hudOpacity;

      // 7. Video play/pause based on visible area and lightbox state
      const v1 = bgVideoRef1.current;
      const v2 = bgVideoRef2.current;
      const inViewport = rect.top < viewportHeight && rect.bottom > 0;
      const shouldPlay = inViewport && !isOpenRef.current && splitProgress < 0.95;

      if (v1) {
        if (shouldPlay) {
          if (v1.paused) v1.play().catch(() => {});
        } else {
          if (!v1.paused) v1.pause();
        }
      }
      if (v2) {
        if (shouldPlay) {
          if (v2.paused) v2.play().catch(() => {});
        } else {
          if (!v2.paused) v2.pause();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    // Initial call to sync styling on mount
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Sync isOpen reference and trigger update
  useEffect(() => {
    isOpenRef.current = isOpen;
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
      const v1 = bgVideoRef1.current;
      const v2 = bgVideoRef2.current;
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
      const splitProgress = Math.min(1, Math.max(0, (progress - 0.05) / 0.90));
      const shouldPlay = inViewport && !isOpen && splitProgress < 0.95;

      if (v1) {
        if (shouldPlay) v1.play().catch(() => {});
        else v1.pause();
      }
      if (v2) {
        if (shouldPlay) v2.play().catch(() => {});
        else v2.pause();
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
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && progressFillRef.current && timeTextRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 0;
      const pct = dur > 0 ? (cur / dur) * 100 : 0;
      progressFillRef.current.style.width = `${pct}%`;
      timeTextRef.current.innerHTML = `${formatTime(cur)} <span class="mx-1 text-white/20">/</span> ${formatTime(dur)}`;
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && timeTextRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 0;
      timeTextRef.current.innerHTML = `${formatTime(cur)} <span class="mx-1 text-white/20">/</span> ${formatTime(dur)}`;
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
      progressFillRef.current.style.width = `${pct * 100}%`;
      timeTextRef.current.innerHTML = `${formatTime(targetTime)} <span class="mx-1 text-white/20">/</span> ${formatTime(dur)}`;
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



  const renderContent = (bgVideoRef: React.RefObject<HTMLVideoElement | null>) => (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black">
      {/* Background video */}
      <div className="absolute inset-0 w-full h-full opacity-35 transition-opacity duration-500 ease-in-out hover:opacity-55">
        <video
          ref={bgVideoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          src="https://drive.google.com/uc?export=download&id=1zrQ_bgRuISWQnWbCaDa5fGeGi1RhneII"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />
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
    </div>
  );

  return (
    <>
      <section
        ref={containerRef}
        className="relative h-[450vh] w-full z-30"
        style={{ 
          backgroundColor: '#000',
          pointerEvents: 'auto'
        }}
      >
        <div
          className={`sticky top-0 h-screen w-full overflow-hidden bg-transparent ${
            isTouchDevice ? '' : 'cursor-none'
          }`}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleOpen}
        >
          {/* Top Half — slides up and slightly scales for depth */}
          <div
            ref={topHalfRef}
            className="absolute inset-0 w-full h-full overflow-hidden will-change-transform"
            style={{
              clipPath: topClip,
              transform: 'translate3d(0, 0%, 0) scale(1)',
            }}
          >
            <div
              ref={topHalfContentRef}
              className="absolute inset-0 w-full h-full will-change-transform"
              style={{
                transform: 'translate3d(0, 0%, 0) scale(1)',
              }}
            >
              {renderContent(bgVideoRef1)}
            </div>
          </div>

          {/* Torn edge glow line — top half */}
          <div
            ref={topGlowRef}
            className="absolute left-0 w-full pointer-events-none z-40"
            style={{
              top: 'calc(50% - 2px)',
              height: '4px',
              transform: 'translate3d(0, 0vh, 0)',
              background: 'none',
              boxShadow: 'none',
              opacity: 0,
            }}
          />

          {/* Bottom Half — slides down and slightly scales for depth */}
          <div
            ref={bottomHalfRef}
            className="absolute inset-0 w-full h-full overflow-hidden will-change-transform"
            style={{
              clipPath: bottomClip,
              transform: 'translate3d(0, 0%, 0) scale(1)',
            }}
          >
            <div
              ref={bottomHalfContentRef}
              className="absolute inset-0 w-full h-full will-change-transform"
              style={{
                transform: 'translate3d(0, 0%, 0) scale(1)',
              }}
            >
              {renderContent(bgVideoRef2)}
            </div>
          </div>

          {/* Torn edge glow line — bottom half */}
          <div
            ref={bottomGlowRef}
            className="absolute left-0 w-full pointer-events-none z-40"
            style={{
              top: 'calc(50% - 2px)',
              height: '4px',
              transform: 'translateY(0vh)',
              background: 'none',
              boxShadow: 'none',
              opacity: 0,
            }}
          />

          {/* HUD borders/headers — fade out quickly as curtain opens */}
          <div 
            ref={hudRef1}
            className="absolute top-6 left-6 md:left-10 z-30 text-[9px] font-display-tech tracking-[0.2em] text-neutral-500 uppercase select-none pointer-events-none"
            style={{ opacity: 1 }}
          >
            system // play_portfolio
          </div>
          <div 
            ref={hudRef2}
            className="absolute top-6 right-6 md:right-10 z-30 text-[9px] font-display-tech tracking-[0.2em] text-neutral-500 uppercase select-none pointer-events-none"
            style={{ opacity: 1 }}
          >
            aspect // 2.39:1
          </div>
          <div 
            ref={hudRef3}
            className="absolute bottom-6 left-6 md:left-10 z-30 text-[9px] font-display-tech tracking-[0.2em] text-neutral-500 uppercase select-none pointer-events-none"
            style={{ opacity: 1 }}
          >
            maria films // portfólio 2026
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
        </div>
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
              src="https://drive.google.com/uc?export=download&id=1zrQ_bgRuISWQnWbCaDa5fGeGi1RhneII"
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
