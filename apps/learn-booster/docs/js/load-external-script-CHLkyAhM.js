function m(n) {
  const t = (o) => !isNaN(o), c = (o) => o.split(/[\.\[\]]+/).filter(Boolean);
  if (!n) return;
  const a = c(n), i = a.pop();
  let e = window;
  for (let o = 0; o < a.length; o++) {
    const r = t(a[o]) ? Number(a[o]) : a[o];
    e = e[r];
  }
  return { func: e[i], context: e, funcName: i };
}
function h(n, t, c) {
  const { func: a, context: i, funcName: e } = n;
  i[e] = function(...s) {
    t && t();
    const o = a.apply(this, s);
    return c && c(), o;
  };
}
function w(n, t = null, c = null) {
  const a = m(n);
  h(a, t, c);
}
function y(n) {
  const t = /* @__PURE__ */ new Set();
  function c(e) {
    return /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(e) ? `.${e}` : `[${JSON.stringify(e)}]`;
  }
  function a(e, s = "", o = /* @__PURE__ */ new Set()) {
    if (!o.has(e)) {
      o.add(e);
      for (let r in e)
        try {
          const u = Array.isArray(e) ? `${s}[${r}]` : `${s}${c(r)}`;
          typeof e[r] == "function" && r === n && (t.add(u.replace(/^\./, "")), window[r] === e[r] && t.add(r)), typeof e[r] == "object" && e[r] !== null && a(e[r], u, o);
        } catch {
          continue;
        }
    }
  }
  function i(e, s = "") {
    typeof e[n] == "function" && t.add(`${s}${c(n)}`);
    for (let o = 0; o < e.children.length; o++) {
      const r = e.children[o], u = `${s}${c("children")}[${o}]`;
      i(r, u);
    }
    e.shadowRoot && i(e.shadowRoot, `${s}${c("shadowRoot")}`);
  }
  return a(window), i(document.documentElement, "document.documentElement"), typeof window[n] == "function" && t.add(n), Array.from(t).sort((e, s) => e.length - s.length);
}
function f(...n) {
  console.log(...n);
}
const d = {
  log: f
}, l = {
  makeMovie: {
    name: "makeMovie",
    path: "PIXI.game.state.states.game.makeMovie"
  },
  onShowAnimation: {
    name: "onShowAnimation",
    path: "PIXI.game.state.states.game.onShowAnimation"
  },
  makeBigMovie: {
    name: "makeBigMovie",
    path: "PIXI.game.state.states.game.makeBigMovie"
  }
}, $ = [
  {
    gameName: "tidy_up",
    triggerFunc: l.makeMovie,
    delay: 5 * 1e3,
    urlPath: "/wp-content/uploads/new_games/tidy_up/"
  },
  {
    gameName: "touch_go",
    triggerFunc: l.makeMovie,
    delay: 5 * 1e3,
    urlPath: "wp-content/uploads/new_games/touch_go/"
  },
  {
    gameName: "earase_animals",
    triggerFunc: l.onShowAnimation,
    delay: 5 * 1e3,
    urlPath: "/wp-content/uploads/new_games/earase_animals/"
  },
  {
    gameName: "earase_animals",
    triggerFunc: l.onShowAnimation,
    delay: 5 * 1e3,
    urlPath: "/wp-content/uploads/new_games/earase_animals/"
  },
  {
    gameName: "placeValue_eggs",
    triggerFunc: l.makeBigMovie,
    delay: 3 * 1e3,
    urlPath: "/wp-content/uploads/new_games/placeValue_eggs/"
  }
];
function p(n) {
  const t = g.name;
  let c = `
`;
  return c += g.toString(), c += `

`, c += `${t}('${n}')
`, c;
}
function _(n) {
  function t(a) {
    try {
      d.log("iFrame creating!");
      const i = a.contentDocument.createElement("script"), e = p(n);
      i.textContent = e, d.log("Script ready for injection..."), a.contentWindow.onload = () => {
        a.contentDocument.head.appendChild(i);
      }, d.log("The script has been injected");
    } catch (i) {
      console.error("Cannot access iframe due to cross-origin restrictions"), console.error(i);
    }
  }
  new MutationObserver((a) => {
    a.forEach((i) => {
      i.addedNodes.forEach((e) => {
        e.tagName === "IFRAME" && t(e);
      });
    });
  }).observe(document.body, { childList: !0, subtree: !0 });
}
function g(n) {
  const t = document.createElement("script");
  t.src = n, t.async = !0, t.type = "module", document.head.appendChild(t);
}
export {
  _ as I,
  $ as a,
  m as g,
  d as l,
  y as s,
  w
};
