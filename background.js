/*
  Combined background script for Manifest V3.
  Order: defaults.js, storage.js, background.js
*/

// From defaults.js
function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function stableId(rule) {
  const t = `${rule.pattern}|${rule.label}|${rule.color}|${rule.severity}`;
  return `r_${hash32(t).toString(36)}`;
}

function getDefaultRules() {
  const raw = [
    { pattern: "*://*-pro[0-9]*.cfapps.*/*", label: "PROD",  color: "#dc2626", severity: "high",   enabled: true },
    { pattern: "*://*-qa[0-9]*.cfapps.*/*",  label: "QA",    color: "#facc15", severity: "medium", enabled: true },
    { pattern: "*://localhost*/*",           label: "LOCAL", color: "#16a34a", severity: "low",    enabled: true },
    { pattern: "*://127.0.0.1*/*",           label: "LOCAL", color: "#16a34a", severity: "low",    enabled: true },
    { pattern: "*://192.168.*/*",            label: "LOCAL", color: "#16a34a", severity: "low",    enabled: true },
    { pattern: "*://10.*/*",                 label: "LOCAL", color: "#16a34a", severity: "low",    enabled: true },
    { pattern: "*://172.1[6-9].*/*",         label: "LOCAL", color: "#16a34a", severity: "low",    enabled: true },
    { pattern: "*://172.2[0-9].*/*",         label: "LOCAL", color: "#16a34a", severity: "low",    enabled: true },
    { pattern: "*://172.3[0-1].*/*",         label: "LOCAL", color: "#16a34a", severity: "low",    enabled: true }
  ];
  return raw.map(r => ({ ...r, id: stableId(r) }));
}


// From storage.js
const API = typeof browser !== "undefined" ? browser : chrome;

function normalizeRules(list) {
  const seen = new Set();
  const out = [];
  for (const r of Array.isArray(list) ? list : []) {
    const rule = {
      enabled: true,
      severity: "low",
      pattern: "",
      label: "",
      color: "#888888",
      ...r,
    };
    const key = `${rule.pattern}|${rule.label}|${rule.color}|${rule.severity}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...rule, id: rule.id || stableId(rule) });
  }
  return out;
}

async function getRules() {
  try {
    const res = await API.storage.sync.get({ rules: null });
    const base = Array.isArray(res.rules) && res.rules.length ? res.rules : getDefaultRules();
    return normalizeRules(base);
  } catch {
    return normalizeRules(getDefaultRules());
  }
}

async function saveRules(rules) {
  const clean = normalizeRules(rules);
  await API.storage.sync.set({ rules: clean });
  return clean;
}


// From background.js
const ACTION = (API && (API.action || API.browserAction)) || null;

function globToRegex(glob) {
  // const esc = s => s.replace(/[|\\{}()[\\]^$+?.]/g, "\\$&");
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

function isContentEligible(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch { return false; }
}

function setBadge(label, color) {
  if (!ACTION) return;
  if (!label || !color) { ACTION.setBadgeText({ text: "" }); return; }
  const text = label === "PROD" ? "PRO" : label === "LOCAL" ? "LOC" : label;
  ACTION.setBadgeText({ text });
  ACTION.setBadgeBackgroundColor?.({ color });
}

function setOverlay(tabId, url, payload) {
  if (!isContentEligible(url)) return;
  try {
    const p = API.tabs.sendMessage(tabId, { type: "env-color-banner:set", payload });
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {}
}

async function getActiveTab() {
  try { const [t] = await API.tabs.query({ active: true, lastFocusedWindow: true }); if (t) return t; } catch {}
  try { const [t] = await API.tabs.query({ active: true, currentWindow: true }); if (t) return t; } catch {}
  try { const [t] = await API.tabs.query({ active: true }); return t || null; } catch { return null; }
  return null;
}

async function applyForTabId(tabId, reason) {
  try {
    if (tabId == null) return;
    const tab = await API.tabs.get(tabId);
    if (!tab || tab.discarded || tab.hidden) return;

    const url = tab.pendingUrl || tab.url || "";
    if (!url) { setBadge(null, null); setOverlay(tabId, "", null); return; }

    const rules = await getRules();
    let match = null;
    for (const r of rules) {
      if (!r || r.enabled === false) continue;
      if (globToRegex(r.pattern || "").test(url)) { match = r; break; }
    }

    if (match) {
      setBadge(match.label, match.color);
      setOverlay(tabId, url, { env: match.id, label: match.label, color: match.color, severity: match.severity || "low" });
    } else {
      setBadge(null, null);
      setOverlay(tabId, url, null);
    }
  } catch {}
}

async function applyForFocused(reason) {
  const t = await getActiveTab();
  if (t?.id != null) await applyForTabId(t.id, reason);
}

(function init() {
  API.tabs.onActivated.addListener(({ tabId }) => applyForTabId(tabId, "tabs.onActivated"));

  API.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab?.active) return;
    if (changeInfo.url || changeInfo.pendingUrl || changeInfo.status === "complete" || changeInfo.status === "loading") {
      applyForTabId(tabId, "tabs.onUpdated");
    }
  });

  API.tabs.onCreated?.addListener((tab) => { if (tab?.active && tab.id != null) applyForTabId(tab.id, "tabs.onCreated"); });
  API.tabs.onReplaced?.addListener((added) => applyForTabId(added, "tabs.onReplaced"));
  API.windows.onFocusChanged.addListener((winId) => { if (winId !== API.windows.WINDOW_ID_NONE) applyForFocused("windows.onFocusChanged"); });

  API.webNavigation?.onCommitted?.addListener((d) => { if (d?.tabId != null) applyForTabId(d.tabId, "webNavigation.onCommitted"); });
  API.webNavigation?.onCompleted?.addListener((d) => { if (d?.tabId != null) applyForTabId(d.tabId, "webNavigation.onCompleted"); });


  API.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.type === "ecb:getRules")        return getRules();
  if (msg?.type === "ecb:saveRules")       return saveRules(msg.payload);
  if (msg?.type === "ecb:getDefaultRules") return Promise.resolve(getDefaultRules());
});


  (API.action || API.browserAction)?.onClicked?.addListener(() => {
    if (API.runtime.openOptionsPage) API.runtime.openOptionsPage();
  });

  API.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.rules) applyForFocused("rules changed");
  });

  applyForFocused("init");
})();
