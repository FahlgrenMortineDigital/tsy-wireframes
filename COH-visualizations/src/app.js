const ARROW='<span class="arr"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h8M7 3l3 3-3 3"/></svg></span>';
const $=id=>document.getElementById(id);
const RM=matchMedia('(prefers-reduced-motion: reduce)');
/* A stack lays every possible version of a block in one grid cell. The hidden ones hold the height, so the card never jumps as copy changes. */
const stack=(variants,cur,cls='')=>`<div class="stack ${cls}">${variants.map(v=>`<div class="sz" aria-hidden="true" inert>${v}</div>`).join('')}<div class="cur">${cur}</div></div>`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- Head-to-head ---------- */
const ROUNDS=[
  {cat:'Explore · Weekends',city:'Boston',q:'Which lighthouse would you rather spend a Saturday at?',a:'assets/img/r1-a-ohio-marblehead.jpg',b:'assets/img/r1-b-boston.jpg',ohio:0,ohioL:'Ohio · Marblehead',fact:'Marblehead is the oldest continuously operating lighthouse on the Great Lakes.'},
  {cat:'Live · Food',city:'San Francisco',q:'Which bowl of ramen are you ordering?',a:'assets/img/r2-a-ohio-columbus-ramen.jpg',b:'assets/img/r2-b-san-francisco-ramen.jpg',ohio:0,ohioL:'Ohio · Columbus',fact:'Columbus is a go-to test market for national restaurant brands, so new food lands here first.'},
  {cat:'Explore · Outdoors',city:'Austin',q:'Where are you paddling this summer?',a:'assets/img/r3-a-austin-paddle.jpg',b:'assets/img/r3-b-ohio-paddle.jpg',ohio:1,ohioL:'Ohio',fact:'Ohio has 75 state parks, and every one is free to enter.'},
  {cat:'Live · Arts',city:'New York',q:'Which performance are you getting tickets for?',a:'assets/img/r4-a-new-york-ballet.jpg',b:'assets/img/r4-b-ohio-ballet.jpg',ohio:1,ohioL:'Ohio',fact:'Cleveland’s Playhouse Square is the largest performing arts center in the country outside New York.'},
  {cat:'Explore · Nightlife',city:'Nashville',q:'Where are you catching live music Friday?',a:'assets/img/r5-a-nashville-music.jpg',b:'assets/img/r5-b-ohio-music.jpg',ohio:1,ohioL:'Ohio',fact:'Cleveland is home to the Rock & Roll Hall of Fame.'}
];
const H={i:0,pick:null,picks:[]};
function tileHTML(r,src,k,pick){
  const rev=pick!==null, isO=k===r.ohio, mine=pick===k;
  return `<button class="tile" type="button" data-k="${k}" ${rev?'disabled':''} aria-label="${rev?(isO?r.ohioL:r.city):'Photo '+(k?'B':'A')}"><img src="${src}" alt="">${rev?`<span class="lbl ${isO?'ohio':'other'}">${esc(isO?r.ohioL:r.city)}</span>`:''}${mine?'<span class="ring"></span><span class="mine">Your pick</span>':''}</button>`;
}
const revealHTML=(verdict,fact,last)=>`<div class="reveal"><p><strong>${verdict}</strong> ${esc(fact)}</p><button class="btn next" type="button">${last?'See results':'Next'}${ARROW}</button></div>`;
const HINT='<p class="hint">Tap the one you’d rather. No labels until you choose.</p>';
function roundCard(i,pick){
  const r=ROUNDS[i], rev=pick!==null;
  const dots=ROUNDS.map((_,k)=>`<i class="${k<=i?'on':''}"></i>`).join('');
  const verdict=pick===r.ohio?'You picked Ohio.':'Close. That one was Ohio.';
  return `<div class="card"><div class="top-row"><span class="eyebrow">${esc(r.cat)}</span><div class="dots" aria-label="Round ${i+1} of 5">${dots}</div></div>`
    +stack(ROUNDS.map(x=>`<div class="round-h">Ohio or ${esc(x.city)}?</div>`),`<h3 class="round-h">Ohio or ${esc(r.city)}?</h3>`)
    +stack(ROUNDS.map(x=>`<p class="round-q">${esc(x.q)}</p>`),`<p class="round-q">${esc(r.q)}</p>`)
    +`<div class="tiles">${tileHTML(r,r.a,0,pick)}${tileHTML(r,r.b,1,pick)}</div>`
    +stack([HINT,...ROUNDS.map(x=>revealHTML('Close. That one was Ohio.',x.fact,true))],rev?revealHTML(verdict,r.fact,i===4):HINT,'foot')
    +`</div>`;
}
function renderH2H(){
  const st=$('h2hStage');
  if(H.i>=ROUNDS.length){
    const score=H.picks.filter(Boolean).length;
    st.innerHTML=stack([roundCard(4,ROUNDS[4].ohio)],`<div class="results"><div class="k">Your results</div><div class="score">${score}/5</div><p class="lead">times you picked Ohio without knowing it.</p><p>${score>=3?'You already like the life.':'Ohio still has a few surprises for you.'} Now see how far your paycheck goes. Ohio’s cost of living is 6.3% below the national average.</p><div class="row"><a class="btn" href="https://callohiohome.com/" target="_blank" rel="noopener">Compare cost of living${ARROW}</a><button class="btn ghost-dark" id="again" type="button">Play again${ARROW}</button></div></div>`);
    $('again').onclick=()=>{H.i=0;H.pick=null;H.picks=[];renderH2H();};
  } else {
    const r=ROUNDS[H.i];
    st.innerHTML=roundCard(H.i,H.pick);
    st.querySelectorAll(':scope > .card > .tiles .tile').forEach(b=>b.onclick=()=>{ if(H.pick!==null) return; H.pick=+b.dataset.k; H.picks[H.i]=H.pick===r.ohio; renderH2H(); });
    if(H.pick!==null) st.querySelector('.foot > .cur .next').onclick=()=>{H.i++;H.pick=null;renderH2H();};
  }
  $('h2hList').innerHTML=ROUNDS.map((r,k)=>{const done=k<H.picks.length, now=k===H.i;
    return `<li class="${now?'now':''}"><span class="n">${k+1}</span><span class="t">Ohio or ${esc(r.city)}?</span><span class="r ${done&&H.picks[k]?'yes':''}">${done?(H.picks[k]?'Picked Ohio':r.city):(now?'Now':'')}</span></li>`;}).join('');
}
renderH2H();

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
}
function renderAll(){
  chipRow($('fromChips2'),FROM,S.from,setFrom); chipRow($('toChips'),TO,S.to,setTo);
  renderReclaim();
}
renderAll();
$('rGo').onclick=()=>{ $('reclaim').classList.remove('is-start'); $('rHead').focus({preventScroll:true}); };
