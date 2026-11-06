module.exports = (e, t, r) => {
  const n = r(65964);
  e.exports = (e, t) =>
    new n(e, t).set.map((e) =>
      e
        .map((e) => e.value)
        .join(" ")
        .trim()
        .split(" "),
    );
};
