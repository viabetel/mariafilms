#!/usr/bin/env python3
"""
Proposta Comercial — Maria Eduarda (v3)
Novos pacotes · Sem Collab Day · Descrições estratégicas
WeasyPrint · A4
"""
from PIL import Image
import numpy as np, io, base64, subprocess, glob, os, shutil
from weasyprint import HTML, CSS

# ─── LOGO ───
def make_logo(path):
    img = Image.open(path).convert("RGBA")
    arr = np.array(img, dtype=np.float64)
    r,g,b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    dist = np.sqrt((r-247)**2+(g-247)**2+(b-247)**2)
    alpha = np.clip((dist-8)/15*255, 0, 255)
    alpha[(r>160)&(g<130)] = 255
    alpha[(r<200)&(g<200)&(b<200)] = 255
    alpha[(r>252)&(g>252)&(b>252)] = 200
    arr[:,:,3] = alpha
    out = Image.fromarray(arr.astype(np.uint8))
    bbox = out.getbbox()
    if bbox:
        p=12; out = out.crop((max(0,bbox[0]-p),max(0,bbox[1]-p),min(out.width,bbox[2]+p),min(out.height,bbox[3]+p)))
    buf = io.BytesIO(); out.save(buf,"PNG")
    return base64.b64encode(buf.getvalue()).decode()

print("Logo..."); LOGO = make_logo("/mnt/user-data/uploads/Log_PNG.jpg"); print("OK")

PK="#E91E90"; PS="#F472B6"; PBG="#FDF2F8"; PBR="#FBCFE8"
BK="#111111"; DK="#1C1C1E"; GR="#3C3C43"; GS="#6B7280"; LB="#FAFAFA"
PP="#8B5CF6"; GN="#10B981"

def ico(k,c=PK,s=14):
    d={
    "phone":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>',
    "instagram":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    "mail":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    "check":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg>',
    "play":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="{c}" stroke="{c}" stroke-width="1"><polygon points="5,3 19,12 5,21"/></svg>',
    "layers":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 2,7 12,12 22,7"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/></svg>',
    "image":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>',
    "calendar":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    "dollar":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    "edit":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    "shield":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    "zap":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="{c}" stroke="{c}" stroke-width="1"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>',
    "video":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23,7 16,12 23,17"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>',
    "award":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/></svg>',
    "user":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    "target":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    "trending":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>',
    "clock":f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>',
    }
    return d.get(k,"")

# ─── HEADER / FOOTER ───
HDR = f"""<div class="header">
  <div class="hdr-logo-area"><img src="data:image/png;base64,{LOGO}" class="hdr-logo"></div>
  <div class="hdr-div"></div>
  <div class="hdr-contacts">
    <div class="hdr-r">{ico("phone",PK,13)}<div class="hdr-i"><div class="hdr-l">WhatsApp</div><div class="hdr-v">(32) 99972-2706</div></div></div>
    <div class="hdr-r">{ico("instagram",PK,13)}<div class="hdr-i"><div class="hdr-l">Instagram</div><div class="hdr-v">@mariaubaldino.films</div></div></div>
    <div class="hdr-r">{ico("mail",PK,13)}<div class="hdr-i"><div class="hdr-l">E-mail</div><div class="hdr-v">Mariaeduarda681@icloud.com</div></div></div>
  </div>
</div>"""

FTR = f"""<div class="footer">
  <div class="ftr-c">
    <div class="ftr-i">{ico("phone",PK,11)} <span>(32) 99972-2706</span></div><div class="ftr-s">&bull;</div>
    <div class="ftr-i">{ico("instagram",PK,11)} <span>@mariaubaldino.films</span></div><div class="ftr-s">&bull;</div>
    <div class="ftr-i">{ico("mail",PK,11)} <span>Mariaeduarda681@icloud.com</span></div>
  </div>
  <img src="data:image/png;base64,{LOGO}" class="ftr-logo">
</div>"""

