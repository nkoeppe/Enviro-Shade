/*
  Options UI — v10
  Real overlay preview (content-style) inside .pv-sim.
  - Severity + contrast identical to content script.
  - Clear hides overlay, chips, URL, and row highlights.
  - Row click = Preview mode (purple border); URL mode = Match (blue border).
*/

const API = typeof browser !== "undefined" ? browser : chrome;

const els = {
  tbody: document.querySelector("#rules tbody"),
  blocklistTbody: document.querySelector("#blocklist tbody"),
  add: document.getElementById("add"),
  addFromTabs: document.getElementById("addFromTabs"),
  defaults: document.getElementById("defaults"),
  status: document.getElementById("status"),
  addBlocklist: document.getElementById("addBlocklist"),
  clearBlocklist: document.getElementById("clearBlocklist"),
  blocklistStatus: document.getElementById("blocklist-status")
};

const state = { rules: [], blocklist: [], saving: false, preview: null, currentTab: 'rules' };

/** Status toast. */
function toast(msg, ms = 2000) {
  if (!els.status) return;
  els.status.textContent = msg;
  els.status.style.opacity = "1";
  els.status.style.transform = "translateX(0)";
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    els.status.style.opacity = "0";
    els.status.style.transform = "translateX(-10px)";
    setTimeout(() => (els.status.textContent = ""), 300);
  }, ms);
}

/** Button loading state. */
function setButtonLoading(btn, loading = true) {
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.classList.add("loading");
    btn.dataset.originalText = btn.textContent;
    btn.textContent = "Loading...";
  } else {
    btn.disabled = false;
    btn.classList.remove("loading");
    if (btn.dataset.originalText) {
      btn.textContent = btn.dataset.originalText;
      delete btn.dataset.originalText;
    }
  }
}

/** Wraps an async handler with loading state + feedback. */
async function withButtonLoading(btn, fn, onSuccessMessage) {
  setButtonLoading(btn, true);
  try {
    await fn();
    if (onSuccessMessage) showActionFeedback("success", onSuccessMessage);
  } catch (err) {
    showActionFeedback("error", (err && err.message) || "Something went wrong");
    throw err;
  } finally {
    setButtonLoading(btn, false);
  }
}

/** Global ripple (event delegation so it works on dynamic buttons). */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement("span");
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  ripple.style.cssText = `
    position:absolute;width:${size}px;height:${size}px;left:${x}px;top:${y}px;
    background:rgba(255,255,255,0.3);border-radius:50%;transform:scale(0);
    animation:ripple 0.6s linear;pointer-events:none;
  `;
  btn.style.position = "relative";
  btn.style.overflow = "hidden";
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

/** Ripple keyframes. */
const style = document.createElement("style");
style.textContent = `
  @keyframes ripple { to { transform: scale(4); opacity: 0; } }
`;
document.head.appendChild(style);

/** Subtle hover/focus elevation. */
document.querySelectorAll("input, select, button").forEach((el) => {
  el.addEventListener("mouseenter", function () { this.style.transform = "translateY(-1px)"; });
  el.addEventListener("mouseleave", function () { if (!this.matches(":focus")) this.style.transform = ""; });
  el.addEventListener("focus", function () { this.style.transform = "translateY(-1px)"; });
  el.addEventListener("blur", function () { this.style.transform = ""; });
});

/** Smooth scroll. */
document.documentElement.style.scrollBehavior = "smooth";

/** Decorative particles on load. */
function createParticles() {
  const particleCount = 30;
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.style.cssText = `
      position: fixed; width: 2px; height: 2px; background: rgba(59,130,246,0.5);
      border-radius: 50%; pointer-events: none; z-index: -1;
      left: ${Math.random() * 100}vw; top: ${Math.random() * 100}vh;
      animation: float ${5 + Math.random() * 10}s ease-in-out infinite;
      animation-delay: ${Math.random() * 5}s;
    `;
    document.body.appendChild(particle);
    particles.push(particle);
  }
  setTimeout(() => { particles.forEach((p) => p.remove()); }, 15000);
}
document.addEventListener("DOMContentLoaded", () => { setTimeout(createParticles, 500); });

