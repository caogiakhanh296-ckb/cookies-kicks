document.addEventListener('DOMContentLoaded', () => {
    const SIZING = window.CK_SIZING;
    const cmInput = document.getElementById('calc-cm');
    const widthSel = document.getElementById('calc-width');
    const lineSel = document.getElementById('calc-line');
    let activeChartTab = 'nike_jordan';
    let lastRecEu = null;

    function esc(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function renderOfficialChartMatrix() {
      if (!SIZING) return;
      const charts = SIZING.CHARTS;
      const chart = charts[activeChartTab] || charts.nike_jordan;
      const tabsEl = document.getElementById('oc-brand-tabs');
      const noteEl = document.getElementById('oc-brand-note');
      const theadEl = document.getElementById('oc-thead');
      const tbodyEl = document.getElementById('oc-tbody');
      const srcEl = document.getElementById('oc-source-domain');

      tabsEl.innerHTML = Object.values(charts).map(c => {
        const on = c.key === chart.key;
        return `<button type="button" data-oc-tab="${esc(c.key)}" class="px-3.5 py-2 text-xs font-bold uppercase tracking-wider border transition-colors ${on ? 'bg-black text-white border-black' : 'bg-white text-charcoal border-line hover:border-black'}">${esc(c.label)}</button>`;
      }).join('');

      const rawCm = Math.min(31.0, Math.max(21.0, parseFloat(cmInput.value) || 26.0));
      const tabRec = SIZING.recommendSize(rawCm, widthSel.value, chart.key);

      noteEl.innerHTML = `<b>${esc(chart.officialTitle)}:</b> ${esc(chart.brandNote)}`;
      srcEl.textContent = `Nguồn thông số hãng: ${chart.sourceDomain}`;
      theadEl.innerHTML = `<tr><th>Size EU</th><th>US Nam</th><th>UK</th><th>${esc(chart.tagColLabel)}</th><th>${esc(chart.footColLabel)}</th></tr>`;
      tbodyEl.innerHTML = chart.rows.map(r => {
        const isHit = tabRec && String(tabRec.eu) === String(r.eu);
        return `
          <tr class="${isHit ? 'bg-[#FFF7ED]' : ''}">
            <td class="font-bold text-black">${esc(r.eu)} ${isHit ? `<span class="ml-1.5 px-1.5 py-0.5 bg-[#002FA7] text-white text-[9px] uppercase font-sans">Khớp chân ${rawCm.toFixed(1)}cm</span>` : ''}</td>
            <td>${esc(r.us)}</td>
            <td>${esc(r.uk)}</td>
            <td>${esc(r.tag)}</td>
            <td class="font-semibold text-black">${r.footCm.toFixed(1)} cm</td>
          </tr>`;
      }).join('');

      tabsEl.querySelectorAll('[data-oc-tab]').forEach(btn => {
        btn.addEventListener('click', () => {
          activeChartTab = btn.getAttribute('data-oc-tab');
          renderOfficialChartMatrix();
        });
      });
    }

    function updateSizeCalc() {
      if (!SIZING) return;
      const rawCm = Math.min(31.0, Math.max(21.0, parseFloat(cmInput.value) || 26.0));
      const groupKey = lineSel.value || 'ja3';
      const rec = SIZING.recommendSize(rawCm, widthSel.value, groupKey);
      if (!rec) return;

      lastRecEu = rec.eu;
      activeChartTab = rec.chartKey;

      document.getElementById('calc-res-brand').textContent = rec.chartLabel;
      document.getElementById('calc-res-eu').textContent = 'EU ' + rec.eu;
      document.getElementById('calc-res-us').textContent = `US ${rec.us} · UK ${rec.uk} · ${rec.tagColLabel} ${rec.tag}`;
      document.getElementById('calc-res-note').textContent = `Chân thực tế ${rawCm.toFixed(1)} cm (chuẩn bàn chân hãng ~${rec.footCm.toFixed(1)} cm) — ${rec.fitAdvice}`;
      document.getElementById('calc-shop-link').href = `catalog.html?group=${encodeURIComponent(groupKey)}&size=${encodeURIComponent(rec.eu)}`;
      document.getElementById('calc-shop-link').textContent = `Xem ${rec.modelLabel} (EU ${rec.eu}) →`;
      renderOfficialChartMatrix();
    }

    [cmInput, widthSel, lineSel].forEach(el => {
      el.addEventListener('input', updateSizeCalc);
      el.addEventListener('change', updateSizeCalc);
    });
    updateSizeCalc();

    const params = new URLSearchParams(location.search);
    const activeSlug = (params.get('slug') || '').trim();
    let allPosts = [];
    let selectedCat = '';

    function renderList() {
      const list = selectedCat ? allPosts.filter(p => p.category === selectedCat) : allPosts;
      document.getElementById('posts-count-label').textContent = `${list.length} BÀI VIẾT`;
      const grid = document.getElementById('posts-grid');
      if (!list.length) {
        grid.innerHTML = '<div class="col-span-2 py-12 text-center text-muted text-sm border border-line">Chưa có bài viết trong chuyên mục này.</div>';
        return;
      }
      grid.innerHTML = list.map(p => `
        <a href="posts.html?slug=${encodeURIComponent(p.slug)}" class="group block border border-line hover:border-black transition-colors bg-white flex flex-col justify-between">
          <div>
            <div class="aspect-[16/10] bg-[#EBEEEF] overflow-hidden border-b border-line relative">
              <img src="${esc(p.coverImage || 'public/images/products/ja3-1.jpg')}" alt="${esc(p.title)}"
                class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              <span class="absolute top-3 left-3 ck-mono text-[11px] font-bold uppercase px-2.5 py-1 bg-black text-white">${esc(p.category || 'Cẩm nang')}</span>
            </div>
            <div class="p-5 sm:p-6">
              <div class="ck-mono text-xs text-muted mb-2 tabular-nums">${esc(p.createdAt || '')} · ${Number(p.readMinutes) || 4} phút đọc</div>
              <h2 class="text-lg sm:text-xl font-bold text-black group-hover:text-[#002FA7] leading-snug mb-2.5">${esc(p.title)}</h2>
              <p class="text-sm text-charcoal line-clamp-3 leading-relaxed">${esc(p.summary || '')}</p>
            </div>
          </div>
          <div class="px-5 sm:px-6 pb-5 pt-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black group-hover:text-[#002FA7]">
            <span>Đọc hướng dẫn chi tiết</span>
            <span>→</span>
          </div>
        </a>
      `).join('');
    }

    function renderDetail(post) {
      document.getElementById('posts-list-view').classList.add('hidden');
      document.getElementById('post-detail-view').classList.remove('hidden');
      document.getElementById('posts-crumb-sep').classList.remove('hidden');
      const crumbArt = document.getElementById('posts-crumb-article');
      crumbArt.classList.remove('hidden');
      crumbArt.textContent = post.title;

      document.getElementById('pd-category').textContent = post.category || 'Cẩm nang';
      document.getElementById('pd-meta').textContent = `${post.author || "Cookie's Kicks Huế"} · ${post.createdAt || ''} · ${Number(post.readMinutes) || 4} phút đọc`;
      document.getElementById('pd-title').textContent = post.title;
      document.getElementById('pd-summary').textContent = post.summary || '';
      const coverEl = document.getElementById('pd-cover');
      coverEl.src = post.coverImage || 'public/images/products/ja3-1.jpg';
      coverEl.alt = post.title;

      const bodyParts = [];
      if (Array.isArray(post.sections) && post.sections.length) {
        for (const sec of post.sections) {
          bodyParts.push(`
            <section class="pt-2">
              <h2 class="text-lg sm:text-xl font-bold text-black mb-2.5">${esc(sec.heading || '')}</h2>
              <div class="text-sm sm:text-base text-charcoal leading-relaxed whitespace-pre-line">${esc(sec.content || '')}</div>
            </section>
          `);
        }
      }
      if (post.body) {
        bodyParts.push(`<div class="text-sm sm:text-base text-charcoal leading-relaxed whitespace-pre-line">${esc(post.body)}</div>`);
      }
      document.getElementById('pd-body').innerHTML = bodyParts.join('');

      const prods = (window.CK && CK.getProducts) ? CK.getProducts() : [];
      const relIds = Array.isArray(post.relatedProductIds) && post.relatedProductIds.length ? post.relatedProductIds : [1, 13, 39];
      const relProds = relIds.map(id => prods.find(x => Number(x.id) === Number(id))).filter(Boolean);
      const relMount = document.getElementById('pd-related-products');
      relMount.innerHTML = relProds.map(p => `
        <a href="product.html?id=${encodeURIComponent(p.id)}" class="flex items-center gap-3.5 p-2.5 border border-line hover:border-black transition-colors group">
          <img src="${esc(p.image)}" alt="${esc(p.name)}" class="w-16 h-16 object-contain bg-[#EBEEEF] shrink-0" loading="lazy" />
          <div class="min-w-0">
            <div class="text-[11px] ck-mono text-muted uppercase">${esc(p.brand || '')}</div>
            <div class="text-sm font-bold text-black truncate group-hover:text-[#002FA7]">${esc(p.name)}</div>
            <div class="text-xs font-semibold ck-mono text-charcoal tabular-nums mt-0.5">${p.price > 0 ? CK.formatVND(p.price) : 'Order theo đợt'}</div>
          </div>
        </a>
      `).join('');
    }

    document.querySelectorAll('[data-pcat]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCat = btn.getAttribute('data-pcat') || '';
        document.querySelectorAll('[data-pcat]').forEach(b => {
          const active = (b.getAttribute('data-pcat') || '') === selectedCat;
          b.className = active ? 'ck-pill !border-black bg-black text-white' : 'ck-pill';
        });
        renderList();
      });
    });

    fetch('/api/posts')
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(data => {
        allPosts = Array.isArray(data.posts) ? data.posts : [];
        if (activeSlug) {
          const found = allPosts.find(p => p.slug === activeSlug);
          if (found) {
            renderDetail(found);
            return;
          }
        }
        renderList();
      })
      .catch(() => {
        document.getElementById('posts-grid').innerHTML = '<div class="col-span-2 py-8 text-center text-muted text-sm border border-line">Không thể tải dữ liệu cẩm nang lúc này. Vui lòng tải lại trang sau giây lát.</div>';
      });
  });

if (window.CK_FEATURES && window.CK_FEATURES["posts"] && window.CK_FEATURES["posts"].markMounted) { window.CK_FEATURES["posts"].markMounted(); }