def pg(c): return f'<div class="page">{HDR}<div class="body">{c}</div>{FTR}</div>'

def step(n,icon,title,desc,color=PK):
    return f'<div class="step"><div class="step-n" style="background:{color}">{n}</div>{ico(icon,color,12)}<div class="step-i"><div class="step-t">{title}</div><div class="step-d">{desc}</div></div></div>'

# ════════════════════ P1: HERO + PLANOS ════════════════════
P1 = f"""
<div class="hero">
  <div class="hero-lbl">PROPOSTA COMERCIAL</div>
  <div class="hero-row">
    <div class="hero-l">
      <div class="hero-t">Planos de<br>Conteúdo<br>Digital</div>
      <div class="hero-bar"></div>
      <div class="hero-sub">Produção completa de conteúdo estratégico<br>para transformar seguidores em clientes.</div>
      <div class="hero-tags">
        <span class="htag">{ico("video","#fff",10)} Videomaker</span>
        <span class="htag">{ico("image","#fff",10)} Fotografia</span>
        <span class="htag">{ico("edit","#fff",10)} Storymaker</span>
      </div>
    </div>
    <div class="hero-r"><img src="data:image/png;base64,{LOGO}" class="hero-logo"></div>
  </div>
</div>

<div class="sh">{ico("dollar","#fff",16)}<div><div class="sh-t">PLANOS &amp; VALORES</div><div class="sh-s">Cada plano inclui roteiro, captação, edição, legenda e aprovação do cliente</div></div></div>

<div class="plans">
  <div class="plan">
    <div class="plan-hd">V1</div>
    <div class="plan-nm">Experiência</div>
    <div class="plan-tl">Ideal para conhecer o serviço e testar resultados</div>
    <div class="plan-dv"></div>
    <div class="plan-tot"><div class="plan-tn">8</div><div class="plan-tlb">conteúdos<br>entregues</div></div>
    <div class="plan-bk">
      <div class="plan-bi">{ico("play",PK,9)} <span>4 Reels</span></div>
      <div class="plan-bi">{ico("layers",PP,9)} <span>2 Carrosséis</span></div>
      <div class="plan-bi">{ico("image",GN,9)} <span>2 Artes Estáticas</span></div>
    </div>
    <div class="plan-dur">{ico("calendar",GS,9)} <strong>1 mês</strong> &middot; Sem compromisso</div>
    <div class="plan-pr"><div class="plan-rs">R$</div><div class="plan-vl">580</div><div class="plan-ct">,00</div></div>
    <div class="plan-per">pagamento único</div>
    <div class="plan-cpp">&asymp; R$72,50 por conteúdo</div>
  </div>

  <div class="plan ft">
    <div class="plan-feat">{ico("trending","#fff",8)} MELHOR CUSTO-BENEFÍCIO</div>
    <div class="plan-hd">V2</div>
    <div class="plan-nm">Crescimento</div>
    <div class="plan-tl ft">Consistência que gera resultado — o algoritmo recompensa quem posta com frequência</div>
    <div class="plan-dv"></div>
    <div class="plan-tot ft"><div class="plan-tn">24</div><div class="plan-tlb">conteúdos<br>em 3 meses</div></div>
    <div class="plan-bk">
      <div class="plan-bi ft">{ico("play",PS,9)} <span>12 Reels</span></div>
      <div class="plan-bi ft">{ico("layers","#A78BFA",9)} <span>12 Carrosséis</span></div>
      <div class="plan-bi ft">{ico("image","#6EE7B7",9)} <span>12 Artes</span></div>
    </div>
    <div class="plan-dur ft">{ico("calendar","#888",9)} <strong>3 meses</strong> &middot; Parcelado</div>
    <div class="plan-pr"><div class="plan-rs">R$</div><div class="plan-vl">560</div><div class="plan-ct">,00<span class="plan-mo">/mês</span></div></div>
    <div class="plan-per ft">total: R$1.680,00</div>
    <div class="plan-cpp ft">&asymp; R$70,00 por conteúdo</div>
    <div class="plan-tag">{ico("zap","#fff",9)} 3× mais conteúdo &middot; Economia de R$60</div>
  </div>

  <div class="plan">
    <div class="plan-hd">V3</div>
    <div class="plan-nm">Aceleração</div>
    <div class="plan-tl">Máxima economia com compromisso — invista uma vez, colha resultados por 3 meses</div>
    <div class="plan-dv"></div>
    <div class="plan-tot"><div class="plan-tn">24</div><div class="plan-tlb">conteúdos<br>em 3 meses</div></div>
    <div class="plan-bk">
      <div class="plan-bi">{ico("play",PK,9)} <span>12 Reels</span></div>
      <div class="plan-bi">{ico("layers",PP,9)} <span>12 Carrosséis</span></div>
      <div class="plan-bi">{ico("image",GN,9)} <span>12 Artes</span></div>
    </div>
    <div class="plan-dur">{ico("calendar",GS,9)} <strong>3 meses</strong> &middot; Pagamento à vista</div>
    <div class="plan-pr"><div class="plan-rs">R$</div><div class="plan-vl">1.650</div><div class="plan-ct">,00</div></div>
    <div class="plan-per">pagamento único</div>
    <div class="plan-cpp">&asymp; R$68,75 por conteúdo</div>
    <div class="plan-tag-lt">{ico("zap",PK,9)} Menor preço por conteúdo &middot; Economia de R$90</div>
  </div>
</div>

<div class="inc-note">
  {ico("check",PK,10)} Todos os planos incluem: <strong>roteiro criativo, captação profissional, edição completa, legenda pronta para publicação</strong> e <strong>aprovação do cliente</strong> antes de cada postagem.
</div>
"""

