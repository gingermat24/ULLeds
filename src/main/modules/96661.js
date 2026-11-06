module.exports = (e, t) => {
  "use strict";
  function r(e, t) {
    return (null != t && t.length > 0 && (t.startsWith("/") || (e += "/"), (e += t)), e);
  }
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.githubUrl = function (e, t = "github.com") {
      return `${e.protocol || "https"}://${e.host || t}`;
    }),
    (t.getS3LikeProviderBaseUrl = function (e) {
      const t = e.provider;
      if ("s3" === t)
        return (function (e) {
          let t;
          if (1 == e.accelerate) t = `https://${e.bucket}.s3-accelerate.amazonaws.com`;
          else if (null != e.endpoint) t = `${e.endpoint}/${e.bucket}`;
          else if (e.bucket.includes(".")) {
            if (null == e.region)
              throw new Error(`Bucket name "${e.bucket}" includes a dot, but S3 region is missing`);
            t =
              "us-east-1" === e.region
                ? `https://s3.amazonaws.com/${e.bucket}`
                : `https://s3-${e.region}.amazonaws.com/${e.bucket}`;
          } else
            t =
              "cn-north-1" === e.region
                ? `https://${e.bucket}.s3.${e.region}.amazonaws.com.cn`
                : `https://${e.bucket}.s3.amazonaws.com`;
          return r(t, e.path);
        })(e);
      if ("spaces" === t)
        return (function (e) {
          if (null == e.name) throw new Error("name is missing");
          if (null == e.region) throw new Error("region is missing");
          return r(`https://${e.name}.${e.region}.digitaloceanspaces.com`, e.path);
        })(e);
      throw new Error(`Not supported provider: ${t}`);
    }));
};
