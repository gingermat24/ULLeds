module.exports = (e, t) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.parseDn = function (e) {
      let t = !1,
        r = null,
        n = "",
        i = 0;
      e = e.trim();
      const o = new Map();
      for (let s = 0; s <= e.length; s++) {
        if (s === e.length) {
          null !== r && o.set(r, n);
          break;
        }
        const a = e[s];
        if (t) {
          if ('"' === a) {
            t = !1;
            continue;
          }
        } else {
          if ('"' === a) {
            t = !0;
            continue;
          }
          if ("\\" === a) {
            s++;
            const t = parseInt(e.slice(s, s + 2), 16);
            Number.isNaN(t) ? (n += e[s]) : (s++, (n += String.fromCharCode(t)));
            continue;
          }
          if (null === r && "=" === a) {
            ((r = n), (n = ""));
            continue;
          }
          if ("," === a || ";" === a || "+" === a) {
            (null !== r && o.set(r, n), (r = null), (n = ""));
            continue;
          }
        }
        if (" " === a && !t) {
          if (0 === n.length) continue;
          if (s > i) {
            let t = s;
            for (; " " === e[t];) t++;
            i = t;
          }
          if (
            i >= e.length ||
            "," === e[i] ||
            ";" === e[i] ||
            (null === r && "=" === e[i]) ||
            (null !== r && "+" === e[i])
          ) {
            s = i - 1;
            continue;
          }
        }
        n += a;
      }
      return o;
    }));
};
