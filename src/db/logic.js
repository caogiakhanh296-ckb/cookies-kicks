window.CK_DUNE_DB = {
    findProduct: function (id) { return window.CK ? window.CK.getProduct(id) : null; },
    listProducts: function (opts) { return window.CK ? window.CK.getProducts(opts) : []; },
    sizing: function () { return window.CK_SIZING || null; }
  };
