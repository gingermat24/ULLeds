module.exports = (e, t, r) => {
  "use strict";
  const n = r(3612);
  class i {
    static instances = {};
    dependencies = {};
    errorHandler = null;
    eventLogger = null;
    functions = {};
    hooks = [];
    isDev = !1;
    levels = null;
    logId = null;
    scope = null;
    transports = {};
    variables = {};
    constructor({
      allowUnknownLevel: e = !1,
      dependencies: t = {},
      errorHandler: r,
      eventLogger: o,
      initializeFn: s,
      isDev: a = !1,
      levels: c = ["error", "warn", "info", "verbose", "debug", "silly"],
      logId: l,
      transportFactories: u = {},
      variables: p,
    } = {}) {
      ((this.addLevel = this.addLevel.bind(this)),
        (this.create = this.create.bind(this)),
        (this.initialize = this.initialize.bind(this)),
        (this.logData = this.logData.bind(this)),
        (this.processMessage = this.processMessage.bind(this)),
        (this.allowUnknownLevel = e),
        (this.dependencies = t),
        (this.initializeFn = s),
        (this.isDev = a),
        (this.levels = c),
        (this.logId = l),
        (this.transportFactories = u),
        (this.variables = p || {}),
        (this.scope = n(this)));
      for (const e of this.levels) this.addLevel(e, !1);
      ((this.log = this.info),
        (this.functions.log = this.log),
        (this.errorHandler = r),
        r?.setOptions({ ...t, logFn: this.error }),
        (this.eventLogger = o),
        o?.setOptions({ ...t, logger: this }));
      for (const [e, r] of Object.entries(u)) this.transports[e] = r(this, t);
      i.instances[l] = this;
    }
    static getInstance({ logId: e }) {
      return this.instances[e] || this.instances.default;
    }
    addLevel(e, t = this.levels.length) {
      (!1 !== t && this.levels.splice(t, 0, e),
        (this[e] = (...t) => this.logData(t, { level: e })),
        (this.functions[e] = this[e]));
    }
    catchErrors(e) {
      return (
        this.processMessage(
          { data: ["log.catchErrors is deprecated. Use log.errorHandler instead"], level: "warn" },
          { transports: ["console"] },
        ),
        this.errorHandler.startCatching(e)
      );
    }
    create(e) {
      return (
        "string" == typeof e && (e = { logId: e }),
        new i({
          dependencies: this.dependencies,
          errorHandler: this.errorHandler,
          initializeFn: this.initializeFn,
          isDev: this.isDev,
          transportFactories: this.transportFactories,
          variables: { ...this.variables },
          ...e,
        })
      );
    }
    compareLevels(e, t, r = this.levels) {
      const n = r.indexOf(e),
        i = r.indexOf(t);
      return -1 === i || -1 === n || i <= n;
    }
    initialize(e = {}) {
      this.initializeFn({ logger: this, ...this.dependencies, ...e });
    }
    logData(e, t = {}) {
      this.processMessage({ data: e, ...t });
    }
    processMessage(e, { transports: t = this.transports } = {}) {
      if ("errorHandler" === e.cmd)
        return void this.errorHandler.handle(e.error, {
          errorName: e.errorName,
          processType: "renderer",
          showDialog: Boolean(e.showDialog),
        });
      let r = e.level;
      this.allowUnknownLevel || (r = this.levels.includes(e.level) ? e.level : "info");
      const n = {
        date: new Date(),
        logId: this.logId,
        ...e,
        level: r,
        variables: { ...this.variables, ...e.variables },
      };
      for (const [r, i] of this.transportEntries(t))
        if ("function" == typeof i && !1 !== i.level && this.compareLevels(i.level, e.level))
          try {
            const e = this.hooks.reduce((e, t) => (e ? t(e, i, r) : e), n);
            e && i({ ...e, data: [...e.data] });
          } catch (e) {
            this.processInternalErrorFn(e);
          }
    }
    processInternalErrorFn(e) {}
    transportEntries(e = this.transports) {
      return (Array.isArray(e) ? e : Object.entries(e))
        .map((e) => {
          switch (typeof e) {
            case "string":
              return this.transports[e] ? [e, this.transports[e]] : null;
            case "function":
              return [e.name, e];
            default:
              return Array.isArray(e) ? e : null;
          }
        })
        .filter(Boolean);
    }
  }
  e.exports = i;
};
