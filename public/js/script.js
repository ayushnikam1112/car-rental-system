// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()


const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
const totalPriceEl = document.getElementById("totalPrice");

const pricePerDay = window.carPrice;

// calculate only when both selected
function calculatePrice() {
  if (!fromDate.value || !toDate.value) {
    totalPriceEl.innerText = "₹ 0";
    return;
  }

  const start = new Date(fromDate.value);
  const end = new Date(toDate.value);

  if (end <= start) {
    totalPriceEl.innerText = "Invalid Dates";
    return;
  }

  const days = (end - start) / (1000 * 60 * 60 * 24);
  const total = days * pricePerDay;

  totalPriceEl.innerText = "₹ " + total.toLocaleString("en-IN");
}

// trigger only when toDate changes
toDate.addEventListener("change", calculatePrice);

const today = new Date().toISOString().split("T")[0];
fromDate.setAttribute("min", today);
toDate.setAttribute("min", today);