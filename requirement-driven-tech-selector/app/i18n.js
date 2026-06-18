const KEY = "tech_selector_lang";

export function getLang() {
  const saved = localStorage.getItem(KEY);
  return (saved === "it" || saved === "en") ? saved : "en";
}

export function setLang(lang) {
  localStorage.setItem(KEY, lang);
}

export function pick(obj, baseKey) {
  const lang = getLang();
  const k = `${baseKey}_${lang}`;
  return obj?.[k] ?? obj?.[`${baseKey}_en`] ?? obj?.[`${baseKey}_it`] ?? "";
}

export function t(dict) {
  const lang = getLang();
  return dict?.[lang] ?? dict?.["en"] ?? "";
}

export function attachLangSelector(selectId = "langSelect") {
  const el = document.getElementById(selectId);
  if (!el) return;
  el.value = getLang();
  el.addEventListener("change", () => {
    setLang(el.value);
    window.location.reload();
  });
}
