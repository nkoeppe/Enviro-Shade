/* Background: rule evaluation, badge/overlay, and control messages. */

const API = typeof browser !== "undefined" ? browser : chrome;
const ACTION = (API && (API.action || API.browserAction)) || null;

/** Converts a simple glob to a case-insensitive RegExp with [class] quantifiers. */
function globToRegex(glob) {
  const esc = s => s.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
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

/** Returns true if the page can host a content script overlay. */
function isContentEligible(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch { return false; }
}

/** Badge helpers (MV2/MV3). */
function setBadge(label, color) {
  if (!ACTION) return;
  if (!label || !color) { ACTION.setBadgeText({ text: "" }); return; }
  const text = label === "PROD" ? "PRO" : label === "LOCAL" ? "LOC" : label;
  ACTION.setBadgeText({ text });
  ACTION.setBadgeBackgroundColor?.({ color });
}

/** Overlay messaging; ignored on non-eligible pages. */
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

async function bestContentTab() {
  try {
    const all = await API.tabs.query({ currentWindow: true });
    for (const t of all) if (t.active && isContentEligible(t.url || t.pendingUrl || "")) return t;
    for (const t of all) if (isContentEligible(t.url || t.pendingUrl || "")) return t;
  } catch {}
  return null;
}

/** Evaluate a specific tab. */
async function applyForTabId(tabId, reason) {
  try {
    if (tabId == null) return;
    const tab = await API.tabs.get(tabId);
    if (!tab || tab.discarded || tab.hidden) return;

    const url = tab.pendingUrl || tab.url || "";
    if (!url) { setBadge(null, null); setOverlay(tabId, "", null); return; }

    const rules = typeof getRules === "function" ? await getRules() : [];
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

/** Evaluate current focus. */
async function applyForFocused(reason) {
  const t = await getActiveTab();
  if (t?.id != null) await applyForTabId(t.id, reason);
}

/** Wiring. */
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

  API.runtime.onMessage.addListener(async (msg, sender) => {
    if (msg?.type === "env-color-banner:ping") {
      if (sender?.tab?.id != null) applyForTabId(sender.tab.id, "content ping");
      else applyForFocused("content ping (no tab)");
    }
    if (msg?.type === "ecb:reapplyActive") applyForFocused("options reapply");
    if (msg?.type === "ecb:applyForTabId" && typeof msg.tabId === "number") applyForTabId(msg.tabId, "options explicit");
    if (msg?.type === "ecb:applyBestTab") {
      const t = await bestContentTab();
      if (t?.id != null) applyForTabId(t.id, "options best");
    }
  });

  (API.action || API.browserAction)?.onClicked?.addListener(() => {
    if (API.runtime.openOptionsPage) API.runtime.openOptionsPage();
  });

  API.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.rules) applyForFocused("rules changed");
  });

  applyForFocused("init");
})();
