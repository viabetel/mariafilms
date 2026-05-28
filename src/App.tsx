import { useRef, useState, useEffect } from 'react';
import { useScrollProgress } from './hooks/useScrollProgress';
import { ScrollytellingCanvas } from './components/ScrollytellingCanvas';
import { PortfolioSection } from './components/PortfolioSection';
import { CinematicPortal } from './components/CinematicPortal';
import { IntroLoader } from './components/IntroLoader';

function App() {
  const scrollytellingRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(scrollytellingRef);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [loaderComplete, setLoaderComplete] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [logoHover, setLogoHover] = useState(false);
  const [heroBtn1Hover, setHeroBtn1Hover] = useState(false);
  const [heroBtn2Hover, setHeroBtn2Hover] = useState(false);
  const [heroScroll, setHeroScroll] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Monitoramento da rolagem do Hero (de 0 a 100vh)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = window.innerHeight;
      const progressValue = Math.min(Math.max(scrollY / threshold, 0), 1);
      setHeroScroll(progressValue);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Monitoramento do tamanho da tela para comportamento mobile responsivo
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Processamento dinâmico para remover o fundo escuro do logotipo
  useEffect(() => {
    const img = new Image();
    img.src = '/logo.jpg';
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setLogoUrl('/logo.jpg');
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Torna o fundo escuro (cinza/preto) completamente transparente
        if (r < 75 && g < 75 && b < 75) {
          data[i + 3] = 0;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      setLogoUrl(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      setLogoUrl('/logo.jpg');
    };
  }, []);

  return (
    <>
      {/* Cinematic intro loader screen */}
      {!loaderComplete && <IntroLoader onComplete={() => setLoaderComplete(true)} />}

      {/* Persistent Navbar overlay - Transparent Premium Glassmorphism & Neon details */}
      <nav className={`fixed z-30 px-4 md:px-10 pt-4 md:pt-6 top-0 left-0 right-0 flex items-center justify-between gap-4 pointer-events-none`}>
        {/* Logotipo transparente no cabeçalho com efeito de vidro */}
        <div 
          onMouseEnter={() => setLogoHover(true)}
          onMouseLeave={() => setLogoHover(false)}
          className={`flex items-center justify-center rounded-full transition-all duration-300 pointer-events-auto border ${
            isMobile ? 'px-4 py-2 min-h-[48px]' : 'px-6 py-3.5 min-h-[72px]'
          }`}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderColor: logoHover ? 'rgba(255, 0, 127, 0.4)' : 'rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          }}
        >
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="maria eduarda logo" 
              className={`${isMobile ? 'h-8' : 'h-14'} w-auto select-none filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.25)]`} 
            />
          ) : (
            <span className="text-white text-xs md:text-sm font-normal tracking-tight py-1 px-3">maria films</span>
          )}
        </div>

        {/* Menu central do header com efeito de vidro */}
        <div 
          className="hidden md:flex items-center gap-1 rounded-full px-4 py-3 border pointer-events-auto transition-all duration-300"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          }}
        >
          <a
            href="#films"
            className="text-neutral-300 hover:text-[#ff007f] transition-colors text-base px-6 py-2.5 rounded-full font-medium"
          >
            filmes
          </a>
          <a
            href="#about"
            className="text-neutral-300 hover:text-[#ff007f] transition-colors text-base px-6 py-2.5 rounded-full font-medium"
          >
            sobre
          </a>
          <a
            href="#services"
            className="text-neutral-300 hover:text-[#ff007f] transition-colors text-base px-6 py-2.5 rounded-full font-medium"
          >
            serviços
          </a>
          <a
            href="#contact"
            className="text-neutral-300 hover:text-[#ff007f] transition-colors text-base px-6 py-2.5 rounded-full font-medium"
          >
            contato
          </a>
        </div>

        {/* Botão de ação à direita com vidro transparente e hover neon */}
        <button 
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          className={`rounded-full font-medium transition-all duration-300 pointer-events-auto border hover:scale-102 ${
            isMobile ? 'px-5 py-2.5 text-xs' : 'px-8 py-4 text-base'
          }`}
          style={{
            backgroundColor: btnHover ? 'rgba(255, 0, 127, 0.2)' : 'rgba(255, 255, 255, 0.06)',
            color: '#ffffff',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderColor: btnHover ? '#ff007f' : 'rgba(255, 255, 255, 0.15)',
            boxShadow: btnHover ? '0 0 25px rgba(255, 0, 127, 0.4)' : '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          }}
        >
          vamos conversar
        </button>
      </nav>

      {/* Hero Container com Parallax de subida e fade de conteúdo */}
      <div className="relative w-full h-screen bg-black z-10">
        {heroScroll < 1 && (
          <section 
            className="fixed inset-0 w-full h-screen overflow-hidden bg-black flex items-center pt-24 pb-12"
            style={{
              pointerEvents: heroScroll >= 0.85 ? 'none' : 'auto',
            }}
          >
            {/* Imagem da Câmera: posicionamento nativo à direita, sem cortes ou zoom */}
            <div 
              className="absolute inset-y-0 right-0 w-full md:w-[50%] h-full flex items-center justify-center md:justify-end pointer-events-none z-0"
              style={{
                opacity: (isMobile ? 0.35 : 0.9 - heroScroll * 1.5) * (1 - heroScroll),
                transform: `scale(${1 - heroScroll * 0.05}) translateY(${heroScroll * (isMobile ? 15 : 30)}px)`,
                transition: 'opacity 0.05s ease-out, transform 0.05s ease-out',
              }}
            >
              <img
                src="/hero_camera.webp"
                alt="Canon EOS-1 Ds"
                className="w-full max-w-[450px] md:max-w-none md:h-[72vh] md:w-auto object-contain opacity-70 md:opacity-90 transition-opacity duration-700"
                style={{ 
                  mixBlendMode: 'screen', 
                  filter: 'contrast(1.1) brightness(0.95)',
                  maxHeight: '100%',
                  maxWidth: '100%'
                }}
              />
            </div>

            {/* Conteúdo do Hero: Alinhamento assimétrico de luxo */}
            <div 
              className="relative z-10 container mx-auto px-6 md:px-12 w-full flex flex-col md:flex-row items-center gap-12 min-h-[80vh]"
              style={{
                opacity: 1 - heroScroll * 2,
                transform: `translateY(-${heroScroll * (isMobile ? 40 : 80)}px)`,
                transition: 'opacity 0.05s ease-out, transform 0.05s ease-out',
              }}
            >
              {/* Lado Esquerdo: Tipografia e painel de ações em vidro */}
              <div className="w-full md:w-[60%] flex flex-col gap-8 items-start text-left pointer-events-auto">
                
                {/* Tagline com foto pequena estilo portfólio premium */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-white/12 bg-neutral-900 flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <img 
                      src="/maria_portrait.png" 
                      alt="Maria Eduarda" 
                      className="w-full h-full object-cover object-[center_20%]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] tracking-[0.25em] text-neutral-300 uppercase font-semibold font-display-tech">
                        maria films
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#ff007f] shadow-[0_0_6px_#ff007f] animate-pulse" />
                    </div>
                    <span className="text-[8px] text-neutral-500 uppercase font-display-tech tracking-widest mt-0.5">
                      direção por maria eduarda
                    </span>
                  </div>
                </div>

                {/* Título Principal com tipografia mista Apple/Figma/Sony */}
                <div className="flex flex-col select-none tracking-tight leading-[0.82] gap-1">
                  <span className="font-serif-editorial italic text-[11vw] md:text-[6vw] font-light text-neutral-400 lowercase leading-[0.9]">
                    esculpindo
                  </span>
                  <span className="font-display-tech font-extrabold text-[13vw] md:text-[7.5vw] uppercase tracking-tighter text-white leading-[0.82]">
                    o tempo.
                  </span>
                </div>

                {/* Card de CTA com vidro translúcido premium */}
                <div 
                  className="w-full max-w-md border rounded-2xl p-6 md:p-8 transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    borderColor: 'rgba(255, 255, 255, 0.07)',
                    boxShadow: '0 16px 45px 0 rgba(0, 0, 0, 0.6)',
                  }}
                >
                  <p className="text-xs md:text-[13px] text-neutral-400 leading-relaxed lowercase mb-6">
                    transformamos visões brutas em narrativas cinematográficas de alto impacto. esculpimos cada corte com rigor estético, ritmo cirúrgico e ressonância emocional.
                  </p>

                  {/* Botões Glassmorphism de alta costura */}
                  <div className="flex flex-col sm:flex-row gap-3.5 w-full">
                    {/* Botão de Destaque com seta deslizante */}
                    <a
                      href="#films"
                      onMouseEnter={() => setHeroBtn1Hover(true)}
                      onMouseLeave={() => setHeroBtn1Hover(false)}
                      className="flex-1 flex items-center justify-between border rounded-full h-12 pl-5 pr-1.5 transition-all duration-300 text-[10px] uppercase tracking-wider font-semibold font-display-tech relative group overflow-hidden"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderColor: heroBtn1Hover ? 'rgba(255, 0, 127, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        boxShadow: heroBtn1Hover ? '0 0 25px rgba(255, 0, 127, 0.25)' : 'none',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                      }}
                    >
                      <span>ver portfólio</span>
                      <div 
                        className="w-8 h-8 rounded-full bg-[#ff007f] flex items-center justify-center transition-all duration-300"
                        style={{
                          transform: heroBtn1Hover ? 'translateX(2px)' : 'none',
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-white">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </div>
                    </a>
                    
                    {/* Botão secundário de contorno de vidro */}
                    <a
                      href="#contact"
                      onMouseEnter={() => setHeroBtn2Hover(true)}
                      onMouseLeave={() => setHeroBtn2Hover(false)}
                      className="flex-1 flex items-center justify-center border rounded-full h-12 px-5 transition-all duration-300 text-[10px] uppercase tracking-wider font-semibold font-display-tech"
                      style={{
                        backgroundColor: heroBtn2Hover ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                        borderColor: heroBtn2Hover ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                      }}
                    >
                      <span>iniciar projeto</span>
                    </a>
                  </div>
                </div>

              </div>

              {/* Espaçador para empurrar o layout no desktop */}
              <div className="hidden md:block w-full md:w-[40%] pointer-events-none" />
            </div>

            {/* Linha de Estatísticas e Indicador de Scroll no Rodapé do Hero */}
            <div 
              className="absolute bottom-6 left-0 right-0 z-10 w-full px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 pointer-events-none"
              style={{
                opacity: 1 - heroScroll * 2.5,
                transition: 'opacity 0.05s ease-out',
              }}
            >
              {/* Estatísticas Mobile */}
              <div className="md:hidden grid grid-cols-3 gap-2 w-full border-t border-white/5 pt-4 pointer-events-auto">
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white leading-none font-display-tech">+85</span>
                  <span className="text-[8px] text-neutral-500 uppercase tracking-widest mt-1 font-display-tech">filmes</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white leading-none font-display-tech">+45m</span>
                  <span className="text-[8px] text-neutral-500 uppercase tracking-widest mt-1 font-display-tech">views</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-[#ff007f] leading-none font-display-tech">+12</span>
                  <span className="text-[8px] text-neutral-500 uppercase tracking-widest mt-1 font-display-tech">prêmios</span>
                </div>
              </div>

              {/* Estatísticas Desktop Esquerda */}
              <div className="hidden md:flex flex-col items-start pointer-events-auto group/stat cursor-default">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold font-display-tech tracking-tight text-white transition-all duration-300 group-hover/stat:text-[#ff007f]">+85</span>
                  <span className="h-px w-8 bg-white/10" />
                  <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-display-tech">filmes finalizados</span>
                </div>
              </div>

              {/* Indicador de Rolar (Scroll) */}
              <div className="hidden md:flex flex-col items-center gap-1.5 opacity-40">
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-display-tech">scroll</span>
                <div className="w-4 h-7 border border-white/20 rounded-full flex justify-center p-1">
                  <div className="w-1 h-1.5 bg-white rounded-full animate-bounce" />
                </div>
              </div>

              {/* Estatísticas Desktop Direita */}
              <div className="hidden md:flex flex-col items-end pointer-events-auto group/stat cursor-default">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-display-tech">visualizações geradas</span>
                  <span className="h-px w-8 bg-white/10" />
                  <span className="text-2xl font-bold font-display-tech tracking-tight text-white transition-all duration-300 group-hover/stat:text-[#ff007f]">+45m</span>
                </div>
              </div>
            </div>

            {/* Degradê de fundo escuro para fusão com a próxima seção */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black z-10" />
          </section>
        )}
      </div>

      {/* Scrollytelling Section */}
      <section ref={scrollytellingRef} className="relative h-[300vh] bg-black z-20">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          {/* Canvas Background driven by scroll progress scrubbing through rotating camera */}
          <ScrollytellingCanvas
            scrollProgress={progress}
            frameCount={130}
          />

          {/* Textos sobrepostos sequenciais (Visão, Produção e Execução) */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            {/* Passo 1: visão */}
            <div
              className="absolute transition-all duration-300 ease-out flex flex-col items-center text-center px-6"
              style={{
                opacity: progress > 0.05 && progress < 0.35 ? 1 : 0,
                transform: `translateY(${(0.2 - progress) * (isMobile ? 60 : 150)}px)`,
              }}
            >
              <span className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] mb-3 block font-display-tech font-semibold">01 // visão</span>
              <h2 className="hero-title text-white font-medium text-[8vw] md:text-[6vw] tracking-tight leading-none lowercase">
                narrativas cinematográficas
              </h2>
              <p className="max-w-[440px] text-xs md:text-sm text-white/70 mt-4 leading-relaxed lowercase">
                desenhando profundidade visual através de iluminação precisa, composição geométrica e ressonância emocional. cada frame é planejado como uma obra de arte única.
              </p>
            </div>

            {/* Passo 2: produção */}
            <div
              className="absolute transition-all duration-300 ease-out flex flex-col items-center text-center px-6"
              style={{
                opacity: progress >= 0.35 && progress < 0.65 ? 1 : 0,
                transform: `translateY(${(0.5 - progress) * (isMobile ? 60 : 150)}px)`,
              }}
            >
              <span className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] mb-3 block font-display-tech font-semibold">02 // produção</span>
              <h2 className="hero-title text-white font-medium text-[8vw] md:text-[6vw] tracking-tight leading-none lowercase">
                direção criativa
              </h2>
              <p className="max-w-[440px] text-xs md:text-sm text-white/70 mt-4 leading-relaxed lowercase">
                traduzindo ideias conceituais em narrativas de tela impactantes. direção completa de atores e equipe, do roteiro técnico ao corte final de montagem.
              </p>
            </div>

            {/* Passo 3: execução */}
            <div
              className="absolute transition-all duration-300 ease-out flex flex-col items-center text-center px-6"
              style={{
                opacity: progress >= 0.65 && progress < 0.95 ? 1 : 0,
                transform: `translateY(${(0.8 - progress) * (isMobile ? 60 : 150)}px)`,
              }}
            >
              <span className="text-neutral-500 text-[10px] uppercase tracking-[0.3em] mb-3 block font-display-tech font-semibold">03 // execução</span>
              <h2 className="hero-title text-white font-medium text-[8vw] md:text-[6vw] tracking-tight leading-none lowercase">
                pós-produção
              </h2>
              <p className="max-w-[440px] text-xs md:text-sm text-white/70 mt-4 leading-relaxed lowercase">
                colorização meticulosa (color grading), design de som imersivo (sound design) e ritmo cirúrgico. lapidamos sequências brutas em peças que marcam gerações.
              </p>
            </div>
          </div>

          {/* Indicador de progresso do Scroll com percentual em tempo real (em rosa choque) */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20">
            <span className="text-[10px] text-neutral-500 tracking-wider font-display-tech">01</span>
            <div className="h-[2px] w-24 bg-neutral-900 relative rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-[#ff007f] transition-all duration-75"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-500 tracking-wider font-display-tech">03</span>
            <span className="text-[10px] text-neutral-400 font-display-tech tracking-widest ml-1 opacity-80">
              ({Math.round(progress * 100)}%)
            </span>
          </div>
        </div>
      </section>

      {/* Seção de Portfólio Expansível */}
      <PortfolioSection />

      {/* Cinematic Portal Scroll Section */}
      <CinematicPortal />
    </>
  );
}

export default App;
