module.exports = (e, t, r) => {
  "use strict";
  const n = r(36857);
  ((e.exports = async ({ cwd: e } = {}) => n("package.json", { cwd: e })),
    (e.exports.sync = ({ cwd: e } = {}) => n.sync("package.json", { cwd: e })));
};
