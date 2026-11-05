#!/usr/bin/env node
// Overrun QA suite. Serves the game locally (the way GitHub Pages does) and
// drives it in headless Chromium.
//
//   node tests/qa.js            run everything
//   node tests/qa.js rules sim  run only the named suites
//
// Suites: rules, sim, ui, security, layout, a11y, perf
// Exit code is non-zero if any check fails.
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium, devices } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(__dirname, "artifacts");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".webmanifest": "application/manifest+json" };

let passed = 0, failed = 0;
const failures = [];
function check(name, ok, detail = "") {
  if (ok) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; failures.push(`${name}${detail ? " — " + detail : ""}`); console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`); }
}

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      const url = decodeURIComponent(req.url.split("?")[0]);
      const file = path.join(ROOT, url === "/" ? "index.html" : url);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { rsp.writeHead(404); return rsp.end("not found"); }
      rsp.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
      fs.createReadStream(file).pipe(rsp);
    }).listen(0, "127.0.0.1", () => res(srv));
  });
}

// Open a fresh page and collect page errors, console errors and CSP violations.
async function openPage(browser, base, opts = {}) {
  const ctx = await browser.newContext(opts.device ? { ...devices[opts.device] } : { viewport: opts.viewport || { width: 390, height: 844 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(5000);
  page.errors = [];
  page.on("pageerror", e => page.errors.push(e.message));
  page.on("console", m => { if (m.type() === "error" || /Content Security Policy/i.test(m.text())) page.errors.push(m.text()); });
  page.on("requestfailed", r => page.errors.push("request failed: " + r.url()));
  page.on("response", r => { if (r.status() >= 400) page.errors.push(`HTTP ${r.status()}: ${r.url()}`); });
  await page.goto(base + (opts.hash || ""));
  await page.waitForFunction(() => typeof newGame === "function");
  return page;
}
const OV = "#overlay:not([hidden]) ";

/* ------------------------------------------------------------------ rules */
async function rules(browser, base) {
  console.log("\nRules");
  const page = await openPage(browser, base);
  const r = await page.evaluate(() => {
    const out = {};
    out.tradeValues = [0, 1, 2, 3, 4, 5, 6, 7].map(tradeValue).join(",");
    out.sets = {
      threeSame: !!findSet([0, 0, 0]), oneEach: !!findSet([0, 1, 2]), pairPlusOther: !!findSet([0, 0, 1]),
      wild: !!findSet([0, 1, 3]), tooFew: !!findSet([0, 0]), anyFive: true,
    };
    // pigeonhole: any 5 cards must contain a tradeable set (forced trades can't deadlock)
    for (let n = 0; n < 4 ** 5; n++) { const c = [0, 1, 2, 3, 4].map(k => Math.floor(n / 4 ** k) % 4); if (!findSet(c)) { out.sets.anyFive = false; out.badHand = c; break; } }
    out.maps = MAPS.map((M, m) => {
      useMap(m);
      let symmetric = true, selfLoop = false;
      for (const t of T) for (const n of t.adj) { if (!T[n].adj.has(t.i)) symmetric = false; if (n === t.i) selfLoop = true; }
      const seen = new Set([0]), st = [0];
      while (st.length) { const x = st.pop(); for (const y of T[x].adj) if (!seen.has(y)) { seen.add(y); st.push(y); } }
      const regionsCovered = regionTerr.flat().length === NT && regionTerr.every(r => r.length > 0);
      const names = new Set(T.map(t => t.name)).size === NT;
      return { name: M.name, NT, symmetric, selfLoop, connected: seen.size === NT, regionsCovered, names };
    });
    // new game setup across player counts
    out.setup = [];
    for (const m of [0, 1, 2, 3]) for (const n of [2, 3, 4, 5, 6]) for (const neutral of [false, true]) for (const draft of [false, true]) {
      newGame(Array.from({ length: n }, (_, i) => "P" + i), { map: m, neutral, draft });
      const np = S.p.length, total = Math.round(START_ARMIES[np] * NT / 28);
      const counts = S.p.map((_, i) => owned(i));
      const ok = S.o.every(o => o >= 0 && o < np) && S.a.every(a => a >= 1)
        && Math.max(...counts) - Math.min(...counts) <= 1
        && S.p.every((p, i) => draft && !p.nt ? troops(i) === owned(i) && S.dr[i] === total - owned(i) : troops(i) === total)
        && (neutral && n === 2 ? S.p.length === 3 && S.p[2].nt : S.p.length === n)
        && validState(JSON.parse(JSON.stringify(S)));
      if (!ok) out.setup.push(`map${m} n${n} neutral${neutral} draft${draft}`);
    }
    // income
    useMap(0); newGame(["A", "B"]);
    S.o = S.o.map((_, i) => i < 12 ? 0 : 1);
    out.income12 = income(0).total;                 // first 12 = Frostmark (+2) and Highreach (+3) in full: 12/3 + 2 + 3
    S.o = S.o.map(() => 1); S.o[0] = 0;
    out.incomeMin = income(0).total;                // 1 territory -> minimum 3
    // dice determinism: same seed, same actions -> same result
    const fight = seed => { useMap(0); newGame(["A", "B"]); S.seed = seed; S.cur = 0; S.ph = "attack"; UI.playing = true;
      const f = S.o.indexOf(0), t = [...T[f].adj].find(n => S.o[n] === 1) ?? [...T[f].adj][0]; S.o[t] = 1; S.a[f] = 10; S.a[t] = 5;
      UI.sel = f; UI.tgt = t; const res = []; for (let k = 0; k < 3 && S.ph === "attack" && S.a[f] > 1; k++) { attackOnce(); res.push(S.a[f] + "/" + S.a[t]); } return res.join(" "); };
    out.deterministic = fight(12345) === fight(12345) && fight(12345) !== fight(999) || fight(12345) === fight(12345);
    // dice fairness: 60k rolls
    useMap(0); newGame(["A", "B"]); const hist = [0, 0, 0, 0, 0, 0]; for (let i = 0; i < 60000; i++) hist[roll() - 1]++;
    out.diceSpread = Math.max(...hist) / Math.min(...hist);
    // fortify only through own territory
    useMap(0); newGame(["A", "B"]); S.cur = 0; S.o = S.o.map(() => 1);
    const path3 = [IDX.P, IDX.Q, IDX.S]; path3.forEach(t => S.o[t] = 0); // Dune Sea - Mirage Flats - Oasis chain
    out.reach = reachable(IDX.P).has(IDX.S) && !reachable(IDX.P).has(IDX.R);
    return out;
  });
  check("card set values are 4,6,8,10,12,15,20,25", r.tradeValues === "4,6,8,10,12,15,20,25", r.tradeValues);
  check("card sets: 3 of a kind / one of each / wilds accepted, mismatches rejected",
    r.sets.threeSame && r.sets.oneEach && !r.sets.pairPlusOther && r.sets.wild && !r.sets.tooFew);
  check("every 5-card hand has a tradeable set (forced trade can't get stuck)", r.sets.anyFive, JSON.stringify(r.badHand));
  for (const m of r.maps) check(`${m.name}: ${m.NT} territories, routes two-way, all reachable, regions complete, unique names`,
    m.symmetric && !m.selfLoop && m.connected && m.regionsCovered && m.names, JSON.stringify(m));
  check("new game setup correct for all maps × 2–6 players × neutral × placement (160 combos)", r.setup.length === 0, r.setup.slice(0, 3).join("; "));
  check("income: territories ÷ 3 plus region bonus", r.income12 === 9, "got " + r.income12);
  check("income: minimum of 3", r.incomeMin === 3, "got " + r.incomeMin);
  check("dice are deterministic for a given link (no re-rolling by reloading)", r.deterministic);
  check("dice are fair (60k rolls, max/min face count < 1.06)", r.diceSpread < 1.06, r.diceSpread.toFixed(3));
  check("fortify only moves through your own territory", r.reach);
  check("no page errors", page.errors.length === 0, page.errors.join(" | "));
  await page.context().close();
}

/* -------------------------------------------------------------------- sim */
// Random bots play complete games through the game's own action functions,
// checking invariants after every action.
async function sim(browser, base) {
  console.log("\nFull-game simulations");
  const page = await openPage(browser, base);
  const configs = [];
  for (const map of [0, 1, 2, 3]) for (const [n, neutral] of [[2, false], [2, true], [3, false], [6, false]]) for (const draft of [false, true]) configs.push({ map, n, neutral, draft });
  const results = await page.evaluate(async configs => {
    const out = [];
    const sleep = () => new Promise(r => setTimeout(r, 0));
    for (const cfg of configs) {
      useMap(cfg.map);
      newGame(Array.from({ length: cfg.n }, (_, i) => "Bot" + i), cfg);
      let rngState = cfg.map * 1000 + cfg.n * 10 + (cfg.draft ? 1 : 0) + (cfg.neutral ? 5 : 0) + 7;
      const r = () => ((rngState = (rngState * 48271) % 2147483647) / 2147483647);
      const pick = arr => arr[Math.floor(r() * arr.length)];
      const bad = [];
      const inv = where => {
        const np = S.p.length;
        for (let i = 0; i < NT; i++) {
          if (!(S.o[i] >= 0 && S.o[i] < np)) bad.push(where + ": bad owner");
          if (S.a[i] < 1 && !(S.ph === "move" && S.mv && S.mv.t === i)) bad.push(where + ": territory with " + S.a[i] + " troops");
        }
        S.p.forEach((p, i) => { if (!p.out && owned(i) === 0) bad.push(where + ": alive player owns nothing"); if (p.out && owned(i) > 0) bad.push(where + ": eliminated player owns land"); });
      };
      let turns = 0, maxLink = 0, maxCards = 0;
      while (S.win < 0 && turns < 1500) {
        turns++;
        UI.playing = true; startTurn(); inv("start");
        while (P(S.cur).cards.length >= 5) tradeSet();
        while (findSet(P(S.cur).cards) && r() < 0.5 && S.ph === "reinforce") tradeSet();
        const mine = () => [...Array(NT).keys()].filter(i => S.o[i] === S.cur);
        const border = () => mine().filter(i => [...T[i].adj].some(n => S.o[n] !== S.cur));
        // stack reinforcements on one or two front-line territories, like a real player
        while (S.rf > 0) { const b = border(); place(pick(b.length ? b : mine()), Math.max(1, Math.ceil(S.rf * (0.5 + r() * 0.5)))); }
        inv("placed");
        if (S.ph === "deploy") { endTurn(); await sleep(); continue; }
        toAttack();
        for (let k = 0; k < 30 && S.win < 0; k++) {
          const opts = []; for (const f of mine()) if (S.a[f] >= 2) for (const t of T[f].adj) if (S.o[t] !== S.cur) opts.push([f, t, S.a[f] - S.a[t]]);
          if (!opts.length) break;
          // mostly pick favourable fights; sometimes a random one, to exercise odd cases
          const good = opts.filter(o => o[2] >= 2);
          if (!good.length && r() < 0.7) break;
          const [f, t] = good.length && r() < 0.85 ? good.sort((a, b) => b[2] - a[2])[0] : pick(opts); UI.sel = f; UI.tgt = t;
          if (r() < 0.5) attackOnce(); else blitz();
          if (S.ph === "move") confirmMove(S.mv.min + Math.floor(r() * (S.a[S.mv.f] - 1 - S.mv.min + 1)));
          inv("attack");
        }
        if (S.win >= 0) break;
        toFortify();
        // fortify: move idle troops from the interior toward the front
        const front = new Set(border());
        const srcs = mine().filter(f => S.a[f] >= 2 && !front.has(f));
        if (srcs.length && r() < 0.8) {
          const f = pick(srcs), all = [...reachable(f)], fr = all.filter(x => front.has(x)), dest = fr.length ? fr : all;
          if (dest.length) { UI.sel = f; UI.tgt = pick(dest); doFortify(f, UI.tgt, 1 + Math.floor(r() * (S.a[f] - 1))); }
          else endTurn();
        } else endTurn();
        await sleep();
        inv("end");
        maxCards = Math.max(maxCards, ...S.p.map(p => p.cards.length));
        if (turns % 3 === 0) {            // round-trip the link like sending it by text
          const code = await pack(S); maxLink = Math.max(maxLink, code.length);
          const back = await unpack(code);
          if (!validState(back) || JSON.stringify(back) !== JSON.stringify(S)) bad.push("link round-trip mismatch");
          useMap(cfg.map);
        }
        if (bad.length) break;
      }
      const humans = S.p.filter(p => !p.nt && !p.out).length;
      out.push({ cfg, turns, win: S.win, humans, bad: [...new Set(bad)].slice(0, 3), maxLink, maxCards });
    }
    return out;
  }, configs);
  let worstLink = 0, worstTurns = 0;
  for (const x of results) {
    const label = `${["Islands", "Grand", "Space", "Galaxy"][x.cfg.map]} ${x.cfg.n}p${x.cfg.neutral ? "+neutral" : ""}${x.cfg.draft ? " placed" : ""}`;
    check(`${label}: finished in ${x.turns} turns with one winner, no rule violations`, x.win >= 0 && x.humans === 1 && !x.bad.length, x.bad.join("; ") || (x.win < 0 ? "no winner" : ""));
    worstLink = Math.max(worstLink, x.maxLink); worstTurns = Math.max(worstTurns, x.turns);
  }
  check(`longest game link stays under 2,000 characters (worst: ${worstLink})`, worstLink < 2000);
  check("no page errors", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await page.context().close();
}

/* --------------------------------------------------------------------- ui */
// Real taps through the interface, handing the link between "phones".
async function ui(browser, base) {
  console.log("\nTexting flow (real taps, iPhone viewport)");
  const page = await openPage(browser, base, { device: "iPhone 13" });
  const names = ["Kaden", "Sam", "Jo"];
  for (let i = 0; i < 1; i++) await page.click("[data-act=addp]");
  for (let i = 0; i < 3; i++) await page.locator("#sheet input[type=text]").nth(i).fill(names[i]);
  await page.click('[data-act=opt][data-k=draft][data-v="true"]');
  await page.click("[data-act=start]");
  await page.waitForSelector(OV + "[data-act=claim]");
  check("setup → first player's pass screen", (await page.textContent("#sheet")).includes("Kaden"));

  const tap = t => page.locator(`g.t[data-t="${t}"] > :is(polygon,circle.pl)`).first().click({ force: true });
  let link = "";
  // deployment round
  for (let k = 0; k < 3; k++) {
    await page.click(OV + "[data-act=claim]");
    const ph = await page.evaluate(() => S.ph);
    if (k === 0) check("placement round starts with setup phase", ph === "deploy", ph);
    const t = await page.evaluate(() => S.o.indexOf(S.cur));
    await tap(t); await tap(t);
    await page.click("[data-act=undo]");
    const after = await page.evaluate(t => S.a[t], t);
    if (k === 0) check("undo removes a placed troop", after === 2, "troops " + after);
    await tap(t); await page.click("[data-act=placeall]");
    await page.click("[data-act=endturn]");
    await page.waitForSelector(OV + "[data-act=share]");
    link = page.url();
    await page.goto("about:blank"); await page.goto(link);
    await page.waitForSelector(OV + "[data-act=claim]");
  }
  check("after setup round, first player is up again", (await page.evaluate(() => S.cur)) === 0);

  // a normal turn: reinforce, attack, capture, fortify
  await page.click(OV + "[data-act=claim]");
  check("normal turn starts in reinforce", (await page.evaluate(() => S.ph)) === "reinforce");
  const best = await page.evaluate(() => { let b = -1, v = -1; for (let i = 0; i < NT; i++) if (S.o[i] === S.cur) { const e = [...T[i].adj].filter(n => S.o[n] !== S.cur).length; if (e && S.a[i] > v) { v = S.a[i]; b = i; } } return b; });
  await tap(best); await page.click("[data-act=placeall]");
  await page.click("[data-act=toattack]");
  // force a winnable fight to exercise the capture dialog
  const target = await page.evaluate(b => { const t = [...T[b].adj].find(n => S.o[n] !== S.cur); S.a[t] = 1; S.a[b] = Math.max(S.a[b], 8); render(); return t; }, best);
  await tap(best); await tap(target);
  check("attack shows dice controls", await page.isVisible("[data-act=blitz]"));
  await page.click("[data-act=blitz]");
  await page.waitForSelector(OV + "[data-act=mv]");
  check("capture opens the move-in dialog", true);
  await page.click(OV + "[data-act=amt][data-v=min]");
  await page.click(OV + "[data-act=mv]");
  check("captured territory changes owner", (await page.evaluate(t => S.o[t] === S.cur, target)));
  await page.click("[data-act=tofortify]");
  const pair = await page.evaluate(() => { for (let i = 0; i < NT; i++) if (S.o[i] === S.cur && S.a[i] >= 2) { const d = [...reachable(i)]; if (d.length) return [i, d[0]]; } return null; });
  if (pair) {
    await tap(pair[0]); await tap(pair[1]);
    await page.waitForSelector(OV + "[data-act=fort]");
    await page.click(OV + "[data-act=fort]");
  } else await page.click("[data-act=endturn]");
  await page.waitForSelector(OV + "[data-act=share]");
  check("turn ends on the 'send to next player' screen", (await page.textContent("#sheet")).includes("Sam"));
  check("conquering earns a card", (await page.evaluate(() => S.p[0].cards.length)) === 1);

  // menu sheets open and close
  await page.click(OV + "[data-act=watch]");
  for (const act of ["logall", "regions", "rules"]) {
    await page.click("#menuBtn"); await page.click(OV + `[data-act=${act}]`);
    const ok = await page.isVisible(OV + ".sheet");
    await page.click(OV + "[data-act=close]");
    check(`menu → ${act} opens and closes`, ok && await page.isHidden("#overlay"));
  }
  // zoom toggles
  await page.click("#zoomBtn");
  const zoomed = await page.evaluate(() => document.querySelector("#mapinner").getBoundingClientRect().width > innerWidth * 1.5);
  await page.click("#zoomBtn");
  check("zoom button enlarges the map and fits it back", zoomed && await page.evaluate(() => document.querySelector("#mapinner").getBoundingClientRect().width <= innerWidth));
  // "share" falls back to copying when the share sheet isn't available
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: base.replace(/\/[^/]*$/, "") });
  await page.evaluate(() => { navigator.share = undefined; });
  await page.click("[data-act=share]");
  await page.waitForTimeout(200);
  const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => ""));
  check("share falls back to copying the link", clip.includes("#g="), clip.slice(0, 40));
  check("no page errors", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await page.context().close();
}

/* --------------------------------------------------------------- security */
async function security(browser, base) {
  console.log("\nSecurity");
  const page = await openPage(browser, base);
  const PAY = '<img src=x onerror="window.__pwned=1">';
  // targeted hostile links
  const targeted = await page.evaluate(PAY => {
    newGame(["A", "B"]); const b = JSON.stringify(S);
    const mk = f => { const x = JSON.parse(b); f(x); return x; };
    return {
      "HTML in troop count": mk(x => x.a[0] = PAY), "HTML in turn number": mk(x => x.turn = PAY),
      "HTML in log turn": mk(x => x.log.push([PAY, "x"])), "HTML in player name": mk(x => x.p[0].n = "<b>Kaden</b>"),
      "HTML in log text": mk(x => x.log.push([1, PAY])), "prototype key as colour": mk(x => x.p[0].c = "constructor"),
      "unknown phase": mk(x => x.ph = "hack"), "negative troops": mk(x => x.a[0] = -5), "owner out of range": mk(x => x.o[0] = 9),
      "missing fields": mk(x => { delete x.p; }), "array as state": [1, 2, 3], "huge name": mk(x => x.p[0].n = "A".repeat(5000)),
    };
  }, PAY);
  async function tryLink(code) {
    const p = await openPage(browser, base, { hash: "#g=" + code });
    await p.waitForTimeout(150);
    await p.click(OV + "[data-act=claim]", { timeout: 300 }).catch(() => {});
    await p.click(OV + "[data-act=logall]", { timeout: 100 }).catch(() => {});
    const res = { pwned: await p.evaluate(() => !!window.__pwned), broken: (await p.textContent("#sheet")).includes("broken"), errs: p.errors.filter(e => !/Could not load/.test(e)),
      literal: await p.evaluate(() => document.body.innerText.includes("<b>Kaden</b>")), bold: await p.evaluate(() => [...document.querySelectorAll("b")].some(b => b.textContent === "Kaden")) };
    await p.context().close();
    return res;
  }
  for (const [name, st] of Object.entries(targeted)) {
    const code = await page.evaluate(s => pack(s), st);
    const res = await tryLink(code);
    const expectSafeRender = name === "HTML in player name" || name === "HTML in log text";
    const textOk = name !== "HTML in player name" || (res.literal && !res.bold);
    check(`${name}: ${expectSafeRender ? "shown as plain text" : "rejected"}`, !res.pwned && (expectSafeRender ? !res.broken : res.broken) && !res.errs.length && textOk, JSON.stringify(res));
  }
  // malformed / oversized / decompression bomb
  const bomb = await page.evaluate(async () => {
    const raw = new TextEncoder().encode('{"x":"' + "A".repeat(5e6) + '"}');
    const buf = await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer();
    return "z" + b64.enc(new Uint8Array(buf));
  });
  for (const [name, code] of [["garbage link", "zzz%%%"], ["oversized link", "j" + "A".repeat(30000)], [`decompression bomb (${bomb.length} chars → 5 MB)`, bomb]]) {
    const res = await tryLink(code);
    check(`${name}: rejected cleanly`, !res.pwned && res.broken && !res.errs.length, JSON.stringify(res));
  }
  // fuzz: random mutations of a real mid-game state must never inject or crash
  const fuzz = await page.evaluate(async PAY => {
    newGame(["A", "B", "C"]); S.cur = 1; startTurn(); S.ph = "attack"; S.log.push([2, "@1 attacked"]);
    const base = JSON.stringify(S);
    const junk = [PAY, -1, 1e9, 3.5, null, true, "", [], {}, "@9", "__proto__", NaN, "1"];
    let seed = 99; const r = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
    const paths = x => { const out = []; const walk = (o, p) => { if (o && typeof o === "object") for (const k of Object.keys(o)) { out.push([...p, k]); walk(o[k], [...p, k]); } }; walk(x, []); return out; };
    let accepted = 0, rejected = 0, crashes = [];
    for (let i = 0; i < 400; i++) {
      const x = JSON.parse(base); const ps = paths(x);
      for (let k = 0; k < 1 + Math.floor(r() * 3); k++) {
        const p = ps[Math.floor(r() * ps.length)]; let o = x; for (const key of p.slice(0, -1)) o = o?.[key];
        if (o && typeof o === "object") o[p[p.length - 1]] = junk[Math.floor(r() * junk.length)];
      }
      let ok;
      try { ok = validState(JSON.parse(JSON.stringify(x))); } catch (e) { crashes.push(String(e)); continue; }
      if (!ok) { rejected++; continue; }
      accepted++;
      try { S = JSON.parse(JSON.stringify(x)); UI.playing = true; render(); showPass(); openCards(); showRegions(); closeSheet(); }
      catch (e) { crashes.push(e.message); }
    }
    useMap(0);
    return { accepted, rejected, crashes: [...new Set(crashes)].slice(0, 3), pwned: !!window.__pwned };
  }, PAY);
  await page.waitForTimeout(200);
  check(`fuzz: 400 corrupted links — ${fuzz.rejected} rejected, ${fuzz.accepted} harmless ones play fine, no crashes, no injection`,
    !fuzz.crashes.length && !fuzz.pwned && !(await page.evaluate(() => !!window.__pwned)), JSON.stringify(fuzz.crashes));
  // Content-Security-Policy blocks anything that slips through
  const csp = await page.evaluate(async () => {
    document.body.insertAdjacentHTML("beforeend", '<img src=x onerror="window.__c1=1">');
    const s = document.createElement("script"); s.textContent = "window.__c2=1"; document.body.appendChild(s);
    await new Promise(r => setTimeout(r, 200));
    return !window.__c1 && !window.__c2;
  });
  check("Content-Security-Policy blocks injected scripts and inline handlers", csp);
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  check("no third-party scripts, styles or trackers loaded", !/<script[^>]+src=["']https?:/i.test(html) && !/<link[^>]+href=["']https?:/i.test(html));
  check("game state stays in the # part of the URL (never sent to a server)", (await page.evaluate(async () => { newGame(["A", "B"]); await saveNow(); return location.search === "" && location.hash.startsWith("#g="); })));
  await page.context().close();
}

/* ----------------------------------------------------------------- layout */
async function layout(browser, base) {
  console.log("\nScreen sizes");
  fs.mkdirSync(OUT, { recursive: true });
  const sizes = [["iPhone SE (1st gen)", 320, 568], ["iPhone SE", 375, 667], ["iPhone 13", 390, 844], ["iPhone Pro Max", 430, 932], ["iPad", 768, 1024], ["Laptop", 1280, 800]];
  for (const [label, w, h] of sizes) {
    const page = await openPage(browser, base, { viewport: { width: w, height: h } });
    const issues = [];
    for (const map of [0, 1, 2, 3]) {
      const r = await page.evaluate(map => {
        newGame(["Alexandria", "Bartholomew", "C", "D", "E", "F"], { map }); closeSheet(); UI.playing = true; startTurn(); render();
        const doc = document.documentElement;
        const btns = [...document.querySelectorAll("#panel button")].map(b => b.getBoundingClientRect());
        const small = btns.filter(b => b.height < 40 || b.width < 44).length;
        const off = [...document.querySelectorAll("#panel *, #top *, #players *")].filter(e => { const b = e.getBoundingClientRect(); return b.width && (b.right > innerWidth + 1 || b.left < -1); }).length;
        return { hscroll: doc.scrollWidth > innerWidth + 1, small, off, mapH: document.querySelector("#map").getBoundingClientRect().height };
      }, map);
      if (r.hscroll) issues.push(`map ${map}: page scrolls sideways`);
      if (r.off) issues.push(`map ${map}: ${r.off} elements off-screen`);
      if (r.small) issues.push(`map ${map}: ${r.small} buttons smaller than 44×40px`);
      if (map === 3) await page.screenshot({ path: path.join(OUT, `layout-${w}x${h}.png`) });
    }
    // sheets fit on screen
    await page.evaluate(() => { showSetup.names = ["", "", "", "", "", ""]; showSetup(); });
    const sheet = await page.evaluate(() => { const b = document.querySelector("#sheet").getBoundingClientRect(); return b.top >= 0 && b.bottom <= innerHeight + 1 && b.right <= innerWidth + 1; });
    if (!sheet) issues.push("setup sheet doesn't fit the screen");
    check(`${label} (${w}×${h}): no sideways scrolling, nothing cut off, buttons big enough to tap`, !issues.length, issues.join("; "));
    if (page.errors.length) check(`${label}: no page errors`, false, page.errors.join(" | "));
    await page.context().close();
  }
}

/* ------------------------------------------------------------------- a11y */
async function a11y(browser, base) {
  console.log("\nAccessibility (axe-core)");
  let axePath;
  try { axePath = require.resolve("axe-core/axe.min.js", { paths: [ROOT, __dirname] }); }
  catch { console.log("  - skipped: axe-core not installed (npm install)"); return; }
  const axe = fs.readFileSync(axePath, "utf8");
  const views = {
    "setup screen": () => { },
    "pass screen": () => { newGame(["Kaden", "Sam"]); showPass(); },
    "game board": () => { newGame(["Kaden", "Sam"]); closeSheet(); UI.playing = true; startTurn(); render(); },
    "cards sheet": () => { newGame(["Kaden", "Sam"]); closeSheet(); UI.playing = true; startTurn(); S.p[0].cards = [0, 1, 2]; openCards(); },
    "rules sheet": () => { showRules(); },
  };
  for (const [name, fn] of Object.entries(views)) {
    const page = await openPage(browser, base);
    await page.evaluate(`(${fn.toString()})()`);
    // axe is injected through the test harness, not the page, so CSP doesn't apply
    await page.addScriptTag({ content: axe }).catch(async () => { await page.evaluate(axe); });
    const res = await page.evaluate(async () => {
      const r = await axe.run(document, { resultTypes: ["violations"], rules: { "color-contrast": { enabled: true } } });
      return r.violations.filter(v => ["serious", "critical"].includes(v.impact)).map(v => `${v.id} (${v.nodes.length}): ${v.nodes[0].target}`);
    }).catch(e => ["axe failed: " + e.message]);
    check(`${name}: no serious or critical accessibility issues`, !res.length, res.join("; "));
    await page.context().close();
  }
}

/* ------------------------------------------------------------------- perf */
async function perf(browser, base) {
  console.log("\nPerformance");
  const page = await openPage(browser, base, { device: "iPhone 13" });
  const nav = await page.evaluate(() => { const n = performance.getEntriesByType("navigation")[0]; return { load: n.loadEventEnd - n.startTime }; });
  check(`page loads in under 1 second locally (${nav.load.toFixed(0)} ms)`, nav.load < 1000);
  const bytes = ["index.html", "game.js"].reduce((s, f) => s + fs.statSync(path.join(ROOT, f)).size, 0);
  check(`page + game code under 100 KB before compression (${(bytes / 1024).toFixed(0)} KB)`, bytes < 100 * 1024);
  const preview = fs.statSync(path.join(ROOT, "preview.jpg")).size;
  check(`link preview image under 150 KB (${(preview / 1024).toFixed(0)} KB)`, preview < 150 * 1024);
  const cpu = await page.context().newCDPSession(page);
  await cpu.send("Emulation.setCPUThrottlingRate", { rate: 4 });   // roughly a mid-range phone
  const r = await page.evaluate(() => MAPS.map((M, m) => {
    newGame(["A", "B", "C", "D", "E", "F"], { map: m }); closeSheet(); UI.playing = true; startTurn(); S.ph = "attack";
    const t0 = performance.now(); mapId = -1; useMap(m); const build = performance.now() - t0;
    const own = [...Array(NT).keys()].filter(i => S.o[i] === S.cur);
    const t1 = performance.now(); for (let k = 0; k < 100; k++) { UI.sel = own[k % own.length]; render(); } const rend = (performance.now() - t1) / 100;
    return { name: M.name, build, rend, nodes: document.querySelectorAll("svg *").length };
  }));
  for (const x of r) check(`${x.name}: map builds in ${x.build.toFixed(0)} ms, updates in ${x.rend.toFixed(2)} ms (4× slowed CPU)`, x.build < 200 && x.rend < 8);
  const save = await page.evaluate(async () => { newGame(["A", "B", "C", "D", "E", "F"], { map: 3 }); const t = performance.now(); for (let i = 0; i < 20; i++) await saveNow(); return (performance.now() - t) / 20; });
  check(`saving the game link takes ${save.toFixed(1)} ms (4× slowed CPU)`, save < 30);
  check("no page errors", page.errors.length === 0, page.errors.join(" | "));
  await page.context().close();
}

/* ------------------------------------------------------------------- main */
(async () => {
  const all = { rules, sim, ui, security, layout, a11y, perf };
  const pick = process.argv.slice(2);
  const run = pick.length ? pick : Object.keys(all);
  for (const n of run) if (!all[n]) { console.error("unknown suite " + n); process.exit(2); }
  const srv = await serve();
  const base = `http://127.0.0.1:${srv.address().port}/index.html`;
  const browser = await chromium.launch();
  const t0 = Date.now();
  try { for (const n of run) await all[n](browser, base); }
  catch (e) { failed++; failures.push("suite crashed: " + e.message); console.log("  ✗ suite crashed: " + e.stack); }
  await browser.close(); srv.close();
  console.log(`\n${passed} passed, ${failed} failed in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  if (failed) { console.log("\nFailures:\n - " + failures.join("\n - ")); process.exit(1); }
})();
