(!(function () {
  try {
    var e =
        "undefined" != typeof window
          ? window
          : "undefined" != typeof global
            ? global
            : "undefined" != typeof globalThis
              ? globalThis
              : "undefined" != typeof self
                ? self
                : {},
      t = new e.Error().stack;
    t &&
      ((e._sentryDebugIds = e._sentryDebugIds || {}),
      (e._sentryDebugIds[t] = "e94499ca-a27c-4cdd-8978-e438cb544c21"),
      (e._sentryDebugIdIdentifier =
        "sentry-dbid-e94499ca-a27c-4cdd-8978-e438cb544c21"));
  } catch (e) {}
})(),
  (() => {
    var e = {
        934: (e, t) => {
          "use strict";
          (Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.getElectronBinding = void 0),
            (t.getElectronBinding = (e) =>
              process._linkedBinding
                ? process._linkedBinding("electron_common_" + e)
                : process.electronBinding
                  ? process.electronBinding(e)
                  : null));
        },
        230: (e, t, n) => {
          "use strict";
          var r, o;
          (Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.browserModuleNames = t.commonModuleNames = void 0));
          const i = n(934);
          ((t.commonModuleNames = ["clipboard", "nativeImage", "shell"]),
            (t.browserModuleNames = [
              "app",
              "autoUpdater",
              "BaseWindow",
              "BrowserView",
              "BrowserWindow",
              "contentTracing",
              "crashReporter",
              "dialog",
              "globalShortcut",
              "ipcMain",
              "inAppPurchase",
              "Menu",
              "MenuItem",
              "nativeTheme",
              "net",
              "netLog",
              "MessageChannelMain",
              "Notification",
              "powerMonitor",
              "powerSaveBlocker",
              "protocol",
              "pushNotifications",
              "safeStorage",
              "screen",
              "session",
              "ShareMenu",
              "systemPreferences",
              "TopLevelWindow",
              "TouchBar",
              "Tray",
              "utilityProcess",
              "View",
              "webContents",
              "WebContentsView",
              "webFrameMain",
            ].concat(t.commonModuleNames)));
          const s = i.getElectronBinding("features");
          (!1 !==
            (null === (r = null == s ? void 0 : s.isDesktopCapturerEnabled) ||
            void 0 === r
              ? void 0
              : r.call(s)) && t.browserModuleNames.push("desktopCapturer"),
            !1 !==
              (null === (o = null == s ? void 0 : s.isViewApiEnabled) ||
              void 0 === o
                ? void 0
                : o.call(s)) && t.browserModuleNames.push("ImageView"));
        },
        855: (e, t, n) => {
          "use strict";
          (Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.deserialize =
              t.serialize =
              t.isSerializableObject =
              t.isPromise =
                void 0));
          const r = n(288);
          t.isPromise = function (e) {
            return (
              e &&
              e.then &&
              e.then instanceof Function &&
              e.constructor &&
              e.constructor.reject &&
              e.constructor.reject instanceof Function &&
              e.constructor.resolve &&
              e.constructor.resolve instanceof Function
            );
          };
          const o = [Boolean, Number, String, Date, Error, RegExp, ArrayBuffer];
          function i(e) {
            return (
              null === e ||
              ArrayBuffer.isView(e) ||
              o.some((t) => e instanceof t)
            );
          }
          t.isSerializableObject = i;
          const s = function (e, t) {
            const n = Object.entries(e).map(([e, n]) => [e, t(n)]);
            return Object.fromEntries(n);
          };
          ((t.serialize = function e(t) {
            return t && t.constructor && "NativeImage" === t.constructor.name
              ? (function (e) {
                  const t = [],
                    n = e.getScaleFactors();
                  if (1 === n.length) {
                    const r = n[0],
                      o = e.getSize(r),
                      i = e.toBitmap({ scaleFactor: r });
                    t.push({ scaleFactor: r, size: o, buffer: i });
                  } else
                    for (const r of n) {
                      const n = e.getSize(r),
                        o = e.toDataURL({ scaleFactor: r });
                      t.push({ scaleFactor: r, size: n, dataURL: o });
                    }
                  return {
                    __ELECTRON_SERIALIZED_NativeImage__: !0,
                    representations: t,
                  };
                })(t)
              : Array.isArray(t)
                ? t.map(e)
                : i(t)
                  ? t
                  : t instanceof Object
                    ? s(t, e)
                    : t;
          }),
            (t.deserialize = function e(t) {
              return t && t.__ELECTRON_SERIALIZED_NativeImage__
                ? (function (e) {
                    const t = r.nativeImage.createEmpty();
                    if (1 === e.representations.length) {
                      const {
                          buffer: n,
                          size: r,
                          scaleFactor: o,
                        } = e.representations[0],
                        { width: i, height: s } = r;
                      t.addRepresentation({
                        buffer: n,
                        scaleFactor: o,
                        width: i,
                        height: s,
                      });
                    } else
                      for (const n of e.representations) {
                        const { dataURL: e, size: r, scaleFactor: o } = n,
                          { width: i, height: s } = r;
                        t.addRepresentation({
                          dataURL: e,
                          scaleFactor: o,
                          width: i,
                          height: s,
                        });
                      }
                    return t;
                  })(t)
                : Array.isArray(t)
                  ? t.map(e)
                  : i(t)
                    ? t
                    : t instanceof Object
                      ? s(t, e)
                      : t;
            }));
        },
        109: (e, t, n) => {
          "use strict";
          (Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.CallbacksRegistry = void 0),
            (t.CallbacksRegistry = class {
              constructor() {
                ((this.nextId = 0),
                  (this.callbacks = {}),
                  (this.callbackIds = new WeakMap()),
                  (this.locationInfo = new WeakMap()));
              }
              add(e) {
                let t = this.callbackIds.get(e);
                if (null != t) return t;
                ((t = this.nextId += 1),
                  (this.callbacks[t] = e),
                  this.callbackIds.set(e, t));
                const n = /at (.*)/gi,
                  r = new Error().stack;
                if (!r) return t;
                let o, i;
                for (; null !== (i = n.exec(r));) {
                  const e = i[1];
                  if (e.includes("(native)")) continue;
                  if (e.includes("(<anonymous>)")) continue;
                  if (e.includes("callbacks-registry.js")) continue;
                  if (e.includes("remote.js")) continue;
                  if (e.includes("@electron/remote/dist")) continue;
                  const t = /([^/^)]*)\)?$/gi.exec(e);
                  t && (o = t[1]);
                  break;
                }
                return (this.locationInfo.set(e, o), t);
              }
              get(e) {
                return this.callbacks[e] || function () {};
              }
              getLocation(e) {
                return this.locationInfo.get(e);
              }
              apply(e, ...t) {
                return this.get(e).apply(n.g, ...t);
              }
              remove(e) {
                const t = this.callbacks[e];
                t && (this.callbackIds.delete(t), delete this.callbacks[e]);
              }
            }));
        },
        413: function (e, t, n) {
          "use strict";
          var r =
              (this && this.__createBinding) ||
              (Object.create
                ? function (e, t, n, r) {
                    (void 0 === r && (r = n),
                      Object.defineProperty(e, r, {
                        enumerable: !0,
                        get: function () {
                          return t[n];
                        },
                      }));
                  }
                : function (e, t, n, r) {
                    (void 0 === r && (r = n), (e[r] = t[n]));
                  }),
            o =
              (this && this.__exportStar) ||
              function (e, t) {
                for (var n in e)
                  "default" === n ||
                    Object.prototype.hasOwnProperty.call(t, n) ||
                    r(t, e, n);
              };
          if (
            (Object.defineProperty(t, "__esModule", { value: !0 }),
            "browser" === process.type)
          )
            throw new Error(
              '"@electron/remote" cannot be required in the browser process. Instead require("@electron/remote/main").',
            );
          o(n(387), t);
        },
        387: (e, t, n) => {
          "use strict";
          (Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.createFunctionWithReturnValue =
              t.getGlobal =
              t.getCurrentWebContents =
              t.getCurrentWindow =
              t.getBuiltin =
                void 0));
          const r = n(109),
            o = n(855),
            i = n(288),
            s = n(230),
            c = n(934),
            { Promise: a } = n.g,
            u = new r.CallbacksRegistry(),
            d = new Map(),
            l = new FinalizationRegistry((e) => {
              const t = d.get(e);
              void 0 !== t &&
                void 0 === t.deref() &&
                (d.delete(e),
                i.ipcRenderer.send("REMOTE_BROWSER_DEREFERENCE", g, e, 0));
            }),
            p = new WeakMap(),
            f = new WeakSet(),
            g =
              process.contextId ||
              (function () {
                const e = c.getElectronBinding("v8_util");
                if (e) return e.getHiddenValue(n.g, "contextId");
                throw new Error(
                  "Electron >=v13.0.0-beta.6 required to support sandboxed renderers",
                );
              })();
          process.on("exit", () => {
            i.ipcRenderer.send("REMOTE_BROWSER_CONTEXT_RELEASE", g);
          });
          const y = Symbol("is-remote-proxy");
          function v(e, t = new Set()) {
            const n = (e) => {
              if (t.has(e)) return { type: "value", value: null };
              if (e && e.constructor && "NativeImage" === e.constructor.name)
                return { type: "nativeimage", value: o.serialize(e) };
              if (Array.isArray(e)) {
                t.add(e);
                const n = { type: "array", value: v(e, t) };
                return (t.delete(e), n);
              }
              if (e instanceof Buffer) return { type: "buffer", value: e };
              if (o.isSerializableObject(e)) return { type: "value", value: e };
              if ("object" == typeof e) {
                if (o.isPromise(e))
                  return {
                    type: "promise",
                    then: n(function (t, n) {
                      e.then(t, n);
                    }),
                  };
                if (p.has(e)) return { type: "remote-object", id: p.get(e) };
                const r = {
                  type: "object",
                  name: e.constructor ? e.constructor.name : "",
                  members: [],
                };
                t.add(e);
                for (const t in e) r.members.push({ name: t, value: n(e[t]) });
                return (t.delete(e), r);
              }
              return "function" == typeof e && f.has(e)
                ? { type: "function-with-return-value", value: n(e()) }
                : "function" == typeof e
                  ? {
                      type: "function",
                      id: u.add(e),
                      location: u.getLocation(e),
                      length: e.length,
                    }
                  : { type: "value", value: e };
            };
            return e.map(n);
          }
          function b(e, t, n, r) {
            if (Array.isArray(r))
              for (const o of r) {
                if (Object.prototype.hasOwnProperty.call(t, o.name)) continue;
                const r = { enumerable: o.enumerable };
                if ("method" === o.type) {
                  const t = function (...e) {
                    let r;
                    return (
                      (r =
                        this && this.constructor === t
                          ? "REMOTE_BROWSER_MEMBER_CONSTRUCTOR"
                          : "REMOTE_BROWSER_MEMBER_CALL"),
                      h(i.ipcRenderer.sendSync(r, g, n, o.name, v(e)))
                    );
                  };
                  let s = R(t, n, o.name);
                  ((r.get = () => ((s.ref = e), s)),
                    (r.set = (e) => ((s = e), e)),
                    (r.configurable = !0));
                } else
                  "get" === o.type &&
                    ((r.get = () =>
                      h(
                        i.ipcRenderer.sendSync(
                          "REMOTE_BROWSER_MEMBER_GET",
                          g,
                          n,
                          o.name,
                        ),
                      )),
                    o.writable &&
                      (r.set = (e) => {
                        const t = v([e]),
                          r = i.ipcRenderer.sendSync(
                            "REMOTE_BROWSER_MEMBER_SET",
                            g,
                            n,
                            o.name,
                            t,
                          );
                        return (null != r && h(r), e);
                      }));
                Object.defineProperty(t, o.name, r);
              }
          }
          function E(e, t, n, r) {
            if (null === r) return;
            const o = {};
            (b(e, o, n, r.members),
              E(e, o, n, r.proto),
              Object.setPrototypeOf(t, o));
          }
          function R(e, t, n) {
            let r = !1;
            const o = () => {
              if (r) return;
              r = !0;
              const o = i.ipcRenderer.sendSync(
                "REMOTE_BROWSER_MEMBER_GET",
                g,
                t,
                n,
              );
              b(e, e, o.id, o.members);
            };
            return new Proxy(e, {
              set: (e, t, n) => ("ref" !== t && o(), (e[t] = n), !0),
              get: (e, t) => {
                if (t === y) return !0;
                Object.prototype.hasOwnProperty.call(e, t) || o();
                const n = e[t];
                return "toString" === t && "function" == typeof n
                  ? n.bind(e)
                  : n;
              },
              ownKeys: (e) => (o(), Object.getOwnPropertyNames(e)),
              getOwnPropertyDescriptor: (e, t) =>
                Object.getOwnPropertyDescriptor(e, t) ||
                (o(), Object.getOwnPropertyDescriptor(e, t)),
            });
          }
          function h(e) {
            if (!e) return {};
            if ("value" === e.type) return e.value;
            if ("array" === e.type) return e.members.map((e) => h(e));
            if ("nativeimage" === e.type) return o.deserialize(e.value);
            if ("buffer" === e.type)
              return Buffer.from(
                e.value.buffer,
                e.value.byteOffset,
                e.value.byteLength,
              );
            if ("promise" === e.type) return a.resolve({ then: h(e.then) });
            if ("error" === e.type) return m(e);
            if ("exception" === e.type)
              throw "error" === e.value.type
                ? m(e.value)
                : new Error(
                    `Unexpected value type in exception: ${e.value.type}`,
                  );
            {
              let t;
              if ("id" in e) {
                const t = (function (e) {
                  const t = d.get(e);
                  if (void 0 !== t) {
                    const e = t.deref();
                    if (void 0 !== e) return e;
                  }
                })(e.id);
                if (void 0 !== t) return t;
              }
              if ("function" === e.type) {
                const n = function (...t) {
                  let r;
                  return (
                    (r =
                      this && this.constructor === n
                        ? "REMOTE_BROWSER_CONSTRUCTOR"
                        : "REMOTE_BROWSER_FUNCTION_CALL"),
                    h(i.ipcRenderer.sendSync(r, g, e.id, v(t)))
                  );
                };
                t = n;
              } else t = {};
              return (
                b(t, t, e.id, e.members),
                E(t, t, e.id, e.proto),
                t.constructor &&
                  t.constructor[y] &&
                  Object.defineProperty(t.constructor, "name", {
                    value: e.name,
                  }),
                p.set(t, e.id),
                (function (e, t) {
                  const n = new WeakRef(t);
                  (d.set(e, n), l.register(t, e));
                })(e.id, t),
                t
              );
            }
          }
          function m(e) {
            const t = e.value;
            for (const { name: n, value: r } of e.members) t[n] = h(r);
            return t;
          }
          function _(e, t) {
            i.ipcRenderer.on(e, (n, r, o, ...s) => {
              "number" != typeof n.senderId ||
              0 === n.senderId ||
              void 0 === n.senderId
                ? r === g
                  ? t(o, ...s)
                  : i.ipcRenderer.send(
                      "REMOTE_BROWSER_WRONG_CONTEXT_ERROR",
                      g,
                      r,
                      o,
                    )
                : console.error(
                    `Message ${e} sent by unexpected WebContents (${n.senderId})`,
                  );
            });
          }
          const O = process.argv.includes("--enable-api-filtering-logging");
          function S() {
            const e = { stack: void 0 };
            return (O && Error.captureStackTrace(e, S), e.stack);
          }
          (_("REMOTE_RENDERER_CALLBACK", (e, t) => {
            u.apply(e, h(t));
          }),
            _("REMOTE_RENDERER_RELEASE_CALLBACK", (e) => {
              u.remove(e);
            }),
            (t.require = (e) =>
              h(i.ipcRenderer.sendSync("REMOTE_BROWSER_REQUIRE", g, e, S()))),
            (t.getBuiltin = function (e) {
              return h(
                i.ipcRenderer.sendSync("REMOTE_BROWSER_GET_BUILTIN", g, e, S()),
              );
            }),
            (t.getCurrentWindow = function () {
              return h(
                i.ipcRenderer.sendSync(
                  "REMOTE_BROWSER_GET_CURRENT_WINDOW",
                  g,
                  S(),
                ),
              );
            }),
            (t.getCurrentWebContents = function () {
              return h(
                i.ipcRenderer.sendSync(
                  "REMOTE_BROWSER_GET_CURRENT_WEB_CONTENTS",
                  g,
                  S(),
                ),
              );
            }),
            (t.getGlobal = function (e) {
              return h(
                i.ipcRenderer.sendSync("REMOTE_BROWSER_GET_GLOBAL", g, e, S()),
              );
            }),
            Object.defineProperty(t, "process", {
              enumerable: !0,
              get: () => t.getGlobal("process"),
            }),
            (t.createFunctionWithReturnValue = function (e) {
              const t = () => e;
              return (f.add(t), t);
            }),
            s.browserModuleNames.forEach((e) => {
              Object.defineProperty(t, e, {
                enumerable: !0,
                get: () => t.getBuiltin(e),
              });
            }));
        },
        303: (e, t, n) => {
          e.exports = n(413);
        },
        288: (e) => {
          "use strict";
          e.exports = require("electron");
        },
        474: (e) => {
          "use strict";
          e.exports = require("electron/renderer");
        },
      },
      t = {};
    function n(r) {
      var o = t[r];
      if (void 0 !== o) return o.exports;
      var i = (t[r] = { exports: {} });
      return (e[r].call(i.exports, i, i.exports, n), i.exports);
    }
    ((n.g = (function () {
      if ("object" == typeof globalThis) return globalThis;
      try {
        return this || new Function("return this")();
      } catch (e) {
        if ("object" == typeof window) return window;
      }
    })()),
      void 0 !== n && (n.ab = "/native_modules/"));
    const { contextBridge: r, ipcRenderer: o } = n(474),
      i = n(303),
      s = i.getGlobal("store"),
      c = i.getGlobal("app"),
      a = i.getGlobal("shell"),
      u = i.getGlobal("QuikLight"),
      d = i.getGlobal("os"),
      l = i.getGlobal("path"),
      p = i.getGlobal("macOSVersion");
    (r.exposeInMainWorld("electronAPI", {
      getDisplays: () => o.invoke("getDisplays"),
      getMachineID: () => o.invoke("getMachineID"),
      hasScreenRecordingPermission: () =>
        o.invoke("hasScreenRecordingPermission"),
      getOpenAtLoginStatus: () => o.invoke("getOpenAtLoginStatus"),
      getDeviceData: (e) => o.on("getDeviceData", (t, n) => e(n)),
      getCompressColor: (e, t) => o.invoke("getCompressColor", e, t),
      onDisconnect: (e) => o.on("disconnect", (t, n) => e(n)),
      onDisplayAdded: (e) => o.on("displayAdded", (t, n) => e(n)),
      onDisplayRemoved: (e) => o.on("displayRemoved", (t, n) => e(n)),
      onReportSyncScreen: (e) => o.on("reportSyncScreen", (t, n) => e(n)),
      checkUpdateReply: (e) => o.on("checkUpdateReply", (t, n) => e(n)),
      launchAtStartup: (e) => o.send("launchAtStartup", e),
      setScreenWorker: (e) => o.send("setScreenWorker", e),
      resetSoftware: () => o.send("resetSoftware"),
      setDongleScan: (e) => o.send("setDongleScan", e),
      updateConnectDevices: (e, t, n) =>
        o.send("updateConnectDevices", e, t, n),
      enableTransparency: (e) => o.send("enableTransparency", e),
      updateBreakingSyncScreen: (e) => o.invoke("updateBreakingSyncScreen", e),
      checkUpdate: () => o.send("checkUpdate"),
      writeData: (e, t, n, r, i, s, c) =>
        o.invoke("writeData", e, t, n, r, i, s, c),
      sendStaticColor: (e) => o.invoke("sendStaticColor", e),
      sendSwitch: (e) => o.invoke("sendSwitch", e),
      sendBrightness: (e) => o.invoke("sendBrightness", e),
      sendWhiteBright: (e, t) => o.invoke("sendWhiteBright", e, t),
      sendLedEffect: (e, t) => o.invoke("sendLedEffect", e, t),
      sendDynamicSpeed: (e) => o.invoke("sendDynamicSpeed", e),
      sendSoundSensitivity: (e) => o.invoke("sendSoundSensitivity", e),
      sendRhythmColor: (e) => o.invoke("sendRhythmColor", e),
      sendRhythmType: (e) => o.invoke("sendRhythmType", e),
      sendLineSequence: (e, t) => o.invoke("sendLineSequence", e, t),
      sendDeviceLocation: (e) => o.invoke("sendDeviceLocation", e),
      sendEdgeNumber: (e) => o.invoke("sendEdgeNumber", e),
      sendPowerDirection: (e) => o.invoke("sendPowerDirection", e),
      sendLedQuantity: (e) => o.invoke("sendLedQuantity", e),
      startAudioWorker: (e) => o.invoke("startAudioWorker", e),
      openExternal: (e) => o.invoke("openExternal", e),
      defaultDevice: () => o.invoke("defaultDevice"),
      defaultGroupDevice: () => o.invoke("defaultGroupDevice"),
      findByUUID: (e) => o.invoke("findByUUID", e),
      updateByUUID: (e) => o.invoke("updateByUUID", e),
      insertOne: (e) => o.invoke("insertOne", e),
      updateGroupDevice: (e) => o.invoke("updateGroupDevice", e),
      getFeedback: (e, t, n, r) => o.invoke("getFeedback", e, t, n, r),
      app: c,
      shell: a,
    }),
      r.exposeInMainWorld("pluginsAPI", { macOSVersion: p }),
      r.exposeInMainWorld("nodeAPI", { os: d, path: l }),
      r.exposeInMainWorld("store", {
        get: (e) => s.get(e),
        set: (e, t) => s.set(e, t),
      }),
      r.exposeInMainWorld("QuikLight", { getMonitors: () => u.getMonitors() }),
      window.addEventListener("error", (e) => {
        o.send("renderer-error", { message: e.message, stack: e.error?.stack });
      }),
      window.addEventListener("unhandledrejection", (e) => {
        (o.send("unhandled-rejection", { reason: e.reason?.stack || e.reason }),
          e.preventDefault());
      }));
  })());
//# sourceMappingURL=preload.js.map
