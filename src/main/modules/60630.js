module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.UpdaterSignal =
      t.UPDATE_DOWNLOADED =
      t.DOWNLOAD_PROGRESS =
      t.NsisUpdater =
      t.MacUpdater =
      t.RpmUpdater =
      t.DebUpdater =
      t.AppImageUpdater =
      t.Provider =
      t.CancellationToken =
      t.NoOpLogger =
      t.AppUpdater =
      t.BaseUpdater =
        void 0));
  const n = r(23108);
  Object.defineProperty(t, "CancellationToken", {
    enumerable: !0,
    get: function () {
      return n.CancellationToken;
    },
  });
  const i = r(45768),
    o = r(16928);
  var s = r(43245);
  Object.defineProperty(t, "BaseUpdater", {
    enumerable: !0,
    get: function () {
      return s.BaseUpdater;
    },
  });
  var a = r(75807);
  (Object.defineProperty(t, "AppUpdater", {
    enumerable: !0,
    get: function () {
      return a.AppUpdater;
    },
  }),
    Object.defineProperty(t, "NoOpLogger", {
      enumerable: !0,
      get: function () {
        return a.NoOpLogger;
      },
    }));
  var c = r(29721);
  Object.defineProperty(t, "Provider", {
    enumerable: !0,
    get: function () {
      return c.Provider;
    },
  });
  var l = r(66762);
  Object.defineProperty(t, "AppImageUpdater", {
    enumerable: !0,
    get: function () {
      return l.AppImageUpdater;
    },
  });
  var u = r(943);
  Object.defineProperty(t, "DebUpdater", {
    enumerable: !0,
    get: function () {
      return u.DebUpdater;
    },
  });
  var p = r(62365);
  Object.defineProperty(t, "RpmUpdater", {
    enumerable: !0,
    get: function () {
      return p.RpmUpdater;
    },
  });
  var d = r(74927);
  Object.defineProperty(t, "MacUpdater", {
    enumerable: !0,
    get: function () {
      return d.MacUpdater;
    },
  });
  var f = r(26579);
  let h;
  (Object.defineProperty(t, "NsisUpdater", {
    enumerable: !0,
    get: function () {
      return f.NsisUpdater;
    },
  }),
    Object.defineProperty(t, "autoUpdater", {
      enumerable: !0,
      get: () =>
        h ||
        (function () {
          if ("win32" === process.platform) h = new (r(26579).NsisUpdater)();
          else if ("darwin" === process.platform) h = new (r(74927).MacUpdater)();
          else {
            h = new (r(66762).AppImageUpdater)();
            try {
              const e = o.join(process.resourcesPath, "package-type");
              if (!(0, i.existsSync)(e)) return h;
              console.info("Checking for beta autoupdate feature for deb/rpm distributions");
              const t = (0, i.readFileSync)(e).toString().trim();
              switch ((console.info("Found package-type:", t), t)) {
                case "deb":
                  h = new (r(943).DebUpdater)();
                  break;
                case "rpm":
                  h = new (r(62365).RpmUpdater)();
              }
            } catch (e) {
              console.warn(
                "Unable to detect 'package-type' for autoUpdater (beta rpm/deb support). If you'd like to expand support, please consider contributing to electron-builder",
                e.message,
              );
            }
          }
          return h;
        })(),
    }),
    (t.DOWNLOAD_PROGRESS = "download-progress"),
    (t.UPDATE_DOWNLOADED = "update-downloaded"),
    (t.UpdaterSignal = class {
      constructor(e) {
        this.emitter = e;
      }
      login(e) {
        g(this.emitter, "login", e);
      }
      progress(e) {
        g(this.emitter, t.DOWNLOAD_PROGRESS, e);
      }
      updateDownloaded(e) {
        g(this.emitter, t.UPDATE_DOWNLOADED, e);
      }
      updateCancelled(e) {
        g(this.emitter, "update-cancelled", e);
      }
    }));
  const m = !1;
  function g(e, t, r) {
    m
      ? e.on(t, (...e) => {
          (console.log("%s %s", t, e), r(...e));
        })
      : e.on(t, r);
  }
};
