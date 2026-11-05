const root=document.getElementById('root');
async function start(){(await api('admin/check')).ok?panel():login()}
function login(){let pw,m;root.replaceChildren(h('form',{class:'card',onsubmit:async e=>{e.preventDefault();const r=await post('admin/login',{password:pw.value});r.ok?panel():m.textContent=r.error}},
 pw=h('input',{type:'password',placeholder:'Admin password',autocomplete:'current-password'}),h('button',{class:'btn'},'Log in'),m=h('p',{class:'muted'})))}
async function panel(){
 const L=await api('admin/listings'),cs=countries(),sel=()=>h('select',{},cs.map(x=>h('option',{value:x[0]},x[1])));
 const c1=sel(),n1=h('textarea',{placeholder:'One or many states, separated by commas or new lines\nExample: Kerala, Goa, Punjab'}),c2=sel(),st=h('select'),t=h('input',{placeholder:'Song title'}),th=h('input',{placeholder:'Theme'}),su=h('textarea',{placeholder:'Short summary (no lyrics)',maxlength:400}),sl=h('div');
 const loadSongs=async()=>{sl.replaceChildren();if(!st.value)return;const d=await api('songs?state='+st.value);
  sl.append(...d.songs.map(x=>h('p',{},x.title+' ',h('button',{class:'btn sm red',onclick:async()=>{await del('admin/song?id='+x.id);loadSongs()}},'Delete'))))};
 const loadSt=async()=>{const s=await api('states?country='+c2.value);st.replaceChildren(...s.map(x=>h('option',{value:x.id},x.name)));loadSongs()};
 c2.addEventListener('change',loadSt);st.addEventListener('change',loadSongs);loadSt();
 const addStates=async()=>{const names=[...new Set(n1.value.split(/[,\n]/).map(x=>x.trim()).filter(Boolean))].slice(0,80);let ok=0;
  for(const n of names)if((await post('admin/state',{country:c1.value,name:n})).ok)ok++;n1.value='';alert(ok+' state(s) added');loadSt()};
 const rows=L.map(x=>h('div',{class:'card'},h('h3',{},x.title+' — '+x.status),h('p',{},x.price+' | '+x.seller+' | '+x.contact),h('p',{},x.description),h('img',{src:'/api/img/'+x.id,class:'qr',alt:'qr'}),
  h('div',{},...[['approved','Approve'],['rejected','Reject']].map(([s,l])=>h('button',{class:'btn sm',onclick:async()=>{await post('admin/listing',{id:x.id,status:s});panel()}},l)),
  h('button',{class:'btn sm red',onclick:async()=>{await del('admin/listing?id='+x.id);panel()}},'Delete'))));
 root.replaceChildren(h('h2',{},'Listings (pending first)'),...(rows.length?rows:[h('p',{class:'muted'},'No listings')]),
  h('h2',{},'Add states'),h('div',{class:'card'},c1,n1,h('button',{class:'btn',onclick:addStates},'Add states')),
  h('h2',{},'Add song'),h('div',{class:'card'},c2,st,h('button',{class:'btn sm red',onclick:async()=>{if(st.value&&confirm('Delete this state and all its songs?')){await del('admin/state?id='+st.value);loadSt()}}},'Delete this state'),t,th,su,
   h('button',{class:'btn',onclick:async()=>{const r=await post('admin/song',{state_id:st.value,title:t.value,theme:th.value,summary:su.value});if(r.ok){t.value=th.value=su.value='';loadSongs()}else alert('Select a state and fill all fields')}},'Add song'),sl))}
start();
