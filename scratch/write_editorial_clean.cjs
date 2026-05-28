const fs = require('fs');

const outPath = 'c:\\Users\\Nicácio\\Documents\\GitHub\\mariafilms\\src\\components\\EditorialSection.tsx';

const code = `export function EditorialSection() {
  return (
    <section id="about" className="relative h-screen w-full bg-white text-black overflow-hidden flex items-center snap-start snap-always py-12 px-6 md:px-16 z-20">
      {/* Background Subtle Geometrical Lines */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:6rem_6rem] pointer-events-none" />

      {/* Main Content Grid */}
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 w-full max-w-6xl relative z-10">
        
        {/* Left Column: Black & White Grayscale Portrait */}
        <div className="w-full md:w-[42%] flex justify-center">
          <div className="border border-black/10 p-2 md:p-3 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] rounded-2xl hover:rotate-1 hover:scale-[1.01] transition-all duration-500 ease-in-out group">
            <div className="overflow-hidden rounded-xl h-[38vh] md:h-[52vh] w-[75vw] md:w-[360px] max-w-full">
              <img
                src="/maria_portrait.png"
                alt="Maria Eduarda portrait"
                className="w-full h-full object-cover object-[center_20%] grayscale contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Profile & Biography */}
        <div className="w-full md:w-[58%] flex flex-col gap-6 text-left">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] tracking-[0.3em] font-display-tech text-neutral-500 uppercase font-semibold">
              [ perfil editorial // maria eduarda ]
            </span>
            <div className="w-8 h-[1px] bg-[#ff007f]" />
          </div>

          <h2 className="font-serif-editorial italic text-3xl md:text-5xl leading-tight text-neutral-800 lowercase">
            o cinema não é sobre registrar o real, é sobre{' '}
            <span className="font-bold text-black font-serif-editorial not-italic">
              capturar a alma da luz
            </span>{' '}
            e esculpir o silêncio do tempo.
          </h2>

          <p className="text-xs md:text-[13px] text-neutral-600 leading-relaxed font-sans lowercase max-w-xl">
            diretora de cena e filmmaker independente. maria eduarda atua de forma autónoma, conduzindo cada projeto com uma visão singular e controle pessoal de cada etapa – desde a concepção visual e captação até a montagem final. sua abordagem foca na intimidade da cena, na textura da luz natural e na entrega de narrativas com assinatura autoral marcante.
          </p>

          {/* Elegant signature block */}
          <div className="font-serif-editorial italic text-2xl text-black select-none pl-3 border-l border-[#ff007f]/40 py-0.5">
            maria eduarda.
          </div>

          {/* Technical Metadata specs box */}
          <div className="grid grid-cols-2 gap-6 border-t border-black/10 pt-6 mt-2 text-[10px] font-display-tech uppercase text-neutral-400 tracking-wider">
            <div className="flex flex-col gap-2">
              <span className="text-black font-bold tracking-widest text-[11px] font-display-tech">frentes //</span>
              <span>captação & videomaking</span>
              <span>edição de vídeo (social)</span>
              <span>roteiro & estratégia</span>
            </div>
            <div className="flex flex-col gap-2 border-l border-black/10 pl-6">
              <span className="text-black font-bold tracking-widest text-[11px] font-display-tech">estética //</span>
              <span>luz prática & dinâmica</span>
              <span>ritmo ágil & ganchos</span>
              <span>sound design moderno</span>
            </div>
          </div>
        </div>

      </div>

      {/* Technical HUD Watermark Details (Bottom Borders) */}
      <div className="absolute bottom-6 left-6 md:left-10 z-10 text-[9px] font-display-tech tracking-[0.2em] text-neutral-400 uppercase select-none pointer-events-none">
        about // autonomous_filmmaker
      </div>
      <div className="absolute bottom-6 right-6 md:right-10 z-10 text-[9px] font-display-tech tracking-[0.2em] text-neutral-400 uppercase select-none pointer-events-none">
        loc // independence_focus
      </div>
    </section>
  );
}
`;

fs.writeFileSync(outPath, code, 'utf8');
console.log(`EditorialSection.tsx written successfully to ${outPath}`);
