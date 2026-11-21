document.addEventListener('DOMContentLoaded', () => {
    let allProducts = CK.getProducts();
    const params = new URLSearchParams(location.search);

    const WOMEN_IDS = new Set([1, 3, 9, 11, 14, 15, 16, 20, 24, 26, 29, 30, 33, 35, 36, 38, 39]);
    const YOUTH_IDS = new Set([2, 3, 8, 9, 13, 15, 16, 17, 25, 26, 31, 38]);

    const CN_BRANDS = new Set(['Way of Wade', 'Li-Ning', 'Anta', '361°', 'Kailas', 'Xtep', 'Qiaodan', 'SPO', 'Rigorer', 'Peak', 'Volanti']);

    const state = {
      q: (params.get('q') || '').trim(),
      gender: (params.get('gender') || '').toLowerCase(),
      origin: (params.get('origin') || '').toLowerCase(),
      group: params.get('group') || '',
      cat: params.get('cat') || '',
      brands: params.get('brand') ? [params.get('brand')] : [],
      tag: (params.get('tag') || '').toUpperCase(),
      size: params.get('size') ? (CK.sizing ? CK.sizing.normalizeSizeStr(params.get('size')) : String(params.get('size')).trim()) : null,
      priceRange: (() => {
        const min = params.get('min'), max = params.get('max'), pr = params.get('price') || '';
        if (pr) return pr;
        if (!min && max === '2000000') return 'under2m';
        if (min === '2000000' && max === '3000000') return '2to3m';
        if (min === '2000000' && !max) return 'from2m';
        if (min === '3000000' && !max) return 'over3m';
        return '';
      })(),
      onlyPriced: false,
      wish: params.get('wish') === '1',
      sort: params.get('sort') || 'featured',
      aspect: '1:1',
      sidebarHidden: false,
      openAcc: { cat: true, brand: true, size: true, price: true, line: true },
    };

    const BRAND_ORDER = ['Way of Wade', 'Li-Ning', 'Anta', '361°', 'Kailas', 'Xtep', 'Qiaodan', 'Yonex', 'Victor', 'Asics', 'SPO', 'Rigorer', 'Peak', 'Volanti', 'Nike', 'Jordan', 'Adidas', 'Shimano'];
    let allBrands = Array.from(new Set(allProducts.map(p => p.brand))).sort((a, b) => {
      const ia = BRAND_ORDER.indexOf(a);
      const ib = BRAND_ORDER.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
    const allSizes = ['38', '38.5', '39', '39.5', '40', '40.5', '41', '41.5', '42', '42.5', '43', '43.5', '44', '44.5', '45', '45.5', '46'];
    const PRICE_OPTS = [
      ['', 'Tất cả mức giá'],
      ['under2m', 'Dưới 2.000.000₫ (Cọc 500K)'],
      ['from2m', 'Từ 2.000.000₫ trở lên (Cọc 50%)'],
      ['2to3m', '2.000.000₫ – 3.000.000₫ (Cọc 50%)'],
      ['over3m', 'Trên 3.000.000₫ (Cọc 50%)'],
      ['inbox', 'Báo giá theo Size (Flagship / Protro)'],
    ];
    const LINE_OPTS = [
      ['', `Tất cả dòng giày (${allProducts.length})`],
      ['wow12', 'Dwyane Wade — Way of Wade 12'],
      ['wow11', 'Dwyane Wade — Way of Wade 11'],
      ['wow10low', 'Dwyane Wade — Way of Wade 10 Low'],
      ['wade808', 'Dwyane Wade — Way of Wade 808 5 Ultra'],
      ['allcity14', 'Dwyane Wade — Way of Wade All City 14'],
      ['allcity13', 'Dwyane Wade — Way of Wade All City 13'],
      ['wadeshadow5', 'Dwyane Wade — Way of Wade Shadow 5'],
      ['kobe3', 'Kobe Bryant — Nike Kobe 3 Low Protro'],
      ['kobe5', 'Kobe Bryant — Nike Kobe 5 Protro'],
      ['kobe6', 'Kobe Bryant — Nike Kobe 6 Protro'],
      ['kobe8', 'Kobe Bryant — Nike Kobe 8 Protro'],
      ['kobe9', 'Kobe Bryant — Nike Kobe 9 Protro'],
      ['kobe10', 'Kobe Bryant — Nike Kobe 10 Protro'],
      ['kobe11', 'Kobe Bryant — Nike Kobe 11'],
      ['kd18', 'Kevin Durant — Nike KD 18 EP'],
      ['ja3', 'Ja Morant — Nike Ja 3'],
      ['lebron23', 'LeBron James — Nike LeBron 23'],
      ['book2', 'Devin Booker — Nike Book 2 EP'],
      ['book1', 'Devin Booker — Nike Book 1'],
      ['sabrina4', 'Sabrina Ionescu — Nike Sabrina 4 EP'],
      ['sabrina2', 'Sabrina Ionescu — Nike Sabrina 2'],
      ['immortality4', 'Giannis — Nike Immortality 4'],
      ['tatum4', 'Jayson Tatum — Jordan Tatum 4'],
      ['kai2', 'Kyrie Irving — Anta Kai 2'],
      ['kai3', 'Kyrie Irving — Anta Kai 3 "CNY"'],
      ['kt10', 'Klay Thompson — Anta KT10'],
      ['kt9', 'Klay Thompson — Anta KT9'],
      ['ktsplash6', 'Klay Thompson — Anta KT Splash 6'],
      ['joker2gt', 'Nikola Jokić — 361° Joker 2 GT'],
      ['ag5pro', 'Aaron Gordon — 361° AG 5'],
      ['dvd2', 'Spencer Dinwiddie — 361° DVD 2'],
      ['ar2pro', 'Austin Reaves — Rigorer AR 2 (Top 40)'],
      ['ar2', 'Austin Reaves — Rigorer AR 2 (Sẵn giá)'],
      ['ar1', 'Austin Reaves — Rigorer AR 1'],
      ['gamma2', 'Li-Ning Gamma 2 (~290g Flagship)'],
      ['yushuai18', 'Li-Ning YuShuai 18 Ultra'],
      ['liren6v2', 'Li-Ning Liren 6 V2'],
      ['liren5low', 'Li-Ning Liren 5 Low'],
      ['sonic12pro', 'Li-Ning Sonic 12'],
      ['badfive3', 'Li-Ning BadFive 3'],
      ['aj39', 'Jordan — Air Jordan 39'],
      ['gtcut3', 'Nike — G.T. Cut 3'],
      ['gtcutacademy2', 'Nike — G.T. Cut Academy 2 EP'],
      ['spo15', 'SPO — Player 1.5'],
      ['spogame1', 'SPO — Game 1'],
      ['big3quick', '361° — BIG3 5.0 Quick Pro'],
      ['sw8pro', 'Anta — Shock Wave 8 Pro'],
      ['sw7', 'Anta — Shock Wave 7'],
      ['taichi5', 'Peak — Taichi Flash 6.0'],
      ['volanti911', 'Volanti — 911 Rocket Air'],
      ['bladedf01', 'Cầu Lông — Li-Ning Blade II Pro / Ace V2'],
      ['yunting', 'Cầu Lông — Li-Ning Thunder II Pro'],
      ['halbertec', 'Cầu Lông — Li-Ning Halberd III / Saga III Pro'],
      ['yonex65z3', 'Cầu Lông — Yonex Power Cushion 65Z4 & 65Z3'],
      ['victora970', 'Cầu Lông — Victor A970 NitroLite'],
      ['feidian5', 'Running — Li-Ning Feidian 6 Elite Carbon'],
      ['xtep160x6', 'Running — Xtep 160X 8.0 Pro & Ultra Carbon'],
      ['qiaodanplaid', 'Running — Qiaodan Feiying Plaid 3.0 Carbon'],
      ['flame4', 'Running — 361° Flame 4.0 Carbon'],
      ['c2026', 'Running — Anta C2026 Carbon'],
      ['adiospro4', 'Running — Adidas Adizero Adios Pro 4'],
      ['kailasfugaex3', 'Trail — Kailas Fuga EX 3 & EX 330 Vibram'],
      ['kailasfugadu', 'Trail — Kailas Fuga DU 2 & DU Monster Vibram'],
      ['zegama2', 'Trail — Nike ZoomX Zegama Trail 2'],
      ['courtff3', 'Tennis & Pickleball — Asics Court FF 3 Novak'],
      ['gelres9', 'Tennis & Pickleball — Asics Gel-Resolution X'],
      ['vapor12', 'Tennis & Pickleball — Nike Court Vapor Pro 3 HC'],
      ['rc502', 'Cycling — Shimano RC502 Road BOA'],
    ];

    function buildFilterTree(prefix) {
      const acc = (key, title, bodyHtml) => `
        <div class="ck-acc ${state.openAcc[key] !== false ? 'is-open' : ''}" data-facc="${key}">
          <button type="button" class="ck-acc__head">
            <span>${title}</span>
            <span class="ck-acc__icon">${CK.ICON.chevron}</span>
          </button>
          <div class="ck-acc__body">
            <div class="ck-acc__inner"><div class="pb-4">${bodyHtml}</div></div>
          </div>
        </div>`;

      const catCounts = ['Basketball', 'Badminton', 'Running', 'Trail', 'Tennis', 'Cycling'].map(c => [
        c,
        CK.catLabel(c),
        allProducts.filter(p => p.category === c).length,
      ]);

      return `
        ${acc('cat', 'Bộ môn (6 Môn)', `
          <div class="space-y-2">
            <label class="flex items-center justify-between text-sm cursor-pointer">
              <span class="flex items-center gap-2.5"><input type="radio" name="${prefix}-cat" value="" class="ck-check" ${!state.cat ? 'checked' : ''} data-f-cat /><span>Tất cả bộ môn</span></span>
              <span class="ck-mono text-xs text-muted">${allProducts.length}</span>
            </label>
            ${catCounts.map(([val, lbl, cnt]) => `
              <label class="flex items-center justify-between text-sm cursor-pointer">
                <span class="flex items-center gap-2.5"><input type="radio" name="${prefix}-cat" value="${val}" class="ck-check" ${state.cat === val ? 'checked' : ''} data-f-cat /><span>${lbl}</span></span>
                <span class="ck-mono text-xs text-muted">${cnt}</span>
              </label>`).join('')}
          </div>`)}

        ${acc('brand', `Thương hiệu (${allBrands.length} Hãng)`, `
          <div class="space-y-2">
            ${allBrands.map(b => {
              const cnt = allProducts.filter(p => p.brand === b).length;
              const checked = state.brands.includes(b);
              return `
                <label class="flex items-center justify-between text-sm cursor-pointer">
                  <span class="flex items-center gap-2.5"><input type="checkbox" value="${CK.esc(b)}" class="ck-check" ${checked ? 'checked' : ''} data-f-brand /><span>${CK.esc(b)}</span></span>
                  <span class="ck-mono text-xs text-muted">${cnt}</span>
                </label>`;
            }).join('')}
          </div>`)}

        ${acc('line', 'Dòng Signature & Performance', `
          <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
            ${LINE_OPTS.map(([val, lbl]) => `
              <label class="flex items-center gap-2.5 text-sm cursor-pointer">
                <input type="radio" name="${prefix}-line" value="${val}" class="ck-check" ${state.group === val ? 'checked' : ''} data-f-group />
                <span>${lbl}</span>
              </label>`).join('')}
          </div>`)}

        ${acc('size', 'Kích cỡ (EU chuẩn Hãng)', (() => {
          const sizeChips = state.size && !allSizes.includes(String(state.size))
            ? allSizes.concat([String(state.size)]).sort((a, b) => (CK.sizing ? CK.sizing.parseEuNum(a) - CK.sizing.parseEuNum(b) : 0))
            : allSizes;
          return `
          <div class="grid grid-cols-4 gap-1.5">
            ${sizeChips.map(sz => `
              <button type="button" class="ck-chip !min-w-0 !px-1 !h-9 !text-xs ${String(state.size) === String(sz) ? 'is-active' : ''}" data-f-size="${CK.esc(sz)}">${CK.esc(sz)}</button>`).join('')}
          </div>
          <p class="text-[11px] text-muted mt-2.5 leading-snug">Tự động khớp cả size phân số tương đương (VD: lọc <b>42.5</b> hiển thị cả Adidas <b>42 2/3</b> &amp; Li-Ning <b>42 1/3</b>).</p>
          <a href="posts.html#size-calc-section" class="inline-block mt-2 text-[11px] font-bold uppercase tracking-wider text-black underline underline-offset-4">Đo chân &amp; Bảng size 10 chuẩn Hãng →</a>`;
        })())}

        ${acc('price', 'Khoảng giá', `
          <div class="space-y-2">
            ${PRICE_OPTS.map(([val, lbl]) => `
              <label class="flex items-center gap-2.5 text-sm cursor-pointer">
                <input type="radio" name="${prefix}-price" value="${val}" class="ck-check" ${state.priceRange === val ? 'checked' : ''} data-f-price />
                <span>${lbl}</span>
              </label>`).join('')}
            <div class="pt-2 mt-2 border-t border-line space-y-2">
              <label class="flex items-center gap-2.5 text-sm cursor-pointer">
                <input type="checkbox" class="ck-check" ${state.tag === 'DEAL' ? 'checked' : ''} data-f-deal />
                <span class="text-accent font-semibold">Chỉ Today's Deal</span>
              </label>
              <label class="flex items-center gap-2.5 text-sm cursor-pointer">
                <input type="checkbox" class="ck-check" ${state.wish ? 'checked' : ''} data-f-wish />
                <span>Danh sách yêu thích</span>
              </label>
            </div>
          </div>`)}
      `;
    }

    function renderFilters() {
      document.getElementById('desktop-filter-mount').innerHTML = buildFilterTree('d');
      document.getElementById('mobile-filter-mount').innerHTML = buildFilterTree('m');
    }

    function filterProducts() {
      return allProducts.filter(p => {
        if (state.wish && !CK.wish.has(p.id)) return false;
        if (state.gender === 'nu' && !WOMEN_IDS.has(p.id)) return false;
        if (state.gender === 'tre-em' && !YOUTH_IDS.has(p.id)) return false;
        if ((state.origin === 'flagship' || state.origin === 'cn') && Number(p.id) <= 40 && !CN_BRANDS.has(p.brand)) return false;
        if (state.group && p.group !== state.group) return false;
        if (state.cat && p.category !== state.cat) return false;
        if (state.brands.length && !state.brands.includes(p.brand)) return false;
        if (state.tag === 'DEAL' || state.tag === 'SALE') {
          if (p.tag !== 'DEAL' && p.tag !== 'SALE') return false;
        } else if (state.tag && p.tag !== state.tag) {
          return false;
        }
        if (state.size) {
          const outSet = new Set((p.outOfStockSizes || []).map(s => String(s)));
          const inStockSizes = (p.sizes || []).map(s => String(s)).filter(s => !outSet.has(s));
          const matched = CK.sizing && CK.sizing.matchesFilterBucket
            ? CK.sizing.matchesFilterBucket(inStockSizes, state.size)
            : inStockSizes.includes(String(state.size));
          if (!matched) return false;
        }
        if (state.priceRange) {
          const onReq = p.priceOnRequest || !p.price;
          if (state.priceRange === 'inbox') {
            if (!onReq) return false;
          } else {
            if (onReq) return false;
            if (state.priceRange === 'under2m' && p.price >= 2000000) return false;
            if (state.priceRange === 'from2m' && p.price < 2000000) return false;
            if (state.priceRange === '2to3m' && (p.price < 2000000 || p.price > 3000000)) return false;
            if (state.priceRange === 'over3m' && p.price <= 3000000) return false;
          }
        }
        if (state.q) {
          const hay = `${p.name} ${p.model} ${p.brand} ${p.colorName || ''} ${p.dealName || ''} ${p.category}`.toLowerCase();
          if (!hay.includes(state.q.toLowerCase())) return false;
        }
        return true;
      });
    }

    function sortProducts(list) {
      const arr = list.slice();
      if (state.sort === 'price-asc') {
        arr.sort((a, b) => {
          const ar = a.priceOnRequest || !a.price, br = b.priceOnRequest || !b.price;
          if (ar !== br) return ar ? 1 : -1;
          return a.price - b.price;
        });
      } else if (state.sort === 'price-desc') {
        arr.sort((a, b) => {
          const ar = a.priceOnRequest || !a.price, br = b.priceOnRequest || !b.price;
          if (ar !== br) return ar ? 1 : -1;
          return b.price - a.price;
        });
      } else if (state.sort === 'newest') {
        arr.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      }
      return arr;
    }

    function updateHeading(count) {
      let title = 'Tất cả giày chính hãng';
      let crumb = 'Tất cả giày';
      let eye = 'Danh mục chính hãng';

      if (state.wish) { title = 'Danh sách yêu thích'; crumb = 'Yêu thích'; eye = 'Đã lưu'; }
      else if (state.q) { title = `Kết quả cho "${state.q}"`; crumb = `Tìm kiếm: ${state.q}`; eye = 'Kết quả tìm kiếm'; }
      else if (state.group && window.CK_MODELS && window.CK_MODELS[state.group]) {
        title = window.CK_MODELS[state.group].model;
        crumb = title;
        eye = window.CK_MODELS[state.group].brand;
      } else if (state.tag === 'DEAL' || state.tag === 'SALE') {
        title = 'Ưu đãi theo đợt';
        crumb = 'Ưu đãi';
        eye = 'Giá tốt trong tuần';
      } else if (state.gender === 'nu') {
        title = 'Giày nữ & phối màu sáng';
        crumb = 'Nữ';
        eye = 'Dành cho nữ';
      } else if (state.gender === 'tre-em') {
        title = 'Giày trẻ em & học đường';
        crumb = 'Trẻ em';
        eye = 'Học sinh & Trẻ em';
      } else if (state.gender === 'nam') {
        title = 'Giày nam thi đấu';
        crumb = 'Nam';
        eye = 'Dành cho nam';
      } else if (state.origin === 'flagship' || state.origin === 'cn') {
        title = 'NBA Signature & Pro Flagship';
        crumb = 'Signature & Flagship';
        eye = 'Way of Wade · Kobe Protro · Li-Ning Gamma · Anta Kai · 361° Joker GT · Kailas Vibram';
      } else if (state.cat) {
        title = CK.catLabel(state.cat);
        crumb = title;
        eye = 'Chọn theo bộ môn';
      } else if (state.brands.length === 1) {
        title = 'Giày ' + state.brands[0];
        crumb = state.brands[0];
        eye = 'Thương hiệu chính hãng';
      }

      document.getElementById('cat-heading').textContent = title;
      document.getElementById('cat-crumb').textContent = crumb;
      document.getElementById('cat-eyebrow').textContent = eye;
      document.getElementById('cat-count-top').textContent = `${count} sản phẩm`;
      document.getElementById('mob-apply-btn').textContent = `Xem ${count} sản phẩm`;
    }

    function renderChips() {
      const chips = [];
      if (state.q) chips.push([`Từ khoá: ${state.q}`, () => { state.q = ''; }]);
      if (state.gender) chips.push([`Đối tượng: ${state.gender === 'nu' ? 'Nữ' : state.gender === 'tre-em' ? 'Trẻ em' : 'Nam'}`, () => { state.gender = ''; }]);
      if (state.origin === 'flagship' || state.origin === 'cn') chips.push(['NBA Signature & Pro Flagship', () => { state.origin = ''; }]);
      if (state.cat) chips.push([CK.catLabel(state.cat), () => { state.cat = ''; }]);
      if (state.group) chips.push([`Dòng: ${state.group.toUpperCase()}`, () => { state.group = ''; }]);
      state.brands.forEach(b => chips.push([b, () => { state.brands = state.brands.filter(x => x !== b); }]));
      if (state.size) chips.push([`Size EU ${state.size}`, () => { state.size = null; }]);
      if (state.priceRange) {
        const lbl = (PRICE_OPTS.find(x => x[0] === state.priceRange) || [])[1] || state.priceRange;
        chips.push([lbl, () => { state.priceRange = ''; }]);
      }
      if (state.tag) chips.push([state.tag === 'DEAL' ? "Today's Deal" : state.tag, () => { state.tag = ''; }]);
      if (state.wish) chips.push(['Yêu thích', () => { state.wish = false; }]);

      const box = document.getElementById('active-chips');
      const badge = document.getElementById('mob-filter-badge');
      badge.textContent = chips.length;
      badge.classList.toggle('hidden', !chips.length);

      if (!chips.length) {
        box.classList.add('hidden');
        box.classList.remove('flex');
        box.innerHTML = '';
        return;
      }
      box.classList.remove('hidden');
      box.classList.add('flex');
      box.innerHTML = chips.map(([txt], i) => `
        <button type="button" data-rm-chip="${i}" class="inline-flex items-center gap-1.5 h-8 px-3 bg-nike hover:bg-black hover:text-white text-xs font-semibold transition-colors">
          <span>${CK.esc(txt)}</span><span>✕</span>
        </button>`).join('') + `
        <button type="button" id="clear-all-chips" class="ck-link ml-2">Xoá tất cả</button>`;

      box.querySelectorAll('[data-rm-chip]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-rm-chip'));
          if (chips[idx]) { chips[idx][1](); updateAll(); }
        });
      });
      document.getElementById('clear-all-chips').addEventListener('click', resetAll);
    }

    function syncQuickPills() {
      document.querySelectorAll('[data-qgroup]').forEach(b => {
        const g = b.getAttribute('data-qgroup');
        const active = g === '' ? (!state.group && !state.cat && !state.tag && !state.origin && !state.priceRange) : (state.group === g && !state.tag);
        b.classList.toggle('is-active', active);
      });
      document.querySelectorAll('[data-qorigin]').forEach(b => {
        b.classList.toggle('is-active', state.origin === b.getAttribute('data-qorigin'));
      });
      document.querySelectorAll('[data-qcat]').forEach(b => {
        const c = b.getAttribute('data-qcat');
        b.classList.toggle('is-active', state.cat === c && !state.group && !state.tag);
      });
      document.querySelectorAll('[data-qprice]').forEach(b => {
        b.classList.toggle('is-active', state.priceRange === b.getAttribute('data-qprice'));
      });
      document.querySelectorAll('[data-qtag]').forEach(b => {
        b.classList.toggle('is-active', state.tag === b.getAttribute('data-qtag'));
      });
      document.querySelectorAll('[data-aspect]').forEach(b => {
        const on = b.getAttribute('data-aspect') === state.aspect;
        b.className = `px-2.5 h-10 ck-mono text-xs font-semibold ${on ? 'bg-black text-white' : 'bg-white text-charcoal hover:bg-nike'}`;
      });
      document.getElementById('cat-sort').value = state.sort;
    }

    function renderGrid() {
      const list = sortProducts(filterProducts());
      updateHeading(list.length);
      const grid = document.getElementById('cat-grid');
      const empty = document.getElementById('cat-empty');

      grid.classList.toggle('ck-product-grid--3', !state.sidebarHidden);

      if (!list.length) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        return;
      }
      empty.classList.add('hidden');
      grid.innerHTML = list.map(p => CK.productCard(p, { aspect: state.aspect })).join('');
    }

    function resetAll() {
      state.q = '';
      state.gender = '';
      state.origin = '';
      state.group = '';
      state.cat = '';
      state.brands = [];
      state.tag = '';
      state.size = null;
      state.priceRange = '';
      state.wish = false;
      updateAll();
    }

    function updateAll() {
      renderFilters();
      renderChips();
      syncQuickPills();
      renderGrid();
    }

    function onFilterInput(e) {
      const accHead = e.target.closest('[data-facc] .ck-acc__head');
      if (accHead) {
        const wrap = accHead.closest('[data-facc]');
        const key = wrap.getAttribute('data-facc');
        const open = wrap.classList.toggle('is-open');
        state.openAcc[key] = open;
        return;
      }
      const sizeBtn = e.target.closest('[data-f-size]');
      if (sizeBtn) {
        const sz = String(sizeBtn.getAttribute('data-f-size') || '').trim();
        state.size = String(state.size) === sz ? null : sz;
        updateAll();
        return;
      }
    }

    function onFilterChange(e) {
      const t = e.target;
      if (t.hasAttribute('data-f-cat')) { state.cat = t.value; updateAll(); }
      else if (t.hasAttribute('data-f-group')) { state.group = t.value; updateAll(); }
      else if (t.hasAttribute('data-f-brand')) {
        const b = t.value;
        state.brands = t.checked ? [...state.brands, b] : state.brands.filter(x => x !== b);
        updateAll();
      } else if (t.hasAttribute('data-f-price')) { state.priceRange = t.value; updateAll(); }
      else if (t.hasAttribute('data-f-deal')) { state.tag = t.checked ? 'DEAL' : ''; updateAll(); }
      else if (t.hasAttribute('data-f-wish')) { state.wish = t.checked; updateAll(); }
    }

    ['desktop-filter-mount', 'mobile-filter-mount'].forEach(id => {
      const el = document.getElementById(id);
      el.addEventListener('click', onFilterInput);
      el.addEventListener('change', onFilterChange);
    });

    const layoutEl = document.getElementById('cat-layout');
    const toggleBtn = document.getElementById('toggle-sidebar-btn');
    const toggleLbl = document.getElementById('toggle-sidebar-label');
    toggleBtn.addEventListener('click', () => {
      state.sidebarHidden = !state.sidebarHidden;
      layoutEl.classList.toggle('is-sidebar-hidden', state.sidebarHidden);
      toggleBtn.setAttribute('aria-expanded', String(!state.sidebarHidden));
      toggleLbl.textContent = state.sidebarHidden ? 'Hiện Bộ Lọc' : 'Ẩn Bộ Lọc';
      document.getElementById('cat-grid').classList.toggle('ck-product-grid--3', !state.sidebarHidden);
    });

    const mobDrawer = document.getElementById('cat-mobile-drawer');
    const mobOv = document.getElementById('cat-filter-overlay');
    const openMob = () => { mobDrawer.classList.add('is-open'); mobOv.classList.add('is-open'); document.body.style.overflow = 'hidden'; };
    const closeMob = () => { mobDrawer.classList.remove('is-open'); mobOv.classList.remove('is-open'); document.body.style.overflow = ''; };
    document.getElementById('open-mobile-filter').addEventListener('click', openMob);
    document.getElementById('close-mobile-filter').addEventListener('click', closeMob);
    document.getElementById('mob-apply-btn').addEventListener('click', closeMob);
    document.getElementById('mob-reset-btn').addEventListener('click', resetAll);
    mobOv.addEventListener('click', closeMob);

    document.querySelectorAll('[data-qgroup]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.group = btn.getAttribute('data-qgroup');
        state.origin = '';
        state.cat = '';
        state.priceRange = '';
        state.tag = '';
        updateAll();
      });
    });
    document.querySelectorAll('[data-qorigin]').forEach(btn => {
      btn.addEventListener('click', () => {
        const org = btn.getAttribute('data-qorigin');
        state.origin = state.origin === org ? '' : org;
        state.group = '';
        updateAll();
      });
    });
    document.querySelectorAll('[data-qcat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = btn.getAttribute('data-qcat');
        state.cat = state.cat === c ? '' : c;
        state.group = '';
        state.tag = '';
        updateAll();
      });
    });
    document.querySelectorAll('[data-qprice]').forEach(btn => {
      btn.addEventListener('click', () => {
        const pr = btn.getAttribute('data-qprice');
        state.priceRange = state.priceRange === pr ? '' : pr;
        updateAll();
      });
    });
    document.querySelectorAll('[data-qtag]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tg = btn.getAttribute('data-qtag');
        state.tag = state.tag === tg ? '' : tg;
        state.group = '';
        state.cat = '';
        updateAll();
      });
    });
    document.querySelectorAll('[data-aspect]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.aspect = btn.getAttribute('data-aspect');
        syncQuickPills();
        renderGrid();
      });
    });
    document.getElementById('cat-sort').addEventListener('change', e => {
      state.sort = e.target.value;
      renderGrid();
    });
    document.getElementById('empty-reset-btn').addEventListener('click', resetAll);

    window.addEventListener('ck:products-synced', () => {
      allProducts = CK.getProducts();
      allBrands = Array.from(new Set(allProducts.map(p => p.brand))).sort((a, b) => {
        const ia = BRAND_ORDER.indexOf(a);
        const ib = BRAND_ORDER.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.localeCompare(b);
      });
      updateAll();
    });

    updateAll();
  });

if (window.CK_FEATURES && window.CK_FEATURES["catalog"] && window.CK_FEATURES["catalog"].markMounted) { window.CK_FEATURES["catalog"].markMounted(); }
