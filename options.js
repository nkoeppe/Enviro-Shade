/* 
  Options page controller:
  - Renders rule rows
  - Persists to storage.sync on any change
  - Restore defaults / add / delete / reorder
  - "Test" asks background to re-evaluate the active tab
*/

const API = typeof browser !== "undefined" ? browser : chrome;

const DEFAULT_RULES = [
  { id: cryptoId(), pattern: "*://*-pro[0-9]*.cfapps.*/*", label: "PROD", color: "#dc2626", severity: "high", enabled: true },
  { id: cryptoId(), pattern: "*://*-qa[0-9]*.cfapps.*/*",  label: "QA",   color: "#facc15", severity: "medium", enabled: true },
  { id: cryptoId(), pattern: "*://localhost*/*",      label: "LOCAL",color: "#16a34a", severity: "low",   enabled: true },
  { id: cryptoId(), pattern: "*://127.0.0.1*/*",      label: "LOCAL",color: "#16a34a", severity: "low",   enabled: true },
  { id: cryptoId(), pattern: "*://192.168.*/*",       label: "LOCAL",color: "#16a34a", severity: "low",   enabled: true },
  { id: cryptoId(), pattern: "*://10.*/*",            label: "LOCAL",color: "#16a34a", severity: "low",   enabled: true }
];

function cryptoId() {
  try { return crypto.getRandomValues(new Uint32Array(1))[0].toString(36); }
  catch { return Math.random().toString(36).slice(2); }
}

const els = {
  tbody: document.querySelector("#rules tbody"),
  add: document.getElementById("add"),
  defaults: document.getElementById("defaults"),
  test: document.getElementById("test"),
  status: document.getElementById("status")
};

async function loadRules() {
  const { rules } = await API.storage.sync.get({ rules: null });
  if (!rules || !Array.isArray(rules) || rules.length === 0) return DEFAULT_RULES.slice();
  return rules;
}

function saveRules(rules) {
  return API.storage.sync.set({ rules }).then(() => {
    els.status.textContent = "Saved.";
    setTimeout(() => (els.status.textContent = ""), 1000);
  });
}

function renderRow(rule, idx, total) {
  const tr = document.createElement("tr");
  tr.dataset.id = rule.id;

  const tdEn = document.createElement("td");
  const en = document.createElement("input");
  en.type = "checkbox"; en.checked = !!rule.enabled;
  en.addEventListener("change", () => updateRule(rule.id, { enabled: en.checked }));
  tdEn.appendChild(en);

  const tdPat = document.createElement("td");
  const pat = document.createElement("input");
  pat.type = "text"; pat.value = rule.pattern; pat.placeholder = "*://*.pro*.cfapps.*/*";
  pat.addEventListener("input", () => updateRule(rule.id, { pattern: pat.value }));
  tdPat.appendChild(pat);

  const tdLabel = document.createElement("td");
  const label = document.createElement("input");
  label.type = "text"; label.value = rule.label || "";
  label.addEventListener("input", () => updateRule(rule.id, { label: label.value }));
  tdLabel.appendChild(label);

  const tdColor = document.createElement("td");
  const color = document.createElement("input");
  color.type = "color"; color.value = rule.color || "#dc2626";
  color.addEventListener("input", () => updateRule(rule.id, { color: color.value }));
  tdColor.appendChild(color);

  const tdSev = document.createElement("td");
  const sel = document.createElement("select");
  ["low","medium","high"].forEach(s => {
    const o = document.createElement("option");
    o.value = s; o.textContent = s;
    if ((rule.severity || "low") === s) o.selected = true;
    sel.appendChild(o);
  });
  sel.addEventListener("change", () => updateRule(rule.id, { severity: sel.value }));
  tdSev.appendChild(sel);

  const tdOrder = document.createElement("td");
  tdOrder.className = "order";
  const up = document.createElement("button"); up.textContent = "↑"; up.disabled = idx === 0;
  const down = document.createElement("button"); down.textContent = "↓"; down.disabled = idx === total - 1;
  up.addEventListener("click", () => moveRule(rule.id, -1));
  down.addEventListener("click", () => moveRule(rule.id, +1));
  tdOrder.appendChild(up); tdOrder.appendChild(down);

  const tdDel = document.createElement("td");
  const del = document.createElement("button"); del.textContent = "✕";
  del.addEventListener("click", () => deleteRule(rule.id));
  tdDel.appendChild(del);

  tr.append(tdEn, tdPat, tdLabel, tdColor, tdSev, tdOrder, tdDel);
  return tr;
}

async function render() {
  const rules = await loadRules();
  els.tbody.textContent = "";
  rules.forEach((r, i) => els.tbody.appendChild(renderRow(r, i, rules.length)));
}

async function updateRule(id, patch) {
  const rules = await loadRules();
  const idx = rules.findIndex(r => r.id === id);
  if (idx === -1) return;
  rules[idx] = { ...rules[idx], ...patch };
  await saveRules(rules);
}

async function moveRule(id, delta) {
  const rules = await loadRules();
  const idx = rules.findIndex(r => r.id === id);
  if (idx === -1) return;
  const tgt = Math.max(0, Math.min(rules.length - 1, idx + delta));
  if (tgt === idx) return;
  const [row] = rules.splice(idx, 1);
  rules.splice(tgt, 0, row);
  await saveRules(rules);
  await render();
}

async function deleteRule(id) {
  const rules = await loadRules();
  const idx = rules.findIndex(r => r.id === id);
  if (idx === -1) return;
  rules.splice(idx, 1);
  await saveRules(rules);
  await render();
}

els.add.addEventListener("click", async () => {
  const rules = await loadRules();
  rules.push({ id: cryptoId(), pattern: "*://example.com/*", label: "ENV", color: "#888888", severity: "low", enabled: true });
  await saveRules(rules);
  await render();
});

els.defaults.addEventListener("click", async () => {
  await saveRules(DEFAULT_RULES.slice());
  await render();
});

els.test.addEventListener("click", () => {
  API.runtime.sendMessage({ type: "ecb:reapplyActive" });
});

render();
