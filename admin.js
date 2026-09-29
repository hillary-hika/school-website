const KEY='cheptulelAdminV3';
const defaults={
  projects:[{id:crypto.randomUUID(),name:'Modern Learning Facilities',category:'Infrastructure',status:'Seeking Support',target:'To be confirmed',raised:'0',description:'A dedicated space for improved learning and growing student needs.',image:'',update:'Project information will be updated by authorized school staff.'}],
  news:[{id:crypto.randomUUID(),title:'Welcome to our new school website',category:'School News',body:'Our online platform will help us share school activities, achievements and development needs with the wider community.',date:new Date().toISOString()}],
  gallery:[], sponsors:[], enquiries:[], settings:{phone:'',email:'',paybill:'',facebook:'',whatsapp:''}
};
let db=JSON.parse(localStorage.getItem(KEY)||'null')||defaults;
const ensureIds=()=>{['projects','news','gallery','sponsors','enquiries'].forEach(k=>(db[k]||[]).forEach(x=>x.id ||= crypto.randomUUID()));db.projects ||= [];db.news ||= [];db.gallery ||= [];db.sponsors ||= [];db.enquiries ||= [];db.settings ||= {};};
ensureIds(); save(false);
function save(render=true){localStorage.setItem(KEY,JSON.stringify(db)); if(render) renderAll();}
function toast(t){const e=document.getElementById('toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2200)}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function render(id,arr,fn){document.getElementById(id).innerHTML=arr.length?arr.map(fn).join(''):'<div class="admin-card"><p class="hint">No records yet.</p></div>'}
function money(v){const n=Number(v);return Number.isFinite(n)&&n>0?`KES ${n.toLocaleString()}`:(v||'To be confirmed')}
function progress(x){const t=Number(x.target),r=Number(x.raised);return t>0?Math.max(0,Math.min(100,Math.round(r/t*100))):0}
function renderAll(){
  statProjects.textContent=db.projects.length;statNews.textContent=db.news.length;statGallery.textContent=db.gallery.length;statSponsors.textContent=db.sponsors.length;statEnquiries.textContent=db.enquiries.length;
  render('projectList',db.projects,(x)=>`<div class="list-item"><div class="list-main">${x.image?`<img class="thumb" src="${esc(x.image)}" alt="">`:''}<div><h3>${esc(x.name)}</h3><p>${esc(x.category)} · ${esc(x.status)} · ${progress(x)}% funded</p><p>Target: ${money(x.target)} · Raised: ${money(x.raised)}</p><p>${esc(x.description)}</p><p><b>Latest update:</b> ${esc(x.update||'No update')}</p></div></div><button class="delete" onclick="removeItem('projects','${x.id}')">Delete</button></div>`);
  render('newsList',db.news,(x)=>`<div class="list-item"><div><h3>${esc(x.title)}</h3><p>${esc(x.category)} · ${new Date(x.date||Date.now()).toLocaleDateString()}</p><p>${esc(x.body)}</p></div><button class="delete" onclick="removeItem('news','${x.id}')">Delete</button></div>`);
  render('galleryList',db.gallery,(x)=>`<div class="list-item"><div class="list-main">${x.url?`<img class="thumb" src="${esc(x.url)}" alt="${esc(x.title)}">`:''}<div><h3>${esc(x.title)}</h3><p>${esc(x.category)} · ${x.approved?'Published':'Pending review'}</p><p>${esc(x.caption||'')}</p></div></div><button class="delete" onclick="removeItem('gallery','${x.id}')">Delete</button></div>`);
  render('sponsorList',db.sponsors,(x)=>`<div class="list-item"><div><h3>${esc(x.name)}</h3><p>${esc(x.type)} · ${esc(x.website||'No website')}</p><p>${esc(x.description)}</p></div><button class="delete" onclick="removeItem('sponsors','${x.id}')">Delete</button></div>`);
  render('enquiryList',db.enquiries,(x)=>`<div class="list-item"><div><h3>${esc(x.name)} ${x.organization?`— ${esc(x.organization)}`:''}</h3><p>${esc(x.email)} · ${esc(x.phone||'No phone')} · ${esc(x.support_area||'General support')}</p><p>${esc(x.message)}</p><small>${new Date(x.date||Date.now()).toLocaleString()}</small></div><button class="delete" onclick="removeItem('enquiries','${x.id}')">Delete</button></div>`);
  if(db.settings){for(const [k,v] of Object.entries(db.settings)){const el=document.querySelector(`[name="${k}"]`);if(el)el.value=v||'';}}
}
function formData(form){return Object.fromEntries(new FormData(form).entries())}
function bind(id,key,msg,transform=x=>x){document.getElementById(id).addEventListener('submit',e=>{e.preventDefault();const x=transform(formData(e.target));x.id=crypto.randomUUID();db[key].unshift(x);e.target.reset();save();toast(msg)})}
bind('projectForm','projects','Project added',x=>({...x,raised:x.raised||'0',image:''}));
bind('newsForm','news','News published',x=>({...x,date:new Date().toISOString()}));
bind('sponsorForm','sponsors','Partner added');

document.getElementById('galleryForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.target;const file=f.image.files[0];if(!file){toast('Please choose a photo');return}if(file.size>2*1024*1024){toast('Photo must be 2MB or smaller');return}const reader=new FileReader();reader.onload=()=>{db.gallery.unshift({id:crypto.randomUUID(),title:f.title.value,category:f.category.value||'School Life',caption:f.caption.value,approved:f.approved.checked,url:reader.result,date:new Date().toISOString()});f.reset();save();toast('Photo uploaded locally')};reader.readAsDataURL(file)});
document.getElementById('settingsForm').addEventListener('submit',e=>{e.preventDefault();db.settings=formData(e.target);save();toast('School settings saved')});
document.getElementById('clearDemo').onclick=()=>{if(confirm('This will remove all local website content and restore the starter data. Continue?')){db=structuredClone(defaults);ensureIds();save();toast('Demo data reset')}};
document.getElementById('exportData').onclick=()=>{const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='cheptulel-school-backup-v3.json';a.click();URL.revokeObjectURL(a.href)};
window.removeItem=(key,id)=>{if(confirm('Remove this item?')){db[key]=db[key].filter(x=>x.id!==id);save();toast('Item removed')}};
document.querySelectorAll('.side').forEach(b=>b.onclick=()=>show(b.dataset.panel));document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));function show(id){document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.side').forEach(x=>x.classList.toggle('active',x.dataset.panel===id));document.getElementById(id).classList.add('active')}
renderAll();