/** Inline validation accent. */
document.querySelectorAll('input[type="text"]').forEach((input) => {
  input.addEventListener("input", function () {
    if (this.value.trim()) {
      this.style.borderColor = "var(--accent-success)";
      this.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)";
    } else {
      this.style.borderColor = "";
      this.style.boxShadow = "";
    }
  });
});

/** Action feedback toast. */
function showActionFeedback(type, message) {
  const feedback = document.createElement("div");
  feedback.style.cssText = `
    position: fixed; top: 2rem; right: 2rem; padding: 1rem 1.5rem;
    background: ${type === "success" ? "rgba(16,185,129,0.9)" : "rgba(239,68,68,0.9)"};
    color: #fff; border-radius: 12px; font-weight: 600; z-index: 1000;
    transform: translateX(100%); transition: transform 0.3s ease;
    backdrop-filter: blur(8px); box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  `;
  feedback.textContent = message;
  document.body.appendChild(feedback);
  setTimeout(() => (feedback.style.transform = "translateX(0)"), 100);
  setTimeout(() => {
    feedback.style.transform = "translateX(100%)";
    setTimeout(() => feedback.remove(), 300);
  }, 3000);
}

/** Key shortcuts. */
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case "n": e.preventDefault(); els.add?.click(); break;
      case "r": e.preventDefault(); els.defaults?.click(); break;
    }
  }
});

/** Fade-in on load. */
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.opacity = "0";
  setTimeout(() => {
    document.body.style.transition = "opacity 0.5s ease";
    document.body.style.opacity = "1";
  }, 100);
});

/** Glob → RegExp with [class] quantifiers. */
function sameMatcher(glob) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let i = 0, out = "^";
  while (i < glob.length) {
    const c = glob[i];
    if (c === "*") { out += ".*"; i++; continue; }
    if (c === "?") { out += ".";  i++; continue; }
    if (c === "[") {
      const j = glob.indexOf("]", i + 1);
      if (j !== -1) {
        const cls = glob.slice(i, j + 1);
        const q = glob[j + 1];
        if (q === "*") { out += `(?:${cls})*`; i = j + 2; continue; }
        if (q === "+") { out += `(?:${cls})+`; i = j + 2; continue; }
        if (q === "?") { out += `(?:${cls})?`; i = j + 2; continue; }
        out += cls; i = j + 1; continue;
      }
      out += "\\["; i++; continue;
    }
    out += esc(c); i++;
  }
  out += "$";
  return new RegExp(out, "i");
}

/** High-contrast text for a hex color. */
function textColorFor(hex){
  const m=/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex||"");
  const [r,g,b]=(m?[m[1],m[2],m[3]].map(x=>parseInt(x,16)):[0,0,0]).map(v=>v/255);
  const lin=v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);
  const L=0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
  return L>0.5?"#000":"#fff";
}

function isEligible(url){ try{ const u=new URL(url); return u.protocol==="http:"||u.protocol==="https:"; }catch{return false;} }

async function rpc(msg) {
  if (typeof browser !== "undefined" && browser.runtime?.sendMessage) {
    return browser.runtime.sendMessage(msg);
  }
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(msg, (res) => {
        const err = chrome.runtime.lastError;
        if (err) reject(err);
        else resolve(res);
      });
    } catch (e) { reject(e); }
  });
}

/* ---------- persistence ---------- */
async function load() {
  try {
    const res = await rpc({ type: "ecb:getRules" });
    state.rules = Array.isArray(res) ? res : Array.isArray(res?.rules) ? res.rules : null;
    if (!Array.isArray(state.rules) || state.rules.length === 0) {
      const defs = await rpc({ type: "ecb:getDefaultRules" });
      state.rules = Array.isArray(defs) ? defs : [];
    }
  } catch {
    state.rules = [];
  }
  
  try {
    const blocklistRes = await rpc({ type: "ecb:getBlocklist" });
    state.blocklist = Array.isArray(blocklistRes) ? blocklistRes : [];
  } catch {
    state.blocklist = [];
  }
}

async function saveAndRender(msg = "Saved") {
  state.saving = true;
  try {
    await rpc({ type: "ecb:saveRules", payload: state.rules });
    toast(msg);
  } finally {
    state.saving = false;
  }
  await render();
  if (state.preview) runPreview(state.preview.url.value.trim());
}

