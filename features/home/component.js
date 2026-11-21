document.addEventListener('DOMContentLoaded', () => {
    if (CK.renderLegitReviews) CK.renderLegitReviews('#home-legit-reviews', { limit: 6 });
    fetch('/api/posts')
      .then(r => r.json())
      .then(d => {
        const list = (d && Array.isArray(d.posts) ? d.posts : []).slice(0, 3);
        const mount = document.getElementById('home-posts-grid');
        if (!mount || !list.length) return;
        const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        mount.innerHTML = list.map(p => `
          <a href="posts.html?slug=${encodeURIComponent(p.slug)}" class="group bg-white border border-line hover:border-black transition-colors flex flex-col justify-between">
            <div>
              <div class="aspect-[16/10] bg-[#EBEEEF] border-b border-line overflow-hidden relative">
                <img src="${esc(p.coverImage)}" alt="${esc(p.title)}" class="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                <span class="absolute top-2.5 left-2.5 ck-mono text-[10px] font-bold uppercase px-2 py-0.5 bg-black text-white">${esc(p.category)}</span>
              </div>
              <div class="p-5">
                <div class="ck-mono text-[11px] text-muted mb-1.5 tabular-nums">${esc(p.createdAt || '')} · ${Number(p.readMinutes) || 4} phút đọc</div>
                <h3 class="font-bold text-base text-black group-hover:text-[#002FA7] leading-snug mb-2">${esc(p.title)}</h3>
                <p class="text-xs text-charcoal line-clamp-3 leading-relaxed">${esc(p.summary || '')}</p>
              </div>
            </div>
            <div class="px-5 pb-4 pt-1 text-xs font-bold uppercase tracking-wider text-black group-hover:text-[#002FA7]">Đọc chi tiết →</div>
          </a>
        `).join('');
      })
      .catch(() => {});
    let activeFeatKey = 'featured';
    const featTrack = document.getElementById('feat-track');
    const featCarousel = CK.initCarousel({
      track: '#feat-track',
      prev: '#feat-prev',
      next: '#feat-next',
      bar: '#feat-bar',
    });
    const dealCarousel = CK.initCarousel({
      track: '#deal-track',
      prev: '#deal-prev',
      next: '#deal-next',
      bar: '#deal-bar',
    });

    function uniqueByGroup(list) {
      const seen = new Set();
      const out = [];
      list.forEach(p => {
        const g = p.group || String(p.id);
        if (!seen.has(g)) {
          seen.add(g);
          out.push(p);
        }
      });
      return out;
    }

    function buildHomeSections() {
      const all = CK.getProducts();
      const byId = id => all.find(p => p.id === id);

      const bballReps = uniqueByGroup(all.filter(p => p.category === 'Basketball'));
      const badmintonItems = all.filter(p => p.category === 'Badminton');
      const runningTrailItems = all.filter(p => p.category === 'Running' || p.category === 'Trail');
      const tennisCyclingItems = all.filter(p => p.category === 'Tennis' || p.category === 'Cycling');

      const featSets = {
        featured: [41, 56, 166, 173, 179, 181, 187, 193, 44, 53, 83, 47, 93, 30].map(byId).filter(Boolean),
        basketball: bballReps,
        badminton: badmintonItems,
        running: runningTrailItems,
        tennis: tennisCyclingItems,
        deals: all.filter(p => p.tag === 'DEAL'),
      };

      const items = featSets[activeFeatKey] || featSets.featured;
      featTrack.innerHTML = items.map(p => CK.productCard(p)).join('');
      if (featCarousel) requestAnimationFrame(() => featCarousel.update());

      const gridItems = [byId(41), byId(56), byId(166), byId(179), byId(187), byId(193), byId(53), byId(83)].filter(Boolean);
      const tightGridEl = document.getElementById('home-tight-grid');
      if (tightGridEl) {
        tightGridEl.innerHTML = gridItems.map(p => CK.productCard(p)).join('');
      }

      const dealTrackEl = document.getElementById('deal-track');
      if (dealTrackEl) {
        const deals = all.filter(p => p.tag === 'DEAL');
        dealTrackEl.innerHTML = deals.map(p => CK.productCard(p, { aspect: '4:5' })).join('');
        if (dealCarousel) requestAnimationFrame(() => dealCarousel.update());
      }
    }

    buildHomeSections();
    window.addEventListener('ck:products-synced', buildHomeSections);

    document.getElementById('feat-tabs').addEventListener('click', e => {
      const btn = e.target.closest('[data-ftab]');
      if (!btn) return;
      document.querySelectorAll('#feat-tabs [data-ftab]').forEach(b => b.classList.toggle('is-active', b === btn));
      activeFeatKey = btn.getAttribute('data-ftab');
      buildHomeSections();
      featTrack.scrollTo({ left: 0 });
    });

    const modal = document.getElementById('poster-modal');
    const modalImg = document.getElementById('poster-modal-img');
    document.querySelectorAll('[data-poster-zoom]').forEach(btn => {
      btn.addEventListener('click', () => {
        modalImg.src = btn.getAttribute('data-poster-zoom');
        modal.classList.add('is-open');
      });
    });
    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target.closest('[data-poster-close]')) modal.classList.remove('is-open');
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') modal.classList.remove('is-open');
      });
    }
  });

if (window.CK_FEATURES && window.CK_FEATURES["home"] && window.CK_FEATURES["home"].markMounted) { window.CK_FEATURES["home"].markMounted(); }
