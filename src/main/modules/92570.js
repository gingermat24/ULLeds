module.exports = (e) => {
  "use strict";
  const t = (e, ...t) =>
    new Promise((r) => {
      r(e(...t));
    });
  ((e.exports = t), (e.exports.default = t));
};