# ════════════════════ P2: CALENDÁRIO + O QUE ESTÁ INCLUSO ════════════════════
def dc(dn,ct,icn,ds,cl=PK):
    return f'<div class="dc"><div class="dn">{dn}</div><div class="dd">{ico(icn,cl,14)}<div class="dt">{ct}</div><div class="ds">{ds}</div></div></div>'
def de(dn):
    return f'<div class="dc emp"><div class="dn">{dn}</div><div class="dd"><div class="ds" style="color:#ddd">—</div></div></div>'

def wk(n,lbl,d1,d2,d3,d4,d5):
    return f'<div class="wk"><div class="wh"><div class="wn">{n}</div><div class="wl">{lbl}</div></div><div class="wd">{d1}{d2}{d3}{d4}{d5}</div></div>'

P2 = f"""
<div class="sh">{ico("calendar","#fff",16)}<div><div class="sh-t">CALENDÁRIO DE CONTEÚDO</div><div class="sh-s">Planejamento mensal — 8 conteúdos estratégicos por mês</div></div></div>

<div class="cal-desc">
  A distribuição foi pensada para manter <strong>presença constante</strong> sem saturar a audiência. Cada post ocupa um espaço estratégico na semana: <strong>Reels para alcance</strong> na terça-feira (quando o engajamento começa a subir) e <strong>conteúdo visual</strong> na quinta-feira (pico de engajamento da semana).
</div>

<div class="cal-leg">
  <div class="leg-i"><div class="leg-d" style="background:{PK}"></div><span><strong>Reels</strong> — Vídeo curto</span></div>
  <div class="leg-i"><div class="leg-d" style="background:{PP}"></div><span><strong>Carrossel</strong> — Até 5 slides</span></div>
  <div class="leg-i"><div class="leg-d" style="background:{GN}"></div><span><strong>Arte Estática</strong> — Post único</span></div>
</div>

{wk("S1","PRIMEIRA SEMANA",
    de("SEG"),
    dc("TER","REELS","play","Vídeo curto",PK),
    de("QUA"),
    dc("QUI","CARROSSEL","layers","Até 5 slides",PP),
    de("SEX"))}

{wk("S2","SEGUNDA SEMANA",
    de("SEG"),
    dc("TER","REELS","play","Vídeo curto",PK),
    de("QUA"),
    dc("QUI","ESTÁTICO","image","1 post",GN),
    de("SEX"))}

{wk("S3","TERCEIRA SEMANA",
    de("SEG"),
    dc("TER","REELS","play","Vídeo curto",PK),
    de("QUA"),
    dc("QUI","CARROSSEL","layers","Até 5 slides",PP),
    de("SEX"))}

{wk("S4","QUARTA SEMANA",
    de("SEG"),
    dc("TER","REELS","play","Vídeo curto",PK),
    de("QUA"),
    dc("QUI","ESTÁTICO","image","1 post",GN),
    de("SEX"))}

<div class="cal-sum">
  <div class="cs-i"><div class="cs-n">4</div><div class="cs-l">Reels</div></div><div class="cs-d"></div>
  <div class="cs-i"><div class="cs-n">2</div><div class="cs-l">Carrosséis</div></div><div class="cs-d"></div>
  <div class="cs-i"><div class="cs-n">2</div><div class="cs-l">Estáticos</div></div><div class="cs-d"></div>
  <div class="cs-i hl"><div class="cs-n">8</div><div class="cs-l">Total / mês</div></div>
</div>

<div class="why-row">
  <div class="why-c"><div class="why-ic">{ico("target",PK,14)}</div><div><div class="why-t">Terça-feira</div><div class="why-d">O engajamento começa a subir. <strong>Reels alcançam público novo</strong> com o impulso do algoritmo no meio da semana.</div></div></div>
  <div class="why-c"><div class="why-ic">{ico("trending",PP,14)}</div><div><div class="why-t">Quinta-feira</div><div class="why-d">Pico de engajamento da semana. <strong>Carrosséis e artes geram salvamentos</strong>, que sinalizam relevância pro Instagram.</div></div></div>
</div>
"""

