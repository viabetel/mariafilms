useRef)(null),s=(0,r.useRef)(null),c=(0,r.useRef)(null),[l,u]=(0,r.useState)(!1),[d,f]=(0,r.useState)(!1),[p,m]=(0,r.useState)(!1),[h,g]=(0,r.useState)(.8),[_,v]=(0,r.useState)(!1),y=(0,r.useRef)( {
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
        className:`absolute inset-0 w-full h-full opacity-40 transition-all duration-700 ease-in-out filter grayscale hover:grayscale-0 hover:scale-[1.02] hover:opacity-55`