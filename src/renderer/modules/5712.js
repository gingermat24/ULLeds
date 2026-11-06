module.exports = (e, t, n) => {
  var r = n(3610),
    o = n(3768),
    i = n(2316),
    a = n(2653),
    s = n(3584);
  e.exports = function (e, t, n) {
    var l = e.constructor;
    switch (t) {
      case "[object ArrayBuffer]":
        return r(e);
      case "[object Boolean]":
      case "[object Date]":
        return new l(+e);
      case "[object DataView]":
        return o(e, n);
      case "[object Float32Array]":
      case "[object Float64Array]":
      case "[object Int8Array]":
      case "[object Int16Array]":
      case "[object Int32Array]":
      case "[object Uint8Array]":
      case "[object Uint8ClampedArray]":
      case "[object Uint16Array]":
      case "[object Uint32Array]":
        return s(e, n);
      case "[object Map]":
      case "[object Set]":
        return new l();
      case "[object Number]":
      case "[object String]":
        return new l(e);
      case "[object RegExp]":
        return i(e);
      case "[object Symbol]":
        return a(e);
    }
  };
};
