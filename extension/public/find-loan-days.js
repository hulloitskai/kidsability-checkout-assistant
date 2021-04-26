(function () {
  var elements = document.getElementsByTagName("tbody");
  var rows = elements[elements.length - 1].children;
  for (var i = 0; i < rows.length; i++) {
    var el = rows[i];
    if (el.children[0].children[0].textContent === "Loan Type/Days") {
      const period = el.children[1].textContent;
      const [days] = period.match(/([0-9]{1,}) Days$/);
      return parseInt(days);
    }
  }
})();
