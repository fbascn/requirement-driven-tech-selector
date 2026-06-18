import { pick, t } from "./i18n.js";

export function nav(active) {
  const links = [
    ["index.html", {en:"Home", it:"Home"}],
    ["criteria.html", {en:"Criteria", it:"Criteri"}],
    ["questions.html", {en:"Questions", it:"Domande"}],
    ["technologies.html", {en:"Technologies", it:"Tecnologie"}],
    ["run.html", {en:"Run", it:"Esecuzione"}],
  ];
  const nav = document.createElement("div");
  nav.className = "nav";
  const left = document.createElement("div");
  left.className = "navlinks";
  for (const [href, label] of links) {
    const a = document.createElement("a");
    a.href = href;
    a.className = "pill" + (href === active ? " active" : "");
    a.textContent = t(label);
    left.appendChild(a);
  }
  const right = document.createElement("div");
  const sel = document.createElement("select");
  sel.id = "langSelect";
  sel.className = "select";
  const optEn = document.createElement("option"); optEn.value = "en"; optEn.textContent = "EN";
  const optIt = document.createElement("option"); optIt.value = "it"; optIt.textContent = "IT";
  sel.append(optEn,optIt);
  right.appendChild(sel);
  nav.append(left,right);
  return nav;
}

export function setTitle(h1Id, dict) {
  const el = document.getElementById(h1Id);
  if (el) el.textContent = t(dict);
}

export function criterionLabel(c) {
  return (
    pick(c, "label") ||
    pick(c, "label_en") ||
    pick(c, "label_it") ||
    c.id ||
    ""
  );
}

export function macroLabel(m) {
  if (!m) return "";
  return (
    pick(m, "label") ||
    pick(m, "label_en") ||
    pick(m, "label_it") ||
    ""
  );
}
