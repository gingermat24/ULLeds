module.exports = (e) => {
  e.exports = {
    stringify: function (
      e,
      { EOL: t = "\n", finalEOL: r = !0, replacer: n = null, spaces: i } = {},
    ) {
      const o = r ? t : "";
      return JSON.stringify(e, n, i).replace(/\n/g, t) + o;
    },
    stripBom: function (e) {
      return (Buffer.isBuffer(e) && (e = e.toString("utf8")), e.replace(/^\uFEFF/, ""));
    },
  };
};
