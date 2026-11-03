const app=document.getElementById('app');
const card=(href,t)=>h('a',{class:'card link',href},t),grid=i=>h('div',{class:'grid'},i),none=t=>h('p',{class:'muted'},t);
const back=()=>h('button',{class:'btn sm',onclick:()=>history.back()},'← पीछे');
async function route(){
 const [,t,id]=location.hash.split('/');app.replaceChildren();
 if(t==='c'){const cn=countries().find(x=>x[0]===id),s=await api('states?country='+encodeURIComponent(id));
  app.append(back(),h('h2',{},cn?cn[1]:''),s.length?grid(s.map(x=>card('#/s/'+x.id,x.name))):none('अभी कोई राज्य नहीं जोड़ा गया।'))}
 else if(t==='s'){const d=await api('songs?state='+encodeURIComponent(id));
  app.append(back(),h('h2',{},d.state||''),...(d.songs.length?d.songs.map(x=>h('div',{class:'card'},h('h3',{},x.title),h('span',{class:'tag'},x.theme),h('p',{},x.summary))):[none('अभी कोई गाना नहीं।')]))}
 else if(t==='listings'){const l=await api('listings');
  app.append(h('h2',{},'लिस्टिंग'),l.length?grid(l.map(x=>h('div',{class:'card'},h('h3',{},x.title),h('b',{class:'price'},x.price),h('p',{},x.description),h('p',{class:'muted'},x.contact),
   h('img',{src:'/api/img/'+x.id,alt:'UPI QR',class:'qr'}),h('p',{class:'muted'},'QR स्कैन करके सीधे विक्रेता को पेमेंट करें — अपने रिस्क पर।')))):none('अभी कोई लिस्टिंग नहीं।'))}
 else if(t==='sell'){const msg=none(''),f=h('form',{class:'card',onsubmit:async e=>{e.preventDefault();
   const r=await fetch('/api/listings',{method:'POST',body:new FormData(f)}).then(r=>r.json());msg.textContent=r.ok?'भेज दी गई — अप्रूवल के बाद दिखेगी।':r.error;if(r.ok)f.reset()}},
   h('input',{name:'title',placeholder:'चीज़ का नाम',maxlength:80,required:''}),h('input',{name:'price',placeholder:'कीमत (जैसे ₹500)',maxlength:30,required:''}),
   h('input',{name:'contact',placeholder:'संपर्क (वैकल्पिक)',maxlength:60}),h('textarea',{name:'description',placeholder:'विवरण',maxlength:500}),
   h('label',{},'अपना UPI QR इमेज (PNG/JPG/WEBP, 150KB तक)',h('input',{type:'file',name:'qr',accept:'image/png,image/jpeg,image/webp',required:''})),h('button',{class:'btn'},'लिस्टिंग भेजें'),msg);
  app.append(h('h2',{},'अपनी चीज़ लिस्ट करें'),f)}
 else{const all=countries(),box=h('div',{class:'grid'}),draw=v=>box.replaceChildren(...all.filter(x=>x[1].includes(v)).map(x=>card('#/c/'+x[0],x[1])));
  app.append(h('input',{placeholder:'देश खोजें…',oninput:e=>draw(e.target.value)}),box);draw('')}
}
addEventListener('hashchange',route);route();
