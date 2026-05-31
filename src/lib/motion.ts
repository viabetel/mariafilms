// Linguagem de movimento da Maria Films — uma única fonte da verdade para
// durações e curvas, espelhando a sensação do showreel em Remotion.
// Tudo aqui é "tempo de câmera": entradas decididas, saídas que deslizam.

export const EASE = {
  // entradas de elementos (decididas, com leve overshoot ótico)
  in: 'power3.out',
  // movimentos de câmera / longos percursos (aceleração e freio suaves)
  camera: 'expo.inOut',
  // revelação de texto por máscara
  reveal: 'power4.out',
  // micro-interações (hover, toggles)
  micro: 'power2.out',
  // saídas
  out: 'power2.in',
} as const;

export const DUR = {
  micro: 0.4,
  base: 0.8,
  slow: 1.2,
  cinematic: 1.8,
} as const;

// Curvas bezier equivalentes para usar em CSS (transition-timing-function)
// quando não vale a pena instanciar uma tween GSAP.
export const CSS_EASE = {
  in: 'cubic-bezier(0.16, 1, 0.3, 1)', // ~power3.out
  camera: 'cubic-bezier(0.83, 0, 0.17, 1)', // ~expo.inOut
} as const;

// Detecta a preferência do usuário por menos movimento. Centralizado para
// que TODA animação possa degradar para um fade simples.
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
