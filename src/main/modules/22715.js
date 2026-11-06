module.exports = (e, t, r) => {
  const n = r(23111),
    { MAX_LENGTH: i, MAX_SAFE_INTEGER: o } = r(36173),
    { safeRe: s, t: a } = r(33263),
    c = r(80564),
    { compareIdentifiers: l } = r(9380);
  class u {
    constructor(e, t) {
      if (((t = c(t)), e instanceof u)) {
        if (e.loose === !!t.loose && e.includePrerelease === !!t.includePrerelease) return e;
        e = e.version;
      } else if ("string" != typeof e)
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof e}".`);
      if (e.length > i) throw new TypeError(`version is longer than ${i} characters`);
      (n("SemVer", e, t),
        (this.options = t),
        (this.loose = !!t.loose),
        (this.includePrerelease = !!t.includePrerelease));
      const r = e.trim().match(t.loose ? s[a.LOOSE] : s[a.FULL]);
      if (!r) throw new TypeError(`Invalid Version: ${e}`);
      if (
        ((this.raw = e),
        (this.major = +r[1]),
        (this.minor = +r[2]),
        (this.patch = +r[3]),
        this.major > o || this.major < 0)
      )
        throw new TypeError("Invalid major version");
      if (this.minor > o || this.minor < 0) throw new TypeError("Invalid minor version");
      if (this.patch > o || this.patch < 0) throw new TypeError("Invalid patch version");
      (r[4]
        ? (this.prerelease = r[4].split(".").map((e) => {
            if (/^[0-9]+$/.test(e)) {
              const t = +e;
              if (t >= 0 && t < o) return t;
            }
            return e;
          }))
        : (this.prerelease = []),
        (this.build = r[5] ? r[5].split(".") : []),
        this.format());
    }
    format() {
      return (
        (this.version = `${this.major}.${this.minor}.${this.patch}`),
        this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`),
        this.version
      );
    }
    toString() {
      return this.version;
    }
    compare(e) {
      if ((n("SemVer.compare", this.version, this.options, e), !(e instanceof u))) {
        if ("string" == typeof e && e === this.version) return 0;
        e = new u(e, this.options);
      }
      return e.version === this.version ? 0 : this.compareMain(e) || this.comparePre(e);
    }
    compareMain(e) {
      return (
        e instanceof u || (e = new u(e, this.options)),
        l(this.major, e.major) || l(this.minor, e.minor) || l(this.patch, e.patch)
      );
    }
    comparePre(e) {
      if (
        (e instanceof u || (e = new u(e, this.options)),
        this.prerelease.length && !e.prerelease.length)
      )
        return -1;
      if (!this.prerelease.length && e.prerelease.length) return 1;
      if (!this.prerelease.length && !e.prerelease.length) return 0;
      let t = 0;
      do {
        const r = this.prerelease[t],
          i = e.prerelease[t];
        if ((n("prerelease compare", t, r, i), void 0 === r && void 0 === i)) return 0;
        if (void 0 === i) return 1;
        if (void 0 === r) return -1;
        if (r !== i) return l(r, i);
      } while (++t);
    }
    compareBuild(e) {
      e instanceof u || (e = new u(e, this.options));
      let t = 0;
      do {
        const r = this.build[t],
          i = e.build[t];
        if ((n("build compare", t, r, i), void 0 === r && void 0 === i)) return 0;
        if (void 0 === i) return 1;
        if (void 0 === r) return -1;
        if (r !== i) return l(r, i);
      } while (++t);
    }
    inc(e, t, r) {
      switch (e) {
        case "premajor":
          ((this.prerelease.length = 0),
            (this.patch = 0),
            (this.minor = 0),
            this.major++,
            this.inc("pre", t, r));
          break;
        case "preminor":
          ((this.prerelease.length = 0), (this.patch = 0), this.minor++, this.inc("pre", t, r));
          break;
        case "prepatch":
          ((this.prerelease.length = 0), this.inc("patch", t, r), this.inc("pre", t, r));
          break;
        case "prerelease":
          (0 === this.prerelease.length && this.inc("patch", t, r), this.inc("pre", t, r));
          break;
        case "major":
          ((0 === this.minor && 0 === this.patch && 0 !== this.prerelease.length) || this.major++,
            (this.minor = 0),
            (this.patch = 0),
            (this.prerelease = []));
          break;
        case "minor":
          ((0 === this.patch && 0 !== this.prerelease.length) || this.minor++,
            (this.patch = 0),
            (this.prerelease = []));
          break;
        case "patch":
          (0 === this.prerelease.length && this.patch++, (this.prerelease = []));
          break;
        case "pre": {
          const e = Number(r) ? 1 : 0;
          if (!t && !1 === r) throw new Error("invalid increment argument: identifier is empty");
          if (0 === this.prerelease.length) this.prerelease = [e];
          else {
            let n = this.prerelease.length;
            for (; --n >= 0;)
              "number" == typeof this.prerelease[n] && (this.prerelease[n]++, (n = -2));
            if (-1 === n) {
              if (t === this.prerelease.join(".") && !1 === r)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(e);
            }
          }
          if (t) {
            let n = [t, e];
            (!1 === r && (n = [t]),
              0 === l(this.prerelease[0], t)
                ? isNaN(this.prerelease[1]) && (this.prerelease = n)
                : (this.prerelease = n));
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${e}`);
      }
      return (
        (this.raw = this.format()),
        this.build.length && (this.raw += `+${this.build.join(".")}`),
        this
      );
    }
  }
  e.exports = u;
};
