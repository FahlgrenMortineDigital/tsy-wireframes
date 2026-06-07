/* ===========================================================
   SLO CAL — IMPROMPTU WIDGET WIREFRAME — behavior + mock data
   =========================================================== */
(function(){
  "use strict";

  /* ---------- 7 REGIONS (positions are % over the .map box) ---------- */
  const REGIONS = [
    { id:"hwy1", name:"Highway 1 Road Trip", short:"Highway 1",
      vibe:"Coastal route · Cambria · San Simeon", top:10, left:46, route:true },
    { id:"paso", name:"Travel Paso Robles", short:"Paso Robles",
      vibe:"Wine country · inland north", top:13, left:78 },
    { id:"atascadero", name:"Visit Atascadero", short:"Atascadero",
      vibe:"Inland gateway · family", top:33, left:64 },
    { id:"morro", name:"Visit Morro Bay", short:"Morro Bay",
      vibe:"The Rock · working harbor", top:50, left:38 },
    { id:"slo", name:"Visit San Luis Obispo", short:"San Luis Obispo",
      vibe:"Downtown · Edna Valley wine", top:62, left:55 },
    { id:"pismo", name:"Pismo Beach CVB", short:"Pismo Beach",
      vibe:"Beach · boardwalk · dunes", top:80, left:44 },
    { id:"ag", name:"Visit Arroyo Grande", short:"Arroyo Grande",
      vibe:"Historic village · farm-to-table", top:84, left:62 },
  ];
  const byId = id => REGIONS.find(r=>r.id===id);

  /* ---------- mock "things to do" per region ----------
     type: event|eat|do|stay ; mood tags drive the By-mood filter ;
     idss:true marks an item the CRM profile would surface. ---------- */
  function pool(region){
    const base = {
      hwy1:[
        {type:"do", t:"[Elephant seal overlook walk]", meta:"free · all day", dist:22, mood:["outdoors"], idss:true},
        {type:"do", t:"[Tour Hearst Castle grounds]", meta:"tickets · timed entry", dist:25, mood:["culture"]},
        {type:"eat", t:"[Cambria pie shop]", meta:"open 'til 8 · $", dist:12, mood:["food"]},
        {type:"do", t:"[Moonstone Beach boardwalk]", meta:"sunset 7:43 · dog-friendly", dist:14, mood:["beach","outdoors"], idss:true},
        {type:"do", t:"[Piedras Blancas light station]", meta:"guided · mornings", dist:28, mood:["culture","outdoors"]},
        {type:"eat", t:"[Ragged Point clam chowder]", meta:"ocean view · $$", dist:34, mood:["food","beach"]},
      ],
      paso:[
        {type:"do", t:"[Tasting flight, west-side AVA]", meta:"by appt", dist:18, mood:["wine"], idss:true},
        {type:"event", t:"[Live music at the plaza]", meta:"tonight 6 PM · free", dist:9, mood:["culture"]},
        {type:"eat", t:"[Farm-to-table on Pine St]", meta:"seats at 7:30 · $$", dist:7, mood:["food"], idss:true},
        {type:"do", t:"[Olive oil mill tour]", meta:"daily · family-friendly", dist:15, mood:["outdoors"]},
        {type:"do", t:"[Hot-air balloon over vineyards]", meta:"sunrise · book ahead", dist:21, mood:["outdoors"], idss:true},
        {type:"do", t:"[River Road wine loop by bike]", meta:"rentals · half-day", dist:12, mood:["wine","outdoors"]},
      ],
      atascadero:[
        {type:"do", t:"[Charles Paddock Zoo]", meta:"open 'til 4 · family", dist:6, mood:["family"]},
        {type:"do", t:"[Sunken Gardens stroll]", meta:"free · downtown", dist:3, mood:["outdoors"]},
        {type:"eat", t:"[Brewery on El Camino]", meta:"open now · $$", dist:5, mood:["food"], idss:true},
        {type:"event", t:"[Tuesday farmers market]", meta:"3–6 PM · seasonal", dist:4, mood:["food"]},
        {type:"do", t:"[Salinas River boardwalk]", meta:"free · shaded", dist:8, mood:["outdoors"], idss:true},
        {type:"do", t:"[Galaxy theatre matinee]", meta:"daily · $", dist:7, mood:["family"]},
      ],
      morro:[
        {type:"event", t:"[Live music on the Embarcadero]", meta:"6 PM · free · dog-friendly", dist:4, mood:["culture"]},
        {type:"eat", t:"[Oyster bar by the dock]", meta:"open now · seats · $$", dist:2, mood:["food"], idss:true},
        {type:"do", t:"[Kayak the bay before sunset]", meta:"last rental 4 PM", dist:5, mood:["outdoors","beach"], idss:true},
        {type:"do", t:"[Climb to Black Hill overlook]", meta:"1.2 mi · big views", dist:7, mood:["outdoors"]},
        {type:"do", t:"[Morro Rock tide-pools]", meta:"free · low tide", dist:3, mood:["beach","outdoors"]},
        {type:"eat", t:"[Fish & chips on the pier]", meta:"open now · $", dist:2, mood:["food","beach"]},
      ],
      slo:[
        {type:"do", t:"[Hike Bishop Peak]", meta:"sunset 7:43 · 3.4 mi", dist:10, mood:["outdoors"], idss:true},
        {type:"eat", t:"[Higuera St. tasting room]", meta:"open now · $$", dist:4, mood:["wine","food"], idss:true},
        {type:"event", t:"[Thursday night market]", meta:"6–9 PM · downtown", dist:5, mood:["culture","food"]},
        {type:"do", t:"[Edna Valley wine loop]", meta:"by car · 20 min", dist:16, mood:["wine"]},
        {type:"do", t:"[Bubblegum Alley photo stop]", meta:"free · quirky", dist:5, mood:["culture"]},
        {type:"do", t:"[Mission plaza & creek walk]", meta:"free · shaded", dist:4, mood:["culture","family"]},
      ],
      pismo:[
        {type:"do", t:"[ATV the Oceano dunes]", meta:"rentals open · 4 mi", dist:8, mood:["outdoors"]},
        {type:"do", t:"[Monarch butterfly grove]", meta:"free · seasonal", dist:5, mood:["outdoors","family"], idss:true},
        {type:"eat", t:"[Clam chowder on the pier]", meta:"open now · $", dist:3, mood:["food","beach"]},
        {type:"do", t:"[Pismo pier sunset walk]", meta:"free · dog-friendly", dist:2, mood:["beach"]},
        {type:"do", t:"[Tide-pool tour at the cove]", meta:"low tide · guided", dist:6, mood:["beach","family"], idss:true},
        {type:"eat", t:"[Old West BBQ on Dolliver]", meta:"open now · $$", dist:4, mood:["food"]},
      ],
      ag:[
        {type:"do", t:"[Swinging bridge & village]", meta:"free · historic", dist:6, mood:["culture"]},
        {type:"eat", t:"[Farm-stand lunch]", meta:"open 'til 5 · $", dist:8, mood:["food"], idss:true},
        {type:"event", t:"[Harvest festival prep]", meta:"this weekend", dist:5, mood:["family","culture"]},
        {type:"do", t:"[Lopez Lake paddle]", meta:"day-use · 9 mi", dist:14, mood:["outdoors"], idss:true},
        {type:"do", t:"[Strawberry fields u-pick]", meta:"seasonal · mornings", dist:7, mood:["family","outdoors"]},
        {type:"do", t:"[Heritage House tour]", meta:"weekends · $", dist:6, mood:["culture"]},
      ],
    };
    return base[region] || [];
  }

  /* ---------- mock videos (YouTube @SLOCAL) ---------- */
  const VIDEOS = [
    {region:"hwy1", t:"[Driving Highway 1 at golden hour]", dur:"2:14", loc:"San Simeon", top:7, left:44, yt:"oCF3yr336CM"},
    {region:"hwy1", t:"[Moonstone Beach morning]", dur:"1:08", loc:"Cambria", top:16, left:42, yt:"I1Q40XOeOEk"},
    {region:"paso", t:"[A day in Paso wine country]", dur:"3:42", loc:"Paso Robles", top:15, left:80, yt:"dRIsr6-wtWQ"},
    {region:"atascadero", t:"[Family weekend in Atascadero]", dur:"1:55", loc:"Atascadero", top:34, left:67, yt:"gEEYV4nqcPo"},
    {region:"morro", t:"[Sunset behind Morro Rock]", dur:"0:58", loc:"Morro Bay", top:47, left:40, yt:"oCF3yr336CM"},
    {region:"morro", t:"[Kayaking the estuary]", dur:"2:30", loc:"Morro Bay", top:53, left:36, yt:"I1Q40XOeOEk"},
    {region:"slo", t:"[Thursday night market]", dur:"2:02", loc:"San Luis Obispo", top:60, left:57, yt:"dRIsr6-wtWQ"},
    {region:"slo", t:"[Hiking the Nine Sisters]", dur:"3:10", loc:"San Luis Obispo", top:66, left:51, yt:"gEEYV4nqcPo"},
    {region:"pismo", t:"[Monarchs at Pismo]", dur:"1:31", loc:"Pismo Beach", top:79, left:46, yt:"oCF3yr336CM"},
    {region:"ag", t:"[Harvest in Arroyo Grande]", dur:"2:46", loc:"Arroyo Grande", top:86, left:63, yt:"I1Q40XOeOEk"},
  ];

  const MOODS = [
    {id:"wine", label:"Wine"}, {id:"beach", label:"Beach"},
    {id:"outdoors", label:"Hike / Outdoors"}, {id:"food", label:"Eat & Drink"},
    {id:"family", label:"Family"}, {id:"culture", label:"Arts & Culture"},
  ];

  /* ---------- persisted state ---------- */
  const DEF = { view:"desktop", approach:"thumb", expanded:false, zoom:false, mapOpen:true, thumbMin:false,
                mode:"plan", region:"morro", layer:"todo", filter:"location", mood:"wine" };
  let S = Object.assign({}, DEF);
  try { S = Object.assign(S, JSON.parse(localStorage.getItem("slocal_widget")||"{}")); } catch(e){}
  function save(){ try{ localStorage.setItem("slocal_widget", JSON.stringify(S)); }catch(e){} }

  /* ---------- tiny DOM helpers ---------- */
  const el = (t,c,h)=>{ const e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e; };
  const $ = (s,r)=> (r||document).querySelector(s);
  const $$ = (s,r)=> Array.from((r||document).querySelectorAll(s));

  /* the list currently shown (kept consistent between map markers + side list) */
  let RLIST = [];
  /* deterministic scatter of point markers around a region center */
  function pointPos(r, i, n){
    const seed = r.id.length % 5;
    const ang = (i/Math.max(n,1))*Math.PI*2 + seed*0.6 - Math.PI/2;
    const rad = 7 + (i%3)*2.4;
    return { left:r.left + Math.cos(ang)*rad, top:r.top + Math.sin(ang)*rad*1.05 };
  }

  /* ===========================================================
     MAP rendering (shared by thumb, dock-mini, and panels)
     =========================================================== */
  const COUNTY_SVG = `
    <svg viewBox="0 0 100 120" preserveAspectRatio="none" aria-hidden="true">
      <rect class="sea" x="0" y="0" width="100" height="120"/>
      <path class="contour" d="M10,6 C6,28 12,46 9,66 C6,86 11,102 10,120"/>
      <path class="contour" d="M21,4 C17,26 23,44 19,64 C16,84 22,100 23,120"/>
      <path class="land" d="M44,0 C40,10 46,16 42,26 C38,36 33,40 35,50 C37,58 28,60 26,68 C24,76 33,80 34,90 C35,102 44,108 46,120 L100,120 L100,0 Z"/>
      <path class="road" d="M72,2 C68,30 74,60 70,92 C68,106 72,112 74,120"/>
      <path class="road" d="M74,16 C66,26 60,32 60,40 C60,50 55,56 52,64 C49,72 45,78 42,84"/>
      <path class="road" d="M52,64 C44,66 38,66 34,64"/>
      <path class="coastline" d="M44,0 C40,10 46,16 42,26 C38,36 33,40 35,50 C37,58 28,60 26,68 C24,76 33,80 34,90 C35,102 44,108 46,120"/>
      <path class="hwy1-line" d="M41,6 C37,18 43,26 39,34 C35,44 32,50 32,58 C32,66 29,66 29,72 C29,80 35,82 35,92 C36,104 43,108 43,118"/>
    </svg>`;

  function buildMap(opts){
    opts = opts || {};
    const map = el("div","map");
    const stage = el("div","map-stage"); stage.innerHTML = COUNTY_SVG;
    map.appendChild(stage);

    if(!opts.interactive){
      // static mini pins (thumbnail / dock)
      REGIONS.forEach(r=>{
        const p = el("span","pin"); p.style.top=r.top+"%"; p.style.left=r.left+"%";
        p.innerHTML = `<span class="dot" style="width:11px;height:11px;border-width:2px;"></span>`;
        map.appendChild(p);
      });
      map.appendChild(el("div","ocean-tag","Pacific Ocean"));
      return map;
    }

    const Z = 2.4, clamp = v => Math.max(5, Math.min(95, v));

    if(S.zoom){
      // ---- ZOOMED: frame one region + numbered point markers ----
      const r = byId(S.region);
      map.classList.add("zoomed");
      stage.style.transformOrigin = r.left+"% "+r.top+"%";
      stage.style.transform = "scale("+Z+")";
      if(S.layer==="video") map.classList.add("show-video");

      RLIST.forEach((it, idx)=>{
        const pp = pointPos(r, idx, RLIST.length);
        const pin = el("button","ptpin"+(S.layer==="video"?" video":""));
        pin.style.left = clamp(r.left + (pp.left-r.left)*Z)+"%";
        pin.style.top  = clamp(r.top  + (pp.top -r.top )*Z)+"%";
        pin.dataset.idx = idx;
        pin.innerHTML = `<span class="num">${idx+1}</span>`;
        map.appendChild(pin);
      });
      const lab = el("div","focus-label", r.short);
      lab.style.left = "50%"; lab.style.top = "8%";
      map.appendChild(lab);

    } else {
      // ---- OVERVIEW: all 7 region pins with text labels ----
      REGIONS.forEach(r=>{
        const p = el("button","pin labeled"+(r.id===S.region?" active":""));
        p.style.top = r.top+"%"; p.style.left = r.left+"%";
        p.dataset.region = r.id;
        p.dataset.side = r.left > 52 ? "left" : "right";
        p.innerHTML = `<span class="dot"></span><span class="plabel">${r.short}</span>`;
        p.addEventListener("click", ()=>{ S.region=r.id; S.zoom=true; render(); });
        map.appendChild(p);
      });
      // video pins
      VIDEOS.forEach(v=>{
        const vp = el("button","vpin","▶");
        vp.style.top=v.top+"%"; vp.style.left=v.left+"%";
        vp.title = v.t+" · "+v.loc;
        vp.addEventListener("click", ()=>{ S.region=v.region; S.layer="video"; S.zoom=true; render(); });
        map.appendChild(vp);
      });
      // beacon (you are here) only in near mode
      if(S.mode==="near"){
        const r = byId("morro");
        const b = el("div","beacon"); b.style.top=r.top+"%"; b.style.left=r.left+"%";
        const bl = el("div","beacon-label","You're here"); bl.style.top=r.top+"%"; bl.style.left=r.left+"%";
        map.appendChild(b); map.appendChild(bl);
      }
      if(S.layer==="video") map.classList.add("show-video");
      map.appendChild(el("div","ocean-tag","Pacific Ocean"));
    }
    return map;
  }

  /* ===========================================================
     PICKS + VIDEOS list rendering
     =========================================================== */
  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
  }
  function filteredItems(){
    const items = pool(S.region).slice();
    if(S.filter==="location")  return items.sort((a,b)=> (a.dist||0)-(b.dist||0));
    if(S.filter==="surprise")  return shuffle(items).slice(0,4);   // a fresh random handful each time
    if(S.filter==="idss")      return items.sort((a,b)=> (b.idss?1:0)-(a.idss?1:0));
    return items; // "now" — top things to do
  }

  /* ---- today's business hours (live open/closed for the current day) ---- */
  const _now = new Date();
  const DAY3 = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][_now.getDay()];
  const _HR = _now.getHours() + _now.getMinutes()/60;
  const OUTDOOR = /beach|boardwalk|hike|walk|dunes|grove|tide|lake|bridge|garden|creek|peak|overlook|u-pick|fields|loop|paddle|kayak|bike|alley|rock|estuary|monarch|seal/i;
  function _fmt(h){ const ap=h>=12?"p":"a"; let hh=h%12; if(hh===0)hh=12; return hh+ap; }
  function hoursFor(i){
    if(i.type==="event") return null;                 // events carry their time in the meta
    if(OUTDOOR.test(i.t)) return {status:"open", statusText:"Open daily", label:"sunrise–sunset"};
    let openH  = i.type==="eat" ? 11 : 10;
    let closeH = i.type==="eat" ? 21 : 17;
    const m = i.meta.match(/open 'til (\d+)/i); if(m){ closeH = (+m[1]) + 12; }
    let status, statusText;
    if(/open now/i.test(i.meta) || (_HR>=openH && _HR<closeH)){ status="open"; statusText="Open now"; }
    else if(_HR < openH){ status="soon"; statusText="Opens "+_fmt(openH); }
    else { status="closed"; statusText="Closed"; }
    return { status, statusText, label:_fmt(openH)+"–"+_fmt(closeH)+" · "+DAY3 };
  }

  function pickRow(i, idx){
    const idss = S.filter==="idss" && i.idss;
    const row = el("div","pick"+(idss?" idss-match":""));
    row.dataset.idx = idx;
    const metaClean = i.meta
      .replace(/open 'til \d+/ig,"").replace(/open now/ig,"")
      .replace(/·\s*·/g,"·").replace(/^[\s·]+|[\s·]+$/g,"");
    const distText = (S.filter==="location" && i.dist!=null) ? `${i.dist} min away` : "";
    const metaLine = [metaClean, distText].filter(Boolean).join(" · ");
    const h = hoursFor(i);
    const hoursHtml = h
      ? `<div class="phours ${h.status}"><span class="hdot"></span><b>${h.statusText}</b>${h.label?` · ${h.label}`:""}</div>`
      : "";
    row.innerHTML = `
      <div class="pimg ph"><span>img</span></div>
      <div class="pbody">
        <span class="ptag">${({event:"Event",eat:"Eat",do:"Do",stay:"Stay"})[i.type]}</span>
        ${idss?'<span class="matchtag"> · ✦ matches you</span>':''}
        <h5>${i.t}</h5>
        <div class="pmeta">${metaLine}</div>
        ${hoursHtml}
        <a class="pvisit" href="#">Visit website ↗</a>
      </div>
      <div class="pnum">${idx+1}</div>`;
    return row;
  }

  function videoCards(list){
    return list.map((v,idx)=>{
      const c = el("div","vcard"); c.dataset.idx = idx;
      c.innerHTML = `
        <div class="vthumb ph"><span>video still</span>
          <span class="vloc">📍 ${v.loc}</span>
          <span class="vplay">▶</span>
          <span class="vdur">${v.dur}</span>
        </div>
        <div class="vbody">
          <h5>${idx+1}. ${v.t}</h5>
          <div class="vmeta"><span>YouTube · @SLOCAL</span> · <a href="#">See on map</a></div>
        </div>`;
      c.addEventListener("click", ()=> openVideoModal(v));
      const mapLink = c.querySelector(".vmeta a");
      if(mapLink) mapLink.addEventListener("click", (e)=>{ e.preventDefault(); e.stopPropagation(); });
      return c;
    });
  }

  /* ---- video lightbox (plays the real @SLOCAL YouTube clip) ---- */
  function escClose(e){ if(e.key==="Escape") closeVideoModal(); }
  function closeVideoModal(){ const m=$("#videoModal"); if(m) m.remove(); document.removeEventListener("keydown", escClose); }
  function openVideoModal(v){
    closeVideoModal();
    const m = el("div","vmodal"); m.id="videoModal";
    m.innerHTML = `
      <div class="vmodal-bd"></div>
      <div class="vmodal-box" role="dialog" aria-label="${v.t}">
        <button class="vmodal-x" aria-label="Close">×</button>
        <div class="vmodal-frame">
          ${v.yt
            ? `<iframe src="https://www.youtube-nocookie.com/embed/${v.yt}?autoplay=1&rel=0&modestbranding=1" title="${v.t}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
            : `<div class="vmodal-ph ph"><span>video player</span></div>`}
        </div>
        <div class="vmodal-cap"><b>${v.t}</b><span>YouTube · @SLOCAL · filmed in ${v.loc}</span></div>
      </div>`;
    document.body.appendChild(m);
    m.querySelector(".vmodal-bd").addEventListener("click", closeVideoModal);
    m.querySelector(".vmodal-x").addEventListener("click", closeVideoModal);
    document.addEventListener("keydown", escClose);
  }

  function filterLabel(){
    if(S.layer==="video") return "Inspiration reels — filmed across "+byId(S.region).short;
    switch(S.filter){
      case "surprise": return "🎲 A fresh handful — tap again to re-roll";
      case "location": return "📍 Nearest to you first";
      case "idss": return "✦ Matched to your profile · wine, coastal hikes";
      default: return S.mode==="near" ? "Happening near you right now" : "Top things to do";
    }
  }

  /* ===========================================================
     BUILD: shared detail column (used in panel + sheet)
     =========================================================== */
  function buildFilters(){
    const wrap = el("div","filters");
    wrap.appendChild(el("span","flabel","Show me more things to do…"));
    const row = el("div","fchips");
    const defs = [
      {f:"location", label:"📍 Near me"},
      {f:"surprise", label:"🎲 Surprise me"},
      {f:"idss", label:"✦ For me", idss:true},
    ];
    defs.forEach(d=>{
      const b = el("button","chip"+(d.idss?" idss":""));
      b.setAttribute("aria-pressed", S.filter===d.f);
      b.innerHTML = d.label;
      b.addEventListener("click", ()=>{
        // Surprise me always re-rolls a fresh set; others toggle on/off
        S.filter = (d.f!=="surprise" && S.filter===d.f) ? "now" : d.f;
        render();
      });
      row.appendChild(b);
    });
    wrap.appendChild(row);
    return wrap;
  }

  function buildDropdown(){
    const dd = el("div","dropdown"+(uiOpen.dd?" open":""));
    const r = byId(S.region);
    dd.innerHTML = `<button type="button"><span>${r.name}</span><span class="chev">▾</span></button>
      <div class="menu"></div>`;
    const menu = $(".menu", dd);
    REGIONS.forEach(rr=>{
      const b = el("button"); b.setAttribute("aria-selected", rr.id===S.region);
      b.innerHTML = `<span>${rr.name}</span><small>${rr.vibe}</small>`;
      b.addEventListener("click",(e)=>{ e.stopPropagation(); S.region=rr.id; uiOpen.dd=false; S.zoom=true; render(); });
      menu.appendChild(b);
    });
    $("button", dd).addEventListener("click",(e)=>{ e.stopPropagation(); uiOpen.dd=!uiOpen.dd; render(); });
    return dd;
  }

  function buildRegionList(){
    const rl = el("div","rlist");
    REGIONS.forEach(r=>{
      const cnt = pool(r.id).length;
      const row = el("button","rrow"); row.dataset.region = r.id;
      row.innerHTML = `
        <div class="rimg ph"><span>img</span></div>
        <div><h5>${r.name}</h5><div class="rsub">${r.vibe} · ${cnt} on now</div></div>
        <div class="rchev">›</div>`;
      row.addEventListener("click", ()=>{ S.region=r.id; S.zoom=true; render(); });
      rl.appendChild(row);
    });
    return rl;
  }

  function buildDetail(){
    const col = el("div","detail-col");

    // ---- LEVEL 1: overview (no region drilled in) ----
    if(!S.zoom){
      const head = el("div","detail-head");
      head.innerHTML = `<h3 class="rname">Explore SLO CAL</h3>
        <div class="rmeta">7 regions · pick one on the map or below to zoom in</div>`;
      col.appendChild(head);
      col.appendChild(buildRegionList());
      return col;
    }

    // ---- LEVEL 2: region focused ----
    const r = byId(S.region);
    const count = RLIST.length;
    const head = el("div","detail-head");
    head.innerHTML = `
      <button class="backbtn" id="backRegions">← All regions</button>
      <h3 class="rname" style="margin-top:9px;">${r.name}</h3>
      <div class="rmeta">${r.vibe} · ${S.layer==="video"? count+" reels": count+" things on now"}</div>`;
    col.appendChild(head);

    // Things to do / Videos as tabs
    const tabs = el("div","layer-toggle"); tabs.style.margin="2px 16px 6px";
    tabs.innerHTML = `
      <button data-layer="todo" aria-pressed="${S.layer==='todo'}">Things to do</button>
      <button data-layer="video" aria-pressed="${S.layer==='video'}">Videos</button>`;
    col.appendChild(tabs);

    if(S.layer==="todo") col.appendChild(buildFilters());

    const note = el("div","detail-head","");
    note.style.padding="0 16px 6px";
    note.innerHTML = `<div class="eyebrow" style="font-size:11px;">${filterLabel()}</div>`;
    col.appendChild(note);

    if(S.layer==="video"){
      const vl = el("div","vlist");
      videoCards(RLIST).forEach(c=>vl.appendChild(c));
      col.appendChild(vl);
    } else {
      const pk = el("div","picks");
      RLIST.forEach((i,idx)=> pk.appendChild(pickRow(i,idx)));
      col.appendChild(pk);
    }

    const foot = el("div","detail-foot");
    foot.innerHTML = S.layer==="video"
      ? `<span>Reels from <b>@SLOCAL</b> · tagged by film location</span><span class="lnk">Open YouTube ↗</span>`
      : `<span></span><span class="lnk">See all in ${r.short} →</span>`;
    col.appendChild(foot);
    return col;
  }

  /* ===========================================================
     BUILD: desktop expanded panel
     =========================================================== */
  function buildPanel(){
    const p = el("aside","panel"+(S.expanded?" open":"")+(S.mapOpen?"":" mapclosed"));
    p.id="panel"; p.setAttribute("aria-label","Impromptu widget");

    // annotation pin
    p.insertAdjacentHTML("beforeend",
      `<span class="anno-pin" style="top:-10px;left:-10px;">W</span>`);

    // top bar
    const top = el("div","panel-top");
    top.innerHTML = `
      <div class="ptitle"><span class="eyebrow">Right now · Impromptu</span><b>Explore SLO CAL</b></div>
      <div class="spacer"></div>
      <div class="modes" role="group" aria-label="Mode">
        <button data-mode="plan" aria-pressed="${S.mode==='plan'}">✺ Plan a trip</button>
        <button data-mode="near" aria-pressed="${S.mode==='near'}">📍 Near me</button>
      </div>
      <button class="iconbtn" id="closePanel" title="Collapse">×</button>`;
    p.appendChild(top);

    // auto-detect strip (near mode)
    const det = el("div","detect"+(S.mode==="near"?"":" hide"));
    det.innerHTML = `📍 <span>Looks like you're near <b>Morro Bay</b> — showing what's nearby.</span>
      <span class="lnk" data-mode="plan">Just browsing? Switch to Plan</span>`;
    p.appendChild(det);

    // body
    const body = el("div","panel-body");

    if(S.mapOpen){
      const mapCol = el("div","map-col");
      const sel = el("div","region-select");
      if(S.zoom){
        const back = el("button","backbtn"); back.id="backMap"; back.innerHTML="← All regions";
        sel.appendChild(back);
      } else {
        sel.appendChild(el("label",null,"Region"));
      }
      sel.appendChild(buildDropdown());
      const minb = el("button","iconbtn small"); minb.id="hideMap"; minb.title="Minimize map"; minb.innerHTML="–";
      sel.appendChild(minb);
      mapCol.appendChild(sel);

      const mw = el("div","map-wrap");
      mw.appendChild(buildMap({interactive:true}));
      mapCol.appendChild(mw);

      const mf = el("div","map-foot");
      mf.innerHTML = S.zoom
        ? `<span class="dotk" style="background:var(--accent)"></span> tap a number to locate it on the map`
        : `<span class="dotk" style="background:var(--ink)"></span> tap a region to zoom in`;
      mapCol.appendChild(mf);
      body.appendChild(mapCol);
    } else {
      // minimized: slim rail to reopen the map
      const rail = el("button","maprail"); rail.id="showMap"; rail.title="Show map";
      rail.innerHTML = `<span>🗺 Show map</span>`;
      body.appendChild(rail);
    }

    body.appendChild(buildDetail());
    p.appendChild(body);
    return p;
  }

  /* ===========================================================
     BUILD: collapsed thumbnail (Approach A)
     =========================================================== */
  function buildThumb(){
    const t = el("div","thumb"); t.id="thumb";
    t.innerHTML = `
      <div class="thumb-head">
        <span class="ttl">Explore SLO CAL</span>
        <button class="thumb-min" title="Minimize">–</button>
      </div>`;
    const tm = el("div","thumb-map");
    tm.appendChild(buildMap({interactive:false}));
    if(S.mode==="near"){
      const r=byId("morro");
      const b=el("div","beacon"); b.style.top=r.top+"%"; b.style.left=r.left+"%"; tm.querySelector(".map").appendChild(b);
    }
    t.appendChild(tm);
    t.insertAdjacentHTML("beforeend",`
      <div class="thumb-foot">
        <span>7 regions · tap to explore</span>
        <button class="chip-expand">Open ↗</button>
      </div>`);
    // whole card opens the panel
    t.addEventListener("click", ()=>{ S.expanded=true; render(); });
    // minimize: slide off to the right, then show the edge tab
    t.querySelector(".thumb-min").addEventListener("click", (e)=>{
      e.stopPropagation();
      t.classList.add("slideout");
      setTimeout(()=>{ S.thumbMin=true; render(); }, 240);
    });
    if(animThumbIn){ t.classList.add("slidein"); animThumbIn=false; }
    return t;
  }

  /* minimized state: a vertical tab docked to the right edge */
  function buildLauncher(){
    const d = el("button","edgetab"); d.id="launcher";
    d.innerHTML = `<svg class="mini" viewBox="0 0 100 120" preserveAspectRatio="none">
        <path class="county" d="M14,8 L40,5 56,10 70,7 86,16 90,34 82,50 88,66 84,86 72,104 58,114 44,112 30,100 22,82 28,66 18,52 12,34 Z"/></svg>
      <span class="v">Explore SLO CAL</span>`;
    d.addEventListener("click", ()=>{ animThumbIn=true; S.thumbMin=false; render(); });
    return d;
  }

  /* Approach B: right-edge dock */
  function buildDock(){
    const d = el("button","dock"); d.id="dock";
    d.innerHTML = `<svg class="mini" viewBox="0 0 100 120" preserveAspectRatio="none">
        <path class="county" d="M14,8 L40,5 56,10 70,7 86,16 90,34 82,50 88,66 84,86 72,104 58,114 44,112 30,100 22,82 28,66 18,52 12,34 Z"/></svg>
      <span class="v">Explore SLO CAL</span>`;
    d.addEventListener("click", ()=>{ S.expanded=true; render(); });
    return d;
  }

  /* ===========================================================
     BUILD: mobile pill + sheet
     =========================================================== */
  function buildPill(){
    const b = el("button","mpill"); b.id="mpill";
    b.innerHTML = `<svg class="mp-ico" viewBox="0 0 100 120" preserveAspectRatio="none">
      <path d="M14,8 L40,5 56,10 70,7 86,16 90,34 82,50 88,66 84,86 72,104 58,114 44,112 30,100 22,82 28,66 18,52 12,34 Z" fill="none" stroke="#fff" stroke-width="6"/></svg>
      Explore SLO CAL`;
    b.addEventListener("click", ()=>{ S.expanded=true; render(); });
    return b;
  }

  function buildSheet(){
    const s = el("aside","sheet"+(S.expanded?" open":"")); s.id="sheet";
    s.innerHTML = `<div class="grab"></div>`;
    const top = el("div","s-top");
    top.innerHTML = `<span class="stitle">Explore SLO CAL</span>
      <div class="spacer"></div>
      <div class="modes">
        <button data-mode="plan" aria-pressed="${S.mode==='plan'}">✺ Plan</button>
        <button data-mode="near" aria-pressed="${S.mode==='near'}">📍 Near me</button>
      </div>
      <button class="iconbtn" id="closeSheet" style="margin-left:8px;">×</button>`;
    s.appendChild(top);

    const scroll = el("div","s-scroll");
    if(S.mode==="near"){
      scroll.insertAdjacentHTML("beforeend",
        `<div class="s-detect">📍 Near <b>&nbsp;Morro Bay</b> — showing what's nearby.</div>`);
    }
    // region select: back (when zoomed) + dropdown
    const sel = el("div","region-select"); sel.style.marginBottom="10px";
    if(S.zoom){
      const back = el("button","backbtn"); back.id="backRegions"; back.innerHTML="← All regions";
      sel.appendChild(back);
    }
    sel.appendChild(buildDropdown());
    scroll.appendChild(sel);

    // map (now shown on mobile too)
    const mw = el("div","map-wrap mobile-map");
    mw.appendChild(buildMap({interactive:true, tips:!S.zoom}));
    scroll.appendChild(mw);
    scroll.insertAdjacentHTML("beforeend",
      `<div class="map-foot" style="margin:6px 0 2px;">${S.zoom
        ? '<span class="dotk" style="background:var(--accent)"></span> tap a number to locate it'
        : '<span class="dotk" style="background:var(--ink)"></span> tap a region to zoom in'}</div>`);

    if(!S.zoom){
      // overview: region list
      scroll.insertAdjacentHTML("beforeend",`<div class="eyebrow" style="font-size:12px;margin:10px 0 8px;">7 regions across SLO CAL</div>`);
      const rl = buildRegionList(); rl.style.padding="0"; scroll.appendChild(rl);
    } else {
      // focused: layer toggle + filters + numbered list
      const layer = el("div","layer-toggle"); layer.style.margin="12px 0 0";
      layer.innerHTML = `
        <button data-layer="todo" aria-pressed="${S.layer==='todo'}">◎ Things to do</button>
        <button data-layer="video" aria-pressed="${S.layer==='video'}">▶ Videos</button>`;
      scroll.appendChild(layer);
      if(S.layer==="todo") scroll.appendChild(buildFilters());
      scroll.insertAdjacentHTML("beforeend",`<div class="eyebrow" style="font-size:12px;margin:4px 0 8px;">${filterLabel()}</div>`);
      if(S.layer==="video"){
        const vl = el("div","vlist"); vl.style.padding="0";
        videoCards(RLIST).forEach(c=>vl.appendChild(c)); scroll.appendChild(vl);
      } else {
        const pk = el("div","picks"); pk.style.padding="0";
        RLIST.forEach((i,idx)=>pk.appendChild(pickRow(i,idx))); scroll.appendChild(pk);
      }
    }
    s.appendChild(scroll);
    return s;
  }

  /* ===========================================================
     RENDER — wipe & rebuild widget layer
     =========================================================== */
  const uiOpen = { dd:false };
  let host;
  let animThumbIn = false;

  function render(){
    save();
    document.body.dataset.view = S.view;
    document.body.classList.toggle("is-expanded", !!S.expanded);
    // the list shown right now (kept in sync between map markers + side list)
    RLIST = (S.layer==="video") ? VIDEOS.filter(v=>v.region===S.region) : filteredItems();
    if(!host){ host = el("div"); host.id="widget-host"; document.body.appendChild(host); }
    host.innerHTML = "";

    // scrim when expanded on desktop
    let scrim = $("#scrim");
    if(!scrim){ scrim = el("div","scrim"); scrim.id="scrim"; document.body.appendChild(scrim);
      scrim.addEventListener("click", ()=>{ S.expanded=false; S.zoom=false; render(); }); }
    scrim.classList.toggle("show", S.expanded && S.view==="desktop");

    if(S.view==="desktop"){
      if(S.expanded){
        host.appendChild(buildPanel());
      } else if(S.approach==="dock"){
        host.appendChild(buildDock()); $("#dock",host).style.display="flex";
      } else if(S.thumbMin){
        host.appendChild(buildLauncher());
      } else {
        host.appendChild(buildThumb());
      }
    } else {
      // mobile: render inside phone screen
      const screen = $(".phone .screen");
      if(S.expanded){ buildAndMount(screen, buildSheet); }
      else { buildAndMount(screen, buildPill); }
    }

    bindDelegates();
    syncDemoBar();
  }

  // mount mobile widget into phone screen overlay (kept separate from host)
  function buildAndMount(screen, builder){
    // clear any previous mobile widget
    $$(".mpill, .sheet", screen).forEach(n=>n.remove());
    const node = builder();
    screen.appendChild(node);
  }

  /* event delegation for dynamically-built controls */
  function bindDelegates(){
    // close buttons
    const cp = $("#closePanel"); if(cp) cp.onclick=()=>{ S.expanded=false; S.zoom=false; render(); };
    const cs = $("#closeSheet"); if(cs) cs.onclick=()=>{ S.expanded=false; render(); };
    // back to region overview
    const bm = $("#backMap"); if(bm) bm.onclick=()=>{ S.zoom=false; render(); };
    const br = $("#backRegions"); if(br) br.onclick=()=>{ S.zoom=false; render(); };
    // minimize / reopen the map (desktop)
    const hm = $("#hideMap"); if(hm) hm.onclick=()=>{ S.mapOpen=false; render(); };
    const sm = $("#showMap"); if(sm) sm.onclick=()=>{ S.mapOpen=true; render(); };
    // mode buttons (panel + sheet + detect link)
    $$('[data-mode]').forEach(b=> b.onclick=()=>{ S.mode=b.dataset.mode; render(); });
    // layer buttons
    $$('[data-layer]').forEach(b=> b.onclick=()=>{ S.layer=b.dataset.layer; render(); });

    // link numbered map markers <-> list rows (both directions, like Travel Nevada)
    const rowFor = idx => $('.pick[data-idx="'+idx+'"]') || $('.vcard[data-idx="'+idx+'"]');
    const pinFor = idx => $('.ptpin[data-idx="'+idx+'"]');
    function hi(idx, on){
      const p = pinFor(idx); if(p) p.classList.toggle("active", on);
      const r = rowFor(idx); if(r) r.classList.toggle("active", on);
    }
    $$('.ptpin').forEach(pin=>{
      const idx = pin.dataset.idx;
      pin.onmouseenter = ()=> hi(idx,true);
      pin.onmouseleave = ()=> hi(idx,false);
      pin.onclick = ()=>{
        $$('.ptpin,.pick,.vcard').forEach(n=>n.classList.remove("active"));
        hi(idx,true);
        const r = rowFor(idx);
        if(r){ const sc = r.closest(".picks,.vlist"); if(sc){ sc.scrollTop = r.offsetTop - sc.offsetTop - 8; } }
      };
    });
    $$('.pick,.vcard').forEach(row=>{
      if(row.dataset.idx==null) return;
      const idx = row.dataset.idx;
      row.addEventListener("mouseenter", ()=>{ const p=pinFor(idx); if(p) p.classList.add("active"); });
      row.addEventListener("mouseleave", ()=>{ const p=pinFor(idx); if(p) p.classList.remove("active"); });
    });

    // close dropdown on outside click
    document.onclick = (e)=>{ if(uiOpen.dd && !e.target.closest(".dropdown")){ uiOpen.dd=false; render(); } };
    // "Visit website" links are placeholders in the wireframe
    $$('.pvisit').forEach(a=> a.onclick=(e)=>{ e.preventDefault(); e.stopPropagation(); });
  }

  /* ===========================================================
     DEMO BAR wiring
     =========================================================== */
  function syncDemoBar(){
    $$("#demobar [data-set]").forEach(b=>{
      const [k,v]=b.dataset.set.split(":");
      b.setAttribute("aria-pressed", String(S[k])===v);
    });
  }
  function initDemoBar(){
    $$("#demobar [data-set]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const [k,v]=b.dataset.set.split(":");
        S[k]=v;
        if(k==="view"){ S.expanded=false; S.zoom=false; S.mode = (v==="mobile" ? "near" : "plan"); }
        render();
      });
    });
  }

  /* ---------- boot ---------- */
  document.addEventListener("DOMContentLoaded", ()=>{ initDemoBar(); render(); });
})();
