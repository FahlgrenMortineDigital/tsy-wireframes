const ARROW='<span class="arr"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h8M7 3l3 3-3 3"/></svg></span>';
const $=id=>document.getElementById(id);
const RM=matchMedia('(prefers-reduced-motion: reduce)');
/* A stack lays every possible version of a block in one grid cell. The hidden ones hold the height, so the card never jumps as copy changes. */
const stack=(variants,cur,cls='')=>`<div class="stack ${cls}">${variants.map(v=>`<div class="sz" aria-hidden="true" inert>${v}</div>`).join('')}<div class="cur">${cur}</div></div>`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- Report CTA (shared by both tools) ---------- */
const ICO_DL='<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v8M5 7l3 3 3-3M3 13.5h10"/></svg>';
const ICO_MAIL='<svg class="ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="M2.6 4.7 8 8.5l5.4-3.8"/></svg>';
const ICO_CHK='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5 6.5 12 13 5"/></svg>';
const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// One self-contained report card: two CTAs that each open an email field, validate, then confirm.
function reportHTML(opts){
  const dark=!!opts.dark;
  return `<div class="report${dark?' on-dark':''}" data-state="idle">`
    +`<div class="report__intro"><span class="report__kick">PDF · 2.4 MB</span><p class="report__title">${esc(opts.title)}</p></div>`
    +`<div class="report__row report__cta">`
      +`<button class="btn report__act" type="button" data-intent="download">${ICO_DL}Download</button>`
      +`<button class="btn ${dark?'ghost-dark':'ghost'} report__act" type="button" data-intent="email">${ICO_MAIL}Email me</button>`
    +`</div>`
    +`<form class="report__form" novalidate hidden>`
      +`<p class="report__lab"></p>`
      +`<div class="report__field"><input class="report__input" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" aria-label="Email address" required><button class="btn report__send" type="submit">Send${ARROW}</button></div>`
      +`<p class="report__err" role="alert" hidden>Enter a valid email address.</p>`
      +`<button class="report__back" type="button">Back</button>`
    +`</form>`
    +`<div class="report__ready" hidden><p class="report__note">Your email is confirmed. Your report is ready.</p><button class="btn report__get" type="button">${ICO_DL}Download report</button></div>`
    +`<div class="report__done" role="status" aria-live="polite" hidden><span class="report__chk">${ICO_CHK}</span><p class="report__msg"></p></div>`
  +`</div>`;
}
function wireReport(root){
  if(!root||root._wired) return; root._wired=true;
  const cta=root.querySelector('.report__cta'), form=root.querySelector('.report__form'),
        ready=root.querySelector('.report__ready'), getBtn=root.querySelector('.report__get'),
        done=root.querySelector('.report__done'), input=root.querySelector('.report__input'),
        err=root.querySelector('.report__err'), lab=root.querySelector('.report__lab'),
        msg=root.querySelector('.report__msg');
  const show=(el,on)=>{el.hidden=!on;};
  let intent='download';
  root.querySelectorAll('.report__act').forEach(b=>b.onclick=()=>{
    intent=b.dataset.intent;
    lab.textContent=intent==='download'?'Enter your email to unlock the download.':'Enter your email and we’ll send you the full report.';
    show(err,false); input.classList.remove('bad'); input.value='';
    show(ready,false); show(done,false); show(cta,false); show(form,true); root.dataset.state='form'; input.focus();
  });
  root.querySelector('.report__back').onclick=()=>{ show(form,false); show(cta,true); root.dataset.state='idle'; };
  input.addEventListener('input',()=>{ if(input.classList.contains('bad')&&EMAIL_RE.test(input.value.trim())){ input.classList.remove('bad'); show(err,false); } });
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const v=input.value.trim();
    if(!EMAIL_RE.test(v)){ show(err,true); input.classList.add('bad'); input.focus(); return; }
    show(form,false);
    if(intent==='download'){ show(ready,true); root.dataset.state='ready'; getBtn.focus(); }
    else { msg.textContent=`The full report has been emailed to you at ${v}.`; show(done,true); root.dataset.state='done'; }
  });
  getBtn.onclick=()=>{ msg.textContent='Your full report is downloading.'; show(ready,false); show(done,true); root.dataset.state='done'; };
}

