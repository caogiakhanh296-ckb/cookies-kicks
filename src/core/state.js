(function () {
  const isGh = typeof window !== 'undefined' && window.location && /\.github\.io$/i.test(String(window.location.hostname || ''));
  if (typeof window !== 'undefined' && typeof window.fetch === 'function' && !window.__ckOrigFetch) {
    window.__ckOrigFetch = window.fetch.bind(window);
  }

  function memStore() {
    if (!window.__ckGhMemStore) window.__ckGhMemStore = {};
    return window.__ckGhMemStore;
  }

  function sGet(key, fallback) {
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage ? localStorage.getItem(key) : memStore()[key];
      if (raw == null || raw === '') return fallback;
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  }

  function sSet(key, val) {
    const raw = JSON.stringify(val);
    try {
      if (typeof localStorage !== 'undefined' && localStorage) localStorage.setItem(key, raw);
      else memStore()[key] = raw;
    } catch (_) {
      memStore()[key] = raw;
    }
  }

  function jsonRes(obj, status) {
    const code = status || 200;
    const body = JSON.stringify(obj);
    if (typeof Response === 'function') {
      return new Response(body, { status: code, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
    }
    return {
      ok: code >= 200 && code < 300,
      status: code,
      headers: { get: function (k) { return String(k).toLowerCase() === 'content-type' ? 'application/json' : null; } },
      text: async function () { return body; },
      json: async function () { return JSON.parse(body); },
    };
  }

  function normPhone(p) {
    return String(p || '').replace(/\D/g, '').replace(/^84/, '0');
  }

  function b64Enc(str) {
    const bytes = new TextEncoder().encode(String(str));
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function b64Dec(b64) {
    const pad = String(b64 || '').replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(pad);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function randHex(byteLen) {
    const n = byteLen || 16;
    const bytes = new Uint8Array(n);
    const c = (typeof window !== 'undefined' && window.crypto) || (typeof globalThis !== 'undefined' && globalThis.crypto) || null;
    if (c && c.getRandomValues) {
      c.getRandomValues(bytes);
    } else {
      for (let i = 0; i < n; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    let out = '';
    for (let i = 0; i < n; i++) out += bytes[i].toString(16).padStart(2, '0');
    return out;
  }

  async function hashPassword(pw, salt) {
    const raw = new TextEncoder().encode(String(salt) + ':' + String(pw));
    const c = (typeof window !== 'undefined' && window.crypto) || (typeof globalThis !== 'undefined' && globalThis.crypto) || null;
    if (c && c.subtle && c.subtle.digest) {
      const buf = await c.subtle.digest('SHA-256', raw);
      const arr = new Uint8Array(buf);
      let hex = '';
      for (let i = 0; i < arr.length; i++) hex += arr[i].toString(16).padStart(2, '0');
      return hex;
    }
    let h1 = 0x811c9dc5;
    let h2 = 0x9e3779b9;
    for (let i = 0; i < raw.length; i++) {
      h1 = Math.imul(h1 ^ raw[i], 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ raw[i], 0x85ebca6b) >>> 0;
    }
    return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  }

  function stripUser(u) {
    if (!u || typeof u !== 'object') return null;
    return {
      id: u.id,
      name: u.name || '',
      phone: u.phone || '',
      email: u.email || '',
      provider: u.provider || 'member',
      role: 'customer',
      province: u.province || '',
      district: u.district || '',
      ward: u.ward || '',
      street: u.street || '',
      createdAt: u.createdAt || '',
    };
  }

  function makeToken(u) {
    const payload = { uid: u.id, tv: Number(u.tokenVersion) || 1, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 };
    return 'ckgh.' + b64Enc(JSON.stringify(payload)) + '.local';
  }

  function verifyBearer(token) {
    const tok = String(token || '').trim();
    if (!tok.startsWith('ckgh.')) return null;
    const parts = tok.split('.');
    if (parts.length !== 3) return null;
    try {
      const data = JSON.parse(b64Dec(parts[1]));
      if (!data || !data.uid || (data.exp && Number(data.exp) < Date.now())) return null;
      const users = sGet('ck_users_db', []);
      if (!Array.isArray(users)) return null;
      const u = users.find(x => x && String(x.id) === String(data.uid));
      if (!u) return null;
      if (Number(u.tokenVersion || 1) !== Number(data.tv || 1)) return null;
      return u;
    } catch (_) {
      return null;
    }
  }

  function getHeader(init, reqInput, name) {
    const target = String(name || '').toLowerCase();
    const hInit = init && init.headers;
    if (hInit) {
      if (typeof hInit.get === 'function') {
        const v = hInit.get(name) || hInit.get(target);
        if (v) return v;
      } else if (typeof hInit === 'object') {
        const keys = Object.keys(hInit);
        for (let i = 0; i < keys.length; i++) {
          if (String(keys[i]).toLowerCase() === target && hInit[keys[i]]) return hInit[keys[i]];
        }
      }
    }
    if (reqInput && typeof reqInput === 'object' && reqInput.headers && typeof reqInput.headers.get === 'function') {
      return reqInput.headers.get(name) || reqInput.headers.get(target) || '';
    }
    return '';
  }

  async function parseJsonBody(init, reqInput) {
    try {
      if (init && init.body != null) {
        if (typeof init.body === 'string') return JSON.parse(init.body || '{}');
        if (typeof init.body === 'object') return init.body;
      }
      if (reqInput && typeof reqInput === 'object' && typeof reqInput.text === 'function') {
        const txt = await reqInput.clone().text();
        return txt ? JSON.parse(txt) : {};
      }
    } catch (_) {}
    return {};
  }

  function parseApiUrl(input) {
    const raw = typeof input === 'string' ? input : (input && typeof input === 'object' && input.url ? String(input.url) : '');
    if (!raw) return null;
    if (raw.startsWith('/api/')) {
      const u = new URL(raw, 'https://cookieskick.github.io');
      return { path: u.pathname, search: u.searchParams };
    }
    try {
      const base = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'https://cookieskick.github.io';
      const u = new URL(raw, base);
      if (u.pathname.startsWith('/api/')) return { path: u.pathname, search: u.searchParams };
      const idx = u.pathname.indexOf('/api/');
      if (idx >= 0) return { path: u.pathname.slice(idx), search: u.searchParams };
    } catch (_) {}
    return null;
  }

  function currentUserFromReq(init, reqInput) {
    const authHdr = getHeader(init, reqInput, 'authorization');
    const tok = authHdr.replace(/^Bearer\s+/i, '').trim();
    if (tok) return verifyBearer(tok);
    try {
      const storedTok = typeof localStorage !== 'undefined' && localStorage ? (localStorage.getItem('ck_auth_token') || '') : '';
      return storedTok ? verifyBearer(storedTok) : null;
    } catch (_) {
      return null;
    }
  }

  function findUserByIdentifier(users, rawId) {
    const idTrim = String(rawId || '').trim().toLowerCase();
    const idPhone = normPhone(rawId);
    return users.find(u => {
      if (!u) return false;
      if (idTrim && u.email && String(u.email).toLowerCase() === idTrim) return true;
      if (idPhone.length >= 9 && u.phone && normPhone(u.phone) === idPhone) return true;
      return false;
    }) || null;
  }

  const VOUCHERS = {
    HOMIEWITHCOOKIE: { code: 'HOMIEWITHCOOKIE', type: 'freeship', value: 50000, maxDiscount: 50000, minOrder: 0, description: 'Miễn phí vận chuyển toàn quốc 50.000₫ (Mã độc quyền Chủ Shop)' },
    COOKIE10: { code: 'COOKIE10', type: 'percent', value: 10, maxDiscount: 300000, minOrder: 0, description: 'Giảm 10% đơn đầu (tối đa 300K)' },
    BALLER100K: { code: 'BALLER100K', type: 'fixed', value: 100000, maxDiscount: 0, minOrder: 2000000, description: 'Giảm 100.000₫ cho đơn từ 2 triệu' },
    HUE150K: { code: 'HUE150K', type: 'fixed', value: 150000, maxDiscount: 0, minOrder: 3000000, description: 'Ưu đãi 150.000₫ cho đơn từ 3 triệu' },
    COOKIES100: { code: 'COOKIES100', type: 'fixed', value: 100000, maxDiscount: 0, minOrder: 1500000, description: 'Giảm 100.000₫ cho đơn từ 1.5 triệu' },
    WELCOME50: { code: 'WELCOME50', type: 'fixed', value: 50000, maxDiscount: 0, minOrder: 500000, description: 'Giảm 50.000₫ chào thành viên mới' },
    VIP200: { code: 'VIP200', type: 'fixed', value: 200000, maxDiscount: 0, minOrder: 3500000, description: 'Ưu đãi VIP 200.000₫ cho đơn từ 3.5 triệu' },
  };

  async function handleGhApi(input, init) {
    const parsed = parseApiUrl(input);
    if (!parsed) {
      return window.__ckOrigFetch ? window.__ckOrigFetch(input, init) : jsonRes({ ok: false, error: 'Fetch unavailable' }, 500);
    }
    const path = parsed.path;
    const search = parsed.search;
    const method = String((init && init.method) || (input && typeof input === 'object' && input.method) || 'GET').toUpperCase();

    if (path === '/api/auth/config' && method === 'GET') {
      return jsonRes({ ok: true, googleClientId: '', facebookAppId: '' }, 200);
    }

    if (path === '/api/auth/register' && method === 'POST') {
      const body = await parseJsonBody(init, input);
      const name = String(body.name || '').trim();
      const phone = normPhone(body.phone);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (name.length < 2) return jsonRes({ ok: false, error: 'Vui lòng nhập họ tên (ít nhất 2 ký tự).' }, 400);
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonRes({ ok: false, error: 'Địa chỉ Email không hợp lệ.' }, 400);
      if (!email && phone.length < 9) return jsonRes({ ok: false, error: 'Vui lòng nhập Số điện thoại hoặc Email hợp lệ.' }, 400);
      if (body.phone && phone.length < 9) return jsonRes({ ok: false, error: 'Số điện thoại không hợp lệ.' }, 400);
      if (password.length < 6) return jsonRes({ ok: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' }, 400);

      const rawUsers = sGet('ck_users_db', []);
      const users = Array.isArray(rawUsers) ? rawUsers.slice() : [];
      if (email && users.some(u => u && String(u.email || '').toLowerCase() === email)) {
        return jsonRes({ ok: false, error: 'Email này đã được đăng ký. Vui lòng đăng nhập.' }, 409);
      }
      if (phone && users.some(u => u && normPhone(u.phone) === phone)) {
        return jsonRes({ ok: false, error: 'Số điện thoại này đã được đăng ký. Vui lòng đăng nhập.' }, 409);
      }

      const salt = randHex(16);
      const passwordHash = await hashPassword(password, salt);
      const newUser = {
        id: 'u_' + randHex(8),
        name,
        phone,
        email,
        provider: 'member',
        role: 'customer',
        province: '',
        district: '',
        ward: '',
        street: '',
        tokenVersion: 1,
        salt,
        passwordHash,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      sSet('ck_users_db', users);
      const token = makeToken(newUser);
      return jsonRes({ ok: true, token, user: stripUser(newUser) }, 200);
    }

    if (path === '/api/auth/login' && method === 'POST') {
      const body = await parseJsonBody(init, input);
      const identifier = String(body.identifier || '').trim();
      const password = String(body.password || '');
      if (!identifier || !password) return jsonRes({ ok: false, error: 'Vui lòng nhập SĐT/Email và mật khẩu.' }, 400);
      const rawUsers = sGet('ck_users_db', []);
      const users = Array.isArray(rawUsers) ? rawUsers : [];
      const u = findUserByIdentifier(users, identifier);
      if (!u || !u.salt || !u.passwordHash) {
        return jsonRes({ ok: false, error: 'Tài khoản hoặc mật khẩu không chính xác.' }, 401);
      }
      const checkHash = await hashPassword(password, u.salt);
      if (checkHash !== u.passwordHash) {
        return jsonRes({ ok: false, error: 'Tài khoản hoặc mật khẩu không chính xác.' }, 401);
      }
      const token = makeToken(u);
      return jsonRes({ ok: true, token, user: stripUser(u) }, 200);
    }

    if (path === '/api/auth/logout' && method === 'POST') {
      return jsonRes({ ok: true }, 200);
    }

    if (path === '/api/auth/forgot-password' && method === 'POST') {
      const body = await parseJsonBody(init, input);
      const identifier = String(body.identifier || '').trim();
      const rawUsers = sGet('ck_users_db', []);
      const users = Array.isArray(rawUsers) ? rawUsers.slice() : [];
      const u = findUserByIdentifier(users, identifier);
      if (!u) return jsonRes({ ok: false, error: 'Không tìm thấy tài khoản khớp thông tin này.' }, 404);
      u.otpCode = String(Math.floor(100000 + Math.random() * 900000));
      u.otpExp = Date.now() + 10 * 60 * 1000;
      sSet('ck_users_db', users);
      return jsonRes({ ok: true, message: 'Đã ghi nhận yêu cầu. Nhắn Zalo 0988.561.909 để nhận mã OTP xác minh (hiệu lực 10 phút).' }, 200);
    }

    if (path === '/api/auth/reset-password' && method === 'POST') {
      const body = await parseJsonBody(init, input);
      const identifier = String(body.identifier || '').trim();
      const proof = String(body.recoveryProof || '').trim();
      const newPassword = String(body.newPassword || '');
      if (newPassword.length < 6) return jsonRes({ ok: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' }, 400);
      const rawUsers = sGet('ck_users_db', []);
      const users = Array.isArray(rawUsers) ? rawUsers.slice() : [];
      const u = findUserByIdentifier(users, identifier);
      if (!u || !u.otpCode || Number(u.otpExp || 0) < Date.now() || proof !== String(u.otpCode)) {
        return jsonRes({ ok: false, error: 'Mã OTP không đúng hoặc đã hết hạn.' }, 400);
      }
      const salt = randHex(16);
      u.salt = salt;
      u.passwordHash = await hashPassword(newPassword, salt);
      u.tokenVersion = (Number(u.tokenVersion) || 1) + 1;
      delete u.otpCode;
      delete u.otpExp;
      sSet('ck_users_db', users);
      const token = makeToken(u);
      return jsonRes({ ok: true, token, user: stripUser(u) }, 200);
    }

    if (path === '/api/me' && method === 'GET') {
      const u = currentUserFromReq(init, input);
      if (!u) return jsonRes({ ok: false, error: 'Phiên đăng nhập đã hết hạn.' }, 401);
      return jsonRes({ ok: true, user: stripUser(u) }, 200);
    }

    if (path === '/api/me' && method === 'PUT') {
      const u = currentUserFromReq(init, input);
      if (!u) return jsonRes({ ok: false, error: 'Phiên đăng nhập đã hết hạn.' }, 401);
      const body = await parseJsonBody(init, input);
      const rawUsers = sGet('ck_users_db', []);
      const users = Array.isArray(rawUsers) ? rawUsers.slice() : [];
      const target = users.find(x => x && String(x.id) === String(u.id));
      if (!target) return jsonRes({ ok: false, error: 'Không tìm thấy tài khoản.' }, 404);
      const nextEmail = body.email != null ? String(body.email).trim().toLowerCase() : target.email;
      const nextPhone = body.phone != null ? normPhone(body.phone) : target.phone;
      if (nextEmail && users.some(x => x && String(x.id) !== String(u.id) && String(x.email || '').toLowerCase() === nextEmail)) {
        return jsonRes({ ok: false, error: 'Email này đã được tài khoản khác sử dụng.' }, 409);
      }
      if (nextPhone && users.some(x => x && String(x.id) !== String(u.id) && normPhone(x.phone) === nextPhone)) {
        return jsonRes({ ok: false, error: 'Số điện thoại này đã được tài khoản khác sử dụng.' }, 409);
      }
      if (body.name != null && String(body.name).trim().length >= 2) target.name = String(body.name).trim();
      target.email = nextEmail;
      target.phone = nextPhone;
      ['province', 'district', 'ward', 'street'].forEach(k => {
        if (body[k] != null) target[k] = String(body[k]).trim();
      });
      sSet('ck_users_db', users);
      return jsonRes({ ok: true, user: stripUser(target) }, 200);
    }

    if (path === '/api/me/password' && method === 'POST') {
      const u = currentUserFromReq(init, input);
      if (!u) return jsonRes({ ok: false, error: 'Phiên đăng nhập đã hết hạn.' }, 401);
      const body = await parseJsonBody(init, input);
      const cur = String(body.currentPassword || '');
      const nw = String(body.newPassword || '');
      if (nw.length < 6) return jsonRes({ ok: false, error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' }, 400);
      const rawUsers = sGet('ck_users_db', []);
      const users = Array.isArray(rawUsers) ? rawUsers.slice() : [];
      const target = users.find(x => x && String(x.id) === String(u.id));
      if (!target) return jsonRes({ ok: false, error: 'Không tìm thấy tài khoản.' }, 404);
      const curHash = await hashPassword(cur, target.salt || '');
      if (curHash !== target.passwordHash) return jsonRes({ ok: false, error: 'Mật khẩu hiện tại không đúng.' }, 401);
      const salt = randHex(16);
      target.salt = salt;
      target.passwordHash = await hashPassword(nw, salt);
      target.tokenVersion = (Number(target.tokenVersion) || 1) + 1;
      sSet('ck_users_db', users);
      return jsonRes({ ok: true, token: makeToken(target), user: stripUser(target) }, 200);
    }

    if (path === '/api/me/orders' && method === 'GET') {
      const u = currentUserFromReq(init, input);
      if (!u) return jsonRes({ ok: false, error: 'Phiên đăng nhập đã hết hạn.' }, 401);
      const all = sGet('cookiesKicksOrders', []);
      const uEmail = String(u.email || '').trim().toLowerCase();
      const uPhone = normPhone(u.phone);
      const orders = (Array.isArray(all) ? all : []).filter(o => {
        if (!o) return false;
        if (o.userId && String(o.userId) === String(u.id)) return true;
        if (uEmail && String(o.email || '').trim().toLowerCase() === uEmail) return true;
        if (uPhone.length >= 9 && normPhone(o.phone) === uPhone) return true;
        return false;
      });
      return jsonRes({ ok: true, orders }, 200);
    }

    if (path === '/api/orders' && method === 'POST') {
      const u = currentUserFromReq(init, input);
      if (!u) return jsonRes({ ok: false, error: 'Vui lòng đăng nhập tài khoản trước khi đặt hàng.' }, 401);
      const body = await parseJsonBody(init, input);
      const items = Array.isArray(body.items) ? body.items : [];
      if (!items.length) return jsonRes({ ok: false, error: 'Giỏ hàng trống.' }, 400);
      const ordId = String(body.id || ('GIAY' + randHex(4).toUpperCase())).trim();
      const savedOrder = Object.assign({}, body, {
        id: ordId,
        userId: u.id,
        paid: 0,
        status: 'wait',
        receiptKey: String(body.receiptKey || randHex(8)),
        createdAt: String(body.createdAt || new Date().toISOString()),
      });
      const rawOrders = sGet('cookiesKicksOrders', []);
      const orders = Array.isArray(rawOrders) ? rawOrders.slice() : [];
      const idx = orders.findIndex(x => x && String(x.id) === ordId);
      if (idx >= 0) orders[idx] = savedOrder;
      else orders.unshift(savedOrder);
      sSet('cookiesKicksOrders', orders);
      return jsonRes({ ok: true, order: savedOrder }, 200);
    }

    if (path === '/api/orders/track' && method === 'GET') {
      const qRaw = String(search.get('q') || '').trim().toLowerCase().replace(/^#/, '');
      const qPhone = normPhone(qRaw);
      const u = currentUserFromReq(init, input);
      const all = sGet('cookiesKicksOrders', []);
      const orders = (Array.isArray(all) ? all : []).filter(o => {
        if (!o) return false;
        if (qRaw && String(o.id || '').toLowerCase() === qRaw) return true;
        if (qPhone.length >= 8 && normPhone(o.phone).includes(qPhone)) return true;
        return false;
      }).map(o => {
        const isOwner = u && (String(o.userId) === String(u.id) || (u.phone && normPhone(o.phone) === normPhone(u.phone)));
        if (isOwner) return o;
        return {
          id: o.id,
          date: o.date,
          createdAt: o.createdAt,
          etaWindow: o.etaWindow,
          status: o.status,
          product: o.product,
          items: o.items,
          total: o.total,
          paid: o.paid,
          tracking: o.tracking || '',
          name: '***',
          phone: '***',
          address: '***',
        };
      });
      return jsonRes({ ok: true, orders }, 200);
    }

    if (path === '/api/orders/receipt' && method === 'GET') {
      const id = String(search.get('id') || '').trim().toUpperCase();
      const key = String(search.get('key') || '').trim();
      const u = currentUserFromReq(init, input);
      const all = sGet('cookiesKicksOrders', []);
      const found = (Array.isArray(all) ? all : []).find(o => o && String(o.id || '').toUpperCase() === id);
      if (!found) return jsonRes({ ok: false, error: 'Không tìm thấy đơn hàng.' }, 404);
      const isOwner = u && String(found.userId) === String(u.id);
      if (!isOwner && key && found.receiptKey && key !== found.receiptKey) {
        return jsonRes({ ok: false, error: 'Không có quyền xem hóa đơn này.' }, 403);
      }
      return jsonRes({ ok: true, order: found }, 200);
    }

    if (path === '/api/stock-lock' && method === 'POST') {
      return jsonRes({ ok: true, locked: true, expiresIn: 900 }, 200);
    }

    if (path === '/api/vouchers/validate' && method === 'POST') {
      const body = await parseJsonBody(init, input);
      const code = String(body.code || '').trim().toUpperCase();
      const subtotal = Number(body.subtotal) || 0;
      const v = VOUCHERS[code];
      if (!v) return jsonRes({ ok: false, error: 'Mã “' + code + '” không hợp lệ hoặc đã hết hạn.' }, 404);
      if (subtotal < (Number(v.minOrder) || 0)) {
        return jsonRes({ ok: false, error: 'Mã ' + code + ' áp dụng cho đơn từ ' + Number(v.minOrder).toLocaleString('vi-VN') + '₫.' }, 400);
      }
      return jsonRes({ ok: true, freeShip: v.type === 'freeship', voucher: v }, 200);
    }

    if (path === '/api/payment/bank-token' && method === 'POST') {
      const body = await parseJsonBody(init, input);
      const acctTok = String(body.accountToken || '').trim();
      if (acctTok !== 'ck_acct_mb_0988561909_v1') {
        return jsonRes({ ok: false, error: 'Invalid accountToken' }, 400);
      }
      const payload = {
        acct: acctTok,
        amt: Math.max(0, Math.round(Number(body.amount) || 0)),
        ord: String(body.orderCode || '').trim(),
        exp: Date.now() + 900000,
      };
      return jsonRes({
        ok: true,
        bankSessionToken: 'bqr.' + b64Enc(JSON.stringify(payload)) + '.local',
        expiresIn: 900,
        accountToken: acctTok,
      }, 200);
    }

    if (path === '/api/payment/qr' && method === 'POST') {
      const body = await parseJsonBody(init, input);
      const acctTok = String(body.accountToken || '').trim();
      const sessTok = String(body.bankSessionToken || '').trim();
      if (acctTok !== 'ck_acct_mb_0988561909_v1' || !sessTok.startsWith('bqr.')) {
        return jsonRes({ ok: false, error: 'Invalid bankSessionToken' }, 401);
      }
      const amt = Math.max(0, Math.round(Number(body.amount) || 0));
      const ordCode = String(body.orderCode || '').trim();
      const qs = new URLSearchParams();
      if (amt > 0) qs.set('amount', String(amt));
      if (ordCode) qs.set('addInfo', ordCode);
      qs.set('accountName', 'DANG GIA KHIEM');
      const qrUrl = 'https://img.vietqr.io/image/MB-0988561909-compact2.png?' + qs.toString();
      return jsonRes({
        ok: true,
        method: 'SCAN_QR_OR_STK',
        qrUrl,
        stkTransfer: {
          bankId: 'MB',
          bankName: 'MB Bank',
          accountNo: '0988561909',
          accountName: 'DANG GIA KHIEM',
          amount: amt,
          content: ordCode,
        },
      }, 200);
    }

    if (path === '/api/consign' && method === 'GET') {
      const mine = search.get('mine') === '1';
      const all = sGet('ck_consign_db', []);
      const list = Array.isArray(all) ? all : [];
      if (mine) {
        const u = currentUserFromReq(init, input);
        if (!u) return jsonRes({ ok: false, error: 'Vui lòng đăng nhập để xem tủ giày.' }, 401);
        const uPhone = normPhone(u.phone);
        const owned = list.filter(x => x && (String(x.userId) === String(u.id) || (uPhone.length >= 9 && normPhone(x.ownerPhone) === uPhone)));
        return jsonRes({ ok: true, listings: owned }, 200);
      }
      const pub = list.filter(x => x && (x.status === 'approved' || x.status === 'sold')).map(x => {
        const copy = Object.assign({}, x);
        delete copy.ownerPhone;
        delete copy.payoutBank;
        return copy;
      });
      return jsonRes({ ok: true, listings: pub }, 200);
    }

    if (path === '/api/consign' && method === 'POST') {
      const u = currentUserFromReq(init, input);
      if (!u) return jsonRes({ ok: false, error: 'Vui lòng đăng nhập tài khoản để thực hiện.' }, 401);
      const body = await parseJsonBody(init, input);
      const all = sGet('ck_consign_db', []);
      const list = Array.isArray(all) ? all.slice() : [];
      const item = Object.assign({}, body, {
        id: 'CSG' + randHex(3).toUpperCase(),
        userId: u.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
        tradeOffers: [],
      });
      list.unshift(item);
      sSet('ck_consign_db', list);
      return jsonRes({ ok: true, listing: item }, 200);
    }

    if (path === '/api/products' && method === 'GET') {
      const list = Array.isArray(window.CK_BASE_PRODUCTS) ? window.CK_BASE_PRODUCTS : (Array.isArray(window.CK_PRODUCTS) ? window.CK_PRODUCTS : []);
      return jsonRes(list, 200);
    }

    if (path === '/api/posts' && method === 'GET') {
      const posts = Array.isArray(window.CK_POSTS) ? window.CK_POSTS : [];
      return jsonRes({ ok: true, posts }, 200);
    }

    if (path === '/api/reviews' && method === 'GET') {
      const pid = search.get('productId');
      const grp = search.get('group');
      const all = sGet('ck_reviews_db', []);
      const reviews = (Array.isArray(all) ? all : []).filter(r => {
        if (!r) return false;
        if (pid && String(r.productId) !== String(pid)) return false;
        if (grp && String(r.groupKey) !== String(grp)) return false;
        return true;
      });
      return jsonRes({ ok: true, reviews }, 200);
    }

    if (path === '/api/reviews' && method === 'POST') {
      const body = await parseJsonBody(init, input);
      const all = sGet('ck_reviews_db', []);
      const reviews = Array.isArray(all) ? all.slice() : [];
      const rev = Object.assign({}, body, { id: 'rev_' + randHex(4), createdAt: new Date().toISOString() });
      reviews.unshift(rev);
      sSet('ck_reviews_db', reviews);
      return jsonRes({ ok: true, review: rev }, 200);
    }

    if (path === '/api/upload' && method === 'POST') {
      const body = await parseJsonBody(init, input);
      const dataUrl = String(body.dataUrl || '');
      if (!dataUrl.startsWith('data:image/')) return jsonRes({ ok: false, error: 'Dữ liệu ảnh không hợp lệ.' }, 400);
      return jsonRes({ ok: true, url: dataUrl }, 200);
    }

    return jsonRes({ ok: false, error: 'Unsupported endpoint on static storefront: ' + path }, 404);
  }

  if (typeof window !== 'undefined') {
    window.__ckGhApiHandler = handleGhApi;
    if (isGh && typeof window.fetch === 'function') {
      window.__ckGhApiHooked = true;
      window.fetch = function (input, init) {
        if (parseApiUrl(input)) {
          return handleGhApi(input, init);
        }
        return window.__ckOrigFetch ? window.__ckOrigFetch(input, init) : Promise.reject(new Error('Fetch unavailable'));
      };
    }
  }
})();
window.CK_CORE = {
  APP_NAME: "Cookie's Kicks",
  VERSION: '5.5.0',
  STORAGE_KEYS: ['ck_cart', 'ck_products_v60', 'cookiesKicksOrders', 'ck_wish', 'ck_current_user', 'ck_users_db'],
  BOOT_TIME: Date.now()
};
window.CK_DUNE = window.CK_DUNE || { version: '5.5.0', layers: ['core', 'db', 'api', 'auth', 'ui', 'jobs'] };
