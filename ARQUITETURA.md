# Maria Films — Arquitetura & Guia do Projeto

> Documento de handoff para futuras sessões (Claude inclusive). Leia isto **antes**
> de mexer no projeto. Ele explica o QUE foi construído, COMO, COM QUAIS conceitos
> e QUAIS lições/regras evitam quebrar o que já funciona. Este site é a **base de
> referência** para projetos cinematográficos futuros.

---

## 0. Regras de ouro (leia primeiro)

1. **Trabalhar SOMENTE em** `C:\Users\Nicácio\Desktop\mariafilms`. NUNCA tocar em
   `C:\Users\Nicácio\Documents\mariafilms` (arquivo original intocável).
2. **O site** vive na raiz (`src/`, `public/`, `index.html`, configs). O **vídeo
   Remotion** é um subprojeto isolado em `remotion/` — NÃO confundir os dois.
3. **Mostrar a ideia antes de codar** quando for um conceito novo arriscado. Já
   tomamos um "não" forte (ver §9, lição do palco de teatro). O tom é
   **sóbrio, editorial, cinematográfico** — nada infantil/gimmick.
4. **Validar sempre**: `npx tsc --noEmit -p tsconfig.app.json` e `npm run build`.
   O bundler (Vite) NÃO checa tipos sozinho.
5. **Sem git** configurado no projeto por padrão; não inventar commits.

---

## 1. O que é o projeto

Site institucional/portfólio de **Maria Eduarda** ("Maria Films") — diretora,
fotógrafa e creator (videomaker + fotografia + "storymaker"). Posicionamento
**híbrido**: filmmaker para marcas/eventos **e** figura de redes sociais.

Objetivo do site: levar o visitante de **"uau" → "confio" → "quero contratar"**
através de uma experiência que parece **uma peça de cinema navegável**, não uma
página rolando. A tese da marca: **"esculpindo o tempo"** — ela não registra o
momento, ela o esculpe.

---

## 2. Stack & versões

- **Vite 8** + **React 19** + **TypeScript** + **Tailwind CSS 3.4**
- **GSAP 3.15** (`gsap`) + `@gsap/react` (`useGSAP`) — plugins **ScrollTrigger,
  SplitText, Flip** (todos gratuitos desde a GSAP 3.13 / aquisição pela Webflow)
- **Lenis 1.3** — smooth scroll inercial
- `lucide-react` está instalado mas atualmente **não é usado** (resquício)
- Node 20, npm 10. `package.json name`: `maria-films` (no zip) / `securify` (local legado, irrelevante)

### Rodar / build / deploy
```
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build  -> /dist
```
**Vercel**: importar o repo -> preset **Vite** (auto) -> Build `npm run build` ->
Output `dist`. Existe um `maria-films-site.zip` (na Área de Trabalho) com só o
necessário pra deploy (sem node_modules/dist/remotion/fotos-fonte/tooling).

---

## 3. Estrutura de arquivos (site)

```
src/
  main.tsx                      # entry; importa index.css + App
  index.css                     # tailwind + .glass, .mask-line, grão/vinheta, reduced-motion
  App.tsx                       # ordem das seções (o "funil")
  lib/
    gsap.ts                     # registra ScrollTrigger/SplitText/Flip; importar GSAP SEMPRE daqui
    motion.ts                   # EASE, DUR, CSS_EASE, prefersReducedMotion()
    frames.ts                   # singleton de pré-carga dos 259 frames .webp
  components/
    SmoothScroll.tsx            # Lenis <-> GSAP ticker/ScrollTrigger; getLenis(); scrollToSection()
    Navbar.tsx                  # glass, esconde ao rolar, CTA magnético, wordmark "maria films"
    IntroLoader.tsx             # preload real dos frames + contagem + abertura de diafragma
    CinematicAct.tsx            # ATO CENTRAL: hero + manifesto (câmera 360 pinada)
    TransitionBridge.tsx        # ponte: o corte vira reels (fragmentação em tiras)
    SocialDepth.tsx             # prova social em 5 camadas de parallax
    Features.tsx                # #diferenciais: hover-expand + reflexo no fundo
    EssenceSection.tsx          # essência: Efeit Festa + dolly-out + frases renovando
    Portfolio.tsx               # #filmes: scrollytelling horizontal em camadas
    Editorial.tsx               # #sobre: "prazer, maria" (retrato parallax + bio humana)
    Services.tsx                # #servicos: "formatos" (entregáveis contratáveis)
    Contact.tsx                 # #contato: fecho + form->mailto + footer
public/
  frames/frame_001..259.webp    # sequência da câmera 360 (também há .jpg não usados)
  maria/                        # fotos reais: maria-1..3.jpg, work-brasil/raso/veste.jpg
  reel.webm / reel.mp4          # vídeo "Efeit Festa" (cópia limpa do arquivo original)
  favicon.svg
tailwind.config.js              # tokens (ver §5)
index.html                      # lang pt-BR, fontes Google (Instrument Serif, Sora, Plus Jakarta Sans)
```