/* ---------- Head-to-head ---------- */
const ROUNDS=[
  {cat:'Explore · Weekends',city:'Boston',q:'Which lighthouse would you rather spend a Saturday at?',a:'assets/img/r1-a-ohio-marblehead.jpg',b:'assets/img/r1-b-boston.jpg',ohio:0,ohioL:'Ohio · Marblehead',fact:'Marblehead is the oldest continuously operating lighthouse on the Great Lakes.'},
  {cat:'Live · Food',city:'San Francisco',q:'Which bowl of ramen are you ordering?',a:'assets/img/r2-a-ohio-columbus-ramen.jpg',b:'assets/img/r2-b-san-francisco-ramen.jpg',ohio:0,ohioL:'Ohio · Columbus',fact:'Columbus is a go-to test market for national restaurant brands, so new food lands here first.'},
  {cat:'Explore · Outdoors',city:'Austin',q:'Where are you paddling this summer?',a:'assets/img/r3-a-austin-paddle.jpg',b:'assets/img/r3-b-ohio-paddle.jpg',ohio:1,ohioL:'Ohio',fact:'Ohio has 75 state parks, and every one is free to enter.'},
  {cat:'Live · Arts',city:'New York',q:'Which performance are you getting tickets for?',a:'assets/img/r4-a-new-york-ballet.jpg',b:'assets/img/r4-b-ohio-ballet.jpg',ohio:1,ohioL:'Ohio',fact:'Cleveland’s Playhouse Square is the largest performing arts center in the country outside New York.'},
  {cat:'Explore · Nightlife',city:'Nashville',q:'Where are you catching live music Friday?',a:'assets/img/r5-a-nashville-music.jpg',b:'assets/img/r5-b-ohio-music.jpg',ohio:1,ohioL:'Ohio',fact:'Cleveland is home to the Rock & Roll Hall of Fame.'}
];
const H={i:0,pick:null,picks:[]};
const wait=ms=>RM.matches?Promise.resolve():new Promise(r=>setTimeout(r,ms));
let busy=false;
function tileHTML(r,src,k,pick){
  const rev=pick!==null, isO=k===r.ohio, mine=pick===k;
  return `<button class="tile" type="button" data-k="${k}" ${rev?'disabled':''} aria-label="${rev?(isO?r.ohioL:r.city):'Photo '+(k?'B':'A')}"><img src="${src}" alt="">${rev?`<span class="lbl ${isO?'ohio':'other'}">${esc(isO?r.ohioL:r.city)}</span>`:''}${mine?'<span class="ring"></span><span class="mine">Your pick</span>':''}</button>`;
}
const revealHTML=(verdict,fact,last)=>`<div class="reveal"><p><strong>${verdict}</strong> ${esc(fact)}</p><button class="btn next" type="button">${last?'See results':'Next'}${ARROW}</button></div>`;
const HINT='<p class="hint">Tap the one you’d rather. No labels until you choose.</p>';
function roundCard(i,pick){
  const r=ROUNDS[i], rev=pick!==null;
  const dots=ROUNDS.map((_,k)=>`<i class="${k<=i?'on':''}${k===i?' new':''}"></i>`).join('');
  const verdict=pick===r.ohio?'You picked Ohio.':'Close. That one was Ohio.';
  return `<div class="card"><div class="top-row"><span class="eyebrow">${esc(r.cat)}</span><div class="dots" aria-label="Round ${i+1} of 5">${dots}</div></div>`
    +stack(ROUNDS.map(x=>`<div class="round-h">Ohio or ${esc(x.city)}?</div>`),`<h3 class="round-h" tabindex="-1">Ohio or ${esc(r.city)}?</h3>`)
    +stack(ROUNDS.map(x=>`<p class="round-q">${esc(x.q)}</p>`),`<p class="round-q">${esc(r.q)}</p>`)
    +`<div class="tiles">${tileHTML(r,r.a,0,pick)}${tileHTML(r,r.b,1,pick)}</div>`
    +stack([HINT,...ROUNDS.map(x=>revealHTML('Close. That one was Ohio.',x.fact,true))],rev?revealHTML(verdict,r.fact,i===4):HINT,'foot')
    +`</div>`;
}
function preload(i){ const r=ROUNDS[i]; if(r) [r.a,r.b].forEach(src=>{ new Image().src=src; }); }

