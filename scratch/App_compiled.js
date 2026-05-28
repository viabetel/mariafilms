function g() {
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
   