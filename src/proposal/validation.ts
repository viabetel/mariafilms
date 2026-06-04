// Validações dos dados do signatário (o que a Autentique vai usar pra criar o
// aceite). Documento e e-mail precisam estar corretos antes de gerar o contrato.

function isValidCPF(value: string): boolean {
  const cpf = value.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += +cpf[i] * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== +cpf[9]) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += +cpf[i] * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === +cpf[10];
}

function isValidCNPJ(value: string): boolean {
  const cnpj = value.replace(/\D/g, '');
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const digit = (len: number): number => {
    let sum = 0;
    let pos = len - 7;
    for (let i = len; i >= 1; i--) {
      sum += +cnpj[len - i] * pos--;
      if (pos < 2) pos = 9;
    }
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return digit(12) === +cnpj[12] && digit(13) === +cnpj[13];
}

/** Aceita CPF (11 dígitos) ou CNPJ (14 dígitos), validando o dígito verificador. */
export function isValidDocumento(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 11) return isValidCPF(value);
  if (digits.length === 14) return isValidCNPJ(value);
  return false;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Telefone BR: DDD + número (10 ou 11 dígitos). Aceita máscara/espaços. */
export function isValidPhone(value: string): boolean {
  const d = value.replace(/\D/g, '');
  return d.length === 10 || d.length === 11;
}

/** Só os dígitos, com 55 na frente (pra link wa.me). */
export function toWhatsapp(value: string): string {
  const d = value.replace(/\D/g, '');
  return d.startsWith('55') ? d : `55${d}`;
}
