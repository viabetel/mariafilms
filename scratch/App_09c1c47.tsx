import { useRef, useState, useEffect } from 'react';
import { useScrollProgress } from './hooks/useScrollProgress';
import { ScrollytellingCanvas } from './components/ScrollytellingCanvas';
import { PortfolioSection } from './components/PortfolioSection';
import { CinematicPortal } from './components/CinematicPortal';

function App() {
  const scrollytellingRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(scrollytellingRef);
  const [logoUrl, setLogoUrl] = useState<string>('');

  // Processamento dinâmico para remover o fundo off-white do logotipo
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

      // Identifica a cor do fundo a partir do pixel superior esquerdo
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const diffR = Math.abs(r - bgR);
        const diffG = Math.abs(g - bgG);
        const diffB = Math.abs(b - bgB);

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;

        // Torna o fundo transparente enquanto preserva detalhes brancos puros (como texto e câmera)
        if ((diffR < 18 && diffG < 18 && diffB < 18) || (max >= 225 && max <= 251 && diff < 8)) {
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
      {/* Persistent Navbar overlay - Larger Buttons, Strong Glassmorphism, Hot Pink details */}
      <nav className="fixed z-30 px-6 md:px-10 pt-6 top-0 left-0 right-0 flex items-center justify-between gap-4">
        {/* Logotipo transparente no cabeçalho */}
        <div className="flex items-center bg-white/10 backdrop-blur-2xl rounded-full px-6 py-3.5 min-h-[72px] justify-center border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.8)] transition-all duration-300 hover:border-[#ff007f]/40">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="maria eduarda logo" 
              className="h-14 w-auto select-none filter drop-shadow-[0_2px_10px_rgba(255,255,255,0.25)]" 
            />
          ) : (
            <span className="text-white text-sm font-normal tracking-tight py-1 px-3">maria films</span>
          )}
        </div>

        {/* Menu central do header */}
        <div className="hidden md:flex items-center gap-1 bg-white/10 backdrop-blur-2xl rounded-full px-4 py-3 border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
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

        {/* Botão de ação à direita */}
        <button className="bg-white/10 backdrop-blur-2xl border border-white/20 text-white text-base font-normal tracking-tight rounded-full px-8 py-4 hover:bg-white/20 hover:border-[#ff007f]/50 hover:shadow-[0_0_20px_rgba(255,0,127,0.3)] transition-all duration-300">
          vamos conversar
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden bg-black z-10">
        {/* Grainy, moody background image set as Hero */}
        <img
          src="/hero_bg.png"
          alt="maria films background"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />

        {/* Conteúdo sobreposto do Hero */}
        <div className="relative z-10 h-full w-full">
          {/* Três palavras-chave escalonadas */}
          <h1 className="hero-title absolute text-white font-medium text-[14vw] md:text-[13vw] left-4 md:left-10 top-[18%]">
            capture
          </h1>
          <h1 className="hero-title absolute text-white font-medium text-[14vw] md:text-[13vw] right-4 md:right-10 top-[38%]">
            sua
          </h1>
          <h1 className="hero-title absolute text-white font-medium text-[14vw] md:text-[13vw] left-[18%] md:left-[28%] top-[58%]">
            história
          </h1>

          {/* Parágrafo de descrição */}
          <p className="absolute left-6 md:left-10 top-[46%] max-w-[240px] text-[15px] leading-snug text-white/90">
            capturamos narrativas visuais com a máxima precisão, dando poder para sua história inspirar em qualquer lugar
          </p>

          {/* Bloco de estatística - Superior Direito */}
          <div className="absolute right-6 md:right-24 top-[14%] flex flex-col items-end group/stat cursor-default">
            <div className="flex items-center gap-3 justify-end">
              <span className="hidden md:block h-px w-24 bg-white/40 transform rotate-[20deg]" />
              <span className="text-4xl md:text-5xl font-medium tracking-tight text-white transition-all duration-300 group-hover/stat:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">+85</span>
            </div>
            <div className="text-xs md:text-sm text-white/70 mt-1 text-right">
              filmes finalizados
            </div>
          </div>

          {/* Bloco de estatística - Inferior Esquerdo */}
          <div className="absolute left-6 md:left-20 bottom-20 md:bottom-24 flex flex-col items-start group/stat cursor-default">
            <div className="flex items-center gap-3">
              <span className="text-4xl md:text-5xl font-medium tracking-tight text-white transition-all duration-300 group-hover/stat:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">+45m</span>
              <span className="hidden md:block h-px w-24 bg-white/40 transform -rotate-[20deg]" />
            </div>
            <div className="text-xs md:text-sm text-white/70 mt-1">
              visualizações geradas
            </div>
          </div>

          {/* Bloco de estatística - Inferior Direito */}
          <div className="absolute right-6 md:right-20 bottom-16 md:bottom-20 flex flex-col items-end group/stat cursor-default">
            <div className="flex items-center gap-3 justify-end">
              <span className="hidden md:block h-px w-24 bg-white/40 transform -rotate-[20deg]" />
              <span className="text-4xl md:text-5xl font-medium tracking-tight text-white transition-all duration-300 group-hover/stat:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">+12</span>
            </div>
            <div className="text-xs md:text-sm text-white/70 mt-1 text-right">
              prêmios recebidos
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 z-15 opacity-60">
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-mono">scroll</span>
            <div className="w-5 h-8 border border-white/30 rounded-full flex justify-center p-1">
              <div className="w-1 h-2 bg-white rounded-full animate-bounce" />
            </div>
          </div>
        </div>

        {/* Degradê preto na parte inferior */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-black z-15" />
      </section>

      {/* Scrollytelling Section */}
      <section ref={scrollytellingRef} className="relative h-[300vh] bg-black z-20">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          {/* Canvas Background driven by scroll progress scrubbing through rotating camera */}
          <ScrollytellingCanvas
            scrollProgress={progress}
            frameCount={259}
          />

          {/* Textos sobrepostos sequenciais (Visão, Produção e Execução) */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            {/* Passo 1: visão */}
            <div
              className="absolute transition-all duration-300 ease-out flex flex-col items-center text-center px-6"
              style={{
                opacity: progress > 0.05 && progress < 0.35 ? 1 : 0,
                transform: `translateY(${(0.2 - progress) * 150}px)`,
              }}
            >
              <span className="text-neutral-500 text-xs uppercase tracking-[0.2em] mb-3 block font-mono">01 // visão</span>
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
                transform: `translateY(${(0.5 - progress) * 150}px)`,
              }}
            >
              <span className="text-neutral-500 text-xs uppercase tracking-[0.2em] mb-3 block font-mono">02 // produção</span>
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
                transform: `translateY(${(0.8 - progress) * 150}px)`,
              }}
            >
              <span className="text-neutral-500 text-xs uppercase tracking-[0.2em] mb-3 block font-mono">03 // execução</span>
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
            <span className="text-[10px] text-neutral-500 tracking-wider font-mono">01</span>
            <div className="h-[2px] w-24 bg-neutral-900 relative rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-[#ff007f] transition-all duration-75"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-neutral-500 tracking-wider font-mono">03</span>
            <span className="text-[10px] text-neutral-400 font-mono tracking-widest ml-1 opacity-80">
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
