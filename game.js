'use strict';
/* =====================  MAP DATA  ===================== */
// Hex grids (odd rows shifted right). Each letter = one territory, '.' = sea.
// terr: letter -> [name, region index]. sea: lanes between territories that don't touch by land.
const MAPS = [
{ name:"Classic Isles", grid:[
"....................",
"..AAA.BBB....EEFFF..",
".AAACCBB....EEEFFGG.",
"..ACCCDD.....HEFFGG.",
"..CCDDD.....HHHIIJJ.",
"......D....HHIIIJJJ.",
"......KKLL...II.....",
".....KKKLLMM.....XX.",
"....NNKOOLMM....XXXY",
"...NNNOOOMM.....ZZYY",
"..PPNQQOO.......ZaYb",
".PPPQQQ...TTUU..Zaab",
"..PRRQS...TTTUUV.abb",
"..RRRSS....WWUVV....",
"...RSS.....WWW.V....",
"...................."],
  terr:{
  A:["Glacier Bay",0], B:["Rime Peaks",0], C:["Whitewood",0], D:["Coldharbor",0],
  E:["Stormcrest",1], F:["Eagle's Rest",1], G:["Thornvale",1], H:["Ironhold",1], I:["Granite Pass",1], J:["Windmere",1],
  K:["Oakshire",2], L:["Millbrook",2], M:["Stonebridge",2], N:["Westmarch",2], O:["Crossroads",2],
  P:["Dune Sea",3], Q:["Mirage Flats",3], R:["Scorpion Gulch",3], S:["Oasis",3],
  T:["Jade Cove",4], U:["Palm Reach",4], V:["Coral Point",4], W:["Lagoon",4],
  X:["Cinder Ridge",5], Y:["Smolder",5], Z:["Obsidian Fields",5], a:["Ember Coast",5], b:["Ashfall",5]},
  reg:[{n:"Frostmark",b:2},{n:"Highreach",b:3},{n:"Heartland",b:3},{n:"Sunscar",b:2},{n:"Emerald Isles",b:2},{n:"Ashlands",b:3}],
  sea:[["B","E"],["H","L"],["J","X"],["M","T"],["S","W"],["V","a"],["A","P"]] },
{ name:"Grand Archipelago", grid:[
"............................",
"...AAE.....FFJJ.KK....LL....",
"..AAAEEEBB.FFFJJKGG..PLLLM..",
".DAAAEEBB.FFFHHGGGG.PPLLMMM.",
".DDDACCBBB.IIHHHGGG.NNNLOMM.",
".DDCCCCBB.II.HHHG..NNNNOOO..",
".....CCB.............NNNOO..",
"............................",
"...QQQSS....WWZZZ....bbbff..",
".QQQQVSSSU.WWWZXXX..bbbbff..",
"..QQQVVSUU..WWYXXX.eebbbcff.",
"..TTVVRRR..aaYYXX.eeddbcccc.",
"...TTTVRRR..aaYY...edddccc..",
".....................ddcc...",
".....ggk...........ll.......",
"...ggggkk.....mooollll......",
"..iigggkhhh...mmoollllnn....",
".iiijjghhh...mmmmppllnn.....",
"...ijjjhh....mmmmppppnn.....",
"............................",],
  terr:{
  A:["Glacier Bay",0], B:["Rime Peaks",0], C:["Whitewood",0], D:["Coldharbor",0], E:["Snowmere",0],
  F:["Stormcrest",1], G:["Eagle's Rest",1], H:["Ironhold",1], I:["Granite Pass",1], J:["Windmere",1], K:["Thornvale",1],
  L:["Gale Point",2], M:["Saltcliff",2], N:["Breakwater",2], O:["Gullhaven",2], P:["Squall Rock",2],
  Q:["Westmarch",3], R:["Millbrook",3], S:["Oakshire",3], T:["Fernwick",3], U:["Crossroads",3], V:["Stonebridge",3],
  W:["Hollowmere",4], X:["Lantern Vale",4], Y:["Gloamwood",4], Z:["Mistfen",4], a:["Willowdeep",4],
  b:["Dune Sea",5], c:["Mirage Flats",5], d:["Scorpion Gulch",5], e:["Oasis",5], f:["Sandspire",5],
  g:["Jade Cove",6], h:["Palm Reach",6], i:["Lagoon",6], j:["Turtle Bay",6], k:["Mango Grove",6],
  l:["Coral Point",7], m:["Reefwatch",7], n:["Pearl Shoals",7], o:["Kelp Forest",7], p:["Starfish Key",7]},
  reg:[{n:"Frostmark",b:2},{n:"Highreach",b:3},{n:"Stormcoast",b:2},{n:"Heartland",b:3},{n:"The Hollows",b:3},{n:"Sunscar",b:3},{n:"Emerald Isles",b:2},{n:"Coral Reach",b:2}],
  sea:[["B","F"],["B","S"],["G","N"],["G","Z"],["N","b"],["U","W"],["R","k"],["X","e"],["Y","m"],["d","l"],["h","m"]] },
{ name:"Star Systems", space:true, w:760, h:560,
  // each system: 5 planets on a ring around its star, starting at angle a0 (degrees), 72 deg apart
  // planet: [name, radius, has rings]
  sys:[
    {n:"Aurelia", b:2, x:115, y:115, a0:-90, ring:70, star:"#ffd36b", pl:[["Aurel Prime",19,0],["Halcyon",16,1],["Cinder",17,0],["Vesper",15,0],["Lumen",18,0]]},
    {n:"Kestrel", b:3, x:380, y:105, a0:-90, ring:70, star:"#a8dcff", pl:[["Kestra",18,0],["Zephyr IX",16,0],["Frostfall",19,1],["Tarn",15,0],["Obsidia",17,0]]},
    {n:"Hollow Drift", b:3, x:645, y:115, a0:-90, ring:70, star:"#cfa8ff", pl:[["Rook",17,0],["Echo",16,0],["Gloam",19,0],["Nadir",15,1],["Wraith",18,0]]},
    {n:"Ember Cluster", b:3, x:115, y:445, a0:90, ring:70, star:"#ff8a65", pl:[["Pyra",18,0],["Kiln",16,0],["Scoria",17,1],["Brimstone",19,0],["Ash Moon",15,0]]},
    {n:"Tidewater", b:3, x:380, y:455, a0:90, ring:70, star:"#7de8d6", pl:[["Marisol",19,1],["Kelpie",15,0],["Undine",17,0],["Brine",16,0],["Coralis",18,0]]},
    {n:"Frontier Verge", b:2, x:645, y:445, a0:90, ring:70, star:"#ffbe6b", pl:[["Lastlight",18,0],["Waypoint",16,0],["Drift",17,0],["Farhold",19,1],["Outpost K",15,0]]}
  ],
  // hyperspace routes between systems ("system.planet")
  lanes:[["0.1","1.4"],["0.2","1.3"],["1.1","2.4"],["0.2","3.3"],["3.4","4.1"],["3.3","4.2"],["4.3","5.2"],["2.2","5.3"]],
  worm:[["3.1","2.1","#c77dff"]],
  // obstacles (decoration — the routes above already avoid them)
  hole:{x:380, y:280, r:24},
  belts:[[[506,118],[522,180],[508,252]], [[508,418],[524,490],[506,562]]],
  nebulas:[{x:70,y:280,rx:68,ry:44,c:"#b06bff"}, {x:600,y:282,rx:44,ry:36,c:"#ff6bb5",label:"ION STORM",lc:"#ffc2e3"}] },
{ name:"Galaxy", space:true, w:1040, h:770,
  sys:[
    {n:"Aurelia", b:3, x:130, y:125, a0:-90, ring:78, star:"#ffd36b", pl:[["Aurel Prime",18,0],["Halcyon",16,1],["Cinder",17,0],["Vesper",15,0],["Lumen",18,0],["Solace",16,0]]},
    {n:"Kestrel", b:3, x:520, y:115, a0:-90, ring:78, star:"#a8dcff", pl:[["Kestra",17,0],["Zephyr IX",16,0],["Frostfall",18,1],["Tarn",15,0],["Obsidia",17,0],["Glint",15,0]]},
    {n:"Hollow Drift", b:3, x:910, y:125, a0:-90, ring:78, star:"#cfa8ff", pl:[["Rook",17,0],["Echo",16,0],["Gloam",18,0],["Nadir",15,1],["Wraith",17,0],["Hush",15,0]]},
    {n:"Ironheart", b:4, x:300, y:385, a0:-90, ring:78, star:"#ffe9a8", pl:[["Anvil",17,0],["Forge",18,0],["Cobalt",15,1],["Rivet",16,0],["Magnet",17,0],["Tungsten",15,0]]},
    {n:"Silverwake", b:3, x:740, y:385, a0:-90, ring:78, star:"#d7e4ff", pl:[["Argent",17,0],["Comet's Tail",15,0],["Mercure",16,0],["Glimmer",18,1],["Quicksilver",15,0],["Moonrise",17,0]]},
    {n:"Ember Cluster", b:3, x:130, y:645, a0:-90, ring:78, star:"#ff8a65", pl:[["Pyra",17,0],["Kiln",16,0],["Scoria",17,1],["Brimstone",18,0],["Ash Moon",15,0],["Flint",16,0]]},
    {n:"Tidewater", b:3, x:520, y:655, a0:-90, ring:78, star:"#7de8d6", pl:[["Marisol",18,1],["Kelpie",15,0],["Undine",17,0],["Brine",16,0],["Coralis",17,0],["Seafoam",15,0]]},
    {n:"Frontier Verge", b:2, x:910, y:645, a0:-90, ring:78, star:"#ffbe6b", pl:[["Lastlight",17,0],["Waypoint",16,0],["Drift",17,0],["Farhold",18,1],["Outpost K",15,0],["Beacon",16,0]]}
  ],
  lanes:[["0.1","1.5"],["0.2","3.0"],["1.1","2.5"],["1.2","2.4"],["1.3","3.1"],["2.4","4.0"],["3.4","5.1"],["3.3","6.5"],
         ["4.3","6.1"],["4.2","7.5"],["5.2","6.4"],["6.1","7.5"]],
  worm:[["5.4","2.1","#c77dff"],["0.5","7.2","#4fd1ff"]],
  hole:{x:520, y:385, r:26},
  belts:[[[318,110],[334,180],[320,252]], [[322,540],[336,600],[324,662]], [[712,640],[726,700],[714,775]]],
  nebulas:[{x:80,y:385,rx:70,ry:48,c:"#b06bff"}, {x:965,y:385,rx:62,ry:46,c:"#4f8bff",lc:"#c2dcff"},
           {x:855,y:268,rx:38,ry:30,c:"#ff6bb5",label:"ION STORM",lc:"#ffc2e3"}] }
];
const COLORS = ["#e5484d","#3e8ef7","#30a46c","#e6a700","#8e4ec6","#f76b15","#8b95a7"];
// Brighter versions of the player colours for text, readable on the dark panels (WCAG AA, 4.5:1+)
const TEXT_COLORS = ["#ff7c80","#6ba8ff","#45c487","#f2bd2c","#b98cf0","#ff8f4d","#b0bacb"];
const CNAMES = ["Red","Blue","Green","Gold","Purple","Orange","Neutral"];
const START_ARMIES = {2:24,3:20,4:16,5:14,6:12,7:12};
const CARD_ICONS = ["⚔️","🛡️","🏹","⭐"];
const CARD_NAMES = ["Sword","Shield","Bow","Wild"];

