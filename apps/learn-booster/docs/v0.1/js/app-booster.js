import { l as e, I as c, w as g, g as u, s as f, a as d } from "./load-external-script-CHLkyAhM.js";
window.fully || (window.fully = {
  startApplication() {
    e.log("call to startApplication");
  },
  bringToForeground() {
    e.log("call to bringToForeground");
  }
});
const p = window.videoLength || 60 * 1e3, w = window.gameConfigs || d;
function m(n) {
  return w.find((o) => n.includes(o.urlPath));
}
function h() {
  var i, a, r;
  const n = m(window.location.pathname);
  if (!n)
    return !1;
  let o = (i = n == null ? void 0 : n.triggerFunc) == null ? void 0 : i.path, t = (a = u(o)) == null ? void 0 : a.func;
  if (!t || typeof t != "function") {
    if (o = (r = f(n.triggerFunc.name)) == null ? void 0 : r[0], !o) throw new Error("No wrapping function found.");
    n.triggerFunc.path = o, e.log("Function search successfully completed!");
  } else
    e.log("Trigger function successfully extracted from configuration!");
  return n;
}
async function l(n) {
  return new Promise((o) => setTimeout(o, n));
}
async function s() {
  document.readyState !== "complete" && await new Promise((o) => window.onload = o);
  const n = h();
  if (!n) {
    console.info("The current game is not yet supported.");
    return;
  }
  e.log("path:", n.triggerFunc.path), g(n.triggerFunc.path, null, async () => {
    e.log("App show begins..."), await l(n.delay), fully.startApplication("com.edujoy.fidget.pop.it"), await l(p + n.delay), fully.bringToForeground();
  }), e.log("The App tsarting has successfully loaded!");
}
async function y() {
  const n = import.meta.url;
  e.log(`The script runs under the address ${window.location.href}`), window.self !== window.top ? (e.log("The page is inside an iframe."), await s()) : (e.log("The page is not inside an iframe."), window.location.href.includes("new_game") || window.location.hostname === "localhost" ? await s() : c(n));
}
y();
export {
  y as main
};
