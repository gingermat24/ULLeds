module.exports = (e, t, r) => {
  "use strict";
  const n = r(84878),
    i = new Set(["__proto__", "prototype", "constructor"]);
  function o(e) {
    const t = e.split("."),
      r = [];
    for (let e = 0; e < t.length; e++) {
      let n = t[e];
      for (; "\\" === n[n.length - 1] && void 0 !== t[e + 1];)
        ((n = n.slice(0, -1) + "."), (n += t[++e]));
      r.push(n);
    }
    return r.some((e) => i.has(e)) ? [] : r;
  }
  e.exports = {
    get(e, t, r) {
      if (!n(e) || "string" != typeof t) return void 0 === r ? e : r;
      const i = o(t);
      if (0 !== i.length) {
        for (let t = 0; t < i.length; t++)
          if (null == (e = e[i[t]])) {
            if (t !== i.length - 1) return r;
            break;
          }
        return void 0 === e ? r : e;
      }
    },
    set(e, t, r) {
      if (!n(e) || "string" != typeof t) return e;
      const i = e,
        s = o(t);
      for (let t = 0; t < s.length; t++) {
        const i = s[t];
        (n(e[i]) || (e[i] = {}), t === s.length - 1 && (e[i] = r), (e = e[i]));
      }
      return i;
    },
    delete(e, t) {
      if (!n(e) || "string" != typeof t) return !1;
      const r = o(t);
      for (let t = 0; t < r.length; t++) {
        const i = r[t];
        if (t === r.length - 1) return (delete e[i], !0);
        if (((e = e[i]), !n(e))) return !1;
      }
    },
    has(e, t) {
      if (!n(e) || "string" != typeof t) return !1;
      const r = o(t);
      if (0 === r.length) return !1;
      for (let t = 0; t < r.length; t++) {
        if (!n(e)) return !1;
        if (!(r[t] in e)) return !1;
        e = e[r[t]];
      }
      return !0;
    },
  };
};
