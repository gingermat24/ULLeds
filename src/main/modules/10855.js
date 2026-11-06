module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.deserialize = t.serialize = t.isSerializableObject = t.isPromise = void 0));
  const n = r(84157);
  t.isPromise = function (e) {
    return (
      e &&
      e.then &&
      e.then instanceof Function &&
      e.constructor &&
      e.constructor.reject &&
      e.constructor.reject instanceof Function &&
      e.constructor.resolve &&
      e.constructor.resolve instanceof Function
    );
  };
  const i = [Boolean, Number, String, Date, Error, RegExp, ArrayBuffer];
  function o(e) {
    return null === e || ArrayBuffer.isView(e) || i.some((t) => e instanceof t);
  }
  t.isSerializableObject = o;
  const s = function (e, t) {
    const r = Object.entries(e).map(([e, r]) => [e, t(r)]);
    return Object.fromEntries(r);
  };
  ((t.serialize = function e(t) {
    return t && t.constructor && "NativeImage" === t.constructor.name
      ? (function (e) {
          const t = [],
            r = e.getScaleFactors();
          if (1 === r.length) {
            const n = r[0],
              i = e.getSize(n),
              o = e.toBitmap({ scaleFactor: n });
            t.push({ scaleFactor: n, size: i, buffer: o });
          } else
            for (const n of r) {
              const r = e.getSize(n),
                i = e.toDataURL({ scaleFactor: n });
              t.push({ scaleFactor: n, size: r, dataURL: i });
            }
          return { __ELECTRON_SERIALIZED_NativeImage__: !0, representations: t };
        })(t)
      : Array.isArray(t)
        ? t.map(e)
        : o(t)
          ? t
          : t instanceof Object
            ? s(t, e)
            : t;
  }),
    (t.deserialize = function e(t) {
      return t && t.__ELECTRON_SERIALIZED_NativeImage__
        ? (function (e) {
            const t = n.nativeImage.createEmpty();
            if (1 === e.representations.length) {
              const { buffer: r, size: n, scaleFactor: i } = e.representations[0],
                { width: o, height: s } = n;
              t.addRepresentation({ buffer: r, scaleFactor: i, width: o, height: s });
            } else
              for (const r of e.representations) {
                const { dataURL: e, size: n, scaleFactor: i } = r,
                  { width: o, height: s } = n;
                t.addRepresentation({ dataURL: e, scaleFactor: i, width: o, height: s });
              }
            return t;
          })(t)
        : Array.isArray(t)
          ? t.map(e)
          : o(t)
            ? t
            : t instanceof Object
              ? s(t, e)
              : t;
    }));
};
