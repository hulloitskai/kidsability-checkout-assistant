var onMessage = chrome.runtime.onMessage;

function makeBooking(message) {
  if (typeof message !== "object") {
    return;
  }
  if (message.type !== "kidsability-checkout-assistant/make-booking") {
    return;
  }
  onMessage.removeListener(makeBooking);

  var date1 = document.getElementById("date1");
  date1.value = message.from;

  var date2 = document.getElementById("date2");
  date2.value = message.to;

  var forms = document.getElementsByTagName("form");
  var bookingForm = forms[forms.length - 1];

  bookingForm.submit();
}

onMessage.addListener(makeBooking);