async function saveBlocklistAndRender(msg = "Saved") {
  state.saving = true;
  try {
    await rpc({ type: "ecb:saveBlocklist", payload: state.blocklist });
    toast(msg);
  } finally {
    state.saving = false;
  }
  await renderBlocklist();
}

/* ---------- DnD (background-only) ---------- */
function wireDnD(tr){
  tr.tabIndex = -1;
  let allowDrag = false;
  tr.addEventListener("pointerdown", (e)=>{
    const onControl = !!e.target.closest("input,select,textarea,button");
    allowDrag = !onControl && e.button === 0;
    tr.draggable = allowDrag;
  });
  tr.addEventListener("dragstart", e => {
    if (!allowDrag) { e.preventDefault(); return; }
    tr.classList.add("dragging");
    e.dataTransfer.setData("text/plain", tr.dataset.index);
  });
  tr.addEventListener("dragend", ()=>{
    tr.classList.remove("dragging");
    tr.draggable = false;
    allowDrag = false;
  });
  tr.addEventListener("dragover", e => e.preventDefault());
  tr.addEventListener("drop", async e => {
    e.preventDefault();
    const from=+e.dataTransfer.getData("text/plain");
    const to=[...els.tbody.children].indexOf(tr);
    if (from===to) return;
    const [row]=state.rules.splice(from,1);
    state.rules.splice(to,0,row);
    await saveAndRender("Re-ordered");
  });
  tr.addEventListener("click", (e)=>{
    if (!e.target.closest("input,select,textarea,button")) tr.focus();
  });
}

/* ---------- rows ---------- */
function renderRow(rule, idx, total){
  const tr = document.createElement("tr");
  tr.dataset.id = rule.id;
  tr.dataset.index = idx;
  wireDnD(tr);

  tr.addEventListener("focusin", () => startRulePreview(rule, idx, tr));
  tr.addEventListener("focusout", (e) => {
    if (e.relatedTarget == null && e.target && e.target.type === "color") return;
    if (!tr.contains(e.relatedTarget)) stopRulePreview(true);
  });

  const tdEn = document.createElement("td");
  const en = document.createElement("input");
  en.type="checkbox"; en.checked=!!rule.enabled;
  en.addEventListener("change", async ()=>{ rule.enabled=en.checked; await saveAndRender(); });
  tdEn.append(en);

  const tdPat = document.createElement("td");
  const ipPat = document.createElement("input");
  ipPat.type="text"; ipPat.value=rule.pattern||"";
  ipPat.placeholder="*://*-qa[0-9]*.cfapps.*/*";
  ipPat.addEventListener("change", async ()=>{ rule.pattern=ipPat.value; await saveAndRender(); });
  ipPat.addEventListener("keyup", e=>{ if(e.key==="Enter") ipPat.blur(); });
  tdPat.append(ipPat);

  const tdLab=document.createElement("td");
  const ipLab=document.createElement("input");
  ipLab.type="text"; ipLab.value=rule.label||"";
  ipLab.addEventListener("input", ()=> updateRowPreview(rule, { label: ipLab.value }));
  ipLab.addEventListener("change", async ()=>{ rule.label=ipLab.value; await saveAndRender(); });
  ipLab.addEventListener("keyup", e=>{ if(e.key==="Enter") ipLab.blur(); });
  tdLab.append(ipLab);

  const tdCol=document.createElement("td");
  const ipCol=document.createElement("input");
  ipCol.type="color"; ipCol.value=rule.color||"#dc2626";
  ipCol.addEventListener("input", ()=> updateRowPreview(rule, { color: ipCol.value }));
  ipCol.addEventListener("change", async ()=>{ rule.color=ipCol.value; await saveAndRender(); });
  tdCol.append(ipCol);

  const tdSev=document.createElement("td");
  const sel=document.createElement("select");
  ["low","medium","high"].forEach(s=>{
    const o=document.createElement("option"); o.value=s; o.textContent=s;
    if((rule.severity||"low")===s) o.selected=true;
    sel.append(o);
  });
  sel.addEventListener("input", ()=> updateRowPreview(rule, { severity: sel.value }));
  sel.addEventListener("change", async ()=>{ rule.severity=sel.value; await saveAndRender(); });
  tdSev.append(sel);

  const tdOrd=document.createElement("td");
  const grp=document.createElement("div"); grp.className="order-group";
  const up=document.createElement("button"); up.className="icon up"; up.disabled=idx===0;
  const dn=document.createElement("button"); dn.className="icon down"; dn.disabled=idx===total-1;
  up.addEventListener("click", async ()=>{
    if(idx===0) return;
    const [row]=state.rules.splice(idx,1); state.rules.splice(idx-1,0,row);
    await saveAndRender("Re-ordered");
  });
  dn.addEventListener("click", async ()=>{
    if(idx>=total-1) return;
    const [row]=state.rules.splice(idx,1); state.rules.splice(idx+1,0,row);
    await saveAndRender("Re-ordered");
  });
  grp.append(up,dn); tdOrd.append(grp);

  const tdDel=document.createElement("td");
  const del=document.createElement("button"); del.textContent="✕";
  del.addEventListener("click", async ()=>{ state.rules.splice(idx,1); await saveAndRender("Deleted"); });
  tdDel.append(del);

  tr.append(tdEn, tdPat, tdLab, tdCol, tdSev, tdOrd, tdDel);
  return tr;
}

