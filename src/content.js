/*
 * SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2025 Nicolas Köppe
 */

/*
  Minimal overlay driven by severity:
    high  → stronger watermark, warning emoji, larger chip
    medium→ medium opacity/size
    low   → subtle
  Pings background on SPA navigation.
*/
(function () {
  const API = typeof browser !== "undefined" ? browser : chrome;
  const STYLE_ID = "ecb-style";
  const IDS = { root: "ecb-root", chip: "ecb-chip", wm: "ecb-watermark" };

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const css = `
      #${IDS.root}{position:fixed;inset:0;pointer-events:none;z-index:2147483647}
      #${IDS.chip}{
        position:fixed; top:10px; right:10px; font:700 13px/1 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;
        padding:6px 10px; border-radius:8px; opacity:.96; box-shadow:0 2px 8px rgba(0,0,0,.25);
        background:var(--ecb-color,#dc2626); color:var(--ecb-text,#fff);
      }
      #${IDS.wm}{
        position:fixed; inset:0; display:flex; align-items:center; justify-content:center;
        transform:rotate(-26deg); font-weight:900; letter-spacing:.18em;
        font-size:var(--ecb-wm-size,min(18vw,180px)); color:var(--ecb-color,#dc2626); opacity:var(--ecb-wm-opacity,.08);
        filter:drop-shadow(0 2px 1px rgba(0,0,0,.25));
      }`;
    const el = document.createElement("style"); el.id = STYLE_ID; el.textContent = css;
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
    root.append(chip, wm);
    document.documentElement.appendChild(root);
  }
  function unmount(){ const n=document.getElementById(IDS.root); if(n&&n.parentNode) n.parentNode.removeChild(n); }

  function applyOverlay(payload) {
    ensureStyle(); mount();
    const { label, color, severity="" } = payload || {};
    const sev = String(severity || "low").toLowerCase();
    const root = document.getElementById(IDS.root);
    const chip = document.getElementById(IDS.chip);
    const wm = document.getElementById(IDS.wm);

    const wmOpacity = sev === "high" ? 0.12 : sev === "medium" ? 0.09 : 0.06;
    const wmSize    = sev === "high" ? "min(22vw,220px)" : sev === "medium" ? "min(18vw,180px)" : "min(14vw,140px)";
    const chipSize  = sev === "high" ? "14px" : sev === "medium" ? "13px" : "12px";
    const prefix    = sev === "high" ? "⚠️ " : "";

    root.style.setProperty("--ecb-color", color);
    root.style.setProperty("--ecb-text", textColorFor(color));
    root.style.setProperty("--ecb-wm-opacity", String(wmOpacity));
    root.style.setProperty("--ecb-wm-size", wmSize);
    chip.style.fontSize = chipSize;

    chip.textContent = `${prefix}${label}`;
    wm.textContent = label;
  }

  API.runtime.onMessage.addListener((msg) => {
    if (!msg || msg.type !== "env-color-banner:set") return;
    const p = msg.payload;
    if (p && p.color) applyOverlay(p); else unmount();
  });

  function ping(){ try { API.runtime.sendMessage({ type: "env-color-banner:ping", url: location.href }); } catch {} }
  ping();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ping, { once: true });
  const PS = history.pushState, RS = history.replaceState;
  history.pushState = function(){ const r=PS.apply(this,arguments); ping(); return r; };
  history.replaceState = function(){ const r=RS.apply(this,arguments); ping(); return r; };
  addEventListener("popstate", ping); addEventListener("hashchange", ping);
})();
