module.exports = (e, t, r) => {
  const n = Symbol("SemVer ANY");
  class i {
    static get ANY() {
      return n;
    }
    constructor(e, t) {
      if (((t = o(t)), e instanceof i)) {
        if (e.loose === !!t.loose) return e;
        e = e.value;
      }
      ((e = e.trim().split(/\s+/).join(" ")),
        l("comparator", e, t),
        (this.options = t),
        (this.loose = !!t.loose),
        this.parse(e),
        this.semver === n ? (this.value = "") : (this.value = this.operator + this.semver.version),
        l("comp", this));
    }
    parse(e) {
      const t = this.options.loose ? s[a.COMPARATORLOOSE] : s[a.COMPARATOR],
        r = e.match(t);
      if (!r) throw new TypeError(`Invalid comparator: ${e}`);
      ((this.operator = void 0 !== r[1] ? r[1] : ""),
        "=" === this.operator && (this.operator = ""),
        r[2] ? (this.semver = new u(r[2], this.options.loose)) : (this.semver = n));
    }
    toString() {
      return this.value;
    }
    test(e) {
      if ((l("Comparator.test", e, this.options.loose), this.semver === n || e === n)) return !0;
      if ("string" == typeof e)
        try {
          e = new u(e, this.options);
        } catch (e) {
          return !1;
        }
      return c(e, this.operator, this.semver, this.options);
    }
    intersects(e, t) {
      if (!(e instanceof i)) throw new TypeError("a Comparator is required");
      return "" === this.operator
        ? "" === this.value || new p(e.value, t).test(this.value)
        : "" === e.operator
          ? "" === e.value || new p(this.value, t).test(e.semver)
          : !(
              ((t = o(t)).includePrerelease &&
                ("<0.0.0-0" === this.value || "<0.0.0-0" === e.value)) ||
              (!t.includePrerelease &&
                (this.value.startsWith("<0.0.0") || e.value.startsWith("<0.0.0"))) ||
              ((!this.operator.startsWith(">") || !e.operator.startsWith(">")) &&
                (!this.operator.startsWith("<") || !e.operator.startsWith("<")) &&
                (this.semver.version !== e.semver.version ||
                  !this.operator.includes("=") ||
                  !e.operator.includes("=")) &&
                !(
                  c(this.semver, "<", e.semver, t) &&
                  this.operator.startsWith(">") &&
                  e.operator.startsWith("<")
                ) &&
                !(
                  c(this.semver, ">", e.semver, t) &&
                  this.operator.startsWith("<") &&
                  e.operator.startsWith(">")
                ))
            );
    }
  }
  e.exports = i;
  const o = r(98408),
    { safeRe: s, t: a } = r(56195),
    c = r(39106),
    l = r(17403),
    u = r(51735),
    p = r(38458);
};
