(function () {
  'use strict';
  window.CK_FEATURES = window.CK_FEATURES || {};
  const feat = window.CK_FEATURES["posts"] || { id: "posts", state: {} };
  feat.markMounted = function () { feat.mountedAt = Date.now(); };
  window.CK_FEATURES["posts"] = feat;
})();
