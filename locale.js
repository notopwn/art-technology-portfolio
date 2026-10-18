/* Prefer an explicit choice, then a saved choice, then the browser's language list. */
(function () {
 'use strict';
 const root = document.documentElement;
 const current = root.lang === 'en' ? 'en' : 'ko';
 const key = 'portfolio-language';
 const page = root.dataset.page || 'index.html';
 const base = new URL(current === 'en' ? '../' : './', location.href);
 const valid = language => language === 'ko' || language === 'en';
 function remember(language) {
  try { localStorage.setItem(key, language); return true; } catch (_) { return false; }
 }
 let saved = null;
 try { saved = localStorage.getItem(key); } catch (_) {}
 const requested = new URL(location.href).searchParams.get('lang');
 let stored = true;
 if (valid(requested)) stored = remember(requested);
 const browserLanguages = typeof navigator === 'undefined' ? [] :
  (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]);
 const available = Array.from(browserLanguages).filter(Boolean).map(value => String(value).toLowerCase().split(/[-_]/)[0]);
 const detected = available.find(valid) || (available.length ? 'en' : 'ko');
 const preferred = valid(requested) ? requested : valid(saved) ? saved : detected;
 if (preferred !== current) {
  const target = new URL((preferred === 'en' ? 'en/' : '') + page, base);
  target.search = location.search;
  target.hash = location.hash;
  location.replace(target.href);
 }
 document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-language-choice]').forEach(function (link) {
   link.addEventListener('click', function () {
    const language = link.dataset.languageChoice;
    remember(language);
    const target = new URL(link.href);
    target.searchParams.set('lang', language);
    target.hash = location.hash;
    link.href = target.href;
   });
  });
  // A URL choice still works across pages when local storage is unavailable.
  if (valid(requested) && !stored) {
   document.querySelectorAll('a[href]').forEach(function (link) {
    const target = new URL(link.href, location.href);
    if (target.origin === base.origin && target.pathname.startsWith(base.pathname) &&
        (/\.html$/.test(target.pathname) || target.pathname.endsWith('/')) && !link.dataset.languageChoice) {
     target.searchParams.set('lang', requested);
     link.href = target.href;
    }
   });
  }
 });
})();
