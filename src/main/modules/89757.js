module.exports = (e, t, r) => {
  const n = r(51735),
    i = r(1405),
    { safeRe: o, t: s } = r(56195);
  e.exports = (e, t) => {
    if (e instanceof n) return e;
    if (("number" == typeof e && (e = String(e)), "string" != typeof e)) return null;
    let r = null;
    if ((t = t || {}).rtl) {
      const n = t.includePrerelease ? o[s.COERCERTLFULL] : o[s.COERCERTL];
      let i;
      for (; (i = n.exec(e)) && (!r || r.index + r[0].length !== e.length);)
        ((r && i.index + i[0].length === r.index + r[0].length) || (r = i),
          (n.lastIndex = i.index + i[1].length + i[2].length));
      n.lastIndex = -1;
    } else r = e.match(t.includePrerelease ? o[s.COERCEFULL] : o[s.COERCE]);
    if (null === r) return null;
    const a = r[2],
      c = r[3] || "0",
      l = r[4] || "0",
      u = t.includePrerelease && r[5] ? `-${r[5]}` : "",
      p = t.includePrerelease && r[6] ? `+${r[6]}` : "";
    return i(`${a}.${c}.${l}${u}${p}`, t);
  };
};