/* ===================== GEOMETRY ===================== */
const R = 20, SQ = Math.sqrt(3);
const DIR_E = [[0,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0]];   // edge k -> neighbour (even rows)
const DIR_O = [[0,1],[1,1],[1,0],[0,-1],[-1,0],[-1,1]];     // (odd rows)
const ctr = (r,c)=> [SQ*R*(c+0.5*(r&1)) + SQ*R/2, 1.5*R*r + R];
const corner = (x,y,k)=>{const a=Math.PI/180*(60*k-30); return [x+R*Math.cos(a), y+R*Math.sin(a)];};
let GRID, REG, SEA, H, W, LET, IDX, T, NT, regionTerr, mapId = -1;
const at = (r,c)=> (r<0||c<0||r>=H||c>=W) ? "." : GRID[r][c];
function useMap(m){
  if(!MAPS[m]) m = 0;
  if(m===mapId) return;
  mapId = m; const M = MAPS[m];
  if(M.space){ useSpace(M); return; }
  GRID = M.grid; REG = M.reg; SEA = M.sea; H = GRID.length; W = GRID[0].length;
  LET = Object.keys(M.terr);
  IDX = Object.fromEntries(LET.map((l,i)=>[l,i]));
  T = LET.map((l,i)=>({i, l, name:M.terr[l][0], reg:M.terr[l][1], cells:[], adj:new Set()}));
  for(let r=0;r<H;r++) for(let c=0;c<W;c++){
    const l = GRID[r][c]; if(l===".") continue;
    const t = T[IDX[l]]; t.cells.push([r,c]);
    const D = (r&1)?DIR_O:DIR_E;
    for(const [dr,dc] of D){ const n = at(r+dr,c+dc); if(n!=="." && n!==l) t.adj.add(IDX[n]); }
  }
  for(const [x,y] of SEA){ T[IDX[x]].adj.add(IDX[y]); T[IDX[y]].adj.add(IDX[x]); }
  NT = T.length;
  regionTerr = REG.map((_,ri)=>T.filter(t=>t.reg===ri).map(t=>t.i));
  buildMap();
}

function useSpace(M){
  GRID = null; SEA = []; REG = M.sys.map(s=>({n:s.n, b:s.b}));
  T = []; IDX = {};
  M.sys.forEach((s,si)=>s.pl.forEach(([name,r,ring],k)=>{
    const a = (s.a0 + k*360/s.pl.length) * Math.PI/180, id = T.length;
    IDX[si+"."+k] = id;
    T.push({i:id, l:si+"."+k, name, reg:si, x:s.x + s.ring*Math.cos(a), y:s.y + s.ring*Math.sin(a), r, ring, cells:[], adj:new Set()});
  }));
  const link2 = (a,b)=>{ T[IDX[a]].adj.add(IDX[b]); T[IDX[b]].adj.add(IDX[a]); };
  // within a system you orbit to the next planet; the star blocks the middle
  M.sys.forEach((s,si)=>{ const n=s.pl.length; for(let k=0;k<n;k++) link2(si+"."+k, si+"."+((k+1)%n)); });
  for(const [a,b] of M.lanes.concat(M.worm)) link2(a,b);
  LET = T.map(t=>t.l); NT = T.length;
  regionTerr = REG.map((_,ri)=>T.filter(t=>t.reg===ri).map(t=>t.i));
  buildMap();
}