/* ---------- preview UI ---------- */
function ensurePreview(){
  if (state.preview) return state.preview;

  const wrap = document.createElement("div");
  wrap.className = "preview";
  wrap.innerHTML = `
    <div class="preview-head">Preview & match checker</div>
    <div class="preview-row">
      <input class="pv-url" type="text" placeholder="Paste a URL or pick a tab…" />
      <button class="pv-pick">Pick from open tabs</button>
      <button class="pv-clear">Clear</button>
      <span class="pv-result"></span>
    </div>
    <div class="pv-stage">
      <div class="pv-chip-group">
        <span class="chip pv-chip-mode" hidden></span>
        <span class="chip pv-chip-match" hidden></span>
      </div>
      <div class="pv-sim" hidden>
        <div class="ecb-chip"></div>
        <div class="ecb-wm"></div>
      </div>
    </div>`;

  document.querySelector('.preview')
  ?.replaceWith(wrap);




  const api = {
    root: wrap,
    url: wrap.querySelector(".pv-url"),
    pick: wrap.querySelector(".pv-pick"),
    clear: wrap.querySelector(".pv-clear"),
    result: wrap.querySelector(".pv-result"),
    stage: wrap.querySelector(".pv-stage"),
    chipMode:  wrap.querySelector(".pv-chip-mode"),
    chipMatch: wrap.querySelector(".pv-chip-match"),
    sim:       wrap.querySelector(".pv-sim"),
    simChip:   wrap.querySelector(".ecb-chip"),
    simWm:     wrap.querySelector(".ecb-wm"),
    modeState: "url",
    modeRuleId: null,
    activeRowEl: null
  };
  state.preview = api;

  const run = ()=> runPreview(api.url.value.trim());
  api.url.addEventListener("input", () => { if (api.modeState === "url") run(); });
  api.url.addEventListener("change", run);

  api.pick.addEventListener("click", e => openTabPopover(e.currentTarget, (tab)=>{
    api.modeState = "url";
    api.url.value = tab.url;
    run();
  }));
  api.clear.addEventListener("click", clearPreviewAll);

  document.addEventListener("pointerdown", (e)=>{
    if (api.modeState !== "rule" || !api.activeRowEl) return;
    if (!api.activeRowEl.contains(e.target)) stopRulePreview(true);
  });
  document.addEventListener("keydown", (e)=>{
    if (e.key === "Escape" && api.modeState === "rule") stopRulePreview(true);
  });

  return api;
}

/** Chips visibility helper. */
function setChips({ modeText=null, matchText=null }){
  const pv = ensurePreview();
  const set = (el, text) => { el.hidden = !(text && String(text).trim()); el.textContent = text || ""; };
  set(pv.chipMode, modeText);
  set(pv.chipMatch, matchText);
}

