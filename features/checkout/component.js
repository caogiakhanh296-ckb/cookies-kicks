document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const $ = (s, r) => (r || document).querySelector(s);
    const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
    const fmt = CK.formatVND;
    const esc = CK.esc;
    const ARROW = CK.ICON.arrow;
    const INFO_KEY = 'ck_checkout_info';
    const PROMO_KEY = 'ck_promo';
    const DEPOSIT = 500000;
    const HOLD_MS = 15 * 60 * 1000;
    const HUE = 'Thừa Thiên Huế';
    const PHONE_RE = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const CHECK_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>';
    const CLOCK_SVG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
    const INFO_SVG = '<svg class="flex-shrink-0 text-brand" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>';

    const PROMOS = {
      HOMIEWITHCOOKIE: { code: 'HOMIEWITHCOOKIE', type: 'freeship', value: 50000, maxDiscount: 50000, minOrder: 0, desc: 'Miễn phí vận chuyển toàn quốc 50.000₫ (Mã độc quyền Chủ Shop)' },
      COOKIE10: { code: 'COOKIE10', type: 'percent', value: 10, maxDiscount: 300000, minOrder: 0, desc: 'Giảm 10% đơn đầu (tối đa 300K)' },
      BALLER100K: { code: 'BALLER100K', type: 'fixed', value: 100000, maxDiscount: 0, minOrder: 2000000, desc: 'Giảm 100.000₫ cho đơn từ 2 triệu' },
      HUE150K: { code: 'HUE150K', type: 'fixed', value: 150000, maxDiscount: 0, minOrder: 3000000, desc: 'Ưu đãi 150.000₫ cho đơn từ 3 triệu' },
    };

    const CARRIERS = [
      { id: 'standard', label: 'Order 12–15 Ngày + Giao Hàng Toàn Quốc (GHN)', eta: '12–15 ngày', fee: 50000, desc: 'Đặt hàng chính hãng về kho sau 12–15 ngày, kiểm định Auth rồi giao GHN tận tay 63 tỉnh thành.' },
      { id: 'fast', label: 'Order Ưu Tiên + Chuyển Phát Nhanh Toàn Quốc', eta: '10–13 ngày', fee: 50000, desc: 'Ưu tiên xử lý lô hàng nhanh nhất và chuyển phát nhanh toàn quốc (đồng giá 50.000₫).' },
    ];

    const PAYS = {
      deposit: { label: 'Đặt cọc Order (từ 500K / 50%)', title: 'Đặt cọc Order 12–15 ngày', desc: 'Đơn từ 2.000.000₫ (và trên 3.000.000₫) đặt cọc tối thiểu 50% giá trị giày; đơn dưới 2.000.000₫ cọc 500.000₫/đôi. Phần còn lại thanh toán khi nhận giày.', badge: 'Khuyên dùng' },
      transfer: { label: 'Chuyển khoản 100%', title: 'Chuyển khoản 100%', desc: 'Quét MoMo hoặc VietQR MB Bank thanh toán đủ 100%. Ưu tiên đặt hàng & giữ lô sớm nhất.', badge: 'Ưu tiên Order' },
      cod: { label: 'Giữ đơn · Xác nhận Zalo', title: 'Giữ đơn · Xác nhận cọc qua Zalo', desc: 'Tạo mã đơn giữ size trước, shop liên hệ Zalo 098 856 19 09 xác nhận cọc trong 15 phút.' },
    };

    const wardSuggestions = {
      'Thừa Thiên Huế': {
        'Thành phố Huế': ['Phú Hội', 'Vĩnh Ninh', 'Phú Thuận', 'Phú Bình', 'Tây Lộc', 'Thuận Lộc', 'Phú Hiệp', 'Phú Hậu', 'Thuận Hòa', 'An Tây', 'An Đông', 'Phước Vĩnh', 'Xuân Phú', 'Kim Long', 'Vĩ Dạ', 'Phường Đúc', 'Thủy Biều', 'Hương Sơ', 'Thủy Xuân', 'An Cựu', 'Hương Long', 'Trường An'],
        'Huyện Phú Vang': ['Phú Thượng', 'Vinh An', 'Phú Mỹ', 'Phú An', 'Phú Dương', 'Phú Mậu', 'Phú Lương', 'Phú Đa', 'Phú Hải', 'Vinh Xuân', 'Phú Diên', 'Vinh Thanh', 'Phú Thuận', 'Phú Hồ'],
        'Thị xã Hương Trà': ['Hương Toàn', 'Hương Vân', 'Hương Văn', 'Hương Xuân', 'Hương Chữ', 'Hương An', 'Tứ Phú', 'Hương Vinh', 'Hương Thọ', 'Bình Điền', 'Bình Thành', 'Hồng Tiến'],
      },
      'Hà Nội': {
        'Quận Hoàn Kiếm': ['Phường Hàng Bài', 'Phường Hàng Gai', 'Phường Hàng Trống', 'Phường Lý Thái Tổ', 'Phường Tràng Tiền', 'Phường Hàng Buồm'],
        'Quận Ba Đình': ['Phường Phúc Xá', 'Phường Trúc Bạch', 'Phường Vĩnh Phúc', 'Phường Cống Vị', 'Phường Điện Biên', 'Phường Ba Đình', 'Phường Nguyễn Trung Trực'],
        'Quận Đống Đa': ['Phường Văn Miếu', 'Phường Quốc Tử Giám', 'Phường Láng Thượng', 'Phường Láng Hạ', 'Phường Phương Liên', 'Phường Ô Chợ Dừa', 'Phường Nam Đồng'],
        'Quận Cầu Giấy': ['Phường Nghĩa Đô', 'Phường Nghĩa Tân', 'Phường Mai Dịch', 'Phường Dịch Vọng', 'Phường Quan Hoa', 'Phường Yên Hòa', 'Phường Trung Hòa'],
      },
      'TP. Hồ Chí Minh': {
        'Quận 1': ['Phường Tân Định', 'Phường Đa Kao', 'Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cô Giang', 'Phường Nguyễn Cư Trinh', 'Phường Phạm Ngũ Lão'],
        'Quận 3': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'],
        'Quận Bình Thạnh': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 17', 'Phường 19', 'Phường 21', 'Phường 22', 'Phường 24', 'Phường 25', 'Phường 26', 'Phường 27', 'Phường 28'],
        'Quận Gò Vấp': ['Phường 1', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 17'],
      },
      'Đà Nẵng': {
        'Quận Hải Châu': ['Phường Thanh Bình', 'Phường Thuận Phước', 'Phường Thạch Thang', 'Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Phước Ninh', 'Phường Hòa Thuận Tây', 'Phường Hòa Thuận Đông', 'Phường Nam Dương'],
        'Quận Thanh Khê': ['Phường Tam Thuận', 'Phường Thanh Khê Tây', 'Phường Thanh Khê Đông', 'Phường Xuân Hà', 'Phường Tân Chính', 'Phường Chính Gián'],
        'Quận Sơn Trà': ['Phường Thọ Quang', 'Phường Mân Thái', 'Phường Nại Hiên Đông', 'Phường Phước Mỹ', 'Phường An Hải Bắc', 'Phường An Hải Đông', 'Phường An Hải Tây'],
      },
      'Cần Thơ': {
        'Quận Ninh Kiều': ['Phường Cái Khế', 'Phường An Hòa', 'Phường Thới Bình', 'Phường An Nghiệp', 'Phường An Cư', 'Phường An Hội', 'Phường Tân An', 'Phường An Lạc', 'Phường An Phú', 'Phường Xuân Khánh', 'Phường Hưng Lợi', 'Phường An Khánh', 'Phường An Bình'],
        'Quận Bình Thủy': ['Phường Bình Thủy', 'Phường Trà An', 'Phường Trà Nóc', 'Phường Thới An Đông', 'Phường An Thới', 'Phường Bùi Hữu Nghĩa', 'Phường Long Hòa', 'Phường Long Tuyền'],
      },
    };
    const addressData = (window.CK_VIETNAM_ADDRESSES && typeof window.CK_VIETNAM_ADDRESSES === 'object')
      ? window.CK_VIETNAM_ADDRESSES
      : Object.fromEntries(Object.entries(wardSuggestions).map(([k, v]) => [k, Object.keys(v)]));

    const saved = CK.read(INFO_KEY, {}) || {};
    const S = {
      step: 1,
      carrier: CARRIERS.some(c => c.id === saved.carrier) ? saved.carrier : 'standard',
      pay: PAYS[saved.pay] ? saved.pay : 'deposit',
      promo: null,
      promoObj: null,
      agree: false,
      code: null,
      deadline: 0,
      timer: null,
      expired: false,
      tab: 'momo',
      busy: false,
      done: false,
      sumOpen: false,
    };
    try {
      const rawP = sessionStorage.getItem(PROMO_KEY);
      if (rawP) {
        if (rawP.startsWith('{')) {
          const parsedP = JSON.parse(rawP);
          if (parsedP && parsedP.code) { S.promo = parsedP.code; S.promoObj = parsedP; }
        } else if (PROMOS[rawP]) {
          S.promo = rawP;
          S.promoObj = PROMOS[rawP];
        }
      }
    } catch (e) {  }

    function isFreeShipVoucher(v) {
      if (!v) return false;
      const t = String(v.type || '').toLowerCase();
      const c = String(v.code || '').toUpperCase();
      return t === 'freeship' || t === 'shipping' || c === 'HOMIEWITHCOOKIE';
    }

    function calcPromoDiscount(subtotal, v) {
      if (!v || isFreeShipVoucher(v)) return 0;
      if (subtotal < (Number(v.minOrder) || 0)) return 0;
      if (v.type === 'fixed') return Math.min(subtotal, Math.round(Number(v.value) || 0));
      let d = Math.round(subtotal * ((Number(v.value || v.pct) || 0) / 100));
      if (Number(v.maxDiscount) > 0) d = Math.min(d, Math.round(Number(v.maxDiscount)));
      return Math.min(subtotal, Math.max(0, d));
    }

    const F = {
      name: $('#f-name'), phone: $('#f-phone'), email: $('#f-email'),
      province: $('#f-province'), district: $('#f-district'), ward: $('#f-ward'),
      street: $('#f-street'), note: $('#f-note'),
    };

    function getCarrier() { return CARRIERS.find(c => c.id === S.carrier) || CARRIERS[0]; }

    function liveUnitPrice(item) {
      const p = CK.getProduct(item.id);
      if (p && CK.priceForSize) {
        const live = Number(CK.priceForSize(p, item.size)) || 0;
        if (live > 0) return live;
      }
      return Number(item.price) || 0;
    }

    function calc() {
      const rawItems = CK.cart.get();
      const items = rawItems.map(i => {
        const price = liveUnitPrice(i);
        const deposit = price >= 2000000 ? Math.round(price * 0.5) : 500000;
        return Object.assign({}, i, { price, deposit });
      });
      const qty = items.reduce((s, i) => s + (i.qty || 1), 0);
      const subtotal = items.reduce((s, i) => s + i.price * (i.qty || 1), 0);
      const activeVoucher = S.promoObj || (S.promo && PROMOS[S.promo]) || null;
      const discount = calcPromoDiscount(subtotal, activeVoucher);
      const after = Math.max(0, subtotal - discount);
      const carrier = getCarrier();
      const free = isFreeShipVoucher(activeVoucher);
      const shipping = items.length && !free ? 50000 : 0;
      const total = after + shipping;
      const itemDepSum = items.reduce((s, i) => {
        const p = Number(i.price) || 0;
        const q = i.qty || 1;
        return s + (p >= 2000000 ? Math.round(p * q * 0.5) : (Number(i.deposit) || 500000) * q);
      }, 0);
      const depositTotal = after >= 2000000 ? Math.max(itemDepSum, Math.round(after * 0.5)) : itemDepSum;
      const payNow = S.pay === 'transfer' ? total : S.pay === 'deposit' ? Math.min(depositTotal, total) : 0;
      const etaWindow = CK.orderEtaWindow('12–15 ngày');
      return { items, qty, subtotal, discount, after, carrier, free, shipping, total, depositTotal, payNow, remain: total - payNow, toFree: 0, etaWindow };
    }

    function stockOf(id, size) {
      const p = CK.getProduct(id);
      if (!p || p.status !== 'active' || p.priceOnRequest) return 0;
      const sz = String(size || '').trim();
      if (sz && Array.isArray(p.outOfStockSizes) && p.outOfStockSizes.map(x => String(x).trim()).includes(sz)) return 0;
      if (sz && Array.isArray(p.variants) && p.variants.length) {
        const v = p.variants.find(vx => String(vx.size).trim() === sz);
        if (v) return Math.max(0, Math.min(Number(p.stock) || 0, Number(v.stock) || 0));
      }
      return Math.max(0, Number(p.stock) || 0);
    }
    function qtyById(id) { return CK.cart.get().filter(x => x.id === id).reduce((s, x) => s + (x.qty || 1), 0); }
    function qtyByIdSize(id, size) {
      const sz = String(size || '').trim();
      return CK.cart.get().filter(x => x.id === id && String(x.size || '').trim() === sz).reduce((s, x) => s + (x.qty || 1), 0);
    }
    function stockWarn(i) {
      const stTotal = stockOf(i.id);
      const stSize = stockOf(i.id, i.size);
      if (stTotal <= 0 || stSize <= 0) return 'Size hoặc sản phẩm này đã hết hàng — vui lòng xoá khỏi đơn';
      if (qtyByIdSize(i.id, i.size) > stSize) return `Size ${i.size} chỉ còn ${stSize} đôi — vui lòng giảm số lượng`;
      if (qtyById(i.id) > stTotal) return `Chỉ còn ${stTotal} đôi trong kho — vui lòng giảm số lượng`;
      return '';
    }
    function stockProblem() {
      const items = CK.cart.get();
      for (let k = 0; k < items.length; k++) {
        const w = stockWarn(items[k]);
        if (w) return `${items[k].name}: ${w}`;
      }
      return '';
    }

    function getInfo() {
      return {
        name: F.name.value.trim().replace(/\s+/g, ' '),
        phone: F.phone.value.replace(/\s+/g, ''),
        email: F.email.value.trim(),
        province: F.province.value,
        district: F.district.value,
        ward: F.ward.value,
        street: F.street.value.trim(),
        note: F.note.value.trim(),
      };
    }
    function fullAddress(i) { return [i.street, i.ward, i.district, i.province].filter(Boolean).join(', '); }

    function saveInfo() {
      const i = getInfo();
      try {
        CK.write(INFO_KEY, {
          name: i.name, phone: F.phone.value.trim(), email: i.email,
          province: i.province, district: i.district, ward: i.ward, street: i.street,
          carrier: S.carrier, pay: S.pay,
        });
      } catch (e) {  }
    }
    let saveT;
    function saveInfoSoon() { clearTimeout(saveT); saveT = setTimeout(saveInfo, 400); }

    function uniqueCode() {
      const list = CK.read(CK.KEYS.orders, []);
      const used = new Set((Array.isArray(list) ? list : []).map(o => o && o.id));
      let code = CK.orderCode();
      let n = 0;
      while (used.has(code) && n < 50) { code = CK.orderCode(); n++; }
      return code;
    }

    function shake(el) {
      if (!el) return;
      el.classList.remove('ck-shake');
      void el.offsetWidth;
      el.classList.add('ck-shake');
      setTimeout(() => el.classList.remove('ck-shake'), 450);
    }

    function copyText(text, btn) {
      const done = () => {
        CK.toast('Đã sao chép: ' + text, 'success');
        if (btn) {
          if (!btn.dataset.label) btn.dataset.label = btn.textContent;
          btn.textContent = 'ĐÃ CHÉP';
          btn.classList.add('is-copied');
          clearTimeout(btn._ckT);
          btn._ckT = setTimeout(() => { btn.textContent = btn.dataset.label; btn.classList.remove('is-copied'); }, 1800);
        }
      };
      const fallback = () => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, text.length);
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        if (ok) done(); else CK.toast('Không thể sao chép — vui lòng chép thủ công', 'error');
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    }
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-copy]');
      if (!b) return;
      e.preventDefault();
      copyText(b.getAttribute('data-copy'), b);
    });

    function foldVi(s) {
      return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
    }

    function formatPhoneMask(val) {
      const digits = String(val || '').replace(/\D+/g, '').slice(0, 11);
      if (digits.length <= 4) return digits;
      if (digits.length <= 7) return digits.slice(0, 4) + ' ' + digits.slice(4);
      return digits.slice(0, 4) + ' ' + digits.slice(4, 7) + ' ' + digits.slice(7);
    }

    function fillSelect(sel, list, placeholder, value) {
      sel.innerHTML = `<option value="">${placeholder}</option>` + list.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
      sel.disabled = !list.length;
      if (value && list.indexOf(value) !== -1) sel.value = value;
      if (sel._syncCombo) sel._syncCombo();
    }

    function setupSearchableSelect(sel) {
      if (!sel || sel._comboReady) return;
      sel._comboReady = true;
      const wrap = document.createElement('div');
      wrap.className = 'ck-combo';
      sel.parentNode.insertBefore(wrap, sel);
      wrap.appendChild(sel);
      sel.classList.add('sr-only');
      sel.tabIndex = -1;

      const inp = document.createElement('input');
      inp.type = 'text';
      inp.className = 'ck-input ck-combo__input';
      inp.placeholder = sel.getAttribute('data-searchable') || 'Gõ tìm hoặc cuộn chọn…';
      inp.autocomplete = 'off';
      wrap.appendChild(inp);

      const listEl = document.createElement('div');
      listEl.className = 'ck-combo__list hidden';
      listEl.setAttribute('role', 'listbox');
      wrap.appendChild(listEl);

      function getOpts() {
        return Array.from(sel.options).filter(o => o.value).map(o => o.value);
      }

      function renderList(q) {
        const key = foldVi(q);
        const all = getOpts();
        const filtered = key ? all.filter(v => foldVi(v).includes(key)) : all;
        if (!filtered.length) {
          listEl.innerHTML = `<div class="ck-combo__empty">Không tìm thấy "${esc(q)}"</div>`;
          return;
        }
        listEl.innerHTML = filtered.map(v => {
          const act = v === sel.value ? 'is-active' : '';
          return `<button type="button" class="ck-combo__item ${act}" data-combo-val="${esc(v)}"><span>${esc(v)}</span>${v === sel.value ? '<span class="text-instock font-bold">✓</span>' : ''}</button>`;
        }).join('');
      }

      sel._syncCombo = () => {
        inp.value = sel.value || '';
        inp.disabled = sel.disabled;
      };
      sel._syncCombo();

      inp.addEventListener('focus', () => {
        if (sel.disabled) return;
        inp.select();
        renderList('');
        listEl.classList.remove('hidden');
      });
      inp.addEventListener('input', () => {
        if (sel.disabled) return;
        renderList(inp.value);
        listEl.classList.remove('hidden');
      });
      listEl.addEventListener('mousedown', e => {
        const item = e.target.closest('[data-combo-val]');
        if (!item) return;
        e.preventDefault();
        const chosen = item.getAttribute('data-combo-val');
        sel.value = chosen;
        inp.value = chosen;
        listEl.classList.add('hidden');
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      });
      inp.addEventListener('blur', () => {
        setTimeout(() => {
          listEl.classList.add('hidden');
          const typed = foldVi(inp.value);
          const exact = getOpts().find(v => foldVi(v) === typed);
          if (exact && exact !== sel.value) {
            sel.value = exact;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          }
          inp.value = sel.value || '';
        }, 150);
      });
    }
    function onDistrict(keepWard) {
      const p = F.province.value, d = F.district.value;
      const wards = wardSuggestions[p] && wardSuggestions[p][d] ? Array.from(new Set(wardSuggestions[p][d])) : [];
      const dl = document.getElementById('f-ward-list');
      if (dl) {
        dl.innerHTML = wards.map(v => `<option value="${esc(v)}"></option>`).join('');
      }
      if (keepWard !== undefined) {
        F.ward.value = keepWard || '';
      } else if (!wards.length) {

        F.ward.value = '';
      } else {
        F.ward.value = '';
      }
    }
    function onProvince(keepDistrict, keepWard) {
      const p = F.province.value;
      const raw = addressData[p];
      const districts = Array.isArray(raw) ? raw : (raw ? Object.keys(raw) : []);
      fillSelect(F.district, districts, '— Chọn Quận/Huyện —', keepDistrict);
      onDistrict(keepWard);
    }

    const RULES = {
      name: v => v.trim().length >= 2 ? '' : 'Vui lòng nhập họ tên người nhận.',
      phone: v => {
        const s = v.replace(/\s+/g, '');
        if (!s) return 'Vui lòng nhập số điện thoại.';
        return PHONE_RE.test(s) ? '' : 'Số điện thoại không hợp lệ (VD: 098 856 19 09).';
      },
      email: v => !v.trim() || EMAIL_RE.test(v.trim()) ? '' : 'Email không hợp lệ (VD: ban@email.com).',
      province: v => v ? '' : 'Vui lòng chọn Tỉnh/Thành phố.',
      district: v => v ? '' : 'Vui lòng chọn Quận/Huyện.',
      ward: v => v.trim().length >= 2 ? '' : 'Vui lòng nhập hoặc chọn Phường/Xã.',
      street: v => v.trim().length >= 3 ? '' : 'Vui lòng nhập số nhà, tên đường.',
    };
    function setErr(k, msg) {
      F[k].classList.toggle('is-error', !!msg);
      F[k].setAttribute('aria-invalid', msg ? 'true' : 'false');
      const e = document.getElementById('err-' + k);
      if (e) { e.textContent = msg; e.classList.toggle('hidden', !msg); }
    }
    function validateField(k, show) {
      const msg = RULES[k](F[k].value || '');
      if (show !== false) setErr(k, msg);
      return !msg;
    }
    function validateAll(show) {
      let first = null;
      Object.keys(RULES).forEach(k => { if (!validateField(k, show) && !first) first = k; });
      return first;
    }
    function focusField(k) {
      const el = F[k];
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
      shake(el);
    }

    function renderFreeShip(c) {
      $('#freeShip').innerHTML = c.free
        ? `<div class="flex items-center gap-3 text-brand">${CK.ICON.truck}<p class="text-sm font-bold uppercase tracking-wider">Đã áp dụng mã Freeship Chủ Shop — Miễn phí vận chuyển toàn quốc (Tiết kiệm 50.000₫)</p></div>`
        : `<div class="flex items-center gap-3">${CK.ICON.truck}<p class="text-sm font-semibold">Giao hàng toàn quốc 63 tỉnh thành · Phí vận chuyển đồng giá <b class="text-brand">50.000₫</b> <span class="text-muted font-medium">(Nhập mã Freeship từ chủ shop nếu có)</span></p></div>`;
    }

    function renderCarriers() {
      const isHue = F.province.value === HUE;
      if (S.carrier === 'express' && !isHue) S.carrier = 'standard';
      const c = calc();
      $('#carrierList').innerHTML = CARRIERS.map(k => {
        const disabled = !!k.hueOnly && !isHue;
        const sel = S.carrier === k.id;
        const price = c.free
          ? `<span class="block font-bold text-brand uppercase text-sm tracking-wider">Miễn phí</span><s class="block text-xs text-muted tabular">${fmt(k.fee)}</s>`
          : `<span class="block font-bold tabular">${fmt(k.fee)}</span>`;
        return `<label class="ck-opt ${sel ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}">
            <input type="radio" name="carrier" value="${k.id}" class="sr-only" ${sel ? 'checked' : ''} ${disabled ? 'disabled' : ''} />
            <span class="ck-opt__mark" aria-hidden="true"></span>
            <span class="flex-1 min-w-0">
              <span class="block font-bold uppercase tracking-wide text-[15px] leading-snug">${k.label} <span class="font-semibold normal-case tracking-normal text-muted">(${k.eta})</span></span>
              <span class="block text-sm text-muted mt-1">${disabled ? 'Chỉ áp dụng khi giao tại Thừa Thiên Huế.' : k.desc}</span>
            </span>
            <span class="text-right flex-shrink-0">${price}</span>
          </label>`;
      }).join('');
      renderFreeShip(c);
    }

    function renderPays() {
      const c = calc();
      $('#payList').innerHTML = Object.keys(PAYS).map(k => {
        const p = PAYS[k], sel = S.pay === k;
        const descText = k === 'deposit'
          ? (c.subtotal >= 2000000
              ? `Đơn từ 2.000.000₫ trở lên (kể cả trên 3.000.000₫) đặt cọc tối thiểu 50% giá trị giày (${fmt(c.depositTotal)}). Phần còn lại thanh toán khi nhận giày.`
              : `Cọc 500.000₫/đôi (${fmt(c.depositTotal)}) qua VietQR MB Bank hoặc MoMo để chốt size Order. Phần còn lại thanh toán khi nhận giày.`)
          : p.desc;
        return `<label class="ck-opt ck-opt--card ${sel ? 'is-selected' : ''}">
            <input type="radio" name="pay" value="${k}" class="sr-only" ${sel ? 'checked' : ''} />
            <span class="flex items-center justify-between w-full gap-2 min-h-[22px]"><span class="ck-opt__mark" aria-hidden="true"></span>${p.badge ? `<span class="ck-tag ck-tag--blue">${p.badge}</span>` : ''}</span>
            <span class="block font-bold uppercase tracking-wide text-[15px] leading-snug">${p.title}</span>
            <span class="block text-sm text-muted leading-snug">${descText}</span>
          </label>`;
      }).join('');
      $('#payNote').innerHTML = `<div class="flex flex-wrap gap-x-6 gap-y-1"><span>Thanh toán ngay: <b class="tabular">${fmt(c.payNow)}</b></span><span>Thu khi nhận hàng: <b class="tabular">${fmt(c.remain)}</b></span></div>`;
    }

    function itemRow(i, editable) {
      const key = esc(i.key);
      const warn = stockWarn(i);
      const img = esc(i.image || CK.FALLBACK_IMG);
      return `<div class="flex gap-4 py-4 border-b border-line last:border-b-0">
          <a href="product.html?id=${i.id}" class="relative w-20 h-20 sm:w-24 sm:h-24 bg-tile flex-shrink-0 overflow-hidden" aria-label="${esc(i.name)}">
            <img src="${img}" alt="${esc(i.name)}" class="w-full h-full object-cover" loading="lazy" />
            ${editable ? '' : `<span class="absolute top-0 right-0 bg-ink text-white text-[11px] font-bold min-w-[22px] h-[22px] px-1 flex items-center justify-center tabular">${i.qty}</span>`}
          </a>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between gap-3">
              <p class="font-semibold leading-tight">${esc(i.name)}</p>
              <p class="font-bold tabular whitespace-nowrap">${fmt(i.price * i.qty)}</p>
            </div>
            <p class="text-sm text-muted mt-1">${esc(i.colorway)} · <b class="text-ink">${esc(CK.sizeBadge ? CK.sizeBadge(i, i.size) : ('EU ' + i.size))}</b></p>
            ${editable ? `<div class="flex items-center justify-between gap-3 mt-3">
                <div class="flex items-center border border-line">
                  <button type="button" class="ck-qty-btn" data-act="dec" data-key="${key}" aria-label="Giảm số lượng">−</button>
                  <span class="w-8 text-center text-sm font-bold tabular" aria-live="polite">${i.qty}</span>
                  <button type="button" class="ck-qty-btn" data-act="inc" data-key="${key}" aria-label="Tăng số lượng">+</button>
                </div>
                <button type="button" class="text-muted hover:text-sale inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider" data-act="rm" data-key="${key}" aria-label="Xoá ${esc(i.name)}">${CK.ICON.trash}<span>Xoá</span></button>
              </div>`
            : `<p class="text-sm text-muted mt-1 tabular">SL: ${i.qty} × ${fmt(i.price)}</p>`}
            ${warn ? `<p class="ck-error-text">${warn}</p>` : ''}
          </div>
        </div>`;
    }

    function row(label, value, cls) {
      return `<div class="flex justify-between gap-4 text-[15px] ${cls || ''}"><span class="text-muted">${label}</span><span class="font-semibold tabular text-right">${value}</span></div>`;
    }

    function totalsHTML(c, big) {
      return `
        ${row('Tạm tính', fmt(c.subtotal))}
        ${c.discount ? row(`Giảm giá <span class="ck-mono text-xs">(${esc(S.promo)})</span>`, `<span class="text-brand">−${fmt(c.discount)}</span>`) : ''}
        ${row(`Vận chuyển · ${c.carrier.label}`, c.free ? '<span class="text-brand font-bold uppercase text-sm tracking-wider">Miễn phí</span>' : fmt(c.shipping))}
        ${row('Dự kiến về tay (Order 12–15 ngày)', `<span class="ck-mono text-xs font-bold text-black">${esc(c.etaWindow)}</span>`)}
        <div class="flex justify-between items-end gap-4 pt-4 mt-1 border-t border-ink">
          <span class="ck-label">Tổng cộng</span>
          <span class="ck-title ${big ? 'text-4xl sm:text-5xl' : 'text-4xl'} tabular">${fmt(c.total)}</span>
        </div>
        ${S.pay !== 'transfer' ? `<div class="bg-sky px-4 py-3 space-y-1.5 mt-2">${row(c.subtotal >= 2000000 ? 'Cọc Order ngay (50% giá trị giày)' : 'Cọc Order ngay', `<span class="text-ink font-bold">${fmt(c.payNow)}</span>`)}${row('Thanh toán khi nhận giày', fmt(c.remain))}</div>` : ''}`;
    }

    function renderSummary() {
      const c = calc();
      const editable = S.step === 1;
      $('#sumCount').textContent = `(${c.qty})`;
      $('#sumToggleLabel').textContent = `${S.sumOpen ? 'Ẩn' : 'Xem'} đơn hàng (${c.qty})`;
      $('#sumToggleTotal').textContent = fmt(c.total);
      $('#sumLock').classList.toggle('hidden', editable);
      $('#sumItems').innerHTML = c.items.map(i => itemRow(i, editable)).join('');
      $('#sumTotals').innerHTML = totalsHTML(c, false);
      renderPromo();
    }

    function renderPromo() {
      const editable = S.step === 1;
      const vObj = S.promoObj || (S.promo && PROMOS[S.promo]) || null;
      $('#promoBox').classList.toggle('hidden', !editable && !S.promo);
      $('#promoFormWrap').classList.toggle('hidden', !!S.promo || !editable);
      $('#promoApplied').classList.toggle('hidden', !S.promo);
      $('#promoRemove').classList.toggle('hidden', !editable);
      if (S.promo && vObj) {
        $('#promoCode').textContent = S.promo;
        $('#promoDesc').textContent = vObj.desc || vObj.description || 'Đã áp dụng ưu đãi';
      }
    }

    function promoError(msg) {
      const e = $('#promoErr');
      e.textContent = msg;
      e.classList.toggle('hidden', !msg);
      $('#promoInput').classList.toggle('is-error', !!msg);
    }

    $('#promoForm').addEventListener('submit', async e => {
      e.preventDefault();
      if (S.step !== 1) return;
      const input = $('#promoInput');
      const code = input.value.trim().toUpperCase().replace(/\s+/g, '');
      if (!code) { promoError('Vui lòng nhập mã giảm giá.'); shake(input); return; }
      const subNow = calc().subtotal;

      let vMatched = null;
      try {
        const res = await fetch('/api/vouchers/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, subtotal: subNow }),
        });
        const data = await res.json();
        if (!res.ok || !data || !data.ok) {
          promoError((data && data.error) || `Mã “${code}” không hợp lệ hoặc đã hết hạn.`);
          shake(input);
          return;
        }
        const vData = data.voucher || data;
        const rawType = (data.freeShip || vData.type === 'freeship' || vData.type === 'shipping' || String(vData.code || code).toUpperCase() === 'HOMIEWITHCOOKIE')
          ? 'freeship'
          : (vData.type || 'percent');
        vMatched = {
          code: vData.code || code,
          type: rawType,
          value: Number(vData.value) || (rawType === 'freeship' ? 50000 : 0),
          maxDiscount: Number(vData.maxDiscount) || 0,
          minOrder: Number(vData.minOrder) || 0,
          desc: vData.description || (rawType === 'freeship' ? 'Miễn phí vận chuyển toàn quốc 50.000₫' : (vData.type === 'fixed' ? `Giảm ${fmt(vData.value)}` : `Giảm ${vData.value}%`)),
        };
      } catch (netErr) {
        if (!PROMOS[code]) { promoError(`Mã “${code}” không hợp lệ hoặc đã hết hạn.`); shake(input); return; }
        if (subNow < (PROMOS[code].minOrder || 0)) {
          promoError(`Mã ${code} áp dụng cho đơn từ ${fmt(PROMOS[code].minOrder)}.`);
          shake(input);
          return;
        }
        vMatched = PROMOS[code];
      }

      S.promo = vMatched.code;
      S.promoObj = vMatched;
      try { sessionStorage.setItem(PROMO_KEY, JSON.stringify(vMatched)); } catch (err) {  }
      input.value = '';
      promoError('');
      CK.toast(
        isFreeShipVoucher(vMatched)
          ? `Đã áp dụng mã ${vMatched.code} — Miễn phí vận chuyển 50.000₫!`
          : `Đã áp dụng mã ${vMatched.code} — giảm ${fmt(calcPromoDiscount(subNow, vMatched))}`,
        'success'
      );
      refreshAll();
    });
    $('#promoInput').addEventListener('input', () => { if ($('#promoInput').classList.contains('is-error')) promoError(''); });
    $('#promoRemove').addEventListener('click', () => {
      if (S.step !== 1) return;
      S.promo = null;
      S.promoObj = null;
      try { sessionStorage.removeItem(PROMO_KEY); } catch (err) {  }
      CK.toast('Đã gỡ mã giảm giá');
      refreshAll();
    });

    $('#sumItems').addEventListener('click', e => {
      const b = e.target.closest('[data-act]');
      if (!b || S.step !== 1) return;
      const key = b.dataset.key;
      const it = CK.cart.get().find(i => i.key === key);
      if (!it) return;
      const act = b.dataset.act;
      if (act === 'rm') {
        CK.cart.remove(key);
        CK.toast(`Đã xoá ${it.name} khỏi đơn hàng`);
      } else if (act === 'dec') {
        CK.cart.setQty(key, it.qty - 1);
      } else if (act === 'inc') {
        const st = stockOf(it.id);
        if (qtyById(it.id) >= st) { CK.toast(`Chỉ còn ${st} đôi ${it.name} trong kho`, 'error'); return; }
        if (it.qty >= 10) { CK.toast('Tối đa 10 đôi cho mỗi mẫu', 'error'); return; }
        CK.cart.setQty(key, it.qty + 1);
      }
    });

    $('#sumToggle').addEventListener('click', () => {
      S.sumOpen = !S.sumOpen;
      $('#sumBody').classList.toggle('is-open', S.sumOpen);
      $('#sumToggle').setAttribute('aria-expanded', String(S.sumOpen));
      renderSummary();
    });

    function renderSteps() {
      $$('.ck-step').forEach(el => {
        const n = Number(el.dataset.step);
        const done = n < S.step;
        const active = n === S.step;
        el.classList.toggle('is-done', done);
        el.classList.toggle('is-active', active);
        el.classList.toggle('is-clickable', done);
        el.querySelector('.ck-step__num').innerHTML = done ? CHECK_SVG : String(n);
        if (active) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
      });
      $$('.ck-step__line').forEach((el, idx) => el.classList.toggle('is-done', idx + 1 < S.step));
      $('#stepBar').style.width = (S.step / 3 * 100).toFixed(2) + '%';
    }

    function goTo(n, opts) {
      opts = opts || {};
      if (S.done) return;
      n = Math.max(1, Math.min(3, Number(n) || 1));

      if (n >= 2 && (validateAll(false) || stockProblem())) n = 1;
      if (n === 3 && (S.pay === 'cod' || !S.agree)) n = 2;

      S.step = n;
      $$('[data-step-panel]').forEach(p => {
        const on = Number(p.dataset.stepPanel) === n;
        p.classList.toggle('hidden', !on);
        if (on) { p.classList.remove('ck-panel-in'); void p.offsetWidth; p.classList.add('ck-panel-in'); }
      });
      if (n === 1) { renderCarriers(); renderPays(); }
      if (n === 2) renderStep2();
      if (n === 3) enterStep3();
      renderSteps();
      renderSummary();

      const hash = '#step-' + n;
      if (location.hash !== hash) {
        try {
          if (opts.replace) history.replaceState(null, '', hash);
          else history.pushState(null, '', hash);
        } catch (e) {  }
      }
      if (opts.focus) {
        setTimeout(() => {
          const field = F[opts.focus];
          const target = field || document.getElementById('sec-' + opts.focus);
          if (!target) return;
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (field) { try { field.focus({ preventScroll: true }); } catch (e) { field.focus(); } }
        }, 60);
      } else if (!opts.noScroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    $$('.ck-step').forEach(el => el.addEventListener('click', () => {
      const n = Number(el.dataset.step);
      if (n < S.step && !S.busy) goTo(n);
    }));

    window.addEventListener('popstate', () => {
      if (S.done || S.busy) return;
      const m = location.hash.match(/^#step-([123])$/);
      const n = m ? Number(m[1]) : 1;
      if (n !== S.step) goTo(n, { replace: true });
    });

    let activeSubstep = 1;
    function updateSubsteps(curr) {
      if (curr) activeSubstep = curr;
      const s1Done = !RULES.name(F.name.value || '') && !RULES.phone(F.phone.value || '') && !RULES.email(F.email.value || '');
      const s2Done = !RULES.province(F.province.value || '') && !RULES.district(F.district.value || '') && !RULES.ward(F.ward.value || '') && !RULES.street(F.street.value || '');
      const s3Done = s1Done && s2Done && Boolean(S.carrier);
      const s4Done = s3Done && Boolean(S.pay);
      const doneMap = { 1: s1Done, 2: s2Done, 3: s3Done, 4: s4Done };
      [1, 2, 3, 4].forEach(i => {
        const btn = document.querySelector(`[data-substep="${i}"]`);
        const dot = document.querySelector(`[data-substep-dot="${i}"]`);
        const bar = document.querySelector(`[data-substep-bar="${i}"]`);
        const st = document.querySelector(`[data-sec-status="${i}"]`);
        const isDone = doneMap[i];
        if (btn) {
          btn.classList.toggle('is-done', isDone);
          btn.classList.toggle('is-current', activeSubstep === i && !isDone);
        }
        if (dot) dot.textContent = isDone ? '✓' : String(i);
        if (bar) bar.classList.toggle('is-done', isDone);
        if (st) {
          st.textContent = isDone ? '✓ Đã hoàn tất' : `Bước ${i} / 4`;
          st.className = isDone ? 'text-xs font-semibold text-instock' : 'text-xs font-semibold text-muted';
        }
      });
    }

    ['name', 'phone', 'email', 'ward', 'street'].forEach(k => {
      F[k].addEventListener('blur', () => { if (F[k].value.trim() || F[k].classList.contains('is-error')) validateField(k); updateSubsteps(); });
      F[k].addEventListener('input', () => {
        if (k === 'phone') {
          const formatted = formatPhoneMask(F.phone.value);
          if (F.phone.value !== formatted) F.phone.value = formatted;
        }
        if (F[k].classList.contains('is-error')) validateField(k);
        updateSubsteps();
        saveInfoSoon();
      });
    });
    F.note.addEventListener('input', saveInfoSoon);
    F.province.addEventListener('change', () => {
      onProvince();
      validateField('province');
      setErr('district', ''); setErr('ward', '');
      renderCarriers(); renderPays(); renderSummary();
      updateSubsteps(2);
      saveInfoSoon();
    });
    F.district.addEventListener('change', () => {
      onDistrict();
      validateField('district');
      setErr('ward', '');
      updateSubsteps(2);
      saveInfoSoon();
    });
    F.ward.addEventListener('change', () => { validateField('ward'); updateSubsteps(2); saveInfoSoon(); });

    document.addEventListener('click', e => {
      const subBtn = e.target.closest('[data-substep], [data-next-substep]');
      if (!subBtn) return;
      const targetStep = Number(subBtn.getAttribute('data-substep') || subBtn.getAttribute('data-next-substep'));
      if (targetStep === 2 && subBtn.hasAttribute('data-next-substep')) {
        if (!validateField('name', true)) { focusField('name'); return; }
        if (!validateField('phone', true)) { focusField('phone'); return; }
        if (!validateField('email', true)) { focusField('email'); return; }
      }
      if (targetStep === 3 && subBtn.hasAttribute('data-next-substep')) {
        for (const k of ['province', 'district', 'ward', 'street']) {
          if (!validateField(k, true)) { focusField(k); return; }
        }
      }
      updateSubsteps(targetStep);
      const sec = document.querySelector(`[data-substep-sec="${targetStep}"]`);
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    $('#carrierList').addEventListener('change', e => {
      if (e.target.name !== 'carrier' || e.target.disabled) return;
      S.carrier = e.target.value;
      renderCarriers(); renderPays(); renderSummary();
      saveInfoSoon();
    });
    $('#payList').addEventListener('change', e => {
      if (e.target.name !== 'pay') return;
      S.pay = e.target.value;
      renderPays(); renderSummary();
      saveInfoSoon();
    });

    $('#step1Form').addEventListener('submit', e => {
      e.preventDefault();
      if (!CK.auth || !CK.auth.getUser() || !CK.auth.getToken()) {
        if (CK.requireAuth) {
          CK.requireAuth(() => {
            applyUserToForm(CK.auth.getUser());
            $('#step1Form').requestSubmit();
          }, 'Vui lòng đăng nhập tài khoản trước khi đặt hàng!');
        }
        return;
      }
      const bad = validateAll(true);
      if (bad) { focusField(bad); CK.toast('Vui lòng kiểm tra lại thông tin giao hàng', 'error'); return; }
      const sp = stockProblem();
      if (sp) {
        CK.toast(sp, 'error');
        if (window.innerWidth < 1024 && !S.sumOpen) $('#sumToggle').click();
        return;
      }
      saveInfo();
      goTo(2);
    });

    function recapBlock(title, body, focus) {
      return `<div class="border border-line p-5">
          <div class="flex items-center justify-between gap-3 mb-3"><p class="ck-label">${title}</p><button type="button" class="ck-link" data-edit="${focus}">Sửa</button></div>
          <div class="text-[15px] leading-relaxed">${body}</div>
        </div>`;
    }

    function renderStep2() {
      const c = calc();
      const info = getInfo();
      const pay = PAYS[S.pay];
      const payDesc = S.pay === 'cod' ? 'Giữ mã đơn trước, shop liên hệ Zalo xác nhận cọc trong 15 phút'
        : S.pay === 'deposit' ? (c.subtotal >= 2000000 ? `Cọc 50% giá trị giày (${fmt(c.payNow)}), phần còn lại trả khi nhận giày` : 'Cọc trước 500K/đôi, phần còn lại trả khi nhận giày')
        : 'MoMo hoặc VietQR MB Bank (Freeship)';
      const nowNote = S.pay === 'cod' ? 'Tạo mã giữ đơn ngay — Shop liên hệ Zalo 098 856 19 09 xác nhận size chuẩn & hướng dẫn cọc Order trong 15 phút.'
        : S.pay === 'deposit' ? `Còn lại <b>${fmt(c.remain)}</b> thanh toán khi nhận giày.`
        : 'Thanh toán 100% qua MoMo hoặc VietQR ở bước tiếp theo.';
      $('#step2').innerHTML = `
        <h2 class="ck-title text-3xl sm:text-4xl mb-1">Xác nhận đơn hàng</h2>
        <p class="text-muted mb-6">Kiểm tra kỹ thông tin trước khi đặt hàng nhé.</p>
        <div class="grid sm:grid-cols-2 gap-3">
          ${recapBlock('Người nhận', `<p class="font-semibold">${esc(info.name)}</p><p class="tabular">${esc(info.phone)}</p>${info.email ? `<p class="text-muted break-all">${esc(info.email)}</p>` : ''}`, 'name')}
          ${recapBlock('Địa chỉ', `<p>${esc(fullAddress(info))}</p>${info.note ? `<p class="text-muted text-sm mt-1">Ghi chú: ${esc(info.note)}</p>` : ''}`, 'street')}
          ${recapBlock('Vận chuyển', `<p class="font-semibold">${c.carrier.label} (${c.carrier.eta})</p><p class="text-muted">${c.free ? 'Miễn phí vận chuyển' : 'Phí ship ' + fmt(c.shipping)}</p>`, 'carrier')}
          ${recapBlock('Thanh toán', `<p class="font-semibold">${pay.title}</p><p class="text-muted">${payDesc}</p>`, 'pay')}
        </div>

        <div class="mt-8">
          <p class="ck-label mb-1">Sản phẩm (${c.qty})</p>
          <div class="border-t border-line">${c.items.map(i => itemRow(i, false)).join('')}</div>
        </div>

        <div class="mt-4 border-t border-line pt-5 space-y-2.5">${totalsHTML(c, true)}</div>

        <div class="mt-6 bg-sky border-l-4 border-brand p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p class="ck-label">Số tiền cần thanh toán ngay</p>
            <p class="text-sm text-muted mt-1">${nowNote}</p>
          </div>
          <p class="ck-display text-5xl sm:text-6xl text-brand tabular whitespace-nowrap">${fmt(c.payNow)}</p>
        </div>

        <label class="flex items-start gap-3 mt-8 cursor-pointer" id="agreeWrap">
          <input type="checkbox" id="agree" class="ck-check mt-0.5 flex-shrink-0" ${S.agree ? 'checked' : ''} />
          <span class="text-sm leading-relaxed">Tôi xác nhận đã chọn <b>đúng Size EU</b> và đồng ý với <button type="button" data-open-policy="size" class="font-bold underline underline-offset-2 text-black">Chính sách Cookie's Kicks</button>: <b>không hoàn hàng / không đổi size nếu khách chọn sai size</b>; trường hợp giày lỗi NSX được <b>đổi mới 1:1 (chờ 10–12 ngày) khi giày chưa qua sử dụng</b>; cam kết <b>100% Authentic</b>.</span>
        </label>
        <p id="err-agree" class="ck-error-text hidden" role="alert">Vui lòng đồng ý với điều khoản để đặt hàng.</p>

        <div class="flex flex-col-reverse sm:flex-row gap-3 mt-8">
          <button type="button" class="ck-btn ck-btn--ghost" data-back>← Quay lại sửa thông tin</button>
          <button type="button" class="ck-btn flex-1" id="placeBtn">${S.pay === 'cod' ? 'Xác nhận giữ đơn qua Zalo' : (S.pay === 'transfer' ? 'Xác nhận đơn &amp; Thanh toán 100%' : 'Xác nhận đơn &amp; Lấy mã QR đặt cọc')} ${ARROW}</button>
        </div>`;
    }

    $('#step2').addEventListener('click', e => {
      if (S.busy) return;
      const edit = e.target.closest('[data-edit]');
      if (edit) { goTo(1, { focus: edit.dataset.edit }); return; }
      if (e.target.closest('[data-back]')) { goTo(1); return; }
      const place = e.target.closest('#placeBtn');
      if (place) placeOrder(place);
    });
    $('#step2').addEventListener('change', e => {
      if (e.target.id !== 'agree') return;
      S.agree = e.target.checked;
      if (S.agree) $('#err-agree').classList.add('hidden');
    });

    function placeOrder(btn) {
      if (S.busy) return;
      if (!CK.auth || !CK.auth.getUser() || !CK.auth.getToken()) {
        if (CK.requireAuth) CK.requireAuth(() => placeOrder(btn), 'Vui lòng đăng nhập tài khoản trước khi đặt hàng!');
        return;
      }
      if (!S.agree) {
        $('#err-agree').classList.remove('hidden');
        shake($('#agreeWrap'));
        return;
      }
      const sp = stockProblem();
      if (sp) { CK.toast(sp, 'error'); return; }
      if (S.pay === 'cod') {
        S.busy = true;
        btn.disabled = true;
        btn.innerHTML = '<span class="flex items-center gap-3"><span class="ck-spinner"></span>Đang tạo đơn hàng…</span>';
        setTimeout(async () => {
          const ok = await createOrder('wait', 'Giữ đơn Zalo');
          S.busy = false;
          if (!ok) { btn.disabled = false; btn.innerHTML = `Xác nhận giữ đơn qua Zalo ${ARROW}`; }
        }, 700);
      } else {
        goTo(3);
      }
    }

    function stopTimer() { if (S.timer) { clearInterval(S.timer); S.timer = null; } }
    function startTimer() { stopTimer(); tick(); S.timer = setInterval(tick, 1000); }
    function newAttempt() {
      S.code = uniqueCode();
      S.expired = false;
      S.deadline = Date.now() + HOLD_MS;
      startTimer();
    }
    function tick() {
      const left = Math.max(0, S.deadline - Date.now());
      const sec = Math.ceil(left / 1000);
      const el = $('#holdTime');
      const box = $('#holdBox');
      if (el) el.textContent = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
      if (box) box.classList.toggle('is-urgent', sec <= 120);
      if (left <= 0) {
        stopTimer();
        S.expired = true;
        if (S.step === 3 && !S.done && !S.busy) {
          renderStep3();
          CK.toast('Hết thời gian giữ hàng — vui lòng tạo lại mã thanh toán', 'error');
        }
      }
    }
    function enterStep3() {
      if (!S.code) newAttempt();
      else if (!S.timer && !S.expired) startTimer();
      renderStep3();
    }

    function infoRow(label, value, copy, mono) {
      return `<div class="flex items-center gap-3 px-4 py-3 border-t border-line">
          <span class="text-sm text-muted w-28 sm:w-36 flex-shrink-0">${label}</span>
          <span class="flex-1 min-w-0 font-bold tabular break-words ${mono ? 'ck-mono text-brand' : ''}">${value}</span>
          ${copy ? `<button type="button" class="ck-copy" data-copy="${esc(copy)}" aria-label="Sao chép ${label}">Chép</button>` : ''}
        </div>`;
    }

    function renderStep3() {
      const c = calc();
      const el = $('#step3');
      const B = CK.BANK;
      const code = esc(S.code);
      if (S.expired) {
        el.innerHTML = `
          <div class="border-2 border-sale p-6 sm:p-10 text-center">
            <p class="ck-eyebrow text-sale mb-3">Hết thời gian giữ hàng</p>
            <h2 class="ck-display text-5xl sm:text-6xl mb-4">Mã ${code} đã hết hạn</h2>
            <p class="text-muted max-w-md mx-auto mb-8">Sau 15 phút chưa nhận được thanh toán, sản phẩm đã được trả lại kho. Nếu bạn <b class="text-ink">đã chuyển khoản</b>, đừng lo — gọi/Zalo <a class="underline font-semibold text-ink" href="tel:${CK.CONTACT.tel}">${CK.CONTACT.phone}</a> để được hỗ trợ ngay.</p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <button type="button" class="ck-btn" data-renew>Tạo lại mã ${ARROW}</button>
              <button type="button" class="ck-btn ck-btn--ghost" data-back2>← Quay lại xác nhận</button>
            </div>
          </div>`;
        return;
      }
      const payNow = c.payNow;
      el.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p class="ck-label text-muted mb-2">Mã đơn hàng</p>
            <div class="flex items-center gap-3">
              <span class="ck-mono text-4xl sm:text-5xl font-bold text-ink">${code}</span>
              <button type="button" class="ck-copy" data-copy="${code}" aria-label="Sao chép mã đơn hàng">Chép</button>
            </div>
          </div>
          <div id="holdBox" class="ck-hold flex items-center gap-3 border border-ink px-4 py-3 self-start sm:self-auto" role="timer">
            ${CLOCK_SVG}
            <span class="ck-label">Giữ hàng trong</span>
            <span id="holdTime" class="ck-title text-3xl tabular">15:00</span>
          </div>
        </div>

        <div class="bg-sky border-l-4 border-brand p-5 flex flex-col sm:flex-row justify-between gap-2 sm:items-center mb-8">
          <div>
            <p class="ck-label">Số tiền cần chuyển</p>
            <p class="text-sm text-muted mt-1">${S.pay === 'deposit' ? `Đặt cọc · còn lại ${fmt(c.remain)} thanh toán khi nhận hàng` : 'Thanh toán 100% giá trị đơn hàng'}</p>
          </div>
          <p class="ck-display text-5xl text-brand tabular whitespace-nowrap">${fmt(payNow)}</p>
        </div>

        <div class="border-b border-line mb-6 flex" role="tablist" aria-label="Phương thức chuyển tiền">
          <button type="button" class="ck-tab ${S.tab === 'momo' ? 'is-active' : ''}" role="tab" data-tab="momo" aria-selected="${S.tab === 'momo'}">MoMo</button>
          <button type="button" class="ck-tab ${S.tab === 'vietqr' ? 'is-active' : ''}" role="tab" data-tab="vietqr" aria-selected="${S.tab === 'vietqr'}">VietQR MB Bank</button>
        </div>

        <div data-panel="momo" role="tabpanel" class="${S.tab === 'momo' ? '' : 'hidden'}">
          <div class="grid sm:grid-cols-[minmax(0,300px)_1fr] gap-6 items-start">
            <div class="w-full max-w-[300px] mx-auto sm:mx-0">
              <img id="momoImg" src="public/images/momo-qr.png" alt="Mã QR MoMo — DANG GIA KHIEM — 098 856 19 09" class="w-full h-auto border border-ink bg-white" width="768" height="1024" />
              <div id="momoFail" class="hidden border border-ink p-6 text-center">
                <p class="ck-label mb-2">MoMo</p>
                <p class="ck-mono text-xl font-bold">098 856 19 09</p>
                <p class="text-sm text-muted mt-1">DANG GIA KHIEM</p>
              </div>
            </div>
            <div>
              <p class="ck-title text-2xl mb-4">Quét mã bằng MoMo</p>
              <ol class="space-y-3 text-[15px]">
                <li class="flex gap-3"><span class="ck-num">1</span><span>Mở ứng dụng <b>MoMo</b> → chọn <b>Quét mã</b>.</span></li>
                <li class="flex gap-3"><span class="ck-num">2</span><span>Quét mã QR — người nhận <b>DANG GIA KHIEM – 098 856 19 09</b>.</span></li>
                <li class="flex gap-3"><span class="ck-num">3</span><span>Nhập đúng số tiền <b class="tabular">${fmt(payNow)}</b>.</span></li>
                <li class="flex gap-3"><span class="ck-num">4</span><span>Lời nhắn / nội dung: <b class="ck-mono text-brand">${code}</b> rồi xác nhận.</span></li>
              </ol>
              <div class="mt-5 flex items-center gap-3 border border-line px-4 py-3">
                <span class="text-sm text-muted">Số MoMo</span>
                <span class="flex-1 font-bold tabular">${CK.CONTACT.phone}</span>
                <button type="button" class="ck-copy" data-copy="${CK.CONTACT.tel}" aria-label="Sao chép số MoMo">Chép</button>
              </div>
            </div>
          </div>
        </div>

        <div data-panel="vietqr" role="tabpanel" class="${S.tab === 'vietqr' ? '' : 'hidden'}">
          <div class="grid sm:grid-cols-[minmax(0,300px)_1fr] gap-6 items-start">
            <div class="w-full max-w-[300px] mx-auto sm:mx-0 border-4 border-brand bg-white">
              <div class="bg-brand text-white text-center ck-label py-2">VietQR · MB Bank</div>
              <div class="p-3">
                <div id="qrFrame" class="relative w-full" style="aspect-ratio: 27 / 32;">
                  <div id="qrSkel" class="ck-skeleton absolute inset-0"></div>
                  <img id="qrImg" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Mã VietQR MB Bank — ${B.accountName} — ${fmt(payNow)} — ${code}" class="relative w-full h-full object-contain opacity-0 transition-opacity duration-300" />
                </div>
                <div id="qrFail" class="hidden p-3 text-center">
                  <p class="ck-label text-sale mb-2">Không tải được mã QR</p>
                  <p class="text-sm text-muted mb-4">Vui lòng chuyển khoản thủ công:</p>
                  <p class="font-bold">${B.name}</p>
                  <p class="ck-mono text-xl font-bold my-1">${B.accountNo}</p>
                  <p class="text-sm">${B.accountName}</p>
                  <p class="text-sm mt-3">Số tiền: <b class="tabular">${fmt(payNow)}</b></p>
                  <p class="text-sm">Nội dung: <b class="ck-mono">${code}</b></p>
                </div>
              </div>
            </div>
            <div>
              <p class="ck-title text-2xl mb-4">Quét mã bằng app ngân hàng</p>
              <ol class="space-y-3 text-[15px]">
                <li class="flex gap-3"><span class="ck-num">1</span><span>Mở app ngân hàng bất kỳ (hoặc ví hỗ trợ <b>VietQR</b>) → <b>Quét QR</b>.</span></li>
                <li class="flex gap-3"><span class="ck-num">2</span><span>Số tiền <b class="tabular">${fmt(payNow)}</b> và nội dung <b class="ck-mono text-brand">${code}</b> đã được điền sẵn.</span></li>
                <li class="flex gap-3"><span class="ck-num">3</span><span>Kiểm tra người nhận <b>${B.accountName}</b> rồi xác nhận chuyển.</span></li>
              </ol>
            </div>
          </div>
        </div>

        <div class="mt-8 border border-line">
          <p class="ck-label px-4 py-3 bg-tile">Thông tin chuyển khoản</p>
          ${infoRow('Ngân hàng', `${B.name} <span class="font-medium text-muted">(Ngân hàng Quân Đội)</span>`)}
          ${infoRow('Số tài khoản', B.accountNo, B.accountNo, true)}
          ${infoRow('Chủ tài khoản', B.accountName)}
          ${infoRow('Số tiền', fmt(payNow), String(Math.round(payNow)))}
          ${infoRow('Nội dung CK', code, S.code, true)}
        </div>

        <div class="mt-6 flex gap-3 p-4 bg-sky text-sm leading-relaxed">
          ${INFO_SVG}
          <p><b class="uppercase tracking-wide">Quét mã QR hoặc Gửi tiền bằng STK.</b> Bạn chỉ cần quét mã QR hoặc chuyển khoản theo Số tài khoản <b class="ck-mono">${B.accountNo}</b> (${B.name}) với nội dung <b class="ck-mono">${code}</b> rồi bấm nút hoàn tất bên dưới.</p>
        </div>

        <div class="flex flex-col-reverse sm:flex-row gap-3 mt-8">
          <button type="button" class="ck-btn ck-btn--ghost" data-back2>← Quay lại đổi phương thức</button>
          <button type="button" class="ck-btn flex-1" id="paidBtn">Tôi đã chuyển khoản · Hoàn tất đơn hàng ${ARROW}</button>
        </div>
        <p class="text-xs text-muted mt-4">Gặp sự cố khi thanh toán? Gọi/Zalo <a class="underline font-semibold text-ink" href="tel:${CK.CONTACT.tel}">${CK.CONTACT.phone}</a>.</p>`;

      tick();
      setupImages(CK.vietQR({ amount: payNow, content: S.code, template: 'compact2' }));
      if (CK.createTokenizedPaymentQr) {
        const info = getInfo();
        CK.createTokenizedPaymentQr({ amount: payNow, content: S.code, payerName: info.name, payerPhone: info.phone })
          .then(res => {
            const qr = $('#qrImg');
            if (qr && res && res.qrUrl) qr.src = res.qrUrl;
          })
          .catch(() => {});
      }
    }

    function setupImages(qrUrl) {
      const momo = $('#momoImg');
      if (momo) {
        momo.onerror = () => { momo.classList.add('hidden'); const f = $('#momoFail'); if (f) f.classList.remove('hidden'); };
        momo.src = 'public/images/momo-qr.png';
      }
      const qr = $('#qrImg');
      if (qr) {
        qr.onload = () => { const s = $('#qrSkel'); if (s) s.remove(); qr.classList.remove('opacity-0'); };
        qr.onerror = () => { const fr = $('#qrFrame'); if (fr) fr.classList.add('hidden'); const f = $('#qrFail'); if (f) f.classList.remove('hidden'); };
        qr.src = qrUrl;
      }
    }

    function switchTab(tab) {
      S.tab = tab;
      $$('#step3 [data-tab]').forEach(b => {
        const on = b.dataset.tab === tab;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      $$('#step3 [data-panel]').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== tab));
    }

    $('#step3').addEventListener('click', e => {
      if (S.busy) return;
      const t = e.target.closest('[data-tab]');
      if (t) { switchTab(t.dataset.tab); return; }
      if (e.target.closest('[data-renew]')) {
        newAttempt();
        renderStep3();
        CK.toast(`Đã tạo mã mới ${S.code} — giữ hàng thêm 15:00`, 'success');
        return;
      }
      if (e.target.closest('[data-back2]')) { goTo(2); return; }
      const paid = e.target.closest('#paidBtn');
      if (paid) confirmPaid(paid);
    });

    function confirmPaid(btn) {
      if (S.busy || S.expired) return;
      S.busy = true;
      stopTimer();
      btn.disabled = true;
      $$('#step3 [data-back2]').forEach(b => { b.disabled = true; });
      btn.innerHTML = '<span class="flex items-center gap-3"><span class="ck-spinner"></span>Đang đối soát giao dịch…</span>';
      setTimeout(async () => {
        if (S.done) { S.busy = false; return; }
        const ok = await createOrder('paid', S.tab === 'momo' ? 'MoMo' : 'VietQR MB Bank');
        S.busy = false;
        if (!ok) {
          btn.disabled = false;
          btn.innerHTML = `Tôi đã chuyển khoản · Hoàn tất đơn hàng ${ARROW}`;
          $$('#step3 [data-back2]').forEach(b => { b.disabled = false; });
          if (!S.expired) startTimer();
        }
      }, 2000);
    }

    async function createOrder(status, method) {
      const c = calc();
      const info = getInfo();
      if (!c.items.length) { CK.toast('Giỏ hàng trống — không thể tạo đơn', 'error'); return false; }
      const curUser = CK.auth && CK.auth.getUser ? CK.auth.getUser() : null;
      const curTok = CK.auth && CK.auth.getToken ? CK.auth.getToken() : '';
      if (!curUser || !curTok) {
        if (CK.requireAuth) CK.requireAuth(null, 'Vui lòng đăng nhập tài khoản trước khi đặt hàng!');
        return false;
      }
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const order = {
        id: S.code || uniqueCode(),
        userId: curUser ? curUser.id : '',
        userEmail: curUser ? (curUser.email || info.email) : info.email,
        userProvider: curUser ? (curUser.provider || 'member') : 'guest',
        name: info.name,
        phone: info.phone,
        email: info.email || (curUser && curUser.email) || '',
        address: fullAddress(info),
        items: c.items.map(i => ({ id: i.id, name: i.name, size: i.size, colorway: i.colorway, qty: i.qty, price: i.price })),
        product: c.items.map(i => `${i.name} (EU ${i.size})${i.qty > 1 ? ' x' + i.qty : ''}`).join(', '),
        size: c.items.map(i => i.size).join(', '),
        qty: c.qty,
        subtotal: c.subtotal,
        discount: c.discount,
        shipping: c.shipping,
        total: c.total,
        paid: c.payNow,
        payment: PAYS[S.pay].label,
        method: method,
        carrier: c.carrier.label,
        status: status,
        orderMode: 'order_12_15',
        etaWindow: c.etaWindow,
        date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
        createdAt: now.toISOString(),
        tracking: '',
        note: info.note,
        promo: S.promo || '',
      };

      try {
        if (!CK.appendOrderToServer) {
          throw new Error('Không tìm thấy kết nối máy chủ đặt hàng.');
        }
        await CK.appendOrderToServer(order);

        if (curUser && CK.auth && CK.auth.upsertAccount) {
          CK.auth.upsertAccount({
            name: info.name || curUser.name,
            province: info.province || curUser.province,
            district: info.district || curUser.district,
            ward: info.ward || curUser.ward,
            street: info.street || curUser.street,
          });
        }

        if (CK.syncFromServer) {
          CK.syncFromServer().catch(() => {});
        }
      } catch (e) {
        if (e && e.message === 'AUTH_REQUIRED') {
          if (CK.requireAuth) CK.requireAuth(null, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để hoàn tất đặt hàng!');
          return false;
        }
        CK.toast((e && e.message) || ('Không thể tạo đơn hàng. Vui lòng liên hệ ' + CK.CONTACT.phone), 'error');
        return false;
      }

      stopTimer();
      S.done = true;
      saveInfo();
      try { sessionStorage.removeItem(PROMO_KEY); } catch (e) {  }
      CK.cart.clear();
      showSuccess(order);
      return true;
    }

    function confetti() {
      const colors = ['#000000', '#111111', '#FA5400', '#008A00', '#EBEEEF'];
      const pieces = [];
      const frag = document.createDocumentFragment();
      for (let i = 0; i < 80; i++) {
        const el = document.createElement('span');
        const size = 6 + Math.random() * 8;
        const color = colors[i % colors.length];
        el.className = 'ck-confetti';
        el.style.left = (Math.random() * 100) + 'vw';
        el.style.width = size + 'px';
        el.style.height = (Math.random() < 0.5 ? size : size * 0.45) + 'px';
        el.style.background = color;
        if (color === '#ffffff') el.style.boxShadow = 'inset 0 0 0 1px #D7DCE6';
        el.style.animationDuration = (2.2 + Math.random() * 2) + 's';
        el.style.animationDelay = (Math.random() * 0.5) + 's';
        el.style.transform = 'rotate(' + Math.floor(Math.random() * 360) + 'deg)';
        pieces.push(el);
        frag.appendChild(el);
      }
      document.body.appendChild(frag);
      setTimeout(() => pieces.forEach(p => p.remove()), 5000);
    }

    function showSuccess(o) {
      $('#flow').classList.add('hidden');
      $('#emptyState').classList.add('hidden');
      const remain = Math.max(0, o.total - o.paid);
      const isPaid = o.status === 'paid';
      const firstName = (o.name || '').split(' ').slice(-1)[0] || 'bạn';
      const sRow = (label, value) => `<tr class="border-b border-line"><th scope="row" class="py-3 pr-4 text-left align-top text-muted font-semibold w-32 sm:w-44">${label}</th><td class="py-3 font-semibold">${value}</td></tr>`;
      const products = o.items.map(i => `<span class="block">${esc(i.name)} <span class="text-muted font-medium">· ${esc(i.colorway)} · <b class="text-ink">${esc(CK.sizeBadge ? CK.sizeBadge(i, i.size) : ('EU ' + i.size))}</b> × ${i.qty}</span></span>`).join('');
      const steps = [
        ['1. Xác nhận cọc & Chốt đơn Order', isPaid ? 'Shop đối soát giao dịch cọc/thanh toán và tiến hành đặt hàng chính hãng ngay.' : 'Shop liên hệ Zalo/điện thoại trong 15 phút để xác nhận size & cọc Order.'],
        ['2. Order Quốc tế (12–15 ngày)', `Giày được vận chuyển về kho Huế — dự kiến về tay: ${esc(o.etaWindow || CK.orderEtaWindow('12–15 ngày'))}.`],
        ['3. Về kho Huế · Check Auth 100%', 'Kiểm định đường chỉ, keo, form, phụ kiện và chụp ảnh thực tế gửi bạn qua Zalo trước khi đóng double-box.'],
        ['4. Giao GHN & Nhận hàng', remain > 0 ? `Kiểm tra giày ưng ý rồi thanh toán phần còn lại ${fmt(remain)} khi nhận hàng.` : 'Nhận giày tận tay — bảo hành đổi 1:1 (chờ 10–12 ngày) nếu lỗi NSX khi giày chưa qua sử dụng.'],
      ];
      const sec = $('#success');
      sec.innerHTML = `
        <div class="ck-container py-10 lg:py-16">
          <div class="max-w-5xl mx-auto">
            <div class="flex items-center gap-3 mb-6">
              <span class="w-12 h-12 bg-brand text-white flex items-center justify-center"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg></span>
              <p class="ck-eyebrow text-brand">Cảm ơn ${esc(firstName)}!</p>
            </div>
            <h1 class="ck-display text-5xl sm:text-7xl lg:text-8xl mb-6">Đặt hàng <br/>thành công</h1>
            <div class="flex flex-wrap items-center gap-3 mb-4">
              <span class="ck-label text-muted">Mã đơn hàng</span>
              <span class="ck-mono text-3xl sm:text-4xl font-bold">${esc(o.id)}</span>
              <button type="button" class="ck-copy" data-copy="${esc(o.id)}" aria-label="Sao chép mã đơn hàng">Chép</button>
              <span class="ck-tag ${isPaid ? 'ck-tag--blue' : 'ck-tag--ink'}">${isPaid ? 'Đã thanh toán · chờ đối soát' : 'Chờ xác nhận'}</span>
            </div>
            <p class="text-muted text-lg max-w-2xl mb-10">${isPaid
              ? 'Cảm ơn bạn đã thanh toán! Cookie\'s Kicks đang đối soát giao dịch và sẽ liên hệ xác nhận qua Zalo/điện thoại trong ít phút.'
              : 'Yêu cầu giữ đơn Order đã được ghi nhận. Shop sẽ liên hệ qua Zalo/điện thoại trong vòng 15 phút để xác nhận lại Size chuẩn Hãng & hướng dẫn đặt cọc Order!'}</p>

            <div class="grid lg:grid-cols-5 gap-10">
              <div class="lg:col-span-3">
                <p class="ck-title text-2xl mb-3">Tóm tắt đơn hàng</p>
                <table class="w-full border-t border-ink text-[15px]"><tbody>
                  ${sRow('Sản phẩm', products)}
                  ${sRow('Tổng tiền', `<span class="ck-title text-2xl tabular">${fmt(o.total)}</span>${o.discount ? ` <span class="text-sm text-brand font-semibold">(đã giảm ${fmt(o.discount)})</span>` : ''}`)}
                  ${sRow('Đã xác nhận thanh toán', `<span class="tabular">${fmt(o.paid)}</span>${o.paid ? ` <span class="text-muted font-medium">· ${esc(o.method)}</span>` : (Number(o.requiredDeposit) > 0 ? ` <span class="text-xs text-[#B45309] font-semibold">· Đang chờ đối soát ${fmt(o.requiredDeposit)} (${esc(o.method)})</span>` : '')}`)}
                  ${sRow('Còn lại khi nhận hàng', `<span class="tabular ${remain > 0 ? 'text-sale' : 'text-brand'}">${fmt(remain)}</span>`)}
                  ${sRow('Người nhận', esc(o.name))}
                  ${sRow('SĐT', `<span class="tabular">${esc(o.phone)}</span>`)}
                  ${sRow('Địa chỉ', esc(o.address))}
                  ${sRow('Vận chuyển', `${esc(o.carrier)} <span class="text-muted font-medium">· ${o.shipping ? fmt(o.shipping) : 'Miễn phí'}</span>`)}
                  ${sRow('Dự kiến về tay', `<span class="ck-mono font-bold text-black">${esc(o.etaWindow || CK.orderEtaWindow('12–15 ngày'))}</span> <span class="text-xs text-muted">(Order 12–15 ngày)</span>`)}
                  ${sRow('Thanh toán', esc(o.payment))}
                </tbody></table>
              </div>
              <div class="lg:col-span-2">
                <p class="ck-title text-2xl mb-3">Tiến trình Order 12–15 Ngày</p>
                <ol class="border-t border-ink pt-2">
                  ${steps.map((s, idx) => `<li class="relative flex gap-4 py-4">
                      ${idx < steps.length - 1 ? '<span class="absolute left-[17px] top-[52px] bottom-0 w-px bg-line" aria-hidden="true"></span>' : ''}
                      <span class="ck-step__num flex-shrink-0 ${idx === 0 ? '!bg-brand !border-brand !text-white' : ''}">${idx + 1}</span>
                      <span class="min-w-0"><span class="block font-bold uppercase tracking-wide">${s[0]}</span><span class="block text-sm text-muted mt-1">${s[1]}</span></span>
                    </li>`).join('')}
                </ol>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row flex-wrap gap-3 mt-12">
              <a href="receipt.html?id=${encodeURIComponent(o.id)}${o.receiptKey ? '&key=' + encodeURIComponent(o.receiptKey) : ''}" target="_blank" rel="noopener" class="ck-btn ck-btn--accent">🧾 Xem &amp; In Phiếu Biên Nhận Cọc / Bảo Hành ${ARROW}</a>
              <button type="button" data-open-track="${esc(o.id)}" class="ck-btn">Tra cứu tiến độ đơn #${esc(o.id)}</button>
              <button type="button" data-open-account="orders" class="ck-btn ck-btn--dark">👤 Xem Tài khoản &amp; Lịch sử mua</button>
              <a href="catalog.html" class="ck-btn ck-btn--ghost">Tiếp tục mua sắm</a>
              <a href="index.html" class="ck-btn ck-btn--ghost">Về trang chủ</a>
            </div>
            <p class="text-sm text-muted mt-8">Cần hỗ trợ? Zalo/Phone <a class="ck-link text-ink" href="https://zalo.me/${CK.CONTACT.tel}" target="_blank" rel="noopener">${CK.CONTACT.phone}</a> · Gọi <a class="underline font-semibold text-ink" href="tel:${CK.CONTACT.tel}">${CK.CONTACT.phone}</a></p>
          </div>
        </div>`;
      sec.classList.remove('hidden');
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {  }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      confetti();
    }

    function showEmpty() {
      stopTimer();
      $('#flow').classList.add('hidden');
      $('#success').classList.add('hidden');
      $('#emptyState').classList.remove('hidden');
    }

    function refreshAll() {
      renderSummary();
      if (S.step === 1) { renderCarriers(); renderPays(); }
      else if (S.step === 2) renderStep2();
    }

    function onCartChange() {
      if (S.done) return;
      if (!CK.cart.get().length) { showEmpty(); return; }
      if ($('#flow').classList.contains('hidden')) {
        $('#emptyState').classList.add('hidden');
        $('#flow').classList.remove('hidden');
        goTo(1, { replace: true, noScroll: true });
        return;
      }
      refreshAll();
    }
    window.addEventListener('ck:cart', onCartChange);
    window.addEventListener('storage', e => { if (e.key === CK.KEYS.cart) onCartChange(); });

    function applyUserToForm(u) {
      if (!u) return;
      if (u.name && !F.name.value) F.name.value = u.name;
      if (u.phone && !F.phone.value) F.phone.value = u.phone;
      if (u.email && !F.email.value) F.email.value = u.email;
      if (u.province && addressData[u.province]) {
        F.province.value = u.province;
        onProvince(u.district || saved.district, u.ward || saved.ward);
      }
      if (u.street && !F.street.value) F.street.value = u.street;
      saveInfoSoon();
    }

    function renderCheckoutAuthBar() {
      const box = $('#ck-checkout-auth-bar');
      if (!box || !CK.auth) return;
      const u = CK.auth.getUser();
      if (u) {
        const myOrdersCount = CK.auth.getMyOrders(u).length;
        box.innerHTML = `
          <div class="border border-black bg-[#F5F5F5] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-11 h-11 bg-black text-white flex items-center justify-center font-heading font-bold text-xl flex-shrink-0">
                ${esc((u.name || 'U').trim().charAt(0).toUpperCase())}
              </div>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-bold text-sm text-black">${esc(u.name)}</span>
                  <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-black text-white">${esc(u.providerLabel || u.provider || 'Member')}</span>
                </div>
                <p class="text-xs text-muted mt-0.5 truncate">Đơn hàng này sẽ tự động lưu vào lịch sử mua của tài khoản · Đã có <b>${myOrdersCount}</b> đơn</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" data-open-account="orders" class="text-xs font-bold uppercase tracking-wider px-3 py-2 border border-black bg-white hover:bg-black hover:text-white transition-colors">
                📦 Lịch sử mua (${myOrdersCount})
              </button>
              <button type="button" data-open-account="profile" class="text-xs font-bold uppercase tracking-wider px-3 py-2 border border-line bg-white hover:border-black transition-colors">
                Đổi TK
              </button>
            </div>
          </div>`;
      } else {
        box.innerHTML = `
          <div class="border-2 border-black bg-[#FFF7ED] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="inline-block w-2 h-2 rounded-full bg-sale"></span>
                <p class="text-xs font-bold uppercase tracking-widest text-black">Bắt buộc đăng nhập tài khoản để đặt hàng</p>
              </div>
              <p class="text-xs text-charcoal">Vui lòng đăng nhập hoặc tạo tài khoản bằng <b>Google, Facebook</b> hoặc <b>Số điện thoại / Email</b> trước khi đặt đơn để lưu lịch sử mua và bảo mật đơn hàng.</p>
            </div>
            <button type="button" data-open-account="login" class="ck-btn ck-btn--sm flex-shrink-0">
              👤 Đăng nhập để đặt hàng ${ARROW}
            </button>
          </div>`;
      }
    }

    window.addEventListener('ck:auth-changed', e => {
      renderCheckoutAuthBar();
      if (e.detail) applyUserToForm(e.detail);
    });

    setupSearchableSelect(F.province);
    setupSearchableSelect(F.district);
    fillSelect(F.province, Object.keys(addressData), '— Chọn Tỉnh/Thành —', addressData[saved.province] ? saved.province : HUE);
    onProvince(saved.district, saved.ward);
    if (saved.name) F.name.value = saved.name;
    if (saved.phone) F.phone.value = formatPhoneMask(saved.phone);
    if (saved.email) F.email.value = saved.email;
    if (saved.street) F.street.value = saved.street;
    if (CK.auth && CK.auth.getUser()) applyUserToForm(CK.auth.getUser());
    if (F.phone.value) F.phone.value = formatPhoneMask(F.phone.value);
    updateSubsteps(1);
    renderCheckoutAuthBar();

    if (!CK.cart.get().length) {
      showEmpty();
      return;
    }
    if (!CK.auth || !CK.auth.getUser() || !CK.auth.getToken()) {
      setTimeout(() => {
        if (!CK.auth.getUser() && CK.openAccountModal) CK.openAccountModal('login');
      }, 150);
    }
    $('#flow').classList.remove('hidden');
    const initM = location.hash.match(/^#step-([123])$/);
    goTo(initM ? Number(initM[1]) : 1, { replace: true, noScroll: true });
  });

if (window.CK_FEATURES && window.CK_FEATURES["checkout"] && window.CK_FEATURES["checkout"].markMounted) { window.CK_FEATURES["checkout"].markMounted(); }
