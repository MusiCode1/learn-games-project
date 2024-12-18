import { l as t, I, w as C, g as w, s as p, a as h } from "./load-external-script-CHLkyAhM.js";
function g(e, o, i = 2e3) {
  const n = 1 / (i / 50);
  if (o === "fadeIn") {
    e.volume = 0, e.play();
    const l = setInterval(() => {
      e.volume < 1 ? e.volume = Math.min(1, e.volume + n) : clearInterval(l);
    }, 50);
  } else if (o === "fadeOut") {
    const l = setInterval(() => {
      e.volume > 0 ? e.volume = Math.max(0, e.volume - n) : (clearInterval(l), e.pause());
    }, 50);
  } else
    console.error('Invalid action. Use "fadeIn" or "fadeOut".');
}
function f(e) {
  const o = document.createElement("div");
  o.className = "modal", o.setAttribute("dir", "rtl");
  const i = document.createElement("div");
  i.className = "main-container";
  const a = document.createElement("div");
  a.className = "card";
  const s = document.createElement("h1");
  s.innerText = "הגיע הזמן לסרטון!";
  const n = document.createElement("video");
  n.controls = !0, n.controlsList = "nofullscreen nodownload noremoteplayback noplaybackrate";
  const l = document.createElement("source");
  l.src = e, n.onclick = () => n.paused ? n.play() : n.pause(), n.appendChild(l), n.innerHTML += "הדפדפן שלך אינו תומך בתגית הווידאו.", a.appendChild(s), a.appendChild(n), i.appendChild(a), o.appendChild(i);
  const c = document.createElement("link");
  c.href = new URL("data:text/css;base64,Ym9keSwNCmh0bWwgew0KICAgIG1hcmdpbjogMDsNCiAgICBwYWRkaW5nOiAwOw0KICAgIGhlaWdodDogMTAwJTsNCn0NCg0KLm1vZGFsIHsNCiAgICBwb3NpdGlvbjogZml4ZWQ7DQogICAgdG9wOiAwOw0KICAgIGxlZnQ6IDA7DQogICAgd2lkdGg6IDEwMCU7DQogICAgaGVpZ2h0OiAxMDAlOw0KICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC44KTsNCiAgICAvKiDXqNen16Ig16nXp9eV16Mg15vXlNeUICovDQogICAgZGlzcGxheTogZmxleDsNCiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsNCiAgICBhbGlnbi1pdGVtczogY2VudGVyOw0KICAgIA0KICAgIC8qINee16LXnCDXm9ecINeT15HXqCDXkNeX16ggKi8NCg0KfQ0KDQoubW9kYWwgew0KICAgIHotaW5kZXg6IC0xOw0KfQ0KDQoubW9kYWwsDQoubWFpbi1jb250YWluZXIgew0KICAgIHRyYW5zaXRpb246IGFsbCAxczsNCiAgICBvcGFjaXR5OiAwOw0KDQp9DQoNCi5tb2RhbC5zaG93IHsNCiAgICBvcGFjaXR5OiAxOw0KICAgIHotaW5kZXg6IDEwMDA7DQp9DQoNCi5tb2RhbC5zaG93IC5tYWluLWNvbnRhaW5lciB7DQogICAgb3BhY2l0eTogMTsNCiAgICB0cmFuc2l0aW9uLWRlbGF5OiAxczsNCn0NCg0KLm1haW4tY29udGFpbmVyIHsNCiAgICBkaXNwbGF5OiBmbGV4Ow0KICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7DQogICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7DQoNCiAgICBtYXJnaW46IDEwcHg7DQp9DQoNCi5jYXJkIHsNCiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMjQzLCAyNTUsIDEzNSk7DQogICAgcGFkZGluZzogMjBweDsNCiAgICBib3JkZXItcmFkaXVzOiAzMHB4Ow0KICAgIGRpc3BsYXk6IGZsZXg7DQogICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsNCiAgICBhbGlnbi1pdGVtczogY2VudGVyOw0KICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOw0KDQogICAgYm94LXNpemluZzogYm9yZGVyLWJveDsNCn0NCg0KaDEgew0KICAgIG1hcmdpbi10b3A6IDVweDsNCn0NCg0KdmlkZW8gew0KICAgIG1heC1oZWlnaHQ6IDEwMCU7DQogICAgbWF4LXdpZHRoOiAxMDAlOw0KICAgIHdpZHRoOiA5NTBweDsNCiAgICBib3JkZXItcmFkaXVzOiAxNXB4Ow0KfQ==", import.meta.url).href, c.rel = "stylesheet", document.head.appendChild(c);
  const m = {
    status: "hide",
    show() {
      this.status = "show", o.classList.add("show"), g(n, "fadeIn");
    },
    hide() {
      this.status = "hide", o.classList.remove("show"), g(n, "fadeOut");
    },
    toggle() {
      this.status === "show" ? this.hide() : this.show();
    }
  };
  return t.log(), { modal: o, modalManager: m };
}
const A = window.videoLength || 20 * 1e3;
let u = window.videoURL || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const b = window.gameConfigs || h;
window.FullyKiosk && !window.videoURL && (u = "http://localhost/sdcard/Movies/video.mp4");
function N() {
  const { modal: e, modalManager: o } = f(u);
  return t.log(document.readyState), document.body.appendChild(e), t.log("The elements have been loaded successfully!"), { modalManager: o, modal: e };
}
function G(e) {
  return b.find((o) => e.includes(o.urlPath));
}
function D() {
  var a, s, n;
  const e = G(window.location.pathname);
  if (!e)
    return !1;
  let o = (a = e == null ? void 0 : e.triggerFunc) == null ? void 0 : a.path, i = (s = w(o)) == null ? void 0 : s.func;
  if (!i || typeof i != "function") {
    if (o = (n = p(e.triggerFunc.name)) == null ? void 0 : n[0], !o) throw new Error("No wrapping function found.");
    e.triggerFunc.path = o, t.log("Function search successfully completed!");
  } else
    t.log("Trigger function successfully extracted from configuration!");
  return e;
}
async function d(e) {
  return new Promise((o) => setTimeout(o, e));
}
async function r() {
  document.readyState !== "complete" && await new Promise((a) => window.onload = a);
  const e = D();
  if (!e) {
    console.info("The current game is not yet supported.");
    return;
  }
  t.log("path:", e.triggerFunc.path);
  const { modalManager: o, modal: i } = N();
  C(e.triggerFunc.path, null, async () => {
    t.log("Video playback begins..."), await d(e.delay), o.show(), await d(A + e.delay), o.hide();
  }), t.log("The video element has successfully loaded!"), window.modalManager = o;
}
async function v() {
  const e = import.meta.url;
  t.log(`The script runs under the address ${window.location.href}`), window.self !== window.top ? (t.log("The page is inside an iframe."), await r()) : (t.log("The page is not inside an iframe."), window.location.href.includes("new_game") || window.location.hostname === "localhost" ? await r() : I(e));
}
v();
export {
  v as main
};