# ════════════════════ P3: PROCESSO + DIFERENCIAIS ════════════════════
P3 = f"""
<div class="sh">{ico("zap","#fff",16)}<div><div class="sh-t">COMO FUNCIONA</div><div class="sh-s">Do roteiro à publicação — você só precisa aprovar e postar</div></div></div>

<div class="strat-intro">
  Cada conteúdo é pensado estrategicamente para <strong>atrair, engajar e converter</strong>. Não é só produzir vídeo bonito — é criar uma <strong>máquina de captação de clientes</strong> para o seu negócio.
</div>

<div class="proc-grid">
  <div class="proc-col">
    <div class="proc-hd"><div class="proc-ic">{ico("play","#fff",16)}</div><div class="proc-t">REELS / VÍDEO</div><div class="proc-st">O formato que mais alcança pessoas novas no Instagram</div></div>
    <div class="proc-bd">
      {step("1","edit","Roteiro Estratégico","Texto pensado para prender nos <strong>3 primeiros segundos</strong> — o ponto que define se o algoritmo entrega.",PK)}
      {step("2","video","Captação Profissional","Gravação com enquadramento, iluminação e áudio que transmitem <strong>credibilidade e autoridade</strong>.",PK)}
      {step("3","layers","Edição & Finalização","Cortes dinâmicos, legendas, trilha e efeitos que mantêm a <strong>atenção até o final</strong>.",PK)}
      {step("4","check","Sua Aprovação","Nada vai ao ar sem o seu OK. Você tem <strong>controle total</strong> sobre tudo.",PK)}
      {step("5","zap","Legenda + Pronto","Copy persuasiva, hashtags estratégicas e CTA. <strong>É só postar.</strong>",PK)}
    </div>
  </div>
  <div class="proc-col">
    <div class="proc-hd arte"><div class="proc-ic arte">{ico("layers","#fff",16)}</div><div class="proc-t">ARTE / CARROSSEL</div><div class="proc-st">O formato que mais gera salvamentos e compartilhamentos</div></div>
    <div class="proc-bd">
      {step("1","dollar","Estratégia Comercial","Cada arte é planejada para <strong>resolver uma dor do seu cliente</strong> e posicionar você como referência.",PP)}
      {step("2","award","Conteúdo de Conversão","Textos que educam, geram valor e conduzem o público até o <strong>momento da compra</strong>.",PP)}
      {step("3","image","Design Profissional","Criação em ferramentas profissionais com identidade visual que <strong>diferencia a sua marca</strong>.",PP)}
      {step("4","check","Sua Aprovação","Revisão com até 2 ajustes. Você valida cada detalhe antes da <strong>publicação</strong>.",PP)}
      {step("5","zap","Legenda + Pronto","Copy otimizada para engajamento com CTA claro. <strong>É só postar.</strong>",PP)}
    </div>
  </div>
</div>

<div class="diff-section">
  <div class="diff-hd">{ico("award","#fff",14)} <span>POR QUE INVESTIR EM CONTEÚDO PROFISSIONAL?</span></div>
  <div class="diff-grid">
    <div class="diff-c">
      <div class="diff-n">3×</div>
      <div class="diff-tx">Perfis que postam <strong>com constância e qualidade</strong> recebem até 3× mais alcance pelo algoritmo do Instagram.</div>
    </div>
    <div class="diff-c">
      <div class="diff-n">70%</div>
      <div class="diff-tx">Dos consumidores decidem comprar depois de assistir a um <strong>vídeo sobre o produto ou serviço</strong>.</div>
    </div>
    <div class="diff-c">
      <div class="diff-n">0h</div>
      <div class="diff-tx">De trabalho seu com conteúdo. Você foca no seu negócio — <strong>eu cuido da sua presença digital</strong>.</div>
    </div>
  </div>
</div>
"""

