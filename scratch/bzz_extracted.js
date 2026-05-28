t e=.12;
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
   