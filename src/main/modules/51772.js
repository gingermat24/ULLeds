module.exports = (e, t, r) => {
  "use strict";
  (r.r(t),
    r.d(t, {
      groupDevicesAPI: () => d,
      resetSoftware: () => h,
      singleDeviceAPI: () => p,
      turnOffLights: () => f,
    }));
  var n = r(18798);
  const i = r(4745),
    o = r(87138),
    { app: s, dialog: a, BrowserWindow: c } = r(84157),
    { compare: l } = r(30979),
    u = new (r(96439))(),
    p = async (e, t, r, i, o, s, a, c) => {
      let l = {};
      const p = u.devices,
        d = p.find((e) => "dongle" === e.type);
      try {
        if (e === n.A.uuid)
          if (d) "function" == typeof d[t] && (l = await d[t](r, i, o, s, a, c));
          else
            for (let e = 0; e < p.length; e++) {
              const n = p[e];
              "function" == typeof n[t] && (l = await n[t](r, i, o, s, a, c));
            }
        else {
          const n = p.find((t) => t.uuid === e);
          "function" == typeof n[t] && (l = await n[t](r, i, o, s, a, c));
        }
        return l;
      } catch (e) {
        console.error("singleDeviceAPI:", e);
      }
    },
    d = (e, t, r, n, o, s, a) => {
      i.mapLimit(u.devices, 1, async (i) => {
        await i[e](t, r, n, o, s, a);
      });
    },
    f = () => {
      const e = u.devices,
        t = e.find((e) => "dongle" === e.type),
        r = e.filter((e) => "serialport" === e.type || "hid" === e.type),
        n = e.filter((e) => "ble" === e.type);
      for (let t = 0; t < r.length; t++) {
        const n = r[t],
          i = e.find((e) => e.uuid === n.uuid),
          { lampsAmount: s, version: a } = i;
        let c = [1, 0, 0, 0, 254];
        (s > 0 && s < 254 && (c = [1, 0, 0, 0, s, s + 1, 0, 0, 0, 254]),
          l(a, "1.8.0", ">=")
            ? n.turnOffLight()
            : (n.setSectionLED(c),
              setTimeout(() => {
                n.setSectionLED(c);
              }, 100)),
          o.info("有线关机灭灯: ", t));
      }
      if (t)
        (t.setSwitchStatus(0),
          setTimeout(() => {
            t.setSwitchStatus(0);
          }, 100),
          o.info("Dongle关机灭灯"));
      else
        for (let e = 0; e < n.length; e++) {
          const t = n[e];
          (o.info("BLE关机灭灯: ", e), t.setSwitchStatus(0));
        }
    },
    h = (e) => {
      const t = s.getLocale(),
        r = {
          type: "question",
          buttons: ["zh-CN" === t ? "取消" : "Cancel", "zh-CN" === t ? "确定" : "OK"],
          defaultId: 1,
          title: "Confirm",
          message:
            "zh-CN" === t ? "确定是否需要重置软件？" : "Confirm if you want to reset the software?",
        },
        n = c.getFocusedWindow();
      a.showMessageBox(n, r).then((t) => {
        t.response && e();
      });
    };
};
