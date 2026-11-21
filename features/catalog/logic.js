(function () {
  'use strict';
  window.CK_FEATURES = window.CK_FEATURES || {};
  const feat = window.CK_FEATURES["catalog"] || { id: "catalog", state: {} };
  feat.markMounted = function () { feat.mountedAt = Date.now(); };
  window.CK_FEATURES["catalog"] = feat;
})();
