(function () {
  'use strict';

  const KEYS = {
    cart: 'ck_cart',
    products: 'ck_products_v60',
    orders: 'cookiesKicksOrders',
    wish: 'ck_wish',
    user: 'ck_current_user',
    users: 'ck_users_db',
  };

  const FREE_SHIP_THRESHOLD = 2000000;
  const BANK = {
    id: 'MB',
    name: 'MB Bank',
    accountNo: '0988561909',
    accountName: 'DANG GIA KHIEM',
    displayName: 'COOKIES KICKS',
    accountToken: 'ck_acct_mb_0988561909_v1',
  };
  const CONTACT = {
    phone: '098 856 19 09',
    tel: '0988561909',
    email: 'bonappetitcookiekicks@gmail.com',
    ig: 'bonappetitcookie',
    city: 'Huế, Thừa Thiên–Huế',
    facebook: 'https://www.facebook.com/profile.php?id=61573036312848',
    messenger: 'https://m.me/61573036312848',
    zalo: 'https://zalo.me/0988561909',
  };

  function read(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v == null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }
  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  try {
    localStorage.removeItem('cookiesKicksCart');
    localStorage.removeItem('ck_products_v2');
  } catch (e) {}

  let serverProductsCache = null;
  let productsRevision = 0;
  let adminCacheRevision = 0;

  function clearAdminCache() {
    adminCacheRevision++;
    try { localStorage.removeItem(KEYS.orders); } catch (e) {}
  }

  function normalizeProduct(baseItem, sp) {
    const sizing = window.CK_SIZING || null;
    const merged = Object.assign({
      colorways: [{ name: 'Mặc định', hex: '#111111' }],
      sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
      outOfStockSizes: [],
      sizePrices: {},
      orderMode: 'order_12_15',
      orderDays: '12–15 ngày',
      deposit: 500000,
      specs: {},
      description: '',
      rating: 5,
      reviews: 12,
      sold: 10,
      condition: 'New Fullbox',
      conditionDetail: 'Hàng Order chính hãng 100% New Fullbox — Về tay sau 12–15 ngày',
      image: '',
      gallery: [],
      tag: null,
      originalPrice: null,
      cost: 0,
      stock: 10,
      status: 'active',
      category: 'Basketball',
      createdAt: '2026-09-01',
    }, baseItem || {}, sp || {});
    merged.model = merged.model || merged.name;
    merged.orderMode = merged.orderMode || 'order_12_15';
    merged.orderDays = merged.orderDays || '12–15 ngày';
    const rawMergedPrice = Number(merged.price) || 0;
    merged.deposit = rawMergedPrice >= 2000000
      ? Math.round(rawMergedPrice * 0.5)
      : (Number(merged.deposit) > 0 ? Number(merged.deposit) : 500000);
    merged.sizePrices = merged.sizePrices && typeof merged.sizePrices === 'object' ? merged.sizePrices : {};
    if (sizing) {
      const chart = sizing.getChartForProduct(merged, merged.group);
      const fit = sizing.getModelFit(merged);
      const normArr = Array.isArray(merged.sizes) ? merged.sizes.map(sizing.normalizeSizeStr).filter(Boolean) : [];
      const keyStr = normArr.join(',');
      if (!normArr.length || keyStr === '38,39,40,41,42,43,44,45' || keyStr === '39,40,41,42,43,44,45') {
        merged.sizes = chart.sizes.slice();
      } else {
        merged.sizes = normArr;
      }
      merged.outOfStockSizes = Array.isArray(merged.outOfStockSizes)
        ? merged.outOfStockSizes.map(sizing.normalizeSizeStr).filter(Boolean)
        : [];
      merged.sizeChartKey = merged.sizeChartKey || chart.key;
      merged.fitBadge = merged.fitBadge || fit.fitBadge;
      merged.fitAdvice = merged.fitAdvice || fit.fitAdvice;
    } else {
      merged.sizes = Array.isArray(merged.sizes) ? merged.sizes.map(String) : [];
      merged.outOfStockSizes = Array.isArray(merged.outOfStockSizes) ? merged.outOfStockSizes.map(String) : [];
    }
    if (merged.image && /^public\/images\/(top40|products)\//.test(merged.image) && !merged.image.includes('?')) {
      merged.image = merged.image + '?v=6.8';
    }
    if (Array.isArray(merged.gallery)) {
      merged.gallery = merged.gallery.map(u => (u && /^public\/images\/(top40|products)\//.test(u) && !u.includes('?')) ? u + '?v=6.8' : u);
    }
    if (merged.stock <= 0 && merged.status === 'active') merged.status = 'out';
    return merged;
  }

  function sizeBadge(itemOrProd, sizeEu, mode) {
    const sizing = window.CK_SIZING;
    const rawSz = sizeEu != null ? String(sizeEu).trim() : '';
    if (!rawSz) return '';
    if (!sizing) return 'EU ' + rawSz;
    let prod = null;
    if (itemOrProd && typeof itemOrProd === 'object') {
      if (itemOrProd.brand || itemOrProd.group) prod = itemOrProd;
      else if (itemOrProd.id != null) prod = getProduct(itemOrProd.id);
      if (!prod && itemOrProd.name) prod = { brand: itemOrProd.name, name: itemOrProd.name };
    } else if (typeof itemOrProd === 'string') {
      prod = { brand: itemOrProd };
    }
    return sizing.formatSizeBadge(prod || 'Nike', rawSz, mode || 'short');
  }

  function getProducts(opts) {
    const base = (window.CK_BASE_PRODUCTS || []).map(p => JSON.parse(JSON.stringify(p)));
    const stored = serverProductsCache || read(KEYS.products, null);
    let list;
    if (Array.isArray(stored) && stored.length) {
      const seenIds = new Set();
      list = stored.filter(sp => {
        const b = base.find(x => x.id === sp.id);
        if (!b && Number(sp.id) > 40 && (sp.priceOnRequest || String(sp.image || '').includes('data:image/svg') || String(sp.image || '').includes('top40/'))) {
          return false;
        }
        return true;
      }).map(sp => {
        seenIds.add(Number(sp.id));
        const b = base.find(x => x.id === sp.id) || {};
        if ((b.image && String(b.image).includes('public/images/top40/')) || String(sp.image || '').includes('data:image/svg')) {
          return normalizeProduct(sp, b);
        }
        return normalizeProduct(b, Object.assign({}, sp, b.brand ? { brand: b.brand, model: b.model } : {}));
      });
      base.forEach(b => {
        if (!seenIds.has(Number(b.id))) {
          list.push(normalizeProduct(b, {}));
        }
      });
    } else {
      list = base.map(b => normalizeProduct(b, {}));
    }
    if (opts && opts.includeHidden) return list;
    return list.filter(p => p.status !== 'hidden');
  }

  function getProduct(id) {
    id = Number(id);
    return getProducts({ includeHidden: true }).find(p => p.id === id) || null;
  }

  function priceForSize(p, size) {
    if (!p) return 0;
    if (size != null && p.sizePrices && Number(p.sizePrices[String(size)]) > 0) {
      return Number(p.sizePrices[String(size)]);
    }
    return Number(p.price) || 0;
  }

  async function adminFetch(url, options) {
    const response = await fetch(url, Object.assign({}, options || {}, { credentials: 'same-origin' }));
    if (response.status === 401) window.dispatchEvent(new CustomEvent('ck:admin-expired'));
    return response;
  }

  async function saveProducts(list) {
    const snapshot = JSON.parse(JSON.stringify(list));
    productsRevision++;
    const response = await adminFetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result || result.ok !== true) {
      throw new Error((result && result.error) || 'Không lưu được sản phẩm trên máy chủ');
    }
    productsRevision++;
    serverProductsCache = snapshot;
    try { write(KEYS.products, snapshot); } catch (e) {}
    return true;
  }

  async function resetProductsOnServer() {
    throw new Error('Khôi phục toàn bộ danh mục đã bị vô hiệu hóa để bảo vệ dữ liệu.');
  }

  async function syncFromServer() {
    try {
      const revision = productsRevision;
      const adminRevision = adminCacheRevision;
      const pRes = await fetch('/api/products', { cache: 'no-store' }).catch(() => null);
      if (pRes && pRes.ok) {
        const pData = await pRes.json();
        if (Array.isArray(pData) && pData.length && revision === productsRevision) {
          serverProductsCache = pData;
          write(KEYS.products, pData);
          window.dispatchEvent(new CustomEvent('ck:products-synced', { detail: pData }));
        }
      }

      if (auth && auth.getToken && auth.getToken()) {
        await auth.refreshMe();
      }

      if (document.body && document.body.dataset.page === 'admin') {
        const oRes = await adminFetch('/api/orders', {
          cache: 'no-store',
        }).catch(() => null);
        if (oRes && oRes.ok) {
          if (oRes.headers.get('x-demo-cleared') === '1') {
            try { localStorage.setItem('ckHideDemoOrders', '1'); } catch (e) {}
          }
          const oData = await oRes.json();
          if (Array.isArray(oData) && adminRevision === adminCacheRevision) {
            write(KEYS.orders, oData);
            window.dispatchEvent(new CustomEvent('ck:orders-synced', { detail: oData }));
          }
        }
      }
    } catch (e) {}
  }

  async function uploadToServer(dataUrl, admin) {
    const token = !admin && auth && auth.getToken ? auth.getToken() : '';
    if (!admin && !token) throw new Error('AUTH_REQUIRED');
    const headers = { 'Content-Type': 'text/plain' };
    if (token) headers.Authorization = 'Bearer ' + token;
    const request = admin ? adminFetch : fetch;
    const res = await request(admin ? '/api/admin/upload' : '/api/upload', {
      method: 'POST',
      credentials: 'same-origin',
      headers,
      body: dataUrl,
    });
    const result = await res.json().catch(() => null);
    if (!res.ok || !result || !result.ok || !result.url) {
      throw new Error((result && result.error) || 'Không tải được ảnh lên máy chủ');
    }
    if (typeof window !== 'undefined' && window.location && /\.github\.io$/i.test(window.location.hostname) && String(result.url).startsWith('/api/media/')) {
      return 'https://cookieskicks-store-2026.netlify.app' + result.url;
    }
    return result.url;
  }

  function uploadImage(dataUrl) {
    return uploadToServer(dataUrl, false);
  }

  function uploadAdminImage(dataUrl) {
    return uploadToServer(dataUrl, true);
  }

  function orderEtaWindow(daysStr, fromDate) {
    const m = String(daysStr || '12–15').match(/(\d+)\D+(\d+)/);
    const minD = m ? Number(m[1]) : 12;
    const maxD = m ? Number(m[2]) : 15;
    const base = fromDate ? new Date(fromDate) : new Date();
    const d1 = new Date(base.getTime() + minD * 86400000);
    const d2 = new Date(base.getTime() + maxD * 86400000);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d1.getDate())}/${pad(d1.getMonth() + 1)} – ${pad(d2.getDate())}/${pad(d2.getMonth() + 1)}/${d2.getFullYear()}`;
  }

  function siblings(p) {
    if (!p) return [];
    if (!p.group) return [p];
    const all = getProducts();
    const sibs = all.filter(x => x.group === p.group);
    return sibs.length ? sibs : [p];
  }

  function formatVND(n) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0)) + '₫';
  }
  function discountPct(p) {
    return p.originalPrice && p.originalPrice > p.price && p.price > 0
      ? Math.round((1 - p.price / p.originalPrice) * 100)
      : 0;
  }
  function priceText(p) {
    return p.priceOnRequest || !p.price ? 'Inbox for details' : formatVND(p.price);
  }
  function catLabel(cat) {
    return {
      Basketball: 'Basketball',
      Badminton: 'Badminton · Cầu lông',
      Running: 'Road Running · Carbon',
      Trail: 'Trail Running · Vibram',
      Tennis: 'Tennis & Pickleball',
      Cycling: 'Pro Road Cycling',
      Casual: 'Lifestyle',
    }[cat] || cat || 'Performance';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  const FALLBACK_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='#EBEEEF'/><path d='M70 250c40-6 80-30 110-62 12 18 34 30 60 34 40 6 70 12 90 28v22H70z' fill='#111111' opacity='.88'/><rect x='70' y='272' width='260' height='13' fill='#000000'/></svg>"
  );

  const ICON = {
    arrow: '<svg class="ck-arrow" viewBox="0 0 24 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M0 7h22M16 1l6 6-6 6"/></svg>',
    bag: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>',
    heart: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z"/></svg>',
    user: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    search: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    menu: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    close: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    trash: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    truck: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 5h14v11H1zM15 9h4l4 4v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
    shield: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z"/><path d="M8.5 12l2.5 2.5L16 9.5"/></svg>',
    chevron: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>',
    chevLeft: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>',
    chevRight: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    filter: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="#fff"/><circle cx="15" cy="12" r="2" fill="#fff"/><circle cx="10" cy="18" r="2" fill="#fff"/></svg>',
  };

  function cartKey(i) {
    return `${i.id}__${i.size}__${i.colorway}`;
  }

  const cart = {
    get() {
      const items = read(KEYS.cart, []);
      return Array.isArray(items) ? items.filter(i => i && i.id != null && Number(i.price) > 0) : [];
    },
    save(items, bump = false) {
      write(KEYS.cart, items);
      updateBadges(bump);
      window.dispatchEvent(new CustomEvent('ck:cart', { detail: items }));
    },
    add(item, opts) {
      opts = opts || {};
      const p = getProduct(item.id);
      if (!p) return null;
      if (p.status === 'out' || p.status === 'hidden' || (Number(p.stock) || 0) <= 0) {
        toast('Sản phẩm này hiện đã tạm hết hàng.', 'error');
        return null;
      }
      const sz = String(item.size || '').trim();
      if (sz && Array.isArray(p.outOfStockSizes) && p.outOfStockSizes.map(s => String(s).trim()).includes(sz)) {
        toast(`Size ${sz} hiện đã tạm hết hàng.`, 'error');
        return null;
      }
      const matchedVar = sz && Array.isArray(p.variants) ? p.variants.find(v => String(v.size).trim() === sz) : null;
      if (matchedVar && (Number(matchedVar.stock) || 0) <= 0) {
        toast(`Size ${sz} hiện đã tạm hết hàng.`, 'error');
        return null;
      }
      const itemPrice = priceForSize(p, item.size);
      if (p.priceOnRequest || !itemPrice) {
        askPrice(p);
        return null;
      }
      const entry = {
        id: p.id,
        name: p.name,
        brand: p.brand,
        model: p.model,
        category: p.category,
        orderMode: p.orderMode || 'order_12_15',
        orderDays: p.orderDays || '12–15 ngày',
        deposit: itemPrice >= 2000000 ? Math.round(itemPrice * 0.5) : (Number(p.deposit) > 0 ? Number(p.deposit) : 500000),
        colorway: item.colorway || p.colorName || (p.colorways[0] && p.colorways[0].name) || 'Mặc định',
        size: String(item.size),
        price: itemPrice,
        originalPrice: p.originalPrice || null,
        image: p.image,
        qty: Math.max(1, Number(item.qty) || 1),
      };
      entry.key = cartKey(entry);
      const items = cart.get();
      const existing = items.find(i => i.key === entry.key);
      if (existing) existing.qty = Math.min(10, existing.qty + entry.qty);
      else items.push(entry);
      cart.save(items, true);

      if (!opts.silent) {
        if (opts.openDrawer) openCart();
        else showMiniCart(entry);
      }
      return entry;
    },
    remove(key) {
      cart.save(cart.get().filter(i => i.key !== key));
    },
    setQty(key, qty) {
      const items = cart.get();
      const it = items.find(i => i.key === key);
      if (!it) return;
      if (qty <= 0) return cart.remove(key);
      it.qty = Math.min(10, qty);
      cart.save(items);
    },
    clear() {
      cart.save([]);
    },
    count() {
      return cart.get().reduce((s, i) => s + (i.qty || 1), 0);
    },
    subtotal() {
      return cart.get().reduce((s, i) => s + i.price * (i.qty || 1), 0);
    },
  };

  let miniTimer = null;
  let miniRemain = 5000;
  let miniStart = 0;

  function ensureMiniCartShell() {
    let el = document.getElementById('ck-minicart');
    if (el) return el;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="ck-minicart-backdrop" id="ck-minicart-backdrop"></div>
      <aside class="ck-minicart" id="ck-minicart" role="status" aria-live="polite" aria-label="Đã thêm vào giỏ hàng">
        <div class="ck-minicart__timer"><span></span></div>
        <div class="p-4 sm:p-5">
          <div class="flex items-center justify-between mb-3.5">
            <span class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-instock">
              <span class="w-5 h-5 rounded-full bg-instock text-white inline-flex items-center justify-center">${ICON.check}</span>
              Đã thêm vào giỏ hàng
            </span>
            <button type="button" class="ck-icon-btn -mr-2 !w-8 !h-8" data-minicart-close aria-label="Đóng">${ICON.close}</button>
          </div>
          <div class="flex gap-3.5 pb-4 border-b border-line" id="ck-minicart-body"></div>
          <div class="grid grid-cols-2 gap-2.5 pt-4">
            <button type="button" class="ck-btn ck-btn--ghost ck-btn--sm justify-center" id="ck-minicart-view">
              Xem giỏ hàng (<span data-minicart-count>0</span>)
            </button>
            <a href="checkout.html" class="ck-btn ck-btn--sm justify-center !mr-0 !mb-0">
              Thanh toán ${ICON.arrow}
            </a>
          </div>
        </div>
      </aside>`;
    document.body.appendChild(wrap);
    el = document.getElementById('ck-minicart');
    const bd = document.getElementById('ck-minicart-backdrop');

    bd.addEventListener('click', hideMiniCart);
    el.querySelector('[data-minicart-close]').addEventListener('click', hideMiniCart);
    document.getElementById('ck-minicart-view').addEventListener('click', () => {
      hideMiniCart();
      openCart();
    });

    el.addEventListener('mouseenter', () => {
      if (!el.classList.contains('is-open')) return;
      clearTimeout(miniTimer);
      miniRemain = Math.max(800, miniRemain - (Date.now() - miniStart));
      el.classList.add('is-paused');
    });
    el.addEventListener('mouseleave', () => {
      if (!el.classList.contains('is-open')) return;
      el.classList.remove('is-paused');
      miniStart = Date.now();
      miniTimer = setTimeout(hideMiniCart, miniRemain);
    });
    return el;
  }

  function showMiniCart(entry) {
    if (!entry) return;
    closeCart();
    const el = ensureMiniCartShell();
    const bd = document.getElementById('ck-minicart-backdrop');
    document.getElementById('ck-minicart-body').innerHTML = `
      <a href="product.html?id=${encodeURIComponent(entry.id)}" class="w-20 h-20 bg-adidas flex-shrink-0 overflow-hidden">
        <img src="${esc(entry.image || FALLBACK_IMG)}" alt="${esc(entry.name)}" class="w-full h-full object-cover" />
      </a>
      <div class="min-w-0 flex-1">
        <p class="font-semibold text-sm text-black leading-snug line-clamp-2">${esc(entry.name)}</p>
        <p class="text-xs text-muted mt-1">${esc(entry.colorway)} · <b class="text-black">${esc(sizeBadge(entry, entry.size))}</b> · SL: ${entry.qty}</p>
        <p class="ck-price text-sm text-black mt-1.5">${formatVND(entry.price)}</p>
      </div>`;
    el.querySelector('[data-minicart-count]').textContent = cart.count();

    clearTimeout(miniTimer);
    el.classList.remove('is-running', 'is-paused');
    void el.offsetWidth;
    el.classList.add('is-open', 'is-running');
    bd.classList.add('is-open');

    miniRemain = 5000;
    miniStart = Date.now();
    miniTimer = setTimeout(hideMiniCart, 5000);
  }

  function hideMiniCart() {
    clearTimeout(miniTimer);
    const el = document.getElementById('ck-minicart');
    const bd = document.getElementById('ck-minicart-backdrop');
    if (el) el.classList.remove('is-open', 'is-running', 'is-paused');
    if (bd) bd.classList.remove('is-open');
  }

  function addToCart(btn, item) {
    const p = getProduct(item && item.id);
    if (!p) return;
    if (p.priceOnRequest || !p.price) {
      askPrice(p);
      return;
    }
    if (!btn) {
      cart.add(item);
      return;
    }
    if (btn.classList.contains('is-loading')) return;
    const prevHtml = btn.innerHTML;
    btn.classList.add('is-loading');
    btn.innerHTML = `<span class="ck-spinner" aria-hidden="true"></span><span>Đang thêm...</span>`;
    setTimeout(() => {
      btn.classList.remove('is-loading');
      btn.innerHTML = prevHtml;
      const entry = cart.add(item, { silent: true });
      if (entry) showMiniCart(entry);
    }, 400);
  }

  const wish = {
    get() { return read(KEYS.wish, []); },
    has(id) { return wish.get().includes(Number(id)); },
    toggle(id) {
      id = Number(id);
      let w = wish.get();
      const on = !w.includes(id);
      w = on ? [...w, id] : w.filter(x => x !== id);
      write(KEYS.wish, w);
      updateBadges();
      toast(on ? 'Đã lưu vào danh sách yêu thích' : 'Đã bỏ khỏi danh sách yêu thích');
      return on;
    },
    count() { return wish.get().length; },
  };

  function updateBadges(bump = false) {
    const c = cart.count();
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = c;
      el.style.display = c > 0 ? 'flex' : 'none';
      if (bump && c > 0) {
        el.classList.remove('is-bumped');
        void el.offsetWidth;
        el.classList.add('is-bumped');
      }
    });
    const w = wish.count();
    document.querySelectorAll('[data-wish-count]').forEach(el => {
      el.textContent = w;
      el.style.display = w > 0 ? 'flex' : 'none';
    });
  }

  let toastTimer;
  function toast(msg, type) {
    let el = document.getElementById('ck-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ck-toast';
      document.body.appendChild(el);
    }
    el.className = 'ck-toast' + (type ? ' ck-toast--' + type : '');
    el.innerHTML = `<span>${esc(msg)}</span>`;
    requestAnimationFrame(() => el.classList.add('is-show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-show'), 2800);
  }

  function cardPriceHtml(p) {
    const pct = discountPct(p);
    if (p.priceOnRequest || !p.price) return `<a href="${CONTACT.facebook}" target="_blank" rel="noopener" class="is-inbox text-[#111111] hover:underline underline-offset-4 font-semibold text-xs" title="Nhắn Fanpage Facebook Cookie&#39;s Kicks">Liên hệ báo giá →</a>`;
    if (pct) return `<span class="is-sale">${formatVND(p.price)}</span><s>${formatVND(p.originalPrice)}</s>`;
    return `<span>${formatVND(p.price)}</span>`;
  }

  function cardTagHtml(p) {
    const pct = discountPct(p);
    if (p.status === 'out' || p.stock <= 0) return '<span class="ck-tag ck-tag--out">Hết hàng</span>';
    if (pct) return `<span class="ck-tag ck-tag--sale">-${pct}%</span>`;
    if (p.orderMode === 'instock') return '<span class="ck-tag ck-tag--black">Sẵn hàng</span>';
    return '';
  }

  function productCard(p, opts) {
    opts = opts || {};
    const sibs = siblings(p);
    const orderedSibs = [p, ...sibs.filter(x => x.id !== p.id)];
    const shownSibs = orderedSibs.slice(0, 5);
    const extraCount = Math.max(0, orderedSibs.length - shownSibs.length);
    const colorCount = orderedSibs.length;
    const use4x5 = opts.aspect === '4:5';
    const mediaClass = use4x5 ? 'ck-card__media ck-card__media--4x5' : 'ck-card__media';
    const rowClass = opts.view === 'list' ? ' ck-card--row' : '';
    const pidEnc = encodeURIComponent(p.id);

    const secondAngle = Array.isArray(p.gallery) && p.gallery.length > 1 && p.gallery[1] !== p.image ? p.gallery[1] : '';
    const outSet = new Set((p.outOfStockSizes || []).map(String));
    const availSizes = (p.sizes || []).map(String).filter(s => !outSet.has(s)).slice(0, 7);
    const sizesBarHtml = availSizes.length
      ? `<div class="ck-card__sizes-bar" aria-hidden="true"><span class="ck-card__sizes-tag">EU</span><span class="ck-card__sizes-items">${availSizes.map(esc).join(' · ')}</span></div>`
      : '';

    const thumbsHtml = shownSibs.map((s, idx) => {
      const sSecond = Array.isArray(s.gallery) && s.gallery.length > 1 && s.gallery[1] !== s.image ? s.gallery[1] : '';
      return `
      <button type="button"
        class="ck-card__thumb ${idx === 0 ? 'is-active' : ''}"
        data-card-thumb
        data-sid="${encodeURIComponent(s.id)}"
        data-simg="${esc(s.image || FALLBACK_IMG)}"
        data-simg2="${esc(sSecond)}"
        data-sname="${esc(s.dealName ? s.name : s.model)}"
        data-scolor="${esc(s.colorName || catLabel(s.category))}"
        data-sprice="${esc(cardPriceHtml(s))}"
        aria-label="Phối màu ${esc(s.colorName || s.name)}"
        title="${esc(s.colorName || s.name)}">
        <img src="${esc(s.image || FALLBACK_IMG)}" alt="${esc(s.colorName || s.name)}" loading="lazy" />
      </button>`;
    }).join('') + (extraCount > 0
      ? `<a href="catalog.html?group=${encodeURIComponent(p.group)}" class="ck-card__more">+${extraCount}</a>`
      : '');

    return `
      <article class="ck-card group${rowClass}" data-product-card data-product-id="${pidEnc}">
        <div class="${mediaClass}${secondAngle ? ' has-second-angle' : ''}">
          <a href="product.html?id=${pidEnc}" data-card-link class="block w-full h-full">
            <img data-card-img src="${esc(p.image || FALLBACK_IMG)}" alt="${esc(p.name)}" loading="lazy" class="ck-card__img-main" />
            ${secondAngle ? `<img data-card-img-hover src="${esc(secondAngle)}" alt="" loading="lazy" class="ck-card__img-hover" data-hide-err />` : `<img data-card-img-hover src="" alt="" loading="lazy" class="ck-card__img-hover" style="display:none" />`}
            <div class="ck-card__tags">${cardTagHtml(p)}</div>
            ${sizesBarHtml}
          </a>
          <button type="button" class="ck-card__wish ${wish.has(p.id) ? 'is-on' : ''}" data-card-wish="${esc(p.id)}" aria-label="Yêu thích">${ICON.heart}</button>
        </div>
        <div class="ck-card__body">
          <div class="ck-card__kicker">
            <span class="ck-card__brand">${esc(p.brand)} · ${esc(catLabel(p.category))}</span>
          </div>
          <a href="product.html?id=${pidEnc}" data-card-link class="block">
            <p class="ck-card__name" data-card-title>${esc(p.dealName ? p.name : p.model)}</p>
            <p class="ck-card__meta" data-card-sub>${esc(p.colorName || p.brand)}</p>
          </a>
          ${colorCount > 1 ? `<div class="ck-card__thumbs no-scrollbar">${thumbsHtml}</div>` : ''}
          <div class="ck-card__price-row">
            <div class="ck-card__price" data-card-price>${cardPriceHtml(p)}</div>
            ${colorCount > 1 ? `<span class="ck-card__color-count">${colorCount} phối màu</span>` : ''}
          </div>
        </div>
      </article>`;
  }

  function bindCardDelegation() {

    const swapCardColor = thumb => {
      const card = thumb.closest('[data-product-card]');
      if (!card) return;
      const sid = thumb.getAttribute('data-sid');
      const simg = thumb.getAttribute('data-simg');
      const simg2 = thumb.getAttribute('data-simg2') || '';
      const sname = thumb.getAttribute('data-sname');
      const scolor = thumb.getAttribute('data-scolor');
      const sprice = thumb.getAttribute('data-sprice');

      const imgEl = card.querySelector('[data-card-img]');
      if (imgEl && simg && imgEl.getAttribute('src') !== simg) imgEl.setAttribute('src', simg);
      const hoverImgEl = card.querySelector('[data-card-img-hover]');
      const mediaEl = card.querySelector('.ck-card__media');
      if (hoverImgEl && mediaEl) {
        if (simg2) {
          hoverImgEl.setAttribute('src', simg2);
          hoverImgEl.style.display = '';
          mediaEl.classList.add('has-second-angle');
        } else {
          hoverImgEl.style.display = 'none';
          mediaEl.classList.remove('has-second-angle');
        }
      }
      if (sid) {
        card.setAttribute('data-product-id', sid);
        card.querySelectorAll('[data-card-link]').forEach(a => a.setAttribute('href', `product.html?id=${encodeURIComponent(sid)}`));
      }
      const titleEl = card.querySelector('[data-card-title]');
      if (titleEl && sname) titleEl.textContent = sname;
      const subEl = card.querySelector('[data-card-sub]');
      if (subEl && scolor) subEl.textContent = scolor;
      const priceEl = card.querySelector('[data-card-price]');
      if (priceEl && sprice) priceEl.innerHTML = sprice;

      card.querySelectorAll('[data-card-thumb]').forEach(t => t.classList.toggle('is-active', t === thumb));
    };

    document.addEventListener('mouseover', e => {
      const thumb = e.target.closest('[data-card-thumb]');
      if (thumb) swapCardColor(thumb);
    });
    document.addEventListener('focusin', e => {
      const thumb = e.target.closest('[data-card-thumb]');
      if (thumb) swapCardColor(thumb);
    });
    document.addEventListener('click', e => {
      const fbBadge = e.target.closest('[data-fb-inbox]');
      if (fbBadge) {
        e.preventDefault();
        e.stopPropagation();
        window.open(CONTACT.facebook, '_blank', 'noopener');
        return;
      }
      const wishBtn = e.target.closest('[data-card-wish]');
      if (wishBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = Number(wishBtn.getAttribute('data-card-wish'));
        wishBtn.classList.toggle('is-on', wish.toggle(id));
        return;
      }
      const moreBtn = e.target.closest('[data-card-more]');
      if (moreBtn && moreBtn.tagName !== 'A') {
        e.preventDefault();
        e.stopPropagation();
        location.href = moreBtn.getAttribute('data-card-more');
        return;
      }
      const thumb = e.target.closest('[data-card-thumb]');
      if (thumb) {
        e.preventDefault();
        e.stopPropagation();
        swapCardColor(thumb);
        const sid = thumb.getAttribute('data-sid');
        if (sid) location.href = `product.html?id=${encodeURIComponent(sid)}`;
      }
    });
  }

  function askPrice(p) {
    let m = document.getElementById('ck-ask-price');
    if (!m) {
      m = document.createElement('div');
      m.id = 'ck-ask-price';
      m.className = 'ck-modal';
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-modal', 'true');
      m.setAttribute('aria-label', 'Báo giá chi tiết mẫu giày');
      m.innerHTML = `
        <div class="ck-modal__backdrop" data-close></div>
        <div class="ck-modal__box relative max-w-md p-6 sm:p-8 border border-black" style="z-index:1">
          <button class="ck-icon-btn absolute top-3 right-3" data-close aria-label="Đóng">${ICON.close}</button>
          <p class="ck-eyebrow text-accent mb-2">Inbox for details · Order 12–15 Ngày</p>
          <h3 class="ck-title text-3xl mb-2" data-name></h3>
          <p class="text-sm text-muted mb-6 leading-relaxed">Mẫu này nhận order chính hãng theo đợt giá sàn. Nhấn vào Fanpage Facebook hoặc Messenger bên dưới để Cookie's Kicks báo giá chi tiết theo size EU của bạn.</p>
          <div class="space-y-3">
            <a class="ck-btn ck-btn--accent ck-btn--block" target="_blank" rel="noopener" href="${CONTACT.facebook}">Inbox for details (Facebook Fanpage) ${ICON.arrow}</a>
            <a class="ck-btn ck-btn--block" target="_blank" rel="noopener" href="${CONTACT.messenger}">Nhắn Messenger trực tiếp ${ICON.arrow}</a>
            <a class="ck-btn ck-btn--ghost ck-btn--block justify-center" target="_blank" rel="noopener" href="${CONTACT.zalo}">Chat Zalo ${CONTACT.phone}</a>
          </div>
        </div>`;
      document.body.appendChild(m);
      m.addEventListener('click', e => {
        if (e.target.closest('[data-close]')) m.classList.remove('is-open');
      });
    }
    m.querySelector('[data-name]').textContent = p.dealName ? `${p.model} "${p.dealName}"` : `${p.model} — ${p.colorName || ''}`;
    requestAnimationFrame(() => m.classList.add('is-open'));
  }

  function quickAdd(id, btn) {
    const p = getProduct(id);
    if (!p) return;
    if (p.priceOnRequest || !p.price) {
      askPrice(p);
      return;
    }
    const outSet = new Set((p.outOfStockSizes || []).map(String));
    const avail = (p.sizes || []).map(String).filter(s => !outSet.has(s));
    const size = avail[Math.floor(avail.length / 2)] || String((p.sizes || [])[0] || '');
    if (!size) return;
    addToCart(btn || null, { id: p.id, size, colorway: p.colorName || (p.colorways[0] && p.colorways[0].name) });
  }

  function initCarousel({ track, prev, next, bar }) {
    const trackEl = typeof track === 'string' ? document.querySelector(track) : track;
    if (!trackEl) return null;
    const prevBtn = typeof prev === 'string' ? document.querySelector(prev) : prev;
    const nextBtn = typeof next === 'string' ? document.querySelector(next) : next;
    const barEl = typeof bar === 'string' ? document.querySelector(bar) : bar;

    let thumbEl = null;
    if (barEl) {
      thumbEl = barEl.querySelector('.ck-scrollbar__thumb');
      if (!thumbEl) {
        thumbEl = document.createElement('div');
        thumbEl.className = 'ck-scrollbar__thumb';
        barEl.appendChild(thumbEl);
      }
    }

    const update = () => {
      const maxScroll = Math.max(0, trackEl.scrollWidth - trackEl.clientWidth);
      const sl = trackEl.scrollLeft;
      if (prevBtn) prevBtn.disabled = sl <= 3;
      if (nextBtn) nextBtn.disabled = maxScroll <= 3 || sl >= maxScroll - 3;

      if (thumbEl && barEl) {
        if (maxScroll <= 3) {
          thumbEl.style.width = '100%';
          thumbEl.style.transform = 'translateX(0)';
        } else {
          const ratio = Math.max(0.16, Math.min(1, trackEl.clientWidth / trackEl.scrollWidth));
          const pctWidth = ratio * 100;
          const progress = Math.min(1, Math.max(0, sl / maxScroll));
          const travelPx = (barEl.clientWidth * (1 - ratio)) * progress;
          thumbEl.style.width = `${pctWidth}%`;
          thumbEl.style.transform = `translateX(${travelPx}px)`;
        }
      }
    };

    const stepSize = () => Math.max(260, trackEl.clientWidth * 0.78);
    if (prevBtn) prevBtn.addEventListener('click', () => trackEl.scrollBy({ left: -stepSize(), behavior: 'smooth' }));
    if (nextBtn) nextBtn.addEventListener('click', () => trackEl.scrollBy({ left: stepSize(), behavior: 'smooth' }));

    if (barEl) {
      barEl.addEventListener('click', e => {
        const rect = barEl.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        const maxScroll = Math.max(0, trackEl.scrollWidth - trackEl.clientWidth);
        trackEl.scrollTo({ left: maxScroll * ratio, behavior: 'smooth' });
      });
    }

    trackEl.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(trackEl);
    requestAnimationFrame(update);
    return { update };
  }

  function vietQR({ amount, content, bankId = BANK.id, accountNo = BANK.accountNo, accountName = BANK.accountName, template = 'compact2' }) {
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${Math.round(amount)}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(accountName)}`;
  }

  async function createTokenizedPaymentQr({ amount, content, payerName = '', payerPhone = '', payerId = '', template = 'compact2' }) {
    const cleanAmount = Math.round(Number(amount) || 0);
    const cleanCode = String(content || '').trim();
    const stkTransfer = {
      bankId: BANK.id,
      bankName: BANK.name,
      accountNo: BANK.accountNo,
      accountName: BANK.accountName,
      amount: cleanAmount,
      content: cleanCode,
    };
    try {
      const tokRes = await fetch('/api/payment/bank-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountToken: BANK.accountToken,
          payerId: String(payerId || ''),
          payerName: String(payerName || ''),
          payerPhone: String(payerPhone || ''),
          amount: cleanAmount,
          orderCode: cleanCode,
        }),
      });
      const tokData = await tokRes.json().catch(() => null);
      if (tokRes.ok && tokData && tokData.ok && tokData.bankSessionToken) {
        const qrRes = await fetch('/api/payment/qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountToken: BANK.accountToken,
            bankSessionToken: tokData.bankSessionToken,
            amount: cleanAmount,
            orderCode: cleanCode,
          }),
        });
        const qrData = await qrRes.json().catch(() => null);
        if (qrRes.ok && qrData && qrData.ok && qrData.qrUrl) {
          return {
            ok: true,
            tokenized: true,
            accountToken: BANK.accountToken,
            bankSessionToken: tokData.bankSessionToken,
            qrUrl: qrData.qrUrl,
            stkTransfer: qrData.stkTransfer || stkTransfer,
          };
        }
      }
    } catch (_) {}
    try {
      await fetch('data/payment-tokens.json', { cache: 'no-store' });
    } catch (_) {}
    return {
      ok: true,
      tokenized: false,
      accountToken: BANK.accountToken,
      qrUrl: vietQR({ amount: cleanAmount, content: cleanCode, template }),
      stkTransfer,
    };
  }
  function orderCode() {
    const bytes = new Uint8Array(4);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 4; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    return 'GIAY' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  const MEGA_MENUS = [
    {
      key: 'basketball',
      label: 'Basketball',
      href: 'catalog.html?cat=Basketball',
      cols: [
        {
          title: 'Asian Performance Lab (C-Brands)',
          links: [
            ['Way of Wade 12 & 11 Flagship', 'catalog.html?brand=Way%20of%20Wade'],
            ['Way of Wade 10 Low & All City 14', 'catalog.html?brand=Way%20of%20Wade'],
            ['Li-Ning Gamma 2 & YuShuai 18 Ultra', 'catalog.html?brand=Li-Ning&cat=Basketball'],
            ['Li-Ning Liren 6 V2, 5 Low & Sonic 12', 'catalog.html?brand=Li-Ning&cat=Basketball'],
            ['Anta Kai 2 & Kai 3 (Kyrie Irving)', 'catalog.html?brand=Anta&cat=Basketball'],
            ['Anta KT10, KT9 & Shock Wave 8 Pro', 'catalog.html?brand=Anta&cat=Basketball'],
            ['361° Joker 2 GT, AG 5 & BIG3 Quick', 'catalog.html?brand=361%C2%B0&cat=Basketball'],
            ['SPO Player 1.5 & Game 1 (Drop-in)', 'catalog.html?brand=SPO'],
            ['Rigorer AR 2 & AR 1 (Austin Reaves)', 'catalog.html?brand=Rigorer'],
            ['Peak Taichi Flash 6.0 & Volanti 911', 'catalog.html?cat=Basketball'],
          ],
        },
        {
          title: 'Nike Kobe Protro & NBA Signatures',
          links: [
            ['Nike Kobe 6 Protro (Grinch / Orange / BHM)', 'catalog.html?group=kobe6'],
            ['Nike Kobe 8 Protro (Halo / What The / Lakers)', 'catalog.html?group=kobe8'],
            ['Nike Kobe 5 Protro (X-Ray / Eggplant / Chaos)', 'catalog.html?group=kobe5'],
            ['Nike Kobe 9 Protro (Masterpiece / Halo / China)', 'catalog.html?group=kobe9'],
            ['Nike Kobe 3 Low, Kobe 10 & Kobe 11', 'catalog.html?q=Kobe'],
            ['Nike Ja 3 ZoomX (12 Colorways)', 'catalog.html?group=ja3'],
            ['Nike KD 18 EP "Slim Reaper"', 'catalog.html?group=kd18'],
            ['Nike Sabrina 4 EP & Sabrina 2', 'catalog.html?q=Sabrina'],
            ['Nike Book 2 EP & Book 1', 'catalog.html?q=Book'],
            ['Jordan Tatum 4, AJ 39 & LeBron 23', 'catalog.html?cat=Basketball'],
          ],
        },
        {
          title: 'Chọn Theo Mặt Sân & Phân Khúc',
          links: [
            ['Chuyên Sân Gỗ Indoor (Pro Traction)', 'catalog.html?cat=Basketball'],
            ['Chiến Thần Cày Sân Bê Tông Outdoor', 'catalog.html?q=Outdoor'],
            ['Phân khúc Học Sinh - Sinh Viên (< 2.5Tr)', 'catalog.html?cat=Basketball&max=2500000'],
            ['Grail & Limited Protro Collection', 'catalog.html?cat=Basketball&tag=LIMITED'],
            ['Xem toàn bộ 160+ Giày Bóng Rổ', 'catalog.html?cat=Basketball'],
          ],
        },
      ],
      promo: {
        tag: 'SUPER BOOM + CARBON',
        title: 'WAY OF WADE 12\n& GAMMA 2',
        price: 'Asian Flagship Lab',
        img: 'public/images/top40/wow12-1.jpg',
        href: 'catalog.html?brand=Way%20of%20Wade',
        tileBg: 'bg-adidas',
      },
    },
    {
      key: 'badminton',
      label: 'Cầu lông',
      href: 'catalog.html?cat=Badminton',
      cols: [
        {
          title: 'Li-Ning Badminton (Đội Tuyển Quốc Gia)',
          links: [
            ['Li-Ning Blade II Pro (Đao Phong · BOOM)', 'catalog.html?group=bladedf01'],
            ['Li-Ning Thunder II Pro (Lôi Đình · Carbon)', 'catalog.html?group=bladedf01'],
            ['Li-Ning Ace V2 (Toàn Năng Vương)', 'catalog.html?group=yunting'],
            ['Li-Ning Halberd III & Saga III Pro', 'catalog.html?group=halbertec'],
            ['Tất cả Giày Cầu Lông Li-Ning', 'catalog.html?cat=Badminton&brand=Li-Ning'],
          ],
        },
        {
          title: 'Yonex & Victor BWF Tour',
          links: [
            ['Yonex Power Cushion 65Z4 (25th Anniversary)', 'catalog.html?group=yonex65z3'],
            ['Yonex 65Z4 Viktor Axelsen Edition', 'catalog.html?group=yonex65z3'],
            ['Yonex Power Cushion 65Z3 Wide', 'catalog.html?group=yonex65z3'],
            ['Victor A970 NitroLite (Supercritical Foam)', 'catalog.html?group=victora970'],
            ['Victor A970ACE Lee Zii Jia Edition', 'catalog.html?group=victora970'],
          ],
        },
        {
          title: 'Công Nghệ Sân Thảm & Bảng Size',
          links: [
            ['Đệm Li-Ning BOOM & Khung Chống Lật Cổ Chân', 'catalog.html?cat=Badminton'],
            ['Bảng Size CM Chuẩn Yonex / Victor / Li-Ning', 'posts.html#size-calc-section'],
            ['Xem toàn bộ Giày Cầu Lông Chuyên Nghiệp', 'catalog.html?cat=Badminton'],
          ],
        },
      ],
      promo: {
        tag: 'BWF PRO COURT',
        title: 'LI-NING BLADE II\n& YONEX 65Z4',
        price: '1.890.000₫ – 3.290.000₫',
        img: 'public/images/top40/bladedf01-1.jpg',
        href: 'catalog.html?cat=Badminton',
        tileBg: 'bg-adidas',
      },
    },
    {
      key: 'running',
      label: 'Running & Trail',
      href: 'catalog.html?cat=Running',
      cols: [
        {
          title: 'Road Marathon Carbon (21K – 42K)',
          links: [
            ['Li-Ning Feidian 6 Elite Carbon (Super BOOM)', 'catalog.html?group=feidian5'],
            ['Xtep 160X 8.0 Ultra & Pro (T700 Carbon)', 'catalog.html?group=xtep160x6'],
            ['Qiaodan Feiying Plaid 3.0 (100% Pebax)', 'catalog.html?group=qiaodanplaid'],
            ['361° Flame 4.0 & 3.0 (Quikbone Carbon)', 'catalog.html?group=flame4'],
            ['Adidas Adizero Adios Pro 4', 'catalog.html?group=adiospro4'],
            ['Tất cả Giày Chạy Bộ Marathon', 'catalog.html?cat=Running'],
          ],
        },
        {
          title: 'Trail Running & Mountain Ultra',
          links: [
            ['Kailas Fuga EX 3 Vibram Megagrip', 'catalog.html?group=kailasfugaex3'],
            ['Kailas Fuga EX 330 Ultra Trail', 'catalog.html?group=kailasfugaex3'],
            ['Kailas Fuga DU 2 & DU Monster (Đổ dốc)', 'catalog.html?group=kailasfugadu'],
            ['Nike ZoomX Zegama Trail 2 (Vibram)', 'catalog.html?group=zegama2'],
            ['Tất cả Giày Chạy Địa Hình Trail', 'catalog.html?cat=Trail'],
          ],
        },
        {
          title: 'Pro Road Cycling & Bảng Size',
          links: [
            ['Shimano SH-RC502 Road BOA L6 (4 màu)', 'catalog.html?cat=Cycling'],
            ['Tư vấn tăng +0.5 Size cho Marathon & Trail', 'posts.html#size-calc-section'],
          ],
        },
      ],
      promo: {
        tag: 'VIBRAM MEGAGRIP',
        title: 'KAILAS FUGA EX 3\n& FEIDIAN 6 ELITE',
        price: '2.290.000₫ – 3.690.000₫',
        img: 'public/images/top40/kailasfugaex3-1.jpg',
        href: 'catalog.html?cat=Trail',
        tileBg: 'bg-adidas',
      },
    },
    {
      key: 'tennis',
      label: 'Tennis & Pickleball',
      href: 'catalog.html?cat=Tennis',
      cols: [
        {
          title: 'Asics Hard Court & Pro Pickleball',
          links: [
            ['Asics Court FF 3 (Novak Djokovic Series)', 'catalog.html?group=courtff3'],
            ['Asics Court FF 3 "Night Energy"', 'catalog.html?group=courtff3'],
            ['Asics Gel-Resolution X (Chống lật DYNAWALL)', 'catalog.html?group=gelres9'],
            ['Tất cả Giày Asics Tennis & Pickleball', 'catalog.html?cat=Tennis&brand=Asics'],
          ],
        },
        {
          title: 'Nike Court & Đa Năng Sân Cứng',
          links: [
            ['Nike Court Vapor Pro 3 HC "Smokey Blue"', 'catalog.html?group=vapor12'],
            ['Nike Court Vapor Pro 3 HC "Triple White"', 'catalog.html?group=vapor12'],
            ['Tất cả Giày Tennis & Pickleball', 'catalog.html?cat=Tennis'],
          ],
        },
        {
          title: 'Chuẩn Kỹ Thuật Sân Cứng',
          links: [
            ['Đế AHARPLUS & Hart chịu mài mòn mặt sân nhám', 'catalog.html?cat=Tennis'],
            ['Bảng quy đổi Size CM Asics & Nike Court', 'posts.html#size-calc-section'],
          ],
        },
      ],
      promo: {
        tag: 'HARD COURT KING',
        title: 'ASICS COURT FF 3\n& GEL-RESOLUTION X',
        price: '2.990.000₫ – 3.790.000₫',
        img: 'public/images/top40/courtff3-1.jpg',
        href: 'catalog.html?cat=Tennis',
        tileBg: 'bg-adidas',
      },
    },
    {
      key: 'brands',
      label: 'Brands',
      href: 'catalog.html',
      cols: [
        {
          title: 'Asian Tech Powerhouse (10 Hãng)',
          links: [
            ['Way of Wade (Dwyane Wade)', 'catalog.html?brand=Way%20of%20Wade'],
            ['Li-Ning (Basketball · Badminton · Running)', 'catalog.html?brand=Li-Ning'],
            ['Anta Sports (Kai · KT · Shock Wave)', 'catalog.html?brand=Anta'],
            ['361° Degrees (Joker · AG · Flame Carbon)', 'catalog.html?brand=361%C2%B0'],
            ['Kailas (Vua Giày Chạy Trail Châu Á)', 'catalog.html?brand=Kailas'],
            ['Xtep (160X Marathon Carbon)', 'catalog.html?brand=Xtep'],
            ['Qiaodan (Feiying Plaid Pebax)', 'catalog.html?brand=Qiaodan'],
            ['SPO — Serious Player Only', 'catalog.html?brand=SPO'],
            ['Rigorer & Peak & Volanti', 'catalog.html?cat=Basketball'],
          ],
        },
        {
          title: 'Global Athletic Icons (7 Hãng)',
          links: [
            ['Nike (Basketball · Trail · Tennis)', 'catalog.html?brand=Nike'],
            ['Jordan Brand', 'catalog.html?brand=Jordan'],
            ['Yonex Badminton', 'catalog.html?brand=Yonex'],
            ['Victor Badminton', 'catalog.html?brand=Victor'],
            ['Asics Tennis & Pickleball', 'catalog.html?brand=Asics'],
            ['Adidas Adizero Running', 'catalog.html?brand=Adidas'],
            ['Shimano Road Cycling', 'catalog.html?brand=Shimano'],
          ],
        },
        {
          title: 'Dịch Vụ Chính Hãng',
          links: [
            ['Công cụ đo chân & Bảng Size 17 Hãng', 'posts.html#size-calc-section'],
            ['Tra cứu hành trình đơn Order 12–15 ngày', 'catalog.html'],
          ],
        },
      ],
      promo: {
        tag: 'PROTRO GRAIL',
        title: 'NIKE KOBE 5 PROTRO\n"X-RAY"',
        price: 'Inbox for details',
        img: 'public/images/top40/kobe5-4.jpg',
        href: 'catalog.html?q=Kobe',
        tileBg: 'bg-adidas',
      },
    },
    {
      key: 'sale',
      label: 'Deals',
      href: 'catalog.html?tag=DEAL',
      sale: true,
      cols: [
        {
          title: 'Ưu đãi & Today\'s Deal',
          links: [
            ['Today\'s Deal (12 mẫu giá sàn)', 'catalog.html?tag=DEAL'],
            ['Giày chính hãng dưới 2.000.000₫', 'catalog.html?max=2000000'],
            ['Phân khúc 2.000.000₫ – 3.000.000₫', 'catalog.html?min=2000000&max=3000000'],
            ['Giao hàng toàn quốc 63 tỉnh thành', 'catalog.html'],
          ],
        },
        {
          title: 'Deal Nổi Bật Đang Mở',
          links: [
            ['Anta Kai 3 "CNY" Edition', 'product.html?id=30'],
            ['Jordan Tatum 4 "Bloodline"', 'product.html?id=31'],
            ['Adizero Adios Pro 4 "Flash Aqua"', 'product.html?id=39'],
            ['Nike LeBron 23 "Grand Opening"', 'product.html?id=32'],
            ['Nike Book 1 "Halloween"', 'product.html?id=37'],
          ],
        },
        {
          title: 'Best Value Theo Môn',
          links: [
            ['Anta Kai 2 (14 Phối màu từ 1.630K)', 'catalog.html?group=kai2'],
            ['Li-Ning Halberd III Cầu Lông (1.890K)', 'catalog.html?group=halbertec'],
            ['361° Flame 3.0 Carbon Running (2.290K)', 'catalog.html?group=flame4'],
          ],
        },
      ],
      promo: {
        tag: "TODAY'S DEAL",
        title: 'ANTA KAI 3\n"CNY" EDITION',
        price: '2.890.000₫',
        img: 'public/images/deals/kai3-cny-1.jpg',
        href: 'product.html?id=30',
        tileBg: 'bg-nike',
      },
    },
  ];

  const POPULAR_SEARCHES = [
    ['Way of Wade 12', 'catalog.html?brand=Way%20of%20Wade'],
    ['Nike Kobe Protro', 'catalog.html?q=Kobe'],
    ['Li-Ning Cầu Lông', 'catalog.html?cat=Badminton&brand=Li-Ning'],
    ['Yonex 65Z4 / 65Z3', 'catalog.html?group=yonex65z3'],
    ['Kailas Fuga EX3 Trail', 'catalog.html?cat=Trail'],
    ['Xtep 160X / Feidian Carbon', 'catalog.html?cat=Running'],
    ['Asics Court FF 3 Pickleball', 'catalog.html?cat=Tennis'],
    ['Anta Kai 2 & 3', 'catalog.html?brand=Anta'],
    ['361° Joker 2 GT', 'catalog.html?brand=361%C2%B0'],
  ];

  const PROMO_SLIDES = [
    { text: 'Chuyên giày Bóng rổ, Cầu lông, Chạy bộ Carbon, Trail Vibram & Tennis/Pickleball chính hãng', linkText: 'Khám phá 198 mẫu', href: 'catalog.html' },
    { text: 'Phân phối chính hãng Way of Wade, Li-Ning, Anta, 361°, Xtep, Kailas, Yonex, Asics & Nike', linkText: 'Xem danh mục', href: 'catalog.html' },
    { text: 'Bảng quy đổi kích cỡ chuẩn hãng EU · US · CM cho 17 thương hiệu thể thao', linkText: 'Tra bảng size', href: 'posts.html' },
    { text: 'Đặt trước chính hãng giao 12–15 ngày về kho Huế · Đơn từ 2 triệu cọc 50% giá trị giày', linkText: 'Xem ưu đãi', href: 'catalog.html?tag=DEAL' },
  ];

  function buildMegaPanel(m) {
    return `
      <div class="ck-mega" role="region" aria-label="${esc(m.label)}">
        <div class="ck-container grid grid-cols-4 gap-8 py-9">
          ${m.cols.map((col, idx) => `
            <div class="ck-mega__col" style="--col:${idx}">
              <p class="ck-label text-black mb-4 pb-2 border-b border-line">${esc(col.title)}</p>
              <ul class="ck-mega__list space-y-1.5">
                ${col.links.map(([txt, href]) => `<li><a href="${href}">${esc(txt)}</a></li>`).join('')}
              </ul>
            </div>`).join('')}
          <div class="ck-mega__col" style="--col:3">
            <a href="${m.promo.href}" class="block border border-line hover:border-black transition-colors group overflow-hidden bg-white">
              <div class="aspect-[16/10] ${m.promo.tileBg} overflow-hidden relative">
                <img src="${m.promo.img}" alt="${esc(m.promo.title)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span class="ck-tag ${m.sale ? 'ck-tag--sale' : 'ck-tag--black'} absolute top-3 left-3">${esc(m.promo.tag)}</span>
              </div>
              <div class="p-4 flex items-end justify-between gap-3">
                <div>
                  <p class="ck-title text-2xl text-black whitespace-pre-line">${esc(m.promo.title)}</p>
                  <p class="ck-price text-xs text-muted mt-1">${esc(m.promo.price)}</p>
                </div>
                <span class="w-9 h-9 bg-black text-white inline-flex items-center justify-center flex-shrink-0">${ICON.chevRight}</span>
              </div>
            </a>
          </div>
        </div>
      </div>`;
  }

  function renderHeader() {
    const mount = document.getElementById('ck-header');
    if (!mount) return;
    const page = document.body.dataset.page || '';
    const params = new URLSearchParams(location.search);

    if (document.body.hasAttribute('data-minimal-header')) {
      mount.innerHTML = `
        <header class="ck-header sticky top-0 z-50">
          <div class="ck-container flex items-center justify-between" style="height:var(--ck-header-h)">
            <a href="index.html" aria-label="Cookie's Kicks">
              <img src="public/images/logo-black-crop.png" alt="Cookie's Kicks" class="h-8 sm:h-9 w-auto" />
            </a>
            <div class="flex items-center gap-4 sm:gap-5 text-xs font-semibold uppercase tracking-wider">
              <button type="button" data-open-account class="inline-flex items-center gap-2 px-3 py-1.5 border border-black bg-nike hover:bg-black hover:text-white transition-colors">
                <span data-auth-header-label>Đăng nhập / Tài khoản</span>
              </button>
              <span class="hidden md:inline-flex items-center gap-2 text-instock">${ICON.shield} Thanh toán bảo mật</span>
              <a href="tel:${CONTACT.tel}" class="ck-link hidden sm:inline">${CONTACT.phone}</a>
            </div>
          </div>
        </header>`;
      return;
    }

    const activeKey = (() => {
      if (page === 'posts') return 'posts';
      if (page === 'consign') return 'consign';
      if (page !== 'catalog') return '';
      const cat = (params.get('cat') || '').toLowerCase();
      const tag = (params.get('tag') || '').toUpperCase();
      const brand = (params.get('brand') || '').trim();
      if (tag === 'DEAL' || tag === 'SALE') return 'sale';
      if (cat === 'basketball') return 'basketball';
      if (cat === 'badminton') return 'badminton';
      if (cat === 'running' || cat === 'trail' || cat === 'cycling') return 'running';
      if (cat === 'tennis') return 'tennis';
      if (brand) return 'brands';
      return 'all';
    })();

    const currentQuery = page === 'catalog' ? (params.get('q') || '') : '';

    mount.innerHTML = `
      <div class="ck-topbar" role="region" aria-label="Tiện ích khách hàng">
        <div class="ck-container ck-topbar__inner">
          <div class="ck-topbar__left">
            <span class="ck-topbar__brand">Cookie's Kicks · Order cả thế giới</span>
            <span class="ck-topbar__sep ck-topbar__hide-md" aria-hidden="true"></span>
            <span class="ck-topbar__promise ck-topbar__hide-md">Chính hãng 100% Fullbox · Giao 12–15 ngày</span>
          </div>
          <div class="ck-topbar__nav">
            <button type="button" data-open-custom-order class="ck-topbar__link ck-topbar__hide-xs">Tìm giày theo ảnh</button>
            <span class="ck-topbar__sep ck-topbar__hide-xs" aria-hidden="true"></span>
            <button type="button" data-open-track class="ck-topbar__link">Tra cứu đơn hàng</button>
            <span class="ck-topbar__sep ck-topbar__hide-sm" aria-hidden="true"></span>
            <button type="button" data-open-policy="size" class="ck-topbar__link ck-topbar__hide-sm">Bảng Size 17 Hãng</button>
            <span class="ck-topbar__sep" aria-hidden="true"></span>
            <a href="tel:${CONTACT.tel}" class="ck-topbar__link ck-topbar__phone">0988 561 909</a>
          </div>
        </div>
      </div>

      <header id="ck-site-header" class="ck-header">
        <div class="ck-container relative flex items-center" style="height:var(--ck-header-h)">
          <button type="button" class="ck-icon-btn lg:hidden -ml-2 mr-1" id="ck-menu-open" aria-label="Mở menu">${ICON.menu}</button>

          <a href="index.html" class="flex-shrink-0 mr-6" aria-label="Cookie's Kicks — Trang chủ">
            <img src="public/images/logo-black-crop.png" alt="Cookie's Kicks" class="h-8 sm:h-9 w-auto" />
          </a>

          <nav class="hidden lg:flex items-stretch flex-1 justify-center" id="ck-desktop-nav" aria-label="Danh mục chính">
            ${MEGA_MENUS.map(m => `
              <div class="ck-nav-item static" data-mega-item="${m.key}">
                <a href="${m.href}" class="ck-nav-link ${m.sale ? 'ck-nav-link--sale' : ''} ${activeKey === m.key ? 'is-active' : ''}">${esc(m.label)}</a>
                ${buildMegaPanel(m)}
              </div>`).join('')}
            <div class="ck-nav-item static">
              <a href="catalog.html" class="ck-nav-link ${activeKey === 'all' ? 'is-active' : ''}">All Shoes</a>
            </div>
            <div class="ck-nav-item static">
              <a href="/consign.html" class="ck-nav-link ${activeKey === 'consign' ? 'is-active' : ''}">Ký Gửi &amp; Trade</a>
            </div>
            <div class="ck-nav-item static">
              <a href="posts.html" class="ck-nav-link ${activeKey === 'posts' ? 'is-active' : ''}">Size Guide</a>
            </div>
          </nav>

          <div class="flex items-center gap-1 ml-auto">
            <button type="button" class="ck-search-pill hidden md:inline-flex mr-1.5" data-open-search aria-label="Mở tìm kiếm">
              <span class="ck-search-pill__text">${esc(currentQuery || 'Tìm kiếm giày...')}</span>
              <span class="text-black">${ICON.search}</span>
            </button>
            <button type="button" class="ck-icon-btn md:hidden" data-open-search aria-label="Tìm kiếm">${ICON.search}</button>
            <button type="button" data-open-account class="inline-flex items-center gap-1.5 h-9 px-2.5 border border-line hover:border-black bg-nike text-xs font-bold uppercase tracking-wider transition-colors mr-0.5" title="Tài khoản & Lịch sử mua hàng">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
              <span class="hidden xl:inline max-w-[110px] truncate" data-auth-nav-label>Đăng nhập</span>
            </button>
            <button type="button" class="ck-icon-btn ck-only-xs" data-open-track aria-label="Tra cứu đơn Order 12–15 ngày" title="Tra cứu đơn Order 12–15 ngày">${ICON.truck}</button>
            <a href="catalog.html?wish=1" class="ck-icon-btn" aria-label="Yêu thích">
              ${ICON.heart}<span class="ck-badge-dot" data-wish-count></span>
            </a>
            <button type="button" class="ck-icon-btn" data-open-cart aria-label="Giỏ hàng">
              ${ICON.bag}<span class="ck-badge-dot ck-badge-dot--accent" data-cart-count></span>
            </button>
          </div>
        </div>
      </header>

      <div class="ck-ticker" id="ck-promo-ticker" aria-label="Thông báo khuyến mãi">
        <button type="button" class="ck-ticker__nav ck-ticker__nav--prev" data-ticker-prev aria-label="Trước">${ICON.chevLeft}</button>
        <div class="ck-ticker__viewport">
          <div class="ck-ticker__track" id="ck-ticker-track">
            ${PROMO_SLIDES.concat([PROMO_SLIDES[0]]).map(s => `
              <div class="ck-ticker__slide">
                <span>${esc(s.text)}</span>
                <a href="${s.href}" class="hidden sm:inline">${esc(s.linkText)}</a>
              </div>`).join('')}
          </div>
        </div>
        <button type="button" class="ck-ticker__nav ck-ticker__nav--next" data-ticker-next aria-label="Tiếp">${ICON.chevRight}</button>
      </div>

      <div class="ck-mega-backdrop" id="ck-mega-backdrop" aria-hidden="true"></div>

      <div class="ck-search-backdrop" id="ck-search-backdrop"></div>
      <section class="ck-search-overlay" id="ck-search-overlay" role="dialog" aria-modal="true" aria-label="Tìm kiếm sản phẩm">
        <div class="ck-container py-5 sm:py-7">
          <div class="flex items-center gap-4">
            <a href="index.html" class="hidden sm:block flex-shrink-0">
              <img src="public/images/logo-black-crop.png" alt="Cookie's Kicks" class="h-8 w-auto" />
            </a>
            <form action="catalog.html" method="get" class="flex-1" id="ck-search-overlay-form" role="search">
              <div class="ck-search-overlay__field">
                <span class="text-black mr-3">${ICON.search}</span>
                <input type="search" name="q" id="ck-search-overlay-input" aria-label="Tìm kiếm giày" class="ck-search-overlay__input"
                  placeholder="Tìm Basketball Shoes, Wade 12, Gamma 2, Tatum 4, Shimano..." autocomplete="off"
                  value="${esc(currentQuery)}" />
                <button type="button" class="text-xs font-bold uppercase tracking-wider text-muted hover:text-black px-3" id="ck-search-clear">Xoá</button>
              </div>
            </form>
            <button type="button" class="ck-round-btn !w-10 !h-10" id="ck-search-close" aria-label="Đóng tìm kiếm">${ICON.close}</button>
          </div>

          <div class="mt-6 grid lg:grid-cols-12 gap-8 items-start">
            <div class="lg:col-span-5">
              <p class="ck-label text-muted mb-3">Tìm kiếm phổ biến</p>
              <div class="flex flex-wrap gap-2">
                ${POPULAR_SEARCHES.map(([label, href], i) => `
                  <a href="${href}" class="ck-pop-chip" style="--chip:${i}">${esc(label)}</a>`).join('')}
              </div>
            </div>
            <div class="lg:col-span-7">
              <p class="ck-label text-muted mb-3" id="ck-search-results-label">Gợi ý nổi bật</p>
              <div class="grid sm:grid-cols-2 gap-3" id="ck-search-live"></div>
            </div>
          </div>
        </div>
      </section>

      <div class="ck-overlay" id="ck-menu-overlay"></div>
      <aside class="ck-mobile-menu" id="ck-mobile-menu" aria-label="Menu di động">
        <div class="flex items-center justify-between px-5 border-b border-line" style="height:var(--ck-header-h)">
          <img src="public/images/logo-black-crop.png" alt="Cookie's Kicks" class="h-8 w-auto" />
          <button type="button" class="ck-icon-btn" id="ck-menu-close" aria-label="Đóng menu">${ICON.close}</button>
        </div>
        <div class="p-4 border-b border-line">
          <button type="button" class="ck-search-pill w-full" data-open-search>
            <span>Tìm kiếm giày, thương hiệu...</span>
            <span class="text-black">${ICON.search}</span>
          </button>
        </div>
        <nav class="flex-1 overflow-y-auto px-5 py-2">
          ${MEGA_MENUS.map(m => `
            <div class="ck-acc" data-mob-acc>
              <button type="button" class="ck-acc__head !py-4">
                <span class="ck-title text-2xl ${m.sale ? 'text-accent' : 'text-black'}">${esc(m.label)}</span>
                <span class="ck-acc__icon">${ICON.chevron}</span>
              </button>
              <div class="ck-acc__body">
                <div class="ck-acc__inner">
                  <div class="pb-4 space-y-4">
                    ${m.cols.map(c => `
                      <div>
                        <p class="ck-label text-muted mb-1.5">${esc(c.title)}</p>
                        <ul class="space-y-1.5 pl-2 border-l border-line">
                          ${c.links.map(([t, h]) => `<li><a href="${h}" class="block py-1 text-sm font-medium hover:underline">${esc(t)}</a></li>`).join('')}
                        </ul>
                      </div>`).join('')}
                  </div>
                </div>
              </div>
            </div>`).join('')}
          <a href="catalog.html" class="flex items-center justify-between py-4 border-b border-line ck-title text-2xl">
            Tất cả sản phẩm <span>→</span>
          </a>
          <a href="/consign.html" class="flex items-center justify-between py-4 border-b border-line ck-title text-2xl text-[#d97706]">
            Ký Gửi &amp; Trade (Huế Hub) <span>→</span>
          </a>
          <a href="posts.html" class="flex items-center justify-between py-4 border-b border-line ck-title text-2xl text-[#002FA7]">
            Cẩm nang &amp; Tính Size EU <span>→</span>
          </a>
        </nav>
        <div class="px-5 py-4 bg-nike text-xs space-y-2.5 border-t border-line">
          <button type="button" data-open-account class="flex items-center gap-2 font-bold uppercase tracking-wider w-full text-left text-instock">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>
            <span data-auth-mob-label>Đăng nhập / Lịch sử mua hàng</span>
          </button>
          <button type="button" data-open-track class="flex items-center gap-2 font-bold uppercase tracking-wider w-full text-left text-black">${ICON.truck} Tra cứu đơn Order (12–15 ngày)</button>
          <button type="button" data-open-policy="size" class="flex items-center gap-2 font-bold uppercase tracking-wider w-full text-left text-black">${ICON.shield} Chính sách Size &amp; Bảo hành 1:1</button>
          <button type="button" data-open-custom-order class="flex items-center gap-2 font-bold uppercase tracking-wider w-full text-left text-accent">${ICON.search} Gửi ảnh tìm giày Order riêng</button>
          <div class="flex items-center justify-between text-muted pt-1 border-t border-line">
            <a href="tel:${CONTACT.tel}" class="ck-mono font-semibold text-black">${CONTACT.phone}</a>
            <a href="https://instagram.com/${CONTACT.ig}" target="_blank" rel="noopener" class="font-semibold text-black">@${CONTACT.ig}</a>
          </div>
        </div>
      </aside>`;

    bindMegaMenu();
    bindSearchOverlay();
    bindPromoTicker();
    bindMobileMenu();

    const hdr = document.getElementById('ck-site-header');
    const onScroll = () => hdr && hdr.classList.toggle('is-scrolled', window.scrollY > 36);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function bindMegaMenu() {
    const items = document.querySelectorAll('#ck-desktop-nav [data-mega-item]');
    const backdrop = document.getElementById('ck-mega-backdrop');
    if (!items.length || !backdrop) return;
    let closeTimer = null;

    const openItem = item => {
      clearTimeout(closeTimer);
      items.forEach(el => el.classList.toggle('is-open', el === item));
      backdrop.classList.add('is-open');
    };
    const closeAll = () => {
      items.forEach(el => el.classList.remove('is-open'));
      backdrop.classList.remove('is-open');
    };
    const scheduleClose = () => {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(closeAll, 90);
    };

    items.forEach(item => {
      item.addEventListener('mouseenter', () => openItem(item));
      item.addEventListener('mouseleave', scheduleClose);
      item.addEventListener('focusin', () => openItem(item));
    });
    backdrop.addEventListener('mouseenter', closeAll);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAll();
    });
  }

  function bindSearchOverlay() {
    const overlay = document.getElementById('ck-search-overlay');
    const backdrop = document.getElementById('ck-search-backdrop');
    const input = document.getElementById('ck-search-overlay-input');
    const liveBox = document.getElementById('ck-search-live');
    const labelEl = document.getElementById('ck-search-results-label');
    if (!overlay || !input || !liveBox) return;

    const renderLive = q => {
      const term = (q || '').trim().toLowerCase();
      const all = getProducts();
      const matches = term
        ? all.filter(p => `${p.name} ${p.model} ${p.brand} ${p.colorName || ''} ${p.dealName || ''} ${p.category}`.toLowerCase().includes(term)).slice(0, 4)
        : [all[0], all[12], all[29], all[38]].filter(Boolean);

      labelEl.textContent = term ? `Kết quả nhanh cho "${q.trim()}"` : 'Gợi ý nổi bật';
      if (!matches.length) {
        liveBox.innerHTML = `<p class="text-sm text-muted col-span-2 py-4">Không tìm thấy mẫu phù hợp. Nhấn Enter để tìm toàn bộ danh mục.</p>`;
        return;
      }
      liveBox.innerHTML = matches.map(p => `
        <a href="product.html?id=${encodeURIComponent(p.id)}" class="flex items-center gap-3 p-2 border border-line hover:border-black transition-colors bg-white">
          <div class="w-16 h-16 bg-adidas flex-shrink-0 overflow-hidden">
            <img src="${esc(p.image || FALLBACK_IMG)}" alt="${esc(p.name)}" class="w-full h-full object-cover" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-semibold text-black truncate">${esc(p.dealName ? p.name : p.model)}</p>
            <p class="text-[11px] text-muted truncate">${esc(p.colorName || p.brand)}</p>
            <p class="ck-price text-xs mt-1 ${p.tag === 'DEAL' ? 'text-accent' : 'text-black'}">${priceText(p)}</p>
          </div>
        </a>`).join('');
    };

    const open = () => {

      const mob = document.getElementById('ck-mobile-menu');
      const mobOv = document.getElementById('ck-menu-overlay');
      if (mob) mob.classList.remove('is-open');
      if (mobOv) mobOv.classList.remove('is-open');

      renderLive(input.value);
      overlay.classList.add('is-open');
      backdrop.classList.add('is-open');
      setTimeout(() => input.focus(), 60);
    };
    const close = () => {
      overlay.classList.remove('is-open');
      backdrop.classList.remove('is-open');
    };

    document.querySelectorAll('[data-open-search]').forEach(btn => btn.addEventListener('click', open));
    document.getElementById('ck-search-close').addEventListener('click', close);
    backdrop.addEventListener('click', close);
    document.getElementById('ck-search-clear').addEventListener('click', () => {
      input.value = '';
      renderLive('');
      input.focus();
    });
    input.addEventListener('input', () => renderLive(input.value));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });
  }

  function bindPromoTicker() {
    const ticker = document.getElementById('ck-promo-ticker');
    const track = document.getElementById('ck-ticker-track');
    if (!ticker || !track) return;
    const total = PROMO_SLIDES.length;
    let idx = 0;
    let paused = false;

    const goTo = nextIdx => {
      idx = nextIdx;
      track.classList.remove('no-anim');
      track.style.transform = `translateX(-${idx * 100}%)`;
    };

    track.addEventListener('transitionend', () => {
      if (idx >= total) {
        track.classList.add('no-anim');
        idx = 0;
        track.style.transform = 'translateX(0%)';
      }
    });

    const stepNext = () => {
      if (idx >= total) return;
      goTo(idx + 1);
    };
    const stepPrev = () => {
      if (idx <= 0) {
        track.classList.add('no-anim');
        idx = total;
        track.style.transform = `translateX(-${total * 100}%)`;
        requestAnimationFrame(() => requestAnimationFrame(() => goTo(total - 1)));
      } else {
        goTo(idx - 1);
      }
    };

    const prevBtn = ticker.querySelector('[data-ticker-prev]');
    const nextBtn = ticker.querySelector('[data-ticker-next]');
    if (prevBtn) prevBtn.addEventListener('click', stepPrev);
    if (nextBtn) nextBtn.addEventListener('click', stepNext);

    ticker.addEventListener('mouseenter', () => { paused = true; });
    ticker.addEventListener('mouseleave', () => { paused = false; });

    setInterval(() => {
      if (!paused && !document.hidden) stepNext();
    }, 4000);
  }

  function bindMobileMenu() {
    const menu = document.getElementById('ck-mobile-menu');
    const ov = document.getElementById('ck-menu-overlay');
    const openBtn = document.getElementById('ck-menu-open');
    const closeBtn = document.getElementById('ck-menu-close');
    if (!menu || !ov || !openBtn) return;

    const open = () => {
      menu.classList.add('is-open');
      ov.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      menu.classList.remove('is-open');
      ov.classList.remove('is-open');
      document.body.style.overflow = '';
    };
    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    ov.addEventListener('click', close);

    menu.querySelectorAll('[data-mob-acc] .ck-acc__head').forEach(head => {
      head.addEventListener('click', () => {
        head.closest('[data-mob-acc]').classList.toggle('is-open');
      });
    });
  }

  function renderDrawerShell() {
    if (document.getElementById('ck-cart-drawer') || document.body.hasAttribute('data-no-drawer')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="ck-overlay" id="ck-cart-overlay"></div>
      <aside class="ck-drawer" id="ck-cart-drawer" aria-label="Giỏ hàng" aria-hidden="true">
        <div class="flex items-center justify-between px-6 border-b border-line" style="height:68px">
          <h2 class="ck-title text-3xl">Giỏ hàng <span class="ck-mono text-base text-muted align-middle ml-1" id="ck-cart-head-count"></span></h2>
          <button type="button" class="ck-icon-btn -mr-2" data-close-cart aria-label="Đóng">${ICON.close}</button>
        </div>
        <div class="px-6 py-3.5 bg-nike border-b border-line" id="ck-ship-progress"></div>
        <div class="flex-1 overflow-y-auto px-6" id="ck-cart-items"></div>
        <div class="border-t border-line px-6 py-5 space-y-4 bg-white" id="ck-cart-foot"></div>
      </aside>`;
    document.body.appendChild(wrap);
    document.getElementById('ck-cart-overlay').addEventListener('click', closeCart);
    wrap.querySelector('[data-close-cart]').addEventListener('click', closeCart);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeCart();
    });
  }

  function renderDrawer() {
    const list = document.getElementById('ck-cart-items');
    if (!list) return;
    const items = cart.get();
    const sub = cart.subtotal();
    document.getElementById('ck-cart-head-count').textContent = items.length ? `[${cart.count()}]` : '';

    document.getElementById('ck-ship-progress').innerHTML = `
      <p class="text-xs font-medium mb-2">Giao hàng toàn quốc 63 tỉnh thành · Phí vận chuyển đồng giá <b class="ck-mono text-black">50.000₫</b></p>
      <div class="ck-progress"><span style="width:100%"></span></div>`;

    if (!items.length) {
      list.innerHTML = `
        <div class="py-16 text-center">
          <p class="ck-title text-3xl mb-2">Giỏ hàng trống</p>
          <p class="text-sm text-muted mb-8">Chọn ngay một đôi Basketball, Badminton, Carbon Running, Trail hoặc Tennis/Pickleball chuẩn size EU.</p>
          <a href="catalog.html" class="ck-btn">Khám phá giày ${ICON.arrow}</a>
        </div>`;
      document.getElementById('ck-cart-foot').innerHTML = '';
      return;
    }

    list.innerHTML = items.map(i => `
      <div class="flex gap-4 py-5 border-b border-line">
        <a href="product.html?id=${encodeURIComponent(i.id)}" class="w-24 h-24 bg-adidas flex-shrink-0 overflow-hidden">
          <img src="${esc(i.image || FALLBACK_IMG)}" alt="${esc(i.name)}" class="w-full h-full object-cover" />
        </a>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between gap-2">
            <a href="product.html?id=${encodeURIComponent(i.id)}" class="text-sm font-semibold text-black leading-snug hover:underline">${esc(i.name)}</a>
            <button type="button" class="text-muted hover:text-accent flex-shrink-0" aria-label="Xoá" data-cart-rm="${esc(i.key)}">${ICON.trash}</button>
          </div>
          <p class="text-xs text-muted mt-1">${esc(i.colorway)} · <b class="text-black">${esc(sizeBadge(i, i.size))}</b></p>
          <div class="flex items-center justify-between mt-3">
            <div class="flex items-center border border-line">
              <button type="button" class="w-8 h-8 hover:bg-nike font-bold" aria-label="Giảm" data-cart-qty="${esc(i.key)}" data-qty="${i.qty - 1}">−</button>
              <span class="w-8 text-center ck-mono text-xs font-bold">${i.qty}</span>
              <button type="button" class="w-8 h-8 hover:bg-nike font-bold" aria-label="Tăng" data-cart-qty="${esc(i.key)}" data-qty="${i.qty + 1}">+</button>
            </div>
            <p class="ck-price text-sm text-black">${formatVND(i.price * i.qty)}</p>
          </div>
        </div>
      </div>`).join('');

    document.getElementById('ck-cart-foot').innerHTML = `
      <div class="flex justify-between text-xs"><span class="text-muted uppercase tracking-wider">Tạm tính</span><span class="ck-price">${formatVND(sub)}</span></div>
      <div class="flex justify-between text-xs"><span class="text-muted uppercase tracking-wider">Vận chuyển toàn quốc</span><span class="font-semibold ck-mono">50.000₫</span></div>
      <div class="flex justify-between items-baseline pt-3 border-t border-line">
        <span class="ck-label">Tổng cộng</span>
        <span class="ck-mono text-xl font-bold text-black">${formatVND(sub + 50000)}</span>
      </div>
      <a href="checkout.html" class="ck-btn ck-btn--block">Thanh toán ngay ${ICON.arrow}</a>
      <p class="text-[11px] text-muted text-center">VietQR MB Bank · MoMo · Đơn từ 2Tr cọc 50% giá trị giày · Giao 63 tỉnh thành</p>`;
  }

  function openCart() {
    hideMiniCart();
    const d = document.getElementById('ck-cart-drawer');
    if (!d) {
      location.href = 'checkout.html';
      return;
    }
    renderDrawer();
    d.classList.add('is-open');
    d.setAttribute('aria-hidden', 'false');
    document.getElementById('ck-cart-overlay').classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    const d = document.getElementById('ck-cart-drawer');
    if (!d) return;
    d.classList.remove('is-open');
    d.setAttribute('aria-hidden', 'true');
    document.getElementById('ck-cart-overlay').classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function renderFooter() {
    const mount = document.getElementById('ck-footer');
    if (!mount) return;
    if (document.body.hasAttribute('data-minimal-header')) {
      mount.innerHTML = `
        <footer class="bg-charcoal text-white/70 text-xs">
          <div class="ck-container py-6 flex flex-col sm:flex-row gap-3 justify-between">
            <span>© 2026 Cookie's Kicks · ${CONTACT.city}</span>
            <span class="ck-mono text-xs">${CONTACT.phone} · ${CONTACT.email}</span>
          </div>
        </footer>`;
      return;
    }

    mount.innerHTML = `
      <section class="bg-black text-white">
        <div class="ck-container py-12 lg:py-14 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p class="ck-eyebrow text-accent mb-2">Cookie's Kicks Membership</p>
            <h2 class="ck-display text-3xl sm:text-5xl">NHẬN THÔNG BÁO TODAY'S DEAL <br/>&amp; ƯU ĐÃI 10% ĐƠN ĐẦU</h2>
          </div>
          <form class="flex flex-col sm:flex-row gap-3" data-newsletter-form>
            <input type="email" required placeholder="Nhập email nhận lịch drop giày..." class="ck-input flex-1 !border-white" aria-label="Email" />
            <button type="submit" class="ck-btn ck-btn--white">Đăng ký ${ICON.arrow}</button>
          </form>
        </div>
      </section>

      <footer class="bg-white border-t border-line">
        <div class="ck-container py-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div class="col-span-2 md:col-span-4 lg:col-span-1">
            <img src="public/images/logo-black-crop.png" alt="Cookie's Kicks" class="h-10 w-auto mb-4" />
            <p class="text-xs text-muted leading-relaxed">Multi-Sport Performance Hub &amp; Asian Tech Lab: Chuyên phân phối và Order trực tiếp Bóng rổ, Cầu lông, Chạy bộ Carbon, Chạy địa hình Trail, Tennis &amp; Pickleball chính hãng.</p>
          </div>
          <div>
            <p class="ck-label text-black mb-4">Bộ Môn &amp; Thương Hiệu</p>
            <ul class="space-y-2 text-xs text-muted font-medium">
              <li><a class="hover:text-black hover:underline" href="catalog.html?cat=Basketball">Basketball (Way of Wade · Li-Ning · Anta · Kobe Protro)</a></li>
              <li><a class="hover:text-black hover:underline" href="catalog.html?cat=Badminton">Badminton · Cầu lông (Li-Ning BOOM · Yonex 65Z · Victor)</a></li>
              <li><a class="hover:text-black hover:underline" href="catalog.html?cat=Running">Road Marathon Carbon (Feidian · Xtep 160X · Qiaodan Plaid)</a></li>
              <li><a class="hover:text-black hover:underline" href="catalog.html?cat=Trail">Trail Running (Kailas Fuga EX3/DU2 Vibram · Nike Zegama 2)</a></li>
              <li><a class="hover:text-black hover:underline" href="catalog.html?cat=Tennis">Tennis &amp; Pickleball (Asics Court FF 3 · Gel-Resolution · Vapor)</a></li>
              <li><a class="hover:text-black hover:underline" href="catalog.html?cat=Cycling">Pro Road Cycling (Shimano RC502 BOA)</a></li>
            </ul>
          </div>
          <div>
            <p class="ck-label text-black mb-4">Dịch vụ &amp; Chính sách</p>
            <ul class="space-y-2.5 text-xs text-muted font-medium">
              <li><a class="hover:text-black hover:underline font-semibold text-[#002FA7]" href="posts.html">Công cụ tính Size EU &amp; Cẩm nang Auth</a></li>
              <li><a class="hover:text-black hover:underline font-semibold text-black" href="consign.html">Sàn Ký Gửi &amp; Trade Giày Cũ Đổi Mới</a></li>
              <li><a class="hover:text-black hover:underline" href="checkout.html">Thanh toán VietQR / MoMo</a></li>
              <li><button type="button" data-open-policy="auth" class="hover:text-black hover:underline text-left">Cam kết 100% Authentic &amp; Đặt cọc</button></li>
              <li><button type="button" data-open-policy="size" class="hover:text-black hover:underline text-left font-semibold text-black">Quy định Chọn Size &amp; Đổi lỗi 1:1 (10–12 ngày)</button></li>
            </ul>
          </div>
          <div>
            <p class="ck-label text-black mb-4">Liên hệ</p>
            <ul class="space-y-2.5 text-xs text-muted font-medium">
              <li>${CONTACT.city}</li>
              <li><a class="ck-mono text-xs text-black hover:underline" href="tel:${CONTACT.tel}">${CONTACT.phone}</a></li>
              <li><a class="hover:text-black hover:underline break-all" href="mailto:${CONTACT.email}">${CONTACT.email}</a></li>
              <li><a class="hover:text-black hover:underline" target="_blank" rel="noopener" href="${CONTACT.facebook}">Facebook Cookie's Kicks</a></li>
            </ul>
          </div>
          <div>
            <p class="ck-label text-black mb-4">Kết nối</p>
            <div class="flex flex-col items-start gap-2">
              <a href="https://instagram.com/${CONTACT.ig}" target="_blank" rel="noopener" class="ck-link">@${CONTACT.ig}</a>
              <a href="${CONTACT.zalo}" target="_blank" rel="noopener" class="ck-link">Zalo Order Nhanh</a>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-5">
              <span class="ck-tag ck-tag--black">VietQR</span>
              <span class="ck-tag ck-tag--gray">MoMo</span>
              <span class="ck-tag ck-tag--instock">Auth 100%</span>
            </div>
          </div>
        </div>
        <div class="bg-charcoal text-white/60 text-xs">
          <div class="ck-container py-4 flex flex-col sm:flex-row gap-2 justify-between">
            <span>© 2026 Cookie's Kicks. All rights reserved.</span>
            <span class="ck-mono text-[11px]">HUẾ · VIET NAM · AUTHENTIC PERFORMANCE FOOTWEAR</span>
          </div>
        </div>
      </footer>`;
  }

  function initReveal(root) {
    const els = (root || document).querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      els.forEach(e => e.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    els.forEach(e => io.observe(e));
  }

  async function saveOrdersToServer(list) {
    const snapshot = JSON.parse(JSON.stringify(list));
    const revision = adminCacheRevision;
    const response = await adminFetch('/api/orders', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(snapshot),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result || result.ok !== true) throw new Error((result && result.error) || 'Khong luu duoc don hang');
    if (revision === adminCacheRevision) {
      try { write(KEYS.orders, snapshot); } catch (e) {}
    }
    return result;
  }

  async function deleteOrdersOnServer(opts) {
    const p = opts || {};
    const qs = new URLSearchParams();
    if (p.id) qs.set('id', String(p.id));
    if (p.mode) qs.set('mode', String(p.mode));
    if (!p.id && p.mode !== 'demo') {
      if (!p.mode) qs.set('mode', 'all');
      qs.set('confirm', 'DELETE_ALL');
    }
    const url = '/api/orders' + (qs.toString() ? '?' + qs.toString() : '');
    const res = await adminFetch(url, { method: 'DELETE' });
    const result = await res.json().catch(() => null);
    if (!res.ok || !result || result.ok !== true) throw new Error((result && result.error) || 'Khong xoa duoc don hang');
    return result;
  }

  async function appendOrderToServer(order) {
    const tok = auth && auth.getToken ? auth.getToken() : '';
    const u = auth && auth.getUser ? auth.getUser() : null;
    if (!tok || !u) {
      throw new Error('AUTH_REQUIRED');
    }
    let res;
    try {
      res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + tok,
        },
        body: JSON.stringify(order),
      });
    } catch (_) {
      throw new Error('Không thể kết nối máy chủ đặt hàng. Vui lòng kiểm tra mạng và thử lại!');
    }
    if (res.status === 401) {
      throw new Error('AUTH_REQUIRED');
    }
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || !data.ok || !data.order) {
      throw new Error((data && data.error) || 'Không thể tạo đơn hàng trên máy chủ. Vui lòng kiểm tra lại giỏ hàng!');
    }
    const origId = String(order.id || '');
    Object.assign(order, data.order);
    const currentArr = read(KEYS.orders, []);
    const arr = Array.isArray(currentArr) ? currentArr.slice() : [];
    const idx = arr.findIndex(o => o && (String(o.id) === origId || String(o.id) === String(data.order.id)));
    if (idx >= 0) arr[idx] = Object.assign({}, arr[idx], data.order);
    else arr.unshift(data.order);
    write(KEYS.orders, arr);
    return order;
  }

  const ORDER_STEPS = [
    { key: 'wait', label: '1. Chờ xác nhận cọc', desc: 'Shop đang đối soát giao dịch cọc / xác nhận size qua Zalo.' },
    { key: 'paid', label: '2. Đã cọc · Đang Order về VN (12–15 ngày)', desc: 'Giày đã được đặt chính hãng và đang trên đường bay về Việt Nam.' },
    { key: 'arrived', label: '3. Đã về kho Huế · Check Auth', desc: 'Giày đã về tới kho Cookie\'s Kicks tại Huế, đang kiểm định & chụp ảnh gửi bạn.' },
    { key: 'shipping', label: '4. Đang giao GHN toàn quốc', desc: 'Đơn hàng đã bàn giao cho GHN vận chuyển tới địa chỉ của bạn.' },
    { key: 'done', label: '5. Hoàn tất', desc: 'Đã giao thành công & tất toán.' },
  ];

  function openTrackModal(prefill) {
    let m = document.getElementById('ck-track-modal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'ck-track-modal';
      m.className = 'ck-modal';
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-modal', 'true');
      m.setAttribute('aria-label', 'Tra cứu hành trình đơn Order');
      m.innerHTML = `
        <div class="ck-modal__backdrop" data-track-close></div>
        <div class="ck-modal__box relative z-10 max-w-2xl p-6 sm:p-8 border border-black bg-white max-h-[90vh] overflow-y-auto">
          <button type="button" class="ck-icon-btn absolute top-3 right-3" data-track-close aria-label="Đóng">${ICON.close}</button>
          <p class="ck-eyebrow text-instock mb-1.5">Order Tracking · 12–15 Ngày</p>
          <h2 class="ck-title text-3xl sm:text-4xl text-black mb-2">TRA CỨU HÀNH TRÌNH ĐƠN ORDER</h2>
          <p class="text-xs text-muted mb-5">Nhập <b>Số điện thoại đặt hàng</b> hoặc <b>Mã đơn (VD: GIAY4821)</b> để xem tiến độ đơn giày Order 12–15 ngày của bạn.</p>
          <form id="ck-track-form" class="flex flex-col sm:flex-row gap-2.5 mb-6">
            <input id="ck-track-input" type="search" aria-label="Số điện thoại hoặc mã đơn hàng" class="ck-input flex-1" placeholder="Nhập SĐT (VD: 0905123456) hoặc mã GIAY..." required />
            <button type="submit" class="ck-btn ck-btn--sm justify-center">Tra cứu ngay ${ICON.arrow}</button>
          </form>
          <div id="ck-track-results" class="space-y-4"></div>
        </div>`;
      document.body.appendChild(m);
      m.addEventListener('click', e => {
        if (e.target.closest('[data-track-close]')) m.classList.remove('is-open');
      });
      document.getElementById('ck-track-form').addEventListener('submit', async e => {
        e.preventDefault();
        const q = document.getElementById('ck-track-input').value.trim();
        await renderTrackResults(q);
      });
    }
    const mob = document.getElementById('ck-mobile-menu');
    const mobOv = document.getElementById('ck-menu-overlay');
    if (mob) mob.classList.remove('is-open');
    if (mobOv) mobOv.classList.remove('is-open');
    document.body.style.overflow = '';

    const inp = document.getElementById('ck-track-input');
    if (prefill) inp.value = prefill;
    m.classList.add('is-open');
    if (inp.value.trim()) renderTrackResults(inp.value.trim());
    else {
      document.getElementById('ck-track-results').innerHTML = `
        <div class="p-4 bg-nike border border-line text-xs text-muted space-y-1.5">
          <p class="font-bold text-black uppercase tracking-wider">Quy trình Order chuẩn 12–15 ngày tại Cookie's Kicks:</p>
          <p>1. Khách chọn mẫu &amp; size EU trên web, cọc từ 500.000₫ (hoặc thanh toán 100% Freeship).</p>
          <p>2. Shop đặt hàng chính hãng quốc tế &amp; bay về kho Huế trong 10–12 ngày.</p>
          <p>3. Shop Check Auth, chụp ảnh thực tế đôi giày gửi Zalo khách kiểm tra rồi ship GHN (tổng 12–15 ngày về tay).</p>
        </div>`;
      setTimeout(() => inp.focus(), 60);
    }
  }

  async function renderTrackResults(rawQ) {
    const box = document.getElementById('ck-track-results');
    if (!box) return;
    box.innerHTML = `<p class="text-sm text-muted py-4">Đang tải dữ liệu đơn hàng...</p>`;
    let matches = [];
    try {
      const tok = auth && auth.getToken ? auth.getToken() : '';
      const r = await fetch('/api/orders/track?q=' + encodeURIComponent(rawQ), {
        cache: 'no-store',
        headers: tok ? { Authorization: 'Bearer ' + tok } : {},
      });
      if (r.ok) {
        const d = await r.json();
        if (d && Array.isArray(d.orders)) matches = d.orders;
      }
    } catch (e) {}
    if (!matches.length) {
      const stored = read(KEYS.orders, []);
      const list = Array.isArray(stored) ? stored : [];
      const q = String(rawQ || '').trim().toLowerCase().replace(/^#/, '');
      const qDigits = q.replace(/\D/g, '');
      matches = list.filter(o => {
        if (!o) return false;
        if (String(o.id || '').toLowerCase() === q) return true;
        if (qDigits.length >= 8 && String(o.phone || '').replace(/\D/g, '').includes(qDigits)) return true;
        return false;
      });
    }

    if (!matches.length) {
      box.innerHTML = `
        <div class="p-6 border border-line bg-nike text-center">
          <p class="ck-title text-2xl text-black mb-1">Không tìm thấy đơn hàng</p>
          <p class="text-xs text-muted mb-4">Không tìm thấy đơn khớp với "${esc(rawQ)}". Vui lòng kiểm tra lại SĐT hoặc nhắn Zalo <b class="text-black">${CONTACT.phone}</b> để shop hỗ trợ ngay.</p>
          <a href="${CONTACT.zalo}" target="_blank" rel="noopener" class="ck-btn ck-btn--sm">Hỗ trợ qua Zalo ${ICON.arrow}</a>
        </div>`;
      return;
    }

    box.innerHTML = matches.map(o => {
      const remain = Math.max(0, (Number(o.total) || 0) - (Number(o.paid) || 0));
      const eta = o.etaWindow || orderEtaWindow('12–15 ngày', o.createdAt || o.date);
      const stepIdx = ORDER_STEPS.findIndex(s => s.key === o.status);
      const activeIdx = stepIdx === -1 ? 0 : stepIdx;
      const isCancel = o.status === 'cancel';

      return `
        <div class="border border-black p-5 bg-white space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-line">
            <div>
              <span class="ck-mono text-lg font-bold text-black">#${esc(o.id)}</span>
              <span class="text-xs text-muted ml-2">· Ngày đặt: ${esc(o.date || '')}</span>
            </div>
            <span class="ck-tag ${isCancel ? 'ck-tag--sale' : 'ck-tag--instock'}">
              ${isCancel ? 'Đã huỷ' : (ORDER_STEPS[activeIdx] ? ORDER_STEPS[activeIdx].label : 'Đang xử lý')}
            </span>
          </div>

          <div class="grid sm:grid-cols-2 gap-3 text-xs bg-nike p-3.5 border border-line">
            <div>
              <p class="text-muted uppercase text-[10px] font-bold">Khách hàng</p>
              <p class="font-bold text-black mt-0.5">${esc(o.name)} · ${esc(o.phone)}</p>
              <p class="text-muted mt-0.5">${esc(o.address || '')}</p>
            </div>
            <div>
              <p class="text-muted uppercase text-[10px] font-bold">Dự kiến về tay (Order 12–15 ngày)</p>
              <p class="ck-mono font-bold text-instock mt-0.5">${esc(eta)}</p>
              ${o.tracking ? `<p class="ck-mono text-black mt-0.5">Mã vận đơn GHN: <b>${esc(o.tracking)}</b></p>` : ''}
            </div>
          </div>

          <div class="space-y-2">
            ${(o.items || []).map(it => `
              <div class="flex justify-between items-center text-xs py-1.5 border-b border-line">
                <span class="font-semibold text-black">${esc(it.name)} <span class="text-muted">· ${esc(it.colorway || '')} · ${esc(sizeBadge(it, it.size))} × ${it.qty || 1}</span></span>
                <span class="ck-mono font-bold">${formatVND((it.price || 0) * (it.qty || 1))}</span>
              </div>`).join('')}
          </div>

          <div class="flex flex-wrap justify-between gap-3 text-xs pt-1">
            <span>Tổng đơn: <b class="ck-mono text-black">${formatVND(o.total || 0)}</b></span>
            <span>Đã cọc/thanh toán: <b class="ck-mono text-instock">${formatVND(o.paid || 0)}</b></span>
            <span>Còn thanh toán khi nhận hàng: <b class="ck-mono text-accent">${formatVND(remain)}</b></span>
          </div>

          ${!isCancel ? `
            <div class="pt-3 border-t border-line">
              <p class="ck-label text-[11px] text-black mb-2.5">Tiến độ đơn Order 12–15 ngày</p>
              <ol class="space-y-2">
                ${ORDER_STEPS.map((st, idx) => {
                  const done = idx <= activeIdx;
                  const curr = idx === activeIdx;
                  return `
                    <li class="flex items-start gap-2.5 text-xs ${done ? 'text-black' : 'text-muted opacity-55'}">
                      <span class="w-5 h-5 flex-shrink-0 inline-flex items-center justify-center font-bold text-[11px] ${curr ? 'bg-instock text-white' : done ? 'bg-black text-white' : 'border border-line bg-nike'}">${done ? '✓' : idx + 1}</span>
                      <div>
                        <p class="font-bold">${esc(st.label)}</p>
                        ${curr ? `<p class="text-[11px] text-muted mt-0.5">${esc(st.desc)}</p>` : ''}
                      </div>
                    </li>`;
                }).join('')}
              </ol>
            </div>` : ''}

          <div class="pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2">
            <a href="receipt.html?id=${encodeURIComponent(o.id)}${o.receiptKey ? '&key=' + encodeURIComponent(o.receiptKey) : ''}" target="_blank" rel="noopener" class="ck-btn ck-btn--ghost ck-btn--sm">
              🧾 Mở / In Phiếu Biên Nhận Cọc &amp; Bảo Hành
            </a>
            <button type="button" data-open-policy="size" class="ck-link !text-xs">Xem quy định bảo hành 1:1 →</button>
          </div>
        </div>`;
    }).join('');
  }

  function openCustomOrderModal() {
    if (!auth.getUser() || !auth.getToken()) {
      requireAuth(() => openCustomOrderModal(), 'Vui lòng đăng nhập tài khoản trước khi gửi yêu cầu đặt giày');
      return;
    }
    let m = document.getElementById('ck-custom-order-modal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'ck-custom-order-modal';
      m.className = 'ck-modal';
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-modal', 'true');
      m.setAttribute('aria-label', 'Order giày theo yêu cầu');
      m.innerHTML = `
        <div class="ck-modal__backdrop" data-co-close></div>
        <div class="ck-modal__box relative z-10 max-w-xl p-6 sm:p-8 border border-black bg-white max-h-[90vh] overflow-y-auto">
          <button type="button" class="ck-icon-btn absolute top-3 right-3" data-co-close aria-label="Đóng">${ICON.close}</button>
          <p class="ck-eyebrow text-accent mb-1.5">Order theo yêu cầu · 12–15 ngày</p>
          <h2 class="ck-title text-2xl sm:text-3xl text-black mb-2">Gửi ảnh tìm mẫu &amp; Nhận báo giá</h2>
          <p class="text-xs text-muted mb-6 leading-relaxed">Bạn đang tìm một phối màu hoặc mẫu giày chưa có sẵn trên danh mục? Tải ảnh đôi giày lên kèm Size EU, Cookie's Kicks sẽ kiểm tra giá chính hãng và báo lại qua Zalo trong 15 phút.</p>
          <form id="ck-co-form" class="ck-form-stack">
            <div class="grid sm:grid-cols-2 ck-form-grid">
              <div>
                <label class="ck-field-label" for="co-name">Họ và tên người nhận *</label>
                <input id="co-name" class="ck-input" required placeholder="VD: Nguyễn Văn A" />
              </div>
              <div>
                <label class="ck-field-label" for="co-phone">Số điện thoại / Zalo *</label>
                <input id="co-phone" type="tel" data-mask="phone" class="ck-input tabular" required placeholder="09xx xxx xxx" maxlength="16" />
              </div>
            </div>
            <div class="grid sm:grid-cols-[1fr_140px] ck-form-grid">
              <div>
                <label class="ck-field-label" for="co-shoe">Tên mẫu giày / Phối màu cần tìm *</label>
                <input id="co-shoe" class="ck-input" required placeholder="VD: Wade 12 Announcement, Kobe 6 Reverse Grinch…" />
              </div>
              <div>
                <label class="ck-field-label" for="co-size">Size EU *</label>
                <select id="co-size" class="ck-select">
                  ${['36', '37', '38', '38.5', '39', '39.5', '40', '40 1/3', '40.5', '40 2/3', '41', '41 1/3', '41.5', '42', '42 1/3', '42.5', '42 2/3', '43', '43 1/3', '43.5', '44', '44 1/3', '44.5', '44 2/3', '45', '45.5', '46'].map(s => `<option value="${s}" ${s === '42' ? 'selected' : ''}>EU ${s}</option>`).join('')}
                </select>
              </div>
            </div>
            <div>
              <label class="ck-field-label">Ảnh mẫu giày cần tìm (tải từ máy hoặc điện thoại)</label>
              <div class="flex items-center gap-4 mt-1">
                <div class="w-20 h-20 bg-nike border border-line rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img id="co-preview" src="${FALLBACK_IMG}" alt="Preview" class="w-full h-full object-cover" />
                </div>
                <div class="space-y-2">
                  <label class="ck-btn ck-btn--ghost ck-btn--sm cursor-pointer">
                    Tải ảnh mẫu giày lên
                    <input id="co-file" type="file" accept="image/*" class="sr-only" />
                  </label>
                  <p id="co-file-status" class="text-[11px] text-muted">Hỗ trợ JPG, PNG, WebP chụp thực tế hoặc ảnh hãng.</p>
                </div>
              </div>
            </div>
            <div>
              <label class="ck-field-label" for="co-note">Ghi chú thêm (ngân sách dự kiến / yêu cầu hộp)</label>
              <textarea id="co-note" class="ck-textarea" rows="2" placeholder="VD: Cần hàng New Fullbox, báo giá giúp mình qua Zalo…"></textarea>
            </div>
            <button type="submit" id="co-submit" class="ck-btn ck-btn--block ck-form-submit">Gửi ảnh &amp; Nhận báo giá qua Zalo ${ICON.arrow}</button>
          </form>
        </div>`;
      document.body.appendChild(m);
      let uploadedCoImg = '';
      m.addEventListener('click', e => {
        if (e.target.closest('[data-co-close]')) m.classList.remove('is-open');
      });
      const fileInp = document.getElementById('co-file');
      fileInp.addEventListener('change', () => {
        const f = fileInp.files && fileInp.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = async () => {
          uploadedCoImg = '';
          try {
            document.getElementById('co-preview').src = reader.result;
            document.getElementById('co-file-status').textContent = 'Đang tải ảnh lên server...';
            uploadedCoImg = await uploadImage(reader.result);
            document.getElementById('co-preview').src = uploadedCoImg;
            document.getElementById('co-file-status').textContent = '✓ Đã tải ảnh lên thành công';
          } catch (error) {
            document.getElementById('co-preview').src = FALLBACK_IMG;
            document.getElementById('co-file-status').textContent = error.message;
            toast(error.message, 'error');
          }
        };
        reader.readAsDataURL(f);
      });
      document.getElementById('ck-co-form').addEventListener('submit', async e => {
        e.preventDefault();
        const name = document.getElementById('co-name').value.trim();
        const phone = document.getElementById('co-phone').value.trim();
        const shoe = document.getElementById('co-shoe').value.trim();
        const size = document.getElementById('co-size').value;
        const note = document.getElementById('co-note').value.trim();
        if (!name || !phone || !shoe) return;
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const reqOrder = {
          id: 'REQ' + Math.floor(1000 + Math.random() * 9000),
          type: 'custom_request',
          name,
          phone,
          email: '',
          address: 'Yêu cầu báo giá Order 12–15 ngày qua Zalo',
          items: [{ id: null, name: `[Yêu cầu tìm giày] ${shoe}`, size: String(size), colorway: 'Theo ảnh khách gửi', qty: 1, price: 0, customImage: uploadedCoImg }],
          product: `[Tìm mẫu] ${shoe} (EU ${size})`,
          size: String(size),
          qty: 1,
          subtotal: 0,
          shipping: 0,
          total: 0,
          paid: 0,
          payment: 'Yêu cầu báo giá Order 12–15 ngày',
          method: 'Zalo / Web Form',
          carrier: 'Order 12–15 ngày',
          status: 'wait',
          date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
          createdAt: now.toISOString(),
          etaWindow: orderEtaWindow('12–15 ngày', now),
          note: (uploadedCoImg ? `[Ảnh mẫu: ${uploadedCoImg}] ` : '') + note,
        };
        await appendOrderToServer(reqOrder);
        m.classList.remove('is-open');
        toast(`Đã gửi yêu cầu #${reqOrder.id}! Shop sẽ báo giá qua Zalo ${phone} trong 15 phút.`, 'success');
      });
    }
    const mob = document.getElementById('ck-mobile-menu');
    const mobOv = document.getElementById('ck-menu-overlay');
    if (mob) mob.classList.remove('is-open');
    if (mobOv) mobOv.classList.remove('is-open');
    document.body.style.overflow = '';
    const u = auth.getUser();
    if (u) {
      const nEl = document.getElementById('co-name');
      const pEl = document.getElementById('co-phone');
      if (nEl && !nEl.value && u.name) nEl.value = u.name;
      if (pEl && !pEl.value && u.phone) pEl.value = u.phone;
    }
    m.classList.add('is-open');
  }

  const TOKEN_KEY = 'ck_auth_token';
  let myPrivateOrdersCache = [];
  let pendingAuthCallback = null;

  function requireAuth(onSuccess, msg) {
    const u = auth.getUser();
    const tok = auth.getToken();
    if (u && tok) {
      if (typeof onSuccess === 'function') onSuccess(u);
      return true;
    }
    pendingAuthCallback = typeof onSuccess === 'function' ? onSuccess : null;
    toast(msg || 'Vui lòng đăng nhập tài khoản trước khi đặt hàng!', 'error');
    openAccountModal('login');
    return false;
  }

  const PROVIDER_META = {
    google: {
      name: 'Google',
      badge: 'Google',
      color: '#4285F4',
      svg: '<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"/><path fill="#FBBC05" d="M5.3 14.2c-.2-.7-.4-1.4-.4-2.2s.2-1.5.4-2.2L1.6 7C.6 9 0 11.2 0 12s.6 3 1.6 4.6l3.7-2.4z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.7-2.9c-1 .7-2.2 1.1-3.6 1.1-3.1 0-5.8-2.1-6.7-5L1.6 16.3C3.5 20.4 7.4 23 12 23z"/></svg>',
    },
    facebook: {
      name: 'Facebook',
      badge: 'Facebook',
      color: '#1877F2',
      svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/></svg>',
    },
    member: {
      name: 'Tài khoản CK',
      badge: 'Bảo mật CK',
      color: '#000000',
      svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>',
    },
    password: {
      name: 'Tài khoản CK',
      badge: 'Bảo mật CK',
      color: '#000000',
      svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>',
    },
  };

  function normPhone(p) {
    return String(p || '').replace(/\D/g, '').replace(/^84/, '0');
  }

  const auth = {
    getToken() {
      try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; }
    },
    setSession(token, u) {
      if (!u || !token) {
        try {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(KEYS.user);
        } catch (e) {}
        myPrivateOrdersCache = [];
      } else {
        const clean = Object.assign({}, u);
        delete clean.password;
        delete clean.passwordHash;
        try { localStorage.setItem(TOKEN_KEY, token); } catch (e) {}
        write(KEYS.user, clean);
        try {
          const prevInfo = read('ck_checkout_info', {}) || {};
          write('ck_checkout_info', Object.assign({}, prevInfo, {
            name: clean.name || prevInfo.name || '',
            phone: clean.phone || prevInfo.phone || '',
            email: clean.email || prevInfo.email || '',
            province: clean.province || prevInfo.province || 'Thừa Thiên Huế',
            district: clean.district || prevInfo.district || '',
            ward: clean.ward || prevInfo.ward || '',
            street: clean.street || prevInfo.street || '',
          }));
        } catch (e) {}
      }
      syncAuthHeaderLabels();
      window.dispatchEvent(new CustomEvent('ck:auth-changed', { detail: auth.getUser() }));
      if (u && token && typeof pendingAuthCallback === 'function') {
        const cb = pendingAuthCallback;
        pendingAuthCallback = null;
        const m = document.getElementById('ck-account-modal');
        if (m) m.classList.remove('is-open');
        setTimeout(() => cb(auth.getUser()), 80);
      }
    },
    getUser() {
      const tok = auth.getToken();
      if (!tok) return null;
      return read(KEYS.user, null);
    },
    setCurrentUser(u) {
      if (!u) {
        auth.setSession('', null);
      } else {
        const curTok = auth.getToken();
        if (curTok) auth.setSession(curTok, u);
      }
    },
    async refreshMe() {
      const tok = auth.getToken();
      if (!tok) return null;
      try {
        const [meRes, ordRes] = await Promise.all([
          fetch('/api/me', { headers: { Authorization: 'Bearer ' + tok } }),
          fetch('/api/me/orders', { headers: { Authorization: 'Bearer ' + tok } }),
        ]);
        if (meRes.status === 401) {
          auth.setSession('', null);
          return null;
        }
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData && meData.user) write(KEYS.user, meData.user);
        }
        if (ordRes.ok) {
          const ordData = await ordRes.json();
          if (ordData && Array.isArray(ordData.orders)) {
            myPrivateOrdersCache = ordData.orders;
          }
        }
        syncAuthHeaderLabels();
        return auth.getUser();
      } catch (e) {
        return auth.getUser();
      }
    },
    async upsertAccount(accData) {
      const tok = auth.getToken();
      if (!tok) return null;
      try {
        const res = await fetch('/api/me', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + tok,
          },
          body: JSON.stringify(accData),
        });
        const data = await res.json();
        if (res.ok && data && data.user) {
          auth.setSession(tok, data.user);
          return data.user;
        }
      } catch (e) {}
      return auth.getUser();
    },
    openOAuthPopup(provider) {
      const w = 480;
      const h = 640;
      const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - w) / 2));
      const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - h) / 2));
      const url = `oauth-popup.html?provider=${encodeURIComponent(provider)}`;
      const win = window.open(
        url,
        'ck_oauth_popup',
        `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no`
      );
      if (!win) {
        toast('Trình duyệt đang chặn cửa sổ bật lên (Popup). Vui lòng cho phép Popup!', 'error');
      }
    },
    logout() {
      const prevTok = auth.getToken();
      if (prevTok) {
        fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: 'Bearer ' + prevTok } }).catch(() => {});
      }
      auth.setSession('', null);
      toast('Đã đăng xuất tài khoản bảo mật cá nhân');
    },
    getMyOrders() {
      const u = auth.getUser();
      if (!u) return [];
      if (myPrivateOrdersCache && myPrivateOrdersCache.length) return myPrivateOrdersCache;
      const all = read(KEYS.orders, []);
      if (!Array.isArray(all)) return [];
      const uEmail = String(u.email || '').trim().toLowerCase();
      const uPhone = normPhone(u.phone);
      return all.filter(o => {
        if (!o) return false;
        if (o.userId && u.id && String(o.userId) === String(u.id)) return true;
        if (uEmail && String(o.email || o.userEmail || '').trim().toLowerCase() === uEmail) return true;
        if (uPhone && uPhone.length >= 9 && normPhone(o.phone) === uPhone) return true;
        return false;
      });
    },
  };

  window.addEventListener('message', async e => {
    if (e.origin !== window.location.origin) return;
    const d = e.data;
    if (d && d.type === 'CK_OAUTH_SUCCESS' && d.token && d.user) {
      const savedCb = pendingAuthCallback;
      pendingAuthCallback = null;
      auth.setSession(d.token, d.user);
      await auth.refreshMe();
      toast(`Đăng nhập thành công: ${d.user.name}!`, 'success');
      accActiveTab = 'orders';
      const m = document.getElementById('ck-account-modal');
      if (savedCb) {
        if (m) m.classList.remove('is-open');
        savedCb(auth.getUser());
      } else if (m && m.classList.contains('is-open')) {
        renderAccountModal();
      }
    }
  });

  function syncAuthHeaderLabels() {
    const u = auth.getUser();
    const myOrdersCount = u ? auth.getMyOrders().length : 0;
    const shortName = u ? (String(u.name || '').trim().split(/\s+/).slice(-2).join(' ') || u.email || u.phone) : '';
    const pBadge = u && PROVIDER_META[u.provider] ? PROVIDER_META[u.provider].badge : 'Member';

    document.querySelectorAll('[data-auth-top-label]').forEach(el => {
      el.textContent = u
        ? `${shortName} (${myOrdersCount})`
        : 'Đăng nhập';
    });
    document.querySelectorAll('[data-auth-nav-label]').forEach(el => {
      el.textContent = u ? shortName : 'Đăng nhập';
    });
    document.querySelectorAll('[data-auth-header-label]').forEach(el => {
      el.textContent = u ? `${u.name} · Đơn mua (${myOrdersCount})` : 'Đăng nhập / Tài khoản';
    });
    document.querySelectorAll('[data-auth-mob-label]').forEach(el => {
      el.textContent = u ? `Tài khoản: ${u.name} (${myOrdersCount} đơn)` : 'Đăng nhập / Lịch sử mua hàng';
    });
  }

  let accActiveTab = 'orders';
  let authSubView = 'main';

  function openAccountModal(initialTab) {
    if (initialTab && initialTab !== 'login') accActiveTab = initialTab;
    authSubView = 'main';
    let m = document.getElementById('ck-account-modal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'ck-account-modal';
      m.className = 'ck-modal';
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-modal', 'true');
      m.setAttribute('aria-label', 'Tài khoản cá nhân');
      m.innerHTML = `
        <div class="ck-modal__backdrop" data-acc-close></div>
        <div class="ck-modal__box relative z-10 max-w-3xl w-full p-0 border border-black bg-white max-h-[92vh] overflow-y-auto" id="ck-account-box"></div>`;
      document.body.appendChild(m);
      m.addEventListener('click', e => {
        if (e.target.closest('[data-acc-close]')) m.classList.remove('is-open');
      });
    }
    const mob = document.getElementById('ck-mobile-menu');
    const mobOv = document.getElementById('ck-menu-overlay');
    if (mob) mob.classList.remove('is-open');
    if (mobOv) mobOv.classList.remove('is-open');
    document.body.style.overflow = '';

    renderAccountModal();
    m.classList.add('is-open');
    auth.refreshMe().then(() => {
      if (m.classList.contains('is-open')) renderAccountModal();
    });
  }

  function renderAccountModal() {
    const box = document.getElementById('ck-account-box');
    if (!box) return;
    const u = auth.getUser();
    if (!u) {
      renderSignInView(box);
    } else {
      renderProfileCenterView(box, u);
    }
  }

  function renderSignInView(box) {
    const isReg = authSubView === 'register';
    const isForgot = authSubView === 'forgot';
    box.innerHTML = `
      <div class="grid md:grid-cols-12">
        <div class="md:col-span-5 bg-black text-white p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <img src="public/images/logo-white-crop.png" alt="Cookie's Kicks" class="h-8 w-auto mb-6" />
            <p class="ck-eyebrow text-[#BBF7D0] mb-2">Cookie's Kicks Member</p>
            <h2 class="ck-display text-4xl sm:text-5xl leading-none mb-4">BẢO MẬT TÀI KHOẢN CÁ NHÂN</h2>
            <p class="text-xs text-white/75 leading-relaxed">Đăng nhập tài khoản thành viên để theo dõi tiến độ đơn Order và quản lý tủ giày ký gửi — chỉ một mình bạn mới xem được lịch sử đơn hàng của mình.</p>
          </div>
          <ul class="space-y-2.5 text-xs text-white/85 pt-6 border-t border-white/15 mt-6">
            <li class="flex items-center gap-2"><span class="text-[#BBF7D0]">🔒</span> Bảo mật thông tin tài khoản cá nhân</li>
            <li class="flex items-center gap-2"><span class="text-[#BBF7D0]">🛡️</span> Cách ly dữ liệu: Không ai xem được đơn của bạn</li>
            <li class="flex items-center gap-2"><span class="text-[#BBF7D0]">📦</span> Quên mật khẩu? Khôi phục bằng mã OTP qua Zalo</li>
          </ul>
        </div>

        <div class="md:col-span-7 p-6 sm:p-8 relative">
          <button type="button" class="ck-icon-btn absolute top-3 right-3" data-acc-close aria-label="Đóng">${ICON.close}</button>
          <p class="ck-eyebrow text-muted mb-1">Tài khoản thành viên</p>
          <h3 class="ck-title text-3xl text-black mb-4">${isForgot ? 'KHÔI PHỤC MẬT KHẨU' : (isReg ? 'TẠO TÀI KHOẢN BẢO MẬT MỚI' : 'ĐĂNG NHẬP TÀI KHOẢN')}</h3>

          <div class="mb-5">
            <button type="button" data-oauth-popup="google" class="w-full flex items-center gap-3 h-11 px-4 border border-black bg-white hover:bg-nike font-bold text-xs uppercase tracking-wider transition-colors justify-center">
              ${PROVIDER_META.google.svg}
              <span>Tiếp tục với Google</span>
            </button>
          </div>

          <div class="relative flex items-center justify-center my-5">
            <span class="border-t border-line w-full"></span>
            <span class="bg-white px-3 ck-mono text-[10px] text-muted uppercase tracking-widest flex-shrink-0">Hoặc đăng nhập bằng Mật khẩu</span>
            <span class="border-t border-line w-full"></span>
          </div>

          <div class="grid grid-cols-2 border border-line mb-4 text-xs font-bold uppercase tracking-wider">
            <button type="button" data-switch-auth="main" class="py-2.5 ${!isReg && !isForgot ? 'bg-black text-white' : 'bg-nike text-muted hover:text-black'}">Đăng nhập</button>
            <button type="button" data-switch-auth="register" class="py-2.5 ${isReg ? 'bg-black text-white' : 'bg-nike text-muted hover:text-black'}">Đăng ký mới</button>
          </div>

          ${isForgot ? `
            <form id="ck-forgot-form" class="ck-form-stack">
              <div class="p-3 bg-nike border border-line rounded-md text-xs text-charcoal leading-relaxed">
                Nhập <b>SĐT / Email</b> của bạn, bấm <b>"Gửi mã OTP 6 số"</b> rồi nhắn Zalo <b>0988.561.909</b> để nhận mã xác minh chính chủ (hiệu lực 10 phút).
              </div>
              <div>
                <div class="flex items-center justify-between">
                  <label class="ck-field-label" for="fg-id">Số điện thoại hoặc Email *</label>
                  <button type="button" id="fg-req-otp" class="text-xs font-semibold text-[#002FA7] hover:underline mb-2">Gửi mã OTP 6 số</button>
                </div>
                <input id="fg-id" class="ck-input" required placeholder="0905 123 456 hoặc tenban@gmail.com" />
              </div>
              <div>
                <label class="ck-field-label" for="fg-proof">Mã OTP 6 số *</label>
                <input id="fg-proof" data-mask="otp" class="ck-input ck-mono tabular" required inputmode="numeric" maxlength="6" placeholder="Nhập 6 chữ số (VD: 682910)" />
              </div>
              <div>
                <label class="ck-field-label" for="fg-newpass">Mật khẩu mới (tối thiểu 6 ký tự) *</label>
                <input id="fg-newpass" type="password" class="ck-input" required minlength="6" autocomplete="new-password" placeholder="Nhập mật khẩu mới của bạn" />
              </div>
              <p id="fg-msg" class="text-xs font-semibold text-instock hidden"></p>
              <p id="fg-err" class="ck-error-text hidden"></p>
              <button type="submit" id="fg-submit" class="ck-btn ck-btn--block ck-form-submit">Xác minh OTP &amp; Đặt lại mật khẩu ${ICON.arrow}</button>
              <button type="button" data-switch-auth="main" class="w-full text-center text-xs font-semibold text-muted hover:text-black pt-1">← Quay lại màn hình đăng nhập</button>
            </form>
          ` : (!isReg ? `
            <form id="ck-login-form" class="ck-form-stack">
              <div>
                <label class="ck-field-label" for="lg-id">Email hoặc Số điện thoại *</label>
                <input id="lg-id" class="ck-input" required autocomplete="username" placeholder="tenban@gmail.com hoặc 0905 123 456" />
              </div>
              <div>
                <div class="flex items-center justify-between">
                  <label class="ck-field-label" for="lg-pass">Mật khẩu *</label>
                  <button type="button" data-switch-auth="forgot" class="text-xs font-semibold text-[#002FA7] hover:underline mb-2">Quên mật khẩu?</button>
                </div>
                <input id="lg-pass" type="password" class="ck-input" required autocomplete="current-password" placeholder="Nhập mật khẩu của bạn" />
              </div>
              <p id="lg-err" class="ck-error-text hidden"></p>
              <button type="submit" id="lg-submit" class="ck-btn ck-btn--block ck-form-submit">Đăng nhập vào tài khoản ${ICON.arrow}</button>
            </form>
          ` : `
            <form id="ck-reg-form" class="ck-form-stack">
              <div class="grid sm:grid-cols-2 ck-form-grid">
                <div>
                  <label class="ck-field-label" for="rg-name">Họ và tên *</label>
                  <input id="rg-name" class="ck-input" required placeholder="VD: Nguyễn Văn A" />
                </div>
                <div>
                  <label class="ck-field-label" for="rg-phone">Số điện thoại *</label>
                  <input id="rg-phone" type="tel" data-mask="phone" class="ck-input tabular" required placeholder="09xx xxx xxx" maxlength="16" />
                </div>
              </div>
              <div>
                <label class="ck-field-label" for="rg-email">Địa chỉ Email *</label>
                <input id="rg-email" type="email" class="ck-input" required placeholder="tenban@gmail.com" />
              </div>
              <div class="grid sm:grid-cols-2 ck-form-grid">
                <div>
                  <label class="ck-field-label" for="rg-pass">Mật khẩu (tối thiểu 6 ký tự) *</label>
                  <input id="rg-pass" type="password" class="ck-input" required minlength="6" autocomplete="new-password" placeholder="Tối thiểu 6 ký tự" />
                </div>
                <div>
                  <label class="ck-field-label" for="rg-pass2">Nhập lại mật khẩu *</label>
                  <input id="rg-pass2" type="password" class="ck-input" required minlength="6" autocomplete="new-password" placeholder="Nhập lại mật khẩu" />
                </div>
              </div>
              <p id="rg-err" class="ck-error-text hidden"></p>
              <button type="submit" id="rg-submit" class="ck-btn ck-btn--block ck-form-submit">Tạo tài khoản &amp; Lưu thông tin ${ICON.arrow}</button>
            </form>
          `)}
        </div>
      </div>`;

    box.querySelectorAll('[data-oauth-popup]').forEach(btn => {
      btn.addEventListener('click', () => {
        auth.openOAuthPopup(btn.getAttribute('data-oauth-popup'));
      });
    });
    box.querySelectorAll('[data-switch-auth]').forEach(btn => {
      btn.addEventListener('click', () => {
        authSubView = btn.getAttribute('data-switch-auth');
        renderAccountModal();
      });
    });

    const forgotForm = document.getElementById('ck-forgot-form');
    if (forgotForm) {
      const reqOtpBtn = document.getElementById('fg-req-otp');
      const msgEl = document.getElementById('fg-msg');
      const errEl = document.getElementById('fg-err');
      reqOtpBtn.addEventListener('click', async () => {
        const identifier = document.getElementById('fg-id').value.trim();
        msgEl.classList.add('hidden');
        errEl.classList.add('hidden');
        if (!identifier) {
          errEl.textContent = 'Vui lòng nhập SĐT hoặc Email trước khi yêu cầu mã OTP.';
          errEl.classList.remove('hidden');
          return;
        }
        reqOtpBtn.textContent = 'Đang tạo mã…';
        try {
          const r = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier }),
          });
          const data = await r.json();
          reqOtpBtn.textContent = 'Gửi lại yêu cầu OTP';
          if (!r.ok || !data || !data.ok) {
            errEl.textContent = (data && data.error) || 'Không thể tạo mã khôi phục.';
            errEl.classList.remove('hidden');
            return;
          }
          msgEl.textContent = data.message;
          msgEl.classList.remove('hidden');
        } catch (_) {
          reqOtpBtn.textContent = 'Gửi yêu cầu OTP 6 số';
          errEl.textContent = 'Lỗi kết nối máy chủ.';
          errEl.classList.remove('hidden');
        }
      });

      forgotForm.addEventListener('submit', async e => {
        e.preventDefault();
        const identifier = document.getElementById('fg-id').value.trim();
        const recoveryProof = document.getElementById('fg-proof').value.trim();
        const newPassword = document.getElementById('fg-newpass').value;
        const subBtn = document.getElementById('fg-submit');
        msgEl.classList.add('hidden');
        errEl.classList.add('hidden');
        subBtn.disabled = true;
        subBtn.textContent = 'Đang xác minh & đặt lại mật khẩu…';
        try {
          const r = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, recoveryProof, newPassword }),
          });
          const data = await r.json();
          subBtn.disabled = false;
          if (!r.ok || !data || !data.ok) {
            errEl.textContent = (data && data.error) || 'Xác minh không thành công.';
            errEl.classList.remove('hidden');
            subBtn.innerHTML = `Đặt lại mật khẩu &amp; Đăng nhập ${ICON.arrow}`;
            return;
          }
          auth.setSession(data.token, data.user);
          await auth.refreshMe();
          toast('Đã đặt lại mật khẩu thành công!', 'success');
          accActiveTab = 'orders';
          renderAccountModal();
        } catch (_) {
          subBtn.disabled = false;
          subBtn.innerHTML = `Đặt lại mật khẩu &amp; Đăng nhập ${ICON.arrow}`;
          errEl.textContent = 'Lỗi kết nối máy chủ.';
          errEl.classList.remove('hidden');
        }
      });
    }

    const loginForm = document.getElementById('ck-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async e => {
        e.preventDefault();
        const identifier = document.getElementById('lg-id').value.trim();
        const password = document.getElementById('lg-pass').value;
        const errEl = document.getElementById('lg-err');
        const subBtn = document.getElementById('lg-submit');
        errEl.classList.add('hidden');
        subBtn.disabled = true;
        subBtn.textContent = 'Đang xác thực mật khẩu…';
        try {
          const r = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password }),
          });
          const data = await r.json();
          subBtn.disabled = false;
          if (!r.ok || !data || !data.ok) {
            errEl.textContent = (data && data.error) || 'Mật khẩu không chính xác.';
            errEl.classList.remove('hidden');
            subBtn.innerHTML = `🔒 Đăng nhập bảo mật ${ICON.arrow}`;
            return;
          }
          auth.setSession(data.token, data.user);
          await auth.refreshMe();
          toast(`Chào mừng trở lại, ${data.user.name}!`, 'success');
          accActiveTab = 'orders';
          renderAccountModal();
        } catch (err) {
          subBtn.disabled = false;
          subBtn.innerHTML = `🔒 Đăng nhập bảo mật ${ICON.arrow}`;
          errEl.textContent = 'Lỗi kết nối máy chủ.';
          errEl.classList.remove('hidden');
        }
      });
    }

    const regForm = document.getElementById('ck-reg-form');
    if (regForm) {
      regForm.addEventListener('submit', async e => {
        e.preventDefault();
        const name = document.getElementById('rg-name').value.trim();
        const phone = document.getElementById('rg-phone').value.trim();
        const email = document.getElementById('rg-email').value.trim();
        const password = document.getElementById('rg-pass').value;
        const password2 = document.getElementById('rg-pass2').value;
        const errEl = document.getElementById('rg-err');
        const subBtn = document.getElementById('rg-submit');
        errEl.classList.add('hidden');

        if (password.length < 6) {
          errEl.textContent = 'Mật khẩu bảo mật phải có ít nhất 6 ký tự.';
          errEl.classList.remove('hidden');
          return;
        }
        if (password !== password2) {
          errEl.textContent = 'Mật khẩu nhập lại không khớp.';
          errEl.classList.remove('hidden');
          return;
        }

        subBtn.disabled = true;
        subBtn.textContent = 'Đang mã hóa & tạo tài khoản…';
        try {
          const r = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email, password }),
          });
          const data = await r.json();
          subBtn.disabled = false;
          if (!r.ok || !data || !data.ok) {
            errEl.textContent = (data && data.error) || 'Không thể đăng ký tài khoản.';
            errEl.classList.remove('hidden');
            subBtn.innerHTML = `🔒 Tạo tài khoản bảo mật ${ICON.arrow}`;
            return;
          }
          auth.setSession(data.token, data.user);
          await auth.refreshMe();
          toast(`Đã tạo tài khoản bảo mật cho ${data.user.name}!`, 'success');
          accActiveTab = 'orders';
          renderAccountModal();
        } catch (err) {
          subBtn.disabled = false;
          subBtn.innerHTML = `🔒 Tạo tài khoản bảo mật ${ICON.arrow}`;
          errEl.textContent = 'Lỗi kết nối máy chủ.';
          errEl.classList.remove('hidden');
        }
      });
    }
  }

  function renderProfileCenterView(box, u) {
    const myOrders = auth.getMyOrders();
    const validSpent = myOrders.filter(o => o.status !== 'cancel').reduce((s, o) => s + (Number(o.total) || 0), 0);
    const isVip = validSpent >= 5000000;
    const pm = PROVIDER_META[u.provider] || PROVIDER_META.member;
    const wishIds = wish.get();
    const wishProducts = wishIds.map(id => getProduct(id)).filter(Boolean);

    box.innerHTML = `
      <div class="bg-black text-white p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4 min-w-0">
          <div class="w-14 h-14 bg-white text-black font-black text-2xl flex items-center justify-center flex-shrink-0">
            ${esc((u.name || 'C').charAt(0).toUpperCase())}
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="ck-tag ${isVip ? 'ck-tag--sale' : 'ck-tag--instock'}">${isVip ? '★ VIP MEMBER' : '🔒 PRIVATE ACCOUNT'}</span>
              <span class="ck-mono text-[11px] bg-white/15 px-2 py-0.5 uppercase">${esc(pm.badge)}</span>
            </div>
            <h2 class="ck-title text-3xl text-white truncate">${esc(u.name)}</h2>
            <p class="text-xs text-white/70 truncate">${esc(u.email || '')} ${u.phone ? '· ' + esc(u.phone) : ''}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 ml-auto">
          <div class="text-right hidden sm:block pr-3 border-r border-white/15">
            <p class="text-[10px] uppercase tracking-wider text-white/60">Chi tiêu cá nhân</p>
            <p class="ck-mono text-lg font-bold text-[#BBF7D0]">${formatVND(validSpent)}</p>
          </div>
          <button type="button" id="ck-acc-logout" class="px-3 py-2 border border-white/30 hover:bg-white hover:text-black text-xs font-bold uppercase tracking-wider transition-colors">Đăng xuất</button>
          <button type="button" class="ck-icon-btn !text-white" data-acc-close aria-label="Đóng">${ICON.close}</button>
        </div>
      </div>

      <div class="flex border-b border-line bg-nike px-6 overflow-x-auto no-scrollbar">
        <button type="button" data-acc-tab="orders" class="ck-tab !py-3.5 whitespace-nowrap ${accActiveTab === 'orders' ? 'is-active' : ''}">
          📦 Đơn hàng của riêng tôi (${myOrders.length})
        </button>
        <button type="button" data-acc-tab="wish" class="ck-tab !py-3.5 whitespace-nowrap ${accActiveTab === 'wish' ? 'is-active' : ''}">
          ♥ Giày đã lưu (${wishProducts.length})
        </button>
        <button type="button" data-acc-tab="profile" class="ck-tab !py-3.5 whitespace-nowrap ${accActiveTab === 'profile' ? 'is-active' : ''}">
          📍 Sổ địa chỉ nhận hàng
        </button>
        <button type="button" data-acc-tab="security" class="ck-tab !py-3.5 whitespace-nowrap ${accActiveTab === 'security' ? 'is-active' : ''}">
          🔒 Bảo mật &amp; Mật khẩu
        </button>
      </div>

      <div class="p-6 sm:p-8">
        ${accActiveTab === 'orders' ? `
          <div class="mb-4 px-3.5 py-2.5 bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#14532D] flex items-center justify-between gap-2">
            <span>🔒 <b>Chế độ riêng tư cá nhân:</b> Chỉ tài khoản đã xác thực mật khẩu của <b>${esc(u.email || u.phone || u.name)}</b> mới xem được danh sách đơn hàng này.</span>
          </div>
          ${!myOrders.length ? `
            <div class="py-12 text-center bg-nike border border-line p-6">
              <p class="ck-title text-3xl text-black mb-2">CHƯA CÓ ĐƠN HÀNG TRONG TÀI KHOẢN</p>
              <p class="text-xs text-muted max-w-md mx-auto mb-6">Khi bạn đặt mua hoặc cọc giày Order 12–15 ngày dưới tài khoản này, toàn bộ lịch sử đơn và hành trình vận chuyển về kho Huế sẽ được lưu bảo mật tại đây.</p>
              <a href="catalog.html" class="ck-btn ck-btn--sm">Chọn giày &amp; Đặt Order ngay ${ICON.arrow}</a>
            </div>
          ` : `
            <div class="space-y-5">
              ${myOrders.map(o => {
                const remain = Math.max(0, (Number(o.total) || 0) - (Number(o.paid) || 0));
                const eta = o.etaWindow || orderEtaWindow('12–15 ngày', o.createdAt || o.date);
                const stepIdx = ORDER_STEPS.findIndex(s => s.key === o.status);
                const activeIdx = stepIdx === -1 ? 0 : stepIdx;
                const isCancel = o.status === 'cancel';

                return `
                  <div class="border border-black bg-white p-5 space-y-4">
                    <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-line">
                      <div>
                        <span class="ck-mono text-lg font-bold text-black">#${esc(o.id)}</span>
                        <span class="text-xs text-muted ml-2">· Ngày đặt: ${esc(o.date || '')}</span>
                      </div>
                      <span class="ck-tag ${isCancel ? 'ck-tag--sale' : 'ck-tag--instock'}">
                        ${isCancel ? 'Đã huỷ' : (ORDER_STEPS[activeIdx] ? ORDER_STEPS[activeIdx].label : 'Đang xử lý')}
                      </span>
                    </div>

                    <div class="divide-y divide-line">
                      ${(o.items || []).map(it => {
                        const prod = it.id ? getProduct(it.id) : null;
                        const img = (prod && prod.image) || it.customImage || FALLBACK_IMG;
                        return `
                          <div class="py-3 flex items-center gap-3.5">
                            <a href="${prod ? 'product.html?id=' + encodeURIComponent(prod.id) : 'catalog.html'}" class="w-16 h-16 bg-adidas border border-line flex-shrink-0 overflow-hidden">
                              <img src="${esc(img)}" alt="${esc(it.name)}" class="w-full h-full object-cover" />
                            </a>
                            <div class="flex-1 min-w-0">
                              <p class="font-bold text-sm text-black truncate">${esc(it.name)}</p>
                              <p class="text-xs text-muted mt-0.5">${esc(it.colorway || '')} · ${esc(sizeBadge(prod || it, it.size))} · SL: ${it.qty || 1}</p>
                            </div>
                            <div class="text-right">
                              <p class="ck-mono font-bold text-sm text-black">${formatVND((it.price || 0) * (it.qty || 1))}</p>
                              ${prod ? `<button type="button" data-reorder-id="${esc(prod.id)}" data-reorder-size="${esc(it.size)}" class="ck-link !text-[11px] mt-1">Mua lại</button>` : ''}
                            </div>
                          </div>`;
                      }).join('')}
                    </div>

                    <div class="grid sm:grid-cols-3 gap-2.5 p-3 bg-nike border border-line text-xs">
                      <div>
                        <span class="text-muted block text-[10px] uppercase font-bold">Tổng thanh toán</span>
                        <b class="ck-mono text-black">${formatVND(o.total || 0)}</b>
                      </div>
                      <div>
                        <span class="text-muted block text-[10px] uppercase font-bold">Đã cọc / Đã trả</span>
                        <b class="ck-mono text-instock">${formatVND(o.paid || 0)}</b> <span class="text-muted">(Còn ${formatVND(remain)})</span>
                      </div>
                      <div>
                        <span class="text-muted block text-[10px] uppercase font-bold">Dự kiến về tay (12–15 ngày)</span>
                        <b class="ck-mono text-black">${esc(eta)}</b>
                      </div>
                    </div>

                    ${!isCancel ? `
                      <div class="pt-1">
                        <div class="grid grid-cols-5 gap-1">
                          ${ORDER_STEPS.map((st, idx) => {
                            const done = idx <= activeIdx;
                            return `<div class="h-1.5 ${done ? 'bg-instock' : 'bg-line'}" title="${esc(st.label)}"></div>`;
                          }).join('')}
                        </div>
                        <div class="flex flex-wrap items-center justify-between gap-2 mt-2 text-xs">
                          <span class="text-muted">${esc(ORDER_STEPS[activeIdx] ? ORDER_STEPS[activeIdx].desc : '')}</span>
                          <div class="flex items-center gap-3">
                            <a href="receipt.html?id=${encodeURIComponent(o.id)}${o.receiptKey ? '&key=' + encodeURIComponent(o.receiptKey) : ''}" target="_blank" rel="noopener" class="ck-link !text-xs font-bold text-black">🧾 Phiếu cọc &amp; Bảo hành</a>
                            <button type="button" data-track-order-id="${esc(o.id)}" class="ck-link !text-xs flex-shrink-0">Chi tiết tiến độ →</button>
                          </div>
                        </div>
                      </div>` : `
                      <div class="pt-1 flex justify-end">
                        <a href="receipt.html?id=${encodeURIComponent(o.id)}${o.receiptKey ? '&key=' + encodeURIComponent(o.receiptKey) : ''}" target="_blank" rel="noopener" class="ck-link !text-xs">🧾 Xem phiếu đơn hàng</a>
                      </div>`}
                  </div>`;
              }).join('')}
            </div>
          `}
        ` : accActiveTab === 'wish' ? `
          ${!wishProducts.length ? `
            <div class="py-12 text-center bg-nike border border-line p-6">
              <p class="ck-title text-3xl text-black mb-2">CHƯA CÓ ĐÔI GIÀY YÊU THÍCH</p>
              <p class="text-xs text-muted mb-5">Bấm biểu tượng trái tim ♥ trên bất kỳ mẫu giày nào để lưu vào tài khoản của bạn.</p>
              <a href="catalog.html" class="ck-btn ck-btn--sm">Khám phá 198 mẫu giày ${ICON.arrow}</a>
            </div>
          ` : `
            <div class="grid sm:grid-cols-2 gap-4">
              ${wishProducts.map(p => `
                <a href="product.html?id=${encodeURIComponent(p.id)}" class="flex items-center gap-3.5 p-3 border border-line hover:border-black transition-colors">
                  <div class="w-20 h-20 bg-adidas flex-shrink-0 overflow-hidden">
                    <img src="${esc(p.image || FALLBACK_IMG)}" alt="${esc(p.name)}" class="w-full h-full object-cover" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-bold text-sm text-black truncate">${esc(p.name)}</p>
                    <p class="text-xs text-muted">${esc(p.brand)} · Order ${esc(p.orderDays || '12–15 ngày')}</p>
                    <p class="ck-mono font-bold text-sm text-accent mt-1">${priceText(p)}</p>
                  </div>
                </a>`).join('')}
            </div>
          `}
        ` : accActiveTab === 'profile' ? `
          <form id="ck-profile-form" class="space-y-4">
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="ck-field-label" for="pf-name">Họ và tên người nhận *</label>
                <input id="pf-name" class="ck-input" required value="${esc(u.name || '')}" />
              </div>
              <div>
                <label class="ck-field-label" for="pf-phone">Số điện thoại tài khoản ${u.phone ? '(Đã xác thực)' : '*'}</label>
                <input id="pf-phone" type="tel" class="ck-input ${u.phone ? 'bg-nike text-muted' : ''}" ${u.phone ? 'readonly' : 'required'} value="${esc(u.phone || '')}" placeholder="0905 123 456" />
              </div>
              <div class="sm:col-span-2">
                <label class="ck-field-label" for="pf-email">Email tài khoản ${u.email ? '(Đã liên kết)' : ''}</label>
                <input id="pf-email" type="email" class="ck-input ${u.email ? 'bg-nike text-muted' : ''}" ${u.email ? 'readonly' : ''} value="${esc(u.email || '')}" />
              </div>
              <div>
                <label class="ck-field-label" for="pf-province">Tỉnh / Thành phố mặc định</label>
                <input id="pf-province" class="ck-input" value="${esc(u.province || 'Thừa Thiên Huế')}" placeholder="Thừa Thiên Huế" />
              </div>
              <div>
                <label class="ck-field-label" for="pf-district">Quận / Huyện</label>
                <input id="pf-district" class="ck-input" value="${esc(u.district || '')}" placeholder="Thành phố Huế" />
              </div>
              <div>
                <label class="ck-field-label" for="pf-ward">Phường / Xã</label>
                <input id="pf-ward" class="ck-input" value="${esc(u.ward || '')}" placeholder="Phú Hội" />
              </div>
              <div>
                <label class="ck-field-label" for="pf-street">Số nhà, tên đường cụ thể</label>
                <input id="pf-street" class="ck-input" value="${esc(u.street || '')}" placeholder="VD: 23 Lê Lợi" />
              </div>
            </div>
            <div class="pt-2 flex items-center justify-between gap-3">
              <p class="text-xs text-muted">Chỉ lưu khi bạn muốn tự động điền địa chỉ lúc đặt giày.</p>
              <button type="submit" class="ck-btn ck-btn--sm">Lưu sổ địa chỉ ${ICON.arrow}</button>
            </div>
          </form>
        ` : `
          <div class="space-y-6">
            <div class="p-4 bg-nike border border-line flex items-start gap-3">
              <span class="w-9 h-9 bg-black text-white flex items-center justify-center font-bold flex-shrink-0">🔒</span>
              <div class="text-xs leading-relaxed">
                <p class="font-bold text-sm text-black">Cài đặt đăng nhập tài khoản</p>
                <p class="text-muted mt-0.5">Phương thức đăng nhập: <b>${esc(pm.name)}</b>. Bạn có thể cập nhật mật khẩu tài khoản bên dưới.</p>
              </div>
            </div>
            <form id="ck-pw-form" class="space-y-4 max-w-md">
              <p class="ck-label text-xs text-black">Đổi mật khẩu bảo mật cá nhân</p>
              <div>
                <label class="ck-field-label" for="pw-cur">Mật khẩu hiện tại *</label>
                <input id="pw-cur" type="password" class="ck-input" required autocomplete="current-password" placeholder="••••••••" />
              </div>
              <div>
                <label class="ck-field-label" for="pw-new">Mật khẩu mới (tối thiểu 6 ký tự) *</label>
                <input id="pw-new" type="password" class="ck-input" required minlength="6" autocomplete="new-password" placeholder="••••••••" />
              </div>
              <div>
                <label class="ck-field-label" for="pw-new2">Xác nhận mật khẩu mới *</label>
                <input id="pw-new2" type="password" class="ck-input" required minlength="6" autocomplete="new-password" placeholder="••••••••" />
              </div>
              <p id="pw-err" class="ck-error-text hidden"></p>
              <button type="submit" class="ck-btn ck-btn--sm">Cập nhật mật khẩu mới ${ICON.arrow}</button>
            </form>
          </div>
        `}
      </div>`;

    document.getElementById('ck-acc-logout').addEventListener('click', () => {
      auth.logout();
      renderAccountModal();
    });
    box.querySelectorAll('[data-acc-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        accActiveTab = btn.getAttribute('data-acc-tab');
        renderAccountModal();
      });
    });
    box.querySelectorAll('[data-track-order-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const oid = btn.getAttribute('data-track-order-id');
        document.getElementById('ck-account-modal').classList.remove('is-open');
        openTrackModal(oid);
      });
    });
    box.querySelectorAll('[data-reorder-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = Number(btn.getAttribute('data-reorder-id'));
        const sz = String(btn.getAttribute('data-reorder-size') || '').trim() || '42';
        cart.add({ id: pid, size: sz, qty: 1 });
        document.getElementById('ck-account-modal').classList.remove('is-open');
      });
    });

    const pfForm = document.getElementById('ck-profile-form');
    if (pfForm) {
      pfForm.addEventListener('submit', async e => {
        e.preventDefault();
        await auth.upsertAccount({
          name: document.getElementById('pf-name').value.trim(),
          phone: document.getElementById('pf-phone').value.trim(),
          email: document.getElementById('pf-email').value.trim(),
          province: document.getElementById('pf-province').value.trim(),
          district: document.getElementById('pf-district').value.trim(),
          ward: document.getElementById('pf-ward').value.trim(),
          street: document.getElementById('pf-street').value.trim(),
        });
        toast('Đã lưu thông tin sổ địa chỉ nhận hàng!', 'success');
        renderAccountModal();
      });
    }

    const pwForm = document.getElementById('ck-pw-form');
    if (pwForm) {
      pwForm.addEventListener('submit', async e => {
        e.preventDefault();
        const cur = document.getElementById('pw-cur').value;
        const nw = document.getElementById('pw-new').value;
        const nw2 = document.getElementById('pw-new2').value;
        const errEl = document.getElementById('pw-err');
        errEl.classList.add('hidden');
        if (nw.length < 6) {
          errEl.textContent = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
          errEl.classList.remove('hidden');
          return;
        }
        if (nw !== nw2) {
          errEl.textContent = 'Mật khẩu xác nhận không khớp.';
          errEl.classList.remove('hidden');
          return;
        }
        const tok = auth.getToken();
        const r = await fetch('/api/me/password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + tok,
          },
          body: JSON.stringify({ currentPassword: cur, newPassword: nw }),
        });
        const data = await r.json();
        if (!r.ok || !data || !data.ok) {
          errEl.textContent = (data && data.error) || 'Không thể đổi mật khẩu.';
          errEl.classList.remove('hidden');
          return;
        }
        if (data.token && data.user) {
          auth.setSession(data.token, data.user);
        }
        toast('Đã cập nhật mật khẩu bảo mật thành công!', 'success');
        pwForm.reset();
      });
    }
  }

  let reviewsCache = null;

  async function fetchReviews(opts) {
    opts = opts || {};
    const params = new URLSearchParams();
    if (opts.productId) params.set('productId', String(opts.productId));
    if (opts.group) params.set('group', String(opts.group));
    const qs = params.toString() ? '?' + params.toString() : '';
    try {
      const r = await fetch('/api/reviews' + qs, { cache: 'no-store' });
      if (r.ok) {
        const d = await r.json();
        if (d && Array.isArray(d.reviews)) {
          if (!qs) reviewsCache = d.reviews;
          return d.reviews;
        }
      }
    } catch (e) {}
    return reviewsCache || [];
  }

  async function renderLegitReviews(selector, opts) {
    opts = opts || {};
    const root = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!root) return;
    const list = await fetchReviews(opts);
    const items = opts.limit ? list.slice(0, opts.limit) : list.slice(0, 6);
    const stars = n => '★★★★★'.slice(0, Math.min(5, Math.max(1, Number(n) || 5)));

    root.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <p class="ck-eyebrow mb-1">${esc(opts.eyebrow || 'Hình ảnh trả khách thực tế tại Huế')}</p>
          <h2 class="ck-display text-2xl sm:text-3xl text-black">${esc(opts.title || 'Khách hàng đã nhận giày thực tế')}</h2>
          <p class="text-xs text-muted mt-1.5 max-w-2xl">Hình ảnh chụp giày thật trả khách tại kho Huế &amp; đánh giá từ các đơn đặt trước 12–15 ngày đã giao thành công.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-end">
          <div class="px-3.5 py-2 bg-nike border border-line text-xs font-bold text-black">
            <span class="text-[#F59E0B]">★★★★★</span> 5.0/5 · ${list.length} đơn đã kiểm định Auth
          </div>
          <button type="button" data-open-review-modal="${esc(opts.productId || '')}" class="ck-btn ck-btn--sm">
            ✍ Gửi feedback &amp; Ảnh giày ${ICON.arrow}
          </button>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${items.map(r => `
          <article class="border border-line hover:border-black transition-colors bg-white flex flex-col justify-between p-5">
            <div>
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 bg-black text-white flex items-center justify-center font-heading font-bold text-lg flex-shrink-0">
                    ${esc((r.customerName || 'K').trim().charAt(0).toUpperCase())}
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-sm text-black truncate">${esc(r.customerName)}</p>
                    <p class="text-[11px] text-muted truncate">${esc(r.customerCity || 'TP. Huế')}</p>
                  </div>
                </div>
                ${r.verified ? `
                  <span class="px-2 py-0.5 bg-[#DCFCE7] text-[#14532D] text-[10px] font-extrabold uppercase tracking-wider flex-shrink-0">
                    ✓ Đã mua #${esc(r.orderId || 'AUTH')}
                  </span>
                ` : `
                  <span class="px-2 py-0.5 bg-nike text-muted border border-line text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                    Feedback khách hàng
                  </span>
                `}
              </div>

              <div class="flex items-center gap-2 text-xs mb-2.5">
                <span class="text-[#F59E0B] font-bold tracking-widest">${stars(r.rating)}</span>
                <span class="text-muted">·</span>
                <span class="ck-mono text-[11px] font-bold text-instock">${esc(r.orderDays || '12 ngày về Huế')}</span>
              </div>

              <p class="text-xs text-charcoal leading-relaxed mb-4">“${esc(r.comment)}”</p>
            </div>

            <div class="pt-3 border-t border-line flex items-center gap-3">
              ${r.imageUrl ? `
                <a href="product.html?id=${encodeURIComponent(r.productId || 1)}" class="w-16 h-16 bg-adidas border border-line flex-shrink-0 overflow-hidden group">
                  <img src="${esc(r.imageUrl)}" alt="${esc(r.shoeName)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                </a>
              ` : ''}
              <div class="min-w-0 flex-1">
                <a href="product.html?id=${encodeURIComponent(r.productId || 1)}" class="font-bold text-xs text-black hover:underline block truncate">${esc(r.shoeName)}</a>
                <p class="text-[11px] text-muted mt-0.5">Size EU ${esc(r.sizeEu || '42')} · New Fullbox 100% Auth</p>
                <p class="text-[10px] text-muted mt-0.5">Ngày nhận: ${esc(r.createdAt || '')}</p>
              </div>
            </div>
          </article>
        `).join('')}
      </div>`;

    root.querySelectorAll('[data-open-review-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = Number(btn.getAttribute('data-open-review-modal')) || opts.productId || 1;
        openReviewModal(pid, () => renderLegitReviews(root, opts));
      });
    });
  }

  function openReviewModal(defaultProductId, onDone) {
    let m = document.getElementById('ck-review-modal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'ck-review-modal';
      m.className = 'ck-modal';
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-modal', 'true');
      m.setAttribute('aria-label', 'Gửi đánh giá khách hàng');
      document.body.appendChild(m);
    }
    const u = auth.getUser();
    const prods = getProducts();
    const curP = getProduct(defaultProductId) || prods[0] || { id: 1, name: 'Nike Ja 3 "Pink Foam"', group: 'ja3' };

    m.innerHTML = `
      <div class="ck-modal__backdrop" data-rev-close></div>
      <div class="ck-modal__box relative z-10 max-w-xl p-6 sm:p-8 border border-black bg-white max-h-[90vh] overflow-y-auto">
        <button type="button" class="ck-icon-btn absolute top-3 right-3" data-rev-close aria-label="Đóng">${ICON.close}</button>
        <p class="ck-eyebrow text-instock mb-1.5">Legit Check &amp; Customer Feedback</p>
        <h2 class="ck-title text-3xl text-black mb-2">GỬI FEEDBACK &amp; ẢNH GIÀY ĐÃ NHẬN</h2>
        <p class="text-xs text-muted mb-5">Cảm ơn bạn đã tin tưởng đặt giày tại Cookie's Kicks! Chia sẻ cảm nhận và hình chụp thực tế đôi giày của bạn để giúp các baller/runner khác yên tâm chọn size nhé.</p>
        <form id="ck-rev-form" class="space-y-4">
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="ck-field-label" for="rv-name">Họ và tên *</label>
              <input id="rv-name" class="ck-input" required value="${esc((u && u.name) || '')}" placeholder="Nguyễn Minh Khoa" />
            </div>
            <div>
              <label class="ck-field-label" for="rv-city">Khu vực / Thành phố</label>
              <input id="rv-city" class="ck-input" value="${esc((u && u.province) || 'TP. Huế')}" placeholder="VD: P. Phú Hội, TP. Huế" />
            </div>
          </div>
          <div class="grid sm:grid-cols-[1fr_120px_130px] gap-3">
            <div>
              <label class="ck-field-label" for="rv-prod">Mẫu giày đã mua *</label>
              <select id="rv-prod" class="ck-select">
                ${prods.map(p => `<option value="${esc(p.id)}" data-group="${esc(p.group || '')}" data-name="${esc(p.name)}" ${p.id === curP.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="ck-field-label" for="rv-size">Size EU</label>
              <input id="rv-size" class="ck-input" value="42" placeholder="42" />
            </div>
            <div>
              <label class="ck-field-label" for="rv-order">Mã đơn (nếu nhớ)</label>
              <input id="rv-order" class="ck-input" placeholder="GIAY4821" />
            </div>
          </div>
          <div>
            <label class="ck-field-label">Ảnh chụp thực tế đôi giày của bạn (Không bắt buộc)</label>
            <div class="flex items-center gap-4 mt-1">
              <div class="w-16 h-16 bg-nike border border-line overflow-hidden flex-shrink-0">
                <img id="rv-img-prev" src="${esc(curP.image || FALLBACK_IMG)}" alt="" class="w-full h-full object-cover" />
              </div>
              <div>
                <label class="ck-btn ck-btn--ghost ck-btn--sm cursor-pointer">
                  📷 Tải ảnh giày thật
                  <input id="rv-file" type="file" accept="image/*" class="sr-only" />
                </label>
                <p id="rv-file-msg" class="text-[11px] text-muted mt-1">Mặc định dùng ảnh thật của mẫu giày bạn chọn nếu không tải ảnh riêng.</p>
              </div>
            </div>
          </div>
          <div>
            <label class="ck-field-label" for="rv-comment">Cảm nhận về form giày, độ êm &amp; thời gian Order về Huế *</label>
            <textarea id="rv-comment" class="ck-textarea" rows="3" required placeholder="VD: Giày về đúng 12 ngày, hộp nguyên vẹn, mang đánh bóng bám sân cực tốt..."></textarea>
          </div>
          <button type="submit" class="ck-btn ck-btn--block">Đăng đánh giá thực tế ${ICON.arrow}</button>
        </form>
      </div>`;

    m.classList.add('is-open');
    let uploadedImg = curP.image || '';
    m.onclick = e => {
      if (e.target.closest('[data-rev-close]')) m.classList.remove('is-open');
    };
    const prodSel = document.getElementById('rv-prod');
    prodSel.addEventListener('change', () => {
      const p = getProduct(Number(prodSel.value));
      if (p && !uploadedImg.startsWith('public/uploads/')) {
        uploadedImg = p.image || '';
        document.getElementById('rv-img-prev').src = uploadedImg || FALLBACK_IMG;
      }
    });
    const fileInp = document.getElementById('rv-file');
    fileInp.addEventListener('change', () => {
      const f = fileInp.files && fileInp.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = async () => {
        uploadedImg = '';
        try {
          document.getElementById('rv-img-prev').src = reader.result;
          document.getElementById('rv-file-msg').textContent = 'Đang tải ảnh lên Server...';
          uploadedImg = await uploadImage(reader.result);
          document.getElementById('rv-img-prev').src = uploadedImg;
          document.getElementById('rv-file-msg').textContent = '✓ Đã tải ảnh thật lên thành công!';
        } catch (error) {
          document.getElementById('rv-img-prev').src = FALLBACK_IMG;
          document.getElementById('rv-file-msg').textContent = error.message;
          toast(error.message, 'error');
        }
      };
      reader.readAsDataURL(f);
    });
    document.getElementById('ck-rev-form').addEventListener('submit', async e => {
      e.preventDefault();
      const pid = Number(prodSel.value) || 1;
      const p = getProduct(pid) || curP;
      const payload = {
        productId: pid,
        groupKey: p.group || 'ja3',
        shoeName: p.name,
        customerName: document.getElementById('rv-name').value.trim(),
        customerCity: document.getElementById('rv-city').value.trim(),
        sizeEu: document.getElementById('rv-size').value.trim() || '42',
        orderId: document.getElementById('rv-order').value.trim(),
        comment: document.getElementById('rv-comment').value.trim(),
        imageUrl: uploadedImg || p.image || '',
        rating: 5,
      };
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data && data.ok) {
        reviewsCache = null;
        m.classList.remove('is-open');
        toast('Cảm ơn bạn! Đánh giá thực tế đã được đăng lên trang.', 'success');
        if (typeof onDone === 'function') onDone();
      } else {
        toast((data && data.error) || 'Không thể gửi đánh giá.', 'error');
      }
    });
  }

  function openPolicyModal(initialTab) {
    let m = document.getElementById('ck-policy-modal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'ck-policy-modal';
      m.className = 'ck-modal';
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-modal', 'true');
      m.setAttribute('aria-label', 'Chính sách chọn size, đặt cọc và bảo hành');
      document.body.appendChild(m);
      m.addEventListener('click', e => {
        if (e.target.closest('[data-pol-close]')) m.classList.remove('is-open');
      });
    }
    const mob = document.getElementById('ck-mobile-menu');
    const mobOv = document.getElementById('ck-menu-overlay');
    if (mob) mob.classList.remove('is-open');
    if (mobOv) mobOv.classList.remove('is-open');
    document.body.style.overflow = '';

    const hiSize = initialTab !== 'auth';
    m.innerHTML = `
      <div class="ck-modal__backdrop" data-pol-close></div>
      <div class="ck-modal__box relative z-10 max-w-2xl p-6 sm:p-8 border-2 border-black bg-white max-h-[90vh] overflow-y-auto">
        <button type="button" class="ck-icon-btn absolute top-3 right-3" data-pol-close aria-label="Đóng">${ICON.close}</button>
        <p class="ck-eyebrow text-accent mb-1.5">Official Store Policy · Cookie's Kicks Huế</p>
        <h2 class="ck-title text-3xl sm:text-4xl text-black mb-2">CHÍNH SÁCH CHỌN SIZE, ĐẶT CỌC &amp; BẢO HÀNH ĐỔI 1:1</h2>
        <p class="text-xs text-muted mb-5 leading-relaxed">Áp dụng thống nhất trên toàn bộ đơn giày tại Cookie's Kicks để đảm bảo minh bạch quyền lợi cho khách hàng trước khi đặt cọc Order.</p>

        <div class="space-y-3.5 text-xs leading-relaxed">
          <div class="p-4 border-2 ${hiSize ? 'border-accent bg-[#FFF7ED]' : 'border-black bg-nike'}">
            <p class="font-extrabold text-sm text-black uppercase tracking-wide mb-1.5">1. Bắt buộc chọn đúng Size EU — Không hoàn/đổi nếu chọn sai size</p>
            <p class="text-charcoal">Mỗi đôi giày Order được shop đặt mua trực tiếp từ store chính hãng quốc tế theo <b>đúng Size EU riêng của từng khách</b>. Vì vậy, quý khách vui lòng đo chiều dài chân (cm) hoặc nhắn Zalo <b class="ck-mono">${CONTACT.phone}</b> để được tư vấn kỹ form giày trước khi chốt đơn. <b>Shop KHÔNG nhận hoàn hàng hay đổi size nếu khách tự chọn sai size.</b></p>
          </div>

          <div class="p-4 border border-black bg-white">
            <p class="font-extrabold text-sm text-instock uppercase tracking-wide mb-1.5">2. Giày có lỗi NSX / Lỗi Shop → Đổi mới 1:1 miễn phí (Chờ 10–12 ngày)</p>
            <p class="text-charcoal">Trường hợp đôi giày nhận về có vấn đề lỗi từ nhà sản xuất (bung keo, rách chất liệu, lệch size so với đơn đặt, nhầm phối màu) hoặc lỗi kiểm hàng từ phía shop, <b>Cookie's Kicks chịu trách nhiệm đổi mới 1:1 hoàn toàn miễn phí</b>. Thời gian đặt lại đôi mới về kho Huế từ <b>10 đến 12 ngày</b>.</p>
          </div>

          <div class="p-4 border border-line bg-[#FEF2F2]">
            <p class="font-extrabold text-sm text-[#B91C1C] uppercase tracking-wide mb-1.5">3. Trường hợp ĐÃ QUA SỬ DỤNG → Tuyệt đối KHÔNG đổi</p>
            <p class="text-charcoal">Chính sách đổi lỗi 1:1 <b>chỉ áp dụng khi giày CHƯA QUA SỬ DỤNG</b> (chưa mang ra sân hay đi ngoài đường, đế giày sạch nguyên trạng 100%, còn nguyên tag/tem niêm phong &amp; hộp gốc Fullbox). <b>Nếu giày đã mang/sử dụng dưới mọi hình thức, shop từ chối hỗ trợ đổi trả.</b> Quý khách vui lòng quay video mở hộp (unbox) và báo shop trong vòng 24h kể từ lúc nhận hàng.</p>
          </div>

          <div class="p-4 border ${!hiSize ? 'border-2 border-instock bg-[#F0FDF4]' : 'border-line bg-nike'}">
            <p class="font-extrabold text-sm text-black uppercase tracking-wide mb-1.5">4. Quy định Đặt cọc (Đơn ≥ 2 Triệu cọc 50%) &amp; Cam kết 100% Authentic</p>
            <p class="text-charcoal">Đối với đơn hàng từ <b>2.000.000₫ trở lên (và trên 3.000.000₫)</b>, khách hàng đặt cọc tối thiểu <b>50% giá trị giày</b> (đơn dưới 2.000.000₫ đặt cọc 500.000₫/đôi). Tất cả sản phẩm bán ra tại Cookie's Kicks cam kết <b>100% Chính Hãng (Authentic) New Fullbox trọn đời</b> — phát hiện hàng giả/nhái hoàn tiền gấp đôi (x2). Trường hợp hy hữu store quốc tế hết size đột xuất không về được đơn, shop hoàn lại <b>100% tiền đặt cọc</b> ngay trong ngày.</p>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
          <a href="${CONTACT.zalo}" target="_blank" rel="noopener" class="ck-btn ck-btn--ghost ck-btn--sm">Nhắn Zalo tư vấn Size chuẩn</a>
          <button type="button" data-pol-close class="ck-btn ck-btn--sm">Đã hiểu quy định ${ICON.arrow}</button>
        </div>
      </div>`;
    m.classList.add('is-open');
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderFooter();
    renderDrawerShell();
    bindCardDelegation();
    updateBadges();
    syncAuthHeaderLabels();
    syncFromServer();

    const trkQuery = new URLSearchParams(location.search).get('track');
    if (trkQuery) {
      setTimeout(() => openTrackModal(trkQuery), 150);
    }

    document.addEventListener('click', e => {
      const t = e.target.closest('[data-open-cart]');
      if (t) {
        e.preventDefault();
        openCart();
        return;
      }
      const cartRm = e.target.closest('[data-cart-rm]');
      if (cartRm) {
        e.preventDefault();
        cart.remove(cartRm.getAttribute('data-cart-rm'));
        return;
      }
      const cartQty = e.target.closest('[data-cart-qty]');
      if (cartQty) {
        e.preventDefault();
        cart.setQty(cartQty.getAttribute('data-cart-qty'), Number(cartQty.getAttribute('data-qty')));
        return;
      }
      const polBtn = e.target.closest('[data-open-policy]');
      if (polBtn) {
        e.preventDefault();
        openPolicyModal(polBtn.getAttribute('data-open-policy') || 'size');
        return;
      }
      const accBtn = e.target.closest('[data-open-account]');
      if (accBtn) {
        e.preventDefault();
        openAccountModal(accBtn.getAttribute('data-open-account') || 'orders');
        return;
      }
      const trk = e.target.closest('[data-open-track]');
      if (trk) {
        e.preventDefault();
        openTrackModal(trk.getAttribute('data-open-track') || '');
        return;
      }
      const co = e.target.closest('[data-open-custom-order]');
      if (co) {
        e.preventDefault();
        openCustomOrderModal();
        return;
      }
      const chkLink = e.target.closest('a[href="checkout.html"], [data-go-checkout]');
      if (chkLink) {
        if (!auth.getUser() || !auth.getToken()) {
          e.preventDefault();
          hideMiniCart();
          closeCart();
          requireAuth(() => { location.href = 'checkout.html'; }, 'Vui lòng đăng nhập tài khoản trước khi thanh toán & đặt hàng!');
          return;
        }
      }
    });
    document.addEventListener('submit', e => {
      const nf = e.target.closest('[data-newsletter-form]');
      if (nf) {
        e.preventDefault();
        nf.reset();
        toast('Đã đăng ký! Mã ưu đãi COOKIE10 đã sẵn sàng.', 'success');
      }
    });
    document.addEventListener('input', e => {
      const inp = e.target.closest('[data-mask]');
      if (!inp) return;
      const mode = inp.getAttribute('data-mask');
      if (mode === 'phone') {
        const d = String(inp.value || '').replace(/\D+/g, '').slice(0, 11);
        const fmt = d.length <= 4 ? d : (d.length <= 7 ? d.slice(0, 4) + ' ' + d.slice(4) : d.slice(0, 4) + ' ' + d.slice(4, 7) + ' ' + d.slice(7));
        if (inp.value !== fmt) inp.value = fmt;
      } else if (mode === 'otp') {
        const d = String(inp.value || '').replace(/\D+/g, '').slice(0, 6);
        if (inp.value !== d) inp.value = d;
      }
    });
    window.addEventListener('ck:cart', () => renderDrawer());
    window.addEventListener('storage', e => {
      if (e.key === KEYS.cart || e.key === KEYS.wish || e.key === KEYS.user || e.key === 'ck_auth_token') {
        updateBadges();
        renderDrawer();
        syncAuthHeaderLabels();
        if (e.key === 'ck_auth_token' && auth.getToken()) auth.refreshMe();
      }
    });
    initReveal();
  });

  auth.requireAuth = requireAuth;

  window.CK = {
    KEYS, FREE_SHIP_THRESHOLD, BANK, CONTACT, ICON, FALLBACK_IMG,
    sizing: window.CK_SIZING || null, SIZE_CHARTS: window.CK_SIZE_CHARTS || {}, sizeBadge,
    getProducts, getProduct, priceForSize, saveProducts, resetProductsOnServer,
    syncFromServer, uploadImage, uploadAdminImage, adminFetch, clearAdminCache, orderEtaWindow, saveOrdersToServer, deleteOrdersOnServer, appendOrderToServer,
    renderLegitReviews, openReviewModal, openPolicyModal,
    openTrackModal, openCustomOrderModal, openAccountModal, requireAuth, auth, siblings, read, write,
    cart, wish, quickAdd, addToCart, showMiniCart, hideMiniCart, updateBadges,
    formatVND, discountPct, priceText, catLabel, esc, toast,
    productCard, initCarousel, openCart, closeCart, renderDrawer, askPrice,
    vietQR, createTokenizedPaymentQr, orderCode, initReveal,
    arrow: () => ICON.arrow,
  };
})();
