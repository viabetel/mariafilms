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
}