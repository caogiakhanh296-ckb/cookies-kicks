window.CK_DUNE_CORE = {
    read: function (k, fb) { return window.CK ? window.CK.read(k, fb) : fb; },
    write: function (k, v) { if (window.CK) window.CK.write(k, v); },
    formatVND: function (n) { return window.CK ? window.CK.formatVND(n) : String(n); },
    esc: function (s) { return window.CK ? window.CK.esc(s) : String(s || ''); }
  };
window.CK = window.CK || {};
window.CK.getConsignMode = function (type) {
  const value = String(type || '').trim().toUpperCase();
  const mode = value === 'TRADE' ? 'BOTH' : value;
  if (mode === 'TRADE_ONLY') return { mode: mode, label: 'Chỉ Trade', canTrade: true, canPass: false };
  if (mode === 'PASS') return { mode: mode, label: 'Chỉ Pass', canTrade: false, canPass: true };
  if (mode === 'BOTH') return { mode: mode, label: 'Trade & Pass', canTrade: true, canPass: true };
  return { mode: '', label: 'Không khả dụng', canTrade: false, canPass: false };
};
