module.exports = (e, t, r) => {
  "use strict";
  const { stringify: n } = r(17019),
    { outputFile: i } = r(98749);
  e.exports = async function (e, t, r = {}) {
    const o = n(t, r);
    await i(e, o, r);
  };
};