/* ===================== HELPERS ===================== */
const $ = s=>document.querySelector(s);
const esc = s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const b64 = {
  enc(bytes){let s="";for(let i=0;i<bytes.length;i++)s+=String.fromCharCode(bytes[i]);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");},
  dec(str){str=str.replace(/-/g,"+").replace(/_/g,"/");while(str.length%4)str+="=";const s=atob(str),b=new Uint8Array(s.length);for(let i=0;i<s.length;i++)b[i]=s.charCodeAt(i);return b;}
};
async function pack(obj){
  const raw = new TextEncoder().encode(JSON.stringify(obj));
  if(window.CompressionStream){
    try{
      const buf = await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer();
      return "z"+b64.enc(new Uint8Array(buf));
    }catch(e){}
  }
  return "j"+b64.enc(raw);
}
const MAX_LINK = 20000, MAX_STATE = 100000;   // real games are ~1 KB links / ~4 KB of state
async function unpack(code){
  if(code.length > MAX_LINK || !/^[zj][A-Za-z0-9_-]+$/.test(code)) throw new Error("bad link");
  let bytes = b64.dec(code.slice(1));
  if(code[0]==="z"){
    // read the decompressed stream with a size cap so a crafted link can't balloon memory
    const reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw")).getReader();
    const parts = []; let n = 0;
    for(;;){
      const {done, value} = await reader.read(); if(done) break;
      n += value.length; if(n > MAX_STATE){ reader.cancel(); throw new Error("state too large"); }
      parts.push(value);
    }
    bytes = new Uint8Array(n); let o = 0; for(const p of parts){ bytes.set(p, o); o += p.length; }
  }
  if(bytes.length > MAX_STATE) throw new Error("state too large");
  return JSON.parse(new TextDecoder().decode(bytes));
}
// Game links can be edited by anyone, so everything in one is untrusted.
// Accept a state only if every field has the right type and a sane range.
function validState(x){
  const int = (v,lo,hi)=> Number.isInteger(v) && v>=lo && v<=hi;
  const bool = v=> typeof v==="boolean";
  const obj = v=> v!==null && typeof v==="object" && !Array.isArray(v);
  if(!obj(x)) return false;
  const m = x.m===undefined ? 0 : x.m;
  if(!int(m, 0, MAPS.length-1)) return false;
  useMap(m);
  const ps = x.p;
  if(!Array.isArray(ps) || ps.length<2 || ps.length>7) return false;
  for(const p of ps){
    if(!obj(p) || typeof p.n!=="string" || !p.n.length || p.n.length>20) return false;
    if(!int(p.c,0,COLORS.length-1) || !bool(p.out) || (p.nt!==undefined && !bool(p.nt))) return false;
    if(!Array.isArray(p.cards) || p.cards.length>60 || !p.cards.every(c=>int(c,0,3))) return false;
  }
  const np = ps.length, BIG = 1e6;
  if(!Array.isArray(x.o) || x.o.length!==NT || !x.o.every(v=>int(v,0,np-1))) return false;
  if(!Array.isArray(x.a) || x.a.length!==NT || !x.a.every(v=>int(v,0,BIG))) return false;
  if(!int(x.cur,0,np-1) || !int(x.rf,0,BIG) || !int(x.trades,0,BIG) || !int(x.turn,1,1e7)) return false;
  if(!int(x.seed,-(2**31),2**31-1) || !int(x.win,-1,np-1) || !bool(x.conq)) return false;
  if(!["start","deploy","reinforce","attack","move","fortify","over"].includes(x.ph)) return false;
  if(x.mv!==null && !(obj(x.mv) && int(x.mv.f,0,NT-1) && int(x.mv.t,0,NT-1) && int(x.mv.min,0,3))) return false;
  if(x.ph==="move" && x.mv===null) return false;
  if(x.dr!==undefined && !(Array.isArray(x.dr) && x.dr.length===np && x.dr.every(v=>int(v,0,BIG)))) return false;
  if(!Array.isArray(x.log) || x.log.length>60) return false;
  for(const e of x.log) if(!Array.isArray(e) || e.length!==2 || !int(e[0],1,1e7) || typeof e[1]!=="string" || e[1].length>300) return false;
  return true;
}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("show"),2200);}

/* ===================== STATE ===================== */
let S = null;          // the shared game state (lives in the URL)
let link = "";         // current shareable URL
const UI = {view:"setup", sel:-1, tgt:-1, dice:null, undo:[], battle:null, playing:false, flash:-1, mustTrade:false};

