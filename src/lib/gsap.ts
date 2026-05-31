// Registro central dos plugins GSAP usados no site.
// Importar SEMPRE a partir daqui (e não de 'gsap' direto) para garantir
// que os plugins já estejam registrados antes do primeiro uso.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, Flip, SplitText);

export { gsap, ScrollTrigger, Flip, SplitText, useGSAP };
