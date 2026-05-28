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
}