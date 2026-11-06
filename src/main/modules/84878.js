module.exports = (e) => {
  "use strict";
  e.exports = (e) => {
    const t = typeof e;
    return null !== e && ("object" === t || "function" === t);
  };
};