// Seeded RNG stored in the state so reloading a link can't re-roll dice.
function rng(){
  let t = (S.seed = (S.seed + 0x6D2B79F5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const roll = ()=> 1 + Math.floor(rng()*6);
const P = i=> S.p[i];
const me = ()=> S.cur;
const owned = p=> { let n=0; for(let i=0;i<NT;i++) if(S.o[i]===p) n++; return n; };
const troops = p=> { let n=0; for(let i=0;i<NT;i++) if(S.o[i]===p) n+=S.a[i]; return n; };
const heldRegions = p=> REG.map((r,ri)=>ri).filter(ri=>regionTerr[ri].every(t=>S.o[t]===p));
function income(p){
  const base = Math.max(3, Math.floor(owned(p)/3));
  const bonus = heldRegions(p).reduce((s,ri)=>s+REG[ri].b,0);
  return {base, bonus, total:base+bonus};
}
const tradeValue = k=> k<6 ? [4,6,8,10,12,15][k] : 15 + 5*(k-5);
function log(text){ S.log.push([S.turn, text]); if(S.log.length>40) S.log.splice(0, S.log.length-40); }
function nextAlive(i){ let j=i; do{ j=(j+1)%S.p.length; }while((S.p[j].out||S.p[j].nt) && j!==i); return j; }
const humansLeft = ()=> S.p.filter(p=>!p.out && !p.nt).length;

function newGame(names, opt={}){
  const map = opt.map||0; useMap(map);
  S = {v:2, m:map, p:names.map((nm,i)=>({n:nm, c:i, cards:[], out:false})), o:Array(NT).fill(0), a:Array(NT).fill(1),
       cur:0, ph:"start", rf:0, conq:false, trades:0, seed:(Math.random()*2**31)|0, turn:1, win:-1, mv:null, log:[]};
  if(opt.neutral && names.length===2) S.p.push({n:"Neutral", c:6, cards:[], out:false, nt:true});
  const n = S.p.length;
  const order = [...Array(NT).keys()];
  for(let i=order.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [order[i],order[j]]=[order[j],order[i]]; }
  // deal starting from the last seat so later players get any extra territory
  order.forEach((t,k)=>{ S.o[t] = (n-1 - (k % n) + n) % n; });
  const total = Math.round(START_ARMIES[n] * NT / 28);
  if(opt.draft) S.dr = Array(n).fill(0);
  for(let p=0;p<n;p++){
    const mine = order.filter(t=>S.o[t]===p);
    let extra = total - mine.length;
    if(opt.draft && !S.p[p].nt){ S.dr[p] = extra; continue; }
    while(extra-->0) S.a[mine[Math.floor(rng()*mine.length)]]++;
  }
  log(`The battle for ${MAPS[map].name} begins! Turn order: ` + S.p.filter(p=>!p.nt).map(p=>"@"+p.c).join(" → ")
      + (opt.neutral && names.length===2 ? ". A neutral army holds some lands." : "")
      + (opt.draft ? " Everyone places their starting troops first." : ""));
}

// Saving is debounced: rapid taps (placing troops one by one) collapse into one
// write, which keeps compression off the hot path and stays under Safari's
// limit on history updates.
let saveTimer = 0, saveSeq = 0;
function writeLink(code){
  link = location.href.split("#")[0] + "#g=" + code;
  try{ history.replaceState(null, "", "#g=" + code); }catch(e){}
}
function save(){ clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 300); }
async function saveNow(){
  clearTimeout(saveTimer); saveTimer = 0;
  if(!S) return;
  const seq = ++saveSeq, code = await pack(S);
  if(seq === saveSeq) writeLink(code);     // ignore a slower, older write
}
// If the page is closed with a save still pending, write it synchronously.
function flushSave(){
  if(!saveTimer || !S) return;
  clearTimeout(saveTimer); saveTimer = 0; ++saveSeq;
  writeLink("j" + b64.enc(new TextEncoder().encode(JSON.stringify(S))));
}
document.addEventListener("visibilitychange", ()=>{ if(document.visibilityState==="hidden") flushSave(); });
window.addEventListener("pagehide", flushSave);

/* ===================== GAME ACTIONS ===================== */
function startTurn(){
  UI.undo = []; UI.sel = UI.tgt = -1; UI.dice = null; UI.battle = null;
  S.conq = false; S.mv = null;
  if(S.dr && S.dr[me()]>0){ S.ph = "deploy"; S.rf = S.dr[me()]; S.dr[me()] = 0; save(); return; }
  S.ph = "reinforce"; S.rf = income(me()).total;
  save();
  if(P(me()).cards.length >= 5){ UI.mustTrade = true; openCards(); }
}
function place(t, n){
  n = Math.min(n, S.rf); if(n<=0) return;
  S.a[t] += n; S.rf -= n; for(let k=0;k<n;k++) UI.undo.push(t);
  UI.flash = t; save(); render();
}
function undoPlace(){
  const t = UI.undo.pop(); if(t===undefined) return;
  S.a[t]--; S.rf++; save(); render();
}
function findSet(cards){
  let best=null;
  for(let i=0;i<cards.length;i++) for(let j=i+1;j<cards.length;j++) for(let k=j+1;k<cards.length;k++){
    const set=[cards[i],cards[j],cards[k]], nw=set.filter(c=>c!==3), wild=3-nw.length, u=new Set(nw).size;
    if(u<=1 || u===nw.length){ if(!best || wild<best.w) best={idx:[i,j,k], w:wild}; }
  }
  return best && best.idx;
}
function tradeSet(){
  const pl = P(me()), idx = findSet(pl.cards); if(!idx) return;
  const val = tradeValue(S.trades++);
  pl.cards = pl.cards.filter((_,i)=>!idx.includes(i));
  S.rf += val; log(`@${me()} traded in a card set for +${val} troops`);
  if(pl.cards.length < 5) UI.mustTrade = false;
  save(); render();
}
function toAttack(){ S.ph = "attack"; UI.sel = UI.tgt = -1; UI.undo = []; save(); render(); }
function flushBattle(){
  const b = UI.battle; if(!b) return; UI.battle = null;
  if(b.al+b.dl===0) return;
  log(`@${me()} attacked ${T[b.t].name} from ${T[b.f].name} (lost ${b.al}, killed ${b.dl})`);
}
function attackOnce(){
  const f=UI.sel, t=UI.tgt;
  if(f<0||t<0||S.a[f]<2||S.o[t]===me()) return false;
  if(!UI.battle || UI.battle.f!==f || UI.battle.t!==t){ flushBattle(); UI.battle={f,t,al:0,dl:0}; }
  const an = Math.min(3, S.a[f]-1), dn = Math.min(2, S.a[t]);
  const ad = Array.from({length:an}, roll).sort((x,y)=>y-x);
  const dd = Array.from({length:dn}, roll).sort((x,y)=>y-x);
  const res = [];
  for(let k=0;k<Math.min(an,dn);k++){
    if(ad[k]>dd[k]){ S.a[t]--; UI.battle.dl++; res.push(1); } else { S.a[f]--; UI.battle.al++; res.push(0); }
  }
  UI.dice = {ad, dd, res};
  if(S.a[t]===0){ capture(f, t, an); return false; }
  return S.a[f] >= 2;
}
function capture(f, t, dice){
  const loser = S.o[t], b = UI.battle; UI.battle = null;
  S.o[t] = me(); S.conq = true;
  log(`@${me()} conquered ${T[t].name} from @${loser}` + (b ? ` (lost ${b.al}, killed ${b.dl})` : ""));
  if(owned(loser)===0){
    P(loser).out = true;
    const got = P(loser).cards.length;
    P(me()).cards.push(...P(loser).cards); P(loser).cards = [];
    log(`@${me()} eliminated @${loser}` + (got?` and took ${got} card${got>1?"s":""}!`:"!"));
  }
  if(humansLeft()===1){
    S.a[t] = S.a[f]-1; S.a[f] = 1; S.win = me(); S.ph = "over";
    log(`🏆 @${me()} defeated every rival and wins the game!`);
    save(); UI.view = "win"; render(); showWin(); return;
  }
  S.mv = {f, t, min:Math.min(dice, S.a[f]-1)}; S.ph = "move";
  UI.flash = t; save(); render(); openMove();
}
function blitz(){
  let guard = 0;
  while(attackOnce() && guard++<200){}
  if(S.ph==="attack" && UI.sel>=0 && S.a[UI.sel]<2){ flushBattle(); UI.tgt=-1; }
  save(); render();
}
function confirmMove(n){
  const {f,t} = S.mv;
  S.a[f] -= n; S.a[t] += n; S.mv = null; S.ph = "attack";
  UI.sel = S.a[t]>=2 ? t : -1; UI.tgt = -1; UI.dice = null;
  closeSheet(); save(); render();
}
function toFortify(){ flushBattle(); S.ph = "fortify"; UI.sel = UI.tgt = -1; UI.dice = null; save(); render(); }
function reachable(f){
  const seen = new Set([f]), st=[f];
  while(st.length){ const x=st.pop(); for(const y of T[x].adj) if(!seen.has(y) && S.o[y]===me()){ seen.add(y); st.push(y); } }
  seen.delete(f); return seen;
}
function doFortify(f, t, n){
  S.a[f] -= n; S.a[t] += n;
  log(`@${me()} moved ${n} troop${n>1?"s":""} from ${T[f].name} to ${T[t].name}`);
  closeSheet(); endTurn();
}
function endTurn(){
  flushBattle();
  const pl = P(me());
  if(S.conq){ const r=rng(); pl.cards.push(r<0.07?3:Math.floor(rng()*3)); }
  if(S.ph==="deploy") log(`@${me()} placed their starting troops`);
  const prev = me();
  S.cur = nextAlive(prev); S.turn++; S.ph = "start"; S.rf = 0; S.conq = false; S.mv = null;
  UI.sel = UI.tgt = -1; UI.dice = null; UI.undo = []; UI.playing = false; UI.view = "sent";
  saveNow().then(()=>{ render(); showSent(prev); });
}

/* ===================== MAP RENDER ===================== */
const svg = $("#map"), bgsvg = $("#mapbg");
const els = {g:[], ol:[], badge:[], num:[]};
function finishMap(){
  els.g = [...svg.querySelectorAll("g.t")];
  els.ol = [...svg.querySelectorAll("path.ol")];
  els.badge = [...svg.querySelectorAll("g.badge > g")];
  els.num = els.badge.map(b=>b.querySelector("text"));
  els.bc = els.badge.map(b=>b.querySelector("circle"));
  if(window.innerWidth < 640) svg.classList.add("nonames");
}
function buildSpace(M){
  let seed = 11; const rnd = ()=> (seed = (seed*16807) % 2147483647) / 2147483647;
  const f = v=>v.toFixed(1);
  let bg = "", stars = "", rocks = "", orbits = "", suns = "", lanes = "", worm = "", planets = "", outlines = "", badges = "", names = "";
  for(let i=0;i<220;i++) stars += `<circle cx="${f(rnd()*M.w)}" cy="${f(rnd()*M.h)}" r="${f(.3+rnd()*1.1)}" opacity="${f(.25+rnd()*.7)}"/>`;
  for(const n of M.nebulas){
    bg += `<ellipse cx="${n.x}" cy="${n.y}" rx="${n.rx}" ry="${n.ry}" fill="${n.c}" opacity=".45" filter="url(#blur)"/>
           <ellipse cx="${n.x+n.rx*.2}" cy="${n.y-n.ry*.15}" rx="${n.rx*.6}" ry="${n.ry*.55}" fill="#fff" opacity=".12" filter="url(#blur)"/>`;
  }
  for(const pts of M.belts){
    for(let i=0;i<70;i++){
      const u = rnd()*(pts.length-1), k = Math.min(pts.length-2, Math.floor(u)), t = u-k;
      const x = pts[k][0] + (pts[k+1][0]-pts[k][0])*t + (rnd()-.5)*26, y = pts[k][1] + (pts[k+1][1]-pts[k][1])*t + (rnd()-.5)*10;
      const r = 1.2 + rnd()*3.2, sides = 5 + Math.floor(rnd()*3);
      const poly = Array.from({length:sides},(_,j)=>{const a=j/sides*Math.PI*2, rr=r*(.7+rnd()*.5); return f(x+rr*Math.cos(a))+","+f(y+rr*Math.sin(a));}).join(" ");
      rocks += `<polygon points="${poly}" fill="hsl(25 ${8+rnd()*14|0}% ${38+rnd()*22|0}%)"/>`;
    }
  }
  const h = M.hole;
  bg += `<circle cx="${h.x}" cy="${h.y}" r="${h.r*2.6}" fill="url(#holeGlow)"/>
    <ellipse cx="${h.x}" cy="${h.y}" rx="${h.r*2}" ry="${h.r*.55}" fill="none" stroke="url(#disk)" stroke-width="5" transform="rotate(-14 ${h.x} ${h.y})"/>
    <circle cx="${h.x}" cy="${h.y}" r="${h.r}" fill="#000" stroke="#ffb46b" stroke-opacity=".8" stroke-width="1.5"/>
    <text x="${h.x}" y="${h.y+h.r+20}" class="lbl">BLACK HOLE</text>`;
  M.sys.forEach(s=>{
    orbits += `<circle cx="${s.x}" cy="${s.y}" r="${s.ring}" fill="none" stroke="#fff" stroke-opacity=".09" stroke-width="1"/>`;
    suns += `<circle cx="${s.x}" cy="${s.y}" r="26" fill="${s.star}" opacity=".18" filter="url(#blur)"/><circle cx="${s.x}" cy="${s.y}" r="9" fill="${s.star}"/>
      <circle cx="${s.x}" cy="${s.y}" r="5" fill="#fff" opacity=".8"/>
      <text x="${s.x}" y="${s.y+20}" class="lbl sys">${esc(s.n.toUpperCase())}</text><text x="${s.x}" y="${s.y+29}" class="lbl sys">+${s.b}</text>`;
  });
  const P2 = id=>T[IDX[id]];
  M.sys.forEach((s,si)=>{ const n=s.pl.length; for(let k=0;k<n;k++){ const a=P2(si+"."+k), b=P2(si+"."+((k+1)%n));
    lanes += `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" class="lane in"/>`; } });
  for(const [x,y] of M.lanes){ const a=P2(x), b=P2(y); lanes += `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" class="lane"/>`; }
  for(const [a,b,col="#c77dff"] of M.worm) for(const id of [a,b]){ const p=P2(id);
    worm += `<g transform="translate(${f(p.x)} ${f(p.y)})"><circle r="${p.r+9}" fill="none" stroke="${col}" stroke-width="2" stroke-dasharray="6 4"/>
      <circle r="${p.r+13}" fill="none" stroke="${col}" stroke-opacity=".35" stroke-width="1"/>
      <text y="${-p.r-16}" class="lbl" style="fill:${col}">WORMHOLE</text></g>`; }
  for(const p of T){
    planets += `<g class="t" data-t="${p.i}"><circle cx="${f(p.x)}" cy="${f(p.y)}" r="${p.r+10}" fill="transparent" stroke="none"/>
      <circle class="pl" cx="${f(p.x)}" cy="${f(p.y)}" r="${p.r}"/>
      <circle cx="${f(p.x)}" cy="${f(p.y)}" r="${p.r}" fill="url(#shade)" stroke="none" pointer-events="none"/>
      ${p.ring?`<ellipse cx="${f(p.x)}" cy="${f(p.y)}" rx="${p.r*1.65}" ry="${p.r*.42}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2" transform="rotate(-20 ${f(p.x)} ${f(p.y)})" pointer-events="none"/>`:""}</g>`;
    const R2 = p.r + 4.5;
    outlines += `<path class="ol" d="M${f(p.x-R2)} ${f(p.y)}a${R2} ${R2} 0 1 0 ${2*R2} 0a${R2} ${R2} 0 1 0 ${-2*R2} 0"/>`;
    badges += `<g class="badge" transform="translate(${f(p.x)} ${f(p.y)})"><g><circle r="10.5"/><text>1</text></g></g>`;
    names += `<text class="nm" x="${f(p.x)}" y="${f(p.y+p.r+10)}">${esc(p.name)}</text>`;
  }
  let labels = "";
  for(const pts of M.belts) labels += `<text x="${pts[0][0]+8}" y="${pts[0][1]-8}" class="lbl">ASTEROID BELT</text>`;
  for(const n of M.nebulas) labels += `<text x="${n.x}" y="${n.y+3}" class="lbl" style="fill:${n.lc||"#e3c2ff"}">${n.label||"NEBULA"}</text>`;
  // Static backdrop lives in its own SVG layer: it is painted once and never
  // repainted when the game board above it changes or animates.
  bgsvg.setAttribute("viewBox", `0 0 ${M.w} ${M.h}`);
  bgsvg.innerHTML = `<defs>
    <radialGradient id="space" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#151a3a"/><stop offset="1" stop-color="#05060f"/></radialGradient>
    <radialGradient id="holeGlow"><stop offset=".35" stop-color="#000" stop-opacity=".9"/><stop offset=".55" stop-color="#ff9a3c" stop-opacity=".25"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
    <linearGradient id="disk"><stop offset="0" stop-color="#ff6b2c"/><stop offset=".5" stop-color="#ffe0a3"/><stop offset="1" stop-color="#ff6b2c"/></linearGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
  </defs>
  <rect width="${M.w}" height="${M.h}" fill="url(#space)"/>
  <g fill="#fff">${stars}</g>${bg}<g>${rocks}</g>${labels}${orbits}${suns}`;
  svg.setAttribute("viewBox", `0 0 ${M.w} ${M.h}`);
  svg.innerHTML = `<defs>
    <radialGradient id="shade" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
  </defs>
  <g>${lanes}</g>${worm}
  <g id="cells">${planets}</g><g>${outlines}</g><g>${names}</g><g>${badges}</g>`;
  finishMap();
}
function buildMap(){
  if(MAPS[mapId].space) return buildSpace(MAPS[mapId]);
  bgsvg.innerHTML = "";
  let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
  const segsTerr=[], segsReg=[], segsCoast=[];
  let groups="", outlines="", badges="", names="", lanes="";
  const labelCell = [];
  for(const t of T){
    let polys="", ol="";
    const cx = t.cells.reduce((s,[r,c])=>s+ctr(r,c)[0],0)/t.cells.length;
    const cy = t.cells.reduce((s,[r,c])=>s+ctr(r,c)[1],0)/t.cells.length;
    let best=null,bd=1e9;
    for(const [r,c] of t.cells){
      const [x,y]=ctr(r,c); const pts=[];
      for(let k=0;k<6;k++){ const p=corner(x,y,k); pts.push(p.map(v=>v.toFixed(1)).join(",")); minX=Math.min(minX,p[0]);maxX=Math.max(maxX,p[0]);minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]); }
      polys += `<polygon points="${pts.join(" ")}"/>`;
      const D=(r&1)?DIR_O:DIR_E;
      for(let k=0;k<6;k++){
        const n = at(r+D[k][0], c+D[k][1]);
        if(n===t.l) continue;
        const a=corner(x,y,k), b=corner(x,y,(k+1)%6);
        const seg=`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
        ol += seg;
        if(n===".") segsCoast.push(seg);
        else if(t.l < n){ (T[IDX[n]].reg===t.reg ? segsTerr : segsReg).push(seg); }
      }
      const d=(x-cx)**2+(y-cy)**2; if(d<bd){bd=d;best=[x,y];}
    }
    labelCell[t.i]=best;
    groups += `<g class="t" data-t="${t.i}">${polys}</g>`;
    outlines += `<path class="ol" d="${ol}"/>`;
    badges += `<g class="badge" transform="translate(${best[0].toFixed(1)} ${best[1].toFixed(1)})"><g><circle r="10.5"/><text>1</text></g></g>`;
    names += `<text class="nm" x="${best[0].toFixed(1)}" y="${(best[1]+17).toFixed(1)}">${esc(t.name)}</text>`;
  }
  for(const [x,y] of SEA){
    // connect the closest pair of cells
    let bd=1e9,bp=null;
    for(const [r1,c1] of T[IDX[x]].cells) for(const [r2,c2] of T[IDX[y]].cells){
      const p=ctr(r1,c1), q=ctr(r2,c2), d=(p[0]-q[0])**2+(p[1]-q[1])**2; if(d<bd){bd=d;bp=[p,q];}
    }
    lanes += `<line x1="${bp[0][0]}" y1="${bp[0][1]}" x2="${bp[1][0]}" y2="${bp[1][1]}"/>`;
  }
  const pad=14; minX-=pad;minY-=pad;maxX+=pad;maxY+=pad;
  svg.setAttribute("viewBox", `${minX.toFixed(0)} ${minY.toFixed(0)} ${(maxX-minX).toFixed(0)} ${(maxY-minY).toFixed(0)}`);
  svg.innerHTML = `
  <defs>
    <radialGradient id="sea" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="var(--water1)"/><stop offset="1" stop-color="var(--water2)"/></radialGradient>
    <pattern id="waves" width="28" height="14" patternUnits="userSpaceOnUse"><path d="M0 7 q7 -5 14 0 t14 0" fill="none" stroke="#ffffff" stroke-opacity=".05" stroke-width="1.2"/></pattern>
  </defs>
  <rect x="${minX}" y="${minY}" width="${maxX-minX}" height="${maxY-minY}" fill="url(#sea)"/>
  <rect x="${minX}" y="${minY}" width="${maxX-minX}" height="${maxY-minY}" fill="url(#waves)"/>
  <g stroke="#cfe3ff" stroke-opacity=".55" stroke-width="1.6" stroke-dasharray="3 4" stroke-linecap="round">${lanes}</g>
  <g id="cells">${groups}</g>
  <path d="${segsTerr.join("")}" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1.1" pointer-events="none"/>
  <path d="${segsReg.join("")}" fill="none" stroke="#0b1220" stroke-width="3" stroke-linecap="round" pointer-events="none"/>
  <path d="${segsCoast.join("")}" fill="none" stroke="#f3e7c4" stroke-opacity=".75" stroke-width="1.8" stroke-linecap="round" pointer-events="none"/>
  <g>${outlines}</g>
  <g>${names}</g>
  <g>${badges}</g>`;
  finishMap();
}

function paintMap(){
  if(!S) return;
  const active = UI.playing && S.win<0;
  let ok = new Set(), dimOthers = false;
  if(active && S.ph==="attack" && UI.sel>=0){ for(const n of T[UI.sel].adj) if(S.o[n]!==me()) ok.add(n); dimOthers=true; }
  if(active && S.ph==="fortify" && UI.sel>=0){ ok = reachable(UI.sel); dimOthers=true; }
  for(let i=0;i<NT;i++){
    const col = COLORS[P(S.o[i]).c];
    els.g[i].style.fill = col; els.g[i].style.stroke = col;
    els.g[i].classList.toggle("dim", dimOthers && i!==UI.sel && !ok.has(i));
    els.num[i].textContent = S.a[i];
    els.bc[i].style.stroke = col;
    let cls = "ol";
    if(active){
      if(i===UI.sel) cls+=" sel";
      else if(i===UI.tgt) cls+=" hit";
      else if(ok.has(i)) cls+= S.ph==="attack" ? " tgt" : " ok";
    }
    els.ol[i].setAttribute("class", cls);
  }
  if(UI.flash>=0){ const b=els.badge[UI.flash]; b.classList.remove("pop"); void b.getBBox(); b.classList.add("pop"); UI.flash=-1; }
}

/* ===================== PANEL / UI ===================== */
const pname = i=> `<span class="pn" style="color:${TEXT_COLORS[P(i).c]}">${esc(P(i).n)}</span>`;
const fmt = s=> esc(s).replace(/@(\d)/g, (_,i)=> S.p[+i] ? pname(+i) : "?");
function steps(){
  const k = {reinforce:0, attack:1, move:1, fortify:2}[S.ph] ?? 0;
  return `<div class="steps">${[0,1,2].map(i=>`<i class="${i<=k?"on":""}"></i>`).join("")}</div>`;
}
function diceHtml(){
  const d=UI.dice; if(!d) return "";
  const a=d.ad.map((v,k)=>`<div class="die a ${d.res[k]===0?"lose":""}">${v}</div>`).join("");
  const b=d.dd.map((v,k)=>`<div class="die d ${d.res[k]===1?"lose":""}">${v}</div>`).join("");
  return `<div class="dice">${a}<span class="vs">vs</span>${b}</div>`;
}
function renderTop(){
  const ti=$("#turninfo");
  if(!S){ ti.innerHTML=""; return; }
  const c=P(S.cur);
  ti.innerHTML = S.win>=0 ? `<span class="dot" style="background:${COLORS[P(S.win).c]}"></span><b>${esc(P(S.win).n)} won!</b>`
    : `Turn ${S.turn} <span class="dot" style="background:${COLORS[c.c]}"></span><b>${esc(c.n)}</b>`;
}
function renderPlayers(){
  if(!S){ $("#players").innerHTML=""; return; }
  $("#players").innerHTML = S.p.map((p,i)=>`<div class="pchip ${i===S.cur&&S.win<0?"cur":""} ${p.out?"out":""}">
    <span class="dot" style="background:${COLORS[p.c]}"></span>${esc(p.n)} <small>${owned(i)}🏳 ${troops(i)}⚔${p.nt?"":" "+p.cards.length+"🃏"}</small></div>`).join("");
}
function renderPanel(){
  const el = $("#panel");
  if(!S){ el.innerHTML=""; return; }
  if(S.win>=0){ el.innerHTML = `<div class="ph">Game over</div><div class="msg">${pname(S.win)} rules the isles! 🏆</div>
      <div class="row"><button class="btn primary" data-act="sharewin">Share result</button><button class="btn" data-act="newgame">New game</button></div>`; return; }
  if(!UI.playing){
    el.innerHTML = `<div class="ph">Watching</div><div class="msg">It's ${pname(S.cur)}'s turn.</div>
      <div class="row"><button class="btn primary" data-act="claim">I'm ${esc(P(S.cur).n)} — play</button><button class="btn" data-act="share">Send link</button></div>`; return;
  }
  const sel = UI.sel>=0 ? T[UI.sel] : null;
  let h = S.ph==="deploy" ? "" : steps();
  if(S.ph==="deploy"){
    h += `<div class="ph">Setup · Starting troops</div>`;
    h += S.rf>0 ? `<div class="msg">Place your <b>${S.rf}</b> starting troop${S.rf>1?"s":""}. Tap your territories to add one at a time.</div>
      <div class="row">${sel?`<button class="btn primary" data-act="placeall">All ${S.rf} → ${esc(sel.name)}</button>`:""}
        <button class="btn" data-act="undo" ${UI.undo.length?"":"disabled"}>Undo</button></div>
      <div class="hint">No attacking this round. Battles start once everyone has set up.</div>`
      : `<div class="msg">All set up.</div><div class="row"><button class="btn" data-act="undo" ${UI.undo.length?"":"disabled"}>Undo</button>
        <button class="btn primary" data-act="endturn">Done &amp; send</button></div>`;
  } else if(S.ph==="reinforce"){
    const inc = income(me()), cards=P(me()).cards.length, canTrade=!!findSet(P(me()).cards);
    h += `<div class="ph">1 · Reinforce</div>`;
    if(S.rf>0){
      h += `<div class="msg">Place <b>${S.rf}</b> troop${S.rf>1?"s":""}. Tap your territories to add one at a time.</div>
      <div class="row">
        ${sel?`<button class="btn primary" data-act="placeall">All ${S.rf} → ${esc(sel.name)}</button>`:""}
        <button class="btn" data-act="undo" ${UI.undo.length?"":"disabled"}>Undo</button>
        <button class="btn ${canTrade?"primary":""}" data-act="cards">Cards (${cards})${canTrade?" ✓":""}</button>
      </div>
      <div class="hint">Income: ${inc.base} from territories${inc.bonus?` + ${inc.bonus} region bonus`:""}.</div>`;
    } else {
      h += `<div class="msg">All troops placed.</div>
      <div class="row"><button class="btn" data-act="undo" ${UI.undo.length?"":"disabled"}>Undo</button>
        <button class="btn primary" data-act="toattack">Attack →</button></div>`;
    }
  } else if(S.ph==="attack" || S.ph==="move"){
    h += `<div class="ph">2 · Attack</div>`;
    if(!sel){
      h += `${diceHtml()}<div class="msg">Tap one of your territories with 2+ troops to attack from.</div>
        <div class="row"><button class="btn primary" data-act="tofortify">Done attacking →</button></div>`;
    } else if(UI.tgt<0){
      h += `${diceHtml()}<div class="msg">From <b>${esc(sel.name)}</b> (${S.a[sel.i]}). Tap a flashing enemy neighbor.</div>
        <div class="row"><button class="btn ghost" data-act="cancel">Cancel</button><button class="btn" data-act="tofortify">Done attacking →</button></div>`;
    } else {
      const tg=T[UI.tgt], an=Math.min(3,S.a[sel.i]-1);
      h += `<div class="msg"><b>${esc(sel.name)}</b> (${S.a[sel.i]}) ⚔️ ${pname(S.o[tg.i])}'s <b>${esc(tg.name)}</b> (${S.a[tg.i]})</div>${diceHtml()}
        <div class="row"><button class="btn red" data-act="roll">Roll ${an} 🎲</button><button class="btn primary" data-act="blitz">Blitz ⚡</button><button class="btn ghost" data-act="cancel">Stop</button></div>
        <div class="hint">Blitz keeps rolling until you win or run out of troops.</div>`;
    }
  } else if(S.ph==="fortify"){
    h += `<div class="ph">3 · Fortify</div>`;
    h += sel ? `<div class="msg">Move troops from <b>${esc(sel.name)}</b> to a highlighted territory you control.</div>
      <div class="row"><button class="btn ghost" data-act="cancel">Cancel</button><button class="btn primary" data-act="endturn">End turn</button></div>`
      : `<div class="msg">Optionally move troops once between connected territories, then end your turn.</div>
      <div class="row"><button class="btn primary" data-act="endturn">End turn &amp; send</button></div>`;
  }
  el.innerHTML = h;
}
function render(){ renderTop(); paintMap(); renderPanel(); renderPlayers(); }

/* ===================== SHEETS ===================== */
function openSheet(html, dismissable=true){
  $("#sheet").innerHTML = html; $("#overlay").hidden = false; $("#overlay").dataset.dismiss = dismissable?"1":"";
}
function closeSheet(){ $("#overlay").hidden = true; }
$("#overlay").addEventListener("click", e=>{ if(e.target.id==="overlay" && $("#overlay").dataset.dismiss) closeSheet(); });

function logHtml(entries){
  if(!entries.length) return `<p>Nothing yet.</p>`;
  return `<ul class="log">${entries.map(([tn,s])=>`<li><span class="tn">T${tn}</span>${fmt(s)}</li>`).join("")}</ul>`;
}
function showPass(){
  const c=S.cur, alive=humansLeft();
  const recent = S.log.filter(([tn])=>tn > S.turn - alive);
  const mid = S.ph!=="start";
  openSheet(`<h2>${mid?"Turn in progress":"Your move"}, ${pname(c)}</h2>
    <p>Turn ${S.turn}. ${mid?"Pick up where you left off.":"Pass the phone or open this on "+esc(P(c).n)+"'s device."}</p>
    <h3>Since your last turn</h3>${logHtml(recent.slice(-12))}
    <div class="row" style="margin-top:14px"><button class="btn primary" data-act="claim">I'm ${esc(P(c).n)} — ${mid?"continue":"start turn"}</button></div>
    <div class="row" style="margin-top:8px"><button class="btn" data-act="watch">Just look</button><button class="btn" data-act="share">Not me — send to ${esc(P(c).n)}</button></div>`, false);
}
function showSent(prev){
  const nx=S.cur;
  openSheet(`<h2>Turn done ✅</h2>
    <p>Now send the game to ${pname(nx)} so they can take their turn.</p>
    <div class="row" style="margin-top:14px"><button class="btn primary" data-act="share">Send to ${esc(P(nx).n)} 💬</button></div>
    <div class="row" style="margin-top:8px"><button class="btn" data-act="copy">Copy link</button><button class="btn" data-act="watch">View map</button></div>
    <div class="hint">Playing on one phone? Hand it over and tap “View map”, then “I'm ${esc(P(nx).n)}”.</div>`, false);
}
function showWin(){
  openSheet(`<h2>🏆 ${pname(S.win)} wins!</h2><p>Every territory has fallen. Total domination in ${S.turn} turns.</p>
    <div class="row" style="margin-top:14px"><button class="btn primary" data-act="sharewin">Send the result 💬</button></div>
    <div class="row" style="margin-top:8px"><button class="btn" data-act="newgame">New game</button><button class="btn" data-act="close">View map</button></div>`);
}
function openCards(){
  const pl=P(me()), idx=findSet(pl.cards)||[], canTrade = UI.playing && S.ph==="reinforce" && idx.length;
  const must = UI.mustTrade && pl.cards.length>=5;
  openSheet(`<h2>Your cards</h2>
    <p>Trade 3 matching cards, or one of each, for bonus troops. ⭐ is wild. Next set is worth <b style="color:var(--accent)">+${tradeValue(S.trades)}</b>.</p>
    ${must?`<p style="color:var(--danger)">You have 5+ cards — you must trade a set now.</p>`:""}
    <div class="cards">${pl.cards.length?pl.cards.map((c,i)=>`<div class="cardx ${idx.includes(i)?"on":""}"><div>${CARD_ICONS[c]}<small>${CARD_NAMES[c]}</small></div></div>`).join(""):"<p>No cards yet. Conquer at least one territory in a turn to earn one.</p>"}</div>
    <div class="row">${canTrade?`<button class="btn primary" data-act="trade">Trade for +${tradeValue(S.trades)}</button>`:""}
    ${must?"":`<button class="btn" data-act="close">Close</button>`}</div>`, !must);
}
function amountSheet(title, desc, min, max, def, act){
  openSheet(`<h2>${title}</h2><p>${desc}</p>
    <div class="big" id="amt">${def}</div>
    <input type="range" id="amtR" min="${min}" max="${max}" value="${def}" ${min===max?"disabled":""}>
    <div class="row" style="margin-top:10px"><button class="btn" data-act="amt" data-v="min">Min</button><button class="btn" data-act="amt" data-v="-1">−</button><button class="btn" data-act="amt" data-v="1">+</button><button class="btn" data-act="amt" data-v="max">Max</button></div>
    <div class="row" style="margin-top:10px">${act==="fort"?`<button class="btn ghost" data-act="fcancel">Cancel</button>`:""}<button class="btn primary" data-act="${act}">Move</button></div>`, act==="fort");
  const r=$("#amtR"); r.oninput=()=>{$("#amt").textContent=r.value;};
}
function openMove(){
  const {f,t,min}=S.mv, max=S.a[f]-1;
  amountSheet(`Captured ${esc(T[t].name)}! 🎉`, `How many troops move in from ${esc(T[f].name)}?`, min, max, max, "mv");
}
function openFortify(f,t){
  UI.tgt = t;
  amountSheet(`Fortify`, `Move troops from ${esc(T[f].name)} to ${esc(T[t].name)}. This ends your turn.`, 1, S.a[f]-1, S.a[f]-1, "fort");
}
function showMenu(){
  openSheet(`<h2>Menu</h2><div class="menu">
    ${S?`<button class="btn" data-act="logall">📜 Battle log</button><button class="btn" data-act="regions">🗺️ Regions &amp; bonuses</button>
    <button class="btn" data-act="copy">🔗 Copy game link</button><button class="btn" data-act="togglenames">🏷️ Toggle territory names</button>`:""}
    <button class="btn" data-act="rules">📖 How to play</button>
    <button class="btn" data-act="newgame">✨ New game</button>
    <button class="btn ghost" data-act="close">Close</button></div>`);
}
function showRegions(){
  openSheet(`<h2>Regions</h2><p>Hold every territory in a region at the start of your turn to earn its bonus.</p>
    <table class="reg">${REG.map((r,ri)=>{const own=S&&regionTerr[ri].every(t=>S.o[t]===S.o[regionTerr[ri][0]])?S.o[regionTerr[ri][0]]:-1;
      return `<tr><td><b>${r.n}</b> <small style="color:var(--muted)">(${regionTerr[ri].length})</small>${own>=0?` · ${pname(own)}`:""}<br><small style="color:var(--muted)">${regionTerr[ri].map(t=>esc(T[t].name)).join(", ")}</small></td><td>+${r.b}</td></tr>`;}).join("")}</table>
    <div class="row" style="margin-top:12px"><button class="btn" data-act="close">Close</button></div>`);
}
function showRules(){
  openSheet(`<h2>How to play</h2><ol class="rules">
    <li><b>Goal:</b> knock out every rival player. You don't have to wipe out the gray neutral army.</li>
    <li><b>Setup:</b> territories are dealt at random. Starting troops are either scattered randomly or, if you chose “place them yourselves”, each player spends their first turn placing them.</li>
    <li><b>Reinforce:</b> each turn you get troops = your territories ÷ 3 (min 3), plus region bonuses, plus card sets.</li>
    <li><b>Attack:</b> pick one of your territories with 2+ troops, then a neighboring enemy. Dashed lines are sea lanes. You roll up to 3 dice, the defender up to 2. Highest dice are compared in pairs — the higher die wins, ties go to the defender.</li>
    <li><b>Capture:</b> when a territory hits 0 troops it's yours. Move in at least as many troops as dice you rolled.</li>
    <li><b>Space map:</b> you can only fly along the dotted routes. The black hole, asteroid belts and nebulas block the way, so sometimes you have to go around. A purple wormhole links two far-apart planets.</li>
    <li><b>Fortify:</b> once per turn, move troops between two of your territories connected through your own land.</li>
    <li><b>Cards:</b> conquer at least one territory in a turn to earn a card. Trade sets for growing bonuses (4, 6, 8, 10, 12, 15, then +5). Eliminate a player to take their cards.</li>
    <li><b>Texting:</b> when you end your turn, tap “Send” and pick your group chat or friend. The whole game lives in the link — whoever's turn it is just taps it.</li>
    <li><b>No take-backs:</b> dice are pre-seeded in the link, so reopening an old link replays the same rolls.</li>
    </ol><div class="row"><button class="btn" data-act="close">Got it</button></div>`);
}
const setupOpt = {map:0, draft:false, neutral:true};
function seg(k, opts){
  return `<div class="seg">${opts.map(([v,l])=>`<button class="${setupOpt[k]===v?"on":""}" data-act="opt" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
}
function showSetup(){
  const names = (showSetup.names ||= ["",""]);
  openSheet(`<h2>New game</h2><p>2–6 players. Territories are dealt at random, then you take turns by texting the link.</p>
    ${names.map((n,i)=>`<div class="prow"><span class="dot" style="background:${COLORS[i]}"></span><input type="text" maxlength="14" placeholder="${CNAMES[i]} player name" value="${esc(n)}" data-i="${i}">${names.length>2?`<button class="x" data-act="rmp" data-i="${i}" aria-label="Remove">×</button>`:""}</div>`).join("")}
    ${names.length<6?`<div class="row" style="margin-top:6px"><button class="btn ghost" data-act="addp">+ Add player</button></div>`:""}
    <h3>Map</h3>${seg("map",[[0,"Islands · 28"],[1,"Grand · 42"],[2,"Space · 30"],[3,"Galaxy · 48"]])}
    <h3>Starting troops</h3>${seg("draft",[[false,"Random"],[true,"Place them yourselves"]])}
    ${names.length===2?`<h3>Neutral army</h3>${seg("neutral",[[true,"On"],[false,"Off"]])}<div class="hint">A gray army that holds some territory and never attacks. Makes 2-player games less of a race.</div>`:""}
    <div class="row" style="margin-top:16px"><button class="btn primary" data-act="start">Start game</button></div>
    <div class="hint">The first name goes first. <a href="#" data-act="rules" style="color:var(--accent)">How to play</a></div>`, !!S);
  $("#sheet").querySelectorAll("input[data-i]").forEach(inp=>inp.oninput=()=>{names[+inp.dataset.i]=inp.value;});
}

/* ===================== SHARING ===================== */
async function share(text){
  await saveNow();
  if(navigator.share){
    try{ await navigator.share({title:"Overrun", text, url:link}); return; }
    catch(e){ if(e && e.name==="AbortError") return; }
  }
  copy();
}
async function copy(){
  await saveNow();
  try{ await navigator.clipboard.writeText(link); toast("Link copied — paste it in your chat"); }
  catch(e){ prompt("Copy this link:", link); }
}

/* ===================== INPUT ===================== */
svg.addEventListener("click", e=>{
  const g = e.target.closest("g.t"); if(!g || !S || !UI.playing || S.win>=0) return;
  const t = +g.dataset.t, mine = S.o[t]===me();
  if(S.ph==="reinforce" || S.ph==="deploy"){
    if(!mine) return toast("That's not your territory");
    if(S.rf<=0) return toast(S.ph==="deploy" ? "All troops placed — tap Done" : "All troops placed — tap Attack →");
    UI.sel = t; place(t,1); return;
  }
  if(S.ph==="attack"){
    if(mine){
      if(t===UI.sel){ flushBattle(); UI.sel=UI.tgt=-1; }
      else if(S.a[t]<2) toast("Needs at least 2 troops to attack");
      else { flushBattle(); UI.sel=t; UI.tgt=-1; UI.dice=null; }
    } else {
      if(UI.sel<0) toast("First tap one of your territories");
      else if(!T[UI.sel].adj.has(t)) toast(`${T[t].name} isn't next to ${T[UI.sel].name}`);
      else { if(UI.tgt!==t) UI.dice=null; UI.tgt=t; }
    }
    render(); return;
  }
  if(S.ph==="fortify"){
    if(!mine) return toast("Pick your own territories to fortify");
    if(UI.sel<0 || t===UI.sel){
      if(t===UI.sel){ UI.sel=-1; }
      else if(S.a[t]<2) toast("Needs at least 2 troops to move from");
      else UI.sel=t;
    } else if(reachable(UI.sel).has(t)) { openFortify(UI.sel,t); }
    else if(S.a[t]>=2){ UI.sel=t; } else toast("Not connected through your territory");
    render();
  }
});

document.addEventListener("click", e=>{
  const b = e.target.closest("[data-act]"); if(!b) return;
  const act = b.dataset.act; if(b.tagName==="A") e.preventDefault();
  switch(act){
    case "close": closeSheet(); if(UI.view==="win") render(); break;
    case "claim": UI.playing=true; UI.view="play"; closeSheet(); if(S.ph==="start") startTurn(); else if(S.ph==="move") { render(); openMove(); return; } render(); break;
    case "watch": UI.playing=false; UI.view="play"; closeSheet(); render(); break;
    case "share": share(`${P(S.cur).n}, it's your turn in Overrun! ⚔️`); break;
    case "sharewin": share(`${P(S.win).n} won our game of Overrun! 🏆`); break;
    case "copy": copy(); break;
    case "placeall": if(UI.sel>=0) place(UI.sel, S.rf); break;
    case "undo": undoPlace(); break;
    case "cards": openCards(); break;
    case "trade": tradeSet(); if(UI.mustTrade) openCards(); else closeSheet(); break;
    case "toattack": toAttack(); break;
    case "cancel": flushBattle(); UI.sel=UI.tgt=-1; UI.dice=null; closeSheet(); render(); break;
    case "roll": { const ok=attackOnce(); if(S.ph==="attack"){ if(!ok && UI.sel>=0 && S.a[UI.sel]<2){ flushBattle(); UI.tgt=-1; toast("Out of troops to attack with"); } save(); render(); } break; }
    case "blitz": blitz(); break;
    case "tofortify": toFortify(); break;
    case "endturn": endTurn(); break;
    case "amt": { const r=$("#amtR"); let v=+r.value; const d=b.dataset.v;
      v = d==="min"?+r.min : d==="max"?+r.max : Math.max(+r.min, Math.min(+r.max, v + +d)); r.value=v; $("#amt").textContent=v; break; }
    case "mv": confirmMove(+$("#amtR").value); break;
    case "fcancel": UI.tgt=-1; closeSheet(); render(); break;
    case "fort": doFortify(UI.sel, UI.tgt, +$("#amtR").value); break;
    case "menu": showMenu(); break;
    case "logall": openSheet(`<h2>Battle log</h2>${logHtml(S.log.slice().reverse())}<div class="row"><button class="btn" data-act="close">Close</button></div>`); break;
    case "regions": showRegions(); break;
    case "togglenames": svg.classList.toggle("nonames"); closeSheet(); break;
    case "rules": showRules(); break;
    case "newgame": showSetup.names = S ? S.p.map(p=>p.n) : ["",""]; showSetup(); break;
    case "opt": { const k=b.dataset.k, v=b.dataset.v; setupOpt[k] = k==="map" ? +v : v==="true"; showSetup(); break; }
    case "addp": showSetup.names.push(""); showSetup(); break;
    case "rmp": showSetup.names.splice(+b.dataset.i,1); showSetup(); break;
    case "start": {
      const names = showSetup.names.map((n,i)=>n.trim() || CNAMES[i]);
      if(new Set(names.map(n=>n.toLowerCase())).size!==names.length) return toast("Give everyone a different name");
      newGame(names, setupOpt); UI.playing=false; UI.view="pass"; saveNow().then(()=>{ render(); showPass(); });
      break; }
  }
});
$("#menuBtn").addEventListener("click", showMenu);
$("#zoomBtn").addEventListener("click", ()=>{
  const w=$("#mapwrap"), on=w.classList.toggle("zoom");
  $("#zoomBtn").textContent = on ? "↩" : "🔍"; $("#zoomBtn").setAttribute("aria-label", on ? "Fit map" : "Zoom map");
  if(on && UI.sel>=0){ const b=els.badge[UI.sel].getBoundingClientRect(), r=w.getBoundingClientRect(); w.scrollLeft += b.left - r.left - r.width/2; w.scrollTop += b.top - r.top - r.height/2; }
  else if(on){ w.scrollLeft = (w.scrollWidth - w.clientWidth)/2; }
});

/* ===================== BOOT ===================== */
async function load(){
  const m = location.hash.match(/g=([^&]+)/);
  if(!m){ S=null; render(); showSetup(); return; }
  try{
    const st = await unpack(m[1]);
    if(!validState(st)) throw new Error("invalid game state");
    S = st;
    link = location.href;
    UI.playing=false; UI.sel=UI.tgt=-1; UI.dice=null; UI.undo=[];
    render();
    if(S.win>=0){ UI.view="win"; showWin(); } else { UI.view="pass"; showPass(); }
  }catch(err){
    console.warn("Could not load game link:", err.message); S=null; render();
    openSheet(`<h2>Hmm, that link looks broken</h2><p>The game link may have been cut off when it was copied. Ask for it to be sent again, or start a new game.</p>
      <div class="row"><button class="btn primary" data-act="newgame">New game</button></div>`, false);
  }
}
window.addEventListener("hashchange", load);
// Last-resort safety net: if anything unexpected goes wrong, say so instead of
// silently freezing. The game itself is safe in the link.
let lastErrorToast = 0;
function onUnexpected(){
  if(Date.now() - lastErrorToast < 4000) return;
  lastErrorToast = Date.now();
  toast("Something went wrong. Your game is saved in the link. Try reopening it.");
}
window.addEventListener("error", onUnexpected);
window.addEventListener("unhandledrejection", onUnexpected);
useMap(0);
load();