/** Hide overlay + chips + borders. */
function clearPreviewAll(){
  const pv = ensurePreview();
  pv.url.value = "";
  pv.result.textContent = "";
  pv.sim.hidden = true;
  pv.simChip.textContent = "";
  pv.simWm.textContent = "";
  setChips({ modeText:null, matchText:null });
  [...els.tbody.children].forEach(tr=>{ tr.classList.remove("matched","is-preview"); });
}

/** URL mode driver. */
function runPreview(url) {
  const pv = ensurePreview();
  if (pv.modeState !== "url") return;

  [...els.tbody.children].forEach(tr=>tr.classList.remove("is-preview"));

  if (!url) { clearPreviewAll(); return; }

  let idx=-1, match=null;
  for (let i=0;i<state.rules.length;i++){
    const r=state.rules[i];
    if (!r.enabled) continue;
    if (sameMatcher(r.pattern||"").test(url)) {
      // Check if this URL is blocked
      let isBlocked = false;
      for (const b of state.blocklist) {
        if (b.enabled && sameMatcher(b.pattern || "").test(url)) {
          isBlocked = true;
          break;
        }
      }
      if (!isBlocked) {
        idx=i; match=r; break;
      }
    }
  }

  [...els.tbody.children].forEach(tr=>tr.classList.remove("matched"));
  if (!match) {
    // Check if it was blocked
    let wasBlocked = false;
    for (let i=0;i<state.rules.length;i++){
      const r=state.rules[i];
      if (!r.enabled) continue;
      if (sameMatcher(r.pattern||"").test(url)) {
        for (const b of state.blocklist) {
          if (b.enabled && sameMatcher(b.pattern || "").test(url)) {
            wasBlocked = true;
            break;
          }
        }
        if (wasBlocked) break;
      }
    }
    
    if (wasBlocked) {
      pv.result.textContent = "Rule matched but blocked by blocklist.";
      setChips({ modeText:null, matchText:"Blocked" });
    } else {
      pv.result.textContent = "No rule matches.";
      setChips({ modeText:null, matchText:"No match" });
    }
    pv.sim.hidden = true;
    return;
  }

  els.tbody.children[idx]?.classList.add("matched");
  pv.result.textContent = `Matched rule #${idx+1} — ${match.label || match.pattern}`;
  setChips({ modeText:null, matchText:`Matched rule #${idx+1}` });
  applyOverlayPreview(match);
}

/** Enter rule preview mode on row focus/click. */
function startRulePreview(rule, idx, rowEl){
  const pv = ensurePreview();
  pv.modeState = "rule";
  pv.modeRuleId = rule.id;
  pv.activeRowEl = rowEl;

  pv.url.value = "";
  pv.result.textContent = "";
  [...els.tbody.children].forEach(tr=>tr.classList.remove("matched","is-preview"));
  rowEl.classList.add("is-preview");

  setChips({ modeText:`Previewing rule #${idx+1}`, matchText:null });
  applyOverlayPreview(collectLiveRuleFromRow(rule, rowEl));
}

/** Update preview while editing inputs. */
function updateRowPreview(rule, patch){
  const pv = ensurePreview();
  if (pv.modeState !== "rule" || pv.modeRuleId !== rule.id) return;
  const rowEl = [...els.tbody.children].find(tr => tr.dataset.id === rule.id);
  const live = { ...collectLiveRuleFromRow(rule, rowEl), ...patch };
  setChips({ modeText:pv.chipMode.textContent || null, matchText:null });
  applyOverlayPreview(live);
}

/** Exit rule preview. */
function stopRulePreview(clearAll){
  const pv = ensurePreview();
  if (pv.modeState !== "rule") return;
  pv.modeState = "url";
  pv.modeRuleId = null;
  pv.activeRowEl?.classList.remove("is-preview");
  pv.activeRowEl = null;

  if (clearAll || !pv.url.value.trim()) clearPreviewAll();
  else { setChips({ modeText:null, matchText:null }); runPreview(pv.url.value.trim()); }
}

