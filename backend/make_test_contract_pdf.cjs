// Gera um PDF de contrato de EXEMPLO usando só o Node (sem dependência), pra
// testar a assinatura no Autentique. Modelo paginado: o texto quebra em paginas
// e as ASSINATURAS ficam numa pagina propria e limpa, com espaco de sobra, pra a
// assinatura eletronica nao sobrepor informacao importante.
// Rode: node make_test_contract_pdf.cjs   ->  contrato_exemplo.pdf
const fs = require('fs');

const OUT = 'contrato_exemplo.pdf';
const TOP = 790, BOTTOM = 80, X = 60;

// ['BREAK'] = forca uma nova pagina. Sem acentos (fonte padrao Helvetica).
const LINES = [
  [true, 17, 'CONTRATO DE PRESTACAO DE SERVICOS'],
  [false, 9, 'maria films - producao de conteudo digital'],
  [false, 9, ''],
  [false, 10, 'CONTRATADA: Maria Eduarda Ubaldino ("maria films"), CPF __________,'],
  [false, 10, 'Juiz de Fora/MG.'],
  [false, 10, 'CONTRATANTE: ____________________________, CPF/CNPJ ______________.'],
  [false, 9, ''],

  [true, 11, '1. Do objeto'],
  [false, 10, 'Producao de conteudo digital - plano V2 Crescimento: 24 conteudos'],
  [false, 10, '(12 reels, 12 carrosseis, 12 artes) em 3 meses, com roteiro, captacao,'],
  [false, 10, 'edicao, legenda e aprovacao previa a cada postagem.'],
  [false, 9, ''],

  [true, 11, '2. Do valor e da forma de pagamento'],
  [false, 10, 'Mensalidade de R$ 560,00 por 3 meses (total R$ 1.680,00), debitada'],
  [false, 10, 'automaticamente no cartao informado pelo CONTRATANTE, de forma'],
  [false, 10, 'recorrente, sendo a 1a mensalidade na assinatura. O atraso implica'],
  [false, 10, 'multa de 2% e juros de 1% ao mes e suspende as entregas ate quitacao.'],
  [false, 9, ''],

  [true, 11, '3. Dos prazos e da aprovacao'],
  [false, 10, 'O CONTRATANTE aprova cada conteudo em ate 3 dias uteis; passado o'],
  [false, 10, 'prazo sem manifestacao, considera-se aprovado, para manter o ritmo.'],
  [false, 9, ''],

  [true, 11, '4. Das revisoes'],
  [false, 10, 'Inclusas ate 2 revisoes por conteudo. Ajustes extras podem ser cobrados.'],
  [false, 9, ''],

  [true, 11, '5. Das obrigacoes do contratante'],
  [false, 10, 'Fornecer informacoes, acessos e materiais; autorizar o uso de imagem'],
  [false, 10, 'de terceiros que aparecam nos conteudos, respondendo por reclamacoes.'],
  [false, 9, ''],

  [true, 11, '6. Dos direitos e da entrega'],
  [false, 10, 'A propriedade dos conteudos finais passa ao CONTRATANTE apos a'],
  [false, 10, 'quitacao integral. A CONTRATADA pode usa-los em seu portfolio.'],
  [false, 9, ''],

  [true, 11, '7. Da vigencia e da rescisao'],
  [false, 10, 'A vigencia acompanha a duracao do plano (3 meses), a partir da'],
  [false, 10, 'assinatura. Na rescisao pelo CONTRATANTE aplicam-se as condicoes'],
  [false, 10, 'comerciais ajustadas entre as partes.'],
  [false, 9, ''],

  [true, 11, '8. Da protecao de dados (LGPD)'],
  [false, 10, 'Os dados pessoais sao tratados apenas para executar este contrato'],
  [false, 10, '(Lei 13.709/2018), com seguranca e pelo prazo legal de guarda.'],
  [false, 9, ''],

  [true, 11, '9. Da assinatura eletronica e do foro'],
  [false, 10, 'As partes assinam por meio eletronico (Autentique), reconhecendo sua'],
  [false, 10, 'validade (MP 2.200-2/2001 e Lei 14.063/2020), com trilha de auditoria.'],
  [false, 10, 'Fica eleito o foro de Juiz de Fora/MG.'],

  ['BREAK'],

  [true, 13, 'ASSINATURAS'],
  [false, 9, ''],
  [false, 9, ''],
  [true, 10, 'CONTRATANTE'],
  [false, 9, ''],
  [false, 10, 'Assinatura: ______________________________________________________'],
  [false, 9, ''],
  [false, 10, 'Nome: ____________________________________________________________'],
  [false, 9, ''],
  [false, 10, 'CPF/CNPJ: ____________________     Data: ____ / ____ / __________'],
  [false, 9, ''],
  [false, 9, ''],
  [false, 9, ''],
  [true, 10, 'CONTRATADA - maria films'],
  [false, 9, ''],
  [false, 10, 'Assinatura: ______________________________________________________'],
  [false, 9, ''],
  [false, 10, 'Nome: Maria Eduarda Ubaldino'],
  [false, 9, ''],
  [false, 10, 'CPF: ____________________            Data: ____ / ____ / __________'],
  [false, 9, ''],
  [false, 9, ''],
  [false, 8, 'Documento de teste (sandbox). A validade juridica, data/hora e'],
  [false, 8, 'identificacao dos signatarios constam na trilha de auditoria do Autentique.'],
];

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

