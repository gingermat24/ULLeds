module.exports = (e, t, r) => {
  "use strict";
  const { createFile: n, createFileSync: i } = r(60185),
    { createLink: o, createLinkSync: s } = r(12127),
    { createSymlink: a, createSymlinkSync: c } = r(36768);
  e.exports = {
    createFile: n,
    createFileSync: i,
    ensureFile: n,
    ensureFileSync: i,
    createLink: o,
    createLinkSync: s,
    ensureLink: o,
    ensureLinkSync: s,
    createSymlink: a,
    createSymlinkSync: c,
    ensureSymlink: a,
    ensureSymlinkSync: c,
  };
};
