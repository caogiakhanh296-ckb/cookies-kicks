document.addEventListener('DOMContentLoaded', () => {
    const RECENT_KEY = 'ck_recent_ids';
    const SIZING = window.CK_SIZING;
    let currentProduct = null;
    let selectedSize = null;
    let sizeDisplayUnit = 'eu';
    let activeSgChartKey = 'nike_jordan';
    let qty = 1;

    const relCarousel = CK.initCarousel({ track: '#rel-track', prev: '#rel-prev', next: '#rel-next', bar: '#rel-bar' });
    const recCarousel = CK.initCarousel({ track: '#rec-track', prev: '#rec-prev', next: '#rec-next', bar: '#rec-bar' });

    function getRequestedId() {
      const id = Number(new URLSearchParams(location.search).get('id'));
      return CK.getProduct(id) ? id : (CK.getProducts()[0] && CK.getProducts()[0].id) || 1;
    }

    function pushRecent(id) {
      const prev = CK.read(RECENT_KEY, []);
      const next = [id, ...(Array.isArray(prev) ? prev : []).filter(x => x !== id)].slice(0, 10);
      CK.write(RECENT_KEY, next);
    }

    function buildGalleryMedia(p) {
      const items = [];
      const seen = new Set();
      const addImg = (src, ratio, caption) => {
        if (!src || seen.has(src)) return;
        seen.add(src);
        items.push({ src, ratio, caption });
      };

      addImg(p.image, '1x1', p.name);
      (p.gallery || []).forEach((g, idx) => addImg(g, '1x1', `${p.name} — góc ${idx + 1}`));
      if (p.poster && !seen.has(p.poster)) addImg(p.poster, '4x5', `Bảng giá gốc ${p.model}`);
      return items;
    }

    function renderGallery(p) {
      const media = buildGalleryMedia(p);
      const gal = document.getElementById('pdp-gallery');
      const note = document.getElementById('pdp-frame-note');

      if (media.length === 1) {
        gal.className = 'grid grid-cols-1 ck-pdp-single gap-[8px] lg:gap-[16px]';
      } else if (media.length === 2) {
        gal.className = 'grid sm:grid-cols-2 gap-[8px] lg:gap-[16px]';
      } else {
        gal.className = 'grid grid-cols-2 gap-[8px] lg:gap-[16px]';
      }

      note.textContent = media[0] && media[0].ratio === '1x1' ? 'Ảnh chụp góc thực tế tại Studio' : 'Ảnh chi tiết sản phẩm';

      gal.innerHTML = media.map((m, idx) => {
        const spanHero = media.length === 3 && idx === 0 ? 'col-span-2' : '';
        return `
          <div class="ck-zoom-tile ck-zoom-tile--${m.ratio} ${spanHero} border border-line hover:border-black transition-colors" data-zoom-src="${CK.esc(m.src)}">
            <img src="${CK.esc(m.src)}" alt="${CK.esc(m.caption)}" ${idx > 1 ? 'loading="lazy"' : ''} />
            ${idx === media.length - 1 && p.poster === m.src && media.length > 1
              ? '<span class="ck-tag ck-tag--black absolute bottom-3 left-3 pointer-events-none">Poster gốc shop</span>'
              : ''}
          </div>`;
      }).join('');

      gal.querySelectorAll('.ck-zoom-tile').forEach(tile => {
        tile.addEventListener('mousemove', e => {
          const r = tile.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * 100;
          const y = ((e.clientY - r.top) / r.height) * 100;
          tile.style.setProperty('--zx', `${x.toFixed(1)}%`);
          tile.style.setProperty('--zy', `${y.toFixed(1)}%`);
        });
        tile.addEventListener('click', () => {
          document.getElementById('zoom-modal-img').src = tile.getAttribute('data-zoom-src');
          document.getElementById('zoom-modal').classList.add('is-open');
        });
      });
    }

    function renderInfo(p) {
      const sibs = CK.siblings(p);
      const pct = CK.discountPct(p);
      const isOut = p.status === 'out' || p.stock <= 0;
      const onReq = p.priceOnRequest || !p.price;
      const chart = SIZING ? SIZING.getChartForProduct(p, p.group) : null;
      const fitInfo = SIZING ? SIZING.getModelFit(p) : null;
      const sizes = (p.sizes && p.sizes.length ? p.sizes : (chart ? chart.sizes : ['38', '39', '40', '41', '42', '43', '44', '45'])).map(String);
      const outSizes = new Set((p.outOfStockSizes || []).map(String));
      const isInstock = p.orderMode === 'instock';
      const orderDays = p.orderDays || '12–15 ngày';
      const rawPrice = Number(p.price) || 0;
      const depositAmt = rawPrice >= 2000000 ? Math.round(rawPrice * 0.5) : (Number(p.deposit) || 500000);
      const depositText = rawPrice >= 2000000
        ? `Cọc 50% giá trị giày (${CK.formatVND(depositAmt)})`
        : `Cọc ${CK.formatVND(depositAmt)} / đôi`;
      const etaWindow = CK.orderEtaWindow(orderDays);

      document.title = `${p.name} — Cookie's Kicks`;
      document.getElementById('pdp-crumb').innerHTML = `
        <a href="index.html" class="hover:text-black hover:underline">Trang chủ</a><span>/</span>
        <a href="catalog.html?cat=${encodeURIComponent(p.category)}" class="hover:text-black hover:underline">${CK.esc(CK.catLabel(p.category))}</a><span>/</span>
        <a href="catalog.html?group=${encodeURIComponent(p.group || '')}" class="hover:text-black hover:underline">${CK.esc(p.model)}</a><span>/</span>
        <span class="text-black font-semibold">${CK.esc(p.dealName || p.colorName || p.name)}</span>`;

      const specsEntries = Object.entries(p.specs || {});
      const specsHtml = specsEntries.length
        ? `<dl class="divide-y divide-line text-xs">${specsEntries.map(([k, v]) => `
            <div class="py-2.5 flex justify-between gap-4">
              <dt class="text-muted font-medium">${CK.esc(k)}</dt>
              <dd class="font-semibold text-black text-right">${CK.esc(v)}</dd>
            </div>`).join('')}</dl>`
        : '<p class="text-xs text-muted">Hàng order chính hãng 100% New Fullbox.</p>';

      document.getElementById('pdp-info').innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-medium text-charcoal">${CK.esc(p.brand)} · ${CK.esc(CK.catLabel(p.category))}</span>
            <span>·</span>
            ${isOut
              ? '<span class="ck-status-out">Tạm hết hàng</span>'
              : isInstock
                ? `<span class="ck-status-instock">Sẵn hàng tại Huế (${p.stock} đôi)</span>`
                : `<span class="ck-status-instock">Chính hãng · Giao ${CK.esc(orderDays)}</span>`}
          </div>
          <span class="tabular-nums">Mã: CK-${String(p.id).padStart(3, '0')}</span>
        </div>

        <div>
          <h1 class="ck-display text-2xl sm:text-3xl text-black">${CK.esc(p.dealName ? p.name : p.model)}</h1>
          <p class="text-sm text-muted mt-1.5">Phối màu: <b class="text-black font-medium">${CK.esc(p.colorName || 'Mặc định')}</b> · ${CK.esc(p.condition || 'New Fullbox')}</p>

          <div class="mt-4 pt-4 border-t border-line flex items-baseline gap-3">
            ${onReq
              ? `<a href="${CK.CONTACT.facebook}" target="_blank" rel="noopener" class="text-base font-semibold text-black underline underline-offset-4 hover:text-accent transition-colors">Liên hệ Fanpage nhận báo giá theo size →</a>`
              : `<span id="pdp-live-price" class="ck-price text-2xl font-semibold ${pct ? 'text-accent' : 'text-black'}">${CK.formatVND(p.price)}</span>
                 ${pct ? `<s class="text-sm text-muted tabular-nums">${CK.formatVND(p.originalPrice)}</s>` : ''}
                 ${pct ? `<span class="ck-tag ck-tag--sale">-${pct}%</span>` : ''}`}
          </div>
          ${p.conditionDetail ? `<p class="ck-meta mt-1.5">${CK.esc(p.conditionDetail)}</p>` : ''}
        </div>

        <div class="p-4 bg-[#F6F7F8] border border-line space-y-2 text-xs">
          <div class="flex items-center justify-between gap-2">
            <span class="font-semibold text-black">
              ${isInstock ? 'Sẵn hàng tại kho Huế' : `Đặt trước chính hãng (${CK.esc(orderDays)})`}
            </span>
            <span class="font-medium text-muted">${isInstock ? 'Giao nhanh 2h tại Huế' : 'Fullbox · Kiểm định 100%'}</span>
          </div>
          <div class="flex items-center justify-between text-charcoal pt-1.5 border-t border-line">
            <span class="text-muted">Dự kiến nhận giày:</span>
            <b class="font-medium text-black tabular-nums">${isInstock ? '1–3 ngày (GHN / Hoả tốc Huế)' : CK.esc(etaWindow)}</b>
          </div>
          <div class="flex items-center justify-between text-charcoal">
            <span class="text-muted">Thanh toán / Đặt cọc:</span>
            <b id="pdp-deposit-label" class="font-medium text-black tabular-nums">${depositText} (hoặc thanh toán 100%)</b>
          </div>
        </div>

        ${sibs.length > 1 ? `
          <div>
            <div class="flex items-center justify-between mb-2.5">
              <span class="ck-label text-black">Phối màu (${sibs.length})</span>
              <span class="ck-meta" id="pdp-color-preview">${CK.esc(p.colorName || p.name)}</span>
            </div>
            <div class="flex flex-wrap gap-2">
              ${sibs.map(s => `
                <a href="product.html?id=${encodeURIComponent(s.id)}" data-sib-id="${CK.esc(s.id)}" data-sib-label="${CK.esc(s.colorName || s.name)}"
                   class="ck-swatch ${s.id === p.id ? 'is-active' : ''}" title="${CK.esc(s.colorName || s.name)}">
                  <img src="${CK.esc(s.image || CK.FALLBACK_IMG)}" alt="${CK.esc(s.colorName || s.name)}" class="w-full h-full object-cover" />
                </a>`).join('')}
            </div>
          </div>` : ''}

        <div class="ck-size-wrap" id="pdp-size-wrap">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div class="flex flex-wrap items-center gap-2">
              <span class="ck-label text-black">Chọn Size ${CK.esc(chart ? chart.shortLabel : p.brand)} <span class="text-accent">*</span></span>
              ${fitInfo && fitInfo.fitBadge ? `<span class="px-2 py-0.5 bg-[#F6F7F8] border border-line text-[10px] font-bold uppercase tracking-wider text-charcoal">${CK.esc(fitInfo.fitBadge)}</span>` : ''}
            </div>
            <button type="button" id="open-size-guide" class="ck-link !text-[11px] font-bold text-black">Bảng size chuẩn ${CK.esc(chart ? chart.shortLabel : 'hãng')} &amp; Đo chân →</button>
          </div>

          <div class="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-line text-[11px]">
            <span class="text-muted">Hệ hiển thị trên ô chọn:</span>
            <div class="inline-flex border border-line bg-[#F6F7F8] p-0.5" id="pdp-unit-tabs" role="tablist" aria-label="Đơn vị hiển thị size">
              <button type="button" data-size-unit="eu" class="px-2.5 py-1 font-bold uppercase tracking-wider transition-colors ${sizeDisplayUnit === 'eu' ? 'bg-black text-white' : 'text-charcoal hover:text-black'}">EU</button>
              <button type="button" data-size-unit="us" class="px-2.5 py-1 font-bold uppercase tracking-wider transition-colors ${sizeDisplayUnit === 'us' ? 'bg-black text-white' : 'text-charcoal hover:text-black'}">US Nam</button>
              <button type="button" data-size-unit="cm" class="px-2.5 py-1 font-bold uppercase tracking-wider transition-colors ${sizeDisplayUnit === 'cm' ? 'bg-black text-white' : 'text-charcoal hover:text-black'}">CM Chân</button>
            </div>
          </div>

          <div class="grid grid-cols-3 sm:grid-cols-4 gap-2" id="pdp-size-grid" role="radiogroup" aria-label="Chọn size giày chính hãng">
            ${sizes.map(sz => {
              const szStr = String(sz);
              const disabled = isOut || outSizes.has(szStr);
              const szPrice = p.sizePrices && Number(p.sizePrices[szStr]) > 0 ? Number(p.sizePrices[szStr]) : null;
              const spec = SIZING ? SIZING.lookupSizeSpec(p, szStr) : null;
              let mainLbl = `EU ${szStr}`;
              let subLbl = spec ? `US ${spec.us} · ${spec.footCm.toFixed(1)}cm` : '';
              if (sizeDisplayUnit === 'us' && spec) {
                mainLbl = `US ${spec.us}`;
                subLbl = `EU ${szStr} · ${spec.footCm.toFixed(1)}cm`;
              } else if (sizeDisplayUnit === 'cm' && spec) {
                mainLbl = `${spec.footCm.toFixed(1)} cm`;
                subLbl = `EU ${szStr} · US ${spec.us}`;
              }
              return `
                <button type="button"
                  class="ck-chip !min-w-0 flex-col !h-auto py-2 px-1.5 ${disabled ? 'is-disabled' : ''} ${String(selectedSize) === szStr ? 'is-active' : ''}"
                  data-pick-size="${CK.esc(szStr)}" ${disabled ? 'disabled' : ''}>
                  <span class="ck-mono text-xs font-bold leading-tight">${CK.esc(mainLbl)}</span>
                  ${subLbl ? `<span class="ck-mono text-[10px] opacity-75 leading-tight mt-0.5">${CK.esc(subLbl)}</span>` : ''}
                  ${szPrice ? `<span class="ck-mono text-[10px] font-bold text-accent leading-tight mt-0.5">${Math.round(szPrice / 1000)}K</span>` : ''}
                </button>`;
            }).join('')}
          </div>

          <div id="pdp-size-spec-bar" class="mt-2.5 p-2.5 bg-[#F6F7F8] border border-line text-xs text-charcoal leading-relaxed">
            ${selectedSize && SIZING
              ? `<span class="font-bold text-black">Chuẩn hãng ${CK.esc(chart ? chart.label : p.brand)}:</span> <span class="ck-mono font-semibold text-black">${CK.esc(SIZING.formatSizeBadge(p, selectedSize, 'full'))}</span>`
              : `<span class="font-bold text-black">Tư vấn phom ${CK.esc(p.model)}:</span> ${CK.esc((fitInfo && fitInfo.fitAdvice) || 'Chọn đúng theo chiều dài bàn chân (cm) hoặc bảng size chính hãng.')}`}
          </div>

          <p id="pdp-size-err" class="ck-error-text hidden" role="alert">
            Vui lòng chọn kích cỡ (Size chính hãng) trước khi đặt order.
          </p>
          <div class="mt-2.5 px-3 py-2 bg-[#F6F7F8] border border-line text-[11px] text-charcoal leading-snug flex flex-wrap items-center justify-between gap-2">
            <span><b>Lưu ý chọn đúng Size:</b> Không hoàn/đổi nếu chọn sai size · Lỗi NSX đổi 1:1 (chờ 10–12 ngày, chưa qua sử dụng).</span>
            <button type="button" data-open-policy="size" class="font-bold text-black underline whitespace-nowrap">Chi tiết quy định →</button>
          </div>
        </div>

        <div class="space-y-3 pt-1">
          ${onReq ? `
            <a href="${CK.CONTACT.facebook}" target="_blank" rel="noopener" class="ck-btn ck-btn--block">
              <span>Liên hệ Fanpage nhận báo giá</span>
              ${CK.ICON.arrow}
            </a>
            <button type="button" id="pdp-ask-btn" class="ck-btn ck-btn--ghost ck-btn--block justify-center">
              <span>Tư vấn thêm qua Messenger / Zalo</span>
            </button>`
          : isOut ? `
            <button type="button" class="ck-btn ck-btn--block is-disabled" disabled>
              <span>Tạm hết hàng — Liên hệ đặt trước</span>
            </button>`
          : `
            <div class="flex gap-2.5 sm:gap-3">
              <div class="flex items-center border border-black h-[46px] sm:h-[50px] flex-shrink-0">
                <button type="button" id="qty-dec" class="w-9 sm:w-11 h-full font-bold hover:bg-nike" aria-label="Giảm số lượng">−</button>
                <span id="qty-val" class="w-8 sm:w-10 text-center ck-mono text-sm font-bold">${qty}</span>
                <button type="button" id="qty-inc" class="w-9 sm:w-11 h-full font-bold hover:bg-nike" aria-label="Tăng số lượng">+</button>
              </div>
              <button type="button" id="pdp-add-btn" class="ck-btn flex-1 min-w-0">
                <span class="truncate">${isInstock ? 'Thêm vào giỏ hàng' : 'Thêm vào giỏ hàng'}</span>
                ${CK.ICON.arrow}
              </button>
            </div>
            <div class="grid grid-cols-[1fr_auto] gap-2.5 sm:gap-3">
              <button type="button" id="pdp-buy-now" class="ck-btn ck-btn--ghost justify-center min-w-0">
                <span class="truncate">${isInstock ? 'Mua ngay · Thanh toán VietQR' : (rawPrice >= 2000000 ? 'Đặt mua ngay · Cọc 50% giá trị giày' : 'Đặt mua ngay · Cọc từ 500K')}</span>
              </button>
              <button type="button" id="pdp-wish-btn" class="w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] border border-black inline-flex items-center justify-center hover:bg-nike ${CK.wish.has(p.id) ? 'bg-nike' : ''}" aria-label="Lưu yêu thích">
                ${CK.ICON.heart}
              </button>
            </div>`}
        </div>

        <div class="grid grid-cols-2 gap-2.5 p-3.5 bg-[#F6F7F8] border border-line text-xs">
          <div class="flex items-center gap-2 font-semibold text-black">${CK.ICON.shield} <span>100% Authentic Fullbox</span></div>
          <div class="flex items-center gap-2 font-semibold text-black">${CK.ICON.truck} <span>Order 12–15 Ngày Về Huế</span></div>
        </div>

        <div class="pt-2">
          <div class="ck-acc is-open" data-pacc>
            <button type="button" class="ck-acc__head"><span>Mô tả sản phẩm</span><span class="ck-acc__icon">${CK.ICON.chevron}</span></button>
            <div class="ck-acc__body"><div class="ck-acc__inner"><p class="pb-4 text-sm text-charcoal leading-relaxed">${CK.esc(p.description || '')}</p></div></div>
          </div>
          <div class="ck-acc is-open" data-pacc>
            <button type="button" class="ck-acc__head"><span>Thông số kỹ thuật</span><span class="ck-acc__icon">${CK.ICON.chevron}</span></button>
            <div class="ck-acc__body"><div class="ck-acc__inner"><div class="pb-4">${specsHtml}</div></div></div>
          </div>
          <div class="ck-acc" data-pacc>
            <button type="button" class="ck-acc__head"><span>Thanh toán VietQR / MoMo &amp; Đặt cọc Order</span><span class="ck-acc__icon">${CK.ICON.chevron}</span></button>
            <div class="ck-acc__body"><div class="ck-acc__inner"><p class="pb-4 text-xs text-muted leading-relaxed">Đơn hàng từ <b>2.000.000₫ trở lên (và trên 3.000.000₫)</b> đặt cọc tối thiểu <b>50% giá trị giày</b> (<b class="ck-mono text-black">${CK.formatVND(depositAmt)}</b>); đơn dưới 2 triệu đặt cọc 500.000₫/đôi hoặc chuyển khoản 100% qua VietQR MB Bank (<b class="ck-mono text-black">0988561909 · DANG GIA KHIEM</b>) và ví MoMo. Phần còn lại thanh toán khi nhận giày.</p></div></div>
          </div>
          <div class="ck-acc" data-pacc>
            <button type="button" class="ck-acc__head"><span>Quy trình Order 12–15 ngày &amp; Kiểm định</span><span class="ck-acc__icon">${CK.ICON.chevron}</span></button>
            <div class="ck-acc__body"><div class="ck-acc__inner"><p class="pb-4 text-xs text-muted leading-relaxed">Sau khi xác nhận cọc, Cookie's Kicks tiến hành đặt hàng trực tiếp từ hệ thống phân phối chính hãng quốc tế. Hàng về kho Huế sau 12–15 ngày, được kiểm định đường chỉ/keo/form và chụp ảnh thực tế gửi bạn trước khi ship GHN toàn quốc hoặc giao 2h nội thành Huế.</p></div></div>
          </div>
          <div class="ck-acc is-open" data-pacc>
            <button type="button" class="ck-acc__head"><span>Chính sách Chọn Size &amp; Bảo hành đổi 1:1 (10–12 ngày)</span><span class="ck-acc__icon">${CK.ICON.chevron}</span></button>
            <div class="ck-acc__body"><div class="ck-acc__inner"><div class="pb-4 text-xs text-charcoal leading-relaxed space-y-1.5">
              <p>• <b>Chọn đúng Size EU:</b> Hàng Order đặt riêng theo size khách chọn — <b>không hoàn hàng hay đổi size nếu khách chọn sai size</b>.</p>
              <p>• <b>Lỗi NSX / Lỗi Shop:</b> Hỗ trợ <b>đổi mới 1:1 miễn phí</b>, thời gian chờ đặt lại đôi mới từ <b>10–12 ngày</b>.</p>
              <p>• <b>Điều kiện bắt buộc:</b> Giày <b>chưa qua sử dụng</b> (đế sạch nguyên trạng, còn nguyên tag/tem &amp; Fullbox). Trường hợp đã sử dụng tuyệt đối không đổi.</p>
            </div></div></div>
          </div>
        </div>
      `;

      bindInfoEvents(p);
    }

    function triggerSizeValidationShake() {
      const wrap = document.getElementById('pdp-size-wrap');
      const err = document.getElementById('pdp-size-err');
      if (!wrap || !err) return;
      wrap.classList.add('is-invalid');
      err.classList.remove('hidden');
      wrap.classList.remove('ck-shake');
      void wrap.offsetWidth;
      wrap.classList.add('ck-shake');
      wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function bindInfoEvents(p) {
      const info = document.getElementById('pdp-info');

      const previewLbl = document.getElementById('pdp-color-preview');
      info.querySelectorAll('[data-sib-id]').forEach(sw => {
        sw.addEventListener('mouseenter', () => {
          if (previewLbl) previewLbl.textContent = sw.getAttribute('data-sib-label');
        });
        sw.addEventListener('mouseleave', () => {
          if (previewLbl) previewLbl.textContent = p.colorName || p.name;
        });
        sw.addEventListener('click', e => {
          e.preventDefault();
          const nextId = Number(sw.getAttribute('data-sib-id'));
          if (nextId === p.id) return;
          history.pushState(null, '', `product.html?id=${nextId}`);
          loadProduct(nextId, true);
        });
      });

      info.querySelectorAll('[data-size-unit]').forEach(uBtn => {
        uBtn.addEventListener('click', () => {
          sizeDisplayUnit = uBtn.getAttribute('data-size-unit') || 'eu';
          renderInfo(p);
          initStickyMobileBar();
        });
      });

      info.querySelectorAll('[data-pick-size]').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedSize = String(btn.getAttribute('data-pick-size') || '').trim();
          info.querySelectorAll('[data-pick-size]').forEach(b => b.classList.toggle('is-active', b === btn));
          document.getElementById('pdp-size-wrap').classList.remove('is-invalid', 'ck-shake');
          document.getElementById('pdp-size-err').classList.add('hidden');
          const priceEl = document.getElementById('pdp-live-price');
          const stickyPrice = document.getElementById('pdp-sticky-price');
          if (!p.priceOnRequest) {
            const szP = CK.priceForSize(p, selectedSize);
            const formatted = CK.formatVND(szP);
            if (priceEl) priceEl.textContent = formatted;
            if (stickyPrice) stickyPrice.textContent = formatted;
            const depLbl = document.getElementById('pdp-deposit-label');
            if (depLbl) {
              const szDep = szP >= 2000000 ? Math.round(szP * 0.5) : (Number(p.deposit) || 500000);
              depLbl.textContent = (szP >= 2000000 ? `Cọc 50% giá trị giày (${CK.formatVND(szDep)})` : `Cọc ${CK.formatVND(szDep)} / đôi`) + ' (hoặc thanh toán 100%)';
            }
          }
          const specBar = document.getElementById('pdp-size-spec-bar');
          if (specBar && SIZING) {
            const chart = SIZING.getChartForProduct(p, p.group);
            specBar.innerHTML = `<span class="font-bold text-black">✓ Chuẩn hãng ${CK.esc(chart.label)}:</span> <span class="ck-mono font-semibold text-black">${CK.esc(SIZING.formatSizeBadge(p, selectedSize, 'full'))}</span>`;
          }
        });
      });

      const sgBtn = document.getElementById('open-size-guide');
      if (sgBtn) {
        sgBtn.addEventListener('click', () => {
          if (SIZING) {
            activeSgChartKey = SIZING.getChartForProduct(p, p.group).key;
            renderSizeGuideModal();
          }
          document.getElementById('size-guide-modal').classList.add('is-open');
        });
      }

      const dec = document.getElementById('qty-dec');
      const inc = document.getElementById('qty-inc');
      const valEl = document.getElementById('qty-val');
      if (dec && inc && valEl) {
        dec.addEventListener('click', () => { qty = Math.max(1, qty - 1); valEl.textContent = qty; });
        inc.addEventListener('click', () => { qty = Math.min(Math.max(1, p.stock || 5), qty + 1); valEl.textContent = qty; });
      }

      const addBtn = document.getElementById('pdp-add-btn');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          if (!selectedSize) {
            triggerSizeValidationShake();
            return;
          }
          CK.addToCart(addBtn, {
            id: p.id,
            size: selectedSize,
            colorway: p.colorName || (p.colorways[0] && p.colorways[0].name),
            qty,
          });
        });
      }

      const buyBtn = document.getElementById('pdp-buy-now');
      if (buyBtn) {
        buyBtn.addEventListener('click', () => {
          if (!selectedSize) {
            triggerSizeValidationShake();
            return;
          }
          CK.cart.add({
            id: p.id,
            size: selectedSize,
            colorway: p.colorName || (p.colorways[0] && p.colorways[0].name),
            qty,
          }, { silent: true });
          if (CK.requireAuth) {
            CK.requireAuth(() => { location.href = 'checkout.html'; }, 'Vui lòng đăng nhập tài khoản trước khi đặt mua!');
          } else {
            location.href = 'checkout.html';
          }
        });
      }

      const askBtn = document.getElementById('pdp-ask-btn');
      if (askBtn) askBtn.addEventListener('click', () => CK.askPrice(p));

      const wishBtn = document.getElementById('pdp-wish-btn');
      if (wishBtn) {
        const syncWishSvg = on => {
          const svg = wishBtn.querySelector('svg');
          if (svg) svg.style.fill = on ? '#000000' : 'none';
        };
        syncWishSvg(CK.wish.has(p.id));
        wishBtn.addEventListener('click', () => {
          const on = CK.wish.toggle(p.id);
          wishBtn.classList.toggle('bg-nike', on);
          syncWishSvg(on);
        });
      }

      info.querySelectorAll('[data-pacc] .ck-acc__head').forEach(head => {
        head.addEventListener('click', () => head.closest('[data-pacc]').classList.toggle('is-open'));
      });
    }

    function renderCarousels(p) {
      const all = CK.getProducts();
      const related = all
        .filter(x => x.id !== p.id && (x.category === p.category || x.brand === p.brand))
        .slice(0, 10);
      document.getElementById('rel-track').innerHTML = related.map(x => CK.productCard(x)).join('');
      if (relCarousel) requestAnimationFrame(() => relCarousel.update());

      const recentIds = (CK.read(RECENT_KEY, []) || []).filter(id => id !== p.id);
      const recentList = recentIds.map(id => CK.getProduct(id)).filter(Boolean);
      const recSec = document.getElementById('recent-sec');
      if (!recentList.length) {
        recSec.classList.add('hidden');
      } else {
        recSec.classList.remove('hidden');
        document.getElementById('rec-track').innerHTML = recentList.map(x => CK.productCard(x)).join('');
        if (recCarousel) requestAnimationFrame(() => recCarousel.update());
      }
    }

    function renderSizeGuideModal() {
      if (!SIZING) return;
      const charts = SIZING.CHARTS;
      const chart = charts[activeSgChartKey] || charts.nike_jordan;
      const prodChartKey = currentProduct ? SIZING.getChartForProduct(currentProduct, currentProduct.group).key : 'nike_jordan';
      const isCurrentProdBrand = chart.key === prodChartKey;

      const tabsEl = document.getElementById('sg-brand-tabs');
      const cmInp = document.getElementById('sg-cm-input');
      const widthSel = document.getElementById('sg-width-select');
      const recBar = document.getElementById('sg-rec-bar');
      const noteEl = document.getElementById('sg-brand-note');
      const theadEl = document.getElementById('sg-thead');
      const tbodyEl = document.getElementById('sg-tbody');
      const srcEl = document.getElementById('sg-source-note');
      const titleEl = document.getElementById('sg-title');

      titleEl.textContent = chart.officialTitle.toUpperCase();

      tabsEl.innerHTML = Object.values(charts).map(c => {
        const on = c.key === chart.key;
        const badge = currentProduct && c.key === prodChartKey ? ' · Đôi đang xem' : '';
        return `<button type="button" data-sg-tab="${CK.esc(c.key)}" class="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${on ? 'bg-black text-white border-black' : 'bg-white text-charcoal border-line hover:border-black'}">${CK.esc(c.shortLabel)}${CK.esc(badge)}</button>`;
      }).join('');

      const cmVal = parseFloat(cmInp.value);
      const wVal = widthSel.value || 'normal';
      const targetModel = isCurrentProdBrand && currentProduct ? currentProduct : chart.key;
      const rec = SIZING.recommendSize(cmVal, wVal, targetModel);

      if (rec) {
        const canApply = isCurrentProdBrand && currentProduct && (currentProduct.sizes || []).map(String).includes(String(rec.eu)) && !(currentProduct.outOfStockSizes || []).map(String).includes(String(rec.eu));
        recBar.innerHTML = `
          <div>
            <span class="text-muted">Đề xuất chuẩn cho chân <b class="ck-mono text-black">${rec.measuredCm.toFixed(1)} cm</b> (${isCurrentProdBrand && currentProduct ? CK.esc(currentProduct.model) : CK.esc(chart.label)}):</span>
            <span class="ck-mono font-bold text-sm text-accent ml-1">EU ${CK.esc(rec.eu)} · US ${CK.esc(rec.us)} · UK ${CK.esc(rec.uk)} (${CK.esc(rec.tag)})</span>
          </div>
          ${canApply ? `<button type="button" id="sg-apply-size" data-apply-eu="${CK.esc(rec.eu)}" class="ck-btn ck-btn--sm">Chọn ngay EU ${CK.esc(rec.eu)} →</button>` : ''}`;
      } else {
        recBar.innerHTML = `<span class="text-muted">Nhập chiều dài bàn chân từ 21.0 cm – 31.0 cm để hệ thống gợi ý size chính xác.</span>`;
      }

      noteEl.innerHTML = `<b>Lưu ý chuẩn hãng ${CK.esc(chart.label)}:</b> ${CK.esc(chart.brandNote)}`;
      theadEl.innerHTML = `<tr><th>Size EU</th><th>US Nam</th><th>UK</th><th>${CK.esc(chart.tagColLabel)}</th><th>${CK.esc(chart.footColLabel)}</th></tr>`;
      tbodyEl.innerHTML = chart.rows.map(r => {
        const isRec = rec && String(rec.eu) === String(r.eu);
        const isPicked = isCurrentProdBrand && selectedSize && String(selectedSize) === String(r.eu);
        return `
          <tr class="${isRec ? 'bg-[#FFF7ED]' : (isPicked ? 'bg-nike' : '')}" data-sg-row-eu="${CK.esc(r.eu)}">
            <td class="font-bold text-black">${CK.esc(r.eu)} ${isRec ? '<span class="ml-1 px-1.5 py-0.5 bg-accent text-white text-[9px] uppercase font-sans">Gợi ý</span>' : ''}</td>
            <td>${CK.esc(r.us)}</td>
            <td>${CK.esc(r.uk)}</td>
            <td>${CK.esc(r.tag)}</td>
            <td class="font-semibold text-black">${r.footCm.toFixed(1)} cm</td>
          </tr>`;
      }).join('');
      srcEl.textContent = `Nguồn thông số đối chiếu chính thức: ${chart.sourceDomain}`;

      tabsEl.querySelectorAll('[data-sg-tab]').forEach(b => {
        b.addEventListener('click', () => {
          activeSgChartKey = b.getAttribute('data-sg-tab');
          renderSizeGuideModal();
        });
      });

      const applyBtn = document.getElementById('sg-apply-size');
      if (applyBtn && currentProduct) {
        applyBtn.addEventListener('click', () => {
          selectedSize = String(applyBtn.getAttribute('data-apply-eu') || '').trim();
          document.getElementById('size-guide-modal').classList.remove('is-open');
          renderInfo(currentProduct);
          CK.toast(`Đã chọn chuẩn Size EU ${selectedSize} (${currentProduct.brand})`, 'success');
        });
      }
    }

    document.getElementById('sg-cm-input').addEventListener('input', renderSizeGuideModal);
    document.getElementById('sg-width-select').addEventListener('change', renderSizeGuideModal);

    function loadProduct(id, keepScroll) {
      const p = CK.getProduct(id) || CK.getProducts()[0];
      if (!p) return;
      const prevId = currentProduct ? currentProduct.id : null;
      currentProduct = p;
      const urlSz = new URLSearchParams(location.search).get('size');
      if (prevId !== p.id) {
        const cleanUrlSz = urlSz ? String(urlSz).trim() : '';
        const outSet = new Set((p.outOfStockSizes || []).map(String));
        selectedSize = cleanUrlSz && (p.sizes || []).map(String).includes(cleanUrlSz) && !outSet.has(cleanUrlSz) && p.status !== 'out' && Number(p.stock) !== 0
          ? cleanUrlSz
          : null;
      }
      qty = 1;
      pushRecent(p.id);
      renderGallery(p);
      renderInfo(p);
      renderCarousels(p);
      initStickyMobileBar();
      if (CK.renderLegitReviews) {
        CK.renderLegitReviews('#pdp-legit-reviews', {
          productId: p.id,
          group: p.group || '',
          limit: 3,
          title: 'FEEDBACK KHÁCH ĐÃ NHẬN GIÀY & CHECK AUTH',
        });
      }
      if (!keepScroll) window.scrollTo({ top: 0 });
    }

    let stickyObs = null;
    function initStickyMobileBar() {
      const bar = document.getElementById('pdp-sticky-bar');
      const addBtn = document.getElementById('pdp-add-btn');
      const stickyTitle = document.getElementById('pdp-sticky-title');
      const stickyPrice = document.getElementById('pdp-sticky-price');
      const stickyBtn = document.getElementById('pdp-sticky-btn');
      if (!bar || !stickyBtn) return;

      if (currentProduct) {
        if (stickyTitle) stickyTitle.textContent = currentProduct.name;
        if (stickyPrice) {
          stickyPrice.textContent = currentProduct.priceOnRequest ? 'Inbox for details' : CK.formatVND(CK.priceForSize(currentProduct, selectedSize));
        }
      }

      if (stickyObs) { stickyObs.disconnect(); stickyObs = null; }
      const anchorEl = addBtn || document.getElementById('pdp-ask-btn') || document.getElementById('pdp-size-wrap');
      if (anchorEl && 'IntersectionObserver' in window) {
        stickyObs = new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
            bar.classList.remove('translate-y-full', 'pointer-events-none');
            bar.setAttribute('aria-hidden', 'false');
          } else {
            bar.classList.add('translate-y-full', 'pointer-events-none');
            bar.setAttribute('aria-hidden', 'true');
          }
        }, { threshold: 0 });
        stickyObs.observe(anchorEl);
      }

      const isOutProduct = !currentProduct || currentProduct.status === 'out' || Number(currentProduct.stock) === 0;
      if (currentProduct && currentProduct.priceOnRequest) {
        stickyBtn.disabled = false;
        stickyBtn.classList.remove('is-disabled');
        stickyBtn.textContent = 'Nhận báo giá';
        stickyBtn.onclick = () => CK.askPrice(currentProduct);
      } else if (isOutProduct) {
        stickyBtn.disabled = true;
        stickyBtn.classList.add('is-disabled');
        stickyBtn.textContent = 'Tạm hết hàng';
        stickyBtn.onclick = null;
      } else {
        stickyBtn.disabled = false;
        stickyBtn.classList.remove('is-disabled');
        stickyBtn.textContent = 'Đặt Order';
        stickyBtn.onclick = () => {
          if (!selectedSize) {
            triggerSizeValidationShake();
          } else if (addBtn) {
            addBtn.click();
          }
        };
      }
    }

    document.getElementById('size-guide-modal').addEventListener('click', e => {
      if (e.target.closest('[data-sg-close]')) document.getElementById('size-guide-modal').classList.remove('is-open');
    });
    document.getElementById('zoom-modal').addEventListener('click', e => {
      if (e.target.closest('[data-zm-close]')) document.getElementById('zoom-modal').classList.remove('is-open');
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.getElementById('size-guide-modal').classList.remove('is-open');
        document.getElementById('zoom-modal').classList.remove('is-open');
      }
    });
    window.addEventListener('popstate', () => loadProduct(getRequestedId(), false));
    window.addEventListener('ck:products-synced', () => {
      if (currentProduct) loadProduct(currentProduct.id, true);
    });

    loadProduct(getRequestedId(), false);
  });

if (window.CK_FEATURES && window.CK_FEATURES["product"] && window.CK_FEATURES["product"].markMounted) { window.CK_FEATURES["product"].markMounted(); }
