const h=(t,a={},...k)=>{const e=document.createElement(t);for(const[x,v]of Object.entries(a))x==='class'?e.className=v:x.startsWith('on')?e.addEventListener(x.slice(2),v):e.setAttribute(x,v);e.append(...k.flat().filter(v=>v||v===0));return e};
const api=(u,o)=>fetch('/api/'+u,o).then(r=>r.json());
const post=(u,body)=>api(u,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
const del=u=>api(u,{method:'DELETE'});
function countries(){const dn=new Intl.DisplayNames(['hi'],{type:'region',fallback:'none'}),skip=new Set('EU UN EZ AC CP DG EA IC TA XA XB ZZ QO'.split(' ')),out=[];
 for(let i=65;i<91;i++)for(let j=65;j<91;j++){const c=String.fromCharCode(i,j);if(skip.has(c))continue;let n;try{n=dn.of(c)}catch{}if(n&&n!==c)out.push([c,n])}
 return out.sort((a,b)=>a[1].localeCompare(b[1],'hi'))}
