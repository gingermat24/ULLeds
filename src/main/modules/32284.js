module.exports = (e, t, r) => {
  "use strict";
  const n = r(16928);
  e.exports.checkPath = function (e) {
    if ("win32" === process.platform && /[<>:"|?*]/.test(e.replace(n.parse(e).root, ""))) {
      const t = new Error(`Path contains invalid characters: ${e}`);
      throw ((t.code = "EINVAL"), t);
    }
  };
};
