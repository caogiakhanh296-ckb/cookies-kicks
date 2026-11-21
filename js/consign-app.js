(function() {
  'use strict';

  const state = {
    listings: [],
    ownedListings: [],
    filter: 'ALL',
    search: '',
    photos: ['', '', '', ''],
    video: '',
    activeListing: null,
    lockerPhone: localStorage.getItem('ck_consign_phone') || ''
  };

  function authHeaders() {
    const auth = window.CK && window.CK.auth;
    const token = auth && auth.getToken ? auth.getToken() : '';
    if (!token) throw new Error('Vui lòng đăng nhập tài khoản để thực hiện thao tác này.');
    return { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token };
  }

  async function loadOwnedListings() {
    const res = await fetch('/api/consign?mine=1', { headers: authHeaders(), cache: 'no-store' });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || 'Không thể tải tủ giày của bạn.');
    return Array.isArray(data.listings) ? data.listings : [];
  }

  function fmtVnd(num) {
    const n = Math.round(Number(num) || 0);
    return n.toLocaleString('vi-VN') + ' ₫';
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function compressImageFile(file, maxWidth, quality) {
    return new Promise(function(resolve, reject) {
      if (!file || !file.type.startsWith('image/')) {
        return reject(new Error('File không phải ảnh hợp lệ'));
      }
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality || 0.82));
        };
        img.onerror = function() {
          reject(new Error('Không thể xử lý ảnh'));
        };
        img.src = e.target.result;
      };
      reader.onerror = function() {
        reject(new Error('Không thể đọc file'));
      };
      reader.readAsDataURL(file);
    });
  }

  function updateFeeCalculations() {
    const priceInput = document.getElementById('cs-price');
    const cleaningCheck = document.getElementById('cs-cleaning-opt');
    const calcPrice = document.getElementById('calc-price');
    const calcFee = document.getElementById('calc-fee');
    const calcSpa = document.getElementById('calc-spa');
    const calcPayout = document.getElementById('calc-payout');
    const calcDeposit = document.getElementById('calc-deposit');

    if (!priceInput) return;

    const price = Math.round(Number(priceInput.value) || 0);
    const cleaning = cleaningCheck ? cleaningCheck.checked : false;

    const fee = Math.round(price * 0.05);
    const spa = cleaning ? 50000 : 0;
    const payout = Math.max(0, Math.round(price * 0.95) - spa);
    const deposit = Math.round(price * 0.20);

    if (calcPrice) calcPrice.textContent = fmtVnd(price);
    if (calcFee) calcFee.textContent = '-' + fmtVnd(fee);
    if (calcSpa) calcSpa.textContent = '-' + fmtVnd(spa);
    if (calcPayout) calcPayout.textContent = fmtVnd(payout);
    if (calcDeposit) calcDeposit.textContent = fmtVnd(deposit);
  }

  function updatePhotoStatus() {
    const label = document.getElementById('photo-progress-label');
    let validCount = 0;
    for (let i = 0; i < 4; i++) {
      if (state.photos[i] && state.photos[i].trim().length > 0) {
        validCount++;
      }
    }
    if (label) {
      label.textContent = validCount + '/4 ảnh hợp lệ';
      label.className = validCount === 4
        ? 'ck-mono text-[11px] text-emerald-600 font-bold'
        : 'ck-mono text-[11px] text-[#d97706] font-bold';
    }
  }

  function updateVideoStatus() {
    const label = document.getElementById('video-progress-label');
    const hasVideo = Boolean(state.video && state.video.trim().length > 0);
    if (label) {
      label.textContent = hasVideo ? '1/1 video hợp lệ' : 'Chưa có video';
      label.className = hasVideo
        ? 'ck-mono text-[11px] text-emerald-600 font-bold'
        : 'ck-mono text-[11px] text-[#d97706] font-bold';
    }
  }

  function bindUploadForm() {
    const form = document.getElementById('consign-upload-form');
    const priceInput = document.getElementById('cs-price');
    const cleaningCheck = document.getElementById('cs-cleaning-opt');
    const typeSelect = document.getElementById('cs-type');
    const tradeBox = document.getElementById('cs-trade-pref-box');
    const conditionSelect = document.getElementById('cs-condition');
    const customCondition = document.getElementById('cs-condition-custom');
    const customConditionBox = document.getElementById('cs-condition-custom-box');
    function updateConditionInput() {
      const custom = conditionSelect && conditionSelect.value === 'CUSTOM';
      if (customConditionBox) customConditionBox.hidden = !custom;
      if (customCondition) { customCondition.required = Boolean(custom); customCondition.disabled = !custom; }
    }
    if (conditionSelect) conditionSelect.addEventListener('change', updateConditionInput);
    updateConditionInput();

    if (priceInput) {
      priceInput.addEventListener('input', updateFeeCalculations);
    }
    if (cleaningCheck) {
      cleaningCheck.addEventListener('change', updateFeeCalculations);
    }
    if (typeSelect && tradeBox) {
      typeSelect.addEventListener('change', function() {
        tradeBox.style.display = typeSelect.value !== 'PASS' ? 'block' : 'none';
      });
    }

    for (let i = 0; i < 4; i++) {
      (function(slot) {
        const fileIn = document.getElementById('photo-file-' + slot);
        const urlIn = document.getElementById('photo-url-' + slot);
        const preview = document.getElementById('photo-preview-' + slot);
        const placeholder = document.getElementById('photo-placeholder-' + slot);

        if (fileIn) {
          fileIn.addEventListener('change', async function() {
            if (fileIn.files && fileIn.files[0]) {
              try {
                const dataUrl = await compressImageFile(fileIn.files[0], 1200, 0.82);
                state.photos[slot] = dataUrl;
                if (preview) {
                  preview.src = dataUrl;
                  preview.classList.remove('hidden');
                }
                if (placeholder) placeholder.classList.add('hidden');
                if (urlIn) urlIn.value = '';
                updatePhotoStatus();
              } catch (err) {
                alert('Không thể nén ảnh: ' + err.message);
              }
            }
          });
        }

        if (urlIn) {
          urlIn.addEventListener('input', function() {
            const v = String(urlIn.value || '').trim();
            if (v) {
              state.photos[slot] = v;
              if (preview) {
                preview.src = v;
                preview.classList.remove('hidden');
              }
              if (placeholder) placeholder.classList.add('hidden');
            } else if (!fileIn || !fileIn.files || !fileIn.files[0]) {
              state.photos[slot] = '';
              if (preview) preview.classList.add('hidden');
              if (placeholder) placeholder.classList.remove('hidden');
            }
            updatePhotoStatus();
          });
        }
      })(i);
    }

    const videoFile = document.getElementById('video-file-input');
    const videoUrl = document.getElementById('video-url-input');
    const videoPlayer = document.getElementById('video-preview-player');
    const videoPlace = document.getElementById('video-placeholder-text');

    if (videoFile) {
      videoFile.disabled = true;
      if (videoPlace) videoPlace.textContent = 'Vui lòng dùng liên kết video HTTPS hoặc tệp đã tải lên máy chủ. Video trên máy chưa được hỗ trợ tải lên an toàn.';
    }

    if (videoUrl) {
      videoUrl.addEventListener('input', function() {
        const v = String(videoUrl.value || '').trim();
        const safeVideo = /^(https:\/\/|\/?public\/(uploads|images)\/)/i.test(v);
        if (v && safeVideo) {
          state.video = v;
          if (videoPlayer) {
            videoPlayer.src = v;
            videoPlayer.classList.remove('hidden');
          }
          if (videoPlace) videoPlace.classList.add('hidden');
        } else if (!videoFile || !videoFile.files || !videoFile.files[0]) {
          state.video = '';
          if (videoPlayer) {
            videoPlayer.removeAttribute('src');
            videoPlayer.classList.add('hidden');
          }
          if (videoPlace) videoPlace.classList.remove('hidden');
        }
        updateVideoStatus();
      });
    }

    if (form) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const validPhotos = state.photos.filter(function(p) {
          return typeof p === 'string' && p.trim().length > 0;
        });

        if (validPhotos.length < 4) {
          alert('Bắt buộc phải cung cấp đủ 4 ảnh chi tiết (Lateral, Size Tag, Outsole, Insole) để gửi duyệt Vòng 1!');
          return;
        }

        if (!state.video || state.video.trim().length === 0) {
          alert('Bắt buộc phải tải lên hoặc dán link 1 video quay cận đế, tem size, nhãn và chi tiết giày để gửi duyệt Vòng 1!');
          return;
        }

        const name = String(document.getElementById('cs-name').value || '').trim();
        const brand = String(document.getElementById('cs-brand').value || '').trim();
        const size = String(document.getElementById('cs-size').value || '').trim();
        const condition = conditionSelect.value === 'CUSTOM' ? String(customCondition.value || '').trim() : String(conditionSelect.value || '').trim();
        if (!condition) { alert('Vui lòng mô tả tình trạng thực tế của giày.'); if (customCondition) customCondition.focus(); return; }
        const type = String(document.getElementById('cs-type').value || 'BOTH').trim();
        const price = Math.round(Number(document.getElementById('cs-price').value) || 0);
        const tradePref = document.getElementById('cs-trade-pref') ? document.getElementById('cs-trade-pref').value : '';
        const ownerName = String(document.getElementById('cs-owner-name').value || '').trim();
        const ownerPhone = String(document.getElementById('cs-owner-phone').value || '').trim();
        const cleaningRequested = document.getElementById('cs-cleaning-opt') ? document.getElementById('cs-cleaning-opt').checked : false;

        const payload = {
          action: 'create_listing',
          name: name,
          brand: brand,
          size: size,
          condition: condition,
          type: type,
          price: price,
          tradePreference: tradePref,
          photos: validPhotos,
          video: state.video,
          ownerName: ownerName,
          ownerPhone: ownerPhone,
          cleaningRequested: cleaningRequested
        };

        const submitBtn = document.getElementById('btn-submit-consign');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Đang thẩm định Vòng 1...';
        }

        try {
          const res = await fetch('/api/consign', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (!res.ok || !data.ok) {
            throw new Error(data.error || 'Lỗi khi gửi hồ sơ');
          }

          localStorage.setItem('ck_consign_phone', ownerPhone);
          state.lockerPhone = ownerPhone;

          alert('Đã gửi hồ sơ. Giày đang chờ quản trị viên duyệt Vòng 1 trước khi niêm yết.');
          form.reset();
          if (tradeBox && typeSelect) tradeBox.style.display = typeSelect.value !== 'PASS' ? 'block' : 'none';
          updateConditionInput();
          state.photos = ['', '', '', ''];
          state.video = '';
          for (let i = 0; i < 4; i++) {
            const p = document.getElementById('photo-preview-' + i);
            const ph = document.getElementById('photo-placeholder-' + i);
            if (p) p.classList.add('hidden');
            if (ph) ph.classList.remove('hidden');
          }
          if (videoPlayer) videoPlayer.classList.add('hidden');
          if (videoPlace) videoPlace.classList.remove('hidden');
          updatePhotoStatus();
          updateVideoStatus();
          updateFeeCalculations();

          await loadListings();
          const targetCard = document.querySelector('[data-listing-id="' + data.listing.id + '"]');
          if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetCard.classList.add('ring-4', 'ring-[#d97706]');
            setTimeout(function() {
              targetCard.classList.remove('ring-4', 'ring-[#d97706]');
            }, 3000);
          }
        } catch (err) {
          alert('Không thể đăng giày: ' + err.message);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Gửi Hồ Sơ Sơ Duyệt Vòng 1</span><span>→</span>';
          }
        }
      });
    }
  }

  function renderGrid() {
    const grid = document.getElementById('consign-grid');
    const emptyBox = document.getElementById('consign-empty');
    if (!grid) return;

    let items = state.listings.slice();

    if (state.filter !== 'ALL') {
      items = items.filter(function(it) {
        return window.CK.getConsignMode(it.type).mode === state.filter;
      });
    }

    if (state.search) {
      const q = state.search.toLowerCase();
      items = items.filter(function(it) {
        const text = (it.name + ' ' + it.brand + ' ' + it.size + ' ' + it.condition).toLowerCase();
        return text.includes(q);
      });
    }

    if (items.length === 0) {
      grid.innerHTML = '';
      if (emptyBox) emptyBox.classList.remove('hidden');
      return;
    }

    if (emptyBox) emptyBox.classList.add('hidden');

    grid.innerHTML = items.map(function(item) {
      const photos = (Array.isArray(item.photos) ? item.photos : []).filter(function(url) { return typeof url === 'string' && !/logo-black-crop|logo-white|logo[.]png/i.test(url); });
      const mainPhoto = photos[0];
      const displayName = String(item.name || 'Giày ký gửi').replace(/\s*\(Mã\s+[^)]+\)/gi, '').trim();
      const video = item.video || '';
      const mode = window.CK.getConsignMode(item.type);
      const isTrade = mode.canTrade;
      const canPass = mode.canPass;
      const depositAmount = item.depositEscrow || Math.round(item.price * 0.20);
      const isDeposited = item.status === 'DEPOSITED';
      const isNegotiating = item.status === 'IN_TRADE_NEGOTIATION';

      return `
        <article class="cs-card bg-white flex flex-col relative" data-listing-id="${esc(item.id)}">
          <div class="cs-media relative border-b border-line overflow-hidden">
            <div class="aspect-square relative" id="media-stage-${esc(item.id)}">
              ${mainPhoto ? `<img src="${esc(mainPhoto)}" alt="${esc(displayName)}" class="w-full h-full object-contain p-4" id="main-img-${esc(item.id)}" />` : `<div class="cs-missing-photo">Chưa có ảnh thực tế<span>Chờ chủ giày cập nhật hình ảnh</span></div>`}
              ${video ? `
                <video src="${esc(video)}" controls playsinline preload="metadata" class="w-full h-full object-contain bg-black hidden" id="card-video-${esc(item.id)}"></video>
              ` : ''}
            </div>

            <div class="cs-badges">
              <span class="cs-badge">Đã sơ duyệt vòng 1</span>
              <span class="cs-badge cs-badge--mode">${esc(mode.label)}</span>
            </div>

            ${video ? `
              <div class="absolute top-2 right-2 z-10">
                <button type="button" class="btn-toggle-media text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-black/80 text-white hover:bg-black" data-id="${esc(item.id)}" data-mode="photo">
                  Xem video chi tiết
                </button>
              </div>
            ` : ''}

            <div class="p-2 bg-white/95 border-t border-line flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              ${photos.map(function(p, idx) {
                return `
                  <button type="button" class="btn-thumb w-10 h-10 border ${idx === 0 ? 'border-black' : 'border-line'} p-0.5 bg-white shrink-0 hover:border-black" data-id="${esc(item.id)}" data-src="${esc(p)}">
                    <img src="${esc(p)}" alt="Ảnh chi tiết ${idx + 1}" class="w-full h-full object-cover" />
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <div class="cs-card-body flex-1">
            <div class="space-y-2">
              <div class="flex items-center justify-between text-[11px] text-muted">
                <span class="ck-mono font-bold uppercase text-black">${esc(item.brand || 'Sneaker')}</span>
                <span class="ck-mono font-semibold text-black">${esc(item.size || '')}</span>
              </div>

              <h3 class="font-extrabold text-base text-black leading-snug">
                ${esc(displayName)}
              </h3>

              <div class="flex flex-wrap gap-1.5 text-[11px]">
                <span class="px-2 py-0.5 bg-[#F0F2F5] text-charcoal font-medium">${esc(item.condition || '')}</span>
                <span class="px-2 py-0.5 bg-[#F0F2F5] text-charcoal font-medium">${esc(item.location || 'Hub Huế')}</span>
                ${item.cleaningRequested ? `
                  <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">Kèm dịch vụ làm sạch giày</span>
                ` : ''}
              </div>

              ${isTrade && item.tradePreference ? `
                <div class="p-2.5 bg-[#FFFBEB] border border-[#d97706]/30 text-[11px] text-[#92400e] leading-relaxed">
                  <strong>Nhu cầu Trade:</strong> ${esc(item.tradePreference)}
                </div>
              ` : ''}
            </div>

            <div class="space-y-3 pt-3 border-t border-line">
              <div class="flex items-baseline justify-between">
                <div>
                  <p class="text-[10px] uppercase text-muted font-bold">Giá Niêm Yết</p>
                  <p class="font-black text-lg text-black tabular-nums">${fmtVnd(item.price)}</p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] uppercase text-muted font-bold">Cọc Ký Quỹ 20%</p>
                  <p class="font-bold text-xs text-[#d97706] tabular-nums">${fmtVnd(depositAmount)}</p>
                </div>
              </div>

              <div class="grid ${isTrade && canPass ? 'grid-cols-2' : 'grid-cols-1'} gap-2 pt-1">
                ${canPass ? `<button type="button" class="btn-deposit w-full py-2.5 px-3 bg-black text-white hover:bg-[#d97706] transition-colors text-xs font-bold uppercase tracking-wider text-center ${isDeposited ? '!bg-gray-400 cursor-not-allowed' : ''}" data-id="${esc(item.id)}" ${isDeposited ? 'disabled' : ''}>
                  ${isDeposited ? 'Đã Có Người Cọc' : 'Đặt Cọc (20%)'}
                </button>` : ''}

                ${isTrade ? `
                  <button type="button" class="btn-trade w-full py-2.5 px-3 bg-white border border-black text-black hover:bg-black hover:text-white transition-colors text-xs font-bold uppercase tracking-wider text-center ${isNegotiating ? '!border-gray-300 !text-gray-400 cursor-not-allowed' : ''}" data-id="${esc(item.id)}" ${isNegotiating ? 'disabled' : ''}>
                    ${isNegotiating ? 'Đang Đàm Phán' : 'Đề Nghị Trade'}
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    bindGridInteractions();
  }

  function bindGridInteractions() {
    const thumbBtns = document.querySelectorAll('.btn-thumb');
    thumbBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const id = btn.getAttribute('data-id');
        const src = btn.getAttribute('data-src');
        const mainImg = document.getElementById('main-img-' + id);
        const video = document.getElementById('card-video-' + id);
        if (mainImg) {
          mainImg.src = src;
          mainImg.classList.remove('hidden');
        }
        if (video) {
          video.pause();
          video.classList.add('hidden');
        }

        const card = btn.closest('article');
        if (card) {
          card.querySelectorAll('.btn-thumb').forEach(function(b) {
            b.classList.remove('border-black');
            b.classList.add('border-line');
          });
          btn.classList.add('border-black');
          btn.classList.remove('border-line');
          const toggleBtn = card.querySelector('.btn-toggle-media');
          if (toggleBtn) {
            toggleBtn.setAttribute('data-mode', 'photo');
            toggleBtn.textContent = 'Xem video chi tiết';
          }
        }
      });
    });

    const toggleBtns = document.querySelectorAll('.btn-toggle-media');
    toggleBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const id = btn.getAttribute('data-id');
        const mode = btn.getAttribute('data-mode') || 'photo';
        const mainImg = document.getElementById('main-img-' + id);
        const video = document.getElementById('card-video-' + id);

        if (mode === 'photo') {
          if (mainImg) mainImg.classList.add('hidden');
          if (video) {
            video.classList.remove('hidden');
            video.play().catch(function() {});
          }
          btn.setAttribute('data-mode', 'video');
          btn.textContent = 'Xem Ảnh';
        } else {
          if (video) {
            video.pause();
            video.classList.add('hidden');
          }
          if (mainImg) mainImg.classList.remove('hidden');
          btn.setAttribute('data-mode', 'photo');
          btn.textContent = 'Xem video chi tiết';
        }
      });
    });

    const depositBtns = document.querySelectorAll('.btn-deposit');
    depositBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const id = btn.getAttribute('data-id');
        openDepositModal(id, btn);
      });
    });

    const tradeBtns = document.querySelectorAll('.btn-trade');
    tradeBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const id = btn.getAttribute('data-id');
        openTradeModal(id, btn);
      });
    });
  }

  const MODAL_FOCUSABLE_SELECTOR = 'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const modalTriggerMap = new WeakMap();
  const modalStack = [];
  let consignPreviousOverflow = null;

  function isConsignElementVisible(el) {
    if (!el || typeof el.getBoundingClientRect !== 'function') return true;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    if (typeof getComputedStyle === 'function') {
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') return false;
    }
    return true;
  }

  function getConsignModalFocusables(modal) {
    if (!modal || typeof modal.querySelectorAll !== 'function') return [];
    return Array.prototype.slice.call(modal.querySelectorAll(MODAL_FOCUSABLE_SELECTOR)).filter(function(el) {
      return !el.hasAttribute('hidden') && !el.closest('[hidden]') && isConsignElementVisible(el);
    });
  }

  function getActiveConsignModal() {
    for (let i = modalStack.length - 1; i >= 0; i--) {
      const m = modalStack[i];
      if (m && m.classList && m.classList.contains('is-open')) return m;
    }
    return null;
  }

  function syncConsignScrollLock() {
    if (typeof document === 'undefined' || !document.body) return;
    if (getActiveConsignModal()) {
      if (consignPreviousOverflow === null) consignPreviousOverflow = document.body.style.overflow;
      if (document.body.style.overflow !== 'hidden') document.body.style.overflow = 'hidden';
      return;
    }
    const otherOpen = typeof document.querySelector === 'function' &&
      document.querySelector('.ck-modal.is-open, .ck-overlay.is-open, .ck-drawer.is-open');
    if (!otherOpen && consignPreviousOverflow !== null) {
      document.body.style.overflow = consignPreviousOverflow;
      consignPreviousOverflow = null;
    }
  }

  function openConsignModal(modal, triggerEl) {
    if (!modal) return;
    const opener = triggerEl || (typeof document !== 'undefined' ? document.activeElement : null);
    if (opener && typeof modal.contains === 'function' && !modal.contains(opener)) {
      modalTriggerMap.set(modal, opener);
    }
    modal.classList.add('is-open');
    const idx = modalStack.indexOf(modal);
    if (idx !== -1) modalStack.splice(idx, 1);
    modalStack.push(modal);
    syncConsignScrollLock();
    const focusables = getConsignModalFocusables(modal);
    const target = focusables[0] || modal;
    if (target && typeof target.focus === 'function') {
      target.focus();
    }
  }

  function closeConsignModal(modal, options) {
    if (!modal) return;
    const wasOpen = Boolean(modal.classList && modal.classList.contains('is-open'));
    modal.classList.remove('is-open');
    const idx = modalStack.indexOf(modal);
    if (idx !== -1) modalStack.splice(idx, 1);
    syncConsignScrollLock();
    const shouldRestore = !options || options.restoreFocus !== false;
    const opener = modalTriggerMap.get(modal);
    modalTriggerMap.delete(modal);
    if (wasOpen && shouldRestore && opener && opener.isConnected !== false && typeof opener.focus === 'function') {
      if (!opener.closest || !opener.closest('.ck-modal:not(.is-open)')) {
        opener.focus();
      }
    }
  }

  function modalCloseOptions(options) {
    return options && typeof options.restoreFocus === 'boolean' ? options : undefined;
  }

  function handleConsignModalKeydown(e) {
    const activeModal = getActiveConsignModal();
    if (!activeModal) return;
    const hasExternalOverlay = typeof document.querySelectorAll === 'function' && Array.prototype.some.call(
      document.querySelectorAll('.ck-modal.is-open, .ck-overlay.is-open, .ck-drawer.is-open'),
      function(el) { return modalStack.indexOf(el) === -1; }
    );
    if (hasExternalOverlay) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      if (activeModal.id === 'deposit-modal') closeDepositModal();
      else if (activeModal.id === 'trade-modal') closeTradeModal();
      else if (activeModal.id === 'my-locker-modal') closeLockerModal();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = getConsignModalFocusables(activeModal);
    if (focusables.length === 0) {
      e.preventDefault();
      if (typeof activeModal.focus === 'function') activeModal.focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const current = document.activeElement;
    if (!activeModal.contains(current)) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
      return;
    }
    if (e.shiftKey && (current === first || current === activeModal)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && current === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openDepositModal(listingId, triggerEl) {
    const item = state.listings.concat(state.ownedListings).find(function(it) {
      return it.id === listingId;
    });
    if (!item) return;
    const mode = window.CK.getConsignMode(item.type);
    if (!mode.canPass && !(mode.canTrade && item.status === 'IN_TRADE_NEGOTIATION')) return;

    state.activeListing = item;
    const modal = document.getElementById('deposit-modal');
    const summary = document.getElementById('deposit-shoe-summary');
    const inputId = document.getElementById('deposit-listing-id');
    const buyerPhone = document.getElementById('deposit-buyer-phone');

    if (inputId) inputId.value = item.id;
    if (buyerPhone && state.lockerPhone) buyerPhone.value = state.lockerPhone;

    const depositAmount = item.depositEscrow || Math.round(item.price * 0.20);

    if (summary) {
      summary.innerHTML = `
        <div class="p-3 bg-[#F8F9FA] border border-line flex items-center gap-3">
          <img src="${esc((item.photos && item.photos[0]) || 'public/images/logo-black-crop.png')}" alt="" class="w-16 h-16 object-contain bg-white border border-line" />
          <div class="space-y-0.5">
            <p class="font-extrabold text-sm text-black">${esc(item.name)}</p>
            <p class="text-[11px] text-muted">${esc(item.brand)} · Size ${esc(item.size)} · ${esc(item.condition)}</p>
            <p class="text-xs font-bold text-black">Giá bán: ${fmtVnd(item.price)}</p>
          </div>
        </div>
        <div class="p-3 bg-[#FFFBEB] border border-[#d97706]/40 flex items-center justify-between">
          <span class="font-bold text-[#b45309] uppercase text-xs">Số tiền cần đặt cọc (20%):</span>
          <span class="font-black text-base text-[#b45309] tabular-nums">${fmtVnd(depositAmount)}</span>
        </div>
      `;
    }

    if (typeof openConsignModal === 'function') openConsignModal(modal, triggerEl);
    else if (modal) modal.classList.add('is-open');
  }

  function closeDepositModal(options) {
    const modal = document.getElementById('deposit-modal');
    closeConsignModal(modal, modalCloseOptions(options));
  }

  function bindDepositModal() {
    const backdrop = document.getElementById('deposit-backdrop');
    const closeBtn = document.getElementById('btn-close-deposit');
    const form = document.getElementById('deposit-form');

    if (backdrop) backdrop.addEventListener('click', closeDepositModal);
    if (closeBtn) closeBtn.addEventListener('click', closeDepositModal);

    if (form) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const listingId = document.getElementById('deposit-listing-id').value;
        const buyerName = document.getElementById('deposit-buyer-name').value;
        const buyerPhone = document.getElementById('deposit-buyer-phone').value;
        const note = document.getElementById('deposit-buyer-note').value;

        const submitBtn = document.getElementById('btn-confirm-deposit');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Đang tạo yêu cầu thanh toán...';
        }

        try {
          const res = await fetch('/api/consign', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
              action: 'place_deposit',
              listingId: listingId,
              buyerName: buyerName,
              buyerPhone: buyerPhone,
              note: note
            })
          });
          const data = await res.json();
          if (!res.ok || !data.ok) {
            throw new Error(data.error || 'Lỗi đặt cọc');
          }

          localStorage.setItem('ck_consign_phone', buyerPhone);
          state.lockerPhone = buyerPhone;

          alert('Đã tạo yêu cầu thanh toán, CHƯA xác nhận nhận tiền. Mã: ' + (data.intentId || data.escrowCode || '') + ' — Số tiền: ' + fmtVnd(data.depositAmount) + '. Giày chỉ được khóa sau khi quản trị viên đối soát và xác nhận tiền đã nhận.');
          closeDepositModal();
          form.reset();
          await loadListings();
        } catch (err) {
          alert('Không thể đặt cọc: ' + err.message);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Tạo yêu cầu thanh toán cọc 20%';
          }
        }
      });
    }
  }

  async function openTradeModal(targetListingId, triggerEl) {
    const target = state.listings.find(function(it) {
      return it.id === targetListingId;
    });
    if (!target || !window.CK.getConsignMode(target.type).canTrade) return;

    const opener = triggerEl || (typeof document !== 'undefined' ? document.activeElement : null);

    state.activeListing = target;
    const modal = document.getElementById('trade-modal');
    const targetName = document.getElementById('trade-target-name');
    const targetDetails = document.getElementById('trade-target-details');
    const targetPrice = document.getElementById('trade-target-price');
    const targetIdInput = document.getElementById('trade-target-id');
    const selectOffered = document.getElementById('trade-select-offered');
    const submitBtn = document.getElementById('btn-submit-trade-offer');
    const phoneInput = document.getElementById('trade-offerer-phone');

    if (targetIdInput) targetIdInput.value = target.id;
    if (targetName) targetName.textContent = target.name;
    if (targetDetails) targetDetails.textContent = target.brand + ' · Size ' + target.size + ' · ' + target.condition;
    if (targetPrice) targetPrice.textContent = fmtVnd(target.price);
    if (phoneInput && state.lockerPhone) phoneInput.value = state.lockerPhone;

    let ownedListings;
    try {
      ownedListings = await loadOwnedListings();
    } catch (err) {
      alert(err.message);
      return;
    }
    const approvedShoes = ownedListings.filter(function(it) {
      return it.id !== target.id && it.status === 'APPROVED' && window.CK.getConsignMode(it.type).canTrade;
    });

    if (selectOffered) {
      selectOffered.innerHTML = '<option value="">-- Chọn đôi giày đã sơ duyệt APPROVED --</option>' +
        approvedShoes.map(function(s) {
          return '<option value="' + esc(s.id) + '" data-price="' + esc(s.price) + '" data-name="' + esc(s.name) + '" data-details="' + esc(s.brand + ' · ' + s.size) + '">' +
            esc(s.name) + ' (' + fmtVnd(s.price) + ' · Size ' + esc(s.size) + ')' +
          '</option>';
        }).join('');
    }

    const offeredName = document.getElementById('trade-offered-name');
    const offeredDetails = document.getElementById('trade-offered-details');
    const offeredPrice = document.getElementById('trade-offered-price');
    const deltaVal = document.getElementById('trade-delta-val');
    const deltaHint = document.getElementById('trade-delta-hint');
    const cashDiff = document.getElementById('trade-cash-diff');

    if (offeredName) offeredName.textContent = 'Chưa chọn đôi giày';
    if (offeredDetails) offeredDetails.textContent = 'Bắt buộc phải là giày đã duyệt Vòng 1';
    if (offeredPrice) offeredPrice.textContent = '0 ₫';
    if (deltaVal) deltaVal.textContent = '0 ₫';
    if (deltaHint) deltaHint.textContent = 'Vui lòng chọn 1 đôi giày của bạn ở trên để tính toán chênh lệch.';
    if (cashDiff) cashDiff.value = '';

    if (approvedShoes.length === 0) {
      if (selectOffered) selectOffered.disabled = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Cần đăng ký gửi giày qua Vòng 1 trước';
      }
    } else {
      if (selectOffered) selectOffered.disabled = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Gửi Lời Mời Trade Vòng 1';
      }
    }

    if (typeof openConsignModal === 'function') openConsignModal(modal, opener);
    else if (modal) modal.classList.add('is-open');
  }

  function closeTradeModal(options) {
    const modal = document.getElementById('trade-modal');
    closeConsignModal(modal, modalCloseOptions(options));
  }

  function bindTradeModal() {
    const backdrop = document.getElementById('trade-backdrop');
    const closeBtn = document.getElementById('btn-close-trade');
    const selectOffered = document.getElementById('trade-select-offered');
    const form = document.getElementById('trade-form');

    if (backdrop) backdrop.addEventListener('click', closeTradeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeTradeModal);

    if (selectOffered) {
      selectOffered.addEventListener('change', function() {
        const opt = selectOffered.selectedOptions[0];
        const offeredName = document.getElementById('trade-offered-name');
        const offeredDetails = document.getElementById('trade-offered-details');
        const offeredPrice = document.getElementById('trade-offered-price');
        const deltaVal = document.getElementById('trade-delta-val');
        const deltaHint = document.getElementById('trade-delta-hint');
        const cashDiff = document.getElementById('trade-cash-diff');

        if (!opt || !opt.value) {
          if (offeredName) offeredName.textContent = 'Chưa chọn đôi giày';
          if (offeredDetails) offeredDetails.textContent = 'Bắt buộc phải là giày đã duyệt Vòng 1';
          if (offeredPrice) offeredPrice.textContent = '0 ₫';
          if (deltaVal) deltaVal.textContent = '0 ₫';
          return;
        }

        const name = opt.getAttribute('data-name');
        const details = opt.getAttribute('data-details');
        const price = Math.round(Number(opt.getAttribute('data-price')) || 0);

        if (offeredName) offeredName.textContent = name;
        if (offeredDetails) offeredDetails.textContent = details;
        if (offeredPrice) offeredPrice.textContent = fmtVnd(price);

        if (state.activeListing) {
          const delta = state.activeListing.price - price;
          if (deltaVal) {
            deltaVal.textContent = (delta >= 0 ? '+' : '') + fmtVnd(delta);
            deltaVal.className = delta > 0
              ? 'font-black tabular-nums text-sm text-red-600'
              : (delta < 0 ? 'font-black tabular-nums text-sm text-emerald-600' : 'font-black tabular-nums text-sm text-black');
          }
          if (deltaHint) {
            if (delta > 0) {
              deltaHint.textContent = 'Giày đối phương định giá cao hơn ' + fmtVnd(delta) + '. Bạn nên đề xuất bù thêm số tiền này.';
            } else if (delta < 0) {
              deltaHint.textContent = 'Giày của bạn định giá cao hơn ' + fmtVnd(Math.abs(delta)) + '. Bạn có thể yêu cầu đối phương bù số tiền này.';
            } else {
              deltaHint.textContent = 'Hai đôi giày đồng giá trị định giá. Kèo trade ngang không cần bù.';
            }
          }
          if (cashDiff) cashDiff.value = delta;
        }
      });
    }

    if (form) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const targetId = document.getElementById('trade-target-id').value;
        const offeredId = document.getElementById('trade-select-offered').value;
        const cashDiff = Number(document.getElementById('trade-cash-diff').value) || 0;
        const offererPhone = document.getElementById('trade-offerer-phone').value;
        const message = document.getElementById('trade-message').value;

        if (!offeredId) {
          alert('Vui lòng chọn 1 đôi giày đã được duyệt Vòng 1 của bạn để gửi lời mời Trade!');
          return;
        }

        const submitBtn = document.getElementById('btn-submit-trade-offer');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Đang gửi lời mời...';
        }

        try {
          const res = await fetch('/api/consign', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
              action: 'create_trade_offer',
              targetListingId: targetId,
              offeredListingId: offeredId,
              offererPhone: offererPhone,
              cashDifference: cashDiff,
              message: message
            })
          });
          const data = await res.json();
          if (!res.ok || !data.ok) {
            throw new Error(data.error || 'Lỗi gửi đề nghị trade');
          }

          localStorage.setItem('ck_consign_phone', offererPhone);
          state.lockerPhone = offererPhone;

          alert('Gửi đề nghị Trade thành công!\nChủ giày sẽ xét duyệt và phản hồi trong Tủ Giày Ký Gửi.');
          closeTradeModal();
          form.reset();
          await loadListings();
        } catch (err) {
          alert('Không thể gửi đề nghị: ' + err.message);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Gửi Lời Mời Trade Vòng 1';
          }
        }
      });
    }
  }

  function openLockerModal(triggerEl) {
    const modal = document.getElementById('my-locker-modal');
    searchLocker();
    openConsignModal(modal, triggerEl);
  }

  function closeLockerModal(options) {
    const modal = document.getElementById('my-locker-modal');
    closeConsignModal(modal, modalCloseOptions(options));
  }

  async function searchLocker() {
    const content = document.getElementById('locker-content');
    if (!content) return;

    content.innerHTML = '<div class="text-center py-6 text-xs text-muted">Đang tải tủ giày ký gửi của bạn...</div>';

    try {
      const res = await fetch('/api/consign?mine=1', { headers: authHeaders(), cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Lỗi nạp dữ liệu');

      const myShoes = data.listings || [];
      state.ownedListings = myShoes;
      if (myShoes.length === 0) {
        content.innerHTML = `
          <div class="text-center py-8 border border-dashed border-line bg-white space-y-3">
            <p class="font-bold text-sm text-black">Tài khoản của bạn chưa có đôi giày ký gửi nào.</p>
            <p class="text-xs text-muted">Bạn có thể đăng ký gửi giày mới ngay bên dưới để bắt đầu giao lưu trên sàn.</p>
            <a href="#consign-form-section" id="btn-locker-goto-form" class="inline-block px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-[#d97706]">
              Đăng Ký Gửi Giày Ngay
            </a>
          </div>
        `;
        const gotoBtn = document.getElementById('btn-locker-goto-form');
        if (gotoBtn) {
          gotoBtn.addEventListener('click', function() {
            closeLockerModal({ restoreFocus: false });
          });
        }
        return;
      }

      content.innerHTML = myShoes.map(function(shoe) {
        const offers = Array.isArray(shoe.tradeOffers) ? shoe.tradeOffers : [];
        return `
          <div class="border border-black bg-white p-4 space-y-4">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-line">
              <div class="flex items-center gap-3">
                <img src="${esc((shoe.photos && shoe.photos[0]) || 'public/images/logo-black-crop.png')}" alt="" class="w-14 h-14 object-contain border border-line bg-[#FAFAFA]" />
                <div>
                  <h4 class="font-black text-sm text-black">${esc(shoe.name)}</h4>
                  <p class="text-[11px] text-muted">${esc(shoe.brand)} · Size ${esc(shoe.size)} · ${fmtVnd(shoe.price)}</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span class="ck-mono text-[10px] font-bold uppercase px-2.5 py-1 ${shoe.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-[#d97706] text-white'}">
                  ${esc(shoe.status)}
                </span>
                <span class="ck-mono text-[10px] uppercase px-2 py-1 bg-black text-white">
                  ${esc(window.CK.getConsignMode(shoe.type).label)}
                </span>
              </div>
            </div>

            ${shoe.status === 'IN_TRADE_NEGOTIATION' ? '<button type="button" class="btn-locker-deposit px-4 py-2 bg-black text-white" data-id="' + esc(shoe.id) + '">Tạo yêu cầu thanh toán cọc Trade</button>' : ''}
            <div class="space-y-3">
              <h5 class="ck-mono text-xs font-bold uppercase text-black flex items-center justify-between">
                <span>Lời Mời Trade Nhận Được (${offers.length})</span>
                <span class="text-[10px] text-muted font-normal">Chủ giày có quyền Đồng ý / Từ chối</span>
              </h5>

              ${offers.length === 0 ? `
                <p class="text-xs text-muted italic py-2">Chưa có đề nghị trade nào cho đôi giày này.</p>
              ` : `
                <div class="space-y-2">
                  ${offers.map(function(offer) {
                    const isPending = offer.status === 'PENDING';
                    const isAccepted = offer.status === 'ACCEPTED';
                    return `
                      <div class="p-3 bg-[#F8F9FA] border border-line space-y-2 text-xs">
                        <div class="flex items-start justify-between gap-2">
                          <div>
                            <p class="font-bold text-black">${esc(offer.offeredShoeName || 'Giày trao đổi')}</p>
                            <p class="text-[11px] text-muted">${esc(offer.offeredShoeBrand || '')} · Size ${esc(offer.offeredShoeSize || '')} · Giá định giá: ${fmtVnd(offer.offeredShoePrice)}</p>
                            <p class="text-[11px] font-bold ${offer.cashDifference >= 0 ? 'text-red-600' : 'text-emerald-600'}">
                              Đề xuất bù: ${offer.cashDifference >= 0 ? '+' : ''}${fmtVnd(offer.cashDifference)}
                            </p>
                            ${offer.message ? `
                              <p class="text-[11px] text-charcoal bg-white p-2 border border-line mt-1">"${esc(offer.message)}"</p>
                            ` : ''}
                          </div>
                          <span class="ck-mono text-[10px] font-bold uppercase px-2 py-0.5 ${isAccepted ? 'bg-emerald-600 text-white' : (offer.status === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-[#d97706] text-white')}">
                            ${esc(offer.status)}
                          </span>
                        </div>

                        ${isPending ? `
                          <div class="flex items-center gap-2 pt-2 border-t border-line">
                            <button type="button" class="btn-respond-trade px-3 py-1.5 bg-black text-white hover:bg-emerald-600 text-[11px] font-bold uppercase tracking-wider transition-colors" data-shoe-id="${esc(shoe.id)}" data-offer-id="${esc(offer.offerId)}" data-decision="ACCEPT">
                              Đồng Ý Trade
                            </button>
                            <button type="button" class="btn-respond-trade px-3 py-1.5 bg-white border border-line text-black hover:bg-red-600 hover:text-white hover:border-red-600 text-[11px] font-bold uppercase tracking-wider transition-colors" data-shoe-id="${esc(shoe.id)}" data-offer-id="${esc(offer.offerId)}" data-decision="REJECT">
                              Từ Chối
                            </button>
                          </div>
                        ` : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>
          </div>
        `;
      }).join('');

      content.querySelectorAll('.btn-locker-deposit').forEach(function(btn) {
        btn.addEventListener('click', function() {
          closeLockerModal();
          openDepositModal(btn.getAttribute('data-id'));
        });
      });
      bindLockerResponses(norm);
    } catch (err) {
      content.innerHTML = '<div class="text-center py-6 text-xs text-red-600 font-bold">Lỗi tra cứu: ' + esc(err.message) + '</div>';
    }
  }

  function bindLockerResponses(ownerPhone) {
    const btns = document.querySelectorAll('.btn-respond-trade');
    btns.forEach(function(btn) {
      btn.addEventListener('click', async function() {
        const shoeId = btn.getAttribute('data-shoe-id');
        const offerId = btn.getAttribute('data-offer-id');
        const decision = btn.getAttribute('data-decision');

        btn.disabled = true;
        try {
          const res = await fetch('/api/consign', {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify({
              action: 'respond_trade_offer',
              listingId: shoeId,
              offerId: offerId,
              decision: decision
            })
          });
          const data = await res.json();
          if (!res.ok || !data.ok) throw new Error(data.error || 'Lỗi phản hồi');

          alert(data.message || 'Đã cập nhật trạng thái kèo Trade!');
          await loadListings();
          await searchLocker(ownerPhone);
        } catch (err) {
          alert('Không thể thực hiện: ' + err.message);
          btn.disabled = false;
        }
      });
    });
  }

  function bindLockerModal() {
    const backdrop = document.getElementById('locker-backdrop');
    const closeBtn = document.getElementById('btn-close-locker');
    const openBtn = document.getElementById('btn-open-my-locker');
    const heroBtn = document.getElementById('btn-hero-my-locker');
    const searchBtn = document.getElementById('btn-locker-search');

    if (backdrop) backdrop.addEventListener('click', closeLockerModal);
    if (closeBtn) closeBtn.addEventListener('click', closeLockerModal);
    if (openBtn) openBtn.addEventListener('click', function() {
      openLockerModal(openBtn);
    });
    if (heroBtn) heroBtn.addEventListener('click', function() {
      openLockerModal(heroBtn);
    });

    if (searchBtn) {
      searchBtn.addEventListener('click', function() {
        searchLocker();
      });
    }
  }

  function bindFilterBar() {
    const filterBtns = document.querySelectorAll('[data-consign-filter]');
    function syncFilterButtons(activeFilter) {
      filterBtns.forEach(function(b) {
        const isActive = (b.getAttribute('data-consign-filter') || 'ALL') === activeFilter;
        b.classList.toggle('is-active', isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }
    syncFilterButtons(state.filter || 'ALL');
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        state.filter = btn.getAttribute('data-consign-filter') || 'ALL';
        syncFilterButtons(state.filter);
        renderGrid();
      });
    });

    const searchInput = document.getElementById('consign-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        state.search = searchInput.value.trim();
        renderGrid();
      });
    }

    const resetBtn = document.getElementById('btn-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        state.filter = 'ALL';
        state.search = '';
        if (searchInput) searchInput.value = '';
        syncFilterButtons('ALL');
        renderGrid();
      });
    }
  }

  function updateCounts() {
    const cAll = document.getElementById('count-all');
    const cTrade = document.getElementById('count-trade');
    const cPass = document.getElementById('count-pass');
    const cBoth = document.getElementById('count-both');

    let allCount = state.listings.length;
    let tradeCount = 0;
    let passCount = 0;
    let bothCount = 0;

    for (let i = 0; i < state.listings.length; i++) {
      const t = window.CK.getConsignMode(state.listings[i].type).mode;
      if (t === 'TRADE_ONLY') tradeCount++;
      else if (t === 'BOTH') bothCount++;
      else if (t === 'PASS') passCount++;
    }

    if (cAll) cAll.textContent = allCount;
    if (cTrade) cTrade.textContent = tradeCount;
    if (cPass) cPass.textContent = passCount;
    if (cBoth) cBoth.textContent = bothCount;
  }

  async function loadListings() {
    try {
      const res = await fetch('/api/consign');
      let data = null;
      try {
        data = await res.json();
      } catch (_) {
        data = null;
      }
      if (!res.ok || !data || !data.ok) {
        renderConsignLoadError();
        return;
      }
      state.listings = Array.isArray(data.listings) ? data.listings : [];
      updateCounts();
      renderGrid();
    } catch (err) {
      renderConsignLoadError();
    }
  }

  function renderConsignLoadError() {
    const empty = document.getElementById('consign-empty');
    if (empty) empty.classList.add('hidden');
    const grid = document.getElementById('consign-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'col-span-3 text-center py-8 text-xs text-red-600';
    box.style.gridColumn = '1 / -1';
    box.setAttribute('role', 'alert');
    box.textContent = 'Lỗi kết nối Sàn Ký Gửi.';
    grid.appendChild(box);
  }

  document.addEventListener('DOMContentLoaded', function() {
    bindFilterBar();
    bindUploadForm();
    document.addEventListener('keydown', handleConsignModalKeydown);
    if (typeof MutationObserver === 'function' && document.body) {
      new MutationObserver(syncConsignScrollLock).observe(document.body, { attributes: true, attributeFilter: ['class', 'style'], subtree: true });
    }
    window.addEventListener('ck:auth-changed', function() {
      const focused = document.activeElement;
      const closingIds = ['trade-modal', 'deposit-modal'];
      const focusWillHide = closingIds.some(function(id) {
        const modal = document.getElementById(id);
        return modal && modal.contains(focused);
      });
      state.ownedListings = [];
      const content = document.getElementById('locker-content');
      if (content) content.textContent = 'Tài khoản đã thay đổi. Mở lại tủ giày để tải dữ liệu.';
      closeTradeModal({ restoreFocus: false });
      closeDepositModal({ restoreFocus: false });
      if (focusWillHide) {
        const active = getActiveConsignModal();
        const target = active ? (getConsignModalFocusables(active)[0] || active) : document.getElementById('btn-hero-my-locker');
        if (target && isConsignElementVisible(target)) target.focus();
      }
    });
    bindDepositModal();
    bindTradeModal();
    bindLockerModal();
    updateFeeCalculations();
    loadListings();
  });
})();
