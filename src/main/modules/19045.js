module.exports = (e) => {
  e.exports = function (e, t) {
    return (
      Object.keys(t).forEach(function (r) {
        e[r] = e[r] || t[r];
      }),
      e
    );
  };
};
