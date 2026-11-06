module.exports = (e, t, r) => {
  const { ipcMain: n } = r(84157),
    {
      defaultGroupDevice: i,
      findByUUID: o,
      insertOne: s,
      updateByUUID: a,
      updateGroupDevice: c,
    } = r(22359);
  e.exports = {
    initialize: () => {
      (n.handle("defaultGroupDevice", () => i()),
        n.handle("updateByUUID", (e, t) => {
          a(t);
        }),
        n.handle("insertOne", (e, t) => {
          s(t);
        }),
        n.handle("findByUUID", (e, t) => o(t)),
        n.handle("updateGroupDevice", (e, t) => {
          c(t);
        }));
    },
  };
};
