#!/usr/bin/env python3
"""
Proposta Comercial — Maria Films (v4)
Identidade alinhada ao site: fundo escuro, acento #ff007f, Instrument Serif +
Sora + Plus Jakarta, lowercase, cards brancos, plano premium com diferencial.
WeasyPrint · A4.

Dados vêm de proposta_config.py (FONTE ÚNICA — a mesma do contrato).

RODAR:  pip install weasyprint ; python build_proposta_v4.py
Gera proposta_maria_v4.pdf. Para o site (Modelo B), copie para:
    <site>/public/proposta/proposta.pdf
"""
from weasyprint import HTML, CSS
from proposta_config import (
    CLIENT, CONTACT, PLANS, TERMS, NOT_INCLUDED,
    PK, BG, SURFACE, CARD, INK, INK_DIM, MUTED, DIM, FAINT,
)


def ico(k, c=PK, s=13):
    d = {
        "phone": '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 21.73 16.92z"/>',
        "instagram": '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
        "mail": '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
        "check": '<polyline points="20,6 9,17 4,12"/>',
        "play": '<polygon points="5,3 19,12 5,21"/>',
        "layers": '<polygon points="12,2 2,7 12,12 22,7"/><polyline points="2,17 12,22 22,17"/><polyline points="2,12 12,17 22,12"/>',
        "image": '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>',
        "calendar": '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
        "zap": '<polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>',
        "star": '<polygon points="12,2 15,9 22,9.3 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9.3 9,9"/>',
        "arrow": '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>',
    }
    fill = c if k in ("play", "zap", "star") else "none"
    return (f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="{fill}" '
            f'stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{d.get(k, "")}</svg>')


WORDMARK = '<span class="wm"><span class="wm-a">maria</span><span class="wm-b">&nbsp;films</span></span>'

HDR = f"""<div class="header">
  {WORDMARK}
  <div class="hdr-contacts">
    <span>{ico("phone", PK, 11)} {CONTACT['whatsapp']}</span>
    <span>{ico("instagram", PK, 11)} {CONTACT['instagram']}</span>
    <span>{ico("mail", PK, 11)} {CONTACT['email']}</span>
  </div>
</div>"""

FTR = f"""<div class="footer">
  {WORDMARK}
  <div class="ftr-c">esculpindo o tempo · {CONTACT['instagram']}</div>
</div>"""


def page(c):
    return f'<div class="page">{HDR}<div class="body">{c}</div>{FTR}</div>'


def plan_card(p):
    feat = " ft" if p["featured"] else ""
    badge = f'<div class="plan-badge">{ico("star", "#fff", 9)} {p["badge"]}</div>' if p["badge"] else ""
    items = "".join(f'<div class="plan-bi"><span class="bi-n">{n}</span> {lbl}</div>' for n, lbl in p["items"])
    diff = ""
    if p["diff"]:
        diff_items = "".join(f'<div class="diff-i">{ico("check", PK, 9)} {d}</div>' for d in p["diff"])
        diff = f'<div class="plan-diff">{diff_items}</div>'
    return f"""<div class="plan{feat}">
      {badge}
      <div class="plan-code">{p['code']}</div>
      <div class="plan-name">{p['name']}</div>
      <div class="plan-tagline">{p['tagline']}</div>
      <div class="plan-total"><span class="pt-n">{p['total']}</span><span class="pt-l">{p['total_label']}</span></div>
      <div class="plan-items">{items}</div>
      {diff}
      <div class="plan-foot">
        <div class="plan-price">{p['price_prefix']} <strong>{p['price']}</strong>{p['price_suffix']}</div>
        <div class="plan-note">{p['price_note']} · {p['per']}</div>
        <div class="plan-dur">{p['duration']}</div>
      </div>
    </div>"""


P1 = f"""
<div class="kicker">// proposta comercial</div>
<h1 class="hero-title">planos de<br>conteúdo digital</h1>
<div class="hero-sub">produção completa de conteúdo estratégico para transformar seguidores em clientes.<br>preparada para <strong>{CLIENT}</strong>.</div>
<div class="sec-label">{ico("zap", PK, 13)} planos &amp; valores</div>
<div class="plans">{''.join(plan_card(p) for p in PLANS)}</div>
<div class="note">{ico("check", PK, 10)} todos os planos incluem roteiro, captação, edição, legenda e <strong>aprovação sua</strong> antes de cada postagem.</div>
"""


