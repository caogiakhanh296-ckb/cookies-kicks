window.CK_DUNE_API = {
    syncFromServer: function () { return window.CK ? window.CK.syncFromServer() : Promise.resolve(); },
    saveProducts: function (list) { if (window.CK) window.CK.saveProducts(list); },
    saveOrders: function (list) { return window.CK ? window.CK.saveOrdersToServer(list) : Promise.resolve(); },
    appendOrder: function (ord) { return window.CK ? window.CK.appendOrderToServer(ord) : Promise.resolve(ord); },
    uploadImage: function (dataUrl) { return window.CK ? window.CK.uploadImage(dataUrl) : Promise.resolve(dataUrl); }
  };
