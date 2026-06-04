// Registro central dos plugins GSAP usados no site.
// Importar SEMPRE a partir daqui (e não de 'gsap' direto) para garantir
// que os plugins já estejam registrados antes do primeiro uso.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText, useGSAP };
