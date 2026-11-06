module.exports = (e, t, n) => {
  var r = n(6106),
    o = r ? r.prototype : void 0,
    i = o ? o.valueOf : void 0;
  e.exports = function (e) {
    return i ? Object(i.call(e)) : {};
  };
};
