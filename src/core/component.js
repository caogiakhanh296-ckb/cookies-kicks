window.CK_DUNE.coreReady = true;
document.addEventListener('error', function (e) {
  var t = e.target;
  if (!t || t.tagName !== 'IMG') return;
  if (t.hasAttribute('data-hide-err')) { t.style.display = 'none'; return; }
  var fb = (window.CK && window.CK.FALLBACK_IMG) || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  if (t.getAttribute('src') !== fb) t.setAttribute('src', fb);
}, true);
