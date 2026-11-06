module.exports = (e, t, r) => {
  "use strict";
  const n = r(6158);
  e.exports = {
    utimesMillis: function (e, t, r, i) {
      n.open(e, "r+", (e, o) => {
        if (e) return i(e);
        n.futimes(o, t, r, (e) => {
          n.close(o, (t) => {
            i && i(e || t);
          });
        });
      });
    },
    utimesMillisSync: function (e, t, r) {
      const i = n.openSync(e, "r+");
      return (n.futimesSync(i, t, r), n.closeSync(i));
    },
  };
};
