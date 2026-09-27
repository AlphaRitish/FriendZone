/* FriendZone (ASU Edition) — state, matching algorithm, views and interactions. Load after data.js. */
/* =========================================================
   State
========================================================= */
const NOW = new Date('2026-09-27T15:02');
const state = {
  screen:'auth', tab:'discover', user:null, provider:null,
  matches:[], passed:[], pending:[], history:[],
  rsvps:new Set(), joinedHang:new Set(), events:[...EVENTS], hangouts:HANGOUTS0.map(h=>({...h,att:[...h.att]})),
  squads:SQUADS0.map(s=>({...s,members:[...s.members],chat:s.chat.map(([from,text])=>({from,text}))})), mySquads:new Set(),
  chats:{}, activeChat:null, typing:null,
  deckGoal:'All', evCat:'For You', dir:{q:'',major:'',campus:'',year:'',tags:[]}, squadQ:'',
  ob:null
};
const DEMO_USER = {
  name:'Varghese Kandathil', pref:'Varghese', pron:'', major:'Computer Systems Engineering', year:2030, campus:'Tempe',
  bio:'First-year CSE in Tooker. Building on-device computer vision for accessibility, starting with sign language. Always up for a hackathon or a late boba run.',
  hangouts:['Tooker House','Noble Library','Memorial Union'], tags:['Hackathons','ComputerVision','Accessibility','Coding','LateNightStudy','Boba'],
  goals:['Study Buddies','Research Partners','Explore Phoenix'], photo:null, id:'me', hue:350
};

/* =========================================================
   Helpers
========================================================= */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
const initials = n => String(n||'?').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('');
const shortSpot = s => s==='Sun Devil Fitness Complex'?'SDFC':s;
const allEvents = () => [...state.events, ...state.hangouts];
const evById = id => allEvents().find(e=>e.id===id);
const inter = (a,b) => { const s=new Set(b.map(norm)); return a.filter(x=>s.has(norm(x))); };
const cos = (a,b) => (!a.length||!b.length) ? 0 : inter(a,b).length/Math.sqrt(a.length*b.length);
const going = pid => allEvents().filter(e=>e.att.includes(pid)).map(e=>e.id);
const myEvents = () => allEvents().filter(e=>e.att.includes('me')).map(e=>e.id);
const isMatch = id => state.matches.includes(id);
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.hidden=false; clearTimeout(toast._t); toast._t=setTimeout(()=>t.hidden=true,2600); }

