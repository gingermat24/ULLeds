module.exports = (e) => {
  const t =
    "object" == typeof process &&
    process.env &&
    process.env.NODE_DEBUG &&
    /\bsemver\b/i.test(process.env.NODE_DEBUG)
      ? (...e) => console.error("SEMVER", ...e)
      : () => {};
  e.exports = t;
};
