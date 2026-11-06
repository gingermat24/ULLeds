module.exports = (e, t, r) => {
  "use strict";
  (r.r(t),
    r.d(t, {
      defaultDevice: () => n.A,
      defaultGroupDevice: () => o,
      findAll: () => s,
      findByUUID: () => a,
      insertOne: () => c,
      updateByUUID: () => l,
      updateGroupDevice: () => u,
    }));
  var n = r(18798);
  const { store: i } = r(81687),
    o = () => (i.get("groupDevice") ? i.get("groupDevice") : n.A),
    s = () => (i.get("devices") ? i.get("devices") : []),
    a = (e) => s().find((t) => t.uuid === e),
    c = (e) => {
      const t = s();
      return (t.push(e), i.set("devices", t), e);
    },
    l = (e) => {
      const t = s(),
        r = t.find((t) => t.uuid === e.uuid);
      (r && Object.assign(r, e), i.set("devices", t));
    },
    u = (e) => {
      i.set("groupDevice", e);
    };
};