---

## 4. Fundação técnica (a base que faz tudo "flutuar")

### 4.1 `src/lib/gsap.ts`
Registro central. **Sempre importe GSAP a partir daqui** (não de `'gsap'` direto),
garantindo plugins registrados:
```ts
import { gsap, ScrollTrigger, Flip, SplitText, useGSAP } from '../lib/gsap';
```

### 4.2 `src/lib/motion.ts`
Fonte única de easings/durações (espelha o "feeling" do showreel Remotion):
- `EASE`: `in` (power3.out), `camera` (expo.inOut), `reveal` (power4.out),
  `micro` (power2.out), `out` (power2.in)
- `DUR`: micro/base/slow/cinematic
- `CSS_EASE`: beziers equivalentes p/ CSS
- `prefersReducedMotion()`: TODA animação deve degradar p/ fade simples.

### 4.3 `src/components/SmoothScroll.tsx`
Acopla **Lenis** ao **ticker do GSAP** e ao **ScrollTrigger**:
```ts
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```
- Em `prefersReducedMotion()` o Lenis **não inicia** (scroll nativo volta).
- Exporta `getLenis()` (instância ou null) e `scrollToSection(seletor)` —
  usados pela navegação e pelo scroll-jacking do ato central.

### 4.4 `src/lib/frames.ts`
Singleton de módulo que pré-carrega os **259 frames** (`/frames/frame_NNN.webp`)
com fila de concorrência. **Compartilhado** entre o `IntroLoader` (barra de
progresso real) e o `CinematicAct` (renderização). API: `loadFrames()`,
`onFramesProgress(cb)`, `framesReady()`, `frameImages[]`, `FRAME_COUNT`.

### 4.5 `index.css`
- `.glass` — painel de vidro reutilizável (blur + borda + sombra).
- `.mask-line` — `overflow:hidden; display:block` para reveals por máscara.
- `.film-grain::after` — grão de filme global (SVG noise, animado em steps).
- `.vignette::before` — vinheta radial global **fixed** (cuidado: é global; NÃO
  reusar a classe `vignette` dentro de seções — fazer vinheta local inline).
- `@media (prefers-reduced-motion)` desliga grão/scroll-behavior.

---

## 5. Sistema de design

**Paleta** (tokens em `tailwind.config.js`):
- `ink` #000000 (fundo), `bone` #f4f1ea (creme editorial), `white` #ffffff
- `pink` #ff007f (acento — usar PONTUAL, não banhar tudo) + `pink-soft`/`pink-glow`
- neutros do Tailwind para texto secundário

**Tipografia**:
- `font-serif` / `.font-serif-editorial` -> **Instrument Serif** (itálico editorial)
- `font-tech` / `.font-display-tech` / `.hero-title` -> **Sora** (HUD/tech/extrabold)
- `font-body` -> **Plus Jakarta Sans**
- Fontes via `<link>` Google no `index.html`.

