module.exports = (e, t, r) => {
  const n = r(9733),
    i = r(31347);
  e.exports = (e, t, r) => {
    const o = [];
    let s = null,
      a = null;
    const c = e.sort((e, t) => i(e, t, r));
    for (const e of c)
      n(e, t, r) ? ((a = e), s || (s = e)) : (a && o.push([s, a]), (a = null), (s = null));
    s && o.push([s, null]);
    const l = [];
    for (const [e, t] of o)
      e === t
        ? l.push(e)
        : t || e !== c[0]
          ? t
            ? e === c[0]
              ? l.push(`<=${t}`)
              : l.push(`${e} - ${t}`)
            : l.push(`>=${e}`)
          : l.push("*");
    const u = l.join(" || "),
      p = "string" == typeof t.raw ? t.raw : String(t);
    return u.length < p.length ? u : t;
  };
};