/** Build rule-like payload from row inputs. */
function collectLiveRuleFromRow(rule, rowEl){
  if (!rowEl) return rule;
  const inputs = rowEl.querySelectorAll("input, select");
  const out = { ...rule };
  inputs.forEach(el=>{
    if (el.type === "text")      out.pattern = el.value;
    else if (el.type === "color")out.color = el.value;
    else if (el.tagName === "SELECT") out.severity = el.value;
    else if (el.type === "checkbox") out.enabled = el.checked;
    if (el.type === "text" && el !== inputs[0]) out.label = el.value;
  });
  return out;
}

/** Apply content-style overlay to preview stage. */
function applyOverlayPreview(payload){
  const pv = ensurePreview();
  const { label="", color="#444", severity="low" } = payload || {};
  if (!label) { pv.sim.hidden = true; pv.simChip.textContent = ""; pv.simWm.textContent = ""; return; }

  const sev = String(severity || "low").toLowerCase();
  const wmOpacity = sev==="high"?0.12:sev==="medium"?0.09:0.06;
  const wmSize    = sev==="high"?"min(22vw,220px)":sev==="medium"?"min(18vw,180px)":"min(14vw,140px)";
  const chipSize  = sev==="high"?"14px":sev==="medium"?"13px":"12px";
  const prefix    = sev==="high"?"⚠️ ":"";

  pv.sim.hidden = false;
  pv.stage.style.setProperty("--ecb-color", color);
  pv.stage.style.setProperty("--ecb-text", textColorFor(color));
  pv.stage.style.setProperty("--ecb-wm-opacity", String(wmOpacity));
  pv.stage.style.setProperty("--ecb-wm-size", wmSize);

  pv.simChip.style.fontSize = chipSize;
  pv.simChip.textContent = `${prefix}${label}`;
  pv.simWm.textContent = label;
}

/* ---------- tab picker ---------- */
async function openTabPopover(anchorBtn, onPick) {
  let tabs = [];
  try {
    const allTabs = await API.tabs.query({});
    const allWindows = await API.windows.getAll();
    const focusedWindow = allWindows.find(w => w.focused);
    tabs = allTabs
      .filter(t => isEligible(t.url || ""))
      .map(t => ({ ...t, _winId: t.windowId, _focused: focusedWindow ? t.windowId === focusedWindow.id : false }));
  } catch {
    tabs = [];
  }

  tabs.sort((a,b)=>
    (b._focused - a._focused) ||
    ((b.active?1:0) - (a.active?1:0)) ||
    ((b.lastAccessed||0) - (a.lastAccessed||0))
  );

  const width = 640, margin = 12;
  const rect = anchorBtn.getBoundingClientRect();
  let left = Math.round(rect.left);
  const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  if (left + width > vw - margin) left = Math.max(margin, Math.round(rect.right - width));
  const top = Math.round(rect.bottom + 6);
  const maxH = Math.max(240, Math.min(window.innerHeight - top - margin, Math.floor(window.innerHeight * 0.6)));

  const pop = document.createElement("div");
  pop.className="tab-popover";
  pop.style.width = width + "px";
  pop.style.left  = left + "px";
  pop.style.top   = top + "px";
  pop.style.maxHeight = maxH + "px";
  pop.innerHTML=`
    <div class="tab-popover-head">Pick a tab</div>
    <div class="tab-popover-search">
      <input type="text" placeholder="Search title or URL… (Esc to close)" />
    </div>
    <div class="tab-popover-list" role="listbox" tabindex="0"></div>`;
  document.body.appendChild(pop);

  const ip = pop.querySelector(".tab-popover-search input");
  const listEl = pop.querySelector(".tab-popover-list");
  let view = tabs.slice(); let sel=-1;

  function render(){
    listEl.textContent="";
    view.forEach((t,i)=>{
      const row=document.createElement("button");
      row.className="tab-popover-row"; row.setAttribute("role","option");
      row.dataset.index=String(i);
      row.innerHTML=`
        <img src="${t.favIconUrl||""}" onerror="this.style.visibility='hidden'">
        <div class="meta">
          <div class="title">${t.title||t.url}</div>
          <div class="url"><span class="winchip">W${t._winId}${t._focused?" • current":""}</span>${t.url}</div>
        </div>`;
      row.addEventListener("click",()=>{ onPick(t); destroy(); });
      listEl.appendChild(row);
    });
    setSel(view.length?0:-1);
  }
  function setSel(i){
    const rows=[...listEl.children];
    rows.forEach(r=>r.classList.remove("is-selected"));
    sel=i; if(sel>=0 && rows[sel]){ rows[sel].classList.add("is-selected"); rows[sel].scrollIntoView({block:"nearest"}); }
  }
  function filter(q){
    q=(q||"").trim().toLowerCase();
    if(!q){ view=tabs.slice(); render(); return; }
    const tokens=q.split(/\s+/);
    view=tabs.filter(t=>{
      const hay=`${t.title||""} ${t.url||""}`.toLowerCase();
      return tokens.every(tok=>hay.includes(tok));
    });
    render();
  }
  function destroy(){ document.removeEventListener("mousedown",onDoc); document.removeEventListener("keydown",onKey); pop.remove(); }
  function onDoc(e){ if(!pop.contains(e.target) && e.target!==anchorBtn) destroy(); }
  function onKey(e){
    const rows=[...listEl.children];
    if(e.key==="Escape"){ destroy(); return; }
    if(!rows.length) return;
    if(e.key==="ArrowDown"){ e.preventDefault(); setSel(Math.min(sel+1, rows.length-1)); }
    else if(e.key==="ArrowUp"){ e.preventDefault(); setSel(Math.max(sel-1,0)); }
    else if(e.key==="Enter"){ e.preventDefault(); const pick=view[sel]; if(pick){ onPick(pick); destroy(); } }
  }

  ip.addEventListener("input",()=>filter(ip.value));
  document.addEventListener("mousedown",onDoc);
  document.addEventListener("keydown",onKey);
  render(); ip.focus();
}