**Sombras/efeitos**: `shadow-glass`, `shadow-glass-sm`, `shadow-pink-glow`,
`backdrop-blur-glass`, `tracking-hud` (0.3em), eases `ease-in-cine`/`ease-camera`.

**Tom de voz/visual**: tudo em **lowercase**, estética **editorial + técnico +
cinema**. Muito respiro, preto absoluto, rosa pontual, vidro fosco, grão sutil.
Kickers no formato `// texto`. HUD com motivo de câmera (lente 24/50/85mm,
"camera-control // active", REC).

---

## 6. Linguagem de movimento (conceitos)

- **Scroll = câmera.** Cada rolagem deve parecer mover uma câmera, não uma página.
- **Reveal por máscara**: títulos sobem por trás de um clip (`.mask-line` + SplitText
  chars, ou yPercent num bloco). Stagger fino.
- **Parallax em profundidade**: camadas em velocidades diferentes (mais funda =
  mais lenta). Combinar `yPercent` (parallax, dirigido por scroll) com `y` (float
  idle senoidal) — **propriedades diferentes se compõem** no GSAP sem conflito.
- **Float idle**: micro-movimento senoidal contínuo p/ nada ficar 100% parado.
- **Pin + scrub**: seções-âncora "prendem" e o scroll vira progresso de timeline.
- **reduced-motion**: sempre ter caminho degradado.

---

## 7. O FLUXO (ordem das seções em `App.tsx`) — e por quê

Funil estratégico (cada seção tem um trabalho ÚNICO, sem redundância):

