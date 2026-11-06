module.exports = (e, t, r) => {
  const n = /\s+/g;
  class i {
    constructor(e, t) {
      if (((t = s(t)), e instanceof i))
        return e.loose === !!t.loose && e.includePrerelease === !!t.includePrerelease
          ? e
          : new i(e.raw, t);
      if (e instanceof a)
        return ((this.raw = e.value), (this.set = [[e]]), (this.formatted = void 0), this);
      if (
        ((this.options = t),
        (this.loose = !!t.loose),
        (this.includePrerelease = !!t.includePrerelease),
        (this.raw = e.trim().replace(n, " ")),
        (this.set = this.raw
          .split("||")
          .map((e) => this.parseRange(e.trim()))
          .filter((e) => e.length)),
        !this.set.length)
      )
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const e = this.set[0];
        if (((this.set = this.set.filter((e) => !v(e[0]))), 0 === this.set.length)) this.set = [e];
        else if (this.set.length > 1)
          for (const e of this.set)
            if (1 === e.length && y(e[0])) {
              this.set = [e];
              break;
            }
      }
      this.formatted = void 0;
    }
    get range() {
      if (void 0 === this.formatted) {
        this.formatted = "";
        for (let e = 0; e < this.set.length; e++) {
          e > 0 && (this.formatted += "||");
          const t = this.set[e];
          for (let e = 0; e < t.length; e++)
            (e > 0 && (this.formatted += " "), (this.formatted += t[e].toString().trim()));
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(e) {
      const t = ((this.options.includePrerelease && m) | (this.options.loose && g)) + ":" + e,
        r = o.get(t);
      if (r) return r;
      const n = this.options.loose,
        i = n ? u[p.HYPHENRANGELOOSE] : u[p.HYPHENRANGE];
      ((e = e.replace(i, A(this.options.includePrerelease))),
        c("hyphen replace", e),
        (e = e.replace(u[p.COMPARATORTRIM], d)),
        c("comparator trim", e),
        (e = e.replace(u[p.TILDETRIM], f)),
        c("tilde trim", e),
        (e = e.replace(u[p.CARETTRIM], h)),
        c("caret trim", e));
      let s = e
        .split(" ")
        .map((e) => b(e, this.options))
        .join(" ")
        .split(/\s+/)
        .map((e) => P(e, this.options));
      (n &&
        (s = s.filter(
          (e) => (c("loose invalid filter", e, this.options), !!e.match(u[p.COMPARATORLOOSE])),
        )),
        c("range list", s));
      const l = new Map(),
        y = s.map((e) => new a(e, this.options));
      for (const e of y) {
        if (v(e)) return [e];
        l.set(e.value, e);
      }
      l.size > 1 && l.has("") && l.delete("");
      const w = [...l.values()];
      return (o.set(t, w), w);
    }
    intersects(e, t) {
      if (!(e instanceof i)) throw new TypeError("a Range is required");
      return this.set.some(
        (r) =>
          w(r, t) &&
          e.set.some((e) => w(e, t) && r.every((r) => e.every((e) => r.intersects(e, t)))),
      );
    }
    test(e) {
      if (!e) return !1;
      if ("string" == typeof e)
        try {
          e = new l(e, this.options);
        } catch (e) {
          return !1;
        }
      for (let t = 0; t < this.set.length; t++) if (T(this.set[t], e, this.options)) return !0;
      return !1;
    }
  }
  e.exports = i;
  const o = new (r(77031))(),
    s = r(80564),
    a = r(9379),
    c = r(23111),
    l = r(22715),
    {
      safeRe: u,
      t: p,
      comparatorTrimReplace: d,
      tildeTrimReplace: f,
      caretTrimReplace: h,
    } = r(33263),
    { FLAG_INCLUDE_PRERELEASE: m, FLAG_LOOSE: g } = r(36173),
    v = (e) => "<0.0.0-0" === e.value,
    y = (e) => "" === e.value,
    w = (e, t) => {
      let r = !0;
      const n = e.slice();
      let i = n.pop();
      for (; r && n.length;) ((r = n.every((e) => i.intersects(e, t))), (i = n.pop()));
      return r;
    },
    b = (e, t) => (
      c("comp", e, t),
      (e = S(e, t)),
      c("caret", e),
      (e = E(e, t)),
      c("tildes", e),
      (e = $(e, t)),
      c("xrange", e),
      (e = R(e, t)),
      c("stars", e),
      e
    ),
    x = (e) => !e || "x" === e.toLowerCase() || "*" === e,
    E = (e, t) =>
      e
        .trim()
        .split(/\s+/)
        .map((e) => _(e, t))
        .join(" "),
    _ = (e, t) => {
      const r = t.loose ? u[p.TILDELOOSE] : u[p.TILDE];
      return e.replace(r, (t, r, n, i, o) => {
        let s;
        return (
          c("tilde", e, t, r, n, i, o),
          x(r)
            ? (s = "")
            : x(n)
              ? (s = `>=${r}.0.0 <${+r + 1}.0.0-0`)
              : x(i)
                ? (s = `>=${r}.${n}.0 <${r}.${+n + 1}.0-0`)
                : o
                  ? (c("replaceTilde pr", o), (s = `>=${r}.${n}.${i}-${o} <${r}.${+n + 1}.0-0`))
                  : (s = `>=${r}.${n}.${i} <${r}.${+n + 1}.0-0`),
          c("tilde return", s),
          s
        );
      });
    },
    S = (e, t) =>
      e
        .trim()
        .split(/\s+/)
        .map((e) => I(e, t))
        .join(" "),
    I = (e, t) => {
      c("caret", e, t);
      const r = t.loose ? u[p.CARETLOOSE] : u[p.CARET],
        n = t.includePrerelease ? "-0" : "";
      return e.replace(r, (t, r, i, o, s) => {
        let a;
        return (
          c("caret", e, t, r, i, o, s),
          x(r)
            ? (a = "")
            : x(i)
              ? (a = `>=${r}.0.0${n} <${+r + 1}.0.0-0`)
              : x(o)
                ? (a =
                    "0" === r
                      ? `>=${r}.${i}.0${n} <${r}.${+i + 1}.0-0`
                      : `>=${r}.${i}.0${n} <${+r + 1}.0.0-0`)
                : s
                  ? (c("replaceCaret pr", s),
                    (a =
                      "0" === r
                        ? "0" === i
                          ? `>=${r}.${i}.${o}-${s} <${r}.${i}.${+o + 1}-0`
                          : `>=${r}.${i}.${o}-${s} <${r}.${+i + 1}.0-0`
                        : `>=${r}.${i}.${o}-${s} <${+r + 1}.0.0-0`))
                  : (c("no pr"),
                    (a =
                      "0" === r
                        ? "0" === i
                          ? `>=${r}.${i}.${o}${n} <${r}.${i}.${+o + 1}-0`
                          : `>=${r}.${i}.${o}${n} <${r}.${+i + 1}.0-0`
                        : `>=${r}.${i}.${o} <${+r + 1}.0.0-0`)),
          c("caret return", a),
          a
        );
      });
    },
    $ = (e, t) => (
      c("replaceXRanges", e, t),
      e
        .split(/\s+/)
        .map((e) => O(e, t))
        .join(" ")
    ),
    O = (e, t) => {
      e = e.trim();
      const r = t.loose ? u[p.XRANGELOOSE] : u[p.XRANGE];
      return e.replace(r, (r, n, i, o, s, a) => {
        c("xRange", e, r, n, i, o, s, a);
        const l = x(i),
          u = l || x(o),
          p = u || x(s),
          d = p;
        return (
          "=" === n && d && (n = ""),
          (a = t.includePrerelease ? "-0" : ""),
          l
            ? (r = ">" === n || "<" === n ? "<0.0.0-0" : "*")
            : n && d
              ? (u && (o = 0),
                (s = 0),
                ">" === n
                  ? ((n = ">="), u ? ((i = +i + 1), (o = 0), (s = 0)) : ((o = +o + 1), (s = 0)))
                  : "<=" === n && ((n = "<"), u ? (i = +i + 1) : (o = +o + 1)),
                "<" === n && (a = "-0"),
                (r = `${n + i}.${o}.${s}${a}`))
              : u
                ? (r = `>=${i}.0.0${a} <${+i + 1}.0.0-0`)
                : p && (r = `>=${i}.${o}.0${a} <${i}.${+o + 1}.0-0`),
          c("xRange return", r),
          r
        );
      });
    },
    R = (e, t) => (c("replaceStars", e, t), e.trim().replace(u[p.STAR], "")),
    P = (e, t) => (
      c("replaceGTE0", e, t),
      e.trim().replace(u[t.includePrerelease ? p.GTE0PRE : p.GTE0], "")
    ),
    A = (e) => (t, r, n, i, o, s, a, c, l, u, p, d) =>
      `${(r = x(n) ? "" : x(i) ? `>=${n}.0.0${e ? "-0" : ""}` : x(o) ? `>=${n}.${i}.0${e ? "-0" : ""}` : s ? `>=${r}` : `>=${r}${e ? "-0" : ""}`)} ${(c = x(l) ? "" : x(u) ? `<${+l + 1}.0.0-0` : x(p) ? `<${l}.${+u + 1}.0-0` : d ? `<=${l}.${u}.${p}-${d}` : e ? `<${l}.${u}.${+p + 1}-0` : `<=${c}`)}`.trim(),
    T = (e, t, r) => {
      for (let r = 0; r < e.length; r++) if (!e[r].test(t)) return !1;
      if (t.prerelease.length && !r.includePrerelease) {
        for (let r = 0; r < e.length; r++)
          if ((c(e[r].semver), e[r].semver !== a.ANY && e[r].semver.prerelease.length > 0)) {
            const n = e[r].semver;
            if (n.major === t.major && n.minor === t.minor && n.patch === t.patch) return !0;
          }
        return !1;
      }
      return !0;
    };
};
