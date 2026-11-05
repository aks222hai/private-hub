const app=document.getElementById('app');
const card=(href,t)=>h('a',{class:'card link',href},t),grid=i=>h('div',{class:'grid'},i),none=t=>h('p',{class:'muted'},t);
const back=()=>h('button',{class:'btn sm',onclick:()=>history.back()},'← Back');
async function route(){
 const [,t,id]=location.hash.split('/');app.replaceChildren();
 if(t==='c'){const cn=countries().find(x=>x[0]===id),s=await api('states?country='+encodeURIComponent(id));
  app.append(back(),h('h2',{},cn?cn[1]:''),h('p',{class:'muted'},'Select a state'),s.length?grid(s.map(x=>card('#/s/'+x.id,x.name))):h('div',{class:'card'},h('h3',{},'No states added yet'),none('States for this country have not been added yet. Please check back later.')))}
 else if(t==='s'){const d=await api('songs?state='+encodeURIComponent(id));
  app.append(back(),h('h2',{},d.state||''),...(d.songs.length?d.songs.map(x=>h('div',{class:'card'},h('h3',{},x.title),h('span',{class:'tag'},x.theme),h('p',{},x.summary))):[h('div',{class:'card'},h('h3',{},'No songs yet'),none('Nothing has been added for this state yet.'))]))}
 else if(t==='listings'){const l=await api('listings');
  app.append(h('h2',{},'Listings'),l.length?grid(l.map(x=>h('div',{class:'card'},h('h3',{},x.title),h('b',{class:'price'},x.price),h('p',{},x.description),h('p',{class:'muted'},x.contact),
   h('img',{src:'/api/img/'+x.id,alt:'UPI QR',class:'qr'}),h('p',{class:'muted'},'Scan the QR to pay the seller directly — at your own risk.')))):none('No listings yet.'))}
 else if(t==='sell'){const msg=none(''),f=h('form',{class:'card',onsubmit:async e=>{e.preventDefault();
   const r=await fetch('/api/listings',{method:'POST',body:new FormData(f)}).then(r=>r.json());msg.textContent=r.ok?'Submitted — it will appear after approval.':r.error;if(r.ok)f.reset()}},
   h('input',{name:'title',placeholder:'Item name',maxlength:80,required:''}),h('input',{name:'price',placeholder:'Price (e.g. ₹500)',maxlength:30,required:''}),
   h('input',{name:'contact',placeholder:'Contact (optional)',maxlength:60}),h('textarea',{name:'description',placeholder:'Description',maxlength:500}),
   h('label',{class:'muted'},'Your UPI QR image (PNG/JPG/WEBP, up to 150KB)',h('input',{type:'file',name:'qr',accept:'image/png,image/jpeg,image/webp',required:''})),h('button',{class:'btn'},'Submit listing'),msg);
  app.append(h('h2',{},'List your item'),f)}
 else{const all=countries(),box=h('div',{class:'grid'}),draw=v=>box.replaceChildren(...all.filter(x=>x[1].toLowerCase().includes(v.toLowerCase())).map(x=>card('#/c/'+x[0],x[1])));
  app.append(h('h2',{},'Choose a country'),h('input',{placeholder:'Search countries…',oninput:e=>draw(e.target.value)}),box);draw('')}
}
addEventListener('hashchange',route);route();
