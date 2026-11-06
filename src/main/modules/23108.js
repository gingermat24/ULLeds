module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.CURRENT_APP_PACKAGE_FILE_NAME =
      t.CURRENT_APP_INSTALLER_FILE_NAME =
      t.retry =
      t.MemoLazy =
      t.newError =
      t.XElement =
      t.parseXml =
      t.ProgressCallbackTransform =
      t.UUID =
      t.parseDn =
      t.githubUrl =
      t.getS3LikeProviderBaseUrl =
      t.configureRequestUrl =
      t.parseJson =
      t.safeStringifyJson =
      t.configureRequestOptionsFromUrl =
      t.configureRequestOptions =
      t.safeGetHeader =
      t.DigestTransform =
      t.HttpExecutor =
      t.createHttpError =
      t.HttpError =
      t.CancellationError =
      t.CancellationToken =
        void 0),
    (t.asArray = function (e) {
      return null == e ? [] : Array.isArray(e) ? e : [e];
    }));
  var n = r(88260);
  (Object.defineProperty(t, "CancellationToken", {
    enumerable: !0,
    get: function () {
      return n.CancellationToken;
    },
  }),
    Object.defineProperty(t, "CancellationError", {
      enumerable: !0,
      get: function () {
        return n.CancellationError;
      },
    }));
  var i = r(47767);
  (Object.defineProperty(t, "HttpError", {
    enumerable: !0,
    get: function () {
      return i.HttpError;
    },
  }),
    Object.defineProperty(t, "createHttpError", {
      enumerable: !0,
      get: function () {
        return i.createHttpError;
      },
    }),
    Object.defineProperty(t, "HttpExecutor", {
      enumerable: !0,
      get: function () {
        return i.HttpExecutor;
      },
    }),
    Object.defineProperty(t, "DigestTransform", {
      enumerable: !0,
      get: function () {
        return i.DigestTransform;
      },
    }),
    Object.defineProperty(t, "safeGetHeader", {
      enumerable: !0,
      get: function () {
        return i.safeGetHeader;
      },
    }),
    Object.defineProperty(t, "configureRequestOptions", {
      enumerable: !0,
      get: function () {
        return i.configureRequestOptions;
      },
    }),
    Object.defineProperty(t, "configureRequestOptionsFromUrl", {
      enumerable: !0,
      get: function () {
        return i.configureRequestOptionsFromUrl;
      },
    }),
    Object.defineProperty(t, "safeStringifyJson", {
      enumerable: !0,
      get: function () {
        return i.safeStringifyJson;
      },
    }),
    Object.defineProperty(t, "parseJson", {
      enumerable: !0,
      get: function () {
        return i.parseJson;
      },
    }),
    Object.defineProperty(t, "configureRequestUrl", {
      enumerable: !0,
      get: function () {
        return i.configureRequestUrl;
      },
    }));
  var o = r(96661);
  (Object.defineProperty(t, "getS3LikeProviderBaseUrl", {
    enumerable: !0,
    get: function () {
      return o.getS3LikeProviderBaseUrl;
    },
  }),
    Object.defineProperty(t, "githubUrl", {
      enumerable: !0,
      get: function () {
        return o.githubUrl;
      },
    }));
  var s = r(15834);
  Object.defineProperty(t, "parseDn", {
    enumerable: !0,
    get: function () {
      return s.parseDn;
    },
  });
  var a = r(39561);
  Object.defineProperty(t, "UUID", {
    enumerable: !0,
    get: function () {
      return a.UUID;
    },
  });
  var c = r(33024);
  Object.defineProperty(t, "ProgressCallbackTransform", {
    enumerable: !0,
    get: function () {
      return c.ProgressCallbackTransform;
    },
  });
  var l = r(2853);
  (Object.defineProperty(t, "parseXml", {
    enumerable: !0,
    get: function () {
      return l.parseXml;
    },
  }),
    Object.defineProperty(t, "XElement", {
      enumerable: !0,
      get: function () {
        return l.XElement;
      },
    }));
  var u = r(68046);
  Object.defineProperty(t, "newError", {
    enumerable: !0,
    get: function () {
      return u.newError;
    },
  });
  var p = r(53286);
  Object.defineProperty(t, "MemoLazy", {
    enumerable: !0,
    get: function () {
      return p.MemoLazy;
    },
  });
  var d = r(87286);
  (Object.defineProperty(t, "retry", {
    enumerable: !0,
    get: function () {
      return d.retry;
    },
  }),
    (t.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe"),
    (t.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z"));
};
