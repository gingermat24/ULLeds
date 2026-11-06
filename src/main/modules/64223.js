module.exports = (e, t, r) => {
  "use strict";
  const n = r(28746);
  e.exports = {
    readJson: n.readFile,
    readJsonSync: n.readFileSync,
    writeJson: n.writeFile,
    writeJsonSync: n.writeFileSync,
  };
};
