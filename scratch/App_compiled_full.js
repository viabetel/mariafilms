+1]
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
