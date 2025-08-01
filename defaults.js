/* Shared defaults and stable ID helpers (global, non-module). */
(function (root) {
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

  root.hash32 = hash32;
  root.stableId = stableId;
  root.getDefaultRules = getDefaultRules;
})(typeof self !== "undefined" ? self : this);
