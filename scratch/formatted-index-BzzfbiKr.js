import {
  n as e,r as t,t as n
}from"./vendor-CcKmb8vp.js";
(function() {
  let e=document.createElement(`link`).relList;
  if(e&&e.supports&&e.supports(`modulepreload`))return;
  for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);
  new MutationObserver(e=> {
    for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)
  }).observe(document, {
    childList:!0,subtree:!0
  });
  function t(e) {
    let t= {
    };
    return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t
  }function n(e) {
    if(e.ep)return;
    e.ep=!0;
    let n=t(e);
    fetch(e.href,n)
  }
})();
var r=t(),i=e();
function a(e) {
  let[t,n]=(0,r.useState)(0);
  return(0,r.useEffect)(()=> {
    let t=()=> {
      if(!e.current)return;
      let t=e.current.getBoundingClientRect(),r=t.height-window.innerHeight;
      if(r<=0) {
        n(0);
        return
      }let i=-t.top;
      n(Math.max(0,Math.min(1,i/r)))
    };
    return window.addEventListener(`scroll`,t, {
      passive:!0
    }),window.addEventListener(`resize`,t),t(),()=> {
      window.removeEventListener(`scroll`,t),window.removeEventListener(`resize`,t)
    }
  },[e]),t
}var o=n();
function s( {
  scrollProgress:e,frameCount:t=130
}) {
  let n=(0,r.useRef)(null),[i,a]=(0,r.useState)(null),s=(0,r.useRef)([]),c=(0,r.useRef)( {
    currentFrame:0,targetFrame:0
  });
  return(0,r.useEffect)(()=> {
    let e=!0;
    return(async()=> {
      try {
        let n=Array(t),r=0,i=async t=> {
          let i=t+1,a=`/frames/frame_$ {
            String(i).padStart(3,`0`)
          }.webp`,o=new Image;
          if(o.src=a,await new Promise(e=> {
            o.onload=()=>e(),o.onerror=()=> {
              console.warn(`falha ao carregar frame $ {
                i
              }`),e()
            }
          }),e) {
            if(o.complete&&o.naturalWidth>0)try {
              n[t]=await createImageBitmap(o)
            }catch(e) {
              console.warn(`falha ao criar bitmap para o frame $ {
                i
              }`,e)
            }r++
          }
        },a=[...Array(t).keys()];
        await Promise.all(Array(20).fill(null).map(async()=> {
          for(;
          a.length>0&&e;
          )await i(a.shift())
        })),e&&(s.current=n.filter(e=>!!e))
      }catch(t) {
        console.error(`erro ao carregar frames estáticos:`,t),e&&a(t instanceof Error?t.message:`erro ao carregar frames`)
      }
    })(),()=> {
      e=!1,s.current.forEach(e=>e.close())
    }
  },[t]),(0,r.useEffect)(()=> {
    let n;
    n=e<=.5?e/.5*(t-1):(1-e)/.5*(t-1),c.current.targetFrame=n
  },[e,t]),(0,r.useEffect)(()=> {
    let e,t=(e,t)=> {
      let n=e.canvas.width,r=e.canvas.height,i=t.width,a=t.height;
      if(e.clearRect(0,0,n,r),n<r) {
        let o=Math.max(n/i,r*.55/a),s=i*o,c=a*o,l=(n-s)/2,u=(r-c)/2;
        e.drawImage(t,0,0,i,a,l,u,s,c)
      }else {
        let o=Math.max(n/i,r/a),s=(i-n/o)/2,c=(a-r/o)/2,l=n/o,u=r/o,d=.72,f=n*d,p=r*d,m=(n-f)/2,h=(r-p)/2;
        e.drawImage(t,s,c,l,u,m,h,f,p)
      }
    },r=()=> {
      let i=n.current;
      if(!i) {
        e=requestAnimationFrame(r);
        return
      }let a=i.getContext(`2d`),o=s.current;
      if(a&&o.length>0) {
        let e=c.current.targetFrame-c.current.currentFrame;
        c.current.currentFrame+=e*.08;
        let n=o[Math.max(0,Math.min(o.length-1,Math.round(c.current.currentFrame)))];
        n&&t(a,n)
      }e=requestAnimationFrame(r)
    };
    return r(),()=> {
      cancelAnimationFrame(e)
    }
  },[]),(0,r.useEffect)(()=> {
    let e=()=> {
      let e=n.current;
      e&&(e.width=window.innerWidth,e.height=window.innerHeight)
    };
    return window.addEventListener(`resize`,e),e(),()=> {
      window.removeEventListener(`resize`,e)
    }
  },[]),i?(0,o.jsxs)(`div`, {
    className:`absolute inset-0 w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden`,children:[(0,o.jsx)(`div`, {
      className:`absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem]`
    }),(0,o.jsx)(`div`, {
      className:`relative w-64 h-64 md:w-96 md:h-96 opacity-25`,style: {
        transform:`rotate($ {
          e*360
        }deg) scale($ {
          1+e*.15
        })`
      },children:(0,o.jsxs)(`svg`, {
        viewBox:`0 0 100 100`,fill:`none`,stroke:`currentColor`,className:`w-full h-full text-white`,strokeWidth:`0.5`,children:[(0,o.jsx)(`circle`, {
          cx:`50`,cy:`50`,r:`45`,strokeDasharray:`2,2`
        }),(0,o.jsx)(`circle`, {
          cx:`50`,cy:`50`,r:`35`
        }),(0,o.jsx)(`circle`, {
          cx:`50`,cy:`50`,r:`25`
        }),(0,o.jsx)(`circle`, {
          cx:`50`,cy:`50`,r:`10`,strokeDasharray:`1,1`
        }),(0,o.jsx)(`path`, {
          d:`M 50 15 L 68 35 M 68 35 L 75 65 M 75 65 L 50 85 M 50 85 L 25 65 M 25 65 L 32 35 M 32 35 L 50 15`
        })]
      })
    }),(0,o.jsx)(`div`, {
      className:`absolute bottom-24 text-center`,children:(0,o.jsx)(`span`, {
        className:`text-[10px] tracking-widest text-neutral-500 uppercase font-display-tech`,children:`[ rotação de câmera (fallback wireframe) ]`
      })
    })]
  }):(0,o.jsx)(`div`, {
    className:`absolute inset-0 w-full h-full bg-black`,children:(0,o.jsx)(`canvas`, {
      ref:n,className:`w-full h-full block object-cover opacity-60 mix-blend-screen`,style: {
        filter:`grayscale(1) contrast(1.1)`
      }
    })
  })
}var c=[ {
  id:`narrative`,num:`01 // narrativa`,category:`cinematografia`,title:`filmes autorais`,description:`criando universos de ficção imersivos, com foco em desenvolvimento de personagens e estética profunda.`,image:`/cinematic_narrative.webp`,details:[`ano: 2025`,`direção: maria eduarda`,`formato: curta-metragem`,`status: premiado`]
}, {
  id:`commercial`,num:`02 // comercial`,category:`marcas`,title:`filmes publicitários`,description:`direção de cena e fotografia de alto impacto para marcas, destacando a essência do produto com dinamismo.`,image:`/commercial_films.webp`,details:[`clientes: audi, vogue`,`serviços: dir. de fotografia`,`formato: campanha digital`,`ano: 2026`]
}, {
  id:`documentary`,num:`03 // documentário`,category:`vida real`,title:`documentários`,description:`capturando a verdade humana com luz natural, focado em emoções reais, texturas e atmosferas autênticas.`,image:`/documentary_stories.webp`,details:[`ano: 2025`,`produção: independente`,`captação: luz natural`,`áudio: som direto`]
}, {
  id:`fashion`,num:`04 // fashion`,category:`moda & beleza`,title:`fashion films`,description:`exploração estética ousada, coreografia visual e direção de arte impecável para o universo da alta costura.`,image:`/cinematic_narrative.webp`,details:[`marcas: local`,`estilo: editorial em movimento`,`formato: reels/tiktok`,`ano: 2026`]
}, {
  id:`music`,num:`05 // música`,category:`ritmo visual`,title:`videoclipes`,description:`sincronizando batidas com cortes cinematográficos. direção vibrante focada na performance do artista.`,image:`/commercial_films.webp`,details:[`artistas: cenário indie`,`direção: maria eduarda`,`formato: clipe musical`,`ano: 2025`]
}, {
  id:`corporate`,num:`06 // corporativo`,category:`institucional`,title:`brand manifesto`,description:`traduzindo valores de grandes empresas em manifestos visuais emocionantes que engajam clientes e equipes.`,image:`/documentary_stories.webp`,details:[`formato: manifesto interno`,`foco: narrativa corporativa`,`captação: estúdio`,`status: em andamento`]
}];
function l() {
  return(0,o.jsxs)(`section`, {
    id:`films`,className:`relative bg-black w-full py-16 md:py-24 px-4 md:px-10 flex flex-col gap-8 md:gap-12 z-20`,children:[(0,o.jsxs)(`div`, {
      className:`flex flex-col gap-2`,children:[(0,o.jsx)(`span`, {
        className:`text-neutral-500 text-[10px] uppercase tracking-[0.3em] font-display-tech font-semibold`,children:`portfólio selecionado`
      }),(0,o.jsx)(`h2`, {
        className:`hero-title text-white font-medium text-[8vw] md:text-[5vw] leading-none lowercase`,children:`trabalhos recentes`
      })]
    }),(0,o.jsx)(`div`, {
      className:`flex flex-col md:flex-row md:h-[65vh] gap-3 md:gap-4 w-full`,children:c.map(e=>(0,o.jsxs)(`div`, {
        className:`group flex-1 min-h-[220px] md:min-h-0 h-full overflow-hidden relative rounded-2xl transition-all duration-700 ease-in-out cursor-pointer hover:flex-[4.0] md:hover:flex-[6.0] bg-neutral-900 border border-white/5`,children:[(0,o.jsx)(`img`, {
          src:e.image,alt:e.title,className:`absolute inset-0 w-full h-full object-cover opacity-40 transition-all duration-700 ease-in-out grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-60`
        }),(0,o.jsx)(`div`, {
          className:`absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none`
        }),(0,o.jsxs)(`div`, {
          className:`absolute inset-0 p-6 flex flex-col justify-between z-10`,children:[(0,o.jsxs)(`div`, {
            className:`flex justify-between items-start`,children:[(0,o.jsx)(`span`, {
              className:`text-white/30 text-[10px] font-normal tracking-wider uppercase font-display-tech`,children:e.num
            }),(0,o.jsx)(`div`, {
              className:`opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 border border-white/20 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-[#ff007f] hover:text-white hover:border-[#ff007f] hover:shadow-[0_0_15px_rgba(255,0,127,0.4)]`,children:(0,o.jsx)(`svg`, {
                xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:`1.5`,stroke:`currentColor`,className:`w-4 h-4 fill-current`,children:(0,o.jsx)(`path`, {
                  strokeLinecap:`round`,strokeLinejoin:`round`,d:`M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z`
                })
              })
            })]
          }),(0,o.jsxs)(`div`, {
            className:`flex flex-col gap-1`,children:[(0,o.jsx)(`span`, {
              className:`text-neutral-400 text-[10px] uppercase tracking-widest font-display-tech`,children:e.category
            }),(0,o.jsx)(`h3`, {
              className:`hero-title text-white text-2xl md:text-3xl font-medium tracking-tight leading-none lowercase`,children:e.title
            }),(0,o.jsx)(`p`, {
              className:`text-neutral-400 text-xs md:text-sm max-w-md mt-2 leading-relaxed opacity-100 md:opacity-0 max-h-20 md:max-h-0 overflow-hidden transition-all duration-500 ease-in-out md:group-hover:opacity-100 md:group-hover:max-h-20 lowercase`,children:e.description
            }),(0,o.jsx)(`div`, {
              className:`flex flex-wrap gap-x-4 gap-y-1 mt-3 opacity-70 md:opacity-0 max-h-16 md:max-h-0 overflow-hidden transition-all duration-700 ease-in-out md:group-hover:opacity-70 md:group-hover:max-h-16 text-[10px] font-display-tech text-neutral-400 border-t border-white/10 pt-2`,children:e.details.map((e,t)=>(0,o.jsx)(`span`, {
                className:`lowercase`,children:e
              },t))
            })]
          })]
        })]
      },e.id))
    })]
  })
}function u() {
  let e=(0,r.useRef)(null),t=a(e),[n,i]=(0,r.useState)(!1);
  (0,r.useEffect)(()=> {
    let e=()=> {
      i(window.innerWidth<768)
    };
    return e(),window.addEventListener(`resize`,e),()=>window.removeEventListener(`resize`,e)
  },[]);
  let s=t<.12?12:12+((t-.12)/.88)**1.8*138,c=t<.12?1:1+((t-.12)/.88)**1.8*11.5,l=t*480;
  return(0,o.jsx)(`section`, {
    ref:e,id:`contact`,className:`relative h-[350vh] bg-black z-25`,children:(0,o.jsxs)(`div`, {
      className:`sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-black`,children:[(0,o.jsx)(`div`, {
        className:`absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none`
      }),(0,o.jsxs)(`div`, {
        className:`absolute inset-0 w-full h-full overflow-hidden transition-all duration-75 ease-out`,style: {
          clipPath:`circle($ {
            s
          }vw at 50% 50%)`,WebkitClipPath:`circle($ {
            s
          }vw at 50% 50%)`
        },children:[(0,o.jsxs)(`video`, {
          autoPlay:!0,loop:!0,muted:!0,playsInline:!0,className:`absolute inset-0 w-full h-full object-cover scale-105`,children:[(0,o.jsx)(`source`, {
            src:`/Efeit Festa.webm`,type:`video/webm`
          }),(0,o.jsx)(`source`, {
            src:`/Efeit Festa.mp4`,type:`video/mp4`
          })]
        }),(0,o.jsx)(`div`, {
          className:`absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none mix-blend-multiply opacity-50`
        })]
      }),(0,o.jsx)(`div`, {
        className:`absolute pointer-events-none w-72 h-72 md:w-96 md:h-96 transition-all duration-75 ease-out text-white/40`,style: {
          transform:`rotate($ {
            l
          }deg) scale($ {
            c
          })`,opacity:t>.85?Math.max(0,1-(t-.85)*10):1
        },children:(0,o.jsxs)(`svg`, {
          viewBox:`0 0 100 100`,fill:`none`,stroke:`currentColor`,className:`w-full h-full`,strokeWidth:`0.5`,children:[(0,o.jsx)(`circle`, {
            cx:`50`,cy:`50`,r:`48`,strokeDasharray:`1,1.5`
          }),(0,o.jsx)(`circle`, {
            cx:`50`,cy:`50`,r:`45`
          }),(0,o.jsx)(`circle`, {
            cx:`50`,cy:`50`,r:`44`,strokeDasharray:`3,6`
          }),(0,o.jsx)(`circle`, {
            cx:`50`,cy:`50`,r:`28`
          }),(0,o.jsx)(`circle`, {
            cx:`50`,cy:`50`,r:`27`,strokeDasharray:`1,1`
          }),(0,o.jsx)(`path`, {
            d:`M 50 2 L 50 10 M 50 90 L 50 98 M 2 50 L 10 50 M 90 50 L 98 50`
          }),(0,o.jsx)(`path`, {
            d:`M 50 22 C 55 30 65 35 72 35`
          }),(0,o.jsx)(`path`, {
            d:`M 72 35 C 75 42 75 52 72 65`
          }),(0,o.jsx)(`path`, {
            d:`M 72 65 C 65 72 55 77 50 78`
          }),(0,o.jsx)(`path`, {
            d:`M 50 78 C 45 77 35 72 28 65`
          }),(0,o.jsx)(`path`, {
            d:`M 28 65 C 25 52 25 42 28 35`
          }),(0,o.jsx)(`path`, {
            d:`M 28 35 C 35 30 45 22 50 22`
          })]
        })
      }),(0,o.jsxs)(`div`, {
        className:`absolute inset-0 z-20 flex items-center justify-center pointer-events-none`,children:[(0,o.jsxs)(`div`, {
          style:(()=> {
            let e=.1,n=t-.22,r=Math.abs(n)<e&&t<.82,i=r?1-(Math.abs(n)/e)**2:0,a=r?Math.abs(n)*40:20;
            return {
              opacity:i,display:r?`flex`:`none`,filter:`blur($ {
                a
              }px)`
            }
          })(),className:`absolute flex-col items-center text-center px-6 transition-all duration-300 ease-out`,children:[(0,o.jsx)(`span`, {
            className:`text-neutral-400/60 text-[10px] tracking-[0.35em] uppercase mb-4 block font-display-tech font-semibold`,children:`[ manifesto // parte i ]`
          }),(0,o.jsx)(`div`, {
            className:`text-[8vw] md:text-[5vw] text-white font-extrabold tracking-tighter leading-none lowercase mb-2 transition-transform duration-300`,style: {
              transform:`translateX($ {
                (.22-t)*(n?35:150)
              }px)`
            },children:`a essência da cena`
          }),(0,o.jsx)(`div`, {
            className:`text-[11vw] md:text-[7vw] font-black tracking-tighter leading-none lowercase mb-2 transition-transform duration-300`,style: {
              WebkitTextStroke:`1.5px rgba(255, 255, 255, 0.8)`,color:`transparent`,transform:`scale($ {
                1+Math.abs(t-.22)*(n?.25:.5)
              })`
            },children:`está na verdade`
          }),(0,o.jsx)(`div`, {
            className:`text-[9vw] md:text-[6vw] text-white font-extrabold tracking-tighter leading-none lowercase transition-transform duration-300`,style: {
              transform:`translateX($ {
                (t-.22)*(n?35:150)
              }px)`
            },children:`do movimento`
          })]
        }),(0,o.jsxs)(`div`, {
          style:(()=> {
            let e=.1,n=t-.45,r=Math.abs(n)<e&&t<.82,i=r?1-(Math.abs(n)/e)**2:0,a=r?Math.abs(n)*40:20;
            return {
              opacity:i,display:r?`flex`:`none`,filter:`blur($ {
                a
              }px)`
            }
          })(),className:`absolute flex-col items-center text-center px-6 transition-all duration-300 ease-out`,children:[(0,o.jsx)(`span`, {
            className:`text-neutral-400/60 text-[10px] tracking-[0.35em] uppercase mb-4 block font-display-tech font-semibold`,children:`[ manifesto // parte ii ]`
          }),(0,o.jsx)(`div`, {
            className:`text-[9vw] md:text-[6vw] text-white font-extrabold tracking-tighter leading-none lowercase mb-2 transition-transform duration-300`,style: {
              transform:`translateX($ {
                (.45-t)*(n?35:180)
              }px)`
            },children:`cada corte é um`
          }),(0,o.jsx)(`div`, {
            className:`text-[11vw] md:text-[6.5vw] font-black tracking-tighter leading-none lowercase mb-2 transition-transform duration-300`,style: {
              WebkitTextStroke:`1.5px rgba(255, 255, 255, 0.8)`,color:`transparent`,transform:`rotate($ {
                (t-.45)*(n?4:15)
              }deg)`
            },children:`instante esculpido`
          }),(0,o.jsx)(`div`, {
            className:`text-[12vw] md:text-[7vw] text-white font-extrabold tracking-tighter leading-none lowercase transition-transform duration-300`,style: {
              transform:`translateX($ {
                (t-.45)*(n?35:180)
              }px)`
            },children:`no tempo`
          })]
        }),(0,o.jsxs)(`div`, {
          style:(()=> {
            let e=.1,n=t-.68,r=Math.abs(n)<e&&t<.82,i=r?1-(Math.abs(n)/e)**2:0,a=r?Math.abs(n)*40:20;
            return {
              opacity:i,display:r?`flex`:`none`,filter:`blur($ {
                a
              }px)`
            }
          })(),className:`absolute flex-col items-center text-center px-6 transition-all duration-300 ease-out`,children:[(0,o.jsx)(`span`, {
            className:`text-neutral-400/60 text-[10px] tracking-[0.35em] uppercase mb-4 block font-display-tech font-semibold`,children:`[ manifesto // parte iii ]`
          }),(0,o.jsx)(`div`, {
            className:`text-[8vw] md:text-[5vw] text-white font-extrabold tracking-tighter leading-none lowercase mb-2 transition-transform duration-300`,style: {
              transform:`translateY($ {
                (.68-t)*(n?25:100)
              }px)`
            },children:`direção que dá`
          }),(0,o.jsx)(`div`, {
            className:`text-[12vw] md:text-[7.5vw] font-black tracking-tighter leading-none lowercase mb-2 transition-transform duration-300`,style: {
              WebkitTextStroke:`1.5px rgba(255, 255, 255, 0.8)`,color:`transparent`,transform:`scale($ {
                1-Math.abs(t-.68)*.2
              })`
            },children:`alma e ritmo`
          }),(0,o.jsx)(`div`, {
            className:`text-[10vw] md:text-[6.5vw] text-white font-extrabold tracking-tighter leading-none lowercase transition-transform duration-300`,style: {
              transform:`translateY($ {
                (t-.68)*(n?25:100)
              }px)`
            },children:`às imagens`
          })]
        }),(0,o.jsxs)(`div`, {
          style:(()=> {
            let e=.75,n=t>e,r=n?Math.min(1,(t-e)/.1):0,i=n?Math.max(0,15-(t-e)/.1*15):15,a=n?Math.max(0,50-(t-e)/.1*50):50;
            return {
              opacity:r,display:n?`flex`:`none`,filter:`blur($ {
                i
              }px)`,transform:`translateY($ {
                a
              }px)`
            }
          })(),className:`absolute flex-col items-center text-center px-6 transition-all duration-300 ease-out pointer-events-auto`,children:[(0,o.jsx)(`span`, {
            className:`text-neutral-400/60 text-[10px] tracking-[0.35em] uppercase mb-4 block font-display-tech font-semibold select-none`,children:`[ contato // let's create ]`
          }),(0,o.jsx)(`h2`, {
            className:`hero-title text-white text-[9vw] md:text-[7vw] font-black tracking-tighter leading-none lowercase mb-1`,children:`coloque sua visão`
          }),(0,o.jsx)(`h2`, {
            className:`hero-title text-[9vw] md:text-[7vw] font-black tracking-tighter leading-none lowercase mb-6`,style: {
              WebkitTextStroke:`1.5px rgba(255, 255, 255, 0.8)`,color:`transparent`
            },children:`em movimento`
          }),(0,o.jsx)(`p`, {
            className:`max-w-[420px] text-xs md:text-sm text-white/70 mb-8 leading-relaxed lowercase`,children:`seja para um comercial, documentário ou narrativa autoral. vamos traduzir sua mensagem em imagens inesquecíveis.`
          }),(0,o.jsxs)(`div`, {
            className:`flex flex-col items-center gap-6 w-full`,children:[(0,o.jsxs)(`a`, {
              href:`mailto:contato@mariafilms.com`,className:`group/btn relative flex items-center justify-between bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-normal rounded-full h-14 px-8 w-60 hover:w-72 hover:bg-[#ff007f] hover:border-[#ff007f] hover:text-white transition-all duration-500 ease-in-out shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,0,127,0.4)]`,children:[(0,o.jsx)(`span`, {
                className:`lowercase font-medium tracking-tight`,children:`vamos conversar`
              }),(0,o.jsx)(`span`, {
                className:`opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 delay-100 flex items-center`,children:(0,o.jsx)(`svg`, {
                  xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:`2`,stroke:`currentColor`,className:`w-4 h-4 ml-1`,children:(0,o.jsx)(`path`, {
                    strokeLinecap:`round`,strokeLinejoin:`round`,d:`M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3`
                  })
                })
              })]
            }),(0,o.jsxs)(`div`, {
              className:`flex items-center gap-6 mt-2`,children:[(0,o.jsx)(`a`, {
                href:`https://instagram.com`,target:`_blank`,rel:`noreferrer`,className:`text-neutral-400 hover:text-[#ff007f] transition-all duration-300 hover:scale-110 p-2`,"aria-label":`Instagram`,children:(0,o.jsxs)(`svg`, {
                  xmlns:`http://www.w3.org/2000/svg`,width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,o.jsx)(`rect`, {
                    x:`2`,y:`2`,width:`20`,height:`20`,rx:`5`,ry:`5`
                  }),(0,o.jsx)(`path`, {
                    d:`M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z`
                  }),(0,o.jsx)(`line`, {
                    x1:`17.5`,y1:`6.5`,x2:`17.51`,y2:`6.5`
                  })]
                })
              }),(0,o.jsx)(`a`, {
                href:`https://vimeo.com`,target:`_blank`,rel:`noreferrer`,className:`text-neutral-400 hover:text-[#ff007f] transition-all duration-300 hover:scale-110 p-2`,"aria-label":`Vimeo`,children:(0,o.jsxs)(`svg`, {
                  xmlns:`http://www.w3.org/2000/svg`,width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,o.jsx)(`path`, {
                    d:`M22 6.54c-1.35.53-2.92.83-4.11.83C15.86 7.37 14 9.17 14 11.23c0 2.21 1.95 3.9 4.14 3.9 1.15 0 2.65-.26 3.86-.71V6.54z`
                  }),(0,o.jsx)(`path`, {
                    d:`M2 11.23c0-2.21 1.95-3.9 4.14-3.9 1.15 0 2.65.26 3.86.71v7.88c-1.35-.53-2.92-.83-4.11-.83C3.86 15.13 2 13.33 2 11.23z`
                  }),(0,o.jsx)(`path`, {
                    d:`M10 6.54c-1.35.53-2.92.83-4.11.83v7.88c1.35-.53 2.92-.83 4.11-.83V6.54z`
                  })]
                })
              }),(0,o.jsx)(`a`, {
                href:`https://youtube.com`,target:`_blank`,rel:`noreferrer`,className:`text-neutral-400 hover:text-[#ff007f] transition-all duration-300 hover:scale-110 p-2`,"aria-label":`YouTube`,children:(0,o.jsxs)(`svg`, {
                  xmlns:`http://www.w3.org/2000/svg`,width:`20`,height:`20`,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,children:[(0,o.jsx)(`path`, {
                    d:`M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z`
                  }),(0,o.jsx)(`polygon`, {
                    points:`9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02`
                  })]
                })
              })]
            }),(0,o.jsxs)(`div`, {
              className:`mt-12 w-full max-w-md border-t border-white/10 pt-8 opacity-40`,children:[(0,o.jsx)(`span`, {
                className:`text-[9px] uppercase tracking-[0.25em] text-neutral-400 block mb-4 font-display-tech font-semibold`,children:`parceiros & clientes`
              }),(0,o.jsxs)(`div`, {
                className:`flex justify-center items-center gap-6 md:gap-8 text-[11px] font-medium tracking-widest text-neutral-300 uppercase font-display-tech`,children:[(0,o.jsx)(`span`, {
                  children:`vogue`
                }),(0,o.jsx)(`span`, {
                  className:`text-white/20`,children:`•`
                }),(0,o.jsx)(`span`, {
                  children:`audi`
                }),(0,o.jsx)(`span`, {
                  className:`text-white/20`,children:`•`
                }),(0,o.jsx)(`span`, {
                  children:`red bull`
                }),(0,o.jsx)(`span`, {
                  className:`text-white/20`,children:`•`
                }),(0,o.jsx)(`span`, {
                  children:`netflix`
                })]
              })]
            })]
          })]
        })]
      }),(0,o.jsx)(`div`, {
        className:`absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-30 select-none`,children:[0,1,2,3].map(n=> {
          let r=!1;
          return n===0&&(r=t>=.08&&t<.33),n===1&&(r=t>=.33&&t<.56),n===2&&(r=t>=.56&&t<.8),n===3&&(r=t>=.8),(0,o.jsxs)(`div`, {
            className:`flex items-center justify-end gap-2.5 group cursor-pointer pointer-events-auto`,onClick:()=> {
              if(!e.current)return;
              let t=e.current.getBoundingClientRect(),r=t.height-window.innerHeight,i=.22;
              n===1&&(i=.45),n===2&&(i=.68),n===3&&(i=.85),window.scrollTo( {
                top:window.scrollY+t.top+i*r,behavior:`smooth`
              })
            },children:[(0,o.jsxs)(`span`, {
              className:`hidden md:inline-block text-[8px] uppercase tracking-widest text-[#ff007f] font-display-tech opacity-0 group-hover:opacity-100 transition-all duration-300 $ {
                r?`opacity-100 font-bold`:``
              }`,children:[n===0&&`essência`,n===1&&`esculpir`,n===2&&`ritmo`,n===3&&`contato`]
            }),(0,o.jsx)(`div`, {
              className:`w-2 h-2 rounded-full border transition-all duration-300 $ {
                r?`bg-[#ff007f] border-[#ff007f] scale-125 shadow-[0_0_8px_#ff007f]`:`border-white/30 bg-transparent group-hover:border-white/70`
              }`
            })]
          },n)
        })
      }),(0,o.jsxs)(`div`, {
        className:`absolute bottom-10 left-6 md:left-10 flex flex-col gap-1 z-20 font-display-tech text-[10px] text-neutral-500 uppercase tracking-widest transition-opacity duration-300`,style: {
          opacity:t>.85?0:1
        },children:[(0,o.jsx)(`div`, {
          children:`focando // lente criativa`
        }),(0,o.jsxs)(`div`, {
          children:[`abertura // `,Math.round(s*10)/10,`vw`]
        })]
      })]
    })
  })
}function d( {
  onComplete:e
}) {
  let[t,n]=(0,r.useState)(0),[i,a]=(0,r.useState)(!1);
  return(0,r.useEffect)(()=> {
    let e=0,t;
    n(15),e=15;
    let r=()=> {
      let i=1,a=30;
      e<50?(i=Math.floor(Math.random()*6)+4,a=Math.floor(Math.random()*30)+20):e<80?(i=Math.floor(Math.random()*3)+1,a=Math.floor(Math.random()*60)+40):e<96?(i=+(Math.random()>.5),a=Math.floor(Math.random()*100)+60):e<100&&(i=1,a=150),e=Math.min(100,e+i),n(e),e<100&&(t=setTimeout(r,a))
    };
    t=setTimeout(r,150);
    let i=()=> {
      e=100,n(100)
    };
    if(document.readyState===`complete`) {
      let e=setTimeout(()=> {
        n(100)
      },1e3);
      return()=> {
        clearTimeout(t),clearTimeout(e)
      }
    }else window.addEventListener(`load`,i);
    return()=> {
      clearTimeout(t),window.removeEventListener(`load`,i)
    }
  },[]),(0,r.useEffect)(()=> {
    if(t===100) {
      let t=setTimeout(()=> {
        a(!0);
        let t=setTimeout(()=> {
          e()
        },600);
        return()=>clearTimeout(t)
      },300);
      return()=>clearTimeout(t)
    }
  },[t,e]),(0,o.jsxs)(`div`, {
    className:`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white transition-all duration-700 ease-in-out $ {
      i?`opacity-0 scale-105 pointer-events-none`:`opacity-100 scale-100`
    }`,children:[(0,o.jsx)(`video`, {
      autoPlay:!0,loop:!0,muted:!0,playsInline:!0,className:`absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-screen z-0 pointer-events-none`,src:`/Efeit Festa.webm`
    }),(0,o.jsx)(`div`, {
      className:`absolute inset-0 z-10 pointer-events-none`,style: {
        background:`radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 90%)`
      }
    }),(0,o.jsxs)(`div`, {
      className:`absolute top-8 left-8 flex items-center gap-2 text-white/70 font-display-tech text-[10px] tracking-[0.25em] z-20 select-none`,children:[(0,o.jsx)(`span`, {
        className:`w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_#dc2626]`
      }),(0,o.jsx)(`span`, {
        className:`font-semibold`,children:`REC`
      })]
    }),(0,o.jsxs)(`div`, {
      className:`absolute top-8 right-8 flex flex-col items-end text-white/40 font-display-tech text-[9px] tracking-wider z-20 select-none`,children:[(0,o.jsx)(`span`, {
        children:`4K RAW // H.265`
      }),(0,o.jsx)(`span`, {
        className:`text-[#ff007f] font-semibold mt-0.5`,children:`24.00 FPS`
      })]
    }),(0,o.jsxs)(`div`, {
      className:`absolute bottom-8 left-8 flex flex-col items-start text-white/40 font-display-tech text-[9px] tracking-wider z-20 select-none`,children:[(0,o.jsx)(`span`, {
        children:`SHUTTER 1/48`
      }),(0,o.jsx)(`span`, {
        children:`ISO 800`
      }),(0,o.jsx)(`span`, {
        children:`WB 5600K`
      })]
    }),(0,o.jsxs)(`div`, {
      className:`absolute bottom-8 right-8 flex flex-col items-end gap-3.5 z-20 select-none`,children:[(0,o.jsxs)(`div`, {
        className:`flex items-end gap-[3px] h-4 text-white/30`,children:[(0,o.jsx)(`div`, {
          className:`w-[2px] bg-white/30 rounded-full animate-soundbar`,style: {
            height:`30%`,animationDelay:`0.1s`
          }
        }),(0,o.jsx)(`div`, {
          className:`w-[2px] bg-white/30 rounded-full animate-soundbar`,style: {
            height:`60%`,animationDelay:`0.3s`
          }
        }),(0,o.jsx)(`div`, {
          className:`w-[2px] bg-white/30 rounded-full animate-soundbar`,style: {
            height:`40%`,animationDelay:`0.2s`
          }
        }),(0,o.jsx)(`div`, {
          className:`w-[2px] bg-[#ff007f] rounded-full animate-soundbar shadow-[0_0_4px_#ff007f]`,style: {
            height:`80%`,animationDelay:`0.4s`
          }
        }),(0,o.jsx)(`div`, {
          className:`w-[2px] bg-[#ff007f] rounded-full animate-soundbar shadow-[0_0_4px_#ff007f]`,style: {
            height:`50%`,animationDelay:`0.0s`
          }
        })]
      }),(0,o.jsxs)(`div`, {
        className:`flex items-center gap-1.5 text-white/30 font-display-tech text-[9px]`,children:[(0,o.jsx)(`span`, {
          children:`BAT 98%`
        }),(0,o.jsx)(`div`, {
          className:`w-5 h-2.5 border border-white/20 rounded-[2px] p-[1.5px] flex items-center`,children:(0,o.jsx)(`div`, {
            className:`h-full bg-white/40 rounded-[0.5px] w-[90%]`
          })
        })]
      })]
    }),(0,o.jsx)(`div`, {
      className:`absolute top-6 left-6 w-5 h-5 border-t border-l border-white/10 z-20 pointer-events-none`
    }),(0,o.jsx)(`div`, {
      className:`absolute top-6 right-6 w-5 h-5 border-t border-r border-white/10 z-20 pointer-events-none`
    }),(0,o.jsx)(`div`, {
      className:`absolute bottom-6 left-6 w-5 h-5 border-b border-l border-white/10 z-20 pointer-events-none`
    }),(0,o.jsx)(`div`, {
      className:`absolute bottom-6 right-6 w-5 h-5 border-b border-r border-white/10 z-20 pointer-events-none`
    }),(0,o.jsxs)(`div`, {
      className:`flex flex-col items-center gap-3 z-20 text-center px-6`,children:[(0,o.jsx)(`h2`, {
        className:`font-serif-editorial italic text-4xl md:text-5xl text-white/90 tracking-wide select-none`,children:`maria films`
      }),(0,o.jsx)(`span`, {
        className:`text-[9px] tracking-[0.4em] text-neutral-500 uppercase font-display-tech font-semibold select-none`,children:`iniciando experiência`
      }),(0,o.jsxs)(`div`, {
        className:`flex items-start my-2`,children:[(0,o.jsx)(`span`, {
          className:`font-display-tech font-extrabold text-[15vw] md:text-[8vw] leading-none text-white tracking-tighter`,children:t
        }),(0,o.jsx)(`span`, {
          className:`text-xl md:text-2xl font-light text-[#ff007f] font-display-tech select-none -translate-y-1 block ml-0.5`,children:`%`
        })]
      }),(0,o.jsx)(`div`, {
        className:`w-48 h-[2px] bg-white/5 rounded-full overflow-hidden mt-1 relative`,children:(0,o.jsx)(`div`, {
          className:`h-full bg-gradient-to-r from-[#ff007f]/50 to-[#ff007f] transition-all duration-300 ease-out shadow-[0_0_10px_#ff007f]`,style: {
            width:`$ {
              t
            }%`
          }
        })
      })]
    })]
  })
}function f() {
  let e=(0,r.useRef)(null),t=(0,r.useRef)(null),n=(0,r.useRef)(null),i=(0,r.useRef)(null),a=(0,r.useRef)(null),s=(0,r.useRef)(null),c=(0,r.useRef)(null),[l,u]=(0,r.useState)(!1),[d,f]=(0,r.useState)(!1),[p,m]=(0,r.useState)(!1),[h,g]=(0,r.useState)(.8),[_,v]=(0,r.useState)(!1),y=(0,r.useRef)( {
    x:0,y:0,targetX:0,targetY:0,isHovered:!1,opacity:0,scale:.5
  });
  (0,r.useEffect)(()=> {
    u(`ontouchstart`in window||navigator.maxTouchPoints>0||window.matchMedia(`(pointer: coarse)`).matches)
  },[]),(0,r.useEffect)(()=> {
    if(l)return;
    let e,t=()=> {
      if(c.current) {
        let e=.12;
        y.current.x+=(y.current.targetX-y.current.x)*e,y.current.y+=(y.current.targetY-y.current.y)*e;
        let t=+!!y.current.isHovered;
        y.current.opacity+=(t-y.current.opacity)*e;
        let n=y.current.isHovered?1:.5;
        y.current.scale+=(n-y.current.scale)*e,c.current.style.transform=`translate3d($ {
          y.current.x-45
        }px, $ {
          y.current.y-45
        }px, 0) scale($ {
          y.current.scale
        })`,c.current.style.opacity=y.current.opacity.toString()
      }e=requestAnimationFrame(t)
    };
    return e=requestAnimationFrame(t),()=>cancelAnimationFrame(e)
  },[l]);
  let b=e=> {
    l||(y.current.targetX=e.clientX,y.current.targetY=e.clientY)
  },x=()=> {
    l||(y.current.isHovered=!0)
  },S=()=> {
    l||(y.current.isHovered=!1)
  };
  (0,r.useEffect)(()=> {
    n.current&&(d?n.current.pause():n.current.play().catch(()=> {
    }))
  },[d]),(0,r.useEffect)(()=> {
    t.current&&(t.current.volume=h,t.current.muted=_)
  },[h,_,d]),(0,r.useEffect)(()=> {
    let e=e=> {
      e.key===`Escape`&&d&&w()
    };
    return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)
  },[d]);
  let C=()=> {
    f(!0),m(!0),setTimeout(()=> {
      t.current&&t.current.play().catch(()=> {
      })
    },100)
  },w=e=> {
    e&&e.stopPropagation(),f(!1),m(!1),t.current&&t.current.pause()
  },T=e=> {
    e&&e.stopPropagation(),t.current&&(p?(t.current.pause(),m(!1)):(t.current.play().catch(()=> {
    }),m(!0)))
  },E=()=> {
    if(t.current&&a.current&&s.current) {
      let e=t.current.currentTime,n=t.current.duration||0,r=n>0?e/n*100:0;
      a.current.style.width=`$ {
        r
      }%`,s.current.innerHTML=`$ {
        M(e)
      } <span class="mx-1 text-white/20">/</span> $ {
        M(n)
      }`
    }
  },D=()=> {
    if(t.current&&s.current) {
      let e=t.current.currentTime,n=t.current.duration||0;
      s.current.innerHTML=`$ {
        M(e)
      } <span class="mx-1 text-white/20">/</span> $ {
        M(n)
      }`
    }
  },O=e=> {
    if(!i.current||!t.current)return;
    let n=t.current.duration;
    if(!n||isNaN(n))return;
    let r=i.current.getBoundingClientRect(),o=e.clientX-r.left,c=r.width,l=Math.max(0,Math.min(1,o/c)),u=l*n;
    t.current.currentTime=u,a.current&&s.current&&(a.current.style.width=`$ {
      l*100
    }%`,s.current.innerHTML=`$ {
      M(u)
    } <span class="mx-1 text-white/20">/</span> $ {
      M(n)
    }`)
  },k=e=> {
    e.stopPropagation(),v(!_)
  },A=e=> {
    let t=parseFloat(e.target.value);
    g(t),t>0&&v(!1)
  },j=e=> {
    e.stopPropagation(),t.current&&(t.current.requestFullscreen?t.current.requestFullscreen():t.current.webkitRequestFullscreen?t.current.webkitRequestFullscreen:t.current.msRequestFullscreen&&t.current.msRequestFullscreen)
  },M=e=> {
    if(isNaN(e))return`00:00`;
    let t=Math.floor(e/60),n=Math.floor(e%60);
    return`$ {
      String(t).padStart(2,`0`)
    }:$ {
      String(n).padStart(2,`0`)
    }`
  };
  return(0,o.jsxs)(o.Fragment, {
    children:[(0,o.jsxs)(`section`, {
      ref:e,className:`relative h-screen w-full bg-black overflow-hidden flex items-center justify-center snap-start snap-always z-20 $ {
        l?``:`cursor-none`
      }`,onMouseMove:b,onMouseEnter:x,onMouseLeave:S,onClick:C,children:[(0,o.jsxs)(`div`, {
        className:`absolute inset-0 w-full h-full opacity-40 transition-all duration-700 ease-in-out filter grayscale hover:grayscale-0 hover:scale-[1.02] hover:opacity-55`,children:[(0,o.jsxs)(`video`, {
          ref:n,autoPlay:!0,loop:!0,muted:!0,playsInline:!0,className:`w-full h-full object-cover`,children:[(0,o.jsx)(`source`, {
            src:`/Efeit Festa.webm`,type:`video/webm`
          }),(0,o.jsx)(`source`, {
            src:`/Efeit Festa.mp4`,type:`video/mp4`
          })]
        }),(0,o.jsx)(`div`, {
          className:`absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none`
        })]
      }),(0,o.jsx)(`div`, {
        className:`absolute top-6 left-6 md:left-10 z-10 text-[9px] font-display-tech tracking-[0.2em] text-neutral-500 uppercase select-none pointer-events-none`,children:`system // play_portfolio`
      }),(0,o.jsx)(`div`, {
        className:`absolute top-6 right-6 md:right-10 z-10 text-[9px] font-display-tech tracking-[0.2em] text-neutral-500 uppercase select-none pointer-events-none`,children:`aspect // 2.39:1`
      }),(0,o.jsx)(`div`, {
        className:`absolute bottom-6 left-6 md:left-10 z-10 text-[9px] font-display-tech tracking-[0.2em] text-neutral-500 uppercase select-none pointer-events-none`,children:`maria films // portfólio 2026`
      }),(0,o.jsxs)(`div`, {
        className:`relative z-10 text-center flex flex-col items-center gap-6 px-6 pointer-events-none select-none`,children:[(0,o.jsx)(`span`, {
          className:`text-[10px] tracking-[0.4em] text-neutral-400 font-display-tech uppercase font-semibold`,children:`[ apresentar // portfólio compilado ]`
        }),(0,o.jsxs)(`div`, {
          className:`flex flex-col gap-1 leading-none`,children:[(0,o.jsx)(`span`, {
            className:`font-serif-editorial italic text-[8vw] md:text-[4.5vw] font-light text-neutral-400 lowercase leading-[0.9]`,children:`assista ao`
          }),(0,o.jsx)(`span`, {
            className:`font-display-tech font-extrabold text-[10vw] md:text-[6.5vw] uppercase tracking-tighter text-white`,children:`showreel.`
          })]
        }),l&&(0,o.jsxs)(`div`, {
          className:`mt-4 flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-md px-6 py-3 rounded-full text-white text-xs uppercase tracking-widest font-display-tech font-medium pointer-events-auto`,children:[(0,o.jsx)(`svg`, {
            viewBox:`0 0 24 24`,fill:`currentColor`,className:`w-4 h-4 text-[#ff007f]`,children:(0,o.jsx)(`path`, {
              d:`M8 5v14l11-7z`
            })
          }),(0,o.jsx)(`span`, {
            children:`toque para assistir`
          })]
        })]
      }),!l&&(0,o.jsx)(`div`, {
        ref:c,className:`fixed top-0 left-0 w-[90px] h-[90px] rounded-full bg-[#ff007f]/20 border border-[#ff007f] flex items-center justify-center pointer-events-none z-50 transition-opacity duration-300 transition-transform ease-out flex flex-col`,style: {
          opacity:0,transform:`scale(0.5)`,backdropFilter:`blur(4px)`,WebkitBackdropFilter:`blur(4px)`,boxShadow:`0 0 20px rgba(255, 0, 127, 0.4)`
        },children:(0,o.jsx)(`span`, {
          className:`text-[10px] font-bold text-white font-display-tech tracking-wider uppercase`,children:`play`
        })
      })]
    }),d&&(0,o.jsxs)(`div`, {
      className:`fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 transition-all duration-500 ease-in-out`,onClick:()=>w(),children:[(0,o.jsx)(`button`, {
        className:`absolute top-6 right-6 md:top-10 md:right-10 z-50 p-3 rounded-full bg-white/5 border border-white/10 hover:border-[#ff007f] hover:bg-[#ff007f] hover:text-white transition-all duration-300 hover:rotate-90 text-neutral-400 group`,onClick:()=>w(),"aria-label":`Fechar vídeo`,children:(0,o.jsx)(`svg`, {
          xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:`2.5`,stroke:`currentColor`,className:`w-5 h-5`,children:(0,o.jsx)(`path`, {
            strokeLinecap:`round`,strokeLinejoin:`round`,d:`M6 18 18 6M6 6l12 12`
          })
        })
      }),(0,o.jsxs)(`div`, {
        className:`relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.8)] flex flex-col group/player pointer-events-auto`,onClick:e=>e.stopPropagation(),children:[(0,o.jsx)(`video`, {
          ref:t,src:`/camera_360.mp4`,className:`w-full h-full object-contain flex-grow cursor-pointer`,onClick:()=>T(),onTimeUpdate:E,onLoadedMetadata:D,playsInline:!0
        }),(0,o.jsxs)(`div`, {
          className:`absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col gap-4 transition-all duration-300 transform translate-y-0 opacity-100 md:opacity-0 md:translate-y-2 md:group-hover/player:opacity-100 md:group-hover/player:translate-y-0 z-20`,children:[(0,o.jsx)(`div`, {
            ref:i,className:`w-full h-1.5 md:h-2 bg-white/15 rounded-full cursor-pointer relative overflow-hidden group/timeline`,onClick:O,children:(0,o.jsx)(`div`, {
              ref:a,className:`absolute left-0 top-0 h-full bg-[#ff007f] rounded-full transition-all duration-75`,style: {
                width:`0%`
              }
            })
          }),(0,o.jsxs)(`div`, {
            className:`flex items-center justify-between text-white`,children:[(0,o.jsxs)(`div`, {
              className:`flex items-center gap-4`,children:[(0,o.jsx)(`button`, {
                onClick:()=>T(),className:`p-2 rounded-full hover:bg-white/10 hover:text-[#ff007f] transition-colors`,"aria-label":p?`Pausar vídeo`:`Reproduzir vídeo`,children:p?(0,o.jsx)(`svg`, {
                  xmlns:`http://www.w3.org/2000/svg`,fill:`currentColor`,viewBox:`0 0 24 24`,className:`w-5 h-5`,children:(0,o.jsx)(`path`, {
                    fillRule:`evenodd`,d:`M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z`,clipRule:`evenodd`
                  })
                }):(0,o.jsx)(`svg`, {
                  xmlns:`http://www.w3.org/2000/svg`,fill:`currentColor`,viewBox:`0 0 24 24`,className:`w-5 h-5`,children:(0,o.jsx)(`path`, {
                    fillRule:`evenodd`,d:`M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z`,clipRule:`evenodd`
                  })
                })
              }),(0,o.jsxs)(`span`, {
                ref:s,className:`text-xs md:text-sm font-display-tech text-neutral-300`,children:[`00:00 `,(0,o.jsx)(`span`, {
                  className:`mx-1 text-white/20`,children:`/`
                }),` 00:00`]
              })]
            }),(0,o.jsxs)(`div`, {
              className:`flex items-center gap-4`,children:[(0,o.jsxs)(`div`, {
                className:`flex items-center gap-2 group/volume`,children:[(0,o.jsx)(`button`, {
                  onClick:k,className:`p-2 rounded-full hover:bg-white/10 hover:text-[#ff007f] transition-colors`,"aria-label":_?`Ativar som`:`Desativar som`,children:_||h===0?(0,o.jsx)(`svg`, {
                    xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:`2.5`,stroke:`currentColor`,className:`w-4 h-4`,children:(0,o.jsx)(`path`, {
                      strokeLinecap:`round`,strokeLinejoin:`round`,d:`M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z`
                    })
                  }):(0,o.jsx)(`svg`, {
                    xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:`2.5`,stroke:`currentColor`,className:`w-4 h-4`,children:(0,o.jsx)(`path`, {
                      strokeLinecap:`round`,strokeLinejoin:`round`,d:`M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z`
                    })
                  })
                }),(0,o.jsx)(`input`, {
                  type:`range`,min:`0`,max:`1`,step:`0.05`,value:_?0:h,onChange:A,className:`w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ff007f] transition-all md:w-0 md:opacity-0 md:group-hover/volume:w-16 md:group-hover/volume:opacity-100`
                })]
              }),(0,o.jsx)(`button`, {
                onClick:j,className:`p-2 rounded-full hover:bg-white/10 hover:text-[#ff007f] transition-colors`,"aria-label":`Modo tela cheia`,children:(0,o.jsx)(`svg`, {
                  xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:`2.5`,stroke:`currentColor`,className:`w-4 h-4`,children:(0,o.jsx)(`path`, {
                    strokeLinecap:`round`,strokeLinejoin:`round`,d:`M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15`
                  })
                })
              })]
            })]
          })]
        })]
      })]
    })]
  })
}function p() {
  return(0,o.jsxs)(`section`, {
    id:`about`,className:`relative h-screen w-full bg-white text-black overflow-hidden flex items-center snap-start snap-always py-12 px-6 md:px-16 z-20`,children:[(0,o.jsx)(`div`, {
      className:`absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:6rem_6rem] pointer-events-none`
    }),(0,o.jsxs)(`div`, {
      className:`container mx-auto flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 w-full max-w-6xl relative z-10`,children:[(0,o.jsx)(`div`, {
        className:`w-full md:w-[42%] flex justify-center`,children:(0,o.jsx)(`div`, {
          className:`border border-black/10 p-2 md:p-3 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] rounded-2xl hover:rotate-1 hover:scale-[1.01] transition-all duration-500 ease-in-out group`,children:(0,o.jsx)(`div`, {
            className:`overflow-hidden rounded-xl h-[38vh] md:h-[52vh] w-[75vw] md:w-[360px] max-w-full`,children:(0,o.jsx)(`img`, {
              src:`/maria_portrait.png`,alt:`Maria Eduarda portrait`,className:`w-full h-full object-cover object-[center_20%] grayscale contrast-125 transition-transform duration-700 ease-out group-hover:scale-105`
            })
          })
        })
      }),(0,o.jsxs)(`div`, {
        className:`w-full md:w-[58%] flex flex-col gap-6 text-left`,children:[(0,o.jsxs)(`div`, {
          className:`flex flex-col gap-1.5`,children:[(0,o.jsx)(`span`, {
            className:`text-[10px] tracking-[0.3em] font-display-tech text-neutral-500 uppercase font-semibold`,children:`[ perfil editorial // maria eduarda ]`
          }),(0,o.jsx)(`div`, {
            className:`w-8 h-[1px] bg-[#ff007f]`
          })]
        }),(0,o.jsxs)(`h2`, {
          className:`font-serif-editorial italic text-3xl md:text-5xl leading-tight text-neutral-800 lowercase`,children:[`o cinema não é sobre registrar o real, é sobre `,(0,o.jsx)(`span`, {
            className:`font-bold text-black font-serif-editorial not-italic`,children:`capturar a alma da luz`
          }),` e esculpir o silêncio do tempo.`]
        }),(0,o.jsx)(`p`, {
          className:`text-xs md:text-[13px] text-neutral-600 leading-relaxed font-sans lowercase max-w-xl`,children:`diretora de cena e filmmaker independente. maria eduarda atua de forma autónoma, conduzindo cada projeto com uma visão singular e controle pessoal de cada etapa – desde a concepção visual e captação até a montagem final. sua abordagem foca na intimidade da cena, na textura da luz natural e na entrega de narrativas com assinatura autoral marcante.`
        }),(0,o.jsx)(`div`, {
          className:`font-serif-editorial italic text-2xl text-black select-none pl-3 border-l border-[#ff007f]/40 py-0.5`,children:`maria eduarda.`
        }),(0,o.jsxs)(`div`, {
          className:`grid grid-cols-2 gap-6 border-t border-black/10 pt-6 mt-2 text-[10px] font-display-tech uppercase text-neutral-400 tracking-wider`,children:[(0,o.jsxs)(`div`, {
            className:`flex flex-col gap-2`,children:[(0,o.jsx)(`span`, {
              className:`text-black font-bold tracking-widest text-[11px] font-display-tech`,children:`frentes //`
            }),(0,o.jsx)(`span`, {
              children:`direção de cena`
            }),(0,o.jsx)(`span`, {
              children:`direção de fotografia`
            }),(0,o.jsx)(`span`, {
              children:`montagem & color`
            })]
          }),(0,o.jsxs)(`div`, {
            className:`flex flex-col gap-2 border-l border-black/10 pl-6`,children:[(0,o.jsx)(`span`, {
              className:`text-black font-bold tracking-widest text-[11px] font-display-tech`,children:`estética //`
            }),(0,o.jsx)(`span`, {
              children:`luz natural & sombras`
            }),(0,o.jsx)(`span`, {
              children:`lentes prime anamórficas`
            }),(0,o.jsx)(`span`, {
              children:`ritmo e silêncio`
            })]
          })]
        })]
      })]
    }),(0,o.jsx)(`div`, {
      className:`absolute bottom-6 left-6 md:left-10 z-10 text-[9px] font-display-tech tracking-[0.2em] text-neutral-400 uppercase select-none pointer-events-none`,children:`about // autonomous_filmmaker`
    }),(0,o.jsx)(`div`, {
      className:`absolute bottom-6 right-6 md:right-10 z-10 text-[9px] font-display-tech tracking-[0.2em] text-neutral-400 uppercase select-none pointer-events-none`,children:`loc // independence_focus`
    })]
  })
}var m=[ {
  num:`01`,phase:`planejamento //`,title:`roteiro & ganchos`,subtitle:`a estratégia do primeiro segundo`,description:`antes de iniciar as gravações, desenhamos a estratégia do conteúdo. estruturamos roteiros dinâmicos focados nos primeiros 3 segundos (hooks de atenção) e organizamos a grade de ideias para tiktok, reels e youtube shorts.`,specs:[`roteirização`,`estratégia de gancho`,`análise de concorrência`,`decupagem de roteiro`]
}, {
  num:`02`,phase:`captação //`,title:`videomaking dinâmico`,subtitle:`imagens que geram engajamento`,description:`gravamos com equipamentos ágeis e portáteis de alta performance. focamos na captação de iluminação prática, enquadramentos modernos e transições orgânicas em câmera, garantindo que o material bruto seja dinâmico e otimizado para o consumo em tela vertical.`,specs:[`luz prática`,`transições em câmera`,`framing vertical (mobile)`,`áudio direcional`]
}, {
  num:`03`,phase:`lapidação //`,title:`edição & retenção`,subtitle:`o ritmo acelerado que magnetiza`,description:`na edição de vídeo, construímos a retenção da audiência. aplicamos cortes precisos no ritmo da música, efeitos sonoros (SFX) comerciais, legendas dinâmicas sincronizadas e um color grading vibrante para destacar a marca nas redes sociais.`,specs:[`cortes de ritmo`,`legendas dinâmicas`,`sound design comercial`,`color grading ativo`]
}];
function h() {
  let e=(0,r.useRef)(null),t=a(e),n=0;
  return t>=.33&&t<.66?n=1:t>=.66&&(n=2),(0,o.jsx)(`section`, {
    ref:e,className:`relative h-[250vh] bg-black text-white z-20`,id:`workflow-section`,children:(0,o.jsxs)(`div`, {
      className:`sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-black py-12 px-6 md:px-16`,children:[(0,o.jsx)(`div`, {
        className:`absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,0,127,0.04)_0%,transparent_60%)] pointer-events-none`
      }),(0,o.jsxs)(`div`, {
        className:`container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 w-full max-w-6xl relative z-10 items-center`,children:[(0,o.jsxs)(`div`, {
          className:`lg:col-span-5 flex flex-col gap-6 text-left`,children:[(0,o.jsxs)(`div`, {
            className:`flex flex-col gap-1.5`,children:[(0,o.jsx)(`span`, {
              className:`text-[10px] tracking-[0.3em] font-display-tech text-neutral-500 uppercase font-semibold`,children:`[ processo criativo // como trabalhamos ]`
            }),(0,o.jsx)(`div`, {
              className:`w-8 h-[1px] bg-[#ff007f] shadow-[0_0_8px_#ff007f]`
            })]
          }),(0,o.jsxs)(`div`, {
            className:`flex flex-col select-none tracking-tight leading-[0.85] gap-1`,children:[(0,o.jsx)(`span`, {
              className:`font-serif-editorial italic text-4xl md:text-5xl font-light text-neutral-400 lowercase leading-[0.9]`,children:`da ideia à`
            }),(0,o.jsx)(`span`, {
              className:`font-display-tech font-extrabold text-4xl md:text-[3.25rem] uppercase tracking-tighter text-white`,children:`retenção.`
            })]
          }),(0,o.jsx)(`p`, {
            className:`text-neutral-400 text-xs md:text-sm lowercase max-w-xs leading-relaxed`,children:`conduzindo cada etapa com controle pessoal e visão estratégica, do gancho inicial à montagem rítmica final.`
          }),(0,o.jsxs)(`div`, {
            className:`hidden lg:flex flex-col gap-2 mt-4 text-[10px] font-display-tech uppercase border-l border-neutral-900 pl-4 py-2`,children:[(0,o.jsxs)(`div`, {
              className:`flex items-center gap-2`,children:[(0,o.jsx)(`span`, {
                className:`text-neutral-500`,children:`status:`
              }),(0,o.jsxs)(`span`, {
                className:`text-[#ff007f] shadow-[0_0_8px_rgba(255,0,127,0.3)] animate-pulse font-bold`,children:[`etapa `,m[n].num,` ativa`]
              })]
            }),(0,o.jsxs)(`div`, {
              className:`flex items-center gap-2`,children:[(0,o.jsx)(`span`, {
                className:`text-neutral-500`,children:`progresso:`
              }),(0,o.jsxs)(`span`, {
                className:`text-neutral-300 font-bold`,children:[Math.round(t*100),`%`]
              })]
            })]
          })]
        }),(0,o.jsxs)(`div`, {
          className:`lg:col-span-7 relative flex flex-col gap-8 py-6 w-full`,children:[(0,o.jsx)(`div`, {
            className:`absolute left-[20px] md:left-[35px] top-6 bottom-6 w-[2px] bg-neutral-900 pointer-events-none`
          }),(0,o.jsx)(`div`, {
            className:`absolute left-[20px] md:left-[35px] top-6 w-[2px] bg-[#ff007f] shadow-[0_0_12px_#ff007f] pointer-events-none origin-top transition-transform duration-100 ease-out`,style: {
              height:`calc(100% - 48px)`,transform:`scaleY($ {
                t
              })`
            }
          }),m.map((e,t)=> {
            let r=t===n;
            return(0,o.jsxs)(`div`, {
              className:`flex gap-6 md:gap-10 items-start relative transition-all duration-500 ease-in-out $ {
                r?`opacity-100 scale-[1.01] translate-x-1`:`opacity-30 hover:opacity-40`
              }`,children:[(0,o.jsx)(`div`, {
                className:`w-10 h-10 md:w-16 md:h-16 rounded-full border flex items-center justify-center flex-shrink-0 z-10 transition-all duration-500 $ {
                  r?`bg-black border-[#ff007f] text-[#ff007f] shadow-[0_0_15px_rgba(255,0,127,0.4)] scale-110`:t<n?`bg-[#ff007f]/10 border-[#ff007f]/50 text-white`:`bg-black border-neutral-800 text-neutral-500`
                }`,children:(0,o.jsx)(`span`, {
                  className:`text-xs md:text-sm font-bold font-display-tech`,children:e.num
                })
              }),(0,o.jsxs)(`div`, {
                className:`flex-grow border rounded-2xl p-5 md:p-6 transition-all duration-500 $ {
                  r?`bg-neutral-950/40 border-[#ff007f]/20 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl`:`bg-transparent border-transparent`
                }`,children:[(0,o.jsx)(`div`, {
                  className:`flex items-center gap-2 mb-1.5`,children:(0,o.jsx)(`span`, {
                    className:`text-[9px] tracking-widest font-display-tech uppercase font-semibold transition-colors duration-500 $ {
                      r?`text-[#ff007f]`:`text-neutral-500`
                    }`,children:e.phase
                  })
                }),(0,o.jsx)(`h3`, {
                  className:`text-lg md:text-xl font-bold uppercase tracking-tight font-display-tech transition-colors duration-500 $ {
                    r?`text-white`:`text-neutral-400`
                  }`,children:e.title
                }),(0,o.jsx)(`h4`, {
                  className:`text-[11px] md:text-xs font-serif-editorial italic lowercase transition-colors duration-500 mb-3 $ {
                    r?`text-neutral-400`:`text-neutral-500`
                  }`,children:e.subtitle
                }),(0,o.jsx)(`p`, {
                  className:`text-xs lowercase leading-relaxed transition-colors duration-500 mb-4 $ {
                    r?`text-neutral-300`:`text-neutral-500`
                  }`,children:e.description
                }),(0,o.jsx)(`div`, {
                  className:`flex flex-wrap gap-2`,children:e.specs.map(e=>(0,o.jsx)(`span`, {
                    className:`text-[8px] md:text-[9px] font-display-tech uppercase px-2.5 py-1 rounded-full border transition-all duration-500 $ {
                      r?`bg-neutral-950/60 border-neutral-800 text-neutral-300`:`bg-transparent border-transparent text-neutral-600`
                    }`,children:e
                  },e))
                })]
              })]
            },e.num)
          })]
        })]
      }),(0,o.jsx)(`div`, {
        className:`absolute bottom-6 left-6 md:left-10 z-10 text-[9px] font-display-tech tracking-[0.2em] text-neutral-500 uppercase select-none pointer-events-none`,children:`process // timeline_scroll`
      }),(0,o.jsxs)(`div`, {
        className:`absolute bottom-6 right-6 md:right-10 z-10 text-[9px] font-display-tech tracking-[0.2em] text-neutral-500 uppercase select-none pointer-events-none`,children:[`step // 0`,n+1]
      })]
    })
  })
}function g() {
  let e=(0,r.useRef)(null),t=a(e),[n,i]=(0,r.useState)(``),[c,m]=(0,r.useState)(!1),[g,_]=(0,r.useState)(!1),[v,y]=(0,r.useState)(!1),[b,x]=(0,r.useState)(!1),[S,C]=(0,r.useState)(!1),[w,T]=(0,r.useState)(0),[E,D]=(0,r.useState)(!1),[O,k]=(0,r.useState)(!1);
  (0,r.useEffect)(()=> {
    let e=new IntersectionObserver(([e])=> {
      k(e.isIntersecting)
    }, {
      rootMargin:`-80px 0px -85% 0px`,threshold:0
    }),t=document.getElementById(`about`);
    return t&&e.observe(t),()=> {
      t&&e.unobserve(t)
    }
  },[c]),(0,r.useEffect)(()=> {
    let e=()=> {
      let e=window.scrollY,t=window.innerHeight;
      T(Math.min(Math.max(e/t,0),1))
    };
    return window.addEventListener(`scroll`,e, {
      passive:!0
    }),e(),()=>window.removeEventListener(`scroll`,e)
  },[]),(0,r.useEffect)(()=> {
    let e=()=> {
      D(window.innerWidth<768)
    };
    return e(),window.addEventListener(`resize`,e),()=>window.removeEventListener(`resize`,e)
  },[]),(0,r.useEffect)(()=> {
    let e=new Image;
    e.src=`/logo.jpg`,e.crossOrigin=`anonymous`,e.onload=()=> {
      let t=document.createElement(`canvas`);
      t.width=e.width,t.height=e.height;
      let n=t.getContext(`2d`);
      if(!n) {
        i(`/logo.jpg`);
        return
      }n.drawImage(e,0,0);
      let r=n.getImageData(0,0,t.width,t.height),a=r.data;
      for(let e=0;
      e<a.length;
      e+=4) {
        let t=a[e],n=a[e+1],r=a[e+2];
        t<75&&n<75&&r<75&&(a[e+3]=0)
      }n.putImageData(r,0,0),i(t.toDataURL(`image/png`))
    },e.onerror=()=> {
      i(`/logo.jpg`)
    }
  },[]);
  let A=e=> {
    let n=t-e,r=Math.max(0,Math.min(1,(.08-Math.abs(n))/.05))**1.5,i=n*-30,a=n*(E?80:150);
    return {
      opacity:r,display:r>0?`flex`:`none`,transform:`translateY($ {
        a
      }px) rotateX($ {
        i
      }deg)`,transformOrigin:`center center`
    }
  };
  return(0,o.jsxs)(o.Fragment, {
    children:[!c&&(0,o.jsx)(d, {
      onComplete:()=>m(!0)
    }),(0,o.jsxs)(`nav`, {
      className:`fixed z-30 px-4 md:px-10 pt-4 md:pt-6 top-0 left-0 right-0 flex items-center justify-between gap-4 pointer-events-none`,children:[(0,o.jsx)(`div`, {
        onMouseEnter:()=>y(!0),onMouseLeave:()=>y(!1),className:`flex items-center justify-center rounded-full transition-all duration-300 pointer-events-auto border $ {
          E?`px-4 py-2 min-h-[48px]`:`px-6 py-3.5 min-h-[72px]`
        }`,style: {
          backgroundColor:O?`rgba(255, 255, 255, 0.65)`:`rgba(255, 255, 255, 0.05)`,backdropFilter:`blur(24px)`,WebkitBackdropFilter:`blur(24px)`,borderColor:v?`rgba(255, 0, 127, 0.4)`:O?`rgba(0, 0, 0, 0.12)`:`rgba(255, 255, 255, 0.15)`,boxShadow:O?`0 8px 32px 0 rgba(0, 0, 0, 0.05)`:`0 8px 32px 0 rgba(0, 0, 0, 0.3)`
        },children:n?(0,o.jsx)(`img`, {
          src:n,alt:`maria eduarda logo`,className:`$ {
            E?`h-8`:`h-14`
          } w-auto select-none transition-all duration-300`,style: {
            filter:O?`invert(1) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))`:`drop-shadow(0 2px 10px rgba(255,255,255,0.25))`
          }
        }):(0,o.jsx)(`span`, {
          className:`text-xs md:text-sm font-normal tracking-tight py-1 px-3 transition-colors duration-300 $ {
            O?`text-black`:`text-white`
          }`,children:`maria films`
        })
      }),(0,o.jsxs)(`div`, {
        className:`hidden md:flex items-center gap-1 rounded-full px-4 py-3 border pointer-events-auto transition-all duration-300`,style: {
          backgroundColor:O?`rgba(255, 255, 255, 0.65)`:`rgba(255, 255, 255, 0.04)`,backdropFilter:`blur(24px)`,WebkitBackdropFilter:`blur(24px)`,borderColor:O?`rgba(0, 0, 0, 0.08)`:`rgba(255, 255, 255, 0.12)`,boxShadow:O?`0 8px 32px 0 rgba(0, 0, 0, 0.05)`:`0 8px 32px 0 rgba(0, 0, 0, 0.3)`
        },children:[(0,o.jsx)(`a`, {
          href:`#films`,className:`transition-colors text-base px-6 py-2.5 rounded-full font-medium $ {
            O?`text-neutral-800 hover:text-[#ff007f]`:`text-neutral-300 hover:text-[#ff007f]`
          }`,children:`filmes`
        }),(0,o.jsx)(`a`, {
          href:`#about`,className:`transition-colors text-base px-6 py-2.5 rounded-full font-medium $ {
            O?`text-neutral-800 hover:text-[#ff007f]`:`text-neutral-300 hover:text-[#ff007f]`
          }`,children:`sobre`
        }),(0,o.jsx)(`a`, {
          href:`#services`,className:`transition-colors text-base px-6 py-2.5 rounded-full font-medium $ {
            O?`text-neutral-800 hover:text-[#ff007f]`:`text-neutral-300 hover:text-[#ff007f]`
          }`,children:`serviços`
        }),(0,o.jsx)(`a`, {
          href:`#contact`,className:`transition-colors text-base px-6 py-2.5 rounded-full font-medium $ {
            O?`text-neutral-800 hover:text-[#ff007f]`:`text-neutral-300 hover:text-[#ff007f]`
          }`,children:`contato`
        })]
      }),(0,o.jsx)(`button`, {
        onMouseEnter:()=>_(!0),onMouseLeave:()=>_(!1),className:`rounded-full font-medium transition-all duration-300 pointer-events-auto border hover:scale-102 $ {
          E?`px-5 py-2.5 text-xs`:`px-8 py-4 text-base`
        }`,style: {
          backgroundColor:g?`rgba(255, 0, 127, 0.2)`:O?`rgba(255, 255, 255, 0.65)`:`rgba(255, 255, 255, 0.06)`,color:g?`#ffffff`:O?`#171717`:`#ffffff`,backdropFilter:`blur(24px)`,WebkitBackdropFilter:`blur(24px)`,borderColor:g?`#ff007f`:O?`rgba(0, 0, 0, 0.12)`:`rgba(255, 255, 255, 0.15)`,boxShadow:g?`0 0 25px rgba(255, 0, 127, 0.4)`:O?`0 8px 32px 0 rgba(0, 0, 0, 0.05)`:`0 8px 32px 0 rgba(0, 0, 0, 0.3)`
        },children:`vamos conversar`
      })]
    }),(0,o.jsx)(`div`, {
      className:`relative w-full h-screen bg-black z-10`,children:w<1&&(0,o.jsxs)(`section`, {
        className:`fixed inset-0 w-full h-screen overflow-hidden bg-black flex items-center pt-24 pb-12`,style: {
          pointerEvents:w>=.85?`none`:`auto`
        },children:[(0,o.jsx)(`div`, {
          className:`absolute inset-y-0 right-0 w-full md:w-[50%] h-full flex items-center justify-center md:justify-end pointer-events-none z-0`,style: {
            opacity:(E?.35:.9-w*1.5)*(1-w),transform:`scale($ {
              1-w*.05
            }) translateY($ {
              w*(E?15:30)
            }px)`,transition:`opacity 0.05s ease-out, transform 0.05s ease-out`
          },children:(0,o.jsx)(`img`, {
            src:`/hero_camera.webp`,alt:`Canon EOS-1 Ds`,className:`w-full max-w-[450px] md:max-w-none md:h-[72vh] md:w-auto object-contain opacity-70 md:opacity-90 transition-opacity duration-700`,style: {
              mixBlendMode:`screen`,filter:`contrast(1.1) brightness(0.95)`,maxHeight:`100%`,maxWidth:`100%`
            }
          })
        }),(0,o.jsxs)(`div`, {
          className:`relative z-10 container mx-auto px-6 md:px-12 w-full flex flex-col md:flex-row items-center gap-12 min-h-[80vh]`,style: {
            opacity:1-w*2,transform:`translateY(-$ {
              w*(E?40:80)
            }px)`,transition:`opacity 0.05s ease-out, transform 0.05s ease-out`
          },children:[(0,o.jsxs)(`div`, {
            className:`w-full md:w-[60%] flex flex-col gap-8 items-start text-left pointer-events-auto`,children:[(0,o.jsxs)(`div`, {
              className:`flex items-center gap-3`,children:[(0,o.jsx)(`div`, {
                className:`w-9 h-9 rounded-full overflow-hidden border border-white/12 bg-neutral-900 flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.5)]`,children:(0,o.jsx)(`img`, {
                  src:`/maria_portrait.png`,alt:`Maria Eduarda`,className:`w-full h-full object-cover object-[center_20%]`
                })
              }),(0,o.jsxs)(`div`, {
                className:`flex flex-col`,children:[(0,o.jsxs)(`div`, {
                  className:`flex items-center gap-1.5`,children:[(0,o.jsx)(`span`, {
                    className:`text-[10px] tracking-[0.25em] text-neutral-300 uppercase font-semibold font-display-tech`,children:`maria films`
                  }),(0,o.jsx)(`span`, {
                    className:`w-1 h-1 rounded-full bg-[#ff007f] shadow-[0_0_6px_#ff007f] animate-pulse`
                  })]
                }),(0,o.jsx)(`span`, {
                  className:`text-[8px] text-neutral-500 uppercase font-display-tech tracking-widest mt-0.5`,children:`direção por maria eduarda`
                })]
              })]
            }),(0,o.jsxs)(`div`, {
              className:`flex flex-col select-none tracking-tight leading-[0.82] gap-1`,children:[(0,o.jsx)(`span`, {
                className:`font-serif-editorial italic text-[11vw] md:text-[6vw] font-light text-neutral-400 lowercase leading-[0.9]`,children:`esculpindo`
              }),(0,o.jsx)(`span`, {
                className:`font-display-tech font-extrabold text-[13vw] md:text-[7.5vw] uppercase tracking-tighter text-white leading-[0.82]`,children:`o tempo.`
              })]
            }),(0,o.jsxs)(`div`, {
              className:`w-full max-w-md border rounded-2xl p-6 md:p-8 transition-all duration-300`,style: {
                backgroundColor:`rgba(255, 255, 255, 0.03)`,backdropFilter:`blur(30px)`,WebkitBackdropFilter:`blur(30px)`,borderColor:`rgba(255, 255, 255, 0.07)`,boxShadow:`0 16px 45px 0 rgba(0, 0, 0, 0.6)`
              },children:[(0,o.jsx)(`p`, {
                className:`text-xs md:text-[13px] text-neutral-400 leading-relaxed lowercase mb-6`,children:`transformamos visões brutas em narrativas cinematográficas de alto impacto. esculpimos cada corte com rigor estético, ritmo cirúrgico e ressonância emocional.`
              }),(0,o.jsxs)(`div`, {
                className:`flex flex-col sm:flex-row gap-3.5 w-full`,children:[(0,o.jsxs)(`a`, {
                  href:`#films`,onMouseEnter:()=>x(!0),onMouseLeave:()=>x(!1),className:`flex-1 flex items-center justify-between border rounded-full h-12 pl-5 pr-1.5 transition-all duration-300 text-[10px] uppercase tracking-wider font-semibold font-display-tech relative group overflow-hidden`,style: {
                    backgroundColor:`rgba(255, 255, 255, 0.03)`,borderColor:b?`rgba(255, 0, 127, 0.4)`:`rgba(255, 255, 255, 0.1)`,color:`#ffffff`,boxShadow:b?`0 0 25px rgba(255, 0, 127, 0.25)`:`none`,backdropFilter:`blur(20px)`,WebkitBackdropFilter:`blur(20px)`
                  },children:[(0,o.jsx)(`span`, {
                    children:`ver portfólio`
                  }),(0,o.jsx)(`div`, {
                    className:`w-8 h-8 rounded-full bg-[#ff007f] flex items-center justify-center transition-all duration-300`,style: {
                      transform:b?`translateX(2px)`:`none`
                    },children:(0,o.jsx)(`svg`, {
                      xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,strokeWidth:`2.5`,stroke:`currentColor`,className:`w-3.5 h-3.5 text-white`,children:(0,o.jsx)(`path`, {
                        strokeLinecap:`round`,strokeLinejoin:`round`,d:`M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3`
                      })
                    })
                  })]
                }),(0,o.jsx)(`a`, {
                  href:`#contact`,onMouseEnter:()=>C(!0),onMouseLeave:()=>C(!1),className:`flex-1 flex items-center justify-center border rounded-full h-12 px-5 transition-all duration-300 text-[10px] uppercase tracking-wider font-semibold font-display-tech`,style: {
                    backgroundColor:S?`rgba(255, 255, 255, 0.06)`:`transparent`,borderColor:S?`rgba(255, 255, 255, 0.25)`:`rgba(255, 255, 255, 0.1)`,color:`#ffffff`,backdropFilter:`blur(20px)`,WebkitBackdropFilter:`blur(20px)`
                  },children:(0,o.jsx)(`span`, {
                    children:`iniciar projeto`
                  })
                })]
              })]
            })]
          }),(0,o.jsx)(`div`, {
            className:`hidden md:block w-full md:w-[40%] pointer-events-none`
          })]
        }),(0,o.jsxs)(`div`, {
          className:`absolute bottom-6 left-0 right-0 z-10 w-full px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 pointer-events-none`,style: {
            opacity:1-w*2.5,transition:`opacity 0.05s ease-out`
          },children:[(0,o.jsxs)(`div`, {
            className:`md:hidden grid grid-cols-3 gap-2 w-full border-t border-white/5 pt-4 pointer-events-auto`,children:[(0,o.jsxs)(`div`, {
              className:`flex flex-col`,children:[(0,o.jsx)(`span`, {
                className:`text-xl font-bold text-white leading-none font-display-tech`,children:`+85`
              }),(0,o.jsx)(`span`, {
                className:`text-[8px] text-neutral-500 uppercase tracking-widest mt-1 font-display-tech`,children:`filmes`
              })]
            }),(0,o.jsxs)(`div`, {
              className:`flex flex-col`,children:[(0,o.jsx)(`span`, {
                className:`text-xl font-bold text-white leading-none font-display-tech`,children:`+45m`
              }),(0,o.jsx)(`span`, {
                className:`text-[8px] text-neutral-500 uppercase tracking-widest mt-1 font-display-tech`,children:`views`
              })]
            }),(0,o.jsxs)(`div`, {
              className:`flex flex-col`,children:[(0,o.jsx)(`span`, {
                className:`text-xl font-bold text-[#ff007f] leading-none font-display-tech`,children:`+12`
              }),(0,o.jsx)(`span`, {
                className:`text-[8px] text-neutral-500 uppercase tracking-widest mt-1 font-display-tech`,children:`prêmios`
              })]
            })]
          }),(0,o.jsx)(`div`, {
            className:`hidden md:flex flex-col items-start pointer-events-auto group/stat cursor-default`,children:(0,o.jsxs)(`div`, {
              className:`flex items-center gap-2`,children:[(0,o.jsx)(`span`, {
                className:`text-2xl font-bold font-display-tech tracking-tight text-white transition-all duration-300 group-hover/stat:text-[#ff007f]`,children:`+85`
              }),(0,o.jsx)(`span`, {
                className:`h-px w-8 bg-white/10`
              }),(0,o.jsx)(`span`, {
                className:`text-[9px] uppercase tracking-widest text-neutral-500 font-display-tech`,children:`filmes finalizados`
              })]
            })
          }),(0,o.jsxs)(`div`, {
            className:`hidden md:flex flex-col items-center gap-1.5 opacity-40`,children:[(0,o.jsx)(`span`, {
              className:`text-[9px] uppercase tracking-[0.2em] text-white/50 font-display-tech`,children:`scroll`
            }),(0,o.jsx)(`div`, {
              className:`w-4 h-7 border border-white/20 rounded-full flex justify-center p-1`,children:(0,o.jsx)(`div`, {
                className:`w-1 h-1.5 bg-white rounded-full animate-bounce`
              })
            })]
          }),(0,o.jsx)(`div`, {
            className:`hidden md:flex flex-col items-end pointer-events-auto group/stat cursor-default`,children:(0,o.jsxs)(`div`, {
              className:`flex items-center gap-2`,children:[(0,o.jsx)(`span`, {
                className:`text-[9px] uppercase tracking-widest text-neutral-500 font-display-tech`,children:`visualizações geradas`
              }),(0,o.jsx)(`span`, {
                className:`h-px w-8 bg-white/10`
              }),(0,o.jsx)(`span`, {
                className:`text-2xl font-bold font-display-tech tracking-tight text-white transition-all duration-300 group-hover/stat:text-[#ff007f]`,children:`+45m`
              })]
            })
          })]
        }),(0,o.jsx)(`div`, {
          className:`pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black z-10`
        })]
      })
    }),(0,o.jsx)(f, {
    }),(0,o.jsx)(`section`, {
      ref:e,className:`relative h-[600vh] bg-black z-20`,children:(0,o.jsxs)(`div`, {
        className:`sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center`,children:[(0,o.jsx)(s, {
          scrollProgress:t,frameCount:130
        }),(0,o.jsxs)(`div`, {
          className:`absolute inset-0 z-10 flex items-center justify-center pointer-events-none`,style: {
            perspective:`1200px`
          },children:[(0,o.jsxs)(`div`, {
            className:`absolute transition-all duration-300 ease-out flex flex-col items-center text-center px-6`,style:A(.08),children:[(0,o.jsx)(`span`, {
              className:`text-neutral-500 text-[10px] uppercase tracking-[0.3em] mb-3 block font-display-tech font-semibold`,children:`01 // visão`
            }),(0,o.jsx)(`h2`, {
              className:`hero-title text-white font-medium text-[8vw] md:text-[6vw] tracking-tight leading-none lowercase`,children:`concepção criativa`
            }),(0,o.jsx)(`p`, {
              className:`max-w-[440px] text-xs md:text-sm text-white/70 mt-4 leading-relaxed lowercase`,children:`desenhando profundidade visual antes mesmo da câmera ligar. cada frame é imaginado e planejado como uma obra de arte única.`
            })]
          }),(0,o.jsxs)(`div`, {
            className:`absolute transition-all duration-300 ease-out flex flex-col items-center text-center px-6`,style:A(.24),children:[(0,o.jsx)(`span`, {
              className:`text-neutral-500 text-[10px] uppercase tracking-[0.3em] mb-3 block font-display-tech font-semibold`,children:`02 // roteiro`
            }),(0,o.jsx)(`h2`, {
              className:`hero-title text-white font-medium text-[8vw] md:text-[6vw] tracking-tight leading-none lowercase`,children:`desenvolvimento`
            }),(0,o.jsx)(`p`, {
              className:`max-w-[440px] text-xs md:text-sm text-white/70 mt-4 leading-relaxed lowercase`,children:`estruturando narrativas envolventes. transformamos ideias soltas em arcos dramáticos consistentes e de alta ressonância emocional.`
            })]
          }),(0,o.jsxs)(`div`, {
            className:`absolute transition-all duration-300 ease-out flex flex-col items-center text-center px-6`,style:A(.41),children:[(0,o.jsx)(`span`, {
              className:`text-neutral-500 text-[10px] uppercase tracking-[0.3em] mb-3 block font-display-tech font-semibold`,children:`03 // produção`
            }),(0,o.jsx)(`h2`, {
              className:`hero-title text-white font-medium text-[8vw] md:text-[6vw] tracking-tight leading-none lowercase`,children:`direção criativa`
            }),(0,o.jsx)(`p`, {
              className:`max-w-[440px] text-xs md:text-sm text-white/70 mt-4 leading-relaxed lowercase`,children:`traduzindo ideias conceituais em narrativas de tela impactantes. direção completa de atores e orquestração de toda a equipe no set.`
            })]
          }),(0,o.jsxs)(`div`, {
            className:`absolute transition-all duration-300 ease-out flex flex-col items-center text-center px-6`,style:A(.58),children:[(0,o.jsx)(`span`, {
              className:`text-neutral-500 text-[10px] uppercase tracking-[0.3em] mb-3 block font-display-tech font-semibold`,children:`04 // luz`
            }),(0,o.jsx)(`h2`, {
              className:`hero-title text-white font-medium text-[8vw] md:text-[6vw] tracking-tight leading-none lowercase`,children:`fotografia`
            }),(0,o.jsx)(`p`, {
              className:`max-w-[440px] text-xs md:text-sm text-white/70 mt-4 leading-relaxed lowercase`,children:`esculpindo ambientes através de iluminação precisa e composição geométrica. equipamentos de cinema que garantem textura orgânica.`
            })]
          }),(0,o.jsxs)(`div`, {
            className:`absolute transition-all duration-300 ease-out flex flex-col items-center text-center px-6`,style:A(.74),children:[(0,o.jsx)(`span`, {
              className:`text-neutral-500 text-[10px] uppercase tracking-[0.3em] mb-3 block font-display-tech font-semibold`,children:`05 // montagem`
            }),(0,o.jsx)(`h2`, {
              className:`hero-title text-white font-medium text-[8vw] md:text-[6vw] tracking-tight leading-none lowercase`,children:`ritmo e corte`
            }),(0,o.jsx)(`p`, {
              className:`max-w-[440px] text-xs md:text-sm text-white/70 mt-4 leading-relaxed lowercase`,children:`onde o filme realmente nasce. costuramos as cenas com precisão cirúrgica para ditar o tempo da narrativa e segurar a atenção.`
            })]
          }),(0,o.jsxs)(`div`, {
            className:`absolute transition-all duration-300 ease-out flex flex-col items-center text-center px-6`,style:A(.91),children:[(0,o.jsx)(`span`, {
              className:`text-neutral-500 text-[10px] uppercase tracking-[0.3em] mb-3 block font-display-tech font-semibold`,children:`06 // execução`
            }),(0,o.jsx)(`h2`, {
              className:`hero-title text-white font-medium text-[8vw] md:text-[6vw] tracking-tight leading-none lowercase`,children:`pós-produção`
            }),(0,o.jsx)(`p`, {
              className:`max-w-[440px] text-xs md:text-sm text-white/70 mt-4 leading-relaxed lowercase`,children:`colorização meticulosa (color grading) e design de som imersivo (sound design). lapidamos sequências brutas em peças perfeitas.`
            })]
          })]
        }),(0,o.jsxs)(`div`, {
          className:`absolute bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20`,children:[(0,o.jsx)(`span`, {
            className:`text-[10px] text-neutral-500 tracking-wider font-display-tech`,children:`01`
          }),(0,o.jsx)(`div`, {
            className:`h-[2px] w-24 bg-neutral-900 relative rounded-full overflow-hidden`,children:(0,o.jsx)(`div`, {
              className:`absolute left-0 top-0 h-full bg-[#ff007f] transition-all duration-75`,style: {
                width:`$ {
                  t*100
                }%`
              }
            })
          }),(0,o.jsx)(`span`, {
            className:`text-[10px] text-neutral-500 tracking-wider font-display-tech`,children:`06`
          }),(0,o.jsxs)(`span`, {
            className:`text-[10px] text-neutral-400 font-display-tech tracking-widest ml-1 opacity-80`,children:[`(`,Math.round(t*100),`%)`]
          })]
        })]
      })
    }),(0,o.jsx)(h, {
    }),(0,o.jsx)(p, {
    }),(0,o.jsx)(l, {
    }),(0,o.jsx)(u, {
    })]
  })
}(0,i.createRoot)(document.getElementById(`root`)).render((0,o.jsx)(r.StrictMode, {
  children:(0,o.jsx)(g, {
  })
}));
