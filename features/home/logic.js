(function () {
  'use strict';
  window.CK_FEATURES = window.CK_FEATURES || {};
  const feat = window.CK_FEATURES["home"] || { id: "home", state: {} };
  feat.markMounted = function () { feat.mountedAt = Date.now(); };
  window.CK_FEATURES["home"] = feat;
})();