// Round in: the card stays put while its contents rise in, one after another.
function showRound(focus){
  const st=$('h2hStage');
  st.classList.remove('leaving');
  st.innerHTML=roundCard(H.i,null);
  const card=st.firstElementChild; card.classList.add('enter');
  card.querySelectorAll(':scope > .tiles .tile').forEach(b=>b.onclick=()=>reveal(+b.dataset.k));
  if(focus) card.querySelector('h3.round-h').focus({preventScroll:true});
  renderList(); preload(H.i+1);
}
// Pick: reveal in place, so the photos never reload or blink.
async function reveal(k){
  if(H.pick!==null) return;
  const r=ROUNDS[H.i], st=$('h2hStage'), card=st.firstElementChild;
  H.pick=k; H.picks[H.i]=k===r.ohio;
  card.classList.remove('enter');
  card.querySelectorAll(':scope > .tiles .tile').forEach(t=>{
    const tk=+t.dataset.k, isO=tk===r.ohio, mine=tk===k;
    t.disabled=true; t.setAttribute('aria-label',isO?r.ohioL:r.city);
    t.classList.add(mine?'picked':'unpicked');
    t.insertAdjacentHTML('beforeend',`<span class="lbl ${isO?'ohio':'other'}" style="--d:${mine?120:260}ms">${esc(isO?r.ohioL:r.city)}</span>`+(mine?'<span class="ring"></span><span class="mine">Your pick</span>':''));
  });
  renderList();
  const cur=card.querySelector('.foot > .cur');
  cur.firstElementChild.classList.add('out');
  await wait(160);
  cur.innerHTML=revealHTML(k===r.ohio?'You picked Ohio.':'Close. That one was Ohio.',r.fact,H.i===4);
  const nx=cur.querySelector('.next'); nx.onclick=next; nx.focus({preventScroll:true});
}
// Out: contents fade and lift, then the next round or the results come in.
async function next(){
  if(busy) return; busy=true;
  $('h2hStage').classList.add('leaving');
  await wait(280);
  H.i++; H.pick=null;
  if(H.i>=ROUNDS.length) showResults(); else showRound(true);
  busy=false;
}
function showResults(){
  const st=$('h2hStage'), score=H.picks.filter(Boolean).length;
  st.classList.remove('leaving');
  st.innerHTML=stack([roundCard(4,ROUNDS[4].ohio)],`<div class="results enter"><div class="k">Your results</div><div class="score"><span id="scoreN">0</span>/5</div><p class="lead">times you picked Ohio without knowing it.</p><p>${score>=3?'You already like the life.':'Ohio still has a few surprises for you.'} Your full report breaks down cost of living, commute time and more. Ohio’s cost of living runs 6.3% below the national average.</p><div class="row"><button class="btn ghost-dark" id="again" type="button">Play again${ARROW}</button></div>${reportHTML({title:'The Ohio advantage: your full report',dark:true})}</div>`);
  setTimeout(()=>tween($('scoreN'),score,undefined,0,700),RM.matches?0:250);
  wireReport(st.querySelector('.report'));
  renderList();
  $('again').onclick=async()=>{ if(busy) return; busy=true; st.classList.add('leaving'); await wait(280); H.i=0;H.pick=null;H.picks=[]; showRound(true); busy=false; };
}
// The matchup list is built once and updated in place, so its states can ease.
function renderList(){
  const ol=$('h2hList');
  if(!ol.children.length) ol.innerHTML=ROUNDS.map((r,k)=>`<li><span class="n">${k+1}</span><span class="t">Ohio or ${esc(r.city)}?</span><span class="r"></span></li>`).join('');
  [...ol.children].forEach((li,k)=>{
    const done=H.picks[k]!==undefined, txt=done?(H.picks[k]?'Picked Ohio':ROUNDS[k].city):(k===H.i?'Now':'');
    li.classList.toggle('now',k===H.i);
    const r=li.querySelector('.r');
    if(r.textContent!==txt){ r.textContent=txt; r.classList.toggle('yes',!!(done&&H.picks[k])); r.classList.remove('in'); void r.offsetWidth; if(txt) r.classList.add('in'); }
  });
}
showRound(false);

/* ---------- Commute data ---------- */
const FROM={'Seattle':28,'San Francisco':33,'Los Angeles':31,'New York':41,'Boston':31,'Chicago':32};
const TO={'Columbus':22,'Cleveland':24,'Cincinnati':25,'Dayton':21,'Toledo':20};
const yr=m=>m*2*5*48/60;
const S={from:null,to:null,act:null};
const ACTS={
  ll:{tab:'Little League',per:2,unit:'Little League games',note:'Based on two hours a game, warm-ups included.',img:'img-ll'},
  dn:{tab:'Date Night',per:3,unit:'date nights',note:'Based on three hours a night out. More than one every other week, all year.',img:'img-dn'},
  ms:{tab:'Maker Space',per:4,unit:'Saturdays in the maker space',note:'Based on four-hour sessions. Nearly every other weekend, all year.',img:'img-ms'}
};
const saved=()=>Math.max(0,Math.round(yr(FROM[S.from])-yr(TO[S.to])));

function chipRow(el,list,cur,on){ el.innerHTML=Object.keys(list).map(c=>`<button class="chip" type="button" aria-pressed="${c===cur}" data-c="${esc(c)}">${esc(c)}</button>`).join(''); el.querySelectorAll('.chip').forEach(b=>b.onclick=()=>on(b.dataset.c)); }
function setFrom(c){ S.from=c; renderAll(); }
function setTo(c){ S.to=c; renderAll(); }

