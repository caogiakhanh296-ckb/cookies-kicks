window.CK_DUNE_AUTH = {
    getUser: function () { return window.CK && window.CK.auth ? window.CK.auth.getUser() : null; },
    getToken: function () { return window.CK && window.CK.auth ? window.CK.auth.getToken() : ''; },
    refreshMe: function () { return window.CK && window.CK.auth ? window.CK.auth.refreshMe() : Promise.resolve(null); },
    logout: function () { if (window.CK && window.CK.auth) window.CK.auth.logout(); }
  };
