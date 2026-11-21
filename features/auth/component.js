(function () {
  'use strict';
  const app = document.getElementById('app');

  const state = {
    mode: 'login',
    identifier: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    showPw: false,
    busy: false,
    error: '',
    oauthConfig: { googleClientId: '', facebookAppId: '' }
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  fetch('/api/auth/config').then(r => r.json()).then(cfg => {
    if (cfg && cfg.ok) {
      state.oauthConfig = cfg;
      if (cfg.googleClientId) {
        loadOfficialGoogleSdk(cfg.googleClientId);
      }
      render();
    }
  }).catch(() => {});

  function renderGoogleBtn() {
    const btnWrap = document.getElementById('official-g-btn');
    if (btnWrap && window.google && window.google.accounts && state.oauthConfig.googleClientId) {
      btnWrap.innerHTML = '';
      window.google.accounts.id.renderButton(btnWrap, { theme: 'outline', size: 'large', width: 350 });
    }
  }

  function loadOfficialGoogleSdk(clientId) {
    if (document.getElementById('ck-gsi-sdk')) {
      renderGoogleBtn();
      return;
    }
    const s = document.createElement('script');
    s.id = 'ck-gsi-sdk';
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => {
      if (!window.google || !window.google.accounts) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response || !response.credential) return;
          try {
            const r = await fetch('/api/auth/google-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential })
            });
            const data = await r.json();
            if (data && data.ok) finishSuccess(data);
            else {
              state.error = (data && data.error) || 'Xác thực Google thất bại';
              render();
            }
          } catch (_) {
            state.error = 'Lỗi kết nối máy chủ';
            render();
          }
        }
      });
      renderGoogleBtn();
    };
    document.head.appendChild(s);
  }

  function finishSuccess(data) {
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({
          type: 'CK_OAUTH_SUCCESS',
          token: data.token,
          user: data.user
        }, window.location.origin);
      }
    } catch (_) {}
    try {
      localStorage.setItem('ck_auth_token', data.token);
      localStorage.setItem('ck_current_user', JSON.stringify(data.user));
    } catch (_) {}
    setTimeout(() => window.close(), 120);
  }

  async function handleLogin(e) {
    e.preventDefault();
    if (state.busy) return;
    const idEl = document.getElementById('inp-id');
    const pwEl = document.getElementById('inp-pw');
    const identifier = (idEl ? idEl.value : '').trim();
    const password = pwEl ? pwEl.value : '';
    if (!identifier || !password) {
      state.error = 'Vui lòng nhập Email/SĐT và mật khẩu.';
      render();
      return;
    }
    state.identifier = identifier;
    state.busy = true;
    state.error = '';
    render();
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await r.json();
      state.busy = false;
      if (!r.ok || !data || !data.ok) {
        state.error = (data && data.error) || 'Đăng nhập không thành công.';
        render();
        return;
      }
      finishSuccess(data);
    } catch (_) {
      state.busy = false;
      state.error = 'Không thể kết nối máy chủ.';
      render();
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (state.busy) return;
    const name = (document.getElementById('inp-name')?.value || '').trim();
    const phone = (document.getElementById('inp-phone')?.value || '').trim();
    const email = (document.getElementById('inp-email')?.value || '').trim();
    const password = document.getElementById('inp-pw')?.value || '';
    const confirmPassword = document.getElementById('inp-pw2')?.value || '';

    state.name = name;
    state.phone = phone;
    state.email = email;

    if (name.length < 2) {
      state.error = 'Vui lòng nhập họ tên (ít nhất 2 ký tự).';
      render();
      return;
    }
    if (!email && phone.replace(/\D/g, '').length < 9) {
      state.error = 'Vui lòng nhập Số điện thoại hoặc Email hợp lệ.';
      render();
      return;
    }
    if (password.length < 6) {
      state.error = 'Mật khẩu phải có ít nhất 6 ký tự.';
      render();
      return;
    }
    if (password !== confirmPassword) {
      state.error = 'Mật khẩu xác nhận không khớp.';
      render();
      return;
    }

    state.busy = true;
    state.error = '';
    render();
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password })
      });
      const data = await r.json();
      state.busy = false;
      if (!r.ok || !data || !data.ok) {
        state.error = (data && data.error) || 'Đăng ký không thành công.';
        render();
        return;
      }
      finishSuccess(data);
    } catch (_) {
      state.busy = false;
      state.error = 'Không thể kết nối máy chủ.';
      render();
    }
  }

  function render() {
    document.body.className = 'min-h-screen flex flex-col justify-between bg-[#f8f9fa]';
    const hasGoogle = Boolean(state.oauthConfig && state.oauthConfig.googleClientId);
    app.innerHTML = `
      <div class="google-card w-full max-w-[430px] p-8 sm:p-10">
        <div class="text-center mb-6">
          <img src="public/images/logo-black-crop.png" alt="Cookie's Kicks" class="h-9 mx-auto mb-3" />
          <h1 class="text-xl font-bold text-[#111111]">${state.mode === 'login' ? 'Đăng nhập Cookie&#39;s Kicks' : 'Tạo tài khoản Cookie&#39;s Kicks'}</h1>
          <p class="text-xs text-gray-500 mt-1">Theo dõi đơn Order 12–15 ngày &amp; Tủ giày Ký gửi chính chủ</p>
        </div>

        <div class="grid grid-cols-2 gap-2 p-1 rounded bg-gray-100 mb-5">
          <button type="button" id="tab-login" class="py-2 rounded text-xs font-bold transition-colors ${state.mode === 'login' ? 'bg-black text-white' : 'text-gray-600 hover:text-black'}">Đăng nhập</button>
          <button type="button" id="tab-register" class="py-2 rounded text-xs font-bold transition-colors ${state.mode === 'register' ? 'bg-black text-white' : 'text-gray-600 hover:text-black'}">Đăng ký mới</button>
        </div>

        ${hasGoogle ? `<div id="official-g-btn" class="mb-4 flex justify-center"></div>` : ''}

        ${state.error ? `<div class="mb-4 p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700 font-medium" role="alert">${esc(state.error)}</div>` : ''}

        ${state.mode === 'login' ? `
          <form id="f-login" class="space-y-4">
            <div>
              <label for="inp-id" class="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại hoặc Email</label>
              <input id="inp-id" type="text" value="${esc(state.identifier)}" class="g-input !h-11 !text-sm" placeholder="09xx... hoặc email@example.com" autocomplete="username" required />
            </div>
            <div>
              <label for="inp-pw" class="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu</label>
              <input id="inp-pw" type="${state.showPw ? 'text' : 'password'}" class="g-input !h-11 !text-sm" placeholder="••••••••" autocomplete="current-password" required />
            </div>
            <label for="chk-show-pw" class="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
              <input type="checkbox" id="chk-show-pw" ${state.showPw ? 'checked' : ''} class="w-4 h-4 accent-black" />
              Hiện mật khẩu
            </label>
            <div class="flex items-center justify-between pt-2">
              <button type="button" data-oauth-close class="text-xs font-semibold text-gray-500 hover:text-black">Đóng cửa sổ</button>
              <button type="submit" ${state.busy ? 'disabled' : ''} class="px-6 py-2.5 rounded bg-black hover:bg-gray-900 text-white font-bold text-xs uppercase tracking-wider transition-colors">
                ${state.busy ? 'Đang xử lý…' : 'Đăng nhập'}
              </button>
            </div>
          </form>
        ` : `
          <form id="f-register" class="space-y-3.5">
            <div>
              <label for="inp-name" class="block text-xs font-semibold text-gray-700 mb-1">Họ và tên</label>
              <input id="inp-name" type="text" value="${esc(state.name)}" class="g-input !h-11 !text-sm" placeholder="Nguyễn Văn A" autocomplete="name" required />
            </div>
            <div>
              <label for="inp-phone" class="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại nhận hàng</label>
              <input id="inp-phone" type="tel" value="${esc(state.phone)}" class="g-input !h-11 !text-sm" placeholder="09xxxxxxxx" autocomplete="tel" required />
            </div>
            <div>
              <label for="inp-email" class="block text-xs font-semibold text-gray-700 mb-1">Email (tuỳ chọn)</label>
              <input id="inp-email" type="email" value="${esc(state.email)}" class="g-input !h-11 !text-sm" placeholder="tenban@gmail.com" autocomplete="email" />
            </div>
            <div>
              <label for="inp-pw" class="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu bảo mật (≥ 6 ký tự)</label>
              <input id="inp-pw" type="${state.showPw ? 'text' : 'password'}" class="g-input !h-11 !text-sm" placeholder="••••••••" autocomplete="new-password" required />
            </div>
            <div>
              <label for="inp-pw2" class="block text-xs font-semibold text-gray-700 mb-1">Xác nhận lại mật khẩu</label>
              <input id="inp-pw2" type="${state.showPw ? 'text' : 'password'}" class="g-input !h-11 !text-sm" placeholder="••••••••" autocomplete="new-password" required />
            </div>
            <label for="chk-show-pw" class="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
              <input type="checkbox" id="chk-show-pw" ${state.showPw ? 'checked' : ''} class="w-4 h-4 accent-black" />
              Hiện mật khẩu
            </label>
            <div class="flex items-center justify-between pt-2">
              <button type="button" data-oauth-close class="text-xs font-semibold text-gray-500 hover:text-black">Đóng cửa sổ</button>
              <button type="submit" ${state.busy ? 'disabled' : ''} class="px-6 py-2.5 rounded bg-black hover:bg-gray-900 text-white font-bold text-xs uppercase tracking-wider transition-colors">
                ${state.busy ? 'Đang tạo…' : 'Tạo tài khoản'}
              </button>
            </div>
          </form>
        `}
      </div>
    `;

    document.getElementById('tab-login')?.addEventListener('click', () => {
      state.mode = 'login';
      state.error = '';
      render();
    });
    document.getElementById('tab-register')?.addEventListener('click', () => {
      state.mode = 'register';
      state.error = '';
      render();
    });
    document.getElementById('f-login')?.addEventListener('submit', handleLogin);
    document.getElementById('f-register')?.addEventListener('submit', handleRegister);
    document.getElementById('chk-show-pw')?.addEventListener('change', e => {
      state.showPw = e.target.checked;
      const p1 = document.getElementById('inp-pw');
      const p2 = document.getElementById('inp-pw2');
      if (p1) p1.type = state.showPw ? 'text' : 'password';
      if (p2) p2.type = state.showPw ? 'text' : 'password';
    });
    document.querySelectorAll('[data-oauth-close]').forEach(btn => {
      btn.addEventListener('click', () => window.close());
    });
    if (hasGoogle) renderGoogleBtn();
  }

  render();
})();