// quebra as linhas em paginas: respeita ['BREAK'] e o limite inferior.
function paginate(lines) {
  const pages = [];
  let cur = [], y = TOP;
  for (const ln of lines) {
    if (ln[0] === 'BREAK') { if (cur.length) pages.push(cur); cur = []; y = TOP; continue; }
    const h = ln[1] + 7;
    if (y - h < BOTTOM) { pages.push(cur); cur = []; y = TOP; }
    cur.push(ln); y -= h;
  }
  if (cur.length) pages.push(cur);
  return pages;
}

function buildContent(lines) {
  let y = TOP;
  const parts = ['BT'];
  for (const [bold, size, text] of lines) {
    if (text) {
      parts.push(`/${bold ? 'F2' : 'F1'} ${size} Tf`);
      parts.push(`1 0 0 1 ${X} ${Math.round(y)} Tm`);
      parts.push(`(${esc(text)}) Tj`);
    }
    y -= size + 7;
  }
  parts.push('ET');
  return parts.join('\n');
}

const pages = paginate(LINES);
const N = pages.length;

// objetos: 1 Catalog, 2 Pages, 3 F1, 4 F2, depois (Page, Contents) por pagina.
const objects = [];
objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
const kids = pages.map((_, i) => `${5 + i * 2} 0 R`).join(' ');
objects[1] = `<< /Type /Pages /Kids [${kids}] /Count ${N} >>`;
objects[2] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';
pages.forEach((lines, i) => {
  const content = buildContent(lines);
  const pageNum = 5 + i * 2;
  const contentNum = 6 + i * 2;
  objects[pageNum - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentNum} 0 R >>`;
  objects[contentNum - 1] = `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`;
});

let buf = Buffer.from('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n', 'latin1');
const offsets = [];
objects.forEach((body, idx) => {
  offsets.push(buf.length);
  buf = Buffer.concat([buf, Buffer.from(`${idx + 1} 0 obj\n`, 'latin1'), Buffer.from(body, 'latin1'), Buffer.from('\nendobj\n', 'latin1')]);
});

const xref = buf.length;
const size = objects.length + 1;
let tail = `xref\n0 ${size}\n0000000000 65535 f \n`;
for (const off of offsets) tail += String(off).padStart(10, '0') + ' 00000 n \n';
tail += `trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
buf = Buffer.concat([buf, Buffer.from(tail, 'latin1')]);

fs.writeFileSync(OUT, buf);
console.log(`OK -> ${OUT} (${buf.length} bytes, ${N} paginas)`);
