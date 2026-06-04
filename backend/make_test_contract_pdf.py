#!/usr/bin/env python3
"""
Gera um PDF de contrato de EXEMPLO usando SÓ a biblioteca padrão do Python
(sem WeasyPrint, sem GTK, sem instalar nada). Serve pra testar o Autentique
agora — não é o contrato final bonito (esse é o WeasyPrint do build_contract.py),
é texto simples com o mesmo conteúdo, suficiente pro teste de assinatura.

RODAR:
    python make_test_contract_pdf.py
    -> gera  contrato_exemplo.pdf  (use no test_autentique.py via PDF_PATH)

Sem acentos de propósito (fonte padrão Helvetica), pra não dar dor de cabeça de
encoding num arquivo que é descartável.
"""

OUT = "contrato_exemplo.pdf"

# (negrito?, tamanho, texto) — espelha as clausulas do build_contract.py, enxuto.
LINES = [
    (True, 17, "CONTRATO DE PRESTACAO DE SERVICOS"),
    (False, 9, "maria films - producao de conteudo digital"),
    (False, 9, ""),
    (False, 10, "CONTRATADA: Maria Eduarda Ubaldino (\"maria films\"), Juiz de Fora/MG."),
    (False, 10, "CONTRATANTE: ____________________________  CPF/CNPJ ______________."),
    (False, 9, ""),
    (True, 11, "1. Do objeto"),
    (False, 10, "Producao de conteudo digital - plano V2 Crescimento: 24 conteudos"),
    (False, 10, "(12 reels, 12 carrosseis, 12 artes) durante 3 meses, com roteiro,"),
    (False, 10, "captacao, edicao, legenda e aprovacao previa a cada postagem."),
    (False, 9, ""),
    (True, 11, "2. Do valor e pagamento"),
    (False, 10, "Mensalidade de R$ 560,00, debitada automaticamente no cartao todo"),
    (False, 10, "mes, por 3 meses (total R$ 1.680,00). A 1a mensalidade na assinatura."),
    (False, 9, ""),
    (True, 11, "3. Dos prazos e aprovacao"),
    (False, 10, "O contratante aprova cada conteudo em ate 3 dias uteis; passado o"),
    (False, 10, "prazo sem manifestacao, considera-se aprovado para manter o ritmo."),
    (False, 9, ""),
    (True, 11, "4. Da assinatura eletronica"),
    (False, 10, "As partes assinam este instrumento por meio eletronico (Autentique),"),
    (False, 10, "reconhecendo sua validade nos termos da MP 2.200-2/2001 e da Lei"),
    (False, 10, "14.063/2020, com trilha de auditoria e registro de data e hora."),
    (False, 9, ""),
    (False, 9, ""),
    (False, 10, "_______________________________     _______________________________"),
    (False, 9, "maria films - contratada                contratante"),
    (False, 9, ""),
    (False, 8, "Documento de teste (sandbox). Conteudo meramente ilustrativo."),
]


def esc(s: str) -> str:
    return s.replace("\\", r"\\").replace("(", r"\(").replace(")", r"\)")


def build_content(lines) -> str:
    x, y = 60, 790
    parts = ["BT"]
    for bold, size, text in lines:
        if text:
            parts.append(f"/{'F2' if bold else 'F1'} {size} Tf")
            parts.append(f"1 0 0 1 {x} {y:.0f} Tm")
            parts.append(f"({esc(text)}) Tj")
        y -= size + 7
    parts.append("ET")
    return "\n".join(parts)


content = build_content(LINES)

objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    ("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
     "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>"),
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    f"<< /Length {len(content)} >>\nstream\n{content}\nendstream",
]

buf = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
offsets = []
for i, body in enumerate(objects, start=1):
    offsets.append(len(buf))
    buf += f"{i} 0 obj\n".encode("latin-1") + body.encode("latin-1") + b"\nendobj\n"

xref_pos = len(buf)
size = len(objects) + 1
buf += f"xref\n0 {size}\n".encode("latin-1")
buf += b"0000000000 65535 f \n"
for off in offsets:
    buf += f"{off:010d} 00000 n \n".encode("latin-1")
buf += b"trailer\n"
buf += f"<< /Size {size} /Root 1 0 R >>\n".encode("latin-1")
buf += f"startxref\n{xref_pos}\n".encode("latin-1")
buf += b"%%EOF\n"

with open(OUT, "wb") as f:
    f.write(buf)

print(f"OK -> {OUT}  ({len(buf)} bytes)")
print("Agora: set PDF_PATH=contrato_exemplo.pdf  e rode  python test_autentique.py")
