const root=document.getElementById('root');
async function start(){(await api('admin/check')).ok?panel():login()}
function login(){let pw,m;root.replaceChildren(h('form',{class:'card',onsubmit:async e=>{e.preventDefault();const r=await post('admin/login',{password:pw.value});r.ok?panel():m.textContent=r.error}},
 pw=h('input',{type:'password',placeholder:'एडमिन पासवर्ड',autocomplete:'current-password'}),h('button',{class:'btn'},'लॉगिन'),m=h('p',{class:'muted'})))}
async function panel(){
 const L=await api('admin/listings'),cs=countries(),sel=()=>h('select',{},cs.map(x=>h('option',{value:x[0]},x[1])));
 const c1=sel(),n1=h('input',{placeholder:'राज्य का नाम'}),c2=sel(),st=h('select'),t=h('input',{placeholder:'गाने का टाइटल'}),th=h('input',{placeholder:'थीम'}),su=h('textarea',{placeholder:'छोटा सारांश (लिरिक्स नहीं)',maxlength:400}),sl=h('div');
 const loadSongs=async()=>{sl.replaceChildren();if(!st.value)return;const d=await api('songs?state='+st.value);
  sl.append(...d.songs.map(x=>h('p',{},x.title+' ',h('button',{class:'btn sm red',onclick:async()=>{await del('admin/song?id='+x.id);loadSongs()}},'हटाएँ'))))};
 const loadSt=async()=>{const s=await api('states?country='+c2.value);st.replaceChildren(...s.map(x=>h('option',{value:x.id},x.name)));loadSongs()};
 c2.addEventListener('change',loadSt);st.addEventListener('change',loadSongs);loadSt();
 const rows=L.map(x=>h('div',{class:'card'},h('h3',{},x.title+' — '+x.status),h('p',{},x.price+' | '+x.seller+' | '+x.contact),h('p',{},x.description),h('img',{src:'/api/img/'+x.id,class:'qr',alt:'qr'}),
  h('div',{},...[['approved','अप्रूव'],['rejected','रिजेक्ट']].map(([s,l])=>h('button',{class:'btn sm',onclick:async()=>{await post('admin/listing',{id:x.id,status:s});panel()}},l)),
  h('button',{class:'btn sm red',onclick:async()=>{await del('admin/listing?id='+x.id);panel()}},'डिलीट'))));
 root.replaceChildren(h('h2',{},'लिस्टिंग (पेंडिंग ऊपर)'),...(rows.length?rows:[h('p',{class:'muted'},'कोई लिस्टिंग नहीं')]),
  h('h2',{},'राज्य जोड़ें'),h('div',{class:'card'},c1,n1,h('button',{class:'btn',onclick:async()=>{const r=await post('admin/state',{country:c1.value,name:n1.value});n1.value='';alert(r.ok?'जुड़ गया':'गलती');loadSt()}},'राज्य जोड़ें')),
  h('h2',{},'गाना जोड़ें'),h('div',{class:'card'},c2,st,h('button',{class:'btn sm red',onclick:async()=>{if(st.value&&confirm('राज्य और उसके सारे गाने हटाएँ?')){await del('admin/state?id='+st.value);loadSt()}}},'यह राज्य हटाएँ'),t,th,su,
   h('button',{class:'btn',onclick:async()=>{const r=await post('admin/song',{state_id:st.value,title:t.value,theme:th.value,summary:su.value});if(r.ok){t.value=th.value=su.value='';loadSongs()}else alert('सारे फ़ील्ड भरें')}},'गाना जोड़ें'),sl))}
start();
