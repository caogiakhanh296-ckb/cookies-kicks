(function () {
    const esc = s => String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    const vnd = n => new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0)) + '₫';

    function resolveStorefrontOrigin() {
      if (location.hostname.includes('admin')) {
        return 'https://cookieskicks-store-2026.netlify.app';
      }
      if (location.port === '8189') return `${location.protocol}//${location.hostname}:8188`;
      if (location.port === '8089') return `${location.protocol}//${location.hostname}:8088`;
      return location.origin;
    }

    let currentShareUrl = location.href;

    const STATUS_MAP = {
      wait: { label: 'CHỜ ĐỐI SOÁT CỌC', color: '#B45309', bg: '#FEF3C7' },
      paid: { label: 'ĐÃ XÁC NHẬN CỌC · ĐANG ORDER', color: '#008A00', bg: '#DCFCE7' },
      arrived: { label: 'ĐÃ VỀ KHO HUẾ · CHECK AUTH', color: '#0369A1', bg: '#E0F2FE' },
      shipping: { label: 'ĐANG GIAO GHN', color: '#111111', bg: '#F3F4F6' },
      done: { label: 'ĐÃ HOÀN TẤT BÀN GIAO', color: '#008A00', bg: '#DCFCE7' },
      cancel: { label: 'ĐƠN ĐÃ HUỶ', color: '#D6273A', bg: '#FEE2E2' },
    };

    const params = new URLSearchParams(location.search);
    const rawId = (params.get('id') || '').trim().toUpperCase().replace(/^#/, '');
    const root = document.getElementById('receipt-root');

    const printBtn = document.getElementById('btn-print-receipt');
    if (printBtn) printBtn.addEventListener('click', () => window.print());

    document.getElementById('btn-copy-link').addEventListener('click', async function () {
      const btn = this;
      try {
        await navigator.clipboard.writeText(currentShareUrl);
        btn.textContent = '✓ Đã chép Link gửi khách!';
        setTimeout(() => { btn.textContent = '📋 Sao chép Link gửi Zalo'; }, 2000);
      } catch (e) {
        prompt('Sao chép đường dẫn phiếu biên nhận:', currentShareUrl);
      }
    });

    function findBaseProduct(it) {
      const list = window.CK_BASE_PRODUCTS || [];
      if (it && it.id != null) {
        const f = list.find(p => Number(p.id) === Number(it.id));
        if (f) return f;
      }
      return null;
    }

    function renderNotFound(msg) {
      root.innerHTML = `
        <div class="py-12 text-center space-y-4">
          <img src="public/images/logo-black-crop.png" alt="Cookie's Kicks" class="h-10 mx-auto" />
          <h1 class="ck-display text-3xl text-black">KHÔNG TÌM THẤY MÃ BIÊN NHẬN</h1>
          <p class="text-sm text-muted max-w-md mx-auto">${esc(msg || 'Vui lòng kiểm tra lại mã đơn hàng (VD: GIAY4821).')}</p>
          <form id="rcp-lookup-form" class="max-w-sm mx-auto flex gap-2 pt-2">
            <input name="q" aria-label="Mã đơn hàng" class="ck-input flex-1" placeholder="Nhập mã đơn VD: GIAY4821" required />
            <button type="submit" class="ck-btn ck-btn--sm">Mở phiếu</button>
          </form>
        </div>`;
      const f = document.getElementById('rcp-lookup-form');
      if (f) {
        f.addEventListener('submit', e => {
          e.preventDefault();
          location.search = '?id=' + encodeURIComponent(f.q.value.trim());
        });
      }
    }

    function renderReceipt(o) {
      document.title = `Phiếu Biên Nhận #${o.id} — Cookie's Kicks Huế`;
      const st = STATUS_MAP[o.status] || STATUS_MAP.wait;
      const items = Array.isArray(o.items) && o.items.length
        ? o.items
        : [{ name: o.product || 'Giày chính hãng', size: o.size || '—', colorway: '', qty: Number(o.qty) || 1, price: Number(o.total) || 0 }];
      const subtotal = Number(o.subtotal) || items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
      const discount = Math.max(0, Number(o.discount) || 0);
      const shipping = Math.max(0, Number(o.shipping) || 0);
      const total = Number(o.total) || Math.max(0, subtotal - discount + shipping);
      const paid = Math.max(0, Number(o.paid) || 0);
      const remain = Math.max(0, total - paid);
      const createdStr = o.createdAt
        ? new Date(o.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
        : (o.date || new Date().toLocaleDateString('vi-VN'));
      const etaStr = o.etaWindow || '12–15 ngày kể từ ngày xác nhận cọc';
      const storeOrigin = resolveStorefrontOrigin();
      const rawKeyParam = new URLSearchParams(location.search).get('key') || o.receiptKey || '';
      currentShareUrl = `${storeOrigin}/receipt.html?id=${encodeURIComponent(o.id)}${rawKeyParam ? '&key=' + encodeURIComponent(rawKeyParam) : ''}`;
      const trackUrl = `${storeOrigin}/index.html?track=${encodeURIComponent(o.id)}`;
      const rcpFeat = window.CK_FEATURES && window.CK_FEATURES["receipt"];
      const qrSrc = (rcpFeat && rcpFeat.qrSvgDataUri) ? rcpFeat.qrSvgDataUri(trackUrl) : '';

      root.innerHTML = `
        <header class="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-black">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-3">
              <img src="public/images/logo-black-crop.png" alt="Cookie's Kicks" class="h-10 w-auto" />
              <div>
                <p class="ck-eyebrow text-black">AUTHENTIC PERFORMANCE FOOTWEAR · HUẾ</p>
                <p class="text-xs text-muted ck-mono">Hotline/Zalo: 098 856 19 09 · IG: @bonappetitcookie</p>
              </div>
            </div>
            <h1 class="ck-display text-2xl sm:text-3xl text-black mt-4 leading-tight">PHIẾU BIÊN NHẬN ĐẶT CỌC &amp; BẢO HÀNH AUTHENTIC</h1>
          </div>
          <div class="sm:text-right space-y-1.5 flex-shrink-0">
            <div><span class="receipt-stamp" style="color:${st.color};background:${st.bg}">${esc(st.label)}</span></div>
            <p class="ck-mono text-base sm:text-lg font-bold text-black whitespace-nowrap">MÃ ĐƠN: #${esc(o.id)}</p>
            <p class="text-xs text-muted ck-mono whitespace-nowrap">Ngày lập: ${esc(createdStr)}</p>
          </div>
        </header>

        <section class="grid sm:grid-cols-2 gap-6 py-5 border-b border-line text-xs">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2">
              <p class="ck-label text-[11px] text-muted">01 · THÔNG TIN KHÁCH HÀNG</p>
              ${(o.phone && o.phone.includes('***')) ? '<span class="px-1.5 py-0.5 bg-nike border border-line text-[10px] text-charcoal font-bold uppercase tracking-wider">🔒 Đã che bảo mật</span>' : ''}
            </div>
            <p class="text-sm font-bold text-black">${esc(o.name || 'Khách hàng')}</p>
            <p class="ck-mono font-semibold text-charcoal">SĐT: ${esc(o.phone || '—')}${o.email ? ' · ' + esc(o.email) : ''}</p>
            <p class="text-charcoal leading-relaxed">Địa chỉ nhận: <b>${esc(o.address || 'Nhận tại TP. Huế')}</b></p>
          </div>
          <div class="space-y-1.5">
            <p class="ck-label text-[11px] text-muted">02 · LỊCH HẸN ORDER &amp; VẬN CHUYỂN</p>
            <p class="text-charcoal">Hình thức: <b class="text-black">${esc(o.payment || 'Đặt cọc Order 12–15 ngày')}</b> (${esc(o.method || 'VietQR MB Bank')})</p>
            <p class="text-charcoal">Dự kiến về kho Huế: <b class="ck-mono text-black">${esc(etaStr)}</b></p>
            <p class="text-charcoal">Đơn vị giao: <b>${esc(o.carrier || 'GHN Toàn Quốc / Giao nhanh Huế')}</b>${o.tracking ? ` · Vận đơn: <b class="ck-mono">${esc(o.tracking)}</b>` : ''}</p>
          </div>
        </section>

        <section class="py-5 border-b border-line">
          <p class="ck-label text-[11px] text-muted mb-3">03 · CHI TIẾT SẢN PHẨM &amp; KÍCH CỠ ĐÃ CHỐT</p>
          <div class="border border-black overflow-hidden">
            <table class="w-full text-xs border-collapse">
              <thead class="bg-black text-white uppercase tracking-wider text-[11px]">
                <tr>
                  <th class="py-2.5 px-3 text-left">Mẫu giày chính hãng</th>
                  <th class="py-2.5 px-3 text-center">Size chốt</th>
                  <th class="py-2.5 px-3 text-center">SL</th>
                  <th class="py-2.5 px-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-line">
                ${items.map(it => {
                  const bp = findBaseProduct(it);
                  const rawImg = it.image || (bp && bp.image) || 'public/images/products/ja3-1.jpg';
                  const img = rawImg && !rawImg.includes('?') && /^public\/images\//.test(rawImg) ? rawImg + '?v=6.8' : rawImg;
                  const qty = Number(it.qty) || 1;
                  const price = Number(it.price) || 0;
                  const szSpec = window.CK_SIZING ? window.CK_SIZING.lookupSizeSpec(bp || it.name, it.size) : null;
                  return `
                    <tr>
                      <td class="py-3 px-3">
                        <div class="flex items-center gap-3">
                          <img src="${esc(img)}" alt="" class="w-12 h-12 object-contain p-1 bg-[#F6F7F8] border border-line flex-shrink-0" data-hide-err />
                          <div>
                            <p class="font-bold text-black text-sm leading-snug">${esc(it.name)}</p>
                            <p class="text-[11px] text-muted">${esc(it.colorway || 'New Fullbox 100% Authentic')}</p>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-3 text-center">
                        <span class="inline-block px-2.5 py-1 bg-nike border border-black ck-mono font-bold text-black">EU ${esc(it.size || '—')}</span>
                        ${szSpec ? `<span class="block text-[10px] text-muted ck-mono mt-1">US ${esc(szSpec.us)} · ~${esc(szSpec.footCm)}cm</span>` : ''}
                      </td>
                      <td class="py-3 px-3 text-center ck-mono font-bold">${qty}</td>
                      <td class="py-3 px-3 text-right ck-mono font-bold text-black whitespace-nowrap">${vnd(price * qty)}</td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="mt-4 sm:w-80 sm:ml-auto space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-muted">Tạm tính:</span><b class="ck-mono">${vnd(subtotal)}</b></div>
            ${discount > 0 ? `<div class="flex justify-between text-[#008A00]"><span>Ưu đãi Voucher${o.promo ? ' (' + esc(o.promo) + ')' : ''}:</span><b class="ck-mono">−${vnd(discount)}</b></div>` : ''}
            <div class="flex justify-between"><span class="text-muted">Phí vận chuyển nội địa:</span><b class="ck-mono">${shipping > 0 ? vnd(shipping) : 'Miễn phí'}</b></div>
            <div class="flex justify-between pt-2 border-t border-black text-sm"><span class="font-bold uppercase">TỔNG GIÁ TRỊ ĐƠN:</span><b class="ck-mono text-base text-black">${vnd(total)}</b></div>
            <div class="flex justify-between text-[#008A00]"><span>Đã xác nhận đặt cọc / TT:</span><b class="ck-mono">${vnd(paid)}</b></div>
            ${(paid === 0 && Number(o.requiredDeposit) > 0 && o.status === 'wait') ? `<div class="flex justify-between text-[#B45309]"><span>Mức cọc / CK chờ đối soát:</span><b class="ck-mono">${vnd(o.requiredDeposit)}</b></div>` : ''}
            <div class="flex justify-between pt-1.5 border-t border-line text-sm">
              <span class="font-bold text-black">CÒN LẠI THU KHI NHẬN GIÀY:</span>
              <b class="ck-mono text-base ${remain > 0 ? 'text-accent' : 'text-[#008A00]'}">${vnd(remain)}</b>
            </div>
          </div>
        </section>

        <section class="py-5 border-b border-line">
          <div class="p-4 bg-nike border border-black space-y-2 text-xs leading-relaxed">
            <p class="font-bold uppercase tracking-wider text-black">04 · QUY ĐỊNH CHỌN SIZE &amp; CHÍNH SÁCH BẢO HÀNH ĐỔI 1:1 (BẮT BUỘC)</p>
            <ul class="list-disc pl-5 space-y-1 text-charcoal">
              <li><b>Quy định Size EU (Không hoàn/đổi sai size):</b> Giày được đặt Order chính hãng trực tiếp theo đúng từng size trên phiếu này. Shop <b>KHÔNG hỗ trợ hoàn hàng hoặc đổi size nếu khách tự chọn sai size</b>.</li>
              <li><b>Bảo hành lỗi đổi mới 1:1 (10–12 ngày):</b> Trường hợp giày nhận về phát sinh <b>lỗi từ nhà sản xuất / lỗi từ phía shop</b>, Cookie's Kicks cam kết <b>đổi mới 1:1 miễn phí</b> (thời gian chờ đặt lại đôi mới từ <b>10 đến 12 ngày</b>).</li>
              <li><b>Điều kiện đổi lỗi bắt buộc:</b> Giày phải <b>CHƯA QUA SỬ DỤNG</b> (chưa mang đi lại/chơi bóng, đế sạch nguyên trạng, nguyên tag/tem niêm phong &amp; Fullbox, có video mở hộp khi nhận). <b>Trường hợp giày đã qua sử dụng tuyệt đối KHÔNG đổi trả.</b></li>
              <li><b>Cam kết 100% Authentic trọn đời:</b> Phát hiện hàng giả đền bù gấp đôi. Nếu store quốc tế hết size đột xuất không về được hàng, shop hoàn lại <b>100% tiền cọc</b> ngay trong ngày.</li>
            </ul>
          </div>
        </section>

        <footer class="pt-5 flex flex-col sm:flex-row items-center justify-between gap-5 text-xs">
          <div class="space-y-1 text-center sm:text-left">
            <p class="font-bold uppercase tracking-wider text-black">XÁC NHẬN BỞI COOKIE'S KICKS HUẾ</p>
            <p class="text-muted">Tài khoản VietQR chính thức duy nhất: <b class="ck-mono text-black">MB Bank · 0988561909 · DANG GIA KHIEM</b></p>
            <p class="text-muted">Quét mã QR bên cạnh bằng camera điện thoại để theo dõi trực tiếp tiến độ đơn <b>#${esc(o.id)}</b> về kho Huế.</p>
          </div>
          <div class="flex items-center gap-3 border border-line p-2 bg-white flex-shrink-0">
            <img src="${esc(qrSrc)}" alt="QR Tra cứu đơn #${esc(o.id)}" class="w-20 h-20 object-contain" data-hide-err />
            <div class="pr-2">
              <p class="ck-mono font-bold text-black text-xs">#${esc(o.id)}</p>
              <p class="text-[10px] text-muted mt-0.5">Quét tra cứu <br/>hành trình 12–15N</p>
            </div>
          </div>
        </footer>
      `;
    }

    async function init() {
      if (!rawId) return renderNotFound('Bạn chưa truyền mã đơn hàng cần xem phiếu.');
      const rawKey = new URLSearchParams(location.search).get('key') || '';
      try {
        let tok = '';
        try { tok = localStorage.getItem('ck_auth_token') || ''; } catch (_) {}
        const fetchUrl = '/api/orders/receipt?id=' + encodeURIComponent(rawId) + (rawKey ? '&key=' + encodeURIComponent(rawKey) : '');
        const res = await fetch(fetchUrl, {
          cache: 'no-store',
          credentials: 'same-origin',
          headers: tok ? { Authorization: 'Bearer ' + tok } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.order) return renderReceipt(data.order);
        }
      } catch (e) {}

      try {
        const localOrders = JSON.parse(localStorage.getItem('cookiesKicksOrders') || '[]');
        const found = Array.isArray(localOrders) ? localOrders.find(x => String(x.id || '').toUpperCase() === rawId) : null;
        if (found) return renderReceipt(found, true);
      } catch (e) {}
      renderNotFound(`Không tìm thấy đơn hàng #${rawId} trên hệ thống.`);
    }

    init();
  })();

if (window.CK_FEATURES && window.CK_FEATURES["receipt"] && window.CK_FEATURES["receipt"].markMounted) { window.CK_FEATURES["receipt"].markMounted(); }