/* ---------- Reclaim ---------- */
const MAXH=yr(Math.max(...Object.values(FROM)));
const NOTE_EMPTY='Pick your current city and an Ohio city to see the difference.';
const NOTE_READY='Pick how you’d spend it: a season of games, date nights, or time for a hobby.';
const SRC=(a,b)=>`Typical one-way commute: ${a} min vs. ${b} min, five days a week, 48 weeks a year.`;
const SRC_EMPTY='Commute times are typical one-way drives, five days a week, 48 weeks a year.';
// Count a number up (or down) from what is on screen now.
function tween(el,to,fmt=n=>n,from=el._cur??0,dur=1100){
  cancelAnimationFrame(el._raf);
  if(RM.matches||from===to){ el._cur=to; el.textContent=fmt(to); return; }
  const t0=performance.now();
  const step=now=>{ const p=Math.min((now-t0)/dur,1), e=1-Math.pow(1-p,3); el._cur=Math.round(from+(to-from)*e); el.textContent=fmt(el._cur); if(p<1) el._raf=requestAnimationFrame(step); };
  el._raf=requestAnimationFrame(step);
}
function pop(el){ el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }

$('rK').innerHTML=stack(['Time you get back every year','Your 888 hours back could be'],'<span id="rKt"></span>');
$('rStat').innerHTML=stack(['hours out of traffic',...Object.values(ACTS).map(a=>a.unit)].map(u=>`<div class="stat"><b>888</b><span>${u}</span></div>`),'<div class="stat"><b id="rN" class="idle">0</b><span id="rU"></span></div>');
$('rNote').innerHTML=stack([NOTE_EMPTY,NOTE_READY,...Object.values(ACTS).map(a=>a.note)],'<span id="rNt"></span>');
$('cpSrc').innerHTML=stack([SRC_EMPTY,SRC(88,88)],'<span id="cpSrcT"></span>');
$('cmReport').innerHTML=reportHTML({title:'Your time back in Ohio: full report',dark:false});
wireReport($('cmReport').firstElementChild);

function cityVal(el,city,list){
  if(!city){ el.classList.add('idle'); el._cur=0; el.textContent='Pick one'; return; }
  el.classList.remove('idle'); tween(el,Math.round(yr(list[city])),n=>n+' hrs');
}
function renderReclaim(){
  const ready=!!(S.from&&S.to), back=ready?Math.max(0,Math.round(yr(FROM[S.from])-yr(TO[S.to]))):0;
  $('cpFrom').textContent=S.from||'Your city'; cityVal($('cpFromH'),S.from,FROM);
  $('cpTo').textContent=S.to?S.to+', OH':'Ohio city'; cityVal($('cpToH'),S.to,TO);
  $('barFrom').style.width=S.from?(yr(FROM[S.from])/MAXH*100)+'%':'0';
  $('barTo').style.width=S.to?(yr(TO[S.to])/MAXH*100)+'%':'0';
  $('cpSrcT').textContent=ready?SRC(FROM[S.from],TO[S.to]):SRC_EMPTY;

  $('picks').innerHTML=Object.entries(ACTS).map(([k,a])=>`<button class="pick" type="button" aria-pressed="${S.act===k}" data-k="${k}" ${ready?'':'disabled'}>${a.tab}</button>`).join('');
  $('picks').querySelectorAll('.pick').forEach(b=>b.onclick=()=>{ S.act=S.act===b.dataset.k?null:b.dataset.k; renderReclaim(); });

  const bg=$('bg'); [...bg.children].forEach(n=>n.classList.remove('on'));
  const a=ready&&S.act?ACTS[S.act]:null;
  $(a?a.img:'traffic').classList.add('on');
  $('rKt').textContent=a?`Your ${back} hours back could be`:'Time you get back every year';
  $('rU').textContent=a?a.unit:'hours out of traffic';
  $('rNt').textContent=a?a.note:(ready?NOTE_READY:NOTE_EMPTY);
  const n=$('rN'), to=a?Math.floor(back/a.per):back, key=(a?S.act:'hrs')+to;
  n.classList.toggle('idle',!ready);
  if(n._key!==key){ tween(n,to,undefined,a&&n._key&&!n._key.startsWith(S.act)?0:undefined); if(ready) pop(n); n._key=key; }
  $('cmReport').hidden=!ready;
}
function renderAll(){
  chipRow($('fromChips2'),FROM,S.from,setFrom); chipRow($('toChips'),TO,S.to,setTo);
  renderReclaim();
}
renderAll();
$('rGo').onclick=()=>{ $('reclaim').classList.remove('is-start'); $('rHead').focus({preventScroll:true}); };
