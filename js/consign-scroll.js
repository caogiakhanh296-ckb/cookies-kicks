(function () {
  'use strict';

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let target = window.scrollY;
  let previous = 0;
  let anchor = false;

  document.documentElement.classList.add('cs-smooth-scroll');

  function limit(value) {
    return Math.max(0, Math.min(value, document.documentElement.scrollHeight - window.innerHeight));
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    anchor = false;
    target = window.scrollY;
  }

  function step(time) {
    const elapsed = previous ? Math.min(time - previous, 40) : 16;
    previous = time;
    target = limit(target);
    const difference = target - window.scrollY;
    if (Math.abs(difference) <= 3) {
      window.scrollTo({ top: target, behavior: 'instant' });
      stop();
      return;
    }
    window.scrollTo({ top: window.scrollY + difference * (1 - Math.exp(-elapsed / 65)), behavior: 'instant' });
    frame = requestAnimationFrame(step);
  }

  window.addEventListener('wheel', function (event) {
    if (motion.matches || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented || !event.cancelable || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (event.deltaMode === 0 && Math.abs(event.deltaY) < 40) {
      stop();
      return;
    }
    for (const element of event.composedPath()) {
      if (!(element instanceof HTMLElement) || element === document.body || element === document.documentElement) continue;
      if (element.matches('input, textarea, select, [role="dialog"]') || element.closest('[role="dialog"]')) return;
      if (element.scrollHeight > element.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(element).overflowY)) return;
    }
    if (getComputedStyle(document.body).overflowY === 'hidden') return;
    const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    if (anchor) stop();
    if (!frame) target = window.scrollY;
    target = limit(target + event.deltaY * multiplier * 0.8);
    event.preventDefault();
    if (!frame) frame = requestAnimationFrame(step);
  }, { passive: false });

  document.addEventListener('click', function (event) {
    const link = event.target instanceof Element && event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    let element;
    try { element = document.getElementById(decodeURIComponent(hash.slice(1))); } catch (_) { return; }
    if (!element) return;
    stop();
    if (motion.matches) return;
    event.preventDefault();
    const start = window.scrollY;
    const end = limit(start + element.getBoundingClientRect().top - 80);
    const duration = Math.max(420, Math.min(1050, Math.abs(end - start) * 0.25));
    let began = 0;
    anchor = true;
    function travel(time) {
      if (!began) began = time;
      const progress = Math.min(1, (time - began) / duration);
      const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      window.scrollTo({ top: start + (end - start) * ease, behavior: 'instant' });
      if (progress < 1) frame = requestAnimationFrame(travel);
      else {
        stop();
        history.replaceState(null, '', hash);
        if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1');
        element.focus({ preventScroll: true });
      }
    }
    frame = requestAnimationFrame(travel);
  });

  window.addEventListener('keydown', function (event) {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape'].includes(event.key)) stop();
  });
  window.addEventListener('pointerdown', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  motion.addEventListener('change', stop);
})();
