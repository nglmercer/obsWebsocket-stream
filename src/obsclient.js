"use strict";
var OBSWebSocket = (() => {
  var He = Object.create;
  var re = Object.defineProperty;
  var We = Object.getOwnPropertyDescriptor;
  var Ke = Object.getOwnPropertyNames,
    W = Object.getOwnPropertySymbols,
    ze = Object.getPrototypeOf,
    ie = Object.prototype.hasOwnProperty,
    Se = Object.prototype.propertyIsEnumerable;
  var ne = (t, n, e) =>
      n in t
        ? re(t, n, { enumerable: !0, configurable: !0, writable: !0, value: e })
        : (t[n] = e),
    D = (t, n) => {
      for (var e in n || (n = {})) ie.call(n, e) && ne(t, e, n[e]);
      if (W) for (var e of W(n)) Se.call(n, e) && ne(t, e, n[e]);
      return t;
    };
  var he = ((t) =>
    typeof require != "undefined"
      ? require
      : typeof Proxy != "undefined"
      ? new Proxy(t, {
          get: (n, e) => (typeof require != "undefined" ? require : n)[e],
        })
      : t)(function (t) {
    if (typeof require != "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + t + '" is not supported');
  });
  var ye = (t, n) => {
    var e = {};
    for (var i in t) ie.call(t, i) && n.indexOf(i) < 0 && (e[i] = t[i]);
    if (t != null && W)
      for (var i of W(t)) n.indexOf(i) < 0 && Se.call(t, i) && (e[i] = t[i]);
    return e;
  };
  var P = (t, n) => () => (t && (n = t((t = 0))), n);
  var G = (t, n) => () => (n || t((n = { exports: {} }).exports, n), n.exports);
  var $e = (t, n, e, i) => {
    if ((n && typeof n == "object") || typeof n == "function")
      for (let u of Ke(n))
        !ie.call(t, u) &&
          u !== e &&
          re(t, u, {
            get: () => n[u],
            enumerable: !(i = We(n, u)) || i.enumerable,
          });
    return t;
  };
  var K = (t, n, e) => (
    (e = t != null ? He(ze(t)) : {}),
    $e(
      n || !t || !t.__esModule
        ? re(e, "default", { value: t, enumerable: !0 })
        : e,
      t
    )
  );
  var B = (t, n, e) => ne(t, typeof n != "symbol" ? n + "" : n, e);
  var O = (t, n, e) =>
    new Promise((i, u) => {
      var m = (o) => {
          try {
            f(e.next(o));
          } catch (c) {
            u(c);
          }
        },
        l = (o) => {
          try {
            f(e.throw(o));
          } catch (c) {
            u(c);
          }
        },
        f = (o) => (o.done ? i(o.value) : Promise.resolve(o.value).then(m, l));
      f((e = e.apply(t, n)).next());
    });
  var be = G((pt, ve) => {
    "use strict";
    var U = 1e3,
      A = U * 60,
      L = A * 60,
      x = L * 24,
      Qe = x * 7,
      Ze = x * 365.25;
    ve.exports = function (t, n) {
      n = n || {};
      var e = typeof t;
      if (e === "string" && t.length > 0) return Xe(t);
      if (e === "number" && isFinite(t)) return n.long ? et(t) : Ye(t);
      throw new Error(
        "val is not a non-empty string or a valid number. val=" +
          JSON.stringify(t)
      );
    };
    function Xe(t) {
      if (((t = String(t)), !(t.length > 100))) {
        var n =
          /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
            t
          );
        if (n) {
          var e = parseFloat(n[1]),
            i = (n[2] || "ms").toLowerCase();
          switch (i) {
            case "years":
            case "year":
            case "yrs":
            case "yr":
            case "y":
              return e * Ze;
            case "weeks":
            case "week":
            case "w":
              return e * Qe;
            case "days":
            case "day":
            case "d":
              return e * x;
            case "hours":
            case "hour":
            case "hrs":
            case "hr":
            case "h":
              return e * L;
            case "minutes":
            case "minute":
            case "mins":
            case "min":
            case "m":
              return e * A;
            case "seconds":
            case "second":
            case "secs":
            case "sec":
            case "s":
              return e * U;
            case "milliseconds":
            case "millisecond":
            case "msecs":
            case "msec":
            case "ms":
              return e;
            default:
              return;
          }
        }
      }
    }
    function Ye(t) {
      var n = Math.abs(t);
      return n >= x
        ? Math.round(t / x) + "d"
        : n >= L
        ? Math.round(t / L) + "h"
        : n >= A
        ? Math.round(t / A) + "m"
        : n >= U
        ? Math.round(t / U) + "s"
        : t + "ms";
    }
    function et(t) {
      var n = Math.abs(t);
      return n >= x
        ? z(t, n, x, "day")
        : n >= L
        ? z(t, n, L, "hour")
        : n >= A
        ? z(t, n, A, "minute")
        : n >= U
        ? z(t, n, U, "second")
        : t + " ms";
    }
    function z(t, n, e, i) {
      var u = n >= e * 1.5;
      return Math.round(t / e) + " " + i + (u ? "s" : "");
    }
  });
  var Ie = G((lt, Ce) => {
    "use strict";
    function tt(t) {
      (e.debug = e),
        (e.default = e),
        (e.coerce = o),
        (e.disable = m),
        (e.enable = u),
        (e.enabled = l),
        (e.humanize = be()),
        (e.destroy = c),
        Object.keys(t).forEach((d) => {
          e[d] = t[d];
        }),
        (e.names = []),
        (e.skips = []),
        (e.formatters = {});
      function n(d) {
        let s = 0;
        for (let g = 0; g < d.length; g++)
          (s = (s << 5) - s + d.charCodeAt(g)), (s |= 0);
        return e.colors[Math.abs(s) % e.colors.length];
      }
      e.selectColor = n;
      function e(d) {
        let s,
          g = null,
          p,
          y;
        function b(...C) {
          if (!b.enabled) return;
          let r = b,
            a = Number(new Date()),
            h = a - (s || a);
          (r.diff = h),
            (r.prev = s),
            (r.curr = a),
            (s = a),
            (C[0] = e.coerce(C[0])),
            typeof C[0] != "string" && C.unshift("%O");
          let S = 0;
          (C[0] = C[0].replace(/%([a-zA-Z%])/g, (v, F) => {
            if (v === "%%") return "%";
            S++;
            let N = e.formatters[F];
            if (typeof N == "function") {
              let R = C[S];
              (v = N.call(r, R)), C.splice(S, 1), S--;
            }
            return v;
          })),
            e.formatArgs.call(r, C),
            (r.log || e.log).apply(r, C);
        }
        return (
          (b.namespace = d),
          (b.useColors = e.useColors()),
          (b.color = e.selectColor(d)),
          (b.extend = i),
          (b.destroy = e.destroy),
          Object.defineProperty(b, "enabled", {
            enumerable: !0,
            configurable: !1,
            get: () =>
              g !== null
                ? g
                : (p !== e.namespaces &&
                    ((p = e.namespaces), (y = e.enabled(d))),
                  y),
            set: (C) => {
              g = C;
            },
          }),
          typeof e.init == "function" && e.init(b),
          b
        );
      }
      function i(d, s) {
        let g = e(this.namespace + (typeof s == "undefined" ? ":" : s) + d);
        return (g.log = this.log), g;
      }
      function u(d) {
        e.save(d), (e.namespaces = d), (e.names = []), (e.skips = []);
        let s,
          g = (typeof d == "string" ? d : "").split(/[\s,]+/),
          p = g.length;
        for (s = 0; s < p; s++)
          g[s] &&
            ((d = g[s].replace(/\*/g, ".*?")),
            d[0] === "-"
              ? e.skips.push(new RegExp("^" + d.slice(1) + "$"))
              : e.names.push(new RegExp("^" + d + "$")));
      }
      function m() {
        let d = [...e.names.map(f), ...e.skips.map(f).map((s) => "-" + s)].join(
          ","
        );
        return e.enable(""), d;
      }
      function l(d) {
        if (d[d.length - 1] === "*") return !0;
        let s, g;
        for (s = 0, g = e.skips.length; s < g; s++)
          if (e.skips[s].test(d)) return !1;
        for (s = 0, g = e.names.length; s < g; s++)
          if (e.names[s].test(d)) return !0;
        return !1;
      }
      function f(d) {
        return d
          .toString()
          .substring(2, d.toString().length - 2)
          .replace(/\.\*\?$/, "*");
      }
      function o(d) {
        return d instanceof Error ? d.stack || d.message : d;
      }
      function c() {
        console.warn(
          "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
        );
      }
      return e.enable(e.load()), e;
    }
    Ce.exports = tt;
  });
  var Te = G((M, $) => {
    "use strict";
    M.formatArgs = rt;
    M.save = it;
    M.load = st;
    M.useColors = nt;
    M.storage = ot();
    M.destroy = (() => {
      let t = !1;
      return () => {
        t ||
          ((t = !0),
          console.warn(
            "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
          ));
      };
    })();
    M.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33",
    ];
    function nt() {
      if (
        typeof window != "undefined" &&
        window.process &&
        (window.process.type === "renderer" || window.process.__nwjs)
      )
        return !0;
      if (
        typeof navigator != "undefined" &&
        navigator.userAgent &&
        navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)
      )
        return !1;
      let t;
      return (
        (typeof document != "undefined" &&
          document.documentElement &&
          document.documentElement.style &&
          document.documentElement.style.WebkitAppearance) ||
        (typeof window != "undefined" &&
          window.console &&
          (window.console.firebug ||
            (window.console.exception && window.console.table))) ||
        (typeof navigator != "undefined" &&
          navigator.userAgent &&
          (t = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) &&
          parseInt(t[1], 10) >= 31) ||
        (typeof navigator != "undefined" &&
          navigator.userAgent &&
          navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/))
      );
    }
    function rt(t) {
      if (
        ((t[0] =
          (this.useColors ? "%c" : "") +
          this.namespace +
          (this.useColors ? " %c" : " ") +
          t[0] +
          (this.useColors ? "%c " : " ") +
          "+" +
          $.exports.humanize(this.diff)),
        !this.useColors)
      )
        return;
      let n = "color: " + this.color;
      t.splice(1, 0, n, "color: inherit");
      let e = 0,
        i = 0;
      t[0].replace(/%[a-zA-Z%]/g, (u) => {
        u !== "%%" && (e++, u === "%c" && (i = e));
      }),
        t.splice(i, 0, n);
    }
    M.log = console.debug || console.log || (() => {});
    function it(t) {
      try {
        t ? M.storage.setItem("debug", t) : M.storage.removeItem("debug");
      } catch (n) {}
    }
    function st() {
      let t;
      try {
        t = M.storage.getItem("debug");
      } catch (n) {}
      return (
        !t &&
          typeof process != "undefined" &&
          "env" in process &&
          (t = process.env.DEBUG),
        t
      );
    }
    function ot() {
      try {
        return localStorage;
      } catch (t) {}
    }
    $.exports = Ie()(M);
    var { formatters: at } = $.exports;
    at.j = function (t) {
      try {
        return JSON.stringify(t);
      } catch (n) {
        return "[UnexpectedJSONParseError]: " + n.message;
      }
    };
  });
  var Oe = G((mt, se) => {
    "use strict";
    var ut = Object.prototype.hasOwnProperty,
      w = "~";
    function J() {}
    Object.create &&
      ((J.prototype = Object.create(null)), new J().__proto__ || (w = !1));
    function ct(t, n, e) {
      (this.fn = t), (this.context = n), (this.once = e || !1);
    }
    function Ne(t, n, e, i, u) {
      if (typeof e != "function")
        throw new TypeError("The listener must be a function");
      var m = new ct(e, i || t, u),
        l = w ? w + n : n;
      return (
        t._events[l]
          ? t._events[l].fn
            ? (t._events[l] = [t._events[l], m])
            : t._events[l].push(m)
          : ((t._events[l] = m), t._eventsCount++),
        t
      );
    }
    function Q(t, n) {
      --t._eventsCount === 0 ? (t._events = new J()) : delete t._events[n];
    }
    function T() {
      (this._events = new J()), (this._eventsCount = 0);
    }
    T.prototype.eventNames = function () {
      var n = [],
        e,
        i;
      if (this._eventsCount === 0) return n;
      for (i in (e = this._events)) ut.call(e, i) && n.push(w ? i.slice(1) : i);
      return Object.getOwnPropertySymbols
        ? n.concat(Object.getOwnPropertySymbols(e))
        : n;
    };
    T.prototype.listeners = function (n) {
      var e = w ? w + n : n,
        i = this._events[e];
      if (!i) return [];
      if (i.fn) return [i.fn];
      for (var u = 0, m = i.length, l = new Array(m); u < m; u++)
        l[u] = i[u].fn;
      return l;
    };
    T.prototype.listenerCount = function (n) {
      var e = w ? w + n : n,
        i = this._events[e];
      return i ? (i.fn ? 1 : i.length) : 0;
    };
    T.prototype.emit = function (n, e, i, u, m, l) {
      var f = w ? w + n : n;
      if (!this._events[f]) return !1;
      var o = this._events[f],
        c = arguments.length,
        d,
        s;
      if (o.fn) {
        switch ((o.once && this.removeListener(n, o.fn, void 0, !0), c)) {
          case 1:
            return o.fn.call(o.context), !0;
          case 2:
            return o.fn.call(o.context, e), !0;
          case 3:
            return o.fn.call(o.context, e, i), !0;
          case 4:
            return o.fn.call(o.context, e, i, u), !0;
          case 5:
            return o.fn.call(o.context, e, i, u, m), !0;
          case 6:
            return o.fn.call(o.context, e, i, u, m, l), !0;
        }
        for (s = 1, d = new Array(c - 1); s < c; s++) d[s - 1] = arguments[s];
        o.fn.apply(o.context, d);
      } else {
        var g = o.length,
          p;
        for (s = 0; s < g; s++)
          switch (
            (o[s].once && this.removeListener(n, o[s].fn, void 0, !0), c)
          ) {
            case 1:
              o[s].fn.call(o[s].context);
              break;
            case 2:
              o[s].fn.call(o[s].context, e);
              break;
            case 3:
              o[s].fn.call(o[s].context, e, i);
              break;
            case 4:
              o[s].fn.call(o[s].context, e, i, u);
              break;
            default:
              if (!d)
                for (p = 1, d = new Array(c - 1); p < c; p++)
                  d[p - 1] = arguments[p];
              o[s].fn.apply(o[s].context, d);
          }
      }
      return !0;
    };
    T.prototype.on = function (n, e, i) {
      return Ne(this, n, e, i, !1);
    };
    T.prototype.once = function (n, e, i) {
      return Ne(this, n, e, i, !0);
    };
    T.prototype.removeListener = function (n, e, i, u) {
      var m = w ? w + n : n;
      if (!this._events[m]) return this;
      if (!e) return Q(this, m), this;
      var l = this._events[m];
      if (l.fn)
        l.fn === e && (!u || l.once) && (!i || l.context === i) && Q(this, m);
      else {
        for (var f = 0, o = [], c = l.length; f < c; f++)
          (l[f].fn !== e || (u && !l[f].once) || (i && l[f].context !== i)) &&
            o.push(l[f]);
        o.length ? (this._events[m] = o.length === 1 ? o[0] : o) : Q(this, m);
      }
      return this;
    };
    T.prototype.removeAllListeners = function (n) {
      var e;
      return (
        n
          ? ((e = w ? w + n : n), this._events[e] && Q(this, e))
          : ((this._events = new J()), (this._eventsCount = 0)),
        this
      );
    };
    T.prototype.off = T.prototype.removeListener;
    T.prototype.addListener = T.prototype.on;
    T.prefixed = w;
    T.EventEmitter = T;
    typeof se != "undefined" && (se.exports = T);
  });
  var Z,
    we = P(() => {
      "use strict";
      Z = K(Oe(), 1);
    });
  var _,
    oe,
    Me = P(() => {
      "use strict";
      _ = null;
      typeof WebSocket != "undefined"
        ? (_ = WebSocket)
        : typeof MozWebSocket != "undefined"
        ? (_ = MozWebSocket)
        : typeof global != "undefined"
        ? (_ = global.WebSocket || global.MozWebSocket)
        : typeof window != "undefined"
        ? (_ = window.WebSocket || window.MozWebSocket)
        : typeof self != "undefined" &&
          (_ = self.WebSocket || self.MozWebSocket);
      oe = _;
    });
  var ae,
    ue,
    ce,
    Re = P(() => {
      "use strict";
      (ae = ((c) => (
        (c[(c.Hello = 0)] = "Hello"),
        (c[(c.Identify = 1)] = "Identify"),
        (c[(c.Identified = 2)] = "Identified"),
        (c[(c.Reidentify = 3)] = "Reidentify"),
        (c[(c.Event = 5)] = "Event"),
        (c[(c.Request = 6)] = "Request"),
        (c[(c.RequestResponse = 7)] = "RequestResponse"),
        (c[(c.RequestBatch = 8)] = "RequestBatch"),
        (c[(c.RequestBatchResponse = 9)] = "RequestBatchResponse"),
        c
      ))(ae || {})),
        (ue = ((r) => (
          (r[(r.None = 0)] = "None"),
          (r[(r.General = 1)] = "General"),
          (r[(r.Config = 2)] = "Config"),
          (r[(r.Scenes = 4)] = "Scenes"),
          (r[(r.Inputs = 8)] = "Inputs"),
          (r[(r.Transitions = 16)] = "Transitions"),
          (r[(r.Filters = 32)] = "Filters"),
          (r[(r.Outputs = 64)] = "Outputs"),
          (r[(r.SceneItems = 128)] = "SceneItems"),
          (r[(r.MediaInputs = 256)] = "MediaInputs"),
          (r[(r.Vendors = 512)] = "Vendors"),
          (r[(r.Ui = 1024)] = "Ui"),
          (r[(r.All = 2047)] = "All"),
          (r[(r.InputVolumeMeters = 65536)] = "InputVolumeMeters"),
          (r[(r.InputActiveStateChanged = 131072)] = "InputActiveStateChanged"),
          (r[(r.InputShowStateChanged = 262144)] = "InputShowStateChanged"),
          (r[(r.SceneItemTransformChanged = 524288)] =
            "SceneItemTransformChanged"),
          r
        ))(ue || {})),
        (ce = ((u) => (
          (u[(u.None = -1)] = "None"),
          (u[(u.SerialRealtime = 0)] = "SerialRealtime"),
          (u[(u.SerialFrame = 1)] = "SerialFrame"),
          (u[(u.Parallel = 2)] = "Parallel"),
          u
        ))(ce || {}));
    });
  var Be = G(() => {
    "use strict";
  });
  var de = G((X, Fe) => {
    "use strict";
    (function (t, n) {
      typeof X == "object"
        ? (Fe.exports = X = n())
        : typeof define == "function" && define.amd
        ? define([], n)
        : (t.CryptoJS = n());
    })(X, function () {
      var t =
        t ||
        (function (n, e) {
          var i;
          if (
            (typeof window != "undefined" &&
              window.crypto &&
              (i = window.crypto),
            typeof self != "undefined" && self.crypto && (i = self.crypto),
            typeof globalThis != "undefined" &&
              globalThis.crypto &&
              (i = globalThis.crypto),
            !i &&
              typeof window != "undefined" &&
              window.msCrypto &&
              (i = window.msCrypto),
            !i &&
              typeof global != "undefined" &&
              global.crypto &&
              (i = global.crypto),
            !i && typeof he == "function")
          )
            try {
              i = Be();
            } catch (r) {}
          var u = function () {
              if (i) {
                if (typeof i.getRandomValues == "function")
                  try {
                    return i.getRandomValues(new Uint32Array(1))[0];
                  } catch (r) {}
                if (typeof i.randomBytes == "function")
                  try {
                    return i.randomBytes(4).readInt32LE();
                  } catch (r) {}
              }
              throw new Error(
                "Native crypto module could not be used to get secure random number."
              );
            },
            m =
              Object.create ||
              (function () {
                function r() {}
                return function (a) {
                  var h;
                  return (
                    (r.prototype = a), (h = new r()), (r.prototype = null), h
                  );
                };
              })(),
            l = {},
            f = (l.lib = {}),
            o = (f.Base = (function () {
              return {
                extend: function (r) {
                  var a = m(this);
                  return (
                    r && a.mixIn(r),
                    (!a.hasOwnProperty("init") || this.init === a.init) &&
                      (a.init = function () {
                        a.$super.init.apply(this, arguments);
                      }),
                    (a.init.prototype = a),
                    (a.$super = this),
                    a
                  );
                },
                create: function () {
                  var r = this.extend();
                  return r.init.apply(r, arguments), r;
                },
                init: function () {},
                mixIn: function (r) {
                  for (var a in r) r.hasOwnProperty(a) && (this[a] = r[a]);
                  r.hasOwnProperty("toString") && (this.toString = r.toString);
                },
                clone: function () {
                  return this.init.prototype.extend(this);
                },
              };
            })()),
            c = (f.WordArray = o.extend({
              init: function (r, a) {
                (r = this.words = r || []),
                  a != e ? (this.sigBytes = a) : (this.sigBytes = r.length * 4);
              },
              toString: function (r) {
                return (r || s).stringify(this);
              },
              concat: function (r) {
                var a = this.words,
                  h = r.words,
                  S = this.sigBytes,
                  I = r.sigBytes;
                if ((this.clamp(), S % 4))
                  for (var v = 0; v < I; v++) {
                    var F = (h[v >>> 2] >>> (24 - (v % 4) * 8)) & 255;
                    a[(S + v) >>> 2] |= F << (24 - ((S + v) % 4) * 8);
                  }
                else
                  for (var N = 0; N < I; N += 4) a[(S + N) >>> 2] = h[N >>> 2];
                return (this.sigBytes += I), this;
              },
              clamp: function () {
                var r = this.words,
                  a = this.sigBytes;
                (r[a >>> 2] &= 4294967295 << (32 - (a % 4) * 8)),
                  (r.length = n.ceil(a / 4));
              },
              clone: function () {
                var r = o.clone.call(this);
                return (r.words = this.words.slice(0)), r;
              },
              random: function (r) {
                for (var a = [], h = 0; h < r; h += 4) a.push(u());
                return new c.init(a, r);
              },
            })),
            d = (l.enc = {}),
            s = (d.Hex = {
              stringify: function (r) {
                for (
                  var a = r.words, h = r.sigBytes, S = [], I = 0;
                  I < h;
                  I++
                ) {
                  var v = (a[I >>> 2] >>> (24 - (I % 4) * 8)) & 255;
                  S.push((v >>> 4).toString(16)), S.push((v & 15).toString(16));
                }
                return S.join("");
              },
              parse: function (r) {
                for (var a = r.length, h = [], S = 0; S < a; S += 2)
                  h[S >>> 3] |=
                    parseInt(r.substr(S, 2), 16) << (24 - (S % 8) * 4);
                return new c.init(h, a / 2);
              },
            }),
            g = (d.Latin1 = {
              stringify: function (r) {
                for (
                  var a = r.words, h = r.sigBytes, S = [], I = 0;
                  I < h;
                  I++
                ) {
                  var v = (a[I >>> 2] >>> (24 - (I % 4) * 8)) & 255;
                  S.push(String.fromCharCode(v));
                }
                return S.join("");
              },
              parse: function (r) {
                for (var a = r.length, h = [], S = 0; S < a; S++)
                  h[S >>> 2] |= (r.charCodeAt(S) & 255) << (24 - (S % 4) * 8);
                return new c.init(h, a);
              },
            }),
            p = (d.Utf8 = {
              stringify: function (r) {
                try {
                  return decodeURIComponent(escape(g.stringify(r)));
                } catch (a) {
                  throw new Error("Malformed UTF-8 data");
                }
              },
              parse: function (r) {
                return g.parse(unescape(encodeURIComponent(r)));
              },
            }),
            y = (f.BufferedBlockAlgorithm = o.extend({
              reset: function () {
                (this._data = new c.init()), (this._nDataBytes = 0);
              },
              _append: function (r) {
                typeof r == "string" && (r = p.parse(r)),
                  this._data.concat(r),
                  (this._nDataBytes += r.sigBytes);
              },
              _process: function (r) {
                var a,
                  h = this._data,
                  S = h.words,
                  I = h.sigBytes,
                  v = this.blockSize,
                  F = v * 4,
                  N = I / F;
                r
                  ? (N = n.ceil(N))
                  : (N = n.max((N | 0) - this._minBufferSize, 0));
                var R = N * v,
                  H = n.min(R * 4, I);
                if (R) {
                  for (var j = 0; j < R; j += v) this._doProcessBlock(S, j);
                  (a = S.splice(0, R)), (h.sigBytes -= H);
                }
                return new c.init(a, H);
              },
              clone: function () {
                var r = o.clone.call(this);
                return (r._data = this._data.clone()), r;
              },
              _minBufferSize: 0,
            })),
            b = (f.Hasher = y.extend({
              cfg: o.extend(),
              init: function (r) {
                (this.cfg = this.cfg.extend(r)), this.reset();
              },
              reset: function () {
                y.reset.call(this), this._doReset();
              },
              update: function (r) {
                return this._append(r), this._process(), this;
              },
              finalize: function (r) {
                r && this._append(r);
                var a = this._doFinalize();
                return a;
              },
              blockSize: 512 / 32,
              _createHelper: function (r) {
                return function (a, h) {
                  return new r.init(h).finalize(a);
                };
              },
              _createHmacHelper: function (r) {
                return function (a, h) {
                  return new C.HMAC.init(r, h).finalize(a);
                };
              },
            })),
            C = (l.algo = {});
          return l;
        })(Math);
      return t;
    });
  });
  var Ge = G((Y, ke) => {
    "use strict";
    (function (t, n) {
      typeof Y == "object"
        ? (ke.exports = Y = n(de()))
        : typeof define == "function" && define.amd
        ? define(["./core"], n)
        : n(t.CryptoJS);
    })(Y, function (t) {
      return (
        (function (n) {
          var e = t,
            i = e.lib,
            u = i.WordArray,
            m = i.Hasher,
            l = e.algo,
            f = [],
            o = [];
          (function () {
            function s(b) {
              for (var C = n.sqrt(b), r = 2; r <= C; r++)
                if (!(b % r)) return !1;
              return !0;
            }
            function g(b) {
              return ((b - (b | 0)) * 4294967296) | 0;
            }
            for (var p = 2, y = 0; y < 64; )
              s(p) &&
                (y < 8 && (f[y] = g(n.pow(p, 1 / 2))),
                (o[y] = g(n.pow(p, 1 / 3))),
                y++),
                p++;
          })();
          var c = [],
            d = (l.SHA256 = m.extend({
              _doReset: function () {
                this._hash = new u.init(f.slice(0));
              },
              _doProcessBlock: function (s, g) {
                for (
                  var p = this._hash.words,
                    y = p[0],
                    b = p[1],
                    C = p[2],
                    r = p[3],
                    a = p[4],
                    h = p[5],
                    S = p[6],
                    I = p[7],
                    v = 0;
                  v < 64;
                  v++
                ) {
                  if (v < 16) c[v] = s[g + v] | 0;
                  else {
                    var F = c[v - 15],
                      N =
                        ((F << 25) | (F >>> 7)) ^
                        ((F << 14) | (F >>> 18)) ^
                        (F >>> 3),
                      R = c[v - 2],
                      H =
                        ((R << 15) | (R >>> 17)) ^
                        ((R << 13) | (R >>> 19)) ^
                        (R >>> 10);
                    c[v] = N + c[v - 7] + H + c[v - 16];
                  }
                  var j = (a & h) ^ (~a & S),
                    je = (y & b) ^ (y & C) ^ (b & C),
                    De =
                      ((y << 30) | (y >>> 2)) ^
                      ((y << 19) | (y >>> 13)) ^
                      ((y << 10) | (y >>> 22)),
                    Je =
                      ((a << 26) | (a >>> 6)) ^
                      ((a << 21) | (a >>> 11)) ^
                      ((a << 7) | (a >>> 25)),
                    fe = I + Je + j + o[v] + c[v],
                    Ve = De + je;
                  (I = S),
                    (S = h),
                    (h = a),
                    (a = (r + fe) | 0),
                    (r = C),
                    (C = b),
                    (b = y),
                    (y = (fe + Ve) | 0);
                }
                (p[0] = (p[0] + y) | 0),
                  (p[1] = (p[1] + b) | 0),
                  (p[2] = (p[2] + C) | 0),
                  (p[3] = (p[3] + r) | 0),
                  (p[4] = (p[4] + a) | 0),
                  (p[5] = (p[5] + h) | 0),
                  (p[6] = (p[6] + S) | 0),
                  (p[7] = (p[7] + I) | 0);
              },
              _doFinalize: function () {
                var s = this._data,
                  g = s.words,
                  p = this._nDataBytes * 8,
                  y = s.sigBytes * 8;
                return (
                  (g[y >>> 5] |= 128 << (24 - (y % 32))),
                  (g[(((y + 64) >>> 9) << 4) + 14] = n.floor(p / 4294967296)),
                  (g[(((y + 64) >>> 9) << 4) + 15] = p),
                  (s.sigBytes = g.length * 4),
                  this._process(),
                  this._hash
                );
              },
              clone: function () {
                var s = m.clone.call(this);
                return (s._hash = this._hash.clone()), s;
              },
            }));
          (e.SHA256 = m._createHelper(d)),
            (e.HmacSHA256 = m._createHmacHelper(d));
        })(Math),
        t.SHA256
      );
    });
  });
  var Pe = G((ee, xe) => {
    "use strict";
    (function (t, n) {
      typeof ee == "object"
        ? (xe.exports = ee = n(de()))
        : typeof define == "function" && define.amd
        ? define(["./core"], n)
        : n(t.CryptoJS);
    })(ee, function (t) {
      return (
        (function () {
          var n = t,
            e = n.lib,
            i = e.WordArray,
            u = n.enc,
            m = (u.Base64 = {
              stringify: function (f) {
                var o = f.words,
                  c = f.sigBytes,
                  d = this._map;
                f.clamp();
                for (var s = [], g = 0; g < c; g += 3)
                  for (
                    var p = (o[g >>> 2] >>> (24 - (g % 4) * 8)) & 255,
                      y = (o[(g + 1) >>> 2] >>> (24 - ((g + 1) % 4) * 8)) & 255,
                      b = (o[(g + 2) >>> 2] >>> (24 - ((g + 2) % 4) * 8)) & 255,
                      C = (p << 16) | (y << 8) | b,
                      r = 0;
                    r < 4 && g + r * 0.75 < c;
                    r++
                  )
                    s.push(d.charAt((C >>> (6 * (3 - r))) & 63));
                var a = d.charAt(64);
                if (a) for (; s.length % 4; ) s.push(a);
                return s.join("");
              },
              parse: function (f) {
                var o = f.length,
                  c = this._map,
                  d = this._reverseMap;
                if (!d) {
                  d = this._reverseMap = [];
                  for (var s = 0; s < c.length; s++) d[c.charCodeAt(s)] = s;
                }
                var g = c.charAt(64);
                if (g) {
                  var p = f.indexOf(g);
                  p !== -1 && (o = p);
                }
                return l(f, o, d);
              },
              _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            });
          function l(f, o, c) {
            for (var d = [], s = 0, g = 0; g < o; g++)
              if (g % 4) {
                var p = c[f.charCodeAt(g - 1)] << ((g % 4) * 2),
                  y = c[f.charCodeAt(g)] >>> (6 - (g % 4) * 2),
                  b = p | y;
                (d[s >>> 2] |= b << (24 - (s % 4) * 8)), s++;
              }
            return i.create(d, s);
          }
        })(),
        t.enc.Base64
      );
    });
  });
  function Ue(t, n, e) {
    let i = pe.default.stringify((0, ge.default)(e + t));
    return pe.default.stringify((0, ge.default)(i + n));
  }
  var ge,
    pe,
    Ae = P(() => {
      "use strict";
      (ge = K(Ge(), 1)), (pe = K(Pe(), 1));
    });
  var Le,
    V,
    k,
    q,
    te,
    le = P(() => {
      "use strict";
      Le = K(Te(), 1);
      we();
      Me();
      Ae();
      (V = (0, Le.default)("obs-websocket-js")),
        (k = class extends Error {
          constructor(e, i) {
            super(i);
            this.code = e;
          }
        }),
        (q = class q extends Z.default {
          constructor() {
            super(...arguments);
            B(this, "_identified", !1);
            B(this, "internalListeners", new Z.default());
            B(this, "socket");
          }
          static generateMessageId() {
            return String(q.requestCounter++);
          }
          get identified() {
            return this._identified;
          }
          connect() {
            return O(
              this,
              arguments,
              function* (e = "ws://127.0.0.1:4455", i, u = {}) {
                this.socket && (yield this.disconnect());
                try {
                  let m = this.internalEventPromise("ConnectionClosed"),
                    l = this.internalEventPromise("ConnectionError");
                  return yield Promise.race([
                    O(this, null, function* () {
                      let f = yield this.createConnection(e);
                      return this.emit("Hello", f), this.identify(f, i, u);
                    }),
                    new Promise((f, o) => {
                      l.then((c) => {
                        c.message && o(c);
                      }),
                        m.then((c) => {
                          o(c);
                        });
                    }),
                  ]);
                } catch (m) {
                  throw (yield this.disconnect(), m);
                }
              }
            );
          }
          disconnect() {
            return O(this, null, function* () {
              if (!this.socket || this.socket.readyState === oe.CLOSED) return;
              let e = this.internalEventPromise("ConnectionClosed");
              this.socket.close(), yield e;
            });
          }
          reidentify(e) {
            return O(this, null, function* () {
              let i = this.internalEventPromise("op:2");
              return yield this.message(3, e), i;
            });
          }
          call(e, i) {
            return O(this, null, function* () {
              let u = q.generateMessageId(),
                m = this.internalEventPromise(`res:${u}`);
              yield this.message(6, {
                requestId: u,
                requestType: e,
                requestData: i,
              });
              let { requestStatus: l, responseData: f } = yield m;
              if (!l.result) throw new k(l.code, l.comment);
              return f;
            });
          }
          callBatch(u) {
            return O(this, arguments, function* (e, i = {}) {
              let m = q.generateMessageId(),
                l = this.internalEventPromise(`res:${m}`);
              yield this.message(8, D({ requestId: m, requests: e }, i));
              let { results: f } = yield l;
              return f;
            });
          }
          cleanup() {
            this.socket &&
              ((this.socket.onopen = null),
              (this.socket.onmessage = null),
              (this.socket.onerror = null),
              (this.socket.onclose = null),
              (this.socket = void 0),
              (this._identified = !1),
              this.internalListeners.removeAllListeners());
          }
          createConnection(e) {
            return O(this, null, function* () {
              var l;
              let i = this.internalEventPromise("ConnectionOpened"),
                u = this.internalEventPromise("op:0");
              (this.socket = new oe(e, this.protocol)),
                (this.socket.onopen = this.onOpen.bind(this)),
                (this.socket.onmessage = this.onMessage.bind(this)),
                (this.socket.onerror = this.onError.bind(this)),
                (this.socket.onclose = this.onClose.bind(this)),
                yield i;
              let m = (l = this.socket) == null ? void 0 : l.protocol;
              if (!m) throw new k(-1, "Server sent no subprotocol");
              if (m !== this.protocol)
                throw new k(-1, "Server sent an invalid subprotocol");
              return u;
            });
          }
          identify(c, d) {
            return O(this, arguments, function* (f, m, l = {}) {
              var o = f,
                { authentication: e, rpcVersion: i } = o,
                u = ye(o, ["authentication", "rpcVersion"]);
              let s = D({ rpcVersion: i }, l);
              e && m && (s.authentication = Ue(e.salt, e.challenge, m));
              let g = this.internalEventPromise("op:2");
              yield this.message(1, s);
              let p = yield g;
              return (
                (this._identified = !0),
                this.emit("Identified", p),
                D(D({ rpcVersion: i }, u), p)
              );
            });
          }
          message(e, i) {
            return O(this, null, function* () {
              if (!this.socket) throw new Error("Not connected");
              if (!this.identified && e !== 1)
                throw new Error("Socket not identified");
              let u = yield this.encodeMessage({ op: e, d: i });
              this.socket.send(u);
            });
          }
          internalEventPromise(e) {
            return O(this, null, function* () {
              return new Promise((i) => {
                this.internalListeners.once(e, i);
              });
            });
          }
          onOpen(e) {
            V("socket.open"),
              this.emit("ConnectionOpened"),
              this.internalListeners.emit("ConnectionOpened", e);
          }
          onMessage(e) {
            return O(this, null, function* () {
              try {
                let { op: i, d: u } = yield this.decodeMessage(e.data);
                if (
                  (V("socket.message: %d %j", i, u),
                  i === void 0 || u === void 0)
                )
                  return;
                switch (i) {
                  case 5: {
                    let { eventType: m, eventData: l } = u;
                    this.emit(m, l);
                    return;
                  }
                  case 7:
                  case 9: {
                    let { requestId: m } = u;
                    this.internalListeners.emit(`res:${m}`, u);
                    return;
                  }
                  default:
                    this.internalListeners.emit(`op:${i}`, u);
                }
              } catch (i) {
                V("error handling message: %o", i);
              }
            });
          }
          onError(e) {
            V("socket.error: %o", e);
            let i = new k(-1, e.message);
            this.emit("ConnectionError", i),
              this.internalListeners.emit("ConnectionError", i);
          }
          onClose(e) {
            V("socket.close: %s (%d)", e.reason, e.code);
            let i = new k(e.code, e.reason);
            this.emit("ConnectionClosed", i),
              this.internalListeners.emit("ConnectionClosed", i),
              this.cleanup();
          }
        });
      B(q, "requestCounter", 1);
      te = q;
      typeof exports != "undefined" &&
        Object.defineProperty(exports, "__esModule", { value: !0 });
    });
  var me,
    _e,
    qe = P(() => {
      "use strict";
      le();
      le();
      Re();
      (me = class extends te {
        constructor() {
          super(...arguments);
          B(this, "protocol", "obswebsocket.json");
        }
        encodeMessage(e) {
          return O(this, null, function* () {
            return JSON.stringify(e);
          });
        }
        decodeMessage(e) {
          return O(this, null, function* () {
            return JSON.parse(e);
          });
        }
      }),
        (_e = me);
    });
  var dt = G((Pt, Ee) => {
    qe();
    var E;
    Ee.exports =
      ((E = class extends _e {}),
      B(E, "OBSWebSocketError", k),
      B(E, "WebSocketOpCode", ae),
      B(E, "EventSubscription", ue),
      B(E, "RequestBatchExecutionType", ce),
      E);
  });
  return dt();
})();