/* ---------- tab switching ---------- */
function switchTab(tabName) {
  state.currentTab = tabName;
  
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  
  // Update tab content
  document.getElementById('rules-tab').style.display = tabName === 'rules' ? 'block' : 'none';
  document.getElementById('blocklist-tab').style.display = tabName === 'blocklist' ? 'block' : 'none';
  
  // Update table containers
  document.getElementById('rules-table-container').style.display = tabName === 'rules' ? 'block' : 'none';
  document.getElementById('blocklist-table-container').style.display = tabName === 'blocklist' ? 'block' : 'none';
}

// Tab button event listeners
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

/* ---------- actions (single binding each) ---------- */
els.add?.addEventListener("click", async () => {
  await withButtonLoading(els.add, async () => {
    const blank = {
      pattern: "*://example.com/*",
      label: "ENV",
      color: "#888888",
      severity: "low",
      enabled: true,
      id: `r_${Math.random().toString(36).substr(2, 9)}`
    };
    state.rules.push(blank);
    await saveAndRender("Added");
  }, "New rule added successfully!");
});

els.addFromTabs?.addEventListener("click", (e) =>
  openTabPopover(e.currentTarget, async (tab) => {
    await withButtonLoading(els.addFromTabs, async () => {
      const base = {
        pattern: patternFromUrlSmart(tab.url),
        ...guessMeta(tab.url),
        enabled: true,
        id: `r_${Math.random().toString(36).substr(2, 9)}`
      };
      state.rules.push({ ...base });
      await saveAndRender("Added from tab");
      const pv = ensurePreview();
      pv.modeState = "url";
      pv.url.value = tab.url;
      runPreview(tab.url);
    }, "Rule created from active tab!");
  })
);

els.defaults?.addEventListener("click", async () => {
  await withButtonLoading(els.defaults, async () => {
    try {
      const defs = await rpc({ type: "ecb:getDefaultRules" });
      state.rules = Array.isArray(defs) ? defs : [];
      await saveAndRender("Defaults restored");
    } catch {
      toast("Failed to load defaults");
      throw new Error("Failed to load defaults");
    }
  }, "Default rules restored!");
});

els.addBlocklist?.addEventListener("click", async () => {
  await withButtonLoading(els.addBlocklist, async () => {
    const blank = {
      pattern: "*://192.168.3.27/*",
      enabled: true,
      id: `b_${Math.random().toString(36).substr(2, 9)}`
    };
    state.blocklist.push(blank);
    await saveBlocklistAndRender("Added");
  }, "Blocklist rule added!");
});

