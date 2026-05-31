import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/motion';

/**
 * Smooth scroll inercial (Lenis) acoplado ao ticker do GSAP e ao ScrollTrigger.
 * É a base que faz o site inteiro "flutuar" como uma tomada de câmera.
 *
 * - O Lenis assume o controle do scroll e atualiza o ScrollTrigger a cada frame.
 * - Em prefers-reduced-motion, NÃO instanciamos o Lenis: o scroll nativo volta
 *   a valer e os ScrollTriggers continuam funcionando normalmente.
 */
// Instância ativa do Lenis, compartilhada com scrollToSection.
let lenisInstance: Lenis | null = null;

/** Acesso à instância ativa do Lenis (null em reduced-motion). */
export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.15,
      // curva de saída exponencial — desaceleração longa e cinematográfica
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.3,
      touchMultiplier: 1.8,
    });
    lenisInstance = lenis;

    // Mantém o ScrollTrigger em sincronia com a posição virtual do Lenis.
    lenis.on('scroll', ScrollTrigger.update);

    // Um único loop de animação: o ticker do GSAP dirige o Lenis.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return <>{children}</>;
}

/** Rola suavemente até um seletor, respeitando o Lenis quando presente. */
export function scrollToSection(target: string) {
  const lenis = lenisInstance;
  const el = document.querySelector(target);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el as HTMLElement, { offset: 0, duration: 1.4 });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}
