module.exports = (e) => {
  "use strict";
  e.exports = {
    transform: function ({
      logger: e,
      message: t,
      transport: r,
      initialData: n = t?.data || [],
      transforms: i = r?.transforms,
    }) {
      return i.reduce(
        (n, i) =>
          "function" == typeof i ? i({ data: n, logger: e, message: t, transport: r }) : n,
        n,
      );
    },
  };
};
