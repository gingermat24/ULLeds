module.exports = (e, t, r) => {
  "use strict";
  (r.r(t),
    r.d(t, {
      compare: () => n.U,
      compareVersions: () => i.Z,
      satisfies: () => s,
      validate: () => a,
      validateStrict: () => c,
    }));
  var n = r(84154),
    i = r(29783),
    o = r(51204);
  const s = (e, t) => {
      if ((t = t.replace(/([><=]+)\s+/g, "$1")).includes("||"))
        return t.split("||").some((t) => s(e, t));
      if (t.includes(" - ")) {
        const [r, n] = t.split(" - ", 2);
        return s(e, `>=${r} <=${n}`);
      }
      if (t.includes(" "))
        return t
          .trim()
          .replace(/\s{2,}/g, " ")
          .split(" ")
          .every((t) => s(e, t));
      const r = t.match(/^([<>=~^]+)/),
        i = r ? r[1] : "=";
      if ("^" !== i && "~" !== i) return (0, n.U)(e, t, i);
      const [a, c, l, , u] = (0, o.P0)(e),
        [p, d, f, , h] = (0, o.P0)(t),
        m = [a, c, l],
        g = [p, null != d ? d : "x", null != f ? f : "x"];
      if (h) {
        if (!u) return !1;
        if (0 !== (0, o.Uy)(m, g)) return !1;
        if (-1 === (0, o.Uy)(u.split("."), h.split("."))) return !1;
      }
      const v = g.findIndex((e) => "0" !== e) + 1,
        y = "~" === i ? 2 : v > 1 ? v : 1;
      return (
        0 === (0, o.Uy)(m.slice(0, y), g.slice(0, y)) && -1 !== (0, o.Uy)(m.slice(y), g.slice(y))
      );
    },
    a = (e) => "string" == typeof e && /^[v\d]/.test(e) && o.hO.test(e),
    c = (e) =>
      "string" == typeof e &&
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/.test(
        e,
      );
};
