#!/usr/bin/env python3
"""
Contrato de Prestação de Serviços — Maria Films
Gerado a partir da MESMA fonte (proposta_config.py). O plano escolhido + dados
do contratante preenchem o modelo único. Identidade do site (dark, #ff007f).

ATENÇÃO: minuta criativa para ALINHAR — revise com advogado antes de usar.

RODAR:  python build_contract.py        (gera um exemplo do plano v3)
Uso programático:  build_contract("v2", signer_dict) -> caminho do PDF
"""
from datetime import date
from weasyprint import HTML, default_url_fetcher
from proposta_config import (
    PLANS, CONTRACTOR, CONTACT, CONTRACT_RULES,
    PK, MUTED, FAINT,
)

WORDMARK = '<span class="wm"><span class="wm-a">maria</span><span class="wm-b">&nbsp;films</span></span>'


def _plan(code):
    """Aceita o código da versão ('v1'/'v2'/'v3') OU um dict de plano já pronto
    (mesmo shape de PLANS). Assim a proposta por cliente molda o contrato: a
    versão escolhida no aceite é o que define objeto, preço, duração e cláusulas."""
    if isinstance(code, dict):
        return code
    return next(p for p in PLANS if p["code"] == code)


def _esc(v):
    """Escapa texto do cliente antes de injetar no HTML do contrato (anti-injeção
    de HTML/CSS no PDF). O nome/doc vêm de fora → tratar como hostis."""
    import html
    return html.escape(str(v or ""), quote=True)


def _norm_signer(signer):
    """Normaliza E ESCAPA os dados do CONTRATANTE vindos do aceite. Nada é digitado
    à mão: vem do que o cliente preencheu na proposta — por isso é escapado aqui,
    nunca confiando que o front sanitizou."""
    s = signer or {}
    return {
        "nome": _esc(s.get("nome") or "Cliente"),
        "doc": _esc(s.get("doc") or s.get("documento") or "CPF/CNPJ ____"),
        "cidade": _esc(s.get("cidade") or "—"),
        "email": _esc(s.get("email") or ""),
    }


def _clauses(p, signer, R, C):
    itens = ", ".join(f"{n} {lbl}" for n, lbl in p["items"])
    extras = ""
    if p["diff"]:
        extras = " além de " + ", ".join(p["diff"]) + ","
    portfolio = ("A CONTRATADA poderá utilizar os conteúdos produzidos em seu portfólio, "
                 "redes sociais e materiais de divulgação."
                 if R["portfolio"] else
                 "A CONTRATADA não utilizará os conteúdos para divulgação própria sem autorização.")
    raw = ("Serão entregues apenas os conteúdos finalizados; arquivos brutos (RAW) "
           "não integram o objeto e permanecem com a CONTRATADA."
           if not R["entrega_raw"] else
           "Os arquivos brutos (RAW) serão entregues ao CONTRATANTE.")

    return [
        ("1. das partes",
         f"<strong>CONTRATADA:</strong> {C['nome']}, {C['doc']}, doravante \"{C['marca']}\". "
         f"<strong>CONTRATANTE:</strong> {signer['nome']}, {signer.get('doc','CPF/CNPJ ____')}. "
         "As partes ajustam o presente contrato de prestação de serviços de produção de conteúdo digital."),

        ("2. do objeto",
         f"Prestação de serviços de produção de conteúdo digital — plano <strong>{p['code']} · {p['name']}</strong>: "
         f"{p['total']} conteúdos ({itens}),{extras} durante {p['duration']}, conforme escopo, roteiro, captação, "
         "edição e legenda descritos na proposta que integra este contrato."),

        ("3. dos prazos e aprovação",
         f"A produção segue cronograma mensal. O CONTRATANTE deverá aprovar cada conteúdo em até "
         f"{R['aprovacao_dias']} dias úteis; decorrido o prazo sem manifestação, o conteúdo será considerado "
         "tacitamente aprovado, para não comprometer o cronograma."),

        ("4. das revisões",
         f"Estão inclusas até {R['revisoes']} revisões por conteúdo. Ajustes adicionais poderão ser cobrados à parte."),

        ("5. das obrigações do contratante",
         "Fornecer informações, acessos e materiais necessários; disponibilizar locação/produtos quando aplicável; "
         "e providenciar autorização de uso de imagem de terceiros que venham a aparecer nos conteúdos, "
         "respondendo por eventuais reclamações a esse título."),

        ("6. do valor e pagamento",
         f"Pelo plano contratado, o valor é de <strong>{p['price_prefix']} {p['price']}{p['price_suffix']}</strong> "
         f"({p['price_note']}). O atraso no pagamento implica multa de {R['multa_atraso_pct']}% e juros de "
         f"{R['juros_mes_pct']}% ao mês, e autoriza a CONTRATADA a suspender as entregas até a regularização."),

        ("7. dos direitos e entrega",
         f"{raw} {portfolio} A propriedade dos conteúdos finais transfere-se ao CONTRATANTE após a quitação integral."),

        ("8. da vigência e rescisão",
         f"A vigência acompanha a duração do plano ({p['duration']}), iniciando na assinatura. "
         f"<strong>Em caso de rescisão por iniciativa do CONTRATANTE, ainda que com aviso prévio:</strong> "
         f"(i) não haverá reembolso de valores já pagos; "
         f"(ii) incidirá multa rescisória de {R['multa_pct']}% sobre o saldo do contrato; e "
         f"(iii) tornar-se-á imediatamente exigível o valor integral das mensalidades/parcelas remanescentes "
         "até o término da vigência. Conteúdos já produzidos e não pagos permanecem de propriedade da CONTRATADA."),

        ("9. de força maior",
         "Eventos de caso fortuito ou força maior (doença, impossibilidade técnica, restrições legais) suspendem "
         "os prazos pelo período necessário, com remarcação das entregas, sem caracterizar inadimplemento."),

        ("10. da confidencialidade",
         "As partes manterão sigilo sobre informações estratégicas e comerciais a que tiverem acesso em razão deste contrato."),

        ("11. da proteção de dados (lgpd)",
         "Os dados pessoais tratados servem exclusivamente à execução deste contrato (Lei 13.709/2018), "
         "com segurança e pelo prazo legal de guarda, podendo ser eliminados a pedido após esse período."),

        ("12. da assinatura eletrônica",
         "As partes concordam, expressamente, em celebrar e assinar este contrato por meio eletrônico, por plataforma "
         "de assinatura (ex.: Autentique), reconhecendo sua validade e autenticidade nos termos do art. 10, §2º da "
         "MP 2.200-2/2001 e da Lei 14.063/2020, mediante trilha de auditoria, registro de data/hora e verificação de integridade."),

        ("13. do foro",
         f"Fica eleito o foro da comarca de {C['cidade']} para dirimir questões oriundas deste contrato."),
    ]