function grad(h){ return `linear-gradient(160deg,hsl(${h} 58% 46%),hsl(${(h+38)%360} 55% 26%) 70%,hsl(${(h+60)%360} 45% 16%))`; }
function avatar(p,size=40,cls=''){
  const bg = p.photo ? `background-image:url(${p.photo})` : `background:${grad(p.hue)}`;
  return `<span class="av ${cls}" style="--s:${size}px;${bg}" aria-hidden="true">${p.photo?'':esc(initials(p.name))}</span>`;
}
function photo(p){
  if(p.photo) return `<div class="photo" style="background-image:url(${p.photo})"></div>`;
  return `<div class="photo" style="background:${grad(p.hue)}"><div class="ini">${esc(initials(p.name))}</div>${SIL}</div>`;
}
function dayLabel(d){
  const a=new Date(NOW); a.setHours(0,0,0,0); const b=new Date(d); b.setHours(0,0,0,0);
  const diff=Math.round((b-a)/864e5);
  if(diff===0) return 'Today'; if(diff===1) return 'Tomorrow';
  return b.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
}
const ymd = x => `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
const timeLabel = d => new Date(d).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
function dateBlock(e,cls=''){
  const d=new Date(e.when);
  return `<div class="ev-date ${e.hang?'hang':''} ${cls}"><span class="m">${d.toLocaleDateString('en-US',{month:'short'}).toUpperCase()}</span><span class="d tnum">${d.getDate()}</span><span class="w">${d.toLocaleDateString('en-US',{weekday:'short'})}</span></div>`;
}
const catClass = c => c==='Campus Life'?'Campus':c;

/* =========================================================
   Matching algorithm
========================================================= */
const WEIGHTS = {tags:.36, goals:.16, major:.14, campus:.10, hangouts:.14, events:.10};
function majorAffinity(a,b){
  if(a===b) return 1; const A=majorOf(a),B=majorOf(b);
  if(A.c && A.c===B.c) return .6; if(A.t && B.t) return .45; return 0;
}
function breakdown(p){
  const u=state.user;
  return {
    tags:cos(u.tags,p.tags), goals:cos(u.goals,p.goals), major:majorAffinity(u.major,p.major),
    campus:u.campus===p.campus?1:0, hangouts:cos(u.hangouts,p.hangouts), events:cos(myEvents(),going(p.id))
  };
}
function compat(p){
  const b=breakdown(p); let raw=0; for(const k in WEIGHTS) raw+=WEIGHTS[k]*b[k];
  return Math.max(38,Math.min(99,Math.round(40+62*raw)));
}
function reasons(p){
  const u=state.user, out=[];
  const t=inter(u.tags,p.tags);
  if(t.length) out.push(`Both into ${t.slice(0,2).map(x=>'#'+x).join(' & ')}`);
  const h=inter(u.hangouts,p.hangouts);
  if(h.length) out.push(`Both hang out at ${shortSpot(h[0])}`);
  const ev=inter(myEvents(),going(p.id));
  if(ev.length) out.push(`Both going to ${evById(ev[0]).title}`);
  if(u.major===p.major) out.push(`Both ${u.major} majors`);
  else { const A=majorOf(u.major),B=majorOf(p.major);
    if(A.c&&A.c===B.c) out.push(A.c==='Fulton'?'Fellow Fulton engineers':`Both in ${A.c}`);
    else if(A.t&&B.t) out.push('Both in tech-heavy majors'); }
  const g=inter(u.goals,p.goals);
  if(g.length) out.push(`Both looking for ${g[0]}`);
  if(u.campus===p.campus) out.push(`Both on the ${u.campus} campus`);
  return out;
}
function whyLine(p){
  const r=reasons(p); if(!r.length) return 'New circle, new perspective';
  if(r.length===1) return r[0];
  return r[0]+' · '+r[1].replace(/^Both /,'').replace(/^hang out at/,'hang at');
}
function eventRelevance(e){
  const u=state.user;
  const tagFit=cos([...u.tags,...u.goals.map(g=>g.split(' ')[0])],e.tags);
  const campus=u.campus===e.campus?1:0;
  const friends=e.att.filter(id=>id!=='me').map(byId).filter(Boolean);
  const friendFit=friends.length?friends.reduce((s,p)=>s+compat(p),0)/friends.length/100:0;
  const matched=friends.filter(p=>isMatch(p.id)).length;
  const raw=.55*tagFit+.15*campus+.2*friendFit+Math.min(.1,matched*.05);
  return Math.max(30,Math.min(99,Math.round(35+75*raw)));
}
function sharedEvents(p,n=3){
  const shared=inter(state.user.tags,p.tags), both=[...state.user.tags,...p.tags];
  return allEvents().filter(e=>new Date(e.when)>=NOW)
    .map(e=>({e,s:inter(shared,e.tags).length*2+cos(both,e.tags)+(e.att.includes(p.id)?1.5:0)+(e.campus===p.campus&&e.campus===state.user.campus?.6:0)}))
    .sort((a,b)=>b.s-a.s).slice(0,n).map(x=>x.e);
}

/* =========================================================
   Screens
========================================================= */
function render(){
  const app=$('#app');
  if(state.screen==='auth') app.innerHTML=renderAuth();
  else if(state.screen==='onboard') app.innerHTML=renderOnboard();
  else { app.innerHTML=renderShell(); afterRender(); }
}

function renderAuth(){
  const art=['p14','p1','p5'].map(id=>{const p=byId(id);return `<div class="pcard">${photo(p)}<div class="card-shade"></div><div class="card-body"><div class="card-name"><h3 style="font-size:24px">${esc(p.pref)}</h3></div><div class="card-meta">${esc(p.major)}</div></div></div>`;}).join('');
  return `<div class="auth">
    <div>
      <div class="brand"><div class="brand-mark">${I.fork}</div><div class="brand-name">FriendZone<small>ASU Edition</small></div></div>
      <h1>Find your people<br>at <em>ASU</em>, faster.</h1>
      <p class="lede">Swipe on Sun Devils who share your classes, your hangout spots and your weekend plans. Then turn the match into an actual plan with Sun Devil Central events.</p>
      <div class="sso">
        <button class="btn btn-maroon" data-act="sso" data-p="asu">${I.shield}Sign in with ASU ASURITE (SSO)<span class="sub">Recommended</span></button>
        <button class="btn btn-google" data-act="sso" data-p="google">${I.google}Sign in with Google / Gmail</button>
      </div>
      <p class="fine">Prototype build. Sign-in is simulated and nothing leaves this page. ASURITE sign-in marks your profile as a verified ASU student; Google accounts are asked to confirm an asu.edu address.</p>
      <div class="auth-stats"><div><b class="tnum">4</b><span>campuses</span></div><div><b class="tnum">${EVENTS.length}</b><span>events this week</span></div><div><b class="tnum">${SQUADS0.length}</b><span>squads recruiting</span></div></div>
    </div>
    <div class="auth-art">${art}</div>
  </div>`;
}

/* ---------- onboarding ---------- */
function startOnboard(edit){
  const src = edit ? state.user : DEMO_USER;
  state.ob = {step:0, edit:!!edit, d:JSON.parse(JSON.stringify(src))};
  state.screen='onboard'; render(); window.scrollTo(0,0);
}
function renderOnboard(){
  const {step,d,edit}=state.ob;
  const titles=['The basics','Academics & campus','Your vibe'];
  const subs=['How other Sun Devils will see you.','Used for major affinity and campus matching.','Tags, hangouts and goals drive most of your match score.'];
  let body='';
  if(step===0){
    body=`<div class="photo-pick">${avatar({...d,name:d.name||'?'},84)}<div style="display:grid;gap:6px"><label class="btn btn-ghost btn-sm" for="obPhoto" style="cursor:pointer">${I.plus}Upload a photo</label><input id="obPhoto" type="file" accept="image/*" hidden><span class="hint">Optional. Profiles without a photo get a color portrait.</span></div></div>
    <div class="row2"><div class="field"><label for="obName">Full name</label><input class="input" id="obName" data-f="name" value="${esc(d.name)}" required></div>
    <div class="field"><label for="obPref">Preferred name</label><input class="input" id="obPref" data-f="pref" value="${esc(d.pref)}"></div></div>
    <div class="field"><label for="obPron">Pronouns</label><select class="input" id="obPron" data-f="pron">${PRONOUNS.map(p=>`<option value="${esc(p)}" ${p===d.pron?'selected':''}>${p||'Prefer not to show'}</option>`).join('')}</select></div>`;
  } else if(step===1){
    body=`<div class="field"><label for="obMajor">ASU major / program</label><select class="input" id="obMajor" data-f="major">${MAJORS.map(m=>`<option ${m.n===d.major?'selected':''}>${esc(m.n)}</option>`).join('')}</select><span class="hint">College: ${esc(majorOf(d.major).c)}</span></div>
    <div class="row2"><div class="field"><label for="obYear">Graduation year</label><select class="input" id="obYear" data-f="year">${[2027,2028,2029,2030,2031].map(y=>`<option ${y==d.year?'selected':''}>${y}</option>`).join('')}</select></div>
    <div class="field"><span class="label">Primary campus</span><div class="chips">${CAMPUSES.map(c=>`<button type="button" class="chip maroon ${c===d.campus?'on':''}" data-act="obCampus" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div></div></div>
    <div class="field"><span class="label">Favorite campus hangout spots</span><div class="chips">${SPOTS.map(s=>`<button type="button" class="chip ${d.hangouts.includes(s)?'on':''}" data-act="obToggle" data-k="hangouts" data-v="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>`;
  } else {
    const extra=d.tags.filter(t=>!TAGS.includes(t));
    body=`<div class="field"><label for="obBio">Bio</label><textarea class="input" id="obBio" data-f="bio" maxlength="220">${esc(d.bio)}</textarea><span class="hint">${d.bio.length}/220</span></div>
    <div class="field"><span class="label">Personality tags & hobbies <span class="faint" style="text-transform:none;letter-spacing:0">(${d.tags.length} picked)</span></span>
      <div class="chips">${[...TAGS,...extra].map(t=>`<button type="button" class="chip ${d.tags.includes(t)?'on':''}" data-act="obToggle" data-k="tags" data-v="${esc(t)}">#${esc(t)}</button>`).join('')}</div>
      <form class="taginput" data-form="addTag"><input class="input" id="obTagNew" placeholder="Add a custom tag, e.g. SignLanguage"><button class="btn btn-ghost">Add</button></form></div>
    <div class="field"><span class="label">Friendship goals</span><div class="chips">${GOALS.map(g=>`<button type="button" class="chip maroon ${d.goals.includes(g)?'on':''}" data-act="obToggle" data-k="goals" data-v="${esc(g)}">${esc(g)}</button>`).join('')}</div></div>`;
  }
  return `<div class="ob">
    <div class="ob-head"><div class="brand"><div class="brand-mark">${I.fork}</div><div class="brand-name">FriendZone<small>ASU Edition</small></div></div>
    <span class="verified">${I.shield}${state.provider==='google'?'Google account · asu.edu confirmed':'Verified via ASURITE'}</span></div>
    <div class="steps">${[0,1,2].map(i=>`<div class="${i<=step?'on':''}"></div>`).join('')}</div>
    <p class="label" style="margin-top:18px">Step ${step+1} of 3 ${edit?'· Editing profile':''}</p>
    <h2>${titles[step]}</h2><p class="sub">${subs[step]}${!edit&&step===0?' Filled in with a sample profile so you can click straight through.':''}</p>
    <div class="form glass">${body}</div>
    <div class="ob-foot">
      <button class="btn btn-ghost" data-act="obBack">${step===0?(edit?'Cancel':'Back to sign-in'):'Back'}</button>
      <button class="btn btn-gold" data-act="obNext">${step===2?(edit?'Save profile':'Start matching'):'Continue'}</button>
    </div>
  </div>`;
}
function finishOnboard(){
  const d=state.ob.d;
  if(!d.name.trim()){ state.ob.step=0; render(); toast('Add your full name to continue'); return; }
  if(!d.pref.trim()) d.pref=d.name.split(' ')[0];
  d.year=+d.year; d.id='me'; d.hue=d.hue||350;
  const wasEdit=state.ob.edit;
  state.user=d; state.ob=null;
  if(!wasEdit) seedWorld();
  state.screen='app'; if(!wasEdit) state.tab='discover';
  render(); window.scrollTo(0,0);
  toast(wasEdit?'Profile saved. Match scores updated.':`Welcome, ${d.pref}! Your deck is ready.`);
}
function seedWorld(){
  state.matches=['p14','p1']; state.passed=[]; state.pending=[]; state.history=[];
  EVENTS.find(e=>e.id==='e2').att.includes('me')||EVENTS.find(e=>e.id==='e2').att.push('me');
  state.mySquads=new Set(['s2']);
  const s2=state.squads.find(s=>s.id==='s2'); if(!s2.members.includes('me')) s2.members.push('me');
  state.chats={
    p14:{kind:'dm',unread:1,msgs:[{sys:'You matched with Arjun · 3 days ago'},{from:'p14',text:'Hey! Saw you are in Tooker too. Which floor?'},{from:'me',text:'5th! You?'},{from:'p14',text:'3rd. You going to the GDSC on-device ML workshop Tuesday?'}]},
    p1:{kind:'dm',unread:1,msgs:[{sys:'You matched with Priya · yesterday'},{from:'p1',text:`Hi ${state.user.pref}! Our match card says we both do hackathons. Want to team up for Devils Invent?`}]},
    s2:{kind:'squad',unread:0,msgs:null}
  };
}

/* ---------- shell ---------- */
const TABS=[['discover','Discover',I.flame],['events','Events',I.cal],['squads','Squads',I.users],['directory','Directory',I.search],['chats','Chats',I.chat],['me','Profile',I.user]];
function unreadTotal(){ return Object.values(state.chats).reduce((s,c)=>s+(c.unread||0),0); }
function renderShell(){
  const u=state.user, un=unreadTotal();
  const nav=TABS.map(([k,l,ic])=>`<button class="nav-btn ${state.tab===k?'on':''}" data-act="tab" data-v="${k}" aria-current="${state.tab===k}">${ic}${l}${k==='chats'&&un?`<span class="badge-n tnum">${un}</span>`:''}</button>`).join('');
  const bnav=TABS.map(([k,l,ic])=>`<button class="${state.tab===k?'on':''}" data-act="tab" data-v="${k}" aria-label="${l}">${ic}<span>${l}</span>${k==='chats'&&un?`<span class="badge-n tnum">${un}</span>`:''}</button>`).join('');
  return `<div class="shell">
    <aside class="rail"><div class="brand"><div class="brand-mark">${I.fork}</div><div class="brand-name">FriendZone<small>ASU Edition</small></div></div>${nav}
      <button class="rail-me" data-act="tab" data-v="me">${avatar(u,38)}<div style="text-align:left"><b>${esc(u.pref)}</b><span>${esc(u.campus)} · ${u.year}</span></div></button></aside>
    <div>
      <header class="topbar"><div class="brand"><div class="brand-mark" style="width:32px;height:32px">${I.fork}</div><div class="brand-name" style="font-size:18px">FriendZone<small>ASU Edition</small></div></div>
        <button data-act="tab" data-v="me" aria-label="Your profile">${avatar(u,34)}</button></header>
      <main class="view" id="view">${renderTab()}</main>
    </div>
    <nav class="bottomnav">${bnav}</nav>
  </div>`;
}
function renderTab(){
  return ({discover:vDiscover,events:vEvents,squads:vSquads,directory:vDirectory,chats:vChats,me:vMe})[state.tab]();
}
function refresh(){
  if(state.screen!=='app'){ render(); return; }
  const mi=document.getElementById('msgIn'), keep=mi?{v:mi.value,f:document.activeElement===mi}:null;
  document.getElementById('app').innerHTML=renderShell(); afterRender();
  const n=document.getElementById('msgIn'); if(n&&keep){ n.value=keep.v; if(keep.f) n.focus(); }
}
function afterRender(){
  if(state.tab==='discover') bindTopCard();
  if(state.tab==='chats'){ const m=$('.msgs'); if(m) m.scrollTop=m.scrollHeight; }
}

/* ---------- discover ---------- */
function deckList(){
  return PROFILES.filter(p=>!isMatch(p.id)&&!state.passed.includes(p.id)&&!state.pending.includes(p.id))
    .filter(p=>state.deckGoal==='All'||p.goals.includes(state.deckGoal))
    .sort((a,b)=>compat(b)-compat(a));
}
function cardHTML(p,cls){
  const shared=new Set(inter(state.user.tags,p.tags).map(norm));
  const s=compat(p);
  return `<article class="card ${cls}" data-id="${p.id}" aria-label="${esc(p.name)}, ${s}% match">
    ${photo(p)}<div class="card-shade"></div>
    <span class="stamp like">CONNECT</span><span class="stamp nope">PASS</span><span class="stamp sup">SUPER LIKE</span>
    <div class="card-top"><span class="loc">${I.pin}${esc(p.campus)}</span><div class="card-score"><b>${s}%</b><span>Match</span></div></div>
    <div class="card-body">
      <div class="card-name"><h3>${esc(p.pref)}</h3><span>${esc(p.pron)}</span></div>
      <div class="card-meta">${esc(p.major)} · Class of ${p.year}</div>
      <p class="card-bio">${esc(p.bio)}</p>
      <div class="chips" style="gap:5px">${p.tags.slice(0,5).map(t=>`<span class="tag ${shared.has(norm(t))?'shared':''}">#${esc(t)}</span>`).join('')}</div>
      <div class="why">${I.spark}<span>${esc(whyLine(p))}</span></div>
    </div>
    <button class="icon-btn card-info" style="bottom:auto;top:66px;right:14px;position:absolute;background:rgba(0,0,0,.45)" data-act="profile" data-id="${p.id}" aria-label="See full profile">${I.info}</button>
  </article>`;
}
function vDiscover(){
  const deck=deckList(); const top=deck[0];
  const cards = deck.slice(0,3).map((p,i)=>cardHTML(p,['top','n1','n2'][i])).reverse().join('');
  const b = top?breakdown(top):null;
  const lbl={tags:'Shared tags',goals:'Friendship goals',major:'Major affinity',campus:'Same campus',hangouts:'Hangout spots',events:'Event RSVPs'};
  const picks=deck.slice(1,6).map(p=>`<button class="pick" data-act="profile" data-id="${p.id}">${avatar(p,42)}<span class="t"><b>${esc(p.name)}</b><small>${esc(whyLine(p))}</small></span><span class="score dim">${compat(p)}%</span></button>`).join('');
  return `<div class="view-head"><div><h2>Discover</h2><p>Ranked by live compatibility with your profile.</p></div>
    <div class="chips scroll">${['All','Study Buddies','Gym Partners','Gaming Squad','Explore Phoenix','Research Partners'].map(g=>`<button class="chip ${state.deckGoal===g?'on':''}" data-act="deckGoal" data-v="${g}">${g==='All'?'Everyone':g}</button>`).join('')}</div></div>
  <div class="discover">
    <div class="deck-col">
      <div class="deck" id="deck">${cards || `<div class="deck-empty"><h3>You're all caught up</h3><p class="muted">No more ${state.deckGoal==='All'?'':esc(state.deckGoal)+' '}profiles right now. Try another goal filter, or bring back the people you passed.</p><button class="btn btn-gold" data-act="resetDeck">Show passed profiles again</button></div>`}</div>
      <div class="deck-actions">
        <button class="act undo" data-act="undo" aria-label="Undo last swipe" ${state.history.length?'':'disabled style="opacity:.4"'}>${I.undo}</button>
        <button class="act pass" data-act="swipe" data-v="left" aria-label="Pass">${I.x}</button>
        <button class="act super" data-act="swipe" data-v="super" aria-label="Super like">${I.star}</button>
        <button class="act like" data-act="swipe" data-v="right" aria-label="Connect">${I.heart}</button>
      </div>
      <p class="kbd-hint">Drag the card, or use <kbd>←</kbd> pass · <kbd>→</kbd> connect · <kbd>↑</kbd> super like</p>
    </div>
    <div class="side">
      ${top?`<section class="panel glass"><div class="panel-head"><h3>Why ${esc(top.pref)} is ${compat(top)}%</h3><span class="label">Algorithm</span></div>
        <div class="algo">${Object.keys(WEIGHTS).map(k=>`<div class="algo-row"><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${lbl[k]} <span class="faint">×${Math.round(WEIGHTS[k]*100)}</span></span><span class="bar"><i style="width:${Math.round(b[k]*100)}%"></i></span><span class="v">${Math.round(b[k]*100)}</span></div>`).join('')}</div>
        <div class="why-list" style="margin-top:14px">${reasons(top).slice(0,4).map(r=>`<div>${I.check}<span>${esc(r)}</span></div>`).join('')}</div></section>`:''}
      ${picks?`<section class="panel glass"><div class="panel-head"><h3>Up next</h3><span class="label">${deck.length} in deck</span></div><div class="pick-list">${picks}</div></section>`:''}
      ${state.pending.length?`<section class="panel glass"><div class="panel-head"><h3>Requests sent</h3></div><div class="pick-list">${state.pending.map(id=>{const p=byId(id);return `<button class="pick" data-act="profile" data-id="${id}">${avatar(p,36)}<span class="t"><b>${esc(p.name)}</b><small>Waiting for them to swipe back</small></span></button>`}).join('')}</div></section>`:''}
    </div>
  </div>`;
}
let swiping=false;
function setStamps(el,dx,dy){
  el.querySelector('.stamp.like').style.opacity=Math.max(0,Math.min(1,dx/100));
  el.querySelector('.stamp.nope').style.opacity=Math.max(0,Math.min(1,-dx/100));
  el.querySelector('.stamp.sup').style.opacity=Math.abs(dx)<60?Math.max(0,Math.min(1,-dy/110)):0;
}
function bindTopCard(){
  const el=document.querySelector('.card.top'); if(!el) return;
  let sx=0,sy=0,dx=0,dy=0,drag=false,moved=false;
  el.addEventListener('pointerdown',e=>{ if(e.target.closest('button')||swiping) return; drag=true;moved=false;sx=e.clientX;sy=e.clientY;dx=dy=0;el.setPointerCapture(e.pointerId);el.style.transition='none'; });
  el.addEventListener('pointermove',e=>{ if(!drag) return; dx=e.clientX-sx; dy=e.clientY-sy; if(Math.abs(dx)+Math.abs(dy)>6) moved=true; el.style.transform=`translate(${dx}px,${dy}px) rotate(${dx/16}deg)`; setStamps(el,dx,dy); });
  const end=()=>{ if(!drag) return; drag=false;
    if(!moved){ el.style.transform=''; openProfile(el.dataset.id); return; }
    if(dx>110) fling('right'); else if(dx<-110) fling('left'); else if(dy<-120&&Math.abs(dx)<90) fling('super');
    else { el.style.transition='transform .35s cubic-bezier(.2,.9,.3,1.3)'; el.style.transform=''; setStamps(el,0,0); } };
  el.addEventListener('pointerup',end); el.addEventListener('pointercancel',end);
}
function fling(dir,id){
  const el=document.querySelector('.card.top');
  if(!el||swiping){ if(id&&!el) commitSwipe(id,dir); return; }
  swiping=true; id=el.dataset.id;
  const x=dir==='right'?innerWidth*1.2:dir==='left'?-innerWidth*1.2:0, y=dir==='super'?-innerHeight:40;
  el.style.transition='transform .38s ease-in'; el.style.transform=`translate(${x}px,${y}px) rotate(${x/40}deg)`;
  setStamps(el,dir==='right'?120:dir==='left'?-120:0,dir==='super'?-140:0);
  setTimeout(()=>{ swiping=false; commitSwipe(id,dir); },300);
}
function commitSwipe(id,dir){
  const p=byId(id); state.history.push({id,dir});
  if(dir==='left'){ state.passed.push(id); refresh(); return; }
  if(p.likesYou || dir==='super' && compat(p)>=60){ makeMatch(id,dir==='super'); }
  else { state.pending.push(id); refresh(); toast(dir==='super'?`Super like sent to ${p.pref}. They'll see you first.`:`Connection request sent to ${p.pref}`); }
}
function makeMatch(id,sup){
  if(!isMatch(id)) state.matches.push(id);
  state.pending=state.pending.filter(x=>x!==id);
  const p=byId(id);
  if(!state.chats[id]) state.chats[id]={kind:'dm',unread:0,msgs:[{sys:`You matched with ${p.pref} · just now${sup?' · super like':''}`}]};
  refresh(); showMatch(p);
}
function undo(){
  const last=state.history.pop(); if(!last) return;
  state.passed=state.passed.filter(x=>x!==last.id); state.pending=state.pending.filter(x=>x!==last.id);
  if(last.dir!=='left'&&isMatch(last.id)&&(state.chats[last.id]?.msgs.length||0)<=1){ state.matches=state.matches.filter(x=>x!==last.id); delete state.chats[last.id]; }
  refresh(); toast(`Brought back ${byId(last.id).pref}`);
}

/* ---------- match modal ---------- */
function showMatch(p){
  const w=$('#matchWrap'); const shared=inter(state.user.tags,p.tags);
  const evs=sharedEvents(p,3);
  w.innerHTML=`<canvas id="confetti"></canvas><div class="match" role="dialog" aria-modal="true" aria-label="It's a match">
    <p class="label" style="color:var(--ink)">Forks up</p>
    <h2>IT'S A<br>MATCH!</h2>
    <div class="match-pair">${avatar(state.user,112)}<span class="mid">${I.heart}</span>${avatar(p,112)}</div>
    <p style="font-size:16px;max-width:36ch">You and <b>${esc(p.pref)}</b> are a <b style="color:var(--gold)">${compat(p)}% match</b>${shared.length?` and both love ${shared.slice(0,2).map(t=>'#'+esc(t)).join(' & ')}`:''}.</p>
    <div class="match-sugg glass"><span class="label">Do something together</span>
      ${evs.map(e=>`<div class="mini-ev">${dateBlock(e)}<div class="t"><b>${esc(e.title)}</b><small>${dayLabel(e.when)} · ${timeLabel(e.when)} · ${esc(e.loc)}</small></div><button class="btn btn-gold btn-sm" data-act="matchPropose" data-id="${p.id}" data-e="${e.id}">Invite</button></div>`).join('')}
    </div>
    <div class="match-acts"><button class="btn btn-gold btn-block" data-act="openChat" data-id="${p.id}">${I.chat}Send ${esc(p.pref)} a message</button><button class="btn btn-ghost btn-block" data-act="closeMatch">Keep swiping</button></div>
  </div>`;
  w.hidden=false; confetti();
}
function confetti(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c=$('#confetti'); if(!c) return; const x=c.getContext('2d');
  c.width=innerWidth*devicePixelRatio; c.height=innerHeight*devicePixelRatio; x.scale(devicePixelRatio,devicePixelRatio);
  const cols=['#FFC627','#8C1D40','#FFFFFF','#B02A57','#FFD35A'];
  const ps=Array.from({length:140},()=>({x:innerWidth/2,y:innerHeight*.32,vx:(Math.random()-.5)*14,vy:-Math.random()*14-3,r:Math.random()*6+3,c:cols[Math.random()*5|0],a:Math.random()*6,va:(Math.random()-.5)*.3}));
  let t=0; (function f(){ x.clearRect(0,0,innerWidth,innerHeight); ps.forEach(p=>{p.vy+=.35;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;x.save();x.translate(p.x,p.y);x.rotate(p.a);x.fillStyle=p.c;x.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);x.restore();}); if(++t<150&&$('#confetti')) requestAnimationFrame(f); else x.clearRect(0,0,innerWidth,innerHeight); })();
}
function closeMatch(){ const w=$('#matchWrap'); w.hidden=true; w.innerHTML=''; }

