/* Korean is the default. Explicit language links also work without JavaScript. */
(function () {
 'use strict';
 const root = document.documentElement;
 const english = root.lang === 'en';
 const key = 'portfolio-language';
 const page = root.dataset.page || 'index.html';
 const base = new URL(english ? '../' : './', location.href);
 function remember(language) { try { localStorage.setItem(key, language); } catch (_) {} }
 let saved = null;
 try { saved = localStorage.getItem(key); } catch (_) {}
 if (english) remember('en');
 else if (saved === 'en') {
  const target = new URL('en/' + page, base);
  target.search = location.search;
  target.hash = location.hash;
  location.replace(target.href);
 }
 document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-language-choice]').forEach(function (link) {
   link.addEventListener('click', function () {
    remember(link.dataset.languageChoice);
    const target = new URL(link.href);
    target.hash = location.hash;
    link.href = target.href;
   });
  });
 });
})();
