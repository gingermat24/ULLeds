module.exports = (e) => {
  function t(e) {
    "function" == typeof this.jobs[e] && this.jobs[e]();
  }
  e.exports = function (e) {
    (Object.keys(e.jobs).forEach(t.bind(e)), (e.jobs = {}));
  };
};
