interface ProjectItem {
  id: string;
  num: string;
  category: string;
  title: string;
  description: string;
  image: string;
  details: string[];
}

const projects: ProjectItem[] = [
  {
    id: 'narrative',
    num: '01 // narrativa',
    category: 'cinematografia',
    title: 'filmes autorais',
    description: 'criando universos de ficção imersivos, com foco em desenvolvimento de personagens e estética profunda.',
    image: '/cinematic_narrative.png',
    details: ['ano: 2025', 'direção: maria eduarda', 'formato: curta-metragem', 'status: premiado'],
  },
  {
    id: 'commercial',
    num: '02 // comercial',
    category: 'marcas',
    title: 'filmes publicitários',
    description: 'direção de cena e fotografia de alto impacto para marcas, destacando a essência do produto com dinamismo.',
    image: '/commercial_films.png',
    details: ['clientes: audi, vogue', 'serviços: dir. de fotografia', 'formato: campanha digital', 'ano: 2026'],
  },
  {
    id: 'documentary',
    num: '03 // documentário',
    category: 'vida real',
    title: 'documentários',
    description: 'capturando a verdade humana com luz natural, focado em emoções reais, texturas e atmosferas autênticas.',
    image: '/documentary_stories.png',
    details: ['ano: 2025', 'produção: independente', 'captação: luz natural', 'áudio: som direto'],
  },
];

export function PortfolioSection() {
  return (
    <section className="relative bg-black w-full py-24 px-6 md:px-10 flex flex-col gap-12 z-20">
      {/* Section Header */}
      <div className="flex flex-col gap-2">
        <span className="text-neutral-500 text-xs uppercase tracking-widest">portfólio selecionado</span>
        <h2 className="hero-title text-white font-medium text-[8vw] md:text-[5vw] leading-none lowercase">
          trabalhos recentes
        </h2>
      </div>

      {/* Expanding Accordion Panels */}
      <div className="flex flex-col md:flex-row h-[120vh] md:h-[65vh] gap-4 w-full">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group flex-1 h-full overflow-hidden relative rounded-2xl transition-all duration-700 ease-in-out cursor-pointer hover:flex-[2.5] md:hover:flex-[3.5] bg-neutral-900 border border-white/5"
          >
            {/* Background Image with Hover Transition */}
            <img
              src={project.image}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover opacity-40 transition-all duration-700 ease-in-out grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-60"
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

            {/* Content Container */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
              {/* Top part: Number and Hover Play Button */}
              <div className="flex justify-between items-start">
                <span className="text-white/30 text-xs font-normal tracking-wider uppercase">
                  {project.num}
                </span>
                
                {/* Floating Play Button with Hot Pink Glow on Hover */}
                <div className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 border border-white/20 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-[#ff007f] hover:text-white hover:border-[#ff007f] hover:shadow-[0_0_15px_rgba(255,0,127,0.4)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4 fill-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z"
                    />
                  </svg>
                </div>
              </div>

              {/* Bottom part: Labels and Expanding Descriptions */}
              <div className="flex flex-col gap-1">
                <span className="text-neutral-400 text-xs uppercase tracking-widest">
                  {project.category}
                </span>
                <h3 className="hero-title text-white text-2xl md:text-3xl font-medium tracking-tight leading-none lowercase">
                  {project.title}
                </h3>
                
                {/* Expanding Description */}
                <p className="text-neutral-400 text-xs md:text-sm max-w-md mt-2 leading-relaxed opacity-0 max-h-0 overflow-hidden transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:max-h-20 lowercase">
                  {project.description}
                </p>

                {/* Meta details revealed on hover */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 opacity-0 max-h-0 overflow-hidden transition-all duration-700 ease-in-out group-hover:opacity-70 group-hover:max-h-16 text-[10px] font-mono text-neutral-400 border-t border-white/10 pt-2">
                  {project.details.map((detail, idx) => (
                    <span key={idx} className="lowercase">
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