def week(n, a_label, a_color):
    return f"""<div class="wk">
      <div class="wk-n">{n}</div>
      <div class="wk-days">
        <div class="wk-d"><span class="wk-dot" style="background:{PK}"></span>ter · reels</div>
        <div class="wk-d"><span class="wk-dot" style="background:{a_color}"></span>qui · {a_label}</div>
      </div>
    </div>"""


P2 = f"""
<div class="sec-label">{ico("calendar", PK, 13)} calendário de conteúdo</div>
<div class="lead">reels para alcance na <strong>terça</strong> e conteúdo visual na <strong>quinta</strong> — os dias de pico do engajamento. 8 conteúdos por mês, sem saturar a audiência.</div>
<div class="weeks">
  {week("1ª semana", "carrossel", "#8B5CF6")}
  {week("2ª semana", "estático", "#10B981")}
  {week("3ª semana", "carrossel", "#8B5CF6")}
  {week("4ª semana", "estático", "#10B981")}
</div>
<div class="cal-sum">
  <div class="cs"><span class="cs-n">4</span><span class="cs-l">reels</span></div>
  <div class="cs"><span class="cs-n">2</span><span class="cs-l">carrosséis</span></div>
  <div class="cs"><span class="cs-n">2</span><span class="cs-l">estáticos</span></div>
  <div class="cs hl"><span class="cs-n">8</span><span class="cs-l">por mês</span></div>
</div>
"""


def step(n, t, d):
    return f'<div class="step"><span class="step-n">{n}</span><div><div class="step-t">{t}</div><div class="step-d">{d}</div></div></div>'


P3 = f"""
<div class="sec-label">{ico("layers", PK, 13)} como funciona</div>
<div class="lead">do roteiro à publicação — você só aprova e posta. cada conteúdo é pensado para <strong>atrair, engajar e converter</strong>.</div>
<div class="proc">
  <div class="proc-col">
    <div class="proc-h">reels / vídeo</div>
    {step("1", "roteiro estratégico", "prende nos 3 primeiros segundos — o ponto que define a entrega.")}
    {step("2", "captação profissional", "enquadramento, luz e áudio que transmitem autoridade.")}
    {step("3", "edição &amp; finalização", "cortes dinâmicos, legendas e trilha — atenção até o fim.")}
    {step("4", "sua aprovação", "nada vai ao ar sem o seu ok.")}
  </div>
  <div class="proc-col">
    <div class="proc-h">arte / carrossel</div>
    {step("1", "estratégia comercial", "cada arte resolve uma dor do seu cliente.")}
    {step("2", "conteúdo de conversão", "educa, gera valor e conduz até a compra.")}
    {step("3", "design profissional", "identidade visual que diferencia a marca.")}
    {step("4", "sua aprovação", "revisão com até 2 ajustes antes de publicar.")}
  </div>
</div>
<div class="diffs">
  <div class="dff"><span class="dff-n">3×</span><span class="dff-t">mais alcance para quem posta com constância e qualidade.</span></div>
  <div class="dff"><span class="dff-n">70%</span><span class="dff-t">decidem comprar após assistir a um vídeo do produto/serviço.</span></div>
  <div class="dff"><span class="dff-n">0h</span><span class="dff-t">do seu tempo com conteúdo. você foca no negócio.</span></div>
</div>
"""

terms_html = "".join(f'<div class="term"><div class="term-t">{t}</div><div class="term-d">{d}</div></div>' for t, d in TERMS)
not_html = "".join(f'<div class="ni-i">{ico("arrow", DIM, 10)} {x}</div>' for x in NOT_INCLUDED)
P4 = f"""
<div class="sec-label">{ico("check", PK, 13)} condições</div>
<div class="terms">{terms_html}</div>
<div class="ni"><div class="ni-h">não está incluso</div>{not_html}</div>
<div class="cta">
  <div class="cta-t">vamos começar?</div>
  <div class="cta-d">escolha o plano e assine pelo link da proposta. o contrato em pdf chega em seguida.</div>
</div>
"""

