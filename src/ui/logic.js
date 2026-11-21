window.CK_DUNE_UI = {
    toast: function (m, t) { if (window.CK) window.CK.toast(m, t); },
    productCard: function (p, o) { return window.CK ? window.CK.productCard(p, o) : ''; },
    initCarousel: function (cfg) { return window.CK ? window.CK.initCarousel(cfg) : null; }
  };
