module.exports = (e, t) => {
  "use strict";
  (Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.NOOP =
      t.LIMIT_FILES_DESCRIPTORS =
      t.LIMIT_BASENAME_LENGTH =
      t.IS_USER_ROOT =
      t.IS_POSIX =
      t.DEFAULT_TIMEOUT_SYNC =
      t.DEFAULT_TIMEOUT_ASYNC =
      t.DEFAULT_WRITE_OPTIONS =
      t.DEFAULT_READ_OPTIONS =
      t.DEFAULT_FOLDER_MODE =
      t.DEFAULT_FILE_MODE =
      t.DEFAULT_ENCODING =
        void 0),
    (t.DEFAULT_ENCODING = "utf8"),
    (t.DEFAULT_FILE_MODE = 438),
    (t.DEFAULT_FOLDER_MODE = 511),
    (t.DEFAULT_READ_OPTIONS = {}),
    (t.DEFAULT_WRITE_OPTIONS = {}),
    (t.DEFAULT_TIMEOUT_ASYNC = 5e3),
    (t.DEFAULT_TIMEOUT_SYNC = 100));
  const r = !!process.getuid;
  t.IS_POSIX = r;
  const n = !!process.getuid && !process.getuid();
  ((t.IS_USER_ROOT = n),
    (t.LIMIT_BASENAME_LENGTH = 128),
    (t.LIMIT_FILES_DESCRIPTORS = 1e4),
    (t.NOOP = () => {}));
};
