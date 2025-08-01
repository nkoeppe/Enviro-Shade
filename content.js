/*
  Minimal, high-signal overlay:
    - Prominent chip with "⚠️ PROD" / "QA" / "LOCAL"
    - Large diagonal watermark
    - No bars/stripes/animations.
  Pings background on SPA navigation.
*/

(function () {
  const API = typeof browser !== "undefined" ? browser : chrome;

  const STYLE_ID = "ecb2-style";
  const IDS = { root: "ecb2-root", chip: "ecb2-chip", wm: "ecb2-watermark" };

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const css = `
      #${IDS.root}{position:fixed;inset:0;pointer-events:none;z-index:2147483647}
      #${IDS.chip}{
        position:fixed; top:10px; right:10px;
        font:700 var(--ecb2-chip-font,14px)/1 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;
        padding:6px 10px; border-radius:8px; opacity:.96;
        box-shadow:0 2px 8px rgba(0,0,0,.25);
        background:var(--ecb2-color,#dc2626); color:var(--ecb2-text,#fff);
      }
      #${IDS.wm}{
        position:fixed; inset:0; display:flex; align-items:center; justify-content:center;
        transform:rotate(var(--ecb2-wm-angle,-26deg));
        font-weight:900; letter-spacing:.18em;
        font-size:var(--ecb2-wm-size,min(22vw,220px));
        color:var(--ecb2-color,#dc2626); opacity:var(--ecb2-wm-opacity,.10);
        filter:drop-shadow(0 2px 1px rgba(0,0,0,.25));
      }`;
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = css;
    document.documentElement.appendChild(el);
  }

  function hexToRgb(hex){ const m=/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex||""); return m?[parseInt(m[1],16),parseInt(m[2],16),parseInt(m[3],16)]:[0,0,0]; }
  function textColorFor(hex){
    const [r,g,b]=hexToRgb(hex).map(v=>v/255);
    const lin=v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);
    const L=0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
    return L>0.5?"#000":"#fff";
  }

  function mount() {
    if (document.getElementById(IDS.root)) return;
    const root = document.createElement("div"); root.id = IDS.root;
    const chip = document.createElement("div"); chip.id = IDS.chip;
    const wm = document.createElement("div"); wm.id = IDS.wm;
    root.appendChild(chip); root.appendChild(wm);
    document.documentElement.appendChild(root);
  }

  function unmount() {
    const root = document.getElementById(IDS.root);
    if (root && root.parentNode) root.parentNode.removeChild(root);
  }

  function applyOverlay(env, color, label) {
    ensureStyle(); mount();
    const root = document.getElementById(IDS.root);
    const chip = document.getElementById(IDS.chip);
    const wm = document.getElementById(IDS.wm);

    root.style.setProperty("--ecb2-color", color);
    root.style.setProperty("--ecb2-text", textColorFor(color));
    root.style.setProperty("--ecb2-wm-opacity", env === "prod" ? "0.10" : env === "qa" ? "0.08" : "0.06");
    root.style.setProperty("--ecb2-wm-size", env === "prod" ? "min(22vw,220px)" : env === "qa" ? "min(18vw,180px)" : "min(14vw,140px)");
    root.style.setProperty("--ecb2-wm-angle", "-26deg");
    root.style.setProperty("--ecb2-chip-font", env === "prod" ? "14px" : env === "qa" ? "13px" : "12px");

    chip.textContent = env === "prod" ? `⚠️ ${label}` : label;
    wm.textContent = label;
  }

  function clearOverlay(){ unmount(); }

  API.runtime.onMessage.addListener((msg) => {
    if (!msg || msg.type !== "env-color-banner:set") return;
    const p = msg.payload;
    if (p && p.color) applyOverlay(p.env, p.color, p.label);
    else clearOverlay();
  });

  function ping() {
    try { API.runtime.sendMessage({ type: "env-color-banner:ping", url: location.href }); } catch {}
  }

  ping();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ping, { once: true });
  const _ps = history.pushState, _rs = history.replaceState;
  history.pushState = function () { const r = _ps.apply(this, arguments); ping(); return r; };
  history.replaceState = function () { const r = _rs.apply(this, arguments); ping(); return r; };
  window.addEventListener("popstate", ping);
  window.addEventListener("hashchange", ping);
})();
