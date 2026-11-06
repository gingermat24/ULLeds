module.exports = (e, t, r) => {
  "use strict";
  const n = r(21503).fromCallback,
    i = r(6158),
    o = [
      "access",
      "appendFile",
      "chmod",
      "chown",
      "close",
      "copyFile",
      "fchmod",
      "fchown",
      "fdatasync",
      "fstat",
      "fsync",
      "ftruncate",
      "futimes",
      "lchmod",
      "lchown",
      "link",
      "lstat",
      "mkdir",
      "mkdtemp",
      "open",
      "opendir",
      "readdir",
      "readFile",
      "readlink",
      "realpath",
      "rename",
      "rm",
      "rmdir",
      "stat",
      "symlink",
      "truncate",
      "unlink",
      "utimes",
      "writeFile",
    ].filter((e) => "function" == typeof i[e]);
  (Object.assign(t, i),
    o.forEach((e) => {
      t[e] = n(i[e]);
    }),
    (t.exists = function (e, t) {
      return "function" == typeof t ? i.exists(e, t) : new Promise((t) => i.exists(e, t));
    }),
    (t.read = function (e, t, r, n, o, s) {
      return "function" == typeof s
        ? i.read(e, t, r, n, o, s)
        : new Promise((s, a) => {
            i.read(e, t, r, n, o, (e, t, r) => {
              if (e) return a(e);
              s({ bytesRead: t, buffer: r });
            });
          });
    }),
    (t.write = function (e, t, ...r) {
      return "function" == typeof r[r.length - 1]
        ? i.write(e, t, ...r)
        : new Promise((n, o) => {
            i.write(e, t, ...r, (e, t, r) => {
              if (e) return o(e);
              n({ bytesWritten: t, buffer: r });
            });
          });
    }),
    "function" == typeof i.writev &&
      (t.writev = function (e, t, ...r) {
        return "function" == typeof r[r.length - 1]
          ? i.writev(e, t, ...r)
          : new Promise((n, o) => {
              i.writev(e, t, ...r, (e, t, r) => {
                if (e) return o(e);
                n({ bytesWritten: t, buffers: r });
              });
            });
      }),
    "function" == typeof i.realpath.native
      ? (t.realpath.native = n(i.realpath.native))
      : process.emitWarning(
          "fs.realpath.native is not a function. Is fs being monkey-patched?",
          "Warning",
          "fs-extra-WARN0003",
        ));
};