# ════════════════════ CSS ════════════════════
CSS_T = f"""
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Helvetica Neue',Arial,sans-serif;color:{GR};font-size:9pt}}
.page{{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;display:flex;flex-direction:column}}

.header{{background:{BK};padding:14px 30px;display:flex;align-items:center;gap:22px;min-height:80px}}
.hdr-logo-area{{flex-shrink:0;display:flex;align-items:center}}
.hdr-logo{{height:58px;width:auto}}
.hdr-div{{width:1.5px;height:48px;background:linear-gradient(to bottom,transparent,{PK},transparent);flex-shrink:0}}
.hdr-contacts{{display:flex;flex-direction:column;gap:5px;flex:1}}
.hdr-r{{display:flex;align-items:center;gap:10px}}
.hdr-i{{display:flex;align-items:baseline;gap:6px}}
.hdr-l{{font-size:6.5pt;font-weight:700;color:{PS};text-transform:uppercase;letter-spacing:1px;min-width:60px}}
.hdr-v{{font-size:8.5pt;color:#E5E5EA;font-weight:500}}

.footer{{background:{BK};padding:12px 30px;display:flex;align-items:center;justify-content:space-between;min-height:56px;margin-top:auto}}
.ftr-c{{display:flex;align-items:center;gap:12px}}
.ftr-i{{display:flex;align-items:center;gap:5px;font-size:7.5pt;color:#AEAEB2}}
.ftr-i span{{color:#D1D1D6}}
.ftr-s{{color:{PK};font-size:8pt}}
.ftr-logo{{height:40px;width:auto}}

.body{{flex:1;padding:16px 30px;overflow:hidden}}

/* HERO */
.hero{{background:{BK};border-radius:12px;overflow:hidden;margin-bottom:14px}}
.hero-lbl{{font-size:6.5pt;font-weight:800;color:{PK};letter-spacing:4px;text-transform:uppercase;padding:16px 24px 0}}
.hero-row{{display:flex;align-items:center;padding:6px 24px 16px}}
.hero-l{{flex:1}}
.hero-t{{font-size:28pt;font-weight:900;color:#fff;line-height:1.1;margin-bottom:8px}}
.hero-bar{{width:45px;height:3px;background:{PK};border-radius:2px;margin-bottom:10px}}
.hero-sub{{font-size:9pt;color:#aaa;line-height:1.5}}
.hero-tags{{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}}
.htag{{display:inline-flex;align-items:center;gap:4px;background:rgba(233,30,144,0.12);border:1px solid rgba(233,30,144,0.25);border-radius:20px;padding:3px 10px;font-size:6.5pt;font-weight:700;color:{PS}}}
.hero-r{{flex-shrink:0}}
.hero-logo{{height:130px;width:auto;opacity:0.9}}

/* SECTION HEAD */
.sh{{display:flex;align-items:center;gap:12px;margin-bottom:14px;background:{BK};border-radius:8px;padding:8px 14px}}
.sh svg{{flex-shrink:0}}
.sh-t{{font-size:11pt;font-weight:900;color:#fff;letter-spacing:1px}}
.sh-s{{font-size:7.5pt;color:#999;margin-top:1px}}

/* PLANS */
.plans{{display:flex;gap:10px;margin-bottom:12px}}
.plan{{flex:1;border:1.5px solid #E5E5EA;border-radius:12px;padding:12px 10px 10px;text-align:center;position:relative;background:#fff}}
.plan.ft{{background:{BK};border-color:{PK};border-width:2px}}
.plan-feat{{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:{PK};color:#fff;font-size:5.5pt;font-weight:800;padding:3px 8px;border-radius:10px;letter-spacing:0.8px;display:flex;align-items:center;gap:3px;white-space:nowrap}}
.plan-hd{{font-size:20pt;font-weight:900;color:{PK};line-height:1}}
.plan-nm{{font-size:9pt;font-weight:800;color:{DK};text-transform:uppercase;letter-spacing:1px;margin-bottom:1px}}
.plan.ft .plan-nm{{color:#ddd}}
.plan-tl{{font-size:6pt;color:{GS};font-style:italic;margin-bottom:6px;line-height:1.35;padding:0 4px}}
.plan-tl.ft{{color:#777}}
.plan-dv{{height:1.5px;background:linear-gradient(to right,transparent,{PBR},transparent);margin:0 8px 6px}}
.plan.ft .plan-dv{{background:linear-gradient(to right,transparent,rgba(233,30,144,0.4),transparent)}}
.plan-tot{{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:6px;padding:6px 10px;background:{PBG};border-radius:8px;border:1px solid {PBR}}}
.plan-tot.ft{{background:rgba(233,30,144,0.12);border-color:rgba(233,30,144,0.25)}}
.plan-tn{{font-size:24pt;font-weight:900;color:{PK};line-height:1}}
.plan-tlb{{font-size:7pt;color:{GR};font-weight:600;text-align:left;line-height:1.3}}
.plan.ft .plan-tlb{{color:#bbb}}
.plan-bk{{display:flex;flex-direction:column;gap:2px;margin-bottom:6px;padding:0 6px}}
.plan-bi{{display:flex;align-items:center;gap:5px;font-size:7.5pt;color:{GR};padding:1.5px 0}}
.plan-bi.ft{{color:#ccc}}
.plan-bi span{{font-weight:600}}
.plan-dur{{font-size:6.5pt;color:{GS};margin-bottom:6px;display:flex;align-items:center;justify-content:center;gap:3px}}
.plan-dur strong{{color:{DK}}}
.plan-dur.ft{{color:#888}}
.plan-dur.ft strong{{color:#ccc}}
.plan-pr{{display:flex;align-items:flex-start;justify-content:center;gap:1px;margin-bottom:1px}}
.plan-rs{{font-size:9pt;font-weight:700;color:{PK};margin-top:3px}}
.plan-vl{{font-size:22pt;font-weight:900;color:{DK};line-height:1}}
.plan.ft .plan-vl{{color:#fff}}
.plan-ct{{font-size:9pt;font-weight:700;color:{GS};margin-top:3px}}
.plan.ft .plan-ct{{color:#888}}
.plan-mo{{font-size:7pt;font-weight:600}}
.plan-per{{font-size:6.5pt;color:{GS};margin-bottom:3px}}
.plan-per.ft{{color:#777}}
.plan-cpp{{font-size:6pt;color:{GS};font-weight:600;margin-bottom:5px}}
.plan-cpp.ft{{color:#888}}
.plan-tag{{background:rgba(233,30,144,0.2);border-radius:6px;padding:4px 6px;font-size:6pt;font-weight:700;color:{PS};display:flex;align-items:center;justify-content:center;gap:3px}}
.plan-tag-lt{{background:{PBG};border:1px solid {PBR};border-radius:6px;padding:4px 6px;font-size:6pt;font-weight:700;color:{PK};display:flex;align-items:center;justify-content:center;gap:3px}}

.inc-note{{background:{PBG};border:1px solid {PBR};border-radius:8px;padding:8px 12px;font-size:7.5pt;color:{GR};line-height:1.5;display:flex;align-items:center;gap:6px;border-left:3px solid {PK}}}
.inc-note strong{{color:{DK}}}

/* CALENDAR */
.cal-desc{{font-size:7.5pt;color:{GR};line-height:1.55;text-align:justify;margin-bottom:10px;padding:8px 12px;background:{PBG};border:1px solid {PBR};border-radius:8px;border-left:3px solid {PK}}}
.cal-desc strong{{color:{DK}}}
.cal-leg{{display:flex;gap:18px;margin-bottom:10px;padding:8px 14px;background:{LB};border-radius:8px;border:1px solid #E5E5EA}}
.leg-i{{display:flex;align-items:center;gap:6px;font-size:7.5pt;color:{GR}}}
.leg-i strong{{color:{DK}}}
.leg-d{{width:10px;height:10px;border-radius:3px}}

.wk{{margin-bottom:8px;border-radius:8px;overflow:hidden;border:1px solid #E5E5EA}}
.wh{{background:{BK};padding:6px 14px;display:flex;align-items:center;gap:10px}}
.wn{{font-size:11pt;font-weight:900;color:{PK};background:rgba(233,30,144,0.12);border-radius:5px;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(233,30,144,0.25)}}
.wl{{font-size:8pt;font-weight:800;color:#fff;letter-spacing:1.5px;text-transform:uppercase}}
.wd{{display:flex;background:#fff}}
.dc{{flex:1;padding:8px 6px;text-align:center;border-right:1px solid #F2F2F7}}
.dc:last-child{{border-right:none}}
.dc.emp{{background:{LB}}}
.dn{{font-size:6.5pt;font-weight:800;color:{GS};letter-spacing:1px;margin-bottom:4px}}
.dd{{display:flex;flex-direction:column;align-items:center;gap:2px}}
.dt{{font-size:7pt;font-weight:800;color:{DK};text-transform:uppercase;letter-spacing:0.5px}}
.ds{{font-size:6.5pt;color:{GS}}}

.cal-sum{{display:flex;align-items:center;justify-content:center;gap:16px;padding:10px 20px;margin-top:8px;background:{BK};border-radius:8px}}
.cs-i{{text-align:center}}
.cs-i.hl .cs-n{{color:{PK};font-size:18pt}}
.cs-n{{font-size:16pt;font-weight:900;color:#fff;line-height:1}}
.cs-l{{font-size:6.5pt;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:1px;margin-top:2px}}
.cs-d{{width:1px;height:28px;background:linear-gradient(to bottom,transparent,rgba(233,30,144,0.4),transparent)}}

.why-row{{display:flex;gap:8px;margin-top:8px}}
.why-c{{flex:1;display:flex;align-items:flex-start;gap:8px;background:{LB};border:1px solid #E5E5EA;border-radius:8px;padding:8px 10px;border-left:3px solid {PK}}}
.why-ic{{flex-shrink:0;margin-top:2px}}
.why-t{{font-size:8pt;font-weight:800;color:{DK};margin-bottom:2px}}
.why-d{{font-size:6.5pt;color:{GS};line-height:1.4}}
.why-d strong{{color:{DK}}}

/* STRATEGY */
.strat-intro{{font-size:8.5pt;color:{GR};line-height:1.6;text-align:center;margin-bottom:12px;padding:8px 20px}}
.strat-intro strong{{color:{DK}}}

.proc-grid{{display:flex;gap:10px;margin-bottom:10px}}
.proc-col{{flex:1;border-radius:10px;overflow:hidden;border:1px solid #E5E5EA}}
.proc-hd{{background:{BK};padding:10px 14px;display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center}}
.proc-hd.arte{{background:linear-gradient(135deg,#1a1a2e,#16213e)}}
.proc-ic{{width:32px;height:32px;background:rgba(233,30,144,0.15);border-radius:8px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(233,30,144,0.25);margin-bottom:2px}}
.proc-ic.arte{{background:rgba(139,92,246,0.15);border-color:rgba(139,92,246,0.25)}}
.proc-t{{font-size:9pt;font-weight:900;color:#fff;letter-spacing:1px}}
.proc-st{{font-size:6pt;color:#999;font-style:italic}}
.proc-bd{{padding:6px 10px;background:#fff}}

.step{{display:flex;align-items:center;gap:7px;padding:5px 0;border-bottom:1px solid #F2F2F7}}
.step:last-child{{border-bottom:none}}
.step-n{{width:18px;height:18px;border-radius:50%;font-size:7pt;font-weight:900;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}}
.step-i{{flex:1}}
.step-t{{font-size:7.5pt;font-weight:800;color:{DK};margin-bottom:1px}}
.step-d{{font-size:6.5pt;color:{GS};line-height:1.4}}
.step-d strong{{color:{DK}}}

.diff-section{{margin-top:2px}}
.diff-hd{{background:{BK};border-radius:8px 8px 0 0;padding:7px 14px;display:flex;align-items:center;gap:8px}}
.diff-hd span{{font-size:9pt;font-weight:900;color:#fff;letter-spacing:1px}}
.diff-grid{{display:flex;gap:0;border:1px solid #E5E5EA;border-top:none;border-radius:0 0 8px 8px;overflow:hidden}}
.diff-c{{flex:1;padding:10px 12px;text-align:center;border-right:1px solid #F2F2F7;background:#fff}}
.diff-c:last-child{{border-right:none}}
.diff-n{{font-size:20pt;font-weight:900;color:{PK};line-height:1;margin-bottom:4px}}
.diff-tx{{font-size:6.5pt;color:{GR};line-height:1.45}}
.diff-tx strong{{color:{DK}}}
"""

# ─── BUILD ───
pages = [P1, P2, P3]
body = "".join(pg(p) for p in pages)
html = f'<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>{CSS_T}</style></head><body>{body}</body></html>'
with open("proposta_v3.html","w",encoding="utf-8") as f: f.write(html)

print("Generating PDF...")
HTML(filename="proposta_v3.html").write_pdf("proposta_v3.pdf", stylesheets=[CSS(string="@page{size:A4;margin:0;}")])
print("PDF OK")

from pypdf import PdfReader
r = PdfReader("proposta_v3.pdf"); n = len(r.pages); print(f"{n} páginas")
for fo in glob.glob('pv_*.ppm'): os.remove(fo)
subprocess.run(['pdftoppm','-r','150','-f','1','-l',str(n),'proposta_v3.pdf','pv_'])
for i,pf in enumerate(sorted(glob.glob('pv_*.ppm')),1):
    im = Image.open(pf).convert('RGB'); im.thumbnail((400,566)); im.save(f'pv_p{i}.jpg','JPEG',quality=80); print(f"  P{i}: OK")
shutil.copy("proposta_v3.pdf","/mnt/user-data/outputs/proposta_maria.pdf")
print("Done!")
