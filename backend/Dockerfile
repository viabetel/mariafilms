# Backend da Proposta Viva (FastAPI + WeasyPrint) — imagem p/ Render/Railway.
# WeasyPrint precisa das libs nativas do Pango → por isso Docker (não roda na Vercel).
# IMPORTANTE: o build context é a RAIZ do repo (não backend/), porque o main.py
# importa build_contract/proposta_config da pasta IRMÃ propostas/.
FROM python:3.12-slim-bookworm

# Libs de sistema do WeasyPrint (Pango puxa Cairo/HarfBuzz/GDK-Pixbuf como deps) +
# fontes base + tipos MIME. Fontes do contrato vêm do Google Fonts em runtime.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    fontconfig \
    fonts-dejavu-core \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Deps Python primeiro (camada cacheada — só reinstala se requirements mudar).
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Código: backend/ + propostas/ (dependência de runtime do gerador de contrato).
COPY backend/ ./backend/
COPY propostas/ ./propostas/

WORKDIR /app/backend

# Render injeta $PORT. Bind em 0.0.0.0. O startup do main.py pré-aquece as fontes.
ENV PORT=8000
CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
