(function () {
  var logo = document.getElementById("logo");
  var href = logo.children[0].getAttribute("href");
  var lastEqualsIndex = href.lastIndexOf("=");
  return href.substr(lastEqualsIndex + 1);
})();