def _build_html(code, signer, C):
    """Monta o HTML completo do contrato. A versão (`code`) define as cláusulas e
    o preço; `signer` é o contratante (do aceite); `C` é a CONTRATADA (Maria)."""
    p = _plan(code)
    R = CONTRACT_RULES
    signer = _norm_signer(signer)

    MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
             'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
    d = date.today()
    hoje = f"{d.day} de {MESES[d.month - 1]} de {d.year}"

    clauses_html = "".join(
        f'<section class="cl"><h2>{t}</h2><p>{body}</p></section>' for t, body in _clauses(p, signer, R, C)
    )

    body = f"""
    <div class="head">
      {WORDMARK}
      <div class="hd-meta">contrato de prestação de serviços</div>
    </div>
    <h1>contrato de prestação<br>de serviços</h1>
    <div class="parties">
      <div><span>contratada</span>{C['nome']}</div>
      <div><span>contratante</span>{signer['nome']}</div>
      <div><span>plano</span>{p['code']} · {p['name']} · {p['price_prefix']} {p['price']}{p['price_suffix']}</div>
    </div>
    {clauses_html}
    <section class="sign">
      <h2>aceite e assinatura</h2>
      <p>Por estarem de acordo, as partes assinam o presente instrumento por meio eletrônico, em vias de igual teor.</p>
      <div class="sign-place">{C['cidade']}, {hoje}.</div>
      <div class="sg-block">
        <div class="sg-head">contratante</div>
        <div class="sg-row"><span class="sg-k">assinatura</span><span class="sg-v"></span></div>
        <div class="sg-row"><span class="sg-k">nome</span><span class="sg-v">{signer['nome']}</span></div>
        <div class="sg-row"><span class="sg-k">cpf / cnpj</span><span class="sg-v">{signer['doc']}</span></div>
        <div class="sg-row"><span class="sg-k">data</span><span class="sg-v"></span></div>
      </div>
      <div class="sg-block">
        <div class="sg-head">contratada · {C['marca']}</div>
        <div class="sg-row"><span class="sg-k">assinatura</span><span class="sg-v"></span></div>
        <div class="sg-row"><span class="sg-k">nome</span><span class="sg-v">{C['nome']}</span></div>
        <div class="sg-row"><span class="sg-k">cpf / cnpj</span><span class="sg-v">{C['doc']}</span></div>
        <div class="sg-row"><span class="sg-k">data</span><span class="sg-v"></span></div>
      </div>
      <div class="sign-meta">assinatura eletrônica com validade jurídica (MP 2.200-2/2001 e Lei 14.063/2020). data, hora, identificação dos signatários e código de verificação constam na trilha de auditoria da plataforma. · {CONTACT['instagram']}</div>
    </section>
    """

    css = f"""
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
    @page {{ size:A4; margin:18mm 16mm 16mm; background:#0a0a0a;
      @bottom-right {{ content: "maria films · " counter(page); color:{FAINT}; font-size:7pt; font-family:'Sora',sans-serif; letter-spacing:1px; }} }}
    *{{margin:0;padding:0;box-sizing:border-box}}
    body{{font-family:'Plus Jakarta Sans',sans-serif;color:#d4d4d4;font-size:9.5pt;line-height:1.6;background:#0a0a0a}}
    .wm{{font-family:'Instrument Serif',serif;font-style:italic;font-size:15pt}}
    .wm-a{{color:#fff}} .wm-b{{color:{PK}}}
    .head{{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:10px;margin-bottom:24px}}
    .hd-meta{{font-family:'Sora',sans-serif;font-size:7pt;letter-spacing:2px;text-transform:uppercase;color:{FAINT}}}
    h1{{font-family:'Sora',sans-serif;font-size:24pt;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:-1px;line-height:1;margin-bottom:18px}}
    .parties{{display:flex;flex-direction:column;gap:6px;background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:14px 16px;margin-bottom:22px}}
    .parties div{{font-size:9pt;color:#fff}}
    .parties span{{display:inline-block;min-width:96px;font-family:'Sora',sans-serif;font-size:7pt;letter-spacing:1px;text-transform:uppercase;color:{PK}}}
    .cl{{margin-bottom:14px}}
    .cl h2{{font-family:'Sora',sans-serif;font-size:8.5pt;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:{PK};margin-bottom:5px}}
    .cl p{{color:{MUTED};text-align:justify}}
    .cl strong{{color:#fff}}
    .sign{{break-before:page;padding-top:8px}}
    .sign h2{{font-family:'Sora',sans-serif;font-size:11pt;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#fff;margin-bottom:8px}}
    .sign p{{color:{MUTED};margin-bottom:6px}}
    .sign-place{{color:#d4d4d4;font-size:9.5pt;margin-bottom:44px}}
    .sg-block{{margin-top:40px}}
    .sg-head{{font-family:'Sora',sans-serif;font-size:8pt;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:{PK};margin-bottom:22px}}
    .sg-row{{display:flex;align-items:flex-end;gap:14px;margin-bottom:26px}}
    .sg-k{{font-family:'Sora',sans-serif;font-size:7.5pt;letter-spacing:1px;text-transform:uppercase;color:{MUTED};min-width:84px;padding-bottom:4px}}
    .sg-v{{flex:1;border-bottom:1px solid rgba(255,255,255,0.4);color:#fff;font-size:10pt;min-height:20px;padding-bottom:4px}}
    .sign-meta{{margin-top:56px;font-size:7pt;letter-spacing:1px;text-transform:uppercase;color:{FAINT};text-align:center;line-height:1.6}}
    """

    return f'<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><style>{css}</style></head><body>{body}</body></html>'


