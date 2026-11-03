// Worker version of the old Pages Function (functions/api/[[path]].js).
// /api/* is handled here; every other request is served from the public/ folder.
const J=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'}});
const E=new TextEncoder(),hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''),T=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';
const sign=async(env,m)=>hex(await crypto.subtle.sign('HMAC',await crypto.subtle.importKey('raw',E.encode(env.SESSION_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']),E.encode(m)));
async function isAdmin(req,env){const m=(req.headers.get('cookie')||'').match(/__Host-adm=(\d+)\.([0-9a-f]+)/);return !!m&&+m[1]>Date.now()&&m[2]===await sign(env,m[1])}
const kind=a=>{if(a[0]==0x89&&a[1]==0x50&&a[2]==0x4e&&a[3]==0x47)return'image/png';if(a[0]==0xff&&a[1]==0xd8&&a[2]==0xff)return'image/jpeg';if(a[0]==0x52&&a[1]==0x49&&a[8]==0x57&&a[9]==0x45)return'image/webp';return''};

async function onApi(req,env,u){
const [a,b]=u.pathname.replace(/^\/api\//,'').split('/').filter(Boolean),m=req.method,db=env.DB,q=k=>u.searchParams.get(k);
if(m!=='GET'){const o=req.headers.get('origin');if(!o||new URL(o).host!==u.host)return J({error:'origin'},403)}

if(m==='GET'&&a==='states')return J((await db.prepare('SELECT id,name FROM states WHERE country=? ORDER BY name').bind(T(q('country'),2)).all()).results);
if(m==='GET'&&a==='songs'){const s=await db.prepare('SELECT name FROM states WHERE id=?').bind(+q('state')).first();
 return J({state:s&&s.name,songs:(await db.prepare('SELECT id,title,theme,summary FROM songs WHERE state_id=?').bind(+q('state')).all()).results})}
if(m==='GET'&&a==='listings')return J((await db.prepare("SELECT id,title,description,price,contact FROM listings WHERE status='approved' ORDER BY id DESC").all()).results);
if(m==='GET'&&a==='img'){const r=await db.prepare('SELECT img,img_type,status FROM listings WHERE id=?').bind(+b).first();
 if(!r||(r.status!=='approved'&&!await isAdmin(req,env)))return new Response('',{status:404});
 return new Response(Uint8Array.from(atob(r.img),c=>c.charCodeAt(0)),{headers:{'content-type':r.img_type,'x-content-type-options':'nosniff','content-security-policy':"default-src 'none'",'cache-control':'private, max-age=300'}})}

if(m==='POST'&&a==='listings'){
 const f=await req.formData(),by=req.headers.get('cf-access-authenticated-user-email')||'unknown',file=f.get('qr');
 const title=T(f.get('title'),80),description=T(f.get('description'),500),price=T(f.get('price'),30),contact=T(f.get('contact'),60);
 if(!title||!price||!(file instanceof File)||!file.size||file.size>153600)return J({error:'सही जानकारी और 150KB तक की QR इमेज दें'},400);
 const bytes=new Uint8Array(await file.arrayBuffer()),type=kind(bytes);
 if(!type)return J({error:'सिर्फ PNG/JPG/WEBP इमेज चलेगी'},400);
 const n=await db.prepare("SELECT COUNT(*) c FROM listings WHERE seller=? AND status='pending'").bind(by).first();
 if(n.c>=5)return J({error:'पहले की लिस्टिंग अप्रूव होने दें'},429);
 let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));
 await db.prepare('INSERT INTO listings(title,description,price,contact,seller,img,img_type) VALUES(?,?,?,?,?,?,?)').bind(title,description,price,contact,by,btoa(s),type).run();
 return J({ok:1})}

if(a==='admin'){
 if(b==='login'&&m==='POST'){const d=await req.json().catch(()=>({})),g=s=>crypto.subtle.digest('SHA-256',E.encode(String(s)));
  if(!env.ADMIN_PASSWORD||!env.SESSION_SECRET||!crypto.subtle.timingSafeEqual(await g(d.password),await g(env.ADMIN_PASSWORD))){await new Promise(r=>setTimeout(r,1500));return J({error:'गलत पासवर्ड'},401)}
  const exp=Date.now()+288e5;
  return new Response('{"ok":1}',{headers:{'content-type':'application/json','set-cookie':`__Host-adm=${exp}.${await sign(env,''+exp)}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=28800`}})}
 if(!await isAdmin(req,env))return J({error:'login'},401);
 const d=m==='POST'?await req.json().catch(()=>({})):{};
 if(b==='check')return J({ok:1});
 if(b==='listings'&&m==='GET')return J((await db.prepare("SELECT id,title,description,price,contact,seller,status FROM listings ORDER BY status='pending' DESC,id DESC").all()).results);
 if(b==='listing'&&m==='POST'){if(!['approved','rejected'].includes(d.status))return J({error:1},400);await db.prepare('UPDATE listings SET status=? WHERE id=?').bind(d.status,+d.id).run();return J({ok:1})}
 if(b==='listing'&&m==='DELETE'){await db.prepare('DELETE FROM listings WHERE id=?').bind(+q('id')).run();return J({ok:1})}
 if(b==='state'&&m==='POST'){const c=T(d.country,2),n=T(d.name,60);if(!c||!n)return J({error:1},400);await db.prepare('INSERT INTO states(country,name) VALUES(?,?)').bind(c,n).run();return J({ok:1})}
 if(b==='state'&&m==='DELETE'){await db.batch([db.prepare('DELETE FROM songs WHERE state_id=?').bind(+q('id')),db.prepare('DELETE FROM states WHERE id=?').bind(+q('id'))]);return J({ok:1})}
 if(b==='song'&&m==='POST'){const t=T(d.title,100),th=T(d.theme,100),s=T(d.summary,400);if(!t||!th||!s||!+d.state_id)return J({error:1},400);
  await db.prepare('INSERT INTO songs(state_id,title,theme,summary) VALUES(?,?,?,?)').bind(+d.state_id,t,th,s).run();return J({ok:1})}
 if(b==='song'&&m==='DELETE'){await db.prepare('DELETE FROM songs WHERE id=?').bind(+q('id')).run();return J({ok:1})}
}
return J({error:'not found'},404)}

export default{
 async fetch(request,env){
  const u=new URL(request.url);
  if(u.pathname.startsWith('/api/'))return onApi(request,env,u);
  return env.ASSETS.fetch(request);
 }
};
