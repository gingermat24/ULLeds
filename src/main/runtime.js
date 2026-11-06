/*! For license information please see index.js.LICENSE.txt */
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
      (e._sentryDebugIds[t] = "1bfef7a1-a39a-42d3-ad78-eb114b2feab1"),
      (e._sentryDebugIdIdentifier = "sentry-dbid-1bfef7a1-a39a-42d3-ad78-eb114b2feab1"));
  } catch (e) {}
})(),
  (() => {
    var e = __MODULE_REGISTRY__,
      t = {};
    function r(n) {
      var i = t[n];
      if (void 0 !== i) return i.exports;
      var o = (t[n] = { id: n, loaded: !1, exports: {} });
      return (e[n].call(o.exports, o, o.exports, r), (o.loaded = !0), o.exports);
    }
    ((r.m = e),
      (r.n = (e) => {
        var t = e && e.__esModule ? () => e.default : () => e;
        return (r.d(t, { a: t }), t);
      }),
      (r.d = (e, t) => {
        for (var n in t)
          r.o(t, n) && !r.o(e, n) && Object.defineProperty(e, n, { enumerable: !0, get: t[n] });
      }),
      (r.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
      (r.r = (e) => {
        ("undefined" != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
          Object.defineProperty(e, "__esModule", { value: !0 }));
      }),
      (r.nmd = (e) => ((e.paths = []), e.children || (e.children = []), e)),
      (r.p = ""),
      void 0 !== r && (r.ab = __dirname + "/native_modules/"),
      (r.b = require("url").pathToFileURL(__filename)),
      (() => {
        "use strict";
        const e = r(4745),
          t = r(96439),
          { hexToRgb: n, ajustColorOrder: i } = r(42127),
          { lowLight: o } = r(79539),
          { eventEmitter: s } = r(36132),
          { sleep: a } = r(72139),
          { store: c } = r(81687),
          l = class {
            constructor() {
              ((this.store = c), (this.connectSingleton = new t()));
            }
            getUsbProtocol(e, t) {
              const r = (this.store.get("devices") ? this.store.get("devices") : []).find(
                  (t) => t.uuid === e,
                ),
                s = n(r.hue),
                a = i(s, r.wireMap),
                c = o(r.id, [a.r, a.g, a.b]),
                l = r.lampsAmount;
              let u = [1, 0, 0, 0, 254];
              l > 0 && l < 254 && (u = [1, 0, 0, 0, l, l + 1, 0, 0, 0, 254]);
              let p = [1, c[0], c[1], c[2], 254];
              return (
                l > 0 && l < 254 && (p = [1, c[0], c[1], c[2], l, l + 1, 0, 0, 0, 254]),
                t ? u : p
              );
            }
            getBleProtocol(e) {
              return e ? 0 : 1;
            }
            async send(t) {
              await a(49);
              const r = this.connectSingleton.devices,
                n = r.find((e) => "dongle" === e.type),
                i = r.filter((e) => "serialport" === e.type || "hid" === e.type),
                o = r.filter((e) => "ble" === e.type),
                c = this.connectSingleton.currentDevice;
              if (c) {
                const { uuid: e, type: r } = c,
                  i = this.getBleProtocol(t),
                  o = this.getUsbProtocol(e, t);
                n && "ble" === r
                  ? (s.emit("updateBreakingSyncScreen", !0),
                    await a(100),
                    setTimeout(() => {
                      s.emit("updateBreakingSyncScreen", !1);
                    }, 200),
                    await c.setSwitchStatus(i))
                  : "ble" === r
                    ? await c.setSwitchStatus(i)
                    : (await c.turnOffLight(), await a(20), await c.setSectionLED(o));
              } else if (
                (s.emit("stopAudioWorker"),
                await a(80),
                e.mapLimit(i, 1, async (e) => {
                  const { uuid: r } = e,
                    n = this.getUsbProtocol(r, t);
                  await e.setSectionLED(n);
                }),
                n)
              ) {
                const e = this.getBleProtocol(t);
                await n.setSwitchStatus(e);
              } else
                e.mapLimit(o, 1, async (e) => {
                  const r = this.getBleProtocol(t);
                  await e.setSectionLED(r);
                });
            }
          },
          u = 20,
          p = 40;
        var d = r(92911),
          f = r.n(d),
          h = r(51800);
        const { Worker: m } = r(28167),
          g = r(48161),
          { machineId: v } = r(11413),
          {
            app: y,
            BrowserWindow: w,
            shell: b,
            powerMonitor: x,
            Menu: E,
            Tray: _,
            ipcMain: S,
            screen: I,
            crashReporter: $,
          } = r(84157),
          O = r(64627),
          R = r(87138),
          P = r(81658),
          A = r(76760),
          T = r(25905),
          { isWindows7: k } = r(10994),
          { usb: N } = r(k() ? 55820 : 91187),
          { macOSVersion: C } = r(21179),
          { sleep: L } = r(72139),
          D = r(96439),
          { eventEmitter: j } = r(36132),
          { singleDeviceAPI: U, turnOffLights: M, resetSoftware: F } = r(51772),
          { setSyncScreen: z } = r(87396),
          { setComputerRhythm: B } = r(71991),
          q = r(64025),
          V = r(1242),
          { lowLight: G } = r(79539),
          H = r(88492),
          W = r(918),
          K = r(72107),
          X = r(46779),
          Y = r(91837),
          J = r(10652),
          { store: Q } = r(81687),
          Z = r(58496),
          ee = r(17522),
          te = r(50439),
          re = r(38161),
          ne = r(16255),
          ie = r(1630),
          oe = r(96203),
          se = r(60613),
          ae = r(15967),
          ce = r(68414),
          le = r(32309),
          ue = r(50672),
          pe = "win32" === process.platform;
        ($.start({
          companyName: "Robobloq",
          productName: "SyncLight",
          ignoreSystemCrashHandler: !1,
          submitURL:
            "https://o1422999.ingest.us.sentry.io/api/4508686841675776/minidump/?sentry_key=a1b27d7ea049688e7bce8463e5d7acdc",
        }),
          se.initialize());
        let de = "2803781d-abc1-500e-8d4d-4ea46e462abc";
        (v({ original: !0 }).then((e) => {
          de = e;
        }),
          T.initialize());
        const fe = new D();
        R.initialize();
        const he = y.getPath("userData");
        ((R.transports.file.resolvePathFn = () => A.join(he, "logs/main.log")), ae.initialize());
        let me = !1,
          ge = !1,
          ve = null,
          ye = null,
          we = null,
          be = null,
          xe = !1;
        const Ee = {};
        let _e = [];
        const Se = () => O.getMonitors(),
          Ie = () =>
            y.getLoginItemSettings().executableWillLaunchAtLogin ||
            y.getLoginItemSettings().openAtLogin;
        let $e = [],
          Oe = {};
        const Re = () => {
            me = !1;
            const e = O.getMonitors(),
              t = Q.get("syncSpeed") ? Q.get("syncSpeed") : 0,
              n = u;
            if (!ve) {
              const i = { displays: e, finalSyncSpeed: t + 20, samplingRate: n };
              ((ve = new m(new URL(r(33884), r.b), { workerData: i })),
                ve.unref(),
                R.info("开启取色线程"),
                pe &&
                  (() => {
                    const e = Q.get("fpsOptimization") ? Q.get("fpsOptimization") : 0;
                    we ||
                      1 !== e ||
                      ((we = new m(new URL(r(61089), r.b))),
                      we.unref(),
                      R.info("开启鼠标线程"),
                      we.on("message", (e) => {
                        me = !!e;
                      }),
                      we.on("error", (e) => {
                        R.error("鼠标线程发生错误", e);
                      }),
                      we.on("exit", (e) => {
                        (0 !== e && R.info("结束鼠标线程"), (we = null));
                      }));
                  })(),
                ve.on("message", (t) => {
                  if ((me || $e.push(t), $e.length)) {
                    const t = $e[0];
                    ($e.shift(), z(Oe, _e, t, e, n));
                  }
                }),
                ve.on("error", (e) => {
                  R.error(`取色线程发生错误: ${e}`);
                }),
                ve.on("exit", (e) => {
                  (0 !== e && R.info("结束取色线程"),
                    (ve = null),
                    pe &&
                      (() => {
                        try {
                          we && we.postMessage("exit");
                        } catch (e) {
                          R.error(e);
                        }
                      })());
                }));
            }
          },
          Pe = () => {
            if (ve)
              try {
                (($e = []), (Oe = []), ve.postMessage("exit"));
              } catch (e) {
                R.error(e);
              }
          },
          Ae = () => {
            if (((ge = !1), !ye)) {
              const e = { audioInterval: p };
              ((ye = new m(new URL(r(39590), r.b), { workerData: e })),
                ye.unref(),
                ye.on("message", (e) => {
                  ge || B(_e, e);
                }),
                ye.on("error", (e) => {
                  R.error(`电脑拾音线程发现错误: ${e}`);
                }),
                ye.on("exit", (e) => {
                  (0 !== e && R.info("结束电脑拾音线程"), (ye = null));
                }));
            }
          },
          Te = () => {
            if (ye)
              try {
                ye.postMessage("exit");
              } catch (e) {
                R.error(e);
              }
          },
          ke = () => {
            be && (clearInterval(be), (xe = !1));
          },
          Ne = async () => {
            try {
              ((me = !0), (ge = !0), ke(), Pe(), Te(), await M());
              const e = fe.devices;
              for (let t = 0; t < e.length; t++) {
                const r = e[t];
                await r.disconnect();
              }
            } catch (e) {
              console.error(e);
            }
          };
        ((global.store = Q),
          (global.app = y),
          (global.shell = b),
          (global.QuikLight = O),
          (global.os = g),
          (global.path = A),
          (global.macOSVersion = C));
        const Ce = g.platform();
        let Le = null,
          De = null,
          je = "";
        const Ue = y.isPackaged ? "./static/" : "./src/static/";
        "darwin" === Ce
          ? (je = `${Ue}/osx/tray.png`)
          : "win32" === Ce && (je = `${Ue}/win/tray.ico`);
        const Me = A.join(y.isPackaged ? process.resourcesPath : y.getAppPath(), je);
        y.requestSingleInstanceLock()
          ? y.on("second-instance", () => {
              De && (De.isMinimized() && De.restore(), De.focus(), De.show());
            })
          : y.exit(0);
        const Fe = () => {
          ((De = new w({
            width: 1280,
            height: 800,
            show: !1,
            autoHideMenuBar: !0,
            webPreferences: {
              preload: require("path").resolve(
                __dirname,
                "../renderer",
                "main_window",
                "preload.js",
              ),
              backgroundThrottling: !1,
              nodeIntegrationInWorker: !0,
              contextIsolation: !0,
            },
          })),
            ce.initialize(De));
          const e = () => {
            ((xe = !0),
              be && clearInterval(be),
              (be = setInterval(async () => {
                if (!xe) return;
                const e = fe.devices.find((e) => "dongle" === e.type);
                if (e) {
                  const t = fe.devices.filter((e) => !0 === e.isDongleChild),
                    r = await q.listDongleChildren(e),
                    n = [];
                  for (let t = 0; t < r.length; t++) {
                    const i = r[t],
                      o = i.uuid,
                      s = i.path,
                      a = i.id,
                      c = i.mac,
                      l = 0,
                      u = i.version,
                      p = "ble",
                      d = i.lampsAmount,
                      f = i.location,
                      h = i.installationMethod,
                      m = i.wireMap,
                      g = i.edgeNumber,
                      v = i.whiteColorDriver,
                      y = !0,
                      w = {
                        uuid: o,
                        path: s,
                        id: a,
                        displaySize: l,
                        version: u,
                        type: p,
                        lampsAmount: d,
                        isDongleChild: y,
                        location: f,
                        installationMethod: h,
                        wireMap: m,
                        edgeNumber: g,
                        whiteColorDriver: v,
                      };
                    n.push(w);
                    const b = P(e);
                    ((b.isDongleChild = y),
                      (b.id = a),
                      (b.type = p),
                      (b.mac = c),
                      (b.path = s),
                      (b.uuid = o),
                      (b.version = u),
                      (b.displaySize = l),
                      (b.lampsAmount = d),
                      (b.location = f),
                      (b.installationMethod = h),
                      (b.wireMap = m),
                      (b.edgeNumber = g),
                      (b.whiteColorDriver = v),
                      fe.devices.some((e) => e.uuid === o) || fe.devices.push(b));
                  }
                  const i = r.filter((e) => !t.some((t) => t.uuid === e.uuid)),
                    o = t.filter((e) => !r.some((t) => t.uuid === e.uuid));
                  if (i.length)
                    for (let e = 0; e < i.length; e++) {
                      const t = i[e],
                        r = fe.devices.find((e) => e.uuid === t.uuid && !e.isDongleChild);
                      (r && (fe.removeDevice(r.path), De.webContents.send("disconnect", r.path)),
                        De.webContents.send("getDeviceData", t),
                        await L(50));
                    }
                  o.forEach((e) => {
                    const t = e.path;
                    Ee[t]
                      ? (De.webContents.send("disconnect", e.path),
                        fe.removeDevice(e.path),
                        delete Ee[t])
                      : (Ee[t] = !0);
                  });
                }
              }, 3e3)));
          };
          let t;
          (N.on("attach", (e) => {
            (clearTimeout(t),
              (t = setTimeout(async () => {
                e &&
                  e.deviceDescriptor &&
                  (e.deviceDescriptor.idProduct === h.DONGLE_PID ||
                    e.deviceDescriptor.idProduct === h.CDC_PID ||
                    e.deviceDescriptor.idProduct === h.LIGHT_PID ||
                    e.deviceDescriptor.idProduct === h.BLE_PID ||
                    e.deviceDescriptor.idProduct === h.KEYBOARD_PID ||
                    e.deviceDescriptor.idProduct === h.MOUSE_PID) &&
                  (R.info(
                    `🔥 插入设备: PID: ${e.deviceDescriptor.idProduct} VID: ${e.deviceDescriptor.idVendor}`,
                  ),
                  await fe.autoConnect(De));
              }, 1500)));
          }),
            N.on("detach", (e) => {
              (R.info(
                `🔥 拨出设备: PID: ${e.deviceDescriptor.idProduct} VID: ${e.deviceDescriptor.idVendor}`,
              ),
                e &&
                  e.deviceDescriptor &&
                  e.deviceDescriptor.idProduct === h.DONGLE_PID &&
                  (R.debug("🔥 拨出Dongle"),
                  fe.devices
                    .filter((e) => "ble" === e.type)
                    .forEach((e) => {
                      (De.webContents.send("disconnect", e.path), fe.removeDevice(e.path));
                    })));
            }),
            I.on("display-added", (e, t) => {
              De.webContents.send("displayAdded", t);
            }),
            I.on("display-removed", (e, t) => {
              (Pe(), De.webContents.send("displayRemoved", t));
            }),
            j.on("disconnected", (e) => {
              (De.webContents.send("disconnect", e), fe.removeDevice(e));
            }),
            j.on("reportSyncScreen", (e) => {
              ((me = !0), (ge = !0), De.webContents.send("reportSyncScreen", e));
              const t = setTimeout(() => {
                ((me = !1), clearTimeout(t));
              }, 500);
            }),
            j.on("dongleScan", (t) => {
              t ? e() : ke();
            }),
            j.on("donglePause", (e) => {
              let t = null;
              e &&
                ((xe = !1),
                (t = setTimeout(() => {
                  ((xe = !0), clearTimeout(t));
                }, 1500)));
            }),
            j.on("setScreenWorker", (e) => {
              e ? Re() : Pe();
            }),
            j.on("updateBreakingSyncScreen", (e) => {
              me = e;
            }),
            j.on("updateBreakingRhythm", (e) => {
              ge = e;
            }),
            j.on("startAudioWorker", () => {
              Ae();
            }),
            j.on("stopAudioWorker", () => {
              Te();
            }),
            S.on("setScreenWorker", (e, t) => {
              t ? Re() : Pe();
            }),
            S.on("setDongleScan", (t, r) => {
              r ? e() : ke();
            }),
            S.handle("writeData", async (e, t, r, n, i, o, s, a, c) => {
              try {
                return await U(t, r, n, i, o, s, a, c);
              } catch (e) {
                console.error(e);
              }
            }),
            S.handle("sendStaticColor", async (e, t) => {
              const r = new V();
              await r.send(t);
            }),
            S.handle("sendSwitch", async (e, t) => {
              const r = new l();
              await r.send(t);
            }),
            S.handle("sendBrightness", async (e, t) => {
              const r = new H();
              await r.send(t);
            }),
            S.handle("sendWhiteBright", async (e, t, r) => {
              const n = new W();
              await n.send(t, r);
            }));
          const r = new K();
          (S.handle("sendLedEffect", async (e, t, n) => {
            await r.send(t, n);
          }),
            S.handle("sendDynamicSpeed", async (e, t) => {
              const r = new X();
              await r.send(t);
            }),
            S.handle("sendSoundSensitivity", async (e, t) => {
              const r = new Y();
              await r.send(t);
            }),
            S.handle("sendRhythmColor", async () => {
              const e = new J();
              await e.send();
            }),
            S.handle("sendRhythmType", async (e, t) => {
              const r = new (f())();
              await r.send(t);
            }),
            S.handle("sendLineSequence", async (e, t, r) => {
              const n = new Z();
              await n.send(t, r);
            }),
            S.handle("sendDeviceLocation", async (e, t) => {
              const r = new ee();
              await r.send(t);
            }),
            S.handle("sendEdgeNumber", async (e, t) => {
              const r = new te();
              await r.send(t);
            }),
            S.handle("sendPowerDirection", async (e, t) => {
              const r = new re();
              await r.send(t);
            }),
            S.handle("sendLedQuantity", async (e, t) => {
              const r = new ne();
              await r.send(t);
            }),
            S.handle("startAudioWorker", (e, t) => {
              t ? Ae() : Te();
            }),
            S.handle("getCompressColor", (e, t, r) => G(t, r)),
            S.handle("getDisplays", Se),
            S.handle(
              "hasScreenRecordingPermission",
              () => "darwin" !== g.platform() || O.hasScreenRecordingPermission(),
            ),
            S.handle("getMachineID", () => de),
            S.handle("getOpenAtLoginStatus", Ie),
            S.handle("openExternal", (e, t) => {
              b.openExternal(t);
            }),
            S.handle("updateBreakingSyncScreen", (e, t) => {
              me = t;
            }),
            S.on("resetSoftware", () => {
              F(async () => {
                try {
                  (await Ne(), y.relaunch(), Q.clear(), y.exit());
                } catch (e) {
                  R.debug("relaunch:", e);
                }
              });
            }),
            S.on("updateConnectDevices", (e, ...t) => {
              const [r, n, i] = t;
              if (((_e = i), r)) fe.currentDevice = null;
              else {
                const e = fe.devices.find((e) => e.path === n.path);
                fe.currentDevice = e;
              }
            }),
            le.initialize(),
            S.on("launchAtStartup", (e, t) => {
              y.setLoginItemSettings({ openAtLogin: t, args: ["--startup", "1"] });
            }),
            De.setResizable(!1),
            De.loadURL(
              `file://${require("path").resolve(__dirname, "..", "renderer", "main_window", "index.html")}`,
            ),
            y.isPackaged ||
              setTimeout(() => {
                De.webContents.openDevTools({ mode: "detach" });
              }, 3e3),
            De.once("ready-to-show", () => {
              const e = setTimeout(async () => {
                (await fe.autoConnect(De), clearTimeout(e));
              }, 2e3);
              process.argv.slice(1).some((e) => "--startup" === e)
                ? R.info("App launched at startup.")
                : (console.log("App launched manually."), De.show());
            }),
            De.on("close", (e) => {
              y.isQuitting || (e.preventDefault(), De.hide());
            }));
          const n = y.getLocale(),
            i = E.buildFromTemplate([
              {
                label: "zh-CN" === n ? "打开窗口" : "Open window",
                click: () => {
                  De.show();
                },
              },
              { label: "Separator", type: "separator" },
              {
                label: "zh-CN" === n ? "退出" : "Quit",
                click: async () => {
                  try {
                    (await Ne(), (y.isQuitting = !0), y.exit(0));
                  } catch (e) {
                    R.debug("Quit:", e);
                  }
                },
              },
            ]);
          ((Le = new _(Me)),
            Le.setContextMenu(i),
            Le.on("click", () => {
              De.show();
            }),
            x.on("suspend", () => {
              (ke(), Pe(), new ie().send());
            }),
            x.on("resume", () => {
              new oe().send();
            }),
            "win32" === Ce &&
              O.shutdownHandler(De.getNativeWindowHandle(), async (e) => {
                "SHUTDOWN" === e &&
                  (R.info("System is shutting down!"),
                  await Ne(),
                  R.info("App exit..."),
                  y.exit(0));
              }));
        };
        (y.whenReady().then(() => {
          (ue(),
            Fe(),
            y.on("activate", () => {
              (0 === w.getAllWindows().length && Fe(), De && !De.isVisible() && De.show());
            }));
        }),
          y.on("browser-window-created", (e, t) => {
            T.enable(t.webContents);
          }),
          y.on("window-all-closed", () => {
            "darwin" !== process.platform && y.quit();
          }),
          y.on("before-quit", async (e) => {
            (e.preventDefault(),
              await Ne(),
              console.log("🍍🍍🍍🍍🍍🍍🍍🍍🍍🍍🍍🍍🍍🍍"),
              y.exit(0));
          }));
      })(),
      (module.exports = {}));
  })());
//# sourceMappingURL=index.js.map