CSS_T = f"""
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Plus Jakarta Sans',sans-serif;color:#e5e5e5;font-size:9pt}}
.page{{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;display:flex;flex-direction:column;background:{BG}}}
.wm{{font-family:'Instrument Serif',serif;font-style:italic;font-size:17pt;white-space:nowrap}}
.wm-a{{color:#fff}} .wm-b{{color:{PK}}}
.header{{padding:16px 30px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.08)}}
.hdr-contacts{{display:flex;gap:16px;font-size:7.5pt;color:{MUTED}}}
.hdr-contacts span{{display:flex;align-items:center;gap:5px}}
.footer{{margin-top:auto;padding:12px 30px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.08)}}
.footer .wm{{font-size:13pt}}
.ftr-c{{font-size:7pt;letter-spacing:2px;text-transform:uppercase;color:{FAINT}}}
.body{{flex:1;padding:24px 30px;overflow:hidden}}
.kicker{{font-family:'Sora',sans-serif;font-size:7.5pt;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:{PK};margin-bottom:8px}}
.hero-title{{font-family:'Sora',sans-serif;font-size:34pt;font-weight:800;color:#fff;line-height:0.95;letter-spacing:-1.5px;text-transform:uppercase}}
.hero-sub{{font-size:9pt;color:{MUTED};line-height:1.6;margin-top:12px;margin-bottom:22px}}
.hero-sub strong{{color:#fff}}
.sec-label{{display:flex;align-items:center;gap:8px;font-family:'Sora',sans-serif;font-size:8pt;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#fff;margin-bottom:16px}}
.plans{{display:flex;gap:12px;margin-bottom:14px;align-items:stretch}}
.plan{{flex:1;background:{CARD};color:{INK};border-radius:14px;padding:16px 14px;position:relative;display:flex;flex-direction:column}}
.plan.ft{{border:2px solid {PK};box-shadow:0 0 0 4px rgba(255,0,127,0.12)}}
.plan-badge{{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:{PK};color:#fff;font-family:'Sora',sans-serif;font-size:6pt;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:4px 10px;border-radius:10px;white-space:nowrap;display:flex;align-items:center;gap:4px}}
.plan-code{{font-family:'Sora',sans-serif;font-size:9pt;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:{PK}}}
.plan-name{{font-family:'Instrument Serif',serif;font-style:italic;font-size:22pt;color:{INK};line-height:1;margin-top:2px}}
.plan-tagline{{font-size:7pt;color:{INK_DIM};line-height:1.4;margin:6px 0 10px;min-height:28px}}
.plan-total{{display:flex;align-items:baseline;gap:6px;padding-top:10px;border-top:1px solid #eee}}
.pt-n{{font-family:'Sora',sans-serif;font-size:24pt;font-weight:800;color:{INK};line-height:1}}
.pt-l{{font-size:6.5pt;text-transform:uppercase;letter-spacing:0.5px;color:{INK_DIM}}}
.plan-items{{display:flex;flex-direction:column;gap:3px;margin:10px 0}}
.plan-bi{{font-size:8pt;color:{INK};font-weight:500}}
.bi-n{{color:{PK};font-weight:800;margin-right:3px}}
.plan-diff{{background:rgba(255,0,127,0.06);border:1px solid rgba(255,0,127,0.2);border-radius:8px;padding:8px 10px;margin-bottom:10px}}
.diff-i{{font-size:7pt;color:{INK};font-weight:600;display:flex;align-items:center;gap:5px;padding:1.5px 0}}
.plan-foot{{margin-top:auto;padding-top:10px;border-top:1px solid #eee}}
.plan-price{{font-family:'Sora',sans-serif;font-size:10pt;color:{INK_DIM};font-weight:600}}
.plan-price strong{{font-size:20pt;font-weight:800;color:{INK}}}
.plan-note{{font-size:6.5pt;color:{INK_DIM};margin-top:1px}}
.plan-dur{{font-size:6.5pt;text-transform:uppercase;letter-spacing:0.5px;color:{PK};margin-top:6px;font-weight:700}}
.note{{background:rgba(255,0,127,0.08);border-left:2px solid {PK};border-radius:6px;padding:9px 12px;font-size:8pt;color:{MUTED};line-height:1.5;display:flex;align-items:center;gap:7px}}
.note strong{{color:#fff}}
.lead{{font-size:9pt;color:{MUTED};line-height:1.6;margin-bottom:16px}}
.lead strong{{color:#fff}}
.weeks{{display:flex;gap:10px;margin-bottom:14px}}
.wk{{flex:1;background:{SURFACE};border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px}}
.wk-n{{font-family:'Sora',sans-serif;font-size:7pt;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:{DIM};margin-bottom:10px}}
.wk-days{{display:flex;flex-direction:column;gap:7px}}
.wk-d{{font-size:8pt;color:#fff;display:flex;align-items:center;gap:7px}}
.wk-dot{{width:7px;height:7px;border-radius:50%;flex-shrink:0}}
.cal-sum{{display:flex;justify-content:center;gap:28px;padding:14px;background:{SURFACE};border-radius:10px}}
.cs{{text-align:center}}
.cs-n{{font-family:'Sora',sans-serif;font-size:18pt;font-weight:800;color:#fff;display:block}}
.cs.hl .cs-n{{color:{PK}}}
.cs-l{{font-size:6.5pt;text-transform:uppercase;letter-spacing:1px;color:{DIM}}}
.proc{{display:flex;gap:14px;margin-bottom:16px}}
.proc-col{{flex:1;background:{SURFACE};border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px}}
.proc-h{{font-family:'Sora',sans-serif;font-size:8pt;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:{PK};margin-bottom:12px}}
.step{{display:flex;gap:9px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06)}}
.step:last-child{{border-bottom:none}}
.step-n{{font-family:'Sora',sans-serif;font-size:8pt;color:{DIM};font-weight:700}}
.step-t{{font-size:8pt;font-weight:700;color:#fff}}
.step-d{{font-size:7pt;color:{MUTED};line-height:1.4;margin-top:1px}}
.diffs{{display:flex;gap:12px}}
.dff{{flex:1;background:{SURFACE};border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px;text-align:center}}
.dff-n{{font-family:'Sora',sans-serif;font-size:24pt;font-weight:800;color:{PK};display:block;line-height:1}}
.dff-t{{font-size:7.5pt;color:{MUTED};line-height:1.45;margin-top:6px;display:block}}
.terms{{display:flex;flex-direction:column;gap:1px;background:rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;margin-bottom:16px}}
.term{{background:{SURFACE};padding:12px 16px;display:flex;gap:16px;align-items:baseline}}
.term-t{{font-family:'Sora',sans-serif;font-size:7.5pt;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:{PK};min-width:110px}}
.term-d{{font-size:8.5pt;color:{MUTED};line-height:1.5;flex:1}}
.ni{{background:{SURFACE};border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px 16px;margin-bottom:18px}}
.ni-h{{font-family:'Sora',sans-serif;font-size:7.5pt;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:{DIM};margin-bottom:8px}}
.ni-i{{font-size:8pt;color:{MUTED};display:flex;align-items:center;gap:7px;padding:2px 0}}
.cta{{text-align:center;padding:24px;background:rgba(255,0,127,0.08);border:1px solid rgba(255,0,127,0.25);border-radius:14px}}
.cta-t{{font-family:'Instrument Serif',serif;font-style:italic;font-size:24pt;color:#fff}}
.cta-d{{font-size:8.5pt;color:{MUTED};margin-top:6px}}
"""

pages = [P1, P2, P3, P4]
body = "".join(page(p) for p in pages)
html = f'<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>{CSS_T}</style></head><body>{body}</body></html>'

with open("proposta_v4.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Gerando PDF da proposta...")
HTML(filename="proposta_v4.html").write_pdf("proposta_maria_v4.pdf", stylesheets=[CSS(string="@page{size:A4;margin:0;}")])
print("OK -> proposta_maria_v4.pdf")
