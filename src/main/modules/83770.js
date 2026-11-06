module.exports = (e, t) => {
  "use strict";
  function r(e) {
    const t = e.length;
    let r,
      n = 0,
      i = 0;
    for (; i < t;)
      (n++,
        (r = e.charCodeAt(i++)),
        r >= 55296 && r <= 56319 && i < t && ((r = e.charCodeAt(i)), 56320 == (64512 & r) && i++));
    return n;
  }
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.default = r),
    (r.code = 'require("ajv/dist/runtime/ucs2length").default'));
};
