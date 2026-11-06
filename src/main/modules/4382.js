module.exports = (e, t, r) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.isUrlProbablySupportMultiRangeRequests = l),
    (t.createClient = function (e, t, r) {
      if ("string" == typeof e)
        throw (0, n.newError)(
          "Please pass PublishConfiguration object",
          "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION",
        );
      const u = e.provider;
      switch (u) {
        case "github": {
          const n = e,
            i = (n.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || n.token;
          return null == i
            ? new s.GitHubProvider(n, t, r)
            : new c.PrivateGitHubProvider(n, t, i, r);
        }
        case "bitbucket":
          return new i.BitbucketProvider(e, t, r);
        case "keygen":
          return new a.KeygenProvider(e, t, r);
        case "s3":
        case "spaces":
          return new o.GenericProvider(
            {
              provider: "generic",
              url: (0, n.getS3LikeProviderBaseUrl)(e),
              channel: e.channel || null,
            },
            t,
            { ...r, isUseMultipleRangeRequest: !1 },
          );
        case "generic": {
          const n = e;
          return new o.GenericProvider(n, t, {
            ...r,
            isUseMultipleRangeRequest: !1 !== n.useMultipleRangeRequest && l(n.url),
          });
        }
        case "custom": {
          const i = e,
            o = i.updateProvider;
          if (!o)
            throw (0, n.newError)(
              "Custom provider not specified",
              "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION",
            );
          return new o(i, t, r);
        }
        default:
          throw (0, n.newError)(`Unsupported provider: ${u}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
      }
    }));
  const n = r(23108),
    i = r(5930),
    o = r(93702),
    s = r(33370),
    a = r(48618),
    c = r(9807);
  function l(e) {
    return !e.includes("s3.amazonaws.com");
  }
};
