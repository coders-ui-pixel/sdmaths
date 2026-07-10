module.exports=[18622,(a,b,c)=>{b.exports=a.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},20635,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},24725,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},43285,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/dynamic-access-async-storage.external.js",()=>require("next/dist/server/app-render/dynamic-access-async-storage.external.js"))},42602,(a,b,c)=>{"use strict";b.exports=a.r(18622)},72131,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].React},87924,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].ReactJsxRuntime},9270,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored.contexts.AppRouterContext},38783,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].ReactServerDOMTurbopackClient},36313,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored.contexts.HooksClientContext},18341,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored.contexts.ServerInsertedHtml},6704,a=>{"use strict";let b,c;var d,e=a.i(72131);let f={data:""},g=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,h=/\/\*[^]*?\*\/|  +/g,i=/\n+/g,j=(a,b)=>{let c="",d="",e="";for(let f in a){let g=a[f];"@"==f[0]?"i"==f[1]?c=f+" "+g+";":d+="f"==f[1]?j(g,f):f+"{"+j(g,"k"==f[1]?"":b)+"}":"object"==typeof g?d+=j(g,b?b.replace(/([^,])+/g,a=>f.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,b=>/&/.test(b)?b.replace(/&/g,a):a?a+" "+b:b)):f):null!=g&&(f=/^--/.test(f)?f:f.replace(/[A-Z]/g,"-$&").toLowerCase(),e+=j.p?j.p(f,g):f+":"+g+";")}return c+(b&&e?b+"{"+e+"}":e)+d},k={},l=a=>{if("object"==typeof a){let b="";for(let c in a)b+=c+l(a[c]);return b}return a};function m(a){let b,c,d=this||{},e=a.call?a(d.p):a;return((a,b,c,d,e)=>{var f;let m=l(a),n=k[m]||(k[m]=(a=>{let b=0,c=11;for(;b<a.length;)c=101*c+a.charCodeAt(b++)>>>0;return"go"+c})(m));if(!k[n]){let b=m!==a?a:(a=>{let b,c,d=[{}];for(;b=g.exec(a.replace(h,""));)b[4]?d.shift():b[3]?(c=b[3].replace(i," ").trim(),d.unshift(d[0][c]=d[0][c]||{})):d[0][b[1]]=b[2].replace(i," ").trim();return d[0]})(a);k[n]=j(e?{["@keyframes "+n]:b}:b,c?"":"."+n)}let o=c&&k.g?k.g:null;return c&&(k.g=k[n]),f=k[n],o?b.data=b.data.replace(o,f):-1===b.data.indexOf(f)&&(b.data=d?f+b.data:b.data+f),n})(e.unshift?e.raw?(b=[].slice.call(arguments,1),c=d.p,e.reduce((a,d,e)=>{let f=b[e];if(f&&f.call){let a=f(c),b=a&&a.props&&a.props.className||/^go/.test(a)&&a;f=b?"."+b:a&&"object"==typeof a?a.props?"":j(a,""):!1===a?"":a}return a+d+(null==f?"":f)},"")):e.reduce((a,b)=>Object.assign(a,b&&b.call?b(d.p):b),{}):e,d.target||f,d.g,d.o,d.k)}m.bind({g:1});let n,o,p,q=m.bind({k:1});function r(a,b){let c=this||{};return function(){let d=arguments;function e(f,g){let h=Object.assign({},f),i=h.className||e.className;c.p=Object.assign({theme:o&&o()},h),c.o=/ *go\d+/.test(i),h.className=m.apply(c,d)+(i?" "+i:""),b&&(h.ref=g);let j=a;return a[0]&&(j=h.as||a,delete h.as),p&&j[0]&&p(h),n(j,h)}return b?b(e):e}}var s=(a,b)=>"function"==typeof a?a(b):a,t=(b=0,()=>(++b).toString()),u="default",v=(a,b)=>{let{toastLimit:c}=a.settings;switch(b.type){case 0:return{...a,toasts:[b.toast,...a.toasts].slice(0,c)};case 1:return{...a,toasts:a.toasts.map(a=>a.id===b.toast.id?{...a,...b.toast}:a)};case 2:let{toast:d}=b;return v(a,{type:+!!a.toasts.find(a=>a.id===d.id),toast:d});case 3:let{toastId:e}=b;return{...a,toasts:a.toasts.map(a=>a.id===e||void 0===e?{...a,dismissed:!0,visible:!1}:a)};case 4:return void 0===b.toastId?{...a,toasts:[]}:{...a,toasts:a.toasts.filter(a=>a.id!==b.toastId)};case 5:return{...a,pausedAt:b.time};case 6:let f=b.time-(a.pausedAt||0);return{...a,pausedAt:void 0,toasts:a.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+f}))}}},w=[],x={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},y={},z=(a,b=u)=>{y[b]=v(y[b]||x,a),w.forEach(([a,c])=>{a===b&&c(y[b])})},A=a=>Object.keys(y).forEach(b=>z(a,b)),B=(a=u)=>b=>{z(b,a)},C={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},D=a=>(b,c)=>{let d,e=((a,b="blank",c)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:b,ariaProps:{role:"status","aria-live":"polite"},message:a,pauseDuration:0,...c,id:(null==c?void 0:c.id)||t()}))(b,a,c);return B(e.toasterId||(d=e.id,Object.keys(y).find(a=>y[a].toasts.some(a=>a.id===d))))({type:2,toast:e}),e.id},E=(a,b)=>D("blank")(a,b);E.error=D("error"),E.success=D("success"),E.loading=D("loading"),E.custom=D("custom"),E.dismiss=(a,b)=>{let c={type:3,toastId:a};b?B(b)(c):A(c)},E.dismissAll=a=>E.dismiss(void 0,a),E.remove=(a,b)=>{let c={type:4,toastId:a};b?B(b)(c):A(c)},E.removeAll=a=>E.remove(void 0,a),E.promise=(a,b,c)=>{let d=E.loading(b.loading,{...c,...null==c?void 0:c.loading});return"function"==typeof a&&(a=a()),a.then(a=>{let e=b.success?s(b.success,a):void 0;return e?E.success(e,{id:d,...c,...null==c?void 0:c.success}):E.dismiss(d),a}).catch(a=>{let e=b.error?s(b.error,a):void 0;e?E.error(e,{id:d,...c,...null==c?void 0:c.error}):E.dismiss(d)}),a};var F=1e3,G=q`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,H=q`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,I=q`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,J=r("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${a=>a.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${G} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${H} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${a=>a.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${I} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,K=q`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,L=r("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${a=>a.secondary||"#e0e0e0"};
  border-right-color: ${a=>a.primary||"#616161"};
  animation: ${K} 1s linear infinite;
`,M=q`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,N=q`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,O=r("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${a=>a.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${M} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${N} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${a=>a.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,P=r("div")`
  position: absolute;
`,Q=r("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,R=q`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,S=r("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${R} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,T=({toast:a})=>{let{icon:b,type:c,iconTheme:d}=a;return void 0!==b?"string"==typeof b?e.createElement(S,null,b):b:"blank"===c?null:e.createElement(Q,null,e.createElement(L,{...d}),"loading"!==c&&e.createElement(P,null,"error"===c?e.createElement(J,{...d}):e.createElement(O,{...d})))},U=r("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,V=r("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,W=e.memo(({toast:a,position:b,style:d,children:f})=>{let g=a.height?((a,b)=>{let d=a.includes("top")?1:-1,[e,f]=c?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*d}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*d}%,-1px) scale(.6); opacity:0;}
`];return{animation:b?`${q(e)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${q(f)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(a.position||b||"top-center",a.visible):{opacity:0},h=e.createElement(T,{toast:a}),i=e.createElement(V,{...a.ariaProps},s(a.message,a));return e.createElement(U,{className:a.className,style:{...g,...d,...a.style}},"function"==typeof f?f({icon:h,message:i}):e.createElement(e.Fragment,null,h,i))});d=e.createElement,j.p=void 0,n=d,o=void 0,p=void 0;var X=({id:a,className:b,style:c,onHeightUpdate:d,children:f})=>{let g=e.useCallback(b=>{if(b){let c=()=>{d(a,b.getBoundingClientRect().height)};c(),new MutationObserver(c).observe(b,{subtree:!0,childList:!0,characterData:!0})}},[a,d]);return e.createElement("div",{ref:g,className:b,style:c},f)},Y=m`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;a.s(["Toaster",0,({reverseOrder:a,position:b="top-center",toastOptions:d,gutter:f,children:g,toasterId:h,containerStyle:i,containerClassName:j})=>{let{toasts:k,handlers:l}=((a,b="default")=>{let{toasts:c,pausedAt:d}=((a={},b=u)=>{let[c,d]=(0,e.useState)(y[b]||x),f=(0,e.useRef)(y[b]);(0,e.useEffect)(()=>(f.current!==y[b]&&d(y[b]),w.push([b,d]),()=>{let a=w.findIndex(([a])=>a===b);a>-1&&w.splice(a,1)}),[b]);let g=c.toasts.map(b=>{var c,d,e;return{...a,...a[b.type],...b,removeDelay:b.removeDelay||(null==(c=a[b.type])?void 0:c.removeDelay)||(null==a?void 0:a.removeDelay),duration:b.duration||(null==(d=a[b.type])?void 0:d.duration)||(null==a?void 0:a.duration)||C[b.type],style:{...a.style,...null==(e=a[b.type])?void 0:e.style,...b.style}}});return{...c,toasts:g}})(a,b),f=(0,e.useRef)(new Map).current,g=(0,e.useCallback)((a,b=F)=>{if(f.has(a))return;let c=setTimeout(()=>{f.delete(a),h({type:4,toastId:a})},b);f.set(a,c)},[]);(0,e.useEffect)(()=>{if(d)return;let a=Date.now(),e=c.map(c=>{if(c.duration===1/0)return;let d=(c.duration||0)+c.pauseDuration-(a-c.createdAt);if(d<0){c.visible&&E.dismiss(c.id);return}return setTimeout(()=>E.dismiss(c.id,b),d)});return()=>{e.forEach(a=>a&&clearTimeout(a))}},[c,d,b]);let h=(0,e.useCallback)(B(b),[b]),i=(0,e.useCallback)(()=>{h({type:5,time:Date.now()})},[h]),j=(0,e.useCallback)((a,b)=>{h({type:1,toast:{id:a,height:b}})},[h]),k=(0,e.useCallback)(()=>{d&&h({type:6,time:Date.now()})},[d,h]),l=(0,e.useCallback)((a,b)=>{let{reverseOrder:d=!1,gutter:e=8,defaultPosition:f}=b||{},g=c.filter(b=>(b.position||f)===(a.position||f)&&b.height),h=g.findIndex(b=>b.id===a.id),i=g.filter((a,b)=>b<h&&a.visible).length;return g.filter(a=>a.visible).slice(...d?[i+1]:[0,i]).reduce((a,b)=>a+(b.height||0)+e,0)},[c]);return(0,e.useEffect)(()=>{c.forEach(a=>{if(a.dismissed)g(a.id,a.removeDelay);else{let b=f.get(a.id);b&&(clearTimeout(b),f.delete(a.id))}})},[c,g]),{toasts:c,handlers:{updateHeight:j,startPause:i,endPause:k,calculateOffset:l}}})(d,h);return e.createElement("div",{"data-rht-toaster":h||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...i},className:j,onMouseEnter:l.startPause,onMouseLeave:l.endPause},k.map(d=>{let h,i,j=d.position||b,k=l.calculateOffset(d,{reverseOrder:a,gutter:f,defaultPosition:b}),m=(h=j.includes("top"),i=j.includes("center")?{justifyContent:"center"}:j.includes("right")?{justifyContent:"flex-end"}:{},{left:0,right:0,display:"flex",position:"absolute",transition:c?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${k*(h?1:-1)}px)`,...h?{top:0}:{bottom:0},...i});return e.createElement(X,{id:d.id,key:d.id,onHeightUpdate:l.updateHeight,className:d.visible?Y:"",style:m},"custom"===d.type?s(d.message,d):g?g(d):e.createElement(W,{toast:d,position:j}))}))},"toast",0,E],6704)},74746,a=>{"use strict";let b=(0,a.i(64831).default)("send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);a.s(["Send",0,b],74746)},62591,a=>{"use strict";let b=(0,a.i(64831).default)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]]);a.s(["Mail",0,b],62591)},61541,a=>{"use strict";process.env.NEXTAUTH_URL,a.s(["SITE_NAME",0,"SOM"])},26437,a=>{"use strict";let b=(0,a.i(64831).default)("phone",[["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]]);a.s(["Phone",0,b],26437)},16683,a=>{"use strict";let b=(0,a.i(64831).default)("megaphone",[["path",{d:"M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z",key:"q8bfy3"}],["path",{d:"M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14",key:"1853fq"}],["path",{d:"M8 6v8",key:"15ugcq"}]]);a.s(["Megaphone",0,b],16683)},783,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(38246),e=a.i(50944),f=a.i(62591);let g=(0,a.i(64831).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);var h=a.i(26437),i=a.i(74746),j=a.i(61541);let k=a=>(0,b.jsx)("svg",{...a,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:(0,b.jsx)("path",{d:"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"})}),l=a=>(0,b.jsxs)("svg",{...a,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,b.jsx)("rect",{x:"2",y:"2",width:"20",height:"20",rx:"5",ry:"5"}),(0,b.jsx)("path",{d:"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"}),(0,b.jsx)("line",{x1:"17.5",y1:"6.5",x2:"17.51",y2:"6.5"})]}),m=a=>(0,b.jsxs)("svg",{...a,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,b.jsx)("path",{d:"M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.42 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.42-5.58z"}),(0,b.jsx)("polygon",{points:"9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"})]});a.s(["Footer",0,function(){let a=(0,e.usePathname)(),n=new Date().getFullYear(),[o,p]=(0,c.useState)({contactEmail:"info@schoolofmath.com",contactPhone:"+977 98XXXXXXXX",logoUrl:"",facebookUrl:"#",instagramUrl:"#",youtubeUrl:"#",telegramUrl:"#"});if((0,c.useEffect)(()=>{fetch("/api/branding").then(a=>a.json()).then(a=>{p({contactEmail:a.contactEmail||"info@schoolofmath.com",contactPhone:a.contactPhone||"+977 98XXXXXXXX",logoUrl:a.logoUrl||"",facebookUrl:a.facebookUrl||"#",instagramUrl:a.instagramUrl||"#",youtubeUrl:a.youtubeUrl||"#",telegramUrl:a.telegramUrl||"#"})}).catch(()=>{})},[]),a.startsWith("/lms")||"/login"===a||a.startsWith("/courses/")&&a.includes("/learn"))return null;let q=[{icon:k,href:o.facebookUrl,color:"hover:bg-blue-600"},{icon:l,href:o.instagramUrl,color:"hover:bg-pink-600"},{icon:m,href:o.youtubeUrl,color:"hover:bg-red-600"},{icon:i.Send,href:o.telegramUrl,color:"hover:bg-sky-500"}];return(0,b.jsxs)("footer",{className:"relative bg-[#020617] text-slate-300 pt-24 pb-12 overflow-hidden border-t border-slate-800/50",style:"/"===a?{"--primary":"var(--home-primary)","--secondary":"var(--home-secondary)","--primary-glow":"var(--home-primary-glow)"}:void 0,children:[(0,b.jsx)("div",{className:"absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/50 to-transparent"}),(0,b.jsx)("div",{className:"absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[var(--primary)]/5 blur-[120px] rounded-full pointer-events-none"}),(0,b.jsx)("div",{className:"absolute top-1/3 right-0 w-[350px] h-[350px] bg-[var(--secondary)]/5 blur-[100px] rounded-full pointer-events-none"}),(0,b.jsxs)("div",{className:"container max-w-7xl mx-auto px-6 relative z-10",children:[(0,b.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20",children:[(0,b.jsxs)("div",{className:"space-y-8",children:[(0,b.jsxs)(d.default,{href:"/",className:"text-3xl font-black outfit text-white flex items-center gap-3",children:[o.logoUrl?(0,b.jsx)("img",{src:o.logoUrl,alt:j.SITE_NAME,className:"h-10 w-auto object-contain"}):(0,b.jsx)("div",{className:"w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl shadow-lg",style:{background:"linear-gradient(135deg, var(--primary), var(--secondary))",boxShadow:"0 8px 20px -4px var(--primary-glow)"},children:"∑"}),j.SITE_NAME]}),(0,b.jsx)("p",{className:"text-base leading-relaxed text-slate-400 font-medium",children:"Empowering minds through the beautiful and universal language of mathematics. Join our community of passionate learners today."}),(0,b.jsx)("div",{className:"flex items-center gap-4",children:q.map((a,c)=>(0,b.jsx)("a",{href:a.href,target:"_blank",rel:"noopener noreferrer",className:`w-12 h-12 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-center transition-all duration-300 text-slate-400 hover:text-white hover:-translate-y-1 ${a.color} shadow-sm`,children:(0,b.jsx)(a.icon,{size:20})},c))})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-white font-black outfit text-xl mb-8 uppercase tracking-widest text-sm",children:"Explore"}),(0,b.jsxs)("ul",{className:"space-y-5 text-base font-semibold",children:[(0,b.jsx)("li",{children:(0,b.jsxs)(d.default,{href:"/",className:"hover:text-[var(--primary)] transition-colors flex items-center gap-3 group",children:[(0,b.jsx)("span",{className:"w-1.5 h-1.5 rounded-full bg-[var(--primary)] transform scale-0 group-hover:scale-100 transition-transform"})," Home"]})}),(0,b.jsx)("li",{children:(0,b.jsxs)(d.default,{href:"/courses",className:"hover:text-[var(--primary)] transition-colors flex items-center gap-3 group",children:[(0,b.jsx)("span",{className:"w-1.5 h-1.5 rounded-full bg-[var(--primary)] transform scale-0 group-hover:scale-100 transition-transform"})," Our Courses"]})}),(0,b.jsx)("li",{children:(0,b.jsxs)(d.default,{href:"/blog",className:"hover:text-[var(--primary)] transition-colors flex items-center gap-3 group",children:[(0,b.jsx)("span",{className:"w-1.5 h-1.5 rounded-full bg-[var(--primary)] transform scale-0 group-hover:scale-100 transition-transform"})," Math Blog"]})}),(0,b.jsx)("li",{children:(0,b.jsxs)(d.default,{href:"/about",className:"hover:text-[var(--primary)] transition-colors flex items-center gap-3 group",children:[(0,b.jsx)("span",{className:"w-1.5 h-1.5 rounded-full bg-[var(--primary)] transform scale-0 group-hover:scale-100 transition-transform"})," About Us"]})}),(0,b.jsx)("li",{children:(0,b.jsxs)(d.default,{href:"/login",className:"hover:text-[var(--primary)] transition-colors flex items-center gap-3 group",children:[(0,b.jsx)("span",{className:"w-1.5 h-1.5 rounded-full bg-[var(--primary)] transform scale-0 group-hover:scale-100 transition-transform"})," Student Portal"]})})]})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{className:"text-white font-black outfit text-xl mb-8 uppercase tracking-widest text-sm",children:"Support"}),(0,b.jsxs)("ul",{className:"space-y-5 text-base font-semibold",children:[(0,b.jsx)("li",{children:(0,b.jsx)(d.default,{href:"/faq",className:"hover:text-[var(--primary)] transition-colors",children:"FAQ & Help Center"})}),(0,b.jsx)("li",{children:(0,b.jsx)(d.default,{href:"/terms",className:"hover:text-[var(--primary)] transition-colors",children:"Terms of Service"})}),(0,b.jsx)("li",{children:(0,b.jsx)(d.default,{href:"/privacy",className:"hover:text-[var(--primary)] transition-colors",children:"Privacy Policy"})}),(0,b.jsx)("li",{children:(0,b.jsx)(d.default,{href:"/refund",className:"hover:text-[var(--primary)] transition-colors",children:"Refund Policy"})})]})]}),(0,b.jsxs)("div",{className:"bg-slate-900/30 p-8 rounded-[2.5rem] border border-slate-800/50",children:[(0,b.jsx)("h3",{className:"text-white font-black outfit text-xl mb-8 uppercase tracking-widest text-sm",children:"Contact Us"}),(0,b.jsxs)("ul",{className:"space-y-6 text-sm",children:[(0,b.jsxs)("li",{className:"flex items-start gap-4",children:[(0,b.jsx)("div",{className:"w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0",children:(0,b.jsx)(g,{size:20})}),(0,b.jsx)("span",{className:"text-slate-400 font-medium leading-relaxed",children:"Kathmandu, Bagmati Province, Nepal"})]}),(0,b.jsxs)("li",{className:"flex items-center gap-4",children:[(0,b.jsx)("div",{className:"w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0",children:(0,b.jsx)(h.Phone,{size:20})}),(0,b.jsx)("a",{href:`tel:${o.contactPhone}`,className:"text-slate-400 hover:text-[var(--primary)] transition-colors font-medium",children:o.contactPhone})]}),(0,b.jsxs)("li",{className:"flex items-center gap-4",children:[(0,b.jsx)("div",{className:"w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0",children:(0,b.jsx)(f.Mail,{size:20})}),(0,b.jsx)("a",{href:`mailto:${o.contactEmail}`,className:"text-slate-400 hover:text-[var(--primary)] transition-colors font-medium break-all",children:o.contactEmail})]})]})]})]}),(0,b.jsxs)("div",{className:"pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 text-center md:text-left",children:[(0,b.jsxs)("p",{className:"break-words",children:["© ",n," ",j.SITE_NAME,". All rights reserved."]}),(0,b.jsxs)("div",{className:"flex flex-wrap justify-center md:justify-end items-center gap-4 md:gap-8",children:[(0,b.jsx)(d.default,{href:"/privacy",className:"hover:text-white transition-colors",children:"Privacy"}),(0,b.jsx)(d.default,{href:"/terms",className:"hover:text-white transition-colors",children:"Terms"}),(0,b.jsx)("p",{className:"text-[var(--primary)]/60",children:"Designed for Excellence"})]})]})]})]})}],783)},57932,a=>{"use strict";var b=a.i(87924),c=a.i(18402),d=a.i(6704);a.s(["Providers",0,function({children:a}){return(0,b.jsxs)(c.SessionProvider,{children:[(0,b.jsx)(d.Toaster,{position:"bottom-right"}),a]})}])},76874,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(38246),e=a.i(74215),f=a.i(16683);a.s(["PopupNoticeDisplay",0,function(){let[a,g]=(0,c.useState)(null),[h,i]=(0,c.useState)(!1);if((0,c.useEffect)(()=>{fetch("/api/popup-notice").then(a=>a.json()).then(a=>{if(!a)return;let b=`popup-notice-dismissed-${a.id}`;localStorage.getItem(b)!==a.updatedAt&&(g(a),i(!0))}).catch(()=>{})},[]),!a||!h)return null;let j=()=>{localStorage.setItem(`popup-notice-dismissed-${a.id}`,a.updatedAt),i(!1)};return(0,b.jsx)("div",{className:"fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in",children:(0,b.jsxs)("div",{className:"relative bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden",children:[(0,b.jsx)("button",{onClick:j,className:"absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-white flex items-center justify-center transition-colors",children:(0,b.jsx)(e.X,{size:16})}),a.imageUrl?(0,b.jsx)("img",{src:a.imageUrl,alt:a.title,className:"w-full aspect-video object-cover"}):(0,b.jsx)("div",{className:"w-full aspect-[3/1] flex items-center justify-center",style:{background:"linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)"},children:(0,b.jsx)(f.Megaphone,{size:40,className:"text-white/80"})}),(0,b.jsxs)("div",{className:"p-7",children:[(0,b.jsx)("h3",{className:"text-xl font-black outfit text-slate-900 dark:text-white mb-2",children:a.title}),(0,b.jsx)("p",{className:"text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap mb-5",children:a.message}),(0,b.jsxs)("div",{className:"flex gap-3",children:[a.linkUrl&&(0,b.jsx)(d.default,{href:a.linkUrl,onClick:j,className:"flex-1 text-center py-3 rounded-xl font-bold text-white text-sm",style:{backgroundColor:"var(--primary)"},children:a.linkLabel||"Learn More"}),(0,b.jsx)("button",{onClick:j,className:`${a.linkUrl?"flex-1":"w-full"} py-3 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300`,children:"Dismiss"})]})]})]})})}])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0~brw1r._.js.map