els.clearBlocklist?.addEventListener("click", async () => {
  if (!confirm("Are you sure you want to clear all blocklist rules?")) return;
  await withButtonLoading(els.clearBlocklist, async () => {
    state.blocklist = [];
    await saveBlocklistAndRender("Cleared");
  }, "Blocklist cleared!");
});

/* External changes */
API.storage.onChanged.addListener((changes, area)=>{
  if (area==="sync" && changes.rules && !state.saving) render();
  if (area==="sync" && changes.blocklist && !state.saving) renderBlocklist();
});

/* ---------- render ---------- */
async function render(){
  els.tbody.textContent = "";
  const list = Array.isArray(state.rules) ? state.rules : [];
  list.forEach((r,i)=> els.tbody.appendChild(renderRow(r, i, list.length)));
}

async function renderBlocklist(){
  els.blocklistTbody.textContent = "";
  const list = Array.isArray(state.blocklist) ? state.blocklist : [];
  list.forEach((b,i)=> els.blocklistTbody.appendChild(renderBlocklistRow(b, i, list.length)));
}

function renderBlocklistRow(rule, idx, total){
  const tr = document.createElement("tr");
  tr.dataset.id = rule.id;
  tr.dataset.index = idx;

  const tdEn = document.createElement("td");
  const en = document.createElement("input");
  en.type="checkbox"; en.checked=!!rule.enabled;
  en.addEventListener("change", async ()=>{ rule.enabled=en.checked; await saveBlocklistAndRender(); });
  tdEn.append(en);

  const tdPat = document.createElement("td");
  const ipPat = document.createElement("input");
  ipPat.type="text"; ipPat.value=rule.pattern||"";
  ipPat.placeholder="*://192.168.3.27/*";
  ipPat.addEventListener("change", async ()=>{ rule.pattern=ipPat.value; await saveBlocklistAndRender(); });
  ipPat.addEventListener("keyup", e=>{ if(e.key==="Enter") ipPat.blur(); });
  tdPat.append(ipPat);

  const tdOrd=document.createElement("td");
  const grp=document.createElement("div"); grp.className="order-group";
  const up=document.createElement("button"); up.className="icon up"; up.disabled=idx===0;
  const dn=document.createElement("button"); dn.className="icon down"; dn.disabled=idx===total-1;
  up.addEventListener("click", async ()=>{
    if(idx===0) return;
    const [row]=state.blocklist.splice(idx,1); state.blocklist.splice(idx-1,0,row);
    await saveBlocklistAndRender("Re-ordered");
  });
  dn.addEventListener("click", async ()=>{
    if(idx>=total-1) return;
    const [row]=state.blocklist.splice(idx,1); state.blocklist.splice(idx+1,0,row);
    await saveBlocklistAndRender("Re-ordered");
  });
  grp.append(up,dn); tdOrd.append(grp);

  const tdDel=document.createElement("td");
  const del=document.createElement("button"); del.textContent="✕";
  del.addEventListener("click", async ()=>{ state.blocklist.splice(idx,1); await saveBlocklistAndRender("Deleted"); });
  tdDel.append(del);

  tr.append(tdEn, tdPat, tdOrd, tdDel);
  return tr;
}

/* ---------- heuristics ---------- */
function patternFromUrlSmart(rawUrl) {
  try {
    const u = new URL(rawUrl);
    const h = u.hostname;
    const m = h.match(/^(.*)\.cfapps\.(.+)$/i);
    if (m) return `*://${m[1]}.cfapps.*/*`;
    return `*://${h}/*`;
  } catch { return "*://example.com/*"; }
}
function guessMeta(rawUrl) {
  try {
    const h = new URL(rawUrl).hostname;
    if (/-pro\d*\.cfapps\./i.test(h)) return { label: "PROD", color: "#dc2626", severity: "high" };
    if (/-qa\d*\.cfapps\./i.test(h))  return { label: "QA",   color: "#facc15", severity: "medium" };
    if (/^(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(h))
      return { label: "LOCAL", color: "#16a34a", severity: "low" };
  } catch {}
  return { label: "ENV", color: "#888888", severity: "low" };
}

/* ---------- init ---------- */
(async function init(){
  await load();
  await render();
  await renderBlocklist();
  ensurePreview();
})();

