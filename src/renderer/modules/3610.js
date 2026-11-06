module.exports = (e, t, n) => {
  var r = n(6559);
  e.exports = function (e) {
    var t = new e.constructor(e.byteLength);
    return (new r(t).set(new r(e)), t);
  };
};
