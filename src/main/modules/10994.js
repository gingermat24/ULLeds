module.exports = (e, t, r) => {
  "use strict";
  (r.r(t),
    r.d(t, {
      bleLocationConvert: () => m,
      bleWireMapConvert: () => g,
      checkDeviceType: () => f,
      defaultDevice: () => n.A,
      defaultGroupDevice: () => d,
      isInValidUUID: () => h,
      isWindows7: () => p,
    }));
  var n = r(18798);
  const i = r(48161),
    { store: o } = r(81687),
    { LIGHT_PID: s, KEYBOARD_PID: a, BLE_PID: c, DONGLE_PID: l, MOUSE_PID: u } = r(51800),
    p = () => "win32" === i.platform() && i.release().startsWith("6.1"),
    d = () => (o.get("groupDevice") ? o.get("groupDevice") : n.A),
    f = (e) => {
      let t = "serialport";
      return (
        e.productId === s || e.productId === a || e.productId === u
          ? (t = "hid")
          : e.productId === c
            ? (t = "ble")
            : e.productId === l && (t = "dongle"),
        t
      );
    },
    h = (e) => "0000000000000000" === e || e.includes(","),
    m = (e) => {
      let t = 0;
      switch (e) {
        case 0:
          t = 1;
          break;
        case 1:
          t = 2;
          break;
        case 2:
          t = 3;
          break;
        case 3:
          t = 4;
          break;
        case 4:
          t = 5;
          break;
        case 5:
          t = 7;
          break;
        case 6:
          t = 6;
          break;
        default:
          t = 0;
      }
      return t;
    },
    g = (e) => {
      let t = "RGB";
      switch (e) {
        case 0:
        default:
          t = "RGB";
          break;
        case 1:
          t = "RBG";
          break;
        case 2:
          t = "GRB";
          break;
        case 3:
          t = "GBR";
          break;
        case 4:
          t = "BRG";
          break;
        case 5:
          t = "BGR";
      }
      return t;
    };
};
