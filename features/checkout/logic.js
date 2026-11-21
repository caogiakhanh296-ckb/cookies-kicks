(function () {
  'use strict';
  window.CK_FEATURES = window.CK_FEATURES || {};
  const feat = window.CK_FEATURES["checkout"] || { id: "checkout", state: {} };
  feat.markMounted = function () { feat.mountedAt = Date.now(); };
  window.CK_FEATURES["checkout"] = feat;
})();