# Cache de recursos externos (CSS + arquivos de fonte do Google) por PROCESSO.
# Sem isto, o WeasyPrint baixa as fontes pela internet A CADA contrato → ~5-7s.
# Com cache, só a 1ª geração baixa; as seguintes são rápidas.
_URL_CACHE: dict = {}


def _cached_url_fetcher(url: str):
    cached = _URL_CACHE.get(url)
    if cached is None:
        result = default_url_fetcher(url)
        # normaliza p/ bytes reutilizáveis (file_obj só lê uma vez)
        if "string" not in result and result.get("file_obj") is not None:
            result = {**result, "string": result["file_obj"].read()}
            result.pop("file_obj", None)
        _URL_CACHE[url] = result
    return dict(_URL_CACHE[url])  # cópia: o chamador não esgota o cache


def warm_fonts() -> None:
    """Pré-aquece o cache de fontes gerando um PDF descartável. Chamar no startup
    do backend deixa o PRIMEIRO contrato real já rápido."""
    try:
        contract_pdf_bytes("v2", {"nome": "_", "documento": "_"})
    except Exception:
        pass


def contract_pdf_bytes(code="v3", signer=None, contractor=None) -> bytes:
    """Gera o contrato e devolve os BYTES do PDF. É ISTO que o backend chama no
    aceite do cliente: sobe pro Storage e manda pra Autentique. Ninguém digita
    nada — a versão escolhida + os dados do contratante moldam tudo sozinhos. O
    único passo humano restante é a Maria assinar a parte dela na Autentique."""
    html = _build_html(code, signer, contractor or CONTRACTOR)
    return HTML(string=html, url_fetcher=_cached_url_fetcher).write_pdf()


def build_contract(code="v3", signer=None, out="proposta_contrato_exemplo.pdf"):
    """Grava o PDF em arquivo (uso local / teste). Mesma fonte do bytes acima."""
    with open(out, "wb") as f:
        f.write(contract_pdf_bytes(code, signer))
    return out


if __name__ == "__main__":
    print("Gerando contrato de exemplo (plano v3)...")
    path = build_contract("v3", {"nome": "Cliente Exemplo Ltda", "doc": "CNPJ 12.345.678/0001-90", "cidade": "São Paulo/SP"})
    print(f"OK -> {path}")
