/* 
  Background: evaluates the active tab’s URL against user-configured rules.
  Sends a single overlay payload to the content script and sets a toolbar badge.
  Uses storage.sync; falls back to built-in defaults on first run.
*/

/** Storage schema */
const DEFAULT_RULES = [
  { id: "prod",   pattern: "*://*-pro[0-9]*.cfapps.*/*",  label: "PROD", color: "#dc2626", severity: "high", enabled: true },
  { id: "qa",   pattern: "*://*-qa[0-9]*.cfapps.*/*",  label: "QA", color: "#facc15", severity: "medium", enabled: true },
  { id: "local",  pattern: "*://localhost*/*",       label: "LOCAL",color: "#16a34a", severity: "low",   enabled: true },
  { id: "local2", pattern: "*://127.0.0.1*/*",       label: "LOCAL",color: "#16a34a", severity: "low",   enabled: true },
  { id: "local3", pattern: "*://192.168.*/*",        label: "LOCAL",color: "#16a34a", severity: "low",   enabled: true },
  { id: "local4", pattern: "*://10.*/*",             label: "LOCAL",color: "#16a34a", severity: "low",   enabled: true },
  { id: "local5", pattern: "*://172.1[6-9]*/*",      label: "LOCAL",color: "#16a34a", severity: "low",   enabled: true },
  { id: "local6", pattern: "*://172.2[0-9]*/*",      label: "LOCAL",color: "#16a34a", severity: "low",   enabled: true },
  { id: "local7", pattern: "*://172.3[0-1]*/*",      label: "LOCAL",color: "#16a34a", severity: "low",   enabled: true }
];

const API = typeof browser !== "undefined" ? browser : chrome;

/** Converts a glob like *://*-pro[0-9]*.cfapps.*\/* to a case-insensitive RegExp. */
function globToRegex(glob) {
  const esc = s => s.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  let out = "^";

  for (let i = 0; i < glob.length; ) {
    const c = glob[i];

    if (c === "*") {
      out += ".*";
      i++;
    }
    else if (c === "?") {
      out += ".";
      i++;
    }
    else if (c === "[") {
      // find matching ]
      const end = glob.indexOf("]", i + 1);
      if (end > i) {
        const charClass = glob.slice(i, end + 1);
        const next = glob[end + 1];
        if (next === "*") {
          // zero-or-more of that class
          out += charClass + "*";
          i = end + 2;
        } else {
          // exactly one of that class
          out += charClass;
          i = end + 1;
        }
      } else {
        // stray “[“
        out += "\\[";
        i++;
      }
    }
    else {
      out += esc(c);
      i++;
    }
  }

  out += "$";
  return new RegExp(out, "i");
}

/** Loads rules from storage or returns defaults. */
async function getRules() {
  const { rules } = await API.storage.sync.get({ rules: null });
  if (!rules || !Array.isArray(rules) || rules.length === 0) return DEFAULT_RULES.slice();
  return rules;
}

/** Badge helpers (MV2 browserAction). */
function setBadge(label, color) {
  if (!API.browserAction) return;
  if (!label || !color) {
    API.browserAction.setBadgeText({ text: "" });
    return;
  }
  const text = label === "PROD" ? "PRO" : label === "LOCAL" ? "LOC" : label;
  API.browserAction.setBadgeText({ text });
  API.browserAction.setBadgeBackgroundColor({ color });
}

/** Sends overlay payload to content. */
function setOverlay(tabId, payload) {
  try { API.tabs.sendMessage(tabId, { type: "env-color-banner:set", payload }); } catch {}
}

/** Applies configuration for a concrete tab id. */
async function applyForTabId(tabId, reason) {
  try {
    const tab = await API.tabs.get(tabId);
    if (!tab || !tab.windowId || tab.discarded || tab.hidden) return;

    const url = tab.pendingUrl || tab.url || "";
    const rules = await getRules();

    let match = null;
    for (const r of rules) {
      if (!r.enabled) continue;
      const rx = globToRegex(r.pattern || "");
      if (rx.test(url)) { match = r; break; }
    }

    if (match) {
      setBadge(match.label, match.color);
      setOverlay(tab.id, { env: match.id, label: match.label, color: match.color, severity: match.severity || "low" });
    } else {
      setBadge(null, null);
      setOverlay(tab.id, null);
    }
  } catch {}
}

/** Finds active tab without Windows API (for Zen compatibility). */
async function getActiveTab() {
  try { const [t] = await API.tabs.query({ active: true, lastFocusedWindow: true }); if (t) return t; } catch {}
  try { const [t] = await API.tabs.query({ active: true, currentWindow: true }); if (t) return t; } catch {}
  try { const [t] = await API.tabs.query({ active: true }); return t || null; } catch { return null; }
}

async function applyForFocused(reason) {
  const t = await getActiveTab();
  if (t?.id != null) await applyForTabId(t.id, reason);
}

/** Wire events. */
function wire() {
  API.tabs.onActivated.addListener(({ tabId }) => applyForTabId(tabId, "tabs.onActivated"));
  API.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab?.active && (changeInfo.url || changeInfo.pendingUrl || changeInfo.status === "complete" || changeInfo.status === "loading")) {
      applyForTabId(tabId, "tabs.onUpdated");
    }
  });
  API.tabs.onCreated.addListener((tab) => { if (tab.active && tab.id != null) applyForTabId(tab.id, "tabs.onCreated"); });
  API.tabs.onReplaced.addListener((added) => applyForTabId(added, "tabs.onReplaced"));
  API.windows.onFocusChanged.addListener((winId) => { if (winId !== API.windows.WINDOW_ID_NONE) applyForFocused("windows.onFocusChanged"); });

  if (API.webNavigation) {
    API.webNavigation.onCommitted.addListener((d) => { if (d.tabId != null) applyForTabId(d.tabId, "webNavigation.onCommitted"); });
    API.webNavigation.onCompleted.addListener((d) => { if (d.tabId != null) applyForTabId(d.tabId, "webNavigation.onCompleted"); });
  }

  API.runtime.onMessage.addListener((msg, sender) => {
    if (msg?.type === "env-color-banner:ping") {
      if (sender?.tab?.id != null) applyForTabId(sender.tab.id, "content ping");
      else applyForFocused("content ping (no tab)");
    }
    if (msg?.type === "ecb:reapplyActive") applyForFocused("options reapply");
  });

  API.browserAction?.onClicked?.addListener(() => {
    if (API.runtime.openOptionsPage) API.runtime.openOptionsPage();
  });

  API.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.rules) applyForFocused("rules changed");
  });
}

/** Bootstrap */
(function init() {
  wire();
  applyForFocused("init");
  setInterval(() => applyForFocused("poll"), 1000);
})();
