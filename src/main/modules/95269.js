module.exports = (e, t, r) => {
  "use strict";
  const n = r(6158);
  e.exports = {
    symlinkType: function (e, t, r) {
      if (((r = "function" == typeof t ? t : r), (t = "function" != typeof t && t)))
        return r(null, t);
      n.lstat(e, (e, n) => {
        if (e) return r(null, "file");
        ((t = n && n.isDirectory() ? "dir" : "file"), r(null, t));
      });
    },
    symlinkTypeSync: function (e, t) {
      let r;
      if (t) return t;
      try {
        r = n.lstatSync(e);
      } catch {
        return "file";
      }
      return r && r.isDirectory() ? "dir" : "file";
    },
  };
};