1. **CinematicAct** (hero + manifesto) — o "uau" + o processo/visão.
2. **TransitionBridge** — ponte temática: o filme vira conteúdo.
3. **SocialDepth** — prova social (ela produz muito / tem audiência).
4. **Features (#diferenciais)** — por que ela e não outro.
5. **EssenceSection** — batida emocional ("esculpir o tempo").
6. **Portfolio (#filmes)** — os trabalhos (prova de craft).
7. **Editorial (#sobre)** — quem é a pessoa por trás.
8. **Services (#servicos = "formatos")** — o que dá pra contratar (conversão).
9. **Contact (#contato)** — CTA final / créditos.

> Cada bloco responde a uma pergunta do visitante: *isso é bom? -> ela faz muito
> disso? -> por que ela? -> quem é ela? -> como contrato?*

Wrapper raiz: `<div className="film-grain vignette">` aplica grão + vinheta
globais. `IntroLoader` cobre tudo até os frames carregarem; depois `SmoothScroll`
envolve `Navbar` + as seções.

---

## 8. Cada componente em detalhe

### 8.1 IntroLoader
Dispara `loadFrames()`, mostra "scene 01 / take 01" + contagem 000->100% (animada
com GSAP, sem saltos), barra rosa. Ao terminar: **abertura tipo diafragma** (um
círculo escala) + fade -> `onComplete`. Em reduced-motion, completa direto.

### 8.2 Navbar
Glass; **esconde ao rolar pra baixo, revela ao subir** (ScrollTrigger onUpdate).
**CTA magnético** (`MagneticCTA`: segue o cursor via `gsap.to`, volta com
elastic). Wordmark "**maria films**" — "maria" branco + "films" rosa + ponto rosa
com glow (destaque tasteful, NÃO usar o `logo.jpg` — está feio).

### 8.3 CinematicAct (o coração)
Seção pinada (`h-[540vh]`). Uma `<canvas>` renderiza a sequência de **259 frames**
dirigida por **ScrollTrigger scrub** (timeline mestre, duração normalizada = 1).
Contém o **hero** ("esculpindo / o tempo") + **6 capítulos de manifesto**
(visão->execução) revelados por **SplitText** + **HUD** (lente 24/50/85mm, barra de
progresso). Índices gigantes **"fantasma" 3D** (`.cine-ghost`) atrás de cada
capítulo, com float idle (rotateX/Y).

**Navegação por ETAPAS (scroll-snapping discreto / "fullpage")** — o detalhe mais
delicado:
- O snap nativo do ScrollTrigger fica fraco com Lenis (a inércia nunca "para").
- Solução: interceptamos `wheel`/`touch` com **`capture: true` + `preventDefault`
  + `stopImmediatePropagation`** (rodando ANTES do Lenis, sobrepondo-o) e usamos
  `lenis.scrollTo(pontoExato, { lock: true })` para deslizar até o ponto EXATO do
  próximo/anterior capítulo (`SNAP_POINTS`).
- Filtro da "cauda inercial" do trackpad + lock entre gestos -> **um gesto = um
  capítulo**. Nas bordas, solta o controle pra sair da seção.

**Timing do reveal (bug clássico, NÃO repetir):** o stagger total do SplitText
PRECISA caber na janela do capítulo. Constantes `REVEAL_DUR`/`REVEAL_STAGGER`
calibradas pra terminar ANTES do `SNAP_POINT` (senão a frase aparece pela metade).

### 8.4 TransitionBridge
Seção pinada. Uma imagem (`work-veste`) é fatiada em **7 tiras verticais 9:16**
(cada tira = `<img>` 100vw clipada e deslocada -> juntas formam a imagem). No
scrub, as tiras se espalham (alternando para cima/baixo, rotação, fade) = "o corte
vira reels". Frase "**da tela grande / ao seu feed**". Push-in uniforme via um
`.bridge-stage` (escalar tira por tira desalinha — escalar o palco inteiro).

### 8.5 SocialDepth
Prova social em **5 camadas de parallax** (`.depth-layer` com `data-speed`):
fundo desfocado / cards de reel 9:16 / polaroids / chips de Instagram (like,
@handle, verificada) / flare. Float idle nos elementos. Headline "não é só
portfólio. é audiência." + 4 stats. (Conteúdo/números são placeholder editável.)

### 8.6 Features (#diferenciais)
4 cards. **Hover-expand**: ao passar o cursor, a foto escala (`gsap`) e uma versão
ampliada+desfocada dela toma o **fundo da seção** (reflexo ambiente). As outras
cards escurecem; a em hover se reacende (`overwrite:true` p/ evitar flicker). O
fundo só some ao sair da grade.

### 8.7 EssenceSection
Seção pinada. Vídeo **Efeit Festa** (`/reel`) ao fundo com **dolly-out**: começa
`scale 1.7 / blur 26px` e recua pra `scale 1 / blur 7px` (a "câmera afasta" e
entra em foco). Glow rosa. **4 frases se renovam** — reveladas como **frase
inteira** (sobe + fade), **NÃO** com SplitText `lines` (ver lição §9). HUD "dolly
out · efeit festa".

### 8.8 Portfolio (#filmes) — scrollytelling horizontal em camadas
`gsap.matchMedia`:
- **Desktop (>=768px)**: seção pinada; scroll vertical vira **travelling lateral**
  (a track translada X via tween `horiz`). Cada painel: foto com parallax
  (`xPercent` + `scale 1.15` p/ sempre cobrir o quadro), **número fantasma** em
  parallax oposto, texto que revela ao centralizar — tudo via
  `scrollTrigger.containerAnimation: horiz`. HUD contador `01/04` + barra.
- **Mobile**: sem pin; painéis empilham com reveal por clip-path.

### 8.9 Editorial (#sobre)
Retrato (`maria-2`) com **parallax + clip-reveal**; "**prazer, maria**" + bio
HUMANA (NÃO repetir os números já mostrados na SocialDepth) + frase-assinatura
"eu não registro o momento. eu o esculpo."

### 8.10 Services (#servicos = "formatos")
Grade de **entregáveis contratáveis**: eventos/casamentos/branded/clipes/doc/
social. NÃO confundir com o PROCESSO (que o manifesto já conta). Hover elegante
(linha rosa crescendo, seta).

### 8.11 Contact (#contato)
Fecho cinematográfico: "**vamos eternizar o seu instante**", form -> **mailto**
(`contato@mariafilms.com.br`, placeholder), e-mail direto, redes (links `#`
placeholder) e footer "esculpindo o tempo".

---

## 9. Lições aprendidas (regras que evitam refazer trabalho)

1. **SplitText `lines` mede errado antes da fonte carregar -> linhas sobrepostas.**
   Para frases que quebram em várias linhas, prefira revelar o **bloco inteiro**
   (yPercent + fade) ou usar `type: 'chars'`. Sempre rodar
   `document.fonts.ready.then(() => ScrollTrigger.refresh())`.
2. **Reveal por caractere PRECISA caber na janela** do beat (stagger total <
   duração visível) senão a frase aparece pela metade no ponto de descanso.
3. **NÃO chamar hooks (`useFloat`/`useParallax`/etc.) dentro de `.map()`** — viola
   regras de hooks. Inlinar (`Math.sin(...)`, `interpolate(...)`).
4. **Lenis + ScrollTrigger `snap` é fraco** (inércia). Para snapping discreto,
   intercepte o gesto (`capture:true` + `preventDefault`) e use `lenis.scrollTo`.
5. **`vignette`/`film-grain` são `position: fixed` (globais).** Não reusar essas
   classes dentro de seções; fazer vinheta local com gradiente inline.
6. **Push-in/zoom em imagem fatiada**: escalar o GRUPO inteiro, não cada fatia
   (origem própria desalinha as fatias).
7. **Fotos HEIC disfarçadas de `.jpeg`**: "o raso" e "se veste" eram HEIC ->
   convertidas via **WPF `BitmapDecoder` (Frames[0], frame primário)** e
   redimensionadas (~1400px) -> cópias web em `public/maria/`. Originais em
   `Desktop/mariafilms/MAria Fotos/` (subpasta `trabalhos/`).
8. **TOM**: a ideia de "palco de teatro" (cortinas/holofotes) foi **rejeitada como
   infantil/fora do tom**. Manter sóbrio e cinematográfico. Conceito novo
   arriscado -> **mostrar/descrever antes de implementar**.
9. **`logo.jpg` é feio — não usar.** A "logo" aprovada é o **wordmark de texto**
   "maria films" no header.

---

## 10. Assets

- **259 frames** `public/frames/frame_NNN.webp` — sequência de uma câmera/objeto
  girando (render 3D em fundo escuro). Há `.jpg` equivalentes que **não são
  usados** (o site usa só `.webp`).
- `public/maria/` — `maria-1.jpg`, `maria-2.jpg`, `maria-3.jpg` (retratos),
  `work-brasil.jpg`, `work-raso.jpg`, `work-veste.jpg` (trabalhos).
- `public/reel.webm` + `reel.mp4` — vídeo "Efeit Festa".

**Placeholders a trocar pelo real:** números/stats (SocialDepth, hero), posters
do portfólio (hoje usam as fotos disponíveis), e-mail de contato, links de redes.

---

## 11. Companion: vídeo Remotion (subprojeto `remotion/`)

Existe um vídeo que **demonstra este site** seção a seção: composição
**`SiteShowcase`** (~1749 frames / ~58s, 1920x1080), registrada no `Root` ao lado
do `MariaFilmsShowreel`. Cenas em `remotion/src/site/` reusam `theme`/`motion`/
`CameraRig`/`KineticTitle`/`HudOverlay`. **Remotion é frame-based e determinístico
— lá NÃO se usa GSAP/Lenis; usa `interpolate`/`spring`/Ken Burns.** Assets do site
foram copiados pra `remotion/public/`. Render:
`npx remotion render SiteShowcase out/site-showcase.mp4`.

---

## 11.5. Proposta (`/proposta`) — escolha de versão + Autentique

Rota servida por roteamento mínimo em `main.tsx` (`/proposta` → `ProposalDossier`,
lazy; `vercel.json` tem rewrite SPA → não dá 404 em link direto). É o **funil de
fechamento**: o cliente lê a proposta, escolhe a versão e o contrato é montado e
enviado para assinatura.

**A proposta é uma PÁGINA NATIVA** (toda desenhada em React — hero, planos,
calendário, processo, diferenciais), **não é PDF**. É **por cliente** (token `?c=`)
e **EXPIRA em 7 dias** (chip "válida por mais X dias"; tela de "expirada" com CTA).
O **pdf.js foi removido** (proposta não precisa renderizar PDF).

**Fluxo:** abre `/proposta?c=TOKEN` → `getProposal(token)` (nome + validade) → lê a
proposta na página → escolhe **V1/V2/V3** → **recap** atualiza → nome + CPF/CNPJ +
e-mail (validados em `validation.ts`) + consentimento LGPD → **"aceitar e gerar
contrato"**.

**Só o CONTRATO vira PDF** (WeasyPrint, gerado no aceite, moldado à versão) e vai
para assinatura via **AUTENTIQUE** — documento DISTINTO da proposta. Não há
assinatura desenhada (o `SignaturePad` foi removido).

**Arquivos** (`src/proposal/`): `ProposalDossier.tsx` (a página nativa),
`plans.ts` (V1/V2/V3 + PROCESS/DIFFS + contatos), `validation.ts` (CPF/CNPJ/e-mail),
**`api.ts` = ÚNICO ponto que pluga o backend** (`getProposal` + `requestContract`,
hoje mock).

**Backend** (esboço em `backend/`, NÃO funcional): **FastAPI** (WeasyPrint molda o
contrato por `planId` + chama a Autentique) **+ Supabase** (Postgres `proposals`/
`acceptances` + Storage de PDFs; `schema.sql`). Rotas: `GET /api/proposta/{token}`,
`POST /api/proposta/contrato`, `POST /api/webhooks/autentique`. Chave da Autentique
e service key do Supabase ficam SÓ no backend. WeasyPrint precisa Pango/Cairo →
Render/Railway/Vercel-Python (não Edge Function). Só o mock de `api.ts` muda quando
o backend existir; o front não muda mais.

---

## 12. Checklist ao retomar

- [ ] Confirmei que estou em `Desktop\mariafilms` (não Documents).
- [ ] `npm install` feito; `npm run dev` sobe em :5173.
- [ ] Li as **Regras de ouro** (§0) e as **Lições** (§9).
- [ ] Mudança nova arriscada -> descrevi a ideia ao usuário antes de codar.
- [ ] Ao terminar: `npx tsc --noEmit -p tsconfig.app.json` + `npm run build` limpos.
- [ ] Mantive o tom: lowercase, editorial, cinema, rosa pontual, sem gimmick.

---

# PARTE II — PLAYBOOK DE HABILIDADES (reutilizável em QUALQUER projeto)

> Esta parte NÃO é específica da Maria Films. É o **arsenal de técnicas** que dá
> pra reaplicar em qualquer site cinematográfico/scrollytelling. Cada receita tem:
> o que é, quando usar, o padrão de código e as armadilhas. A próxima sessão deve
> tratar isto como suas "skills" base.

## A. Setup base (a fundação de tudo)

**Stack recomendada p/ site de motion:** Vite + React + TS + Tailwind + GSAP
(`@gsap/react`) + Lenis. GSAP é grátis (todos os plugins) desde 3.13.

**Wiring Lenis <-> GSAP (copiar tal qual):**
```ts
const lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1,1.001-Math.pow(2,-10*t)), smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```
Guarde a instância num módulo e exponha `getLenis()` + `scrollTo`. Em
`prefers-reduced-motion`, NÃO instancie o Lenis. **Sempre** use `useGSAP(() => {...},
{ scope: ref })` (cleanup automático) em vez de `useEffect` solto.

## B. Pinned scrub (a base do scrollytelling)
Seção "prende" e o scroll vira progresso de uma timeline:
```ts
const tl = gsap.timeline({ scrollTrigger: {
  trigger: section, start: 'top top', end: 'bottom bottom',
  scrub: 0.6, pin: pinEl, anticipatePin: 1,
}});
tl.to(obj, { value: 1, ease: 'none', duration: 1 }, 0); // duração normalizada = 1
```
Posicione sub-tweens por frações de 0..1. `onUpdate(self)` p/ HUD/barras.

## C. Frame-sequence canvas scrub (efeito "câmera girando")
Pré-carregue N imagens; renderize a indexada pelo progresso num `<canvas>`:
```ts
const idx = Math.round(interpolate(frame_or_progress, [0,1], [0, N-1], {clamp}));
ctx.drawImage(images[idx], ... cover com devicePixelRatio ...);
```
Pré-carga com fila de concorrência (singleton de módulo) + barra de progresso real
no loader. Serve frames `.webp`. É o efeito "Apple AirPods".

## D. Scroll-snapping discreto / "fullpage" (um gesto = uma seção)
O `snap` nativo do ScrollTrigger é fraco com Lenis (inércia). Faça determinístico:
```ts
const onWheel = (e) => {
  if (!st.isActive) return;
  const dir = e.deltaY > 0 ? 1 : -1;
  const target = nearestIndex(st.progress) + dir;
  if (target < 0 || target >= POINTS.length) return; // bordas: deixa sair
  e.preventDefault(); e.stopImmediatePropagation();   // sobrepõe o Lenis
  if (!locked) lenis.scrollTo(st.start + POINTS[target]*(st.end-st.start), { lock:true, onComplete: unlock });
};
window.addEventListener('wheel', onWheel, { passive:false, capture:true });
```
`capture:true` faz rodar ANTES do Lenis. Filtre a "cauda inercial" do trackpad
(`if (now-lastT < 160 && abs <= lastAbs) return`) + lock entre gestos. Faça o
equivalente em `touchstart`/`touchmove`.

## E. SplitText reveal (sem o bug de sobreposição)
```ts
const split = new SplitText(el, { type: 'chars', linesClass: 'mask-line' });
gsap.from(split.chars, { yPercent: 110, opacity: 0, stagger: 0.02, duration: 0.8, ease: 'power4.out',
  scrollTrigger: { trigger: el, start: 'top 85%' } });
document.fonts.ready.then(() => ScrollTrigger.refresh());
```
Regras: (1) prefira `chars`; `lines` mede errado se a fonte não carregou ->
sobreposição. (2) Em timeline scrubada, o **stagger total** (`dur + stagger*(n-1)`)
PRECISA caber na janela visível do beat. (3) `.mask-line { overflow:hidden }`.
Para frase longa multi-linha, revele o **bloco inteiro** (yPercent+fade), não lines.

## F. Camadas de profundidade / parallax
```ts
gsap.utils.toArray('.layer').forEach(l => {
  const speed = Number(l.dataset.speed);
  gsap.to(l, { yPercent: -speed*40, ease:'none', scrollTrigger:{ trigger:section, start:'top bottom', end:'bottom top', scrub:true }});
});
// float idle (propriedade DIFERENTE p/ compor sem conflito):
gsap.to('.layer', { y:'+=16', duration:4, ease:'sine.inOut', yoyo:true, repeat:-1, stagger:{each:0.5, from:'random'} });
```
`yPercent` (parallax) e `y` (idle) coexistem. **NUNCA** chame hooks dentro do
`.map()` — inlinar `Math.sin(frame*spd+phase)*amp`.

## G. GSAP Flip (morph thumbnail -> lightbox)
```ts
const state = Flip.getState('.morph-target');
setActive(id);                       // re-render muda o layout/classe
useGSAP(() => { if (state) Flip.from(state, { duration:0.7, ease:'power3.inOut', absolute:true, scale:true }); }, { dependencies:[active] });
```

## H. Cursor magnético (botões/CTAs)
```ts
onMouseMove: gsap.to(el, { x:(e.clientX-cx)*0.3, y:(e.clientY-cy)*0.4, duration:0.5 });
onMouseLeave: gsap.to(el, { x:0, y:0, ease:'elastic.out(1,0.4)' });
```

## I. Imagem que segue o cursor (galeria flutuante)
```ts
gsap.set(preview, { xPercent:-50, yPercent:-50 });          // centraliza
const xTo = gsap.quickTo(preview,'x',{duration:0.5}); const yTo = gsap.quickTo(preview,'y',{duration:0.5});
onMove: (e) => { xTo(e.clientX); yTo(e.clientY); }          // xPercent/yPercent compõem com x/y
```

## J. Hover-expand + reflexo ambiente
Foto escala no hover; uma cópia ampliada+`blur` dela vira o **fundo** da seção
(`<img>` fixo, `blur-3xl`, opacity baixa, trocando `src` no hover). Escureça as
irmãs; a em hover se reacende com `overwrite:true` (evita flicker).

## K. Scrollytelling horizontal (travelling lateral)
```ts
const mm = gsap.matchMedia();
mm.add('(min-width:768px)', () => {
  const horiz = gsap.to(track, { x: () => -(track.scrollWidth-innerWidth), ease:'none',
    scrollTrigger:{ trigger:section, start:'top top', end:()=>'+='+(track.scrollWidth-innerWidth), scrub:0.6, pin:pinEl, anticipatePin:1, invalidateOnRefresh:true }});
  // parallax por painel usando o tween horizontal como container:
  panels.forEach(p => gsap.fromTo(p.querySelector('.img'), {xPercent:-6,scale:1.15}, {xPercent:6,scale:1.15, ease:'none',
    scrollTrigger:{ trigger:p, containerAnimation:horiz, start:'left right', end:'right left', scrub:true }}));
});
mm.add('(max-width:767px)', () => { /* fallback empilhado, sem pin */ });
```
Imagem com `scale 1.15` p/ o parallax `xPercent` nunca deixar brecha.

## L. Outras receitas rápidas
- **Clip-path reveal**: `fromTo(el,{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0% 0 0 0)', ease:'expo.inOut'})`.
- **Dolly-out de vídeo**: interpolar `scale 1.7->1` + `filter: blur(26px)->blur(7px)` (GSAP interpola string de filter se as funções batem).
- **Fragmentar imagem em tiras**: N divs `overflow:hidden`, cada um com `<img>` 100vw deslocado `-i*100/N vw`; anime as tiras (não as imgs). Zoom uniforme = escalar o GRUPO.
- **Ken Burns / float idle**: zoom+pan lentos contínuos; `Math.sin` p/ respiração.
- **Grão/vinheta**: pseudo-elementos `position:fixed` globais (não reusar a classe dentro de seções).

## M. Traduzir tudo isso pra Remotion (vídeo determinístico)
Remotion é **frame-based**: nada de GSAP/Lenis/scroll. Recrie os mesmos efeitos com
`interpolate`/`spring`/`Easing` dirigidos por `useCurrentFrame()`:
- Scroll/scrub vira **auto-scrub**: `interpolate(frame,[0,dur],[...])`.
- Centralize easings/Ken Burns/float num `motion.ts` próprio do projeto Remotion.
- Cenas = `React.FC` (`AbsoluteFill`), ligadas por `@remotion/transitions`
  (`TransitionSeries` + slide/fade/wipe/clockWipe). Mantenha `SCENE_DUR`/`OFFSET`
  em constantes. Fontes via `@remotion/google-fonts`. Vídeo via `OffthreadVideo`.
- **NÃO** chame hooks dentro de `.map()` aqui também (inlinar).

## N. Higiene/armadilhas (vale ouro)
- Validar com `tsc --noEmit` (o bundler não checa tipos). `noUnusedLocals` pega
  imports/props sobrando — remova `EASE` etc. não usados.
- HEIC disfarçado de `.jpeg` não renderiza no browser -> converter (WPF
  `BitmapDecoder.Frames[0]`) e redimensionar p/ web.
- `prefers-reduced-motion`: caminho degradado em TODA animação.
- Performance: transforms/opacity (não top/left); `will-change` em camadas;
  `devicePixelRatio` no canvas; lazy/`preload="none"` em vídeos de hover.
- Ao empacotar pra deploy: zip só com `src/`, `public/` (assets usados),
  `index.html`, configs, `package*.json` — sem `node_modules`/`dist`/tooling.