/* ---------- profile sheet ---------- */
function openSheet(html,cls=''){ const w=$('#sheetWrap'); w.innerHTML=`<div class="sheet ${cls}" role="dialog" aria-modal="true">${html}</div>`; w.hidden=false; const f=w.querySelector('input,select,textarea'); if(f&&!f.dataset.nofocus) setTimeout(()=>f.focus(),50); }
function closeSheet(){ const w=$('#sheetWrap'); w.hidden=true; w.innerHTML=''; }
function openProfile(id){
  const p=byId(id); if(!p) return;
  const u=state.user, sharedT=new Set(inter(u.tags,p.tags).map(norm)), sharedH=new Set(inter(u.hangouts,p.hangouts)), sharedG=new Set(inter(u.goals,p.goals));
  const evs=going(id).map(evById).filter(e=>new Date(e.when)>=NOW);
  const inDeck=deckList().some(x=>x.id===id), pend=state.pending.includes(id);
  const acts = isMatch(id) ? `<button class="btn btn-gold" data-act="openChat" data-id="${id}">${I.chat}Message ${esc(p.pref)}</button><button class="btn btn-ghost" data-act="proposeFor" data-id="${id}">${I.cal}Propose hangout</button>`
    : pend ? `<button class="btn btn-ghost" disabled>Request sent</button>`
    : inDeck ? `<button class="btn btn-ghost" data-act="sheetSwipe" data-id="${id}" data-v="left">${I.x}Pass</button><button class="btn btn-ghost" data-act="sheetSwipe" data-id="${id}" data-v="super" style="color:var(--blue)">${I.star}Super</button><button class="btn btn-gold" data-act="sheetSwipe" data-id="${id}" data-v="right">${I.heart}Connect</button>`
    : `<button class="btn btn-gold" data-act="connect" data-id="${id}">${I.heart}Connect</button>`;
  openSheet(`<div class="pf-hero">${photo(p)}<div class="card-shade"></div><div class="card-top"><span class="loc">${I.pin}${esc(p.campus)}</span></div><button class="icon-btn pf-close" data-act="closeSheet" aria-label="Close" style="background:rgba(0,0,0,.45)">${I.x}</button></div>
    <div class="pf-name"><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><h3>${esc(p.name)}</h3><span class="score">${I.spark}${compat(p)}% match</span></div>
    <p class="muted" style="font-weight:700">${p.pron?esc(p.pron)+' · ':''}${esc(p.major)} · Class of ${p.year} · ${esc(majorOf(p.major).c)}</p></div>
    <div class="pf-sec"><span class="label">Why you match</span><div class="why-list">${(reasons(p).length?reasons(p):['Different circles: a good way to branch out']).map(r=>`<div>${I.check}<span>${esc(r)}</span></div>`).join('')}</div></div>
    <div class="pf-sec"><span class="label">Bio</span><p>${esc(p.bio)}</p></div>
    <div class="pf-sec"><span class="label">Tags · <span style="color:var(--gold)">gold = shared</span></span><div class="chips" style="gap:6px">${p.tags.map(t=>`<span class="tag ${sharedT.has(norm(t))?'shared':''}">#${esc(t)}</span>`).join('')}</div></div>
    <div class="pf-sec"><span class="label">Looking for</span><div class="chips" style="gap:6px">${p.goals.map(g=>`<span class="tag ${sharedG.has(g)?'shared':''}">${esc(g)}</span>`).join('')}</div></div>
    <div class="pf-sec"><span class="label">Hangout spots</span><div class="chips" style="gap:6px">${p.hangouts.map(h=>`<span class="tag ${sharedH.has(h)?'shared':''}">${esc(h)}</span>`).join('')}</div></div>
    ${evs.length?`<div class="pf-sec"><span class="label">Going to</span>${evs.map(e=>`<div class="mini-ev">${dateBlock(e)}<div class="t"><b>${esc(e.title)}</b><small>${dayLabel(e.when)} · ${timeLabel(e.when)}${e.att.includes('me')?' · <span style="color:var(--good)">you\'re going too</span>':''}</small></div></div>`).join('')}</div>`:''}
    <div class="sheet-actions">${acts}</div>`,'wide');
}

/* ---------- events ---------- */
function evCard(e){
  const rel=eventRelevance(e);
  const people=e.att.filter(x=>x!=='me').map(byId).filter(Boolean).sort((a,b)=>(isMatch(b.id)-isMatch(a.id))||compat(b)-compat(a));
  const matched=people.filter(p=>isMatch(p.id));
  const going=e.att.includes('me');
  const full=e.hang&&e.cap&&e.att.length>=e.cap&&!going;
  const host=e.hang?(e.host==='me'?state.user:byId(e.host)):null;
  return `<article class="ev glass">${dateBlock(e)}<div class="ev-main">
    <div class="ev-title"><h4 data-act="eventDetail" data-id="${e.id}">${esc(e.title)}</h4><span class="score ${rel>=75?'':'dim'}" title="AI relevance score">${rel}%</span></div>
    <div class="ev-meta"><span class="cat ${e.hang?'Hangout':catClass(e.cat)}">${e.hang?'Hangout':esc(e.cat)}</span><span>${I.clock}${dayLabel(e.when)} · ${timeLabel(e.when)}</span><span>${I.pin}${esc(e.loc)}</span></div>
    ${host?`<div class="ev-meta"><span>Hosted by ${e.host==='me'?'you':esc(host.pref)}</span><span class="tnum">${e.att.length}/${e.cap} spots</span></div>`:''}
    <div class="ev-foot"><div class="who">${people.length?`<span class="av-stack">${people.slice(0,4).map(p=>avatar(p,28,isMatch(p.id)?'ring':'')).join('')}${people.length>4?`<span class="av av-more" style="--s:28px">+${people.length-4}</span>`:''}</span><span>${matched.length?`${matched.map(p=>esc(p.pref)).slice(0,2).join(', ')}${matched.length>2?` +${matched.length-2}`:''} going`:`${people.length} going`}</span>`:'<span>Be the first to go</span>'}</div>
    <button class="btn btn-sm ${going?'on':'btn-ghost'}" data-act="rsvp" data-id="${e.id}" ${full?'disabled':''}>${going?I.check+(e.hang?'Joined':'Going'):full?'Full':(e.hang?'Join':'RSVP')}</button></div>
  </div></article>`;
}
function vEvents(){
  const upcoming=allEvents().filter(e=>new Date(e.when)>=new Date(NOW.getTime()-3*36e5));
  let list;
  const c=state.evCat;
  if(c==='For You') list=[...upcoming].sort((a,b)=>eventRelevance(b)-eventRelevance(a)).slice(0,8);
  else if(c==='Hangouts') list=upcoming.filter(e=>e.hang);
  else if(c==='Going') list=upcoming.filter(e=>e.att.includes('me'));
  else list=upcoming.filter(e=>e.cat===c&&!e.hang);
  if(c!=='For You') list.sort((a,b)=>new Date(a.when)-new Date(b.when));
  return `<div class="view-head"><div><h2>Events</h2><p><span class="sync"><i></i>Synced with Sun Devil Central</span> <span class="demo-flag">Sample data</span></p></div>
    <button class="btn btn-gold" data-act="newHangout">${I.plus}Start a hangout</button></div>
  <div class="toolbar"><div class="chips scroll">${['For You','Going','Hangouts',...CATS].map(k=>`<button class="chip ${c===k?'on':''}" data-act="evCat" data-v="${k}">${k}${k==='Going'?` <span class="tnum">${myEvents().length}</span>`:''}</button>`).join('')}</div></div>
  ${c==='For You'?'<p class="muted" style="margin:-6px 0 12px;font-size:13.5px">Ranked by fit with your tags and goals, your campus, and how many high-match students are going. Gold ring = someone you matched with.</p>':''}
  <div class="ev-grid">${list.map(evCard).join('') || `<div class="empty glass">Nothing here yet.<button class="btn btn-gold btn-sm" data-act="newHangout">${I.plus}Start a hangout</button></div>`}</div>`;
}
function eventDetail(id){
  const e=evById(id); const people=e.att.filter(x=>x!=='me').map(byId).filter(Boolean).sort((a,b)=>compat(b)-compat(a));
  openSheet(`<div class="sheet-head"><h3>${esc(e.title)}</h3><button class="icon-btn" data-act="closeSheet" aria-label="Close">${I.x}</button></div>
  <div class="mini-ev">${dateBlock(e)}<div class="t"><b>${dayLabel(e.when)} · ${timeLabel(e.when)}</b><small>${esc(e.loc)} · ${esc(e.campus)}</small></div><span class="score">${eventRelevance(e)}%</span></div>
  <p style="margin-top:14px">${esc(e.desc)}</p>
  <div class="chips" style="gap:6px;margin-top:12px">${e.tags.map(t=>`<span class="tag ${state.user.tags.includes(t)?'shared':''}">#${esc(t)}</span>`).join('')}</div>
  <div class="pf-sec"><span class="label">Students going (${people.length+(e.att.includes('me')?1:0)})</span>
    ${people.map(p=>`<button class="pick" data-act="profile" data-id="${p.id}">${avatar(p,38,isMatch(p.id)?'ring':'')}<span class="t"><b>${esc(p.name)}${isMatch(p.id)?' <span class="tag shared" style="margin-left:4px">Matched</span>':''}</b><small>${esc(p.major)} · ${esc(whyLine(p))}</small></span><span class="score dim">${compat(p)}%</span></button>`).join('')||'<p class="muted">No one yet.</p>'}</div>
  <div class="sheet-actions"><button class="btn ${e.att.includes('me')?'on':'btn-gold'}" data-act="rsvp" data-id="${e.id}" data-sheet="1">${e.att.includes('me')?I.check+'Going':'RSVP'}</button></div>`);
}
function newHangout(){
  const d=new Date(NOW); const days=[...Array(7)].map((_,i)=>{const x=new Date(d);x.setDate(d.getDate()+i);return x;});
  openSheet(`<div class="sheet-head"><h3>Start a hangout</h3><button class="icon-btn" data-act="closeSheet" aria-label="Close">${I.x}</button></div>
  <form class="stack" data-form="hangout">
    <div class="field"><label for="hgTitle">What are you doing?</label><input class="input" id="hgTitle" required placeholder="3v3 basketball, study session, boba run…" value="Late night CSE study session"></div>
    <div class="row2"><div class="field"><label for="hgSpot">Where</label><select class="input" id="hgSpot">${SPOTS.map(s=>`<option ${s==='Noble Library'?'selected':''}>${esc(s)}</option>`).join('')}</select></div>
    <div class="field"><label for="hgCat">Category</label><select class="input" id="hgCat">${CATS.map(c=>`<option ${c==='Campus Life'?'selected':''}>${c}</option>`).join('')}</select></div></div>
    <div class="row2"><div class="field"><label for="hgDay">Day</label><select class="input" id="hgDay">${days.map((x,i)=>`<option value="${ymd(x)}" ${i===1?'selected':''}>${dayLabel(x)}</option>`).join('')}</select></div>
    <div class="field"><label for="hgTime">Time</label><input class="input" id="hgTime" type="time" value="21:00"></div></div>
    <div class="row2"><div class="field"><label for="hgCap">Max people</label><input class="input" id="hgCap" type="number" min="2" max="50" value="6"></div>
    <div class="field"><label for="hgTags">Tags (comma separated)</label><input class="input" id="hgTags" value="LateNightStudy, Coding"></div></div>
    <div class="field"><label for="hgDesc">Details</label><textarea class="input" id="hgDesc" style="min-height:70px">Bring your laptop. Snacks on me.</textarea></div>
    <button class="btn btn-gold btn-block">${I.plus}Post hangout</button>
  </form>`);
}

/* ---------- squads ---------- */
function squadRel(s){ return Math.max(30,Math.min(99,Math.round(38+60*(.7*cos(state.user.tags,s.tags)+.15*(s.campus===state.user.campus)+.15*(s.members.filter(isMatch).length?1:0))))); }
function squadMsgs(s){ return s.chat; }
function sqCard(s){
  const mine=state.mySquads.has(s.id); const last=s.chat[s.chat.length-1]; const lp=last.from==='me'?state.user:byId(last.from);
  const next=s.events.map(evById).filter(e=>e&&new Date(e.when)>=NOW).sort((a,b)=>new Date(a.when)-new Date(b.when))[0];
  const mem=s.members.filter(m=>m!=='me').map(byId);
  return `<article class="sq glass">
    <div class="sq-head"><span class="sq-icon" style="background:${grad(s.hue)}">${esc(initials(s.name.replace(/^ASU |'/g,'')))}</span><div style="flex:1;min-width:0"><h4>${esc(s.name)}</h4><small>${s.members.length} members · ${esc(s.campus)}</small></div><span class="score ${squadRel(s)>=70?'':'dim'}">${squadRel(s)}%</span></div>
    <p class="sq-desc">${esc(s.desc)}</p>
    <div class="chips" style="gap:5px">${s.tags.map(t=>`<span class="tag ${state.user.tags.includes(t)?'shared':''}">#${esc(t)}</span>`).join('')}</div>
    <div class="sq-msg">${avatar(lp,22)}<p><b>${last.from==='me'?'You':esc(lp.pref)}:</b> ${esc(last.text)}</p></div>
    ${next?`<div class="sq-next">${I.cal}Next: ${esc(next.title)} · ${dayLabel(next.when)} ${timeLabel(next.when)}</div>`:''}
    <div class="sq-foot"><span class="av-stack">${mem.slice(0,4).map(p=>avatar(p,26,isMatch(p.id)?'ring':'')).join('')}</span>
    <div style="display:flex;gap:8px">${mine?`<button class="btn btn-ghost btn-sm" data-act="squadDetail" data-id="${s.id}">Details</button><button class="btn btn-gold btn-sm" data-act="openChat" data-id="${s.id}">${I.chat}Chat</button>`:`<button class="btn btn-ghost btn-sm" data-act="squadDetail" data-id="${s.id}">Preview</button><button class="btn btn-gold btn-sm" data-act="joinSquad" data-id="${s.id}">${I.plus}Join</button>`}</div></div>
  </article>`;
}
function vSquads(){
  const q=norm(state.squadQ);
  const filt=s=>!q||norm(s.name+s.desc+s.tags.join('')).includes(q);
  const mine=state.squads.filter(s=>state.mySquads.has(s.id)&&filt(s));
  const other=state.squads.filter(s=>!state.mySquads.has(s.id)&&filt(s)).sort((a,b)=>squadRel(b)-squadRel(a));
  return `<div class="view-head"><div><h2>Campus Squads</h2><p>Friend groups built around a shared thing. Join a few, start your own.</p></div>
    <button class="btn btn-gold" data-act="newSquad">${I.plus}Create a squad</button></div>
  <div class="search" style="margin-bottom:6px;max-width:420px">${I.search}<input class="input" id="squadQ" placeholder="Search squads or tags" value="${esc(state.squadQ)}"></div>
  <div class="section-t"><h3>Your squads</h3><span class="label">${mine.length}</span></div>
  <div class="sq-grid">${mine.map(sqCard).join('')||'<div class="empty glass">You haven\'t joined a squad yet.</div>'}</div>
  <div class="section-t"><h3>Recommended for you</h3><span class="label">Sorted by fit</span></div>
  <div class="sq-grid">${other.map(sqCard).join('')||'<div class="empty glass">No squads match that search.</div>'}</div>`;
}
function squadDetail(id){
  const s=state.squads.find(x=>x.id===id); const mine=state.mySquads.has(id);
  const evs=s.events.map(evById).filter(Boolean);
  openSheet(`<div class="sheet-head"><div style="display:flex;gap:12px;align-items:center"><span class="sq-icon" style="background:${grad(s.hue)}">${esc(initials(s.name.replace(/^ASU |'/g,'')))}</span><h3>${esc(s.name)}</h3></div><button class="icon-btn" data-act="closeSheet" aria-label="Close">${I.x}</button></div>
  <p>${esc(s.desc)}</p>
  <div class="pf-sec"><span class="label">Squad events</span>${evs.map(e=>`<div class="mini-ev">${dateBlock(e)}<div class="t"><b>${esc(e.title)}</b><small>${dayLabel(e.when)} · ${timeLabel(e.when)} · ${esc(e.loc)}</small></div><button class="btn btn-sm ${e.att.includes('me')?'on':'btn-ghost'}" data-act="rsvp" data-id="${e.id}" data-sq="${id}">${e.att.includes('me')?'Going':'RSVP'}</button></div>`).join('')||'<p class="muted">No events yet.</p>'}</div>
  <div class="pf-sec"><span class="label">Recent chat</span>${s.chat.slice(-3).map(m=>{const p=m.from==='me'?state.user:byId(m.from);return `<div class="sq-msg">${avatar(p,22)}<p><b>${m.from==='me'?'You':esc(p.pref)}:</b> ${esc(m.text)}</p></div>`}).join('')}</div>
  <div class="pf-sec"><span class="label">Members (${s.members.length})</span>${s.members.map(m=>m==='me'?`<div class="pick">${avatar(state.user,36)}<span class="t"><b>You</b></span></div>`:(p=>`<button class="pick" data-act="profile" data-id="${p.id}">${avatar(p,36,isMatch(p.id)?'ring':'')}<span class="t"><b>${esc(p.name)}</b><small>${esc(p.major)}</small></span><span class="score dim">${compat(p)}%</span></button>`)(byId(m))).join('')}</div>
  <div class="sheet-actions">${mine?`<button class="btn btn-ghost" data-act="leaveSquad" data-id="${id}">Leave squad</button><button class="btn btn-gold" data-act="openChat" data-id="${id}">${I.chat}Open group chat</button>`:`<button class="btn btn-gold" data-act="joinSquad" data-id="${id}">${I.plus}Join squad</button>`}</div>`,'wide');
}
function newSquad(){
  openSheet(`<div class="sheet-head"><h3>Create a squad</h3><button class="icon-btn" data-act="closeSheet" aria-label="Close">${I.x}</button></div>
  <form class="stack" data-form="squad">
    <div class="field"><label for="sqName">Squad name</label><input class="input" id="sqName" required value="Tooker Sign Language Circle"></div>
    <div class="field"><label for="sqDesc">What's it about?</label><textarea class="input" id="sqDesc" style="min-height:70px">Learning ASL together and building CV tools that recognize it. Weekly practice in the Tooker lounge.</textarea></div>
    <div class="row2"><div class="field"><label for="sqCampus">Campus</label><select class="input" id="sqCampus">${CAMPUSES.map(c=>`<option ${c===state.user.campus?'selected':''}>${c}</option>`).join('')}</select></div>
    <div class="field"><label for="sqTags">Tags (comma separated)</label><input class="input" id="sqTags" value="Accessibility, ComputerVision, AI"></div></div>
    <div class="field"><span class="label">Invite matches</span><div class="chips">${state.matches.map(id=>{const p=byId(id);return `<label class="chip" style="cursor:pointer"><input type="checkbox" name="inv" value="${id}" checked style="accent-color:var(--gold)">${esc(p.pref)}</label>`}).join('')||'<span class="hint">Match with people to invite them.</span>'}</div></div>
    <button class="btn btn-gold btn-block">${I.plus}Create squad</button>
  </form>`);
}

/* ---------- directory ---------- */
function vDirectory(){
  const f=state.dir, q=norm(f.q);
  const list=PROFILES.filter(p=>(!q||norm(p.name+p.pref+p.major+p.tags.join('')).includes(q))&&(!f.major||p.major===f.major)&&(!f.campus||p.campus===f.campus)&&(!f.year||p.year==f.year)&&f.tags.every(t=>p.tags.map(norm).includes(norm(t))))
    .sort((a,b)=>compat(b)-compat(a));
  const quick=['Coding','Gym','Valorant','Hackathons','Boba','Hiking','Robotics','Photography','AI','Bouldering'];
  return `<div class="view-head"><div><h2>Directory</h2><p>Every Sun Devil on FriendZone, sorted by match.</p></div><span class="label tnum">${list.length} of ${PROFILES.length}</span></div>
  <div class="filters glass">
    <div class="search">${I.search}<input class="input" id="dirQ" placeholder="Search name, major or tag" value="${esc(f.q)}"></div>
    <select class="input" id="dirMajor" aria-label="Major"><option value="">All majors</option>${MAJORS.map(m=>`<option ${f.major===m.n?'selected':''}>${esc(m.n)}</option>`).join('')}</select>
    <select class="input" id="dirCampus" aria-label="Campus"><option value="">All campuses</option>${CAMPUSES.map(c=>`<option ${f.campus===c?'selected':''}>${c}</option>`).join('')}</select>
    <select class="input" id="dirYear" aria-label="Graduation year"><option value="">Any year</option>${[2028,2029,2030].map(y=>`<option ${f.year==y?'selected':''}>${y}</option>`).join('')}</select>
  </div>
  <div class="chips scroll" style="margin-bottom:16px">${quick.map(t=>`<button class="chip ${f.tags.includes(t)?'on':''}" data-act="dirTag" data-v="${t}">#${t}</button>`).join('')}${(f.q||f.major||f.campus||f.year||f.tags.length)?`<button class="chip" data-act="dirClear" style="color:var(--bad)">Clear filters</button>`:''}</div>
  <div class="dir-list">${list.map(p=>{
    const sh=new Set(inter(state.user.tags,p.tags).map(norm));
    const btn=isMatch(p.id)?`<button class="btn btn-gold btn-sm" data-act="openChat" data-id="${p.id}">${I.chat}Message</button>`:state.pending.includes(p.id)?`<button class="btn btn-ghost btn-sm" disabled>Request sent</button>`:`<button class="btn btn-ghost btn-sm" data-act="connect" data-id="${p.id}">${I.heart}Connect</button>`;
    return `<article class="person glass">${avatar(p,56,isMatch(p.id)?'ring':'')}<div class="t">
      <div class="nm"><h4 data-act="profile" data-id="${p.id}">${esc(p.name)} <span class="faint" style="font-family:var(--body);font-size:12.5px">${esc(p.pron)}</span></h4><span class="score ${compat(p)>=75?'':'dim'}">${compat(p)}%</span></div>
      <div class="mj">${esc(p.major)} · ${p.year} · ${esc(p.campus)}</div>
      <div class="tags">${p.tags.slice(0,5).map(t=>`<span class="tag ${sh.has(norm(t))?'shared':''}">#${esc(t)}</span>`).join('')}</div>
      <div class="acts">${btn}<button class="btn btn-ghost btn-sm" data-act="profile" data-id="${p.id}">View profile</button></div></div></article>`;
  }).join('')||`<div class="empty glass"><b>No one matches those filters</b><button class="btn btn-ghost btn-sm" data-act="dirClear">Clear filters</button></div>`}</div>`;
}

/* ---------- chats ---------- */
function convoMeta(id){
  const c=state.chats[id]; const sq=state.squads.find(s=>s.id===id);
  if(sq) return {id,name:sq.name,av:`<span class="av" style="--s:44px;background:${grad(sq.hue)};border-radius:14px">${esc(initials(sq.name.replace(/^ASU |'/g,'')))}</span>`,msgs:sq.chat,sub:`${sq.members.length} members`,sq};
  const p=byId(id); return {id,name:p.name,av:avatar(p,44),msgs:c.msgs,sub:`${compat(p)}% match · ${p.major}`,p};
}
function lastText(m){ const l=[...m].reverse().find(x=>!x.sys); if(!l) return 'Say hi'; if(l.prop) return (l.from==='me'?'You':'')+' proposed: '+l.prop.title; return (l.from==='me'?'You: ':'')+l.text; }
function vChats(){
  const ids=[...state.matches.filter(id=>state.chats[id]),...[...state.mySquads]];
  ids.forEach(id=>{ if(!state.chats[id]) state.chats[id]={kind:state.squads.some(s=>s.id===id)?'squad':'dm',unread:0,msgs:[]}; });
  const dms=ids.filter(id=>id.startsWith('p')), sqs=ids.filter(id=>id.startsWith('s'));
  const act=state.activeChat && ids.includes(state.activeChat) ? state.activeChat : null;
  const row=id=>{const m=convoMeta(id);const c=state.chats[id];return `<button class="convo ${act===id?'on':''} ${c.unread?'unread':''}" data-act="openChat" data-id="${id}">${m.av}<span class="t"><b><span>${esc(m.name)}</span>${c.unread?`<span class="badge-n">${c.unread}</span>`:''}</b><small>${esc(lastText(m.msgs))}</small></span></button>`;};
  return `<div class="view-head"><div><h2>Chats</h2><p>Matches and squads. Turn any conversation into a plan.</p></div></div>
  <div class="chat-shell glass ${act?'has-thread':''}">
    <div class="chat-list"><div class="grp label">Matches · ${dms.length}</div>${dms.map(row).join('')||'<p class="muted" style="padding:0 14px">Match with someone to start chatting.</p>'}
    <div class="grp label">Squads · ${sqs.length}</div>${sqs.map(row).join('')||'<p class="muted" style="padding:0 14px">Join a squad to see its chat.</p>'}</div>
    <div class="thread">${act?threadHTML(act):`<div class="chat-empty">${I.chat.replace('<svg','<svg style="width:40px;height:40px;color:var(--faint)"')}<b style="color:var(--ink)">Pick a conversation</b><span>Every chat has a Propose Campus Hangout button.</span></div>`}</div>
  </div>`;
}
function msgHTML(m,meta){
  if(m.sys) return `<div class="sysnote">${esc(m.sys)}</div>`;
  const me=m.from==='me'; const p=me?state.user:byId(m.from);
  let inner;
  if(m.prop){
    const pr=m.prop; const ok=pr.status==='accepted';
    inner=`<div class="prop"><span class="k">${I.cal.replace('<svg','<svg style="width:12px;height:12px;vertical-align:-1px"')} Campus hangout proposal</span><b>${esc(pr.title)}</b><span class="w">${esc(pr.where)} · ${esc(pr.whenLabel)}</span>
      <span class="st ${ok?'ok':''}">${ok?I.check+esc(pr.acceptedBy)+' accepted · added to Events':'Waiting for a reply…'}</span></div>`;
  } else inner=esc(m.text);
  return `<div class="msg ${me?'me':''}">${me?'':avatar(p,26)}<div class="bubble">${meta.sq&&!me?`<span class="from">${esc(p.pref)}</span>`:''}${inner}</div></div>`;
}
function threadHTML(id){
  const m=convoMeta(id);
  return `<div class="th-head"><button class="icon-btn back" data-act="chatBack" aria-label="Back to chats">${I.back}</button>${m.av.replace('--s:44px','--s:40px')}
    <span class="t"><b>${esc(m.name)}</b><small>${esc(m.sub)}</small></span>
    ${m.p?`<button class="btn btn-ghost btn-sm" data-act="profile" data-id="${m.p.id}">Profile</button>`:`<button class="btn btn-ghost btn-sm" data-act="squadDetail" data-id="${id}">Squad</button>`}</div>
  <div class="msgs">${m.msgs.map(x=>msgHTML(x,m)).join('')}${state.typing===id?`<div class="typing">${m.p?esc(m.p.pref):'Someone'} is typing…</div>`:''}</div>
  <form class="composer" data-form="send" data-id="${id}">
    <button type="button" class="btn btn-gold btn-sm" data-act="proposeFor" data-id="${id}">${I.cal}Propose Campus Hangout</button>
    <input class="input" id="msgIn" autocomplete="off" placeholder="Message ${esc(m.p?m.p.pref:m.name)}">
    <button class="icon-btn" style="background:var(--maroon);border-color:var(--maroon2)" aria-label="Send">${I.send}</button>
  </form>`;
}
function openChat(id){
  closeMatch(); closeSheet();
  if(!state.chats[id]) state.chats[id]={kind:id.startsWith('s')?'squad':'dm',unread:0,msgs:[]};
  state.chats[id].unread=0; state.activeChat=id; state.tab='chats'; refresh();
  setTimeout(()=>{const i=$('#msgIn'); if(i&&innerWidth>=900) i.focus();},30);
}
function pushMsg(id,msg){
  const sq=state.squads.find(s=>s.id===id);
  (sq?sq.chat:state.chats[id].msgs).push(msg);
}
const REPLIES={
  generic:['Ha, fair','That sounds fun, I\'m in','Wait, same','Lol yes','Okay you have good taste','Let\'s do it this week','Tell me more','Omw after class'],
  q:['Hmm, probably yes!','Good question, I think so','Honestly no idea, let\'s find out','Yes, 100%']
};
function autoReply(id,trigger){
  const sq=state.squads.find(s=>s.id===id);
  const pool=sq?sq.members.filter(m=>m!=='me'):[id];
  const who=pool[Math.random()*pool.length|0]; const p=byId(who);
  state.typing=id; if(state.tab==='chats'&&state.activeChat===id) refresh();
  setTimeout(()=>{
    state.typing=null;
    let text;
    if(trigger&&trigger.prop){
      const pr=trigger.prop; pr.status='accepted'; pr.acceptedBy=p.pref;
      text=pr.eventId?`Yes! I'll RSVP too. See you at ${pr.where}.`:`Down. ${pr.whenLabel} at ${pr.where} works for me.`;
      if(pr.eventId){ const e=evById(pr.eventId); if(e){ if(!e.att.includes('me')) e.att.push('me'); if(!e.att.includes(who)) e.att.push(who);} }
      else addCustomHangout(pr,who);
    } else {
      const s=trigger&&trigger.text||''; const shared=inter(state.user.tags,p.tags);
      text=/\?\s*$/.test(s)?REPLIES.q[Math.random()*4|0]:(Math.random()<.35&&shared.length?`Also, how deep are you into #${shared[Math.random()*shared.length|0]}?`:REPLIES.generic[Math.random()*REPLIES.generic.length|0]);
    }
    pushMsg(id,{from:who,text});
    if(!(state.tab==='chats'&&state.activeChat===id)){ state.chats[id].unread=(state.chats[id].unread||0)+1; toast(`${p.pref}: ${text}`); }
    refresh();
  },1400+Math.random()*900);
}
function addCustomHangout(pr,who){
  const id='h'+Date.now();
  state.hangouts.push({id,title:pr.title,cat:'Social',when:pr.when,loc:pr.where,campus:state.user.campus,tags:inter(state.user.tags,(byId(who)||{tags:[]}).tags).slice(0,3),att:['me',who],desc:'Planned in chat.',host:'me',cap:6,hang:1});
}

/* ---------- propose hangout ---------- */
function proposeFor(id,preselect){
  const meta=convoMeta(id);
  const pseudo = meta.p || {tags:meta.sq.tags,campus:meta.sq.campus,id:'_'};
  const evs = meta.p ? sharedEvents(meta.p,5) : allEvents().filter(e=>new Date(e.when)>=NOW).map(e=>({e,s:cos(meta.sq.tags,e.tags)+(meta.sq.events.includes(e.id)?1:0)})).sort((a,b)=>b.s-a.s).slice(0,5).map(x=>x.e);
  const d=new Date(NOW); const days=[...Array(7)].map((_,i)=>{const x=new Date(d);x.setDate(d.getDate()+i);return x;});
  const both=meta.p?inter(state.user.hangouts,meta.p.hangouts):[];
  const spots=[...both,...SPOTS.filter(s=>!both.includes(s))];
  state.propTab='events';
  openSheet(`<div class="sheet-head"><h3>Propose a campus hangout</h3><button class="icon-btn" data-act="closeSheet" aria-label="Close">${I.x}</button></div>
  <p class="muted" style="margin:-8px 0 14px">To ${esc(meta.p?meta.p.pref:meta.name)}. Events ranked by what you both like.</p>
  <div class="seg"><button class="on" data-act="propTab" data-v="events">Sun Devil Central</button><button data-act="propTab" data-v="custom">Custom spot</button></div>
  <div id="propEvents" class="stack" style="gap:8px">${evs.map(e=>`<div class="mini-ev">${dateBlock(e)}<div class="t"><b>${esc(e.title)}</b><small>${dayLabel(e.when)} · ${timeLabel(e.when)} · ${esc(e.loc)}</small></div><button class="btn btn-sm ${preselect===e.id?'btn-gold':'btn-ghost'}" data-act="sendProp" data-id="${id}" data-e="${e.id}">Propose</button></div>`).join('')}</div>
  <form id="propCustom" class="stack" data-form="propCustom" data-id="${id}" hidden>
    <div class="field"><label for="pcWhat">Activity</label><input class="input" id="pcWhat" data-nofocus="1" value="${meta.p&&inter(state.user.tags,meta.p.tags).includes('Boba')?'Boba run':'Study session'}"></div>
    <div class="field"><label for="pcSpot">Spot ${both.length?'<span class="faint" style="text-transform:none;letter-spacing:0">· shared favorites first</span>':''}</label><select class="input" id="pcSpot">${spots.map(s=>`<option>${esc(s)}${both.includes(s)?' ★':''}</option>`).join('')}</select></div>
    <div class="row2"><div class="field"><label for="pcDay">Day</label><select class="input" id="pcDay">${days.map((x,i)=>`<option value="${ymd(x)}" ${i===1?'selected':''}>${dayLabel(x)}</option>`).join('')}</select></div>
    <div class="field"><label for="pcTime">Time</label><input class="input" id="pcTime" type="time" value="16:30"></div></div>
    <button class="btn btn-gold btn-block">${I.send}Send proposal</button>
  </form>`);
}
function sendProposal(chatId,prop){
  closeSheet(); if(state.activeChat!==chatId||state.tab!=='chats') openChat(chatId);
  const msg={from:'me',prop:{...prop,status:'pending'}};
  pushMsg(chatId,msg); refresh(); autoReply(chatId,msg);
}

/* ---------- profile tab ---------- */
function vMe(){
  const u=state.user;
  return `<div class="view-head"><div><h2>Your profile</h2><p>This is what other Sun Devils see.</p></div>
    <div style="display:flex;gap:8px"><button class="btn btn-ghost" data-act="editProfile">Edit profile</button><button class="btn btn-ghost" data-act="signOut">Sign out</button></div></div>
  <div class="me-grid">
    <div class="me-card glass"><div class="me-photo">${photo(u)}<div class="card-shade"></div><div class="card-top"><span class="loc">${I.pin}${esc(u.campus)}</span><span class="verified" style="background:rgba(0,0,0,.5)">${I.shield}Verified</span></div>
      <div class="card-body"><div class="card-name"><h3>${esc(u.pref)}</h3><span>${esc(u.pron)}</span></div><div class="card-meta">${esc(u.major)} · Class of ${u.year}</div></div></div>
      <div class="stats"><div><b>${state.matches.length}</b><span>Matches</span></div><div><b>${myEvents().length}</b><span>RSVPs</span></div><div><b>${state.mySquads.size}</b><span>Squads</span></div></div></div>
    <div class="stack">
      <section class="panel glass"><div class="kv"><div><span class="label">Full name</span><span class="v">${esc(u.name)}</span></div><div><span class="label">College</span><span class="v">${esc(majorOf(u.major).c)}</span></div><div><span class="label">Signed in with</span><span class="v">${state.provider==='google'?'Google':'ASU ASURITE'}</span></div><div><span class="label">Primary campus</span><span class="v">${esc(u.campus)}</span></div></div></section>
      <section class="panel glass stack"><span class="label">Bio</span><p>${esc(u.bio)}</p></section>
      <section class="panel glass stack"><span class="label">Tags</span><div class="chips" style="gap:6px">${u.tags.map(t=>`<span class="tag shared">#${esc(t)}</span>`).join('')}</div>
        <span class="label">Friendship goals</span><div class="chips" style="gap:6px">${u.goals.map(g=>`<span class="tag">${esc(g)}</span>`).join('')}</div>
        <span class="label">Hangout spots</span><div class="chips" style="gap:6px">${u.hangouts.map(h=>`<span class="tag">${esc(h)}</span>`).join('')}</div></section>
      <section class="panel glass stack"><span class="label">Your plans</span>${allEvents().filter(e=>e.att.includes('me')).sort((a,b)=>new Date(a.when)-new Date(b.when)).map(e=>`<div class="mini-ev">${dateBlock(e)}<div class="t"><b>${esc(e.title)}</b><small>${dayLabel(e.when)} · ${timeLabel(e.when)} · ${esc(e.loc)}</small></div></div>`).join('')||'<p class="muted">No RSVPs yet.</p>'}</section>
    </div>
  </div>`;
}

/* =========================================================
   Events wiring
========================================================= */
const A={
  sso(d){
    state.provider=d.p;
    const w=document.createElement('div'); w.className='overlay-load';
    w.innerHTML=`<div class="load-box glass"><div class="spinner"></div><b>${d.p==='asu'?'Redirecting to ASU Single Sign-On…':'Connecting to Google…'}</b><span class="muted" id="ssoStep">${d.p==='asu'?'weblogin.asu.edu':'accounts.google.com'}</span></div>`;
    document.body.appendChild(w);
    setTimeout(()=>{ const s=$('#ssoStep'); if(s) s.textContent=d.p==='asu'?'Duo push approved':'asu.edu address confirmed'; },700);
    setTimeout(()=>{ w.remove(); startOnboard(false); },1400);
  },
  obCampus(d){ state.ob.d.campus=d.v; render(); },
  obToggle(d){ const a=state.ob.d[d.k]; const i=a.indexOf(d.v); i>=0?a.splice(i,1):a.push(d.v); const y=scrollY; render(); scrollTo(0,y); },
  obBack(){ if(state.ob.step===0){ if(state.ob.edit){state.ob=null;state.screen='app';render();} else {state.screen='auth';render();} } else { state.ob.step--; render(); scrollTo(0,0);} },
  obNext(){ const d=state.ob.d;
    if(state.ob.step===0&&!d.name.trim()){ toast('Add your full name to continue'); return; }
    if(state.ob.step===2){ if(d.tags.length<3){toast('Pick at least 3 tags so we can match you');return;} if(!d.goals.length){toast('Pick at least one friendship goal');return;} finishOnboard(); return; }
    if(state.ob.step===1&&!d.hangouts.length){ toast('Pick at least one hangout spot'); return; }
    state.ob.step++; render(); scrollTo(0,0); },
  tab(d){ state.tab=d.v; if(d.v!=='chats') state.activeChat=state.activeChat; closeSheet(); refresh(); scrollTo(0,0); },
  deckGoal(d){ state.deckGoal=d.v; refresh(); },
  swipe(d){ fling(d.v); },
  undo(){ undo(); },
  resetDeck(){ state.passed=[]; state.deckGoal='All'; refresh(); },
  profile(d){ closeMatch(); openProfile(d.id); },
  closeSheet(){ closeSheet(); },
  closeMatch(){ closeMatch(); },
  sheetSwipe(d){ closeSheet(); const top=document.querySelector('.card.top'); if(state.tab==='discover'&&top&&top.dataset.id===d.id) fling(d.v); else commitSwipe(d.id,d.v); },
  connect(d){ closeSheet(); const p=byId(d.id); state.history.push({id:d.id,dir:'right'}); if(p.likesYou) makeMatch(d.id); else { state.pending.push(d.id); refresh(); toast(`Connection request sent to ${p.pref}`);} },
  openChat(d){ openChat(d.id); },
  chatBack(){ state.activeChat=null; refresh(); },
  proposeFor(d){ proposeFor(d.id); },
  matchPropose(d){ closeMatch(); openChat(d.id); const e=evById(d.e); sendProposal(d.id,{title:e.title,where:e.loc,when:e.when,whenLabel:`${dayLabel(e.when)} · ${timeLabel(e.when)}`,eventId:e.id}); },
  propTab(d,el){ el.parentElement.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el)); $('#propEvents').hidden=d.v!=='events'; $('#propCustom').hidden=d.v!=='custom'; },
  sendProp(d){ const e=evById(d.e); sendProposal(d.id,{title:e.title,where:e.loc,when:e.when,whenLabel:`${dayLabel(e.when)} · ${timeLabel(e.when)}`,eventId:e.id}); },
  evCat(d){ state.evCat=d.v; refresh(); },
  rsvp(d){ const e=evById(d.id); const i=e.att.indexOf('me');
    if(i>=0){ e.att.splice(i,1); toast(e.hang?`Left ${e.title}`:`RSVP removed`); }
    else { e.att.push('me'); const m=e.att.filter(isMatch).map(id=>byId(id).pref); toast(`You're going to ${e.title}${m.length?` with ${m.slice(0,2).join(' & ')}`:''}`); }
    refresh(); if(d.sheet) eventDetail(d.id); if(d.sq) squadDetail(d.sq); },
  eventDetail(d){ eventDetail(d.id); },
  newHangout(){ newHangout(); },
  newSquad(){ newSquad(); },
  squadDetail(d){ squadDetail(d.id); },
  joinSquad(d){ const s=state.squads.find(x=>x.id===d.id); state.mySquads.add(d.id); if(!s.members.includes('me')) s.members.push('me'); s.chat.push({from:s.members[0],text:`Welcome to ${s.name}, ${state.user.pref}!`}); state.chats[d.id]={kind:'squad',unread:1,msgs:null}; closeSheet(); refresh(); toast(`Joined ${s.name}`); },
  leaveSquad(d){ const s=state.squads.find(x=>x.id===d.id); state.mySquads.delete(d.id); s.members=s.members.filter(m=>m!=='me'); delete state.chats[d.id]; if(state.activeChat===d.id) state.activeChat=null; closeSheet(); refresh(); toast(`Left ${s.name}`); },
  dirTag(d){ const t=state.dir.tags; const i=t.indexOf(d.v); i>=0?t.splice(i,1):t.push(d.v); refresh(); },
  dirClear(){ state.dir={q:'',major:'',campus:'',year:'',tags:[]}; refresh(); },
  editProfile(){ startOnboard(true); },
  signOut(){ state.screen='auth'; state.user=null; state.activeChat=null; render(); scrollTo(0,0); }
};
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act]'); if(!t||t.disabled) return;
  const fn=A[t.dataset.act]; if(fn){ e.preventDefault(); fn(t.dataset,t,e); }
});
$('#sheetWrap').addEventListener('click',e=>{ if(e.target.id==='sheetWrap') closeSheet(); });
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){ if(!$('#matchWrap').hidden) closeMatch(); else closeSheet(); return; }
  if(state.screen!=='app'||state.tab!=='discover'||!$('#sheetWrap').hidden||!$('#matchWrap').hidden) return;
  if(/INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName)) return;
  const k={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'super'}[e.key]; if(k){ e.preventDefault(); fling(k); }
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(state.screen==='onboard'&&t.dataset.f){ state.ob.d[t.dataset.f]=t.value; if(t.dataset.f==='bio'){ const h=t.parentElement.querySelector('.hint'); if(h) h.textContent=`${t.value.length}/220`; } if(t.dataset.f==='major'){ const h=t.parentElement.querySelector('.hint'); if(h) h.textContent='College: '+majorOf(t.value).c; } return; }
  if(t.id==='dirQ'){ state.dir.q=t.value; const pos=t.selectionStart; refresh(); const n=$('#dirQ'); n.focus(); n.setSelectionRange(pos,pos); }
  if(t.id==='squadQ'){ state.squadQ=t.value; const pos=t.selectionStart; refresh(); const n=$('#squadQ'); n.focus(); n.setSelectionRange(pos,pos); }
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(state.screen==='onboard'&&t.dataset.f){ state.ob.d[t.dataset.f]=t.value; return; }
  if(t.id==='obPhoto'&&t.files[0]){ const r=new FileReader(); r.onload=()=>{ state.ob.d.photo=r.result; render(); }; r.readAsDataURL(t.files[0]); }
  if(t.id==='dirMajor'){ state.dir.major=t.value; refresh(); }
  if(t.id==='dirCampus'){ state.dir.campus=t.value; refresh(); }
  if(t.id==='dirYear'){ state.dir.year=t.value; refresh(); }
});
document.addEventListener('submit',e=>{
  const f=e.target; e.preventDefault(); const k=f.dataset.form;
  if(k==='addTag'){ const i=$('#obTagNew'); const v=i.value.replace(/[#\s]+/g,'').trim(); if(!v) return; if(!state.ob.d.tags.some(t=>norm(t)===norm(v))) state.ob.d.tags.push(v); const y=scrollY; render(); scrollTo(0,y); setTimeout(()=>$('#obTagNew')?.focus(),0); }
  if(k==='send'){ const id=f.dataset.id; const i=$('#msgIn'); const v=i.value.trim(); if(!v) return; const msg={from:'me',text:v}; i.value=''; pushMsg(id,msg); refresh(); $('#msgIn')?.focus(); autoReply(id,msg); }
  if(k==='hangout'){
    const title=$('#hgTitle').value.trim(); if(!title) return;
    const when=`${$('#hgDay').value}T${$('#hgTime').value||'18:00'}`;
    const spot=$('#hgSpot').value;
    const campus=['Taylor Place','Roosevelt Row'].includes(spot)?'Downtown Phoenix':spot==='Fletcher Library'?'West Valley':spot==='Polytechnic Academic Center'?'Polytechnic':'Tempe';
    const h={id:'h'+Date.now(),title,cat:$('#hgCat').value,when,loc:spot,campus,tags:$('#hgTags').value.split(',').map(s=>s.replace(/#/g,'').trim()).filter(Boolean),att:['me'],desc:$('#hgDesc').value,host:'me',cap:Math.max(2,+$('#hgCap').value||6),hang:1};
    state.hangouts.push(h); closeSheet(); state.evCat='Hangouts'; refresh(); toast('Hangout posted. Matches nearby can join.');
    const joiner=PROFILES.filter(p=>p.campus===campus).sort((a,b)=>cos(h.tags,b.tags)-cos(h.tags,a.tags))[0];
    if(joiner) setTimeout(()=>{ if(!h.att.includes(joiner.id)&&h.att.length<h.cap){ h.att.push(joiner.id); toast(`${joiner.pref} joined your hangout`); if(state.tab==='events') refresh(); } },2600);
  }
  if(k==='squad'){
    const name=$('#sqName').value.trim(); if(!name) return;
    const inv=[...f.querySelectorAll('input[name=inv]:checked')].map(i=>i.value);
    const s={id:'s'+Date.now(),name,desc:$('#sqDesc').value,tags:$('#sqTags').value.split(',').map(x=>x.replace(/#/g,'').trim()).filter(Boolean),campus:$('#sqCampus').value,members:['me',...inv],events:[],hue:(Math.random()*360)|0,chat:[{from:'me',text:`Started ${name}. Welcome!`}]};
    state.squads.unshift(s); state.mySquads.add(s.id); state.chats[s.id]={kind:'squad',unread:0,msgs:null};
    closeSheet(); refresh(); toast(`${name} created${inv.length?` · ${inv.length} invited`:''}`);
    if(inv.length) setTimeout(()=>{ s.chat.push({from:inv[0],text:'Love this, count me in'}); if(!(state.tab==='chats'&&state.activeChat===s.id)) state.chats[s.id].unread=1; refresh(); },2200);
  }
  if(k==='propCustom'){
    const what=$('#pcWhat').value.trim()||'Hangout'; const where=$('#pcSpot').value.replace(' ★',''); const when=`${$('#pcDay').value}T${$('#pcTime').value||'16:00'}`;
    sendProposal(f.dataset.id,{title:`${what} at ${shortSpot(where)}`,where,when,whenLabel:`${dayLabel(when)} · ${timeLabel(when)}`});
  }
});

render();
