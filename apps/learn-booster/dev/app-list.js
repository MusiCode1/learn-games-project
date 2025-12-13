(async () => {
  const url = new URL("http://127.0.0.1:2323");

  url.searchParams.set("cmd", "manageApps");
  url.searchParams.set("password", "V64P^BgiiynM");
  url.searchParams.set("type", "json");

  const res = await fetch(url).then((r) => r.json());

  window.res = res;

  
})();


fetch('http://127.0.0.1:2323/?cmd=manageApps&password=V64P%5EBgiiynM&type=json')