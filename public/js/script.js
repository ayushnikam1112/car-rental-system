(() => {
  'use strict';

  const forms = document.querySelectorAll('.needs-validation');

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
})();


document.addEventListener("DOMContentLoaded", () => {

  const fromDate = document.getElementById("fromDate");
  const toDate = document.getElementById("toDate");
  const totalPriceEl = document.getElementById("totalPrice");

  if (!fromDate || !toDate || !totalPriceEl) return;

  const pricePerDay = window.carPrice || 0;

  const today = new Date().toISOString().split("T")[0];

  // restrict past dates
  fromDate.setAttribute("min", today);
  toDate.setAttribute("min", today);

  // update toDate minimum when fromDate changes
  fromDate.addEventListener("change", () => {
    toDate.setAttribute("min", fromDate.value);
    calculatePrice();
  });

  function calculatePrice() {
    if (!fromDate.value || !toDate.value) {
      totalPriceEl.innerText = "₹ 0";
      return;
    }

    const start = new Date(fromDate.value);
    const end = new Date(toDate.value);
    const todayDate = new Date(today);

    if (start < todayDate) {
      totalPriceEl.innerText = "Past date not allowed";
      return;
    }

    if (end <= start) {
      totalPriceEl.innerText = "Invalid Dates";
      return;
    }

    const days = (end - start) / (1000 * 60 * 60 * 24);
    const total = days * pricePerDay;

    totalPriceEl.innerText = "₹ " + total.toLocaleString("en-IN");
  }

  toDate.addEventListener("change", calculatePrice);
});


// Loader (safe)
const form = document.querySelector("form");

if (form) {
  form.addEventListener("submit", () => {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "flex";
  });
}