/* Storage helpers with normalization/dedup (global, non-module). */
(function (root) {
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
      out.push({ ...rule, id: rule.id || (typeof stableId === "function" ? stableId(rule) : String(Date.now())) });
    }
    return out;
  }

  async function getRules() {
    try {
      const res = await API.storage.sync.get({ rules: null });
      const base = Array.isArray(res.rules) && res.rules.length ? res.rules : (typeof getDefaultRules === "function" ? getDefaultRules() : []);
      return normalizeRules(base);
    } catch {
      return normalizeRules(typeof getDefaultRules === "function" ? getDefaultRules() : []);
    }
  }

  async function saveRules(rules) {
    const clean = normalizeRules(rules);
    await API.storage.sync.set({ rules: clean });
    return clean;
  }

  root.normalizeRules = normalizeRules;
  root.getRules = getRules;
  root.saveRules = saveRules;
})(typeof self !== "undefined" ? self : this);
