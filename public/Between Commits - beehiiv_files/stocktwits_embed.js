var e, t, r, i, n;
(t = {}),
  (r = {}),
  null ==
    (i = (e =
      'undefined' != typeof globalThis
        ? globalThis
        : 'undefined' != typeof self
        ? self
        : 'undefined' != typeof window
        ? window
        : 'undefined' != typeof global
        ? global
        : {}).parcelRequire326a) &&
    (((i = function (e) {
      if (e in t) return t[e].exports;
      if (e in r) {
        var i = r[e];
        delete r[e];
        var n = { id: e, exports: {} };
        return (t[e] = n), i.call(n.exports, n, n.exports), n.exports;
      }
      var o = Error("Cannot find module '" + e + "'");
      throw ((o.code = 'MODULE_NOT_FOUND'), o);
    }).register = function (e, t) {
      r[e] = t;
    }),
    (e.parcelRequire326a = i)),
  (n = i.register)('gUOGs', function (e, t) {
    Object.defineProperty(e.exports, '__esModule', { value: !0 });
    var r,
      n = i('kBCj4'),
      o = i('53LBo'),
      s = [],
      a = (function () {
        function e(e) {
          (this.$$observationTargets = []), (this.$$activeTargets = []), (this.$$skippedTargets = []);
          var t =
            void 0 === e
              ? "Failed to construct 'ResizeObserver': 1 argument required, but only 0 present."
              : 'function' != typeof e
              ? "Failed to construct 'ResizeObserver': The callback provided as parameter 1 is not a function."
              : void 0;
          if (t) throw TypeError(t);
          this.$$callback = e;
        }
        return (
          (e.prototype.observe = function (e) {
            var t = d('observe', e);
            if (t) throw TypeError(t);
            u(this.$$observationTargets, e) >= 0 ||
              (this.$$observationTargets.push(new n.ResizeObservation(e)), 0 > s.indexOf(this) && (s.push(this), v()));
          }),
          (e.prototype.unobserve = function (e) {
            var t = d('unobserve', e);
            if (t) throw TypeError(t);
            var r = u(this.$$observationTargets, e);
            r < 0 || (this.$$observationTargets.splice(r, 1), 0 === this.$$observationTargets.length && c(this));
          }),
          (e.prototype.disconnect = function () {
            (this.$$observationTargets = []), (this.$$activeTargets = []), c(this);
          }),
          e
        );
      })();
    function c(e) {
      var t = s.indexOf(e);
      t >= 0 && (s.splice(t, 1), $());
    }
    function d(e, t) {
      return void 0 === t
        ? "Failed to execute '" + e + "' on 'ResizeObserver': 1 argument required, but only 0 present."
        : t && t.nodeType === window.Node.ELEMENT_NODE
        ? void 0
        : "Failed to execute '" + e + "' on 'ResizeObserver': parameter 1 is not of type 'Element'.";
    }
    function u(e, t) {
      for (var r = 0; r < e.length; r += 1) if (e[r].target === t) return r;
      return -1;
    }
    e.exports.ResizeObserver = a;
    var l = function (e) {
        s.forEach(function (t) {
          (t.$$activeTargets = []),
            (t.$$skippedTargets = []),
            t.$$observationTargets.forEach(function (r) {
              r.isActive() && (h(r.target) > e ? t.$$activeTargets.push(r) : t.$$skippedTargets.push(r));
            });
        });
      },
      f = function () {
        var e = 1 / 0;
        return (
          s.forEach(function (t) {
            if (t.$$activeTargets.length) {
              var r = [];
              t.$$activeTargets.forEach(function (t) {
                var i = new o.ResizeObserverEntry(t.target);
                r.push(i), (t.$$broadcastWidth = i.contentRect.width), (t.$$broadcastHeight = i.contentRect.height);
                var n = h(t.target);
                n < e && (e = n);
              }),
                t.$$callback(r, t),
                (t.$$activeTargets = []);
            }
          }),
          e
        );
      },
      p = function () {
        var e = new window.ErrorEvent('ResizeLoopError', {
          message: 'ResizeObserver loop completed with undelivered notifications.',
        });
        window.dispatchEvent(e);
      },
      h = function (e) {
        for (var t = 0; e.parentNode; ) (e = e.parentNode), (t += 1);
        return t;
      },
      g = function () {
        for (
          l(0);
          s.some(function (e) {
            return !!e.$$activeTargets.length;
          });

        )
          l(f());
        s.some(function (e) {
          return !!e.$$skippedTargets.length;
        }) && p();
      },
      v = function () {
        r || b();
      },
      b = function () {
        r = window.requestAnimationFrame(function () {
          g(), b();
        });
      },
      $ = function () {
        r &&
          !s.some(function (e) {
            return !!e.$$observationTargets.length;
          }) &&
          (window.cancelAnimationFrame(r), (r = void 0));
      };
    e.exports.install = function () {
      return (window.ResizeObserver = a);
    };
  }),
  n('kBCj4', function (e, t) {
    Object.defineProperty(e.exports, '__esModule', { value: !0 });
    var r = i('ardMU'),
      n = (function () {
        function e(e) {
          (this.target = e), (this.$$broadcastWidth = this.$$broadcastHeight = 0);
        }
        return (
          Object.defineProperty(e.prototype, 'broadcastWidth', {
            get: function () {
              return this.$$broadcastWidth;
            },
            enumerable: !0,
            configurable: !0,
          }),
          Object.defineProperty(e.prototype, 'broadcastHeight', {
            get: function () {
              return this.$$broadcastHeight;
            },
            enumerable: !0,
            configurable: !0,
          }),
          (e.prototype.isActive = function () {
            var e = r.ContentRect(this.target);
            return !!e && (e.width !== this.broadcastWidth || e.height !== this.broadcastHeight);
          }),
          e
        );
      })();
    e.exports.ResizeObservation = n;
  }),
  n('ardMU', function (e, t) {
    Object.defineProperty(e.exports, '__esModule', { value: !0 }),
      (e.exports.ContentRect = function (e) {
        if ('getBBox' in e) {
          var t = e.getBBox();
          return Object.freeze({
            height: t.height,
            left: 0,
            top: 0,
            width: t.width,
          });
        }
        var r = window.getComputedStyle(e);
        return Object.freeze({
          height: parseFloat(r.height || '0'),
          left: parseFloat(r.paddingLeft || '0'),
          top: parseFloat(r.paddingTop || '0'),
          width: parseFloat(r.width || '0'),
        });
      });
  }),
  n('53LBo', function (e, t) {
    Object.defineProperty(e.exports, '__esModule', { value: !0 });
    var r = i('ardMU');
    e.exports.ResizeObserverEntry = function (e) {
      (this.target = e), (this.contentRect = r.ContentRect(e));
    };
  }),
  (function () {
    if (
      !(function () {
        if (!window.__stwts || !Object.keys(window.__stwts).length)
          return (window.__stwts = { buildVersion: '1.0.0', widgets: { init: !0 } }), !0;
      })()
    )
      return;
    function e(e, t) {
      t <= 300 && (e.style.width = '300px'),
        t >= 600 && (e.style.width = '600px'),
        t > 300 && t < 600 && (e.style.width = `${t}px`);
    }
    'undefined' == typeof ResizeObserver && i('gUOGs').install();
    let t = new (ResizeObserver || window.ResizeObserver)(function (t) {
      t.forEach((t) => {
        let r = t?.contentRect?.width,
          i = t.target.querySelector('iframe');
        r && i && e(i, r);
      });
    });

    function loadStocktwitsEmbeds() {
      Array.from(document.querySelectorAll('blockquote.stocktwits-embedded-post')).forEach((r) => {
        !(function (t, r) {
          if (t.getAttribute('data-ignore') === 'true') return;
          let i = t.getAttribute('data-origin'),
            n = t.getAttribute('data-id'),
            o = document.createElement('div');
          (o.style.display = 'flex'),
            (o.style.maxWidth = '600px'),
            (o.style.width = '100%'),
            (o.style.marginTop = '10px'),
            (o.style.marginBottom = '10px');
          let s = document.createElement('iframe');
          o.appendChild(s);
          let a = `${i}/embeddable/message/${n}`;
          (s.style.width = '640px'),
            (s.style.height = '0'),
            (s.style.maxWidth = '600px'),
            (s.style.position = 'static'),
            (s.style.visibility = 'visible'),
            (s.style.display = 'block'),
            (s.style.flexGrow = '1'),
            s.setAttribute('frameborder', '0'),
            s.setAttribute('allowtransparency', 'true'),
            s.setAttribute('scrolling', 'no'),
            s.setAttribute('allowfullscreen', 'true');
          let c = !1,
            d = null;
          function u(e) {
            c = !0;
            let { height: r } = e.data;
            void 0 !== r && (s.style.height = `${r}px`), document.body.contains(t) && t.remove();
          }
          t.parentNode.insertBefore(o, t.nextSibling),
            t.setAttribute('data-ignore', 'true'),
            s.addEventListener('load', function () {
              e(s, o.clientWidth),
                (function () {
                  let e = () => {
                    ((d = new MessageChannel()).port1.onmessage = u),
                      s.contentWindow.postMessage({ message: 'initialize' }, '*', [d.port2]);
                  };
                  e();
                  let t = setInterval(() => {
                    c ? clearInterval(t) : e();
                  }, 60);
                })();
            }),
            s.setAttribute('src', a),
            r.observe(o);
        })(r, t);
      });
    }

    window.__stwts.loadStocktwitsEmbeds = loadStocktwitsEmbeds;
  })();
