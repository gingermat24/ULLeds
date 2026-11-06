module.exports = (e, t, r) => {
  let n;
  try {
    n = r(6158);
  } catch (e) {
    n = r(79896);
  }
  const i = r(21503),
    { stringify: o, stripBom: s } = r(17019),
    a = {
      readFile: i.fromPromise(async function (e, t = {}) {
        "string" == typeof t && (t = { encoding: t });
        const r = t.fs || n,
          o = !("throws" in t) || t.throws;
        let a,
          c = await i.fromCallback(r.readFile)(e, t);
        c = s(c);
        try {
          a = JSON.parse(c, t ? t.reviver : null);
        } catch (t) {
          if (o) throw ((t.message = `${e}: ${t.message}`), t);
          return null;
        }
        return a;
      }),
      readFileSync: function (e, t = {}) {
        "string" == typeof t && (t = { encoding: t });
        const r = t.fs || n,
          i = !("throws" in t) || t.throws;
        try {
          let n = r.readFileSync(e, t);
          return ((n = s(n)), JSON.parse(n, t.reviver));
        } catch (t) {
          if (i) throw ((t.message = `${e}: ${t.message}`), t);
          return null;
        }
      },
      writeFile: i.fromPromise(async function (e, t, r = {}) {
        const s = r.fs || n,
          a = o(t, r);
        await i.fromCallback(s.writeFile)(e, a, r);
      }),
      writeFileSync: function (e, t, r = {}) {
        const i = r.fs || n,
          s = o(t, r);
        return i.writeFileSync(e, s, r);
      },
    };
  e.exports = a;
};